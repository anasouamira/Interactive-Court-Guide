// ─────────────────────────────────────────────────────────────────────────────
// detectService.js
// Analyzes user input and returns the best matching service name.
// Uses a weighted scoring system: phrase matches score higher than keywords.
// Falls back to 'general' when nothing matches confidently.
// ─────────────────────────────────────────────────────────────────────────────

import { complaintIntents } from '../intents/complaint.intents'
import { courtIntents }     from '../intents/court.intents'
import { trackingIntents }  from '../intents/tracking.intents'
import { documentsIntents } from '../intents/documents.intents'
import { supportIntents }   from '../intents/support.intents'
import { generalIntents }   from '../intents/general.intents'

// All intent modules in priority order.
// More specific intents should come before more general ones.
const ALL_INTENTS = [
  complaintIntents,
  documentsIntents,
  trackingIntents,
  supportIntents,
  courtIntents,
  generalIntents,
]

// Weights for scoring
const PHRASE_SCORE   = 3   // full phrase match — high confidence
const KEYWORD_SCORE  = 1   // single keyword match — lower confidence
const MIN_SCORE      = 1   // minimum score to be considered a match

/**
 * Normalize text for comparison:
 * - trim whitespace
 * - remove punctuation
 * - collapse multiple spaces
 */
function normalize(text) {
  return text
    .trim()
    .replace(/[.,،؟?!؛;:]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

/**
 * detectService
 * @param {string} userInput - the raw message from the user
 * @returns {string} service name — one of:
 *   'complaint' | 'court' | 'tracking' | 'documents' | 'support' | 'general'
 */
export function detectService(userInput) {
  if (!userInput || typeof userInput !== 'string') return 'general'

  const input = normalize(userInput)
  let bestService = 'general'
  let bestScore   = 0

  for (const intent of ALL_INTENTS) {
    let score = 0

    // Score full phrase matches first (higher weight)
    if (intent.phrases) {
      for (const phrase of intent.phrases) {
        if (input.includes(normalize(phrase))) {
          score += PHRASE_SCORE
        }
      }
    }

    // Score keyword matches
    if (intent.keywords) {
      for (const keyword of intent.keywords) {
        if (input.includes(normalize(keyword))) {
          score += KEYWORD_SCORE
        }
      }
    }

    // Update best if this intent scored higher
    if (score > bestScore) {
      bestScore   = score
      bestService = intent.service
    }
  }

  // Only switch from 'general' if we have a meaningful signal
  return bestScore >= MIN_SCORE ? bestService : 'general'
}
