// ─────────────────────────────────────────────────────────────────────────────
// chatbotEngine.js
// Central chatbot logic handler.
// Takes user input → detects service → detects sub-intent → returns replies.
//
// Public API:
//   processMessage(text, lang) → string[]
//   getQuickChips(lang)        → Array<{ label, msg }>
//   getWelcomeMessage(lang)    → string
// ─────────────────────────────────────────────────────────────────────────────

import { detectService }        from './detectService'
import { complaintResponses }   from '../responses/complaint.responses'
import { courtResponses }       from '../responses/court.responses'
import { trackingResponses }    from '../responses/tracking.responses'
import { documentsResponses }   from '../responses/documents.responses'
import { supportResponses }     from '../responses/support.responses'
import { generalResponses }     from '../responses/general.responses'

// ─── Response map — service → response module ─────────────────────────────────
const RESPONSE_MAP = {
  complaint: complaintResponses,
  court:     courtResponses,
  tracking:  trackingResponses,
  documents: documentsResponses,
  support:   supportResponses,
  general:   generalResponses,
}

// ─── Sub-intent refinement ────────────────────────────────────────────────────
// After the service is detected, we do a lightweight second pass to pick
// the most specific response key within that service's response module.

const SUB_INTENTS = {
  complaint: [
    { key: 'steps',     triggers: ['خطوات', 'كيف', 'كيفاش', 'إجراءات', 'طريقة', 'مراحل', 'شنو خاصني'] },
    { key: 'fees',      triggers: ['رسوم', 'تكلف', 'مجاني', 'ثمن', 'سعر', 'شحال', 'بالمجان'] },
    { key: 'location',  triggers: ['فين', 'أين', 'مكان', 'عنوان', 'بلاصة', 'كيفاش نوصل'] },
    { key: 'documents', triggers: ['وثيقة', 'وثائق', 'مستند', 'خاصني', 'ما خاصني'] },
  ],

  court: [
    { key: 'hearing',  triggers: ['جلسة', 'موعد', 'حجز', 'تحديد موعد'] },
    { key: 'appeal',   triggers: ['استئناف', 'طعن', 'نقض', 'الحكم'] },
    { key: 'lawsuit',  triggers: ['دعوى', 'رفع', 'مدنية', 'مقال'] },
    { key: 'summons',  triggers: ['استدعاء', 'احضار', 'مثول', 'جاني استدعاء'] },
    { key: 'location', triggers: ['فين', 'أين', 'بلاصة', 'عنوان', 'ساعات', 'مواعيد'] },
  ],

  tracking: [
    { key: 'status',          triggers: ['حالة', 'وضع', 'أين وصلت', 'فين وصلت', 'آش صرا'] },
    { key: 'referenceNumber', triggers: ['رقم', 'مرجع', 'نسيت', 'فقدت'] },
    { key: 'duration',        triggers: ['كم', 'مدة', 'متى', 'وقت', 'شحال', 'كيدوم'] },
  ],

  documents: [
    { key: 'criminalRecord', triggers: ['سجل عدلي', 'جنائية', 'عدلي', 'بطاقة جنائية'] },
    { key: 'courtRecords',   triggers: ['نسخة', 'حكم', 'وثيقة المحكمة', 'محضر'] },
    { key: 'legalization',   triggers: ['تصديق', 'مصادقة', 'أبوستيل', 'توثيق', 'خارج'] },
  ],

  support: [
    { key: 'marriage',    triggers: ['زواج', 'عقد الزواج', 'إذن الزواج', 'نكاح'] },
    { key: 'divorce',     triggers: ['طلاق', 'خلع', 'تطليق', 'فراق'] },
    { key: 'custody',     triggers: ['حضانة', 'أطفال بعد الطلاق', 'من يحضن'] },
    { key: 'inheritance', triggers: ['ميراث', 'تركة', 'ورثة', 'قسمة'] },
  ],

  general: [
    { key: 'greeting',  triggers: ['سلام', 'مرحبا', 'أهلا', 'صباح', 'مساء', 'كيداير', 'هلا'] },
    { key: 'services',  triggers: ['خدمات', 'شنو تقدر', 'ما هي', 'ما ذا يمكن'] },
    { key: 'fees',      triggers: ['رسوم', 'تكلف', 'مجاني', 'شحال', 'ثمن', 'أسعار'] },
    { key: 'location',  triggers: ['فين', 'أين', 'عنوان', 'بلاصة', 'مكان'] },
    { key: 'hours',     triggers: ['ساعات', 'مواعيد', 'متى مفتوح', 'أوقات', 'الدوام'] },
    { key: 'lawyer',    triggers: ['محامي', 'محاماة', 'خاصني محامي', 'بدون محامي'] },
    { key: 'thanks',    triggers: ['شكرا', 'شكراً', 'merci', 'baraka'] },
  ],
}

/**
 * detectSubIntent
 * Given a service and user input, returns the best matching response key.
 * Falls back to 'default' if nothing matches.
 */
function detectSubIntent(service, input) {
  const subIntents = SUB_INTENTS[service]
  if (!subIntents) return 'default'

  const normalInput = input.trim().toLowerCase()

  for (const { key, triggers } of subIntents) {
    for (const trigger of triggers) {
      if (normalInput.includes(trigger.toLowerCase())) {
        return key
      }
    }
  }

  return 'default'
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * processMessage
 * Main entry point. Takes a user message, detects intent, returns replies.
 * @param {string} text - raw user input
 * @param {string} lang - 'ar' | 'ma' (both use same Arabic response files)
 * @returns {string[]} array of response strings to display sequentially
 */
export function processMessage(text, lang = 'ar') {
  if (!text || !text.trim()) {
    return generalResponses.fallback
  }

  const service    = detectService(text)
  const subIntent  = detectSubIntent(service, text)
  const responses  = RESPONSE_MAP[service]

  // Try the specific sub-intent response, then fallback chain
  const reply =
    responses[subIntent]   ||
    responses['default']   ||
    responses['fallback']  ||
    generalResponses.fallback

  return reply
}

/**
 * getWelcomeMessage
 * Returns the greeting message shown when the chatbot first opens.
 * @param {string} lang
 * @returns {string}
 */
export function getWelcomeMessage(lang = 'ar') {
  const greetings = {
    ar: 'مرحباً! أنا مساعد خدمات المحكمة. كيف يمكنني مساعدتك اليوم؟',
    ma: 'مرحبا! أنا المساعد ديال خدمات المحكمة. كيفاش نقدر نعاونك اليوم؟',
  }
  return greetings[lang] || greetings['ar']
}

/**
 * getQuickChips
 * Returns quick-reply chip definitions for the chatbot UI.
 * @param {string} lang
 * @returns {Array<{ label: string, msg: string }>}
 */
export function getQuickChips(lang = 'ar') {
  const chips = {
    ar: [
      { label: 'كيف أقدم شكوى؟',      msg: 'كيف أقدم شكوى رسمية؟' },
      { label: 'الوثائق المطلوبة',      msg: 'ما هي الوثائق المطلوبة؟' },
      { label: 'موقع المحكمة',          msg: 'أين يقع مقر المحكمة؟' },
      { label: 'رسوم الخدمات',          msg: 'ما هي رسوم خدمات المحكمة؟' },
    ],
    ma: [
      { label: 'كيفاش نقدم شكاية؟',    msg: 'كيفاش نقدم شكاية رسمية؟' },
      { label: 'الوثائق لي خاصني',      msg: 'شنو الوثائق لي خاصني؟' },
      { label: 'فين كاينة المحكمة',     msg: 'فين كاينة المحكمة؟' },
      { label: 'شحال كتكلف الخدمات',   msg: 'شحال كتكلف خدمات المحكمة؟' },
    ],
  }
  return chips[lang] || chips['ar']
}
