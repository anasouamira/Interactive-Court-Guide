// ─────────────────────────────────────────────────────────────────────────────
// chatbotEngine.js  v3
// Central message handler for all 6 court services.
// ─────────────────────────────────────────────────────────────────────────────

import { detectServiceWithConfidence } from './detectService'
import { complaintResponses }      from '../responses/complaint.responses'
import { documentsResponses }      from '../responses/documents.responses'
import { criminalRecordResponses } from '../responses/criminalRecord.responses'
import { divorceResponses }        from '../responses/divorce.responses'
import { marriageResponses }       from '../responses/marriage.responses'
import { civilClaimResponses }     from '../responses/civilClaim.responses'

// ─── Response map ─────────────────────────────────────────────────────────────
const RESPONSE_MAP = {
  complaint:     complaintResponses,
  documents:     documentsResponses,
  criminalRecord: criminalRecordResponses,
  divorce:       divorceResponses,
  marriage:      marriageResponses,
  civilClaim:    civilClaimResponses,
}

// ─── Shared normalize (keeps engine self-contained) ───────────────────────────
function normalize(text) {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[.,،؟?!؛;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// ─── Sub-intent trigger tables ────────────────────────────────────────────────
// Ordered from most-specific to least-specific within each service.
// First match wins.

const SUB_INTENTS = {

  complaint: [
    { key: 'emergency',    triggers: ['طوارئ', 'خطر', 'الآن', 'عاجل', 'فوري', 'يضربني', 'يهددني', 'مباشر'] },
    { key: 'theft',        triggers: ['سرق', 'نصب', 'احتيال', 'غش', 'ابتزاز', 'سرقوني', 'نصبوني', 'غشوني', 'ما رجعليش', 'ما خلصنيش', 'خد فلوسي', 'اخد منيا'] },
    { key: 'rights',       triggers: ['حقوق', 'حقي', 'مظلوم', 'ظلموني', 'ما حقي'] },
    { key: 'tracking',     triggers: ['متابعة', 'تتبع', 'حالة الشكوى', 'فين وصلت', 'آش صرا', 'الرقم المرجعي'] },
    { key: 'duration',     triggers: ['كم', 'مدة', 'متى', 'وقت', 'شحال', 'يستغرق', 'يأخذ', 'يدوم'] },
    { key: 'fees',         triggers: ['رسوم', 'تكلف', 'مجاني', 'ثمن', 'سعر', 'شحال', 'بالمجان'] },
    { key: 'documents',    triggers: ['وثيقة', 'وثائق', 'مستند', 'خاصني نجيب', 'ما هي الوثائق', 'ما خاصني'] },
    { key: 'legalNotes',   triggers: ['قانون', 'قانوني', 'تقادم', 'مدة التقادم', 'جنحة', 'جناية'] },
    { key: 'commonErrors', triggers: ['أخطاء', 'خطأ', 'تجنب', 'مشكل شائع', 'ما خاصنيش'] },
    { key: 'advice',       triggers: ['نصيحة', 'نصائح', 'كيف أعمل', 'ماذا أفعل', 'شنو دير'] },
    { key: 'steps',        triggers: ['خطوات', 'كيف', 'كيفاش', 'إجراءات', 'طريقة', 'مراحل', 'من أين أبدأ', 'كيبدا'] },
  ],

  documents: [
    { key: 'apostille',    triggers: ['أبوستيل', 'apostille', 'لاهاي', 'اتفاقية', 'دولي', '120 دولة'] },
    { key: 'tracking',     triggers: ['متابعة', 'تتبع', 'فين وصل', 'إيصال', 'الطلب ديالي'] },
    { key: 'duration',     triggers: ['كم', 'مدة', 'متى', 'وقت', 'شحال', 'يستغرق', 'يأخذ', 'يدوم'] },
    { key: 'fees',         triggers: ['رسوم', 'تكلف', 'مجاني', 'ثمن', 'سعر', 'شحال', 'بالمجان'] },
    { key: 'documents',    triggers: ['وثيقة', 'وثائق', 'مستند', 'خاصني نجيب', 'ما هي الوثائق'] },
    { key: 'legalNotes',   triggers: ['قانون', 'قانوني', 'قنصلية', 'خارج المغرب', 'ديني', 'مدني'] },
    { key: 'commonErrors', triggers: ['أخطاء', 'خطأ', 'تجنب', 'ما صلحش', 'رُفض', 'ما قبلوش'] },
    { key: 'rights',       triggers: ['حقوق', 'حقي', 'رفض', 'اعتراض'] },
    { key: 'advice',       triggers: ['نصيحة', 'نصائح', 'كيف أعمل', 'شنو دير'] },
    { key: 'steps',        triggers: ['خطوات', 'كيف', 'كيفاش', 'إجراءات', 'طريقة', 'من أين أبدأ'] },
  ],

  criminalRecord: [
    { key: 'validity',     triggers: ['صلاحية', 'تنتهي', 'مدة', 'صالح', 'انتهت', 'تجديد', 'تحديث'] },
    { key: 'tracking',     triggers: ['متابعة', 'تتبع', 'فين وصل', 'الطلب ديالي', 'لم يصل', 'ما وصلش'] },
    { key: 'duration',     triggers: ['كم', 'وقت', 'متى', 'شحال', 'يستغرق', 'يأخذ', 'يدوم', 'فوري'] },
    { key: 'fees',         triggers: ['رسوم', 'تكلف', 'مجاني', 'ثمن', 'سعر', 'شحال', 'بالمجان'] },
    { key: 'documents',    triggers: ['وثيقة', 'وثائق', 'خاصني نجيب', 'ما هي الوثائق', 'ما خاصني'] },
    { key: 'legalNotes',   triggers: ['قانون', 'قانوني', 'شطب', 'محو', 'مسح', 'بعد العقوبة'] },
    { key: 'commonErrors', triggers: ['أخطاء', 'خطأ', 'وكالة', 'غيري', 'شخص آخر'] },
    { key: 'rights',       triggers: ['حقوق', 'حقي', 'اطلاع', 'اعتراض', 'خطأ في السجل'] },
    { key: 'advice',       triggers: ['نصيحة', 'نصائح', 'شنو دير', 'كيف أعمل'] },
    { key: 'emergency',    triggers: ['عاجل', 'فوري', 'أخر لحظة', 'ضيق وقت', 'غداً', 'اليوم'] },
    { key: 'steps',        triggers: ['خطوات', 'كيف', 'كيفاش', 'إجراءات', 'طريقة', 'من أين أبدأ', 'أونلاين', 'إنترنت'] },
  ],

  divorce: [
    { key: 'emergency',    triggers: ['عنف', 'ضرب', 'خطر', 'أذى', 'تهديد', 'عاجل', 'حماية'] },
    { key: 'khul',         triggers: ['خلع', 'خلاع', 'حق المرأة في الطلاق', 'أخلع زوجي', 'بغيت نخلع'] },
    { key: 'alimony',      triggers: ['نفقة', 'نفقات', 'مصاريف', 'خلاص', 'ما كيعطيش', 'وقف النفقة', 'التنفيذ'] },
    { key: 'custody',      triggers: ['حضانة', 'الأطفال', 'دراري', 'مع شكون', 'من يحضن', 'أولاد'] },
    { key: 'rights',       triggers: ['حقوق', 'حقي', 'حق المرأة', 'حق الزوج', 'مستحقات'] },
    { key: 'tracking',     triggers: ['متابعة', 'تتبع', 'فين وصل', 'حالة الملف', 'جلسة'] },
    { key: 'duration',     triggers: ['كم', 'مدة', 'متى', 'وقت', 'شحال', 'يستغرق', 'يأخذ', 'يدوم'] },
    { key: 'fees',         triggers: ['رسوم', 'تكلف', 'ثمن', 'سعر', 'شحال', 'مبالغ الطلاق'] },
    { key: 'documents',    triggers: ['وثيقة', 'وثائق', 'خاصني نجيب', 'ما هي الوثائق', 'ما خاصني'] },
    { key: 'legalNotes',   triggers: ['قانون', 'قانوني', 'مدونة الأسرة', 'خارج المغرب', 'أجنبي'] },
    { key: 'commonErrors', triggers: ['أخطاء', 'خطأ', 'شائع', 'تجنب', 'ما خاصنيش'] },
    { key: 'advice',       triggers: ['نصيحة', 'نصائح', 'شنو دير', 'كيف أعمل', 'ماذا أفعل'] },
    { key: 'steps',        triggers: ['خطوات', 'كيف', 'كيفاش', 'إجراءات', 'طريقة', 'من أين أبدأ'] },
  ],

  marriage: [
    { key: 'secondMarriage',  triggers: ['زواج ثاني', 'زواج ثانٍ', 'زوجة ثانية', 'تعدد', 'إذن المحكمة للزواج الثاني'] },
    { key: 'mixedMarriage',   triggers: ['أجنبي', 'أجنبية', 'زواج مختلط', 'من غير مغربية', 'غير مسلم', 'غير مسلمة', 'أوروبية', 'خارجية'] },
    { key: 'rights',          triggers: ['حقوق', 'حقي', 'حق الزوجة', 'بنود العقد', 'شروط', 'إكراه'] },
    { key: 'tracking',        triggers: ['متابعة', 'تتبع', 'فين وصل', 'الطلب ديالي', 'موعد الجلسة'] },
    { key: 'duration',        triggers: ['كم', 'مدة', 'متى', 'وقت', 'شحال', 'يستغرق', 'يأخذ', 'يدوم'] },
    { key: 'fees',            triggers: ['رسوم', 'تكلف', 'ثمن', 'سعر', 'شحال', 'بالمجان', 'يكلف'] },
    { key: 'documents',       triggers: ['وثيقة', 'وثائق', 'خاصني نجيب', 'ما هي الوثائق', 'ما خاصني'] },
    { key: 'legalNotes',      triggers: ['قانون', 'قانوني', 'مدونة', 'عرفي', 'ديني', 'خارج'] },
    { key: 'commonErrors',    triggers: ['أخطاء', 'خطأ', 'تجنب', 'ما خاصنيش', 'ما صلحش'] },
    { key: 'advice',          triggers: ['نصيحة', 'نصائح', 'شنو دير', 'كيف أعمل', 'ماذا أفعل'] },
    { key: 'steps',           triggers: ['خطوات', 'كيف', 'كيفاش', 'إجراءات', 'طريقة', 'من أين أبدأ'] },
  ],

  civilClaim: [
    { key: 'emergency',    triggers: ['عاجل', 'استعجالي', 'حجز', 'إخلاء', 'وشيك', 'فوري', 'أمر وقتي'] },
    { key: 'execution',    triggers: ['تنفيذ', 'تنفيذ الحكم', 'حكم صالحي', 'ينفذ', 'الحجز', 'قسم التنفيذ'] },
    { key: 'appeal',       triggers: ['استئناف', 'طعن', 'نقض', 'ما راضيش', 'اعتراض', 'الحكم غلط', '30 يوم'] },
    { key: 'rights',       triggers: ['حقوق', 'حقي', 'المدّعي', 'ما حقي', 'حقوق المتقاضي'] },
    { key: 'tracking',     triggers: ['متابعة', 'تتبع', 'فين وصلت', 'حالة القضية', 'جلسة', 'موعد'] },
    { key: 'duration',     triggers: ['كم', 'مدة', 'متى', 'وقت', 'شحال', 'يستغرق', 'يأخذ', 'يدوم'] },
    { key: 'fees',         triggers: ['رسوم', 'تكلف', 'ثمن', 'سعر', 'شحال', 'يكلف', 'أتعاب'] },
    { key: 'documents',    triggers: ['وثيقة', 'وثائق', 'مستند', 'خاصني نجيب', 'ما هي الوثائق'] },
    { key: 'legalNotes',   triggers: ['قانون', 'قانوني', 'تقادم', 'اختصاص', 'محكمة مختصة', 'أجنبي'] },
    { key: 'commonErrors', triggers: ['أخطاء', 'خطأ', 'تجنب', 'شائع', 'غياب', 'فوّت'] },
    { key: 'advice',       triggers: ['نصيحة', 'نصائح', 'شنو دير', 'كيف أعمل', 'ماذا أفعل', 'وساطة'] },
    { key: 'steps',        triggers: ['خطوات', 'كيف', 'كيفاش', 'إجراءات', 'طريقة', 'من أين أبدأ', 'مقال'] },
  ],
}

// ─── Sub-intent detection ─────────────────────────────────────────────────────

function detectSubIntent(service, input) {
  const list = SUB_INTENTS[service]
  if (!list) return 'default'

  const normInput = normalize(input)
  for (const { key, triggers } of list) {
    for (const trigger of triggers) {
      if (normInput.includes(normalize(trigger))) return key
    }
  }
  return 'default'
}

// ─── Global fallback response ─────────────────────────────────────────────────
const GLOBAL_FALLBACK = [
  'لم أفهم سؤالك تماماً.',
  'يمكنني مساعدتك في:\n• تقديم شكوى\n• تصديق الوثائق\n• السجل العدلي\n• إجراءات الطلاق\n• تسجيل الزواج\n• رفع دعوى مدنية',
  'حاول إعادة صياغة سؤالك أو اختر من الأزرار أعلاه.',
]

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * processMessage — main entry point used by Chatbot.jsx
 * @param {string} text
 * @param {string} lang — 'ar' | 'ma' (responses are Arabic for both)
 * @returns {string[]}
 */
export function processMessage(text, lang = 'ar') {
  if (!text?.trim()) return GLOBAL_FALLBACK

  const { service, confidence } = detectServiceWithConfidence(text)
  if (confidence < 15) return GLOBAL_FALLBACK

  const subIntent = detectSubIntent(service, text)
  const responses = RESPONSE_MAP[service]

  return (
    responses[subIntent]  ||
    responses['default']  ||
    responses['fallback'] ||
    GLOBAL_FALLBACK
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
      { label: 'تقديم شكوى',       msg: 'كيف أقدم شكوى رسمية؟' },
      { label: 'السجل العدلي',      msg: 'كيف أستخرج السجل العدلي؟' },
      { label: 'تصديق وثيقة',      msg: 'كيف أصدق وثيقة رسمية؟' },
      { label: 'إجراءات الطلاق',   msg: 'ما هي إجراءات الطلاق؟' },
    ],
    ma: [
      { label: 'تقديم شكاية',      msg: 'كيفاش نقدم شكاية رسمية؟' },
      { label: 'السجل العدلي',      msg: 'كيفاش نجيب السجل العدلي؟' },
      { label: 'تصديق وثيقة',      msg: 'كيفاش نصدق وثيقة رسمية؟' },
      { label: 'إجراءات الطلاق',   msg: 'شنو إجراءات الطلاق؟' },
    ],
  }
  return chips[lang] || chips['ar']
}
