// ─────────────────────────────────────────────────────────────────────────────
// detectService.js  v2 — Smart Intent Detection Engine
//
// Upgrades over v1:
//   • Fuzzy matching — handles typos, missing letters, dialect variants
//   • Long sentence parsing — extracts signal words from noisy text
//   • Weighted ranking — phrase (+5) > keyword (+3) > fuzzy (+1) > boost (+2)
//   • Confidence score — 0–100 returned alongside service name
//   • Context boosters — domain-specific signals that raise confidence
// ─────────────────────────────────────────────────────────────────────────────

import { complaintIntents } from '../intents/complaint.intents'
import { courtIntents }     from '../intents/court.intents'
import { trackingIntents }  from '../intents/tracking.intents'
import { documentsIntents } from '../intents/documents.intents'
import { supportIntents }   from '../intents/support.intents'
import { generalIntents }   from '../intents/general.intents'

const ALL_INTENTS = [
  complaintIntents,
  documentsIntents,
  trackingIntents,
  supportIntents,
  courtIntents,
  generalIntents,   // lowest priority — general always last
]

// ─── Scoring weights ──────────────────────────────────────────────────────────
const W_PHRASE  = 5   // exact phrase match
const W_KEYWORD = 3   // exact keyword match
const W_FUZZY   = 1   // fuzzy/partial match
const W_BOOST   = 2   // context booster match
const FUZZY_MIN = 0.72 // minimum similarity to count as fuzzy match

// ─── Normalization ────────────────────────────────────────────────────────────

const NOISE_WORDS = new Set([
  'و', 'في', 'على', 'من', 'إلى', 'الى', 'مع', 'عن', 'هذا', 'هذه',
  'أن', 'ان', 'لي', 'لك', 'له', 'لها', 'هو', 'هي', 'كان', 'كانت',
  'بس', 'غير', 'كي', 'باش', 'لكن', 'مع', 'حتى', 'لما', 'إلا', 'الا',
  'ديال', 'ديالي', 'ديالك', 'ديالو', 'ديالها',
  'انا', 'أنا', 'نتا', 'نتي', 'هو', 'هي',
  'لي', 'للي', 'لاش', 'علاش',
  'كنت', 'كنا', 'بغيت', 'بغينا',
])

/**
 * Normalize Arabic text:
 * - remove punctuation and diacritics
 * - normalize alef variants → ا
 * - normalize teh marbuta → ه
 * - lowercase
 * - filter noise words for token extraction
 */
function normalize(text) {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')  // remove diacritics
    .replace(/[أإآ]/g, 'ا')                 // normalize alef
    .replace(/[ة]/g, 'ه')                   // normalize teh marbuta
    .replace(/[ى]/g, 'ي')                   // normalize alef maqsoura
    .replace(/[.,،؟?!؛;:«»\-_]/g, ' ')     // punctuation → space
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Extract meaningful tokens from a sentence (remove noise words)
 */
function extractTokens(text) {
  return normalize(text)
    .split(' ')
    .filter(t => t.length > 1 && !NOISE_WORDS.has(t))
}

// ─── Fuzzy matching (Jaro-Winkler inspired, no external deps) ────────────────

/**
 * Character-level similarity between two strings.
 * Returns 0.0 – 1.0. Pure JS, no libraries.
 */
function similarity(a, b) {
  if (a === b) return 1.0
  if (a.length === 0 || b.length === 0) return 0.0

  // Short-circuit: substring match scores high
  if (a.includes(b) || b.includes(a)) {
    return 0.85
  }

  const longer  = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a

  // Count matching characters within a window
  const matchWindow = Math.floor(Math.max(longer.length, shorter.length) / 2) - 1
  if (matchWindow < 0) return 0.0

  const longerMatches  = new Array(longer.length).fill(false)
  const shorterMatches = new Array(shorter.length).fill(false)
  let matches = 0
  let transpositions = 0

  for (let i = 0; i < shorter.length; i++) {
    const start = Math.max(0, i - matchWindow)
    const end   = Math.min(i + matchWindow + 1, longer.length)
    for (let j = start; j < end; j++) {
      if (longerMatches[j] || shorter[i] !== longer[j]) continue
      longerMatches[j]  = true
      shorterMatches[i] = true
      matches++
      break
    }
  }

  if (matches === 0) return 0.0

  let k = 0
  for (let i = 0; i < shorter.length; i++) {
    if (!shorterMatches[i]) continue
    while (!longerMatches[k]) k++
    if (shorter[i] !== longer[k]) transpositions++
    k++
  }

  const jaro = (
    matches / shorter.length +
    matches / longer.length +
    (matches - transpositions / 2) / matches
  ) / 3

  // Winkler bonus for common prefix (up to 4 chars)
  let prefixLen = 0
  for (let i = 0; i < Math.min(4, shorter.length, longer.length); i++) {
    if (shorter[i] === longer[i]) prefixLen++
    else break
  }

  return jaro + prefixLen * 0.1 * (1 - jaro)
}

/**
 * Check if any token in input has a fuzzy match against a keyword
 */
function fuzzyMatchesKeyword(inputTokens, keyword) {
  const normKw = normalize(keyword)
  // Direct substring check first (fast path)
  for (const token of inputTokens) {
    if (token.includes(normKw) || normKw.includes(token)) return true
    if (token.length >= 3 && normKw.length >= 3) {
      if (similarity(token, normKw) >= FUZZY_MIN) return true
    }
  }
  return false
}

// ─── Main scoring engine ──────────────────────────────────────────────────────

/**
 * scoreIntent
 * Returns a numerical score for how well user input matches an intent module.
 */
function scoreIntent(normalInput, inputTokens, intent) {
  let score = 0

  // 1. Full phrase match (highest signal)
  if (intent.phrases) {
    for (const phrase of intent.phrases) {
      if (normalInput.includes(normalize(phrase))) {
        score += W_PHRASE
      }
    }
  }

  // 2. Exact keyword match
  if (intent.keywords) {
    for (const kw of intent.keywords) {
      if (normalInput.includes(normalize(kw))) {
        score += W_KEYWORD
      }
    }
  }

  // 3. Fuzzy keyword match (catches typos and dialect variants)
  if (intent.keywords) {
    for (const kw of intent.keywords) {
      const normKw = normalize(kw)
      // Skip if already matched exactly (avoid double-counting)
      if (normalInput.includes(normKw)) continue
      if (fuzzyMatchesKeyword(inputTokens, kw)) {
        score += W_FUZZY
      }
    }
  }

  // 4. Context booster — indirect long-sentence signals
  if (intent.contextBoosts) {
    for (const boost of intent.contextBoosts) {
      if (normalInput.includes(normalize(boost))) {
        score += W_BOOST
      }
    }
  }

  // 5. Apply service weight multiplier (some services are more common)
  return score * (intent.weight || 1)
}

/**
 * scoreToConfidence
 * Maps raw score to a 0–100 confidence value with tiered scaling.
 */
function scoreToConfidence(score) {
  if (score <= 0)  return 0
  if (score >= 40) return 100
  // Non-linear mapping: higher scores get confidence faster
  return Math.min(100, Math.round((score / 40) * 100))
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * detectService
 * Primary export. Returns the best matching service name.
 * @param {string} userInput
 * @returns {string} service name
 */
export function detectService(userInput) {
  const { service } = detectServiceWithConfidence(userInput)
  return service
}

/**
 * detectServiceWithConfidence
 * Extended version that returns service + confidence + runner-up.
 * @param {string} userInput
 * @returns {{ service: string, confidence: number, runnerUp: string|null }}
 */
export function detectServiceWithConfidence(userInput) {
  if (!userInput || typeof userInput !== 'string') {
    return { service: 'general', confidence: 0, runnerUp: null }
  }

  const normalInput  = normalize(userInput)
  const inputTokens  = extractTokens(userInput)

  const scores = ALL_INTENTS.map(intent => ({
    service: intent.service,
    score:   scoreIntent(normalInput, inputTokens, intent),
  }))

  // Sort descending by score
  scores.sort((a, b) => b.score - a.score)

  const best       = scores[0]
  const runnerUp   = scores[1]?.score > 0 ? scores[1].service : null
  const confidence = scoreToConfidence(best.score)

  // Low confidence → fall back to general rather than guessing
  if (confidence < 20 || best.service === 'general') {
    return { service: 'general', confidence, runnerUp }
  }

  return { service: best.service, confidence, runnerUp }
}
