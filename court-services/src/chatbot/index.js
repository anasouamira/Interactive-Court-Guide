// ─────────────────────────────────────────────────────────────────────────────
// src/chatbot/index.js
// Single import point for the entire chatbot system.
//
// Usage in Chatbot.jsx (unchanged):
//   import { processMessage, getWelcomeMessage, getQuickChips } from '../chatbot'
// ─────────────────────────────────────────────────────────────────────────────

// ── Core engine (primary public API) ─────────────────────────────────────────
export { processMessage, getWelcomeMessage, getQuickChips } from './core/chatbotEngine'

// ── Detection utilities (optional, for debugging / future UI use) ─────────────
export { detectService, detectServiceWithConfidence } from './core/detectService'

// ── Intent modules (for testing / extending) ─────────────────────────────────
export { complaintIntents }      from './intents/complaint.intents'
export { documentsIntents }      from './intents/documents.intents'
export { criminalRecordIntents } from './intents/criminalRecord.intents'
export { divorceIntents }        from './intents/divorce.intents'
export { marriageIntents }       from './intents/marriage.intents'
export { civilClaimIntents }     from './intents/civilClaim.intents'

// ── Response modules (for testing / extending) ────────────────────────────────
export { complaintResponses }      from './responses/complaint.responses'
export { documentsResponses }      from './responses/documents.responses'
export { criminalRecordResponses } from './responses/criminalRecord.responses'
export { divorceResponses }        from './responses/divorce.responses'
export { marriageResponses }       from './responses/marriage.responses'
export { civilClaimResponses }     from './responses/civilClaim.responses'
