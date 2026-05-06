
import { detectServiceWithConfidence } from './detectService'
import { complaintResponses }  from '../responses/complaint.responses'
import { courtResponses }      from '../responses/court.responses'
import { trackingResponses }   from '../responses/tracking.responses'
import { documentsResponses }  from '../responses/documents.responses'
import { supportResponses }    from '../responses/support.responses'
import { generalResponses }    from '../responses/general.responses'

//Response map
const RESPONSE_MAP = {
  complaint: complaintResponses,
  court:     courtResponses,
  tracking:  trackingResponses,
  documents: documentsResponses,
  support:   supportResponses,
  general:   generalResponses,
}

// Each entry: { key: responseKey, triggers: string[] }
// First trigger match wins. Ordered from most specific to least specific.

const SUB_INTENTS = {

  complaint: [
    { key: 'theft',     triggers: ['سرق', 'نصب', 'احتيال', 'غش', 'ابتزاز', 'سرقة', 'نصبوني', 'سرقوني', 'اخد فلوسي', 'ما رجعليش', 'ما خلصنيش', 'خد منيا', 'دارلي'] },
    { key: 'rights',    triggers: ['حقوق', 'حق', 'حقي', 'مظلوم', 'ظلموني'] },
    { key: 'steps',     triggers: ['خطوات', 'كيف', 'كيفاش', 'إجراءات', 'طريقة', 'مراحل', 'شنو خاصني', 'كيبدا', 'من أين أبدأ'] },
    { key: 'fees',      triggers: ['رسوم', 'تكلف', 'مجاني', 'ثمن', 'سعر', 'شحال', 'بالمجان', 'بالمجان واخا'] },
    { key: 'location',  triggers: ['فين', 'أين', 'مكان', 'عنوان', 'بلاصة', 'كيفاش نوصل', 'وين'] },
    { key: 'documents', triggers: ['وثيقة', 'وثائق', 'مستند', 'خاصني نجيب', 'ما خاصني', 'ما هي الوثائق'] },
  ],

  court: [
    { key: 'summons',  triggers: ['استدعاء', 'احضار', 'مثول', 'جاني', 'استلمت', 'ورقة من المحكمة'] },
    { key: 'appeal',   triggers: ['استئناف', 'طعن', 'نقض', 'ما راضيش', 'اعتراض', 'نعترض', 'الحكم غلط', 'مظلوم في الحكم'] },
    { key: 'lawsuit',  triggers: ['دعوى', 'رفع دعوى', 'مدنية', 'مقال', 'ارفع', 'نقدم دعوى'] },
    { key: 'hearing',  triggers: ['جلسة', 'موعد', 'حجز', 'تحديد موعد', 'موعد جلستي'] },
    { key: 'fees',     triggers: ['رسوم', 'تكلف', 'شحال', 'ثمن', 'كم'] },
    { key: 'location', triggers: ['فين', 'أين', 'بلاصة', 'عنوان', 'ساعات', 'مواعيد', 'يفتح', 'يغلق'] },
  ],

  tracking: [
    { key: 'noUpdate',        triggers: ['ما سمعتش', 'وما عندي خبر', 'ما خبروني', 'مضات أشهر', 'مدة طويلة', 'من مدة', 'ما جا شي'] },
    { key: 'referenceNumber', triggers: ['رقم', 'مرجع', 'نسيت', 'فقدت', 'ضاع', 'ما عندي رقم', 'رقم القضية'] },
    { key: 'duration',        triggers: ['كم', 'مدة', 'متى', 'وقت', 'شحال', 'كيدوم', 'يستغرق', 'يأخذ'] },
    { key: 'status',          triggers: ['حالة', 'وضع', 'أين وصلت', 'فين وصل', 'آش صرا', 'شنو وقع', 'نتيجة', 'مآل'] },
  ],

  documents: [
    { key: 'apostille',      triggers: ['أبوستيل', 'apostille', 'للخارج دولة', 'اتفاقية لاهاي', 'معترف به دولياً'] },
    { key: 'legalization',   triggers: ['تصديق', 'مصادقة', 'توثيق', 'أصدق', 'مصدق', 'للخارج', 'للسفارة', 'وزارة الخارجية'] },
    { key: 'courtRecords',   triggers: ['نسخة حكم', 'وثيقة المحكمة', 'محضر', 'ضبط', 'نسخة من الملف', 'ct-07'] },
    { key: 'criminalRecord', triggers: ['سجل عدلي', 'جنائية', 'عدلي', 'بطاقة جنائية', 'سوابق', 'لا سوابق', 'السجل'] },
  ],

  support: [
    { key: 'khul',        triggers: ['خلع', 'خلاع', 'بغيت نخلع', 'أخلع', 'حق الزوجة في الطلاق'] },
    { key: 'alimony',     triggers: ['نفقة', 'النفقة', 'مصاريف', 'خلاص الأطفال', 'ما كيعطيش', 'ما عطاش'] },
    { key: 'custody',     triggers: ['حضانة', 'من يحضن', 'مع شكون', 'الأطفال بعد الطلاق', 'دراري', 'أولاد'] },
    { key: 'inheritance', triggers: ['ميراث', 'تركة', 'ورثة', 'قسمة', 'إرث', 'مات', 'ماتت', 'الحصة', 'الدار بعد الوفاة'] },
    { key: 'divorce',     triggers: ['طلاق', 'تطليق', 'فراق', 'انفصال', 'بغيت نطلق', 'شقاق', 'أريد الطلاق'] },
    { key: 'marriage',    triggers: ['زواج', 'عقد الزواج', 'أتزوج', 'نكاح', 'تسجيل الزواج', 'إذن الزواج', 'عرس'] },
  ],

  general: [
    { key: 'greeting',  triggers: ['سلام', 'مرحبا', 'أهلا', 'صباح', 'مساء', 'كيداير', 'هلا', 'hi', 'hello', 'bonjour'] },
    { key: 'thanks',    triggers: ['شكرا', 'شكراً', 'merci', 'baraka', 'مشكور', 'بارك الله'] },
    { key: 'lawyer',    triggers: ['محامي', 'محاماة', 'مستشار قانوني', 'محامي مجاني', 'بدون محامي'] },
    { key: 'hours',     triggers: ['ساعات', 'مواعيد', 'متى مفتوح', 'أوقات', 'دوام', 'يفتح', 'يغلق'] },
    { key: 'location',  triggers: ['فين', 'أين', 'عنوان', 'بلاصة', 'مكان', 'كيفاش نوصل'] },
    { key: 'fees',      triggers: ['رسوم', 'تكلف', 'مجاني', 'شحال', 'ثمن', 'أسعار', 'كم'] },
    { key: 'services',  triggers: ['خدمات', 'شنو تقدر', 'ما هي', 'ما ذا', 'القائمة', 'كل الخدمات'] },
  ],
}

// Sub-intent detection 

function normalize(text) {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[.,،؟?!؛;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function detectSubIntent(service, input) {
  const subList = SUB_INTENTS[service]
  if (!subList) return 'default'

  const normalInput = normalize(input)

  for (const { key, triggers } of subList) {
    for (const trigger of triggers) {
      if (normalInput.includes(normalize(trigger))) {
        return key
      }
    }
  }

  return 'default'
}

// Public API
/**
 * processMessage
 * Main entry point for the Chatbot component.
 * @param {string} text  — raw user message
 * @param {string} lang  — 'ar' | 'ma'
 * @returns {string[]}   — array of reply strings
 */
export function processMessage(text, lang = 'ar') {
  if (!text || !text.trim()) return generalResponses.fallback

  const { service, confidence } = detectServiceWithConfidence(text)
  const subIntent  = detectSubIntent(service, text)
  const responses  = RESPONSE_MAP[service]

  // Very low confidence → global fallback
  if (confidence < 15) return generalResponses.fallback

  return (
    responses[subIntent]  ||
    responses['default']  ||
    responses['fallback'] ||
    generalResponses.fallback
  )
}

/**
 * getWelcomeMessage
 * @param {string} lang
 * @returns {string}
 */
export function getWelcomeMessage(lang = 'ar') {
  return lang === 'ma'
    ? 'مرحبا! أنا المساعد ديال خدمات المحكمة. كيفاش نقدر نعاونك اليوم؟'
    : 'مرحباً! أنا مساعد خدمات المحكمة. كيف يمكنني مساعدتك اليوم؟'
}

/**
 * getQuickChips
 * @param {string} lang
 * @returns {Array<{ label: string, msg: string }>}
 */
export function getQuickChips(lang = 'ar') {
  const chips = {
    ar: [
      { label: 'كيف أقدم شكوى؟',    msg: 'كيف أقدم شكوى رسمية؟' },
      { label: 'الوثائق المطلوبة',    msg: 'ما هي الوثائق المطلوبة؟' },
      { label: 'رسوم الخدمات',        msg: 'ما هي رسوم خدمات المحكمة؟' },
      { label: 'متابعة قضية',         msg: 'كيف أتابع حالة قضيتي؟' },
    ],
    ma: [
      { label: 'كيفاش نقدم شكاية؟',  msg: 'كيفاش نقدم شكاية رسمية؟' },
      { label: 'الوثائق لي خاصني',    msg: 'شنو الوثائق لي خاصني؟' },
      { label: 'شحال كتكلف الخدمات', msg: 'شحال كتكلف خدمات المحكمة؟' },
      { label: 'متابعة قضيتي',        msg: 'كيفاش نتابع قضيتي؟' },
    ],
  }
  return chips[lang] || chips['ar']
}
