'use strict';

const https = require('https');
const http  = require('http');
const { DOSSIER_INDEX, TRIBUNAL_ALIASES } = require('../mock/dossiers.mock');
const { normalizeResponse, normalizeNotFound } = require('../utils/normalizeResponse');

const USE_MOCK        = process.env.USE_MOCK !== 'false';
const MAHAKIM_BASE    = (process.env.MAHAKIM_BASE_URL || 'https://www.mahakim.ma').replace(/\/$/, '');
const MAHAKIM_TIMEOUT = parseInt(process.env.MAHAKIM_TIMEOUT_MS) || 10000;

// ─── Public entry point ───────────────────────────────────────────────────────

async function search(params) {
  if (USE_MOCK) return searchMock(params);

  try {
    return await searchViaMahakimProxy(params);
  } catch (err) {
    console.warn('[dossierService] Mahakim proxy failed → fallback to mock:', err.message);
    const result = await searchMock(params);
    // Tag response so frontend knows the source
    if (result.dossier) result.source = 'mock-fallback';
    return result;
  }
}

// ─── Mock search ──────────────────────────────────────────────────────────────

async function searchMock({ tribunal, typeCode, numero, annee }) {
  const tribunalCode = resolveTribunal(tribunal);
  if (!tribunalCode) {
    return {
      success: false,
      found:   false,
      message: `المحكمة "${tribunal}" غير معروفة. تحقق من الاسم.`,
      params:  { tribunal, typeCode, numero, annee },
    };
  }

  await simulateDelay(100, 300);

  const key     = `${tribunalCode}-${typeCode}-${numero}-${annee}`;
  const dossier = DOSSIER_INDEX.get(key) || null;

  if (!dossier) return normalizeNotFound({ tribunal, tribunalCode, typeCode, numero, annee });
  return normalizeResponse(dossier, { source: 'mock' });
}

// ─── Mahakim Proxy Layer ──────────────────────────────────────────────────────
//
// Architecture:  Frontend → YOUR backend → Mahakim external API
//
// Why a proxy is mandatory:
//   1. Mahakim uses session cookies + CSRF tokens that must be managed server-side
//   2. Browser (frontend) requests are CORS-blocked by the government portal
//   3. IP-level rate-limiting is less severe for a server than for many clients
//   4. Proxy allows caching, normalization, and graceful mock fallback
//
// Session handshake flow:
//   Step 1 → GET the tracking page to receive session cookie + CSRF token
//   Step 2 → POST the search payload with those credentials attached

// Session cache — one session shared across all requests in this process
let _session = { cookie: null, csrf: null, at: null, ttl: 5 * 60 * 1000 };

/**
 * Low-level HTTP request using Node built-ins (no external deps).
 */
function rawRequest({ url, method = 'GET', headers = {}, body = null, timeout = MAHAKIM_TIMEOUT }) {
  return new Promise((resolve, reject) => {
    const u   = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;

    const req = lib.request(
      {
        hostname: u.hostname,
        port:     u.port || (u.protocol === 'https:' ? 443 : 80),
        path:     u.pathname + u.search,
        method,
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', c => (raw += c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: raw }));
      }
    );

    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('طلب انتهت مهلته')); });
    req.on('error', reject);

    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

/**
 * Obtain (or reuse cached) Mahakim session credentials.
 */
async function obtainSession() {
  const now = Date.now();
  if (_session.cookie && _session.at && now - _session.at < _session.ttl) {
    return _session;
  }

  const res = await rawRequest({
    url: `${MAHAKIM_BASE}/`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept':     'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  // Extract Set-Cookie
  const raw = res.headers['set-cookie'];
  const cookie = Array.isArray(raw)
    ? raw.map(c => c.split(';')[0]).join('; ')
    : (raw || '').split(';')[0];

  // Extract CSRF token (meta tag or embedded JS)
  const csrfMatch =
    res.body.match(/name=["']?_csrf["']?\s+content=["']?([A-Za-z0-9_\-]+)["']?/i) ||
    res.body.match(/csrfToken["':\s]+["']([A-Za-z0-9_\-]{20,})["']/);
  const csrf = csrfMatch ? csrfMatch[1] : null;

  _session = { cookie, csrf, at: Date.now(), ttl: 5 * 60 * 1000 };
  return _session;
}

/**
 * POST search to Mahakim via proxy.
 */
async function searchViaMahakimProxy({ tribunal, typeCode, numero, annee }) {
  const session = await obtainSession();

  const payload = JSON.stringify({ annee, codeType: typeCode, numero, tribunal });

  const headers = {
    'Content-Type':   'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Accept':         'application/json',
    'User-Agent':     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer':        `${MAHAKIM_BASE}/#/suivi/dossier-suivi`,
    'Origin':         MAHAKIM_BASE,
  };
  if (session.cookie) headers['Cookie']       = session.cookie;
  if (session.csrf)   headers['X-CSRF-Token'] = session.csrf;

  const res = await rawRequest({
    url:    `${MAHAKIM_BASE}/api/suivi/dossier`,
    method: 'POST',
    headers,
    body:   payload,
  });

  if (res.status === 403) {
    // Invalidate cache and throw so caller triggers mock fallback
    _session = { cookie: null, csrf: null, at: null, ttl: 5 * 60 * 1000 };
    throw new Error('رُفض الطلب من الخادم الحكومي (403). ستتم المحاولة من جديد.');
  }

  if (res.status !== 200) {
    throw new Error(`Mahakim أرجع HTTP ${res.status}`);
  }

  let data;
  try { data = JSON.parse(res.body); }
  catch { throw new Error('رد Mahakim ليس JSON صالحاً'); }

  return normalizeMahakimResponse(data, { tribunal, typeCode, numero, annee });
}

/**
 * Map Mahakim API fields → our internal schema.
 * Field names are provisional until official API access is confirmed.
 */
function normalizeMahakimResponse(data, params) {
  if (!data || data.found === false || data.result === null || data.dossier === null) {
    return normalizeNotFound(params);
  }

  const d = data.dossier || data.result || data;

  const mapped = {
    id:            `mahakim-${params.typeCode}-${params.numero}-${params.annee}`,
    tribunal:      d.tribunal         || d.libelleTribunal || params.tribunal,
    tribunalCode:  resolveTribunal(params.tribunal) || params.tribunal,
    typeCode:      String(d.codeType  || d.typeCode        || params.typeCode),
    numero:        String(d.numero    || params.numero),
    annee:         d.annee            || params.annee,
    numeroComplet: `${d.numero || params.numero}/${d.codeType || params.typeCode}/${d.annee || params.annee}`,
    type:          d.libelleType      || d.type            || '',
    status:        mapStatus(d.statut || d.etat            || d.status),
    statusLabel:   d.libelleStatut    || d.statusLabel      || '',
    chambre:       d.chambre          || d.libelleChambre   || '',
    judge:         d.juge             || d.libelleJuge      || '',
    nextSession:   d.prochainAudience || d.nextSession       || null,
    lastUpdate:    d.dateDernierMaj   || d.lastUpdate        || null,
    parties: {
      demandeur: d.demandeur || d.plaignant || null,
      defendeur: d.defendeur || d.prevenu   || null,
    },
    history: (d.historique || d.history || []).map((h, i) => ({
      step:    i + 1,
      date:    h.date    || null,
      event:   h.libelle || h.event || '',
      status:  (h.statut || '').toUpperCase() === 'FAIT' ? 'done' : 'pending',
      current: h.courant || h.current || false,
    })),
  };

  return normalizeResponse(mapped, { source: 'mahakim-live' });
}

function mapStatus(raw) {
  if (!raw) return 'en_cours';
  const r = String(raw).toLowerCase();
  if (r.includes('jug') || r.includes('clos') || r.includes('termin')) return 'juge';
  if (r.includes('report') || r.includes('ajour'))                      return 'reporte';
  if (r.includes('attent'))                                              return 'en_attente';
  return 'en_cours';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveTribunal(raw) {
  const lower = (raw || '').toLowerCase().trim();
  if (TRIBUNAL_ALIASES[lower]) return TRIBUNAL_ALIASES[lower];
  for (const [alias, code] of Object.entries(TRIBUNAL_ALIASES)) {
    if (lower.includes(alias) || alias.includes(lower)) return code;
  }
  return null;
}

function simulateDelay(min, max) {
  return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));
}

module.exports = { search };
