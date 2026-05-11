'use strict';

function normalizeResponse(dossier, meta = {}) {
  if (!dossier) return null;
  return {
    success:   true,
    timestamp: new Date().toISOString(),
    source:    meta.source || 'mock',
    dossier: {
      id:            dossier.id,
      numeroComplet: dossier.numeroComplet,
      typeCode:      dossier.typeCode,
      numero:        dossier.numero,
      annee:         dossier.annee,
      tribunal:      dossier.tribunal,
      tribunalCode:  dossier.tribunalCode,
      chambre:       dossier.chambre,
      type:          dossier.type,
      status:        dossier.status,
      statusLabel:   dossier.statusLabel,
      judge:         dossier.judge,
      nextSession:   dossier.nextSession || null,
      lastUpdate:    dossier.lastUpdate  || null,
      parties: {
        demandeur: dossier.parties?.demandeur || null,
        defendeur: dossier.parties?.defendeur || null,
      },
      history: (dossier.history || []).map((h, i) => ({
        step:    i + 1,
        date:    h.date || null,
        event:   h.event,
        status:  h.status,
        current: h.current || false,
      })),
    },
  };
}

function normalizeError(message, statusCode = 500, extra = {}) {
  return {
    success:   false,
    statusCode,
    error:     message,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

function normalizeNotFound(params) {
  return {
    success:   false,
    found:     false,
    message:   'لم يُعثر على ملف بالمعطيات المدخلة.',
    params,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { normalizeResponse, normalizeError, normalizeNotFound };
