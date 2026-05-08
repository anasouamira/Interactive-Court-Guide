// ─────────────────────────────────────────────────────────────────────────────
// detectService.js  v3
// Weighted scoring engine: analyzes user input against all 6 service intents
// and returns the best matching service + confidence score.
//
// Scoring weights:
//   Phrase match   → +5  (full phrase found in input)
//   Keyword match  → +3  (exact keyword found)
//   Context boost  → +2  (domain-specific long-sentence signals)
//   Fuzzy match    → +1  (typo / partial match via similarity)
//   Service weight → multiplier per intent module
// ─────────────────────────────────────────────────────────────────────────────

import { complaintIntents }      from '../intents/complaint.intents'
import { documentsIntents }      from '../intents/documents.intents'
import { criminalRecordIntents } from '../intents/criminalRecord.intents'
import { divorceIntents }        from '../intents/divorce.intents'
import { marriageIntents }       from '../intents/marriage.intents'
import { civilClaimIntents }     from '../intents/civilClaim.intents'

// Priority order: more specific / higher-stakes services first
const ALL_INTENTS = [
  complaintIntents,
  criminalRecordIntents,
  divorceIntents,
  marriageIntents,
  civilClaimIntents,
  documentsIntents,
]

// ─── Scoring weights ──────────────────────────────────────────────────────────
const W_PHRASE  = 5
const W_KEYWORD = 3
const W_BOOST   = 2
const W_FUZZY   = 1
const FUZZY_THRESHOLD = 0.72

// ─── Arabic text normalization ────────────────────────────────────────────────

const NOISE = new Set([
  'و','في','على','من','إلى','الى','مع','عن','هذا','هذه','أن','ان',
  'لي','لك','له','لها','هو','هي','كان','كانت','بس','غير','كي',
  'باش','لكن','حتى','لما','إلا','الا','ديال','ديالي','ديالك',
  'ديالو','ديالها','انا','أنا','نتا','نتي','للي','لاش','علاش',
  'كنت','كنا','بغيت','بغينا','واش','هاد','هاذ','هادا','هادي',
])

function normalize(text) {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')  // strip diacritics
    .replace(/[أإآ]/g, 'ا')                 // unify alef
    .replace(/ة/g, 'ه')                     // teh marbuta → heh
    .replace(/ى/g, 'ي')                     // alef maqsoura → ya
    .replace(/[.,،؟?!؛;:«»\-_\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter(t => t.length > 1 && !NOISE.has(t))
}

// ─── Lightweight Jaro-Winkler similarity (no external deps) ──────────────────

function similarity(a, b) {
  if (a === b) return 1.0
  if (!a.length || !b.length) return 0.0
  if (a.includes(b) || b.includes(a)) return 0.85

  const longer  = a.length >= b.length ? a : b
  const shorter = a.length >= b.length ? b : a
  const win     = Math.floor(Math.max(longer.length, shorter.length) / 2) - 1
  if (win < 0) return 0.0

  const lm = new Array(longer.length).fill(false)
  const sm = new Array(shorter.length).fill(false)
  let matches = 0, transpositions = 0

  for (let i = 0; i < shorter.length; i++) {
    const s = Math.max(0, i - win)
    const e = Math.min(i + win + 1, longer.length)
    for (let j = s; j < e; j++) {
      if (lm[j] || shorter[i] !== longer[j]) continue
      lm[j] = sm[i] = true; matches++; break
    }
  }
  if (!matches) return 0.0

  let k = 0
  for (let i = 0; i < shorter.length; i++) {
    if (!sm[i]) continue
    while (!lm[k]) k++
    if (shorter[i] !== longer[k]) transpositions++
    k++
  }

  const jaro = (matches/shorter.length + matches/longer.length +
    (matches - transpositions/2)/matches) / 3

  let prefix = 0
  for (let i = 0; i < Math.min(4, shorter.length, longer.length); i++) {
    if (shorter[i] === longer[i]) prefix++; else break
  }
  return jaro + prefix * 0.1 * (1 - jaro)
}

function fuzzyMatchesKeyword(tokens, keyword) {
  const normKw = normalize(keyword)
  for (const tok of tokens) {
    if (tok.includes(normKw) || normKw.includes(tok)) return true
    if (tok.length >= 3 && normKw.length >= 3 && similarity(tok, normKw) >= FUZZY_THRESHOLD) return true
  }
  return false
}

// ─── Core scoring ─────────────────────────────────────────────────────────────

function scoreIntent(normInput, tokens, intent) {
  let score = 0

  if (intent.phrases) {
    for (const phrase of intent.phrases) {
      if (normInput.includes(normalize(phrase))) score += W_PHRASE
    }
  }

  if (intent.keywords) {
    for (const kw of intent.keywords) {
      const normKw = normalize(kw)
      if (normInput.includes(normKw)) {
        score += W_KEYWORD
      } else if (fuzzyMatchesKeyword(tokens, kw)) {
        score += W_FUZZY
      }
    }
  }

  if (intent.contextBoosts) {
    for (const boost of intent.contextBoosts) {
      if (normInput.includes(normalize(boost))) score += W_BOOST
    }
  }

  return score * (intent.weight || 1)
}

function scoreToConfidence(score) {
  if (score <= 0)  return 0
  if (score >= 50) return 100
  return Math.min(100, Math.round((score / 50) * 100))
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * detectService — returns service name only
 * @param {string} input
 * @returns {string}
 */
export function detectService(input) {
  return detectServiceWithConfidence(input).service
}

/**
 * detectServiceWithConfidence — full result with score and runner-up
 * @param {string} input
 * @returns {{ service: string, confidence: number, runnerUp: string|null }}
 */
export function detectServiceWithConfidence(input) {
  if (!input?.trim()) return { service: 'complaint', confidence: 0, runnerUp: null }

  const normInput = normalize(input)
  const tokens    = tokenize(input)

  const scores = ALL_INTENTS
    .map(intent => ({ service: intent.service, score: scoreIntent(normInput, tokens, intent) }))
    .sort((a, b) => b.score - a.score)

  const best      = scores[0]
  const runnerUp  = scores[1]?.score > 0 ? scores[1].service : null
  const confidence = scoreToConfidence(best.score)

  // Below minimum confidence → default to complaint (most common)
  if (confidence < 15) {
    return { service: 'complaint', confidence, runnerUp }
  }

  return { service: best.service, confidence, runnerUp }
}
