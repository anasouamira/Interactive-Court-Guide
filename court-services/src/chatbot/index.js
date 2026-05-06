// ─────────────────────────────────────────────────────────────────────────────
// chatbot/index.js
// Central export point for the chatbot system.
// Import everything you need from this single file.
//
// Usage:
//   import { processMessage, getWelcomeMessage, getQuickChips } from '../chatbot'
// ─────────────────────────────────────────────────────────────────────────────

// ── Core engine (what the Chatbot component needs) ────────────────────────────
export { processMessage, getWelcomeMessage, getQuickChips } from './core/chatbotEngine'
export { detectService, detectServiceWithConfidence } from './core/detectService'

// ── Intent modules (for extension/testing) ────────────────────────────────────
export { complaintIntents }  from './intents/complaint.intents'
export { courtIntents }      from './intents/court.intents'
export { trackingIntents }   from './intents/tracking.intents'
export { documentsIntents }  from './intents/documents.intents'
export { supportIntents }    from './intents/support.intents'
export { generalIntents }    from './intents/general.intents'

// ── Response modules (for extension/testing) ──────────────────────────────────
export { complaintResponses }  from './responses/complaint.responses'
export { courtResponses }      from './responses/court.responses'
export { trackingResponses }   from './responses/tracking.responses'
export { documentsResponses }  from './responses/documents.responses'
export { supportResponses }    from './responses/support.responses'
export { generalResponses }    from './responses/general.responses'
