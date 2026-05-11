// ─────────────────────────────────────────────────────────────────────────────
// src/api/dossierApi.js
// طبقة الاتصال بـ API — الصيغة الرقمية فقط
//
// الصيغة الصحيحة: رقم/نوع/سنة   مثال: 4521/1/2024
// نوع الملف: رقم من 1 إلى 9 (وليس حرفاً)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL    = import.meta.env.VITE_API_BASE_URL    || 'http://localhost:5000'
const ENDPOINT    = `${BASE_URL}/api/dossier/search`
const USE_FALLBACK = import.meta.env.VITE_USE_MOCK_FALLBACK !== 'false'

// ─── Format detection ─────────────────────────────────────────────────────────

/**
 * هل القيمة بصيغة الملف الكاملة؟ مثال: "4521/1/2024"
 * الصيغة الصحيحة: رقم/رقم(1-9)/سنة — كلها أرقام
 */
export function isDossierString(value) {
  return typeof value === 'string' && /^\d{1,8}\/[1-9]\/\d{4}$/.test(value.trim())
}

/**
 * بناء الـ payload المناسب للـ backend
 */
export function buildPayload(input) {
  const { tribunal, annee, typeCode, numero, dossierString } = input

  if (dossierString && dossierString.includes('/')) {
    // الصيغة ب — رقم الملف الكامل
    return { dossier: dossierString.trim(), tribunal }
  }

  // الصيغة أ — حقول منفصلة
  return {
    tribunal,
    annee:    parseInt(annee, 10),
    typeCode: String(typeCode || '').trim(),
    numero:   String(numero  || '').trim(),
  }
}

// ─── Main API call ────────────────────────────────────────────────────────────

export async function searchDossier(input, options = {}) {
  const payload    = buildPayload(input)
  const timeout    = options.timeout || 12000
  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), timeout)
  const signal     = options.signal || controller.signal

  try {
    const response = await fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify(payload),
      signal,
    })

    clearTimeout(timer)

    let data
    try   { data = await response.json() }
    catch { throw new ApiError('رد الخادم غير صالح.', response.status) }

    if (!response.ok) {
      return {
        success:  false,
        error:    data.error || `خطأ في الخادم (${response.status})`,
        status:   response.status,
        raw:      data,
      }
    }

    return data

  } catch (err) {
    clearTimeout(timer)

    if (err.name === 'AbortError') {
      return USE_FALLBACK
        ? searchLocalFallback(input)
        : { success: false, error: 'انتهت مهلة الطلب. تحقق من اتصالك.', offline: true }
    }

    if (err instanceof TypeError) {
      return USE_FALLBACK
        ? searchLocalFallback(input)
        : { success: false, error: 'تعذّر الوصول إلى الخادم. أنت غير متصل.', offline: true }
    }

    throw err
  }
}

// ─── Local mock fallback ──────────────────────────────────────────────────────
// يُستخدم عندما يكون الـ backend غير متاح

const MOCK_DB = {
  'tpi-casa-1-4521-2024': {
    id: 'tpi-casa-1-4521-2024', numeroComplet: '4521/1/2024', typeCode: '1',
    numero: '4521', annee: 2024, tribunal: 'المحكمة الابتدائية بالدار البيضاء',
    tribunalCode: 'tpi-casa', chambre: 'الغرفة المدنية 3', type: 'مدني',
    status: 'en_cours', statusLabel: 'جارٍ', judge: 'الأستاذ حسن بنعلي',
    nextSession: '2025-06-22', lastUpdate: '2025-05-14',
    parties: { demandeur: 'محمد العلوي', defendeur: 'شركة إيمو كازا' },
    history: [
      { step: 1, date: '2024-01-15', event: 'إيداع المقال',        status: 'done',    current: false },
      { step: 2, date: '2024-01-18', event: 'تسجيل الملف',        status: 'done',    current: false },
      { step: 3, date: '2024-03-20', event: 'الجلسة الأولى',       status: 'done',    current: false },
      { step: 4, date: '2024-05-15', event: 'الأمر بالخبرة',       status: 'done',    current: false },
      { step: 5, date: '2025-01-10', event: 'تقرير الخبير',        status: 'done',    current: false },
      { step: 6, date: '2025-06-22', event: 'جلسة المداولة',       status: 'pending', current: true  },
      { step: 7, date: null,         event: 'النطق بالحكم',         status: 'pending', current: false },
    ],
  },
  'tpi-rabat-3-1837-2023': {
    id: 'tpi-rabat-3-1837-2023', numeroComplet: '1837/3/2023', typeCode: '3',
    numero: '1837', annee: 2023, tribunal: 'المحكمة الابتدائية بالرباط',
    tribunalCode: 'tpi-rabat', chambre: 'الغرفة الجنحية 1', type: 'جنحي',
    status: 'juge', statusLabel: 'صدر الحكم', judge: 'الأستاذة فاطمة الشرايبي',
    nextSession: null, lastUpdate: '2025-04-03',
    parties: { demandeur: 'النيابة العامة', defendeur: 'خالد رامي' },
    history: [
      { step: 1, date: '2023-02-05', event: 'إحالة النيابة',      status: 'done', current: false },
      { step: 2, date: '2023-03-20', event: 'فتح التحقيق',        status: 'done', current: false },
      { step: 3, date: '2023-10-10', event: 'الإحالة للمحاكمة',   status: 'done', current: false },
      { step: 4, date: '2025-01-15', event: 'الجلسة الرئيسية',    status: 'done', current: false },
      { step: 5, date: '2025-04-03', event: 'النطق بالحكم',        status: 'done', current: false },
    ],
  },
  'tpi-mkch-6-9104-2024': {
    id: 'tpi-mkch-6-9104-2024', numeroComplet: '9104/6/2024', typeCode: '6',
    numero: '9104', annee: 2024, tribunal: 'قسم قضاء الأسرة — مراكش',
    tribunalCode: 'tpi-mkch', chambre: 'قسم الأسرة', type: 'أسرة',
    status: 'en_attente', statusLabel: 'في الانتظار', judge: 'الأستاذ إدريس وعلي',
    nextSession: '2025-07-10', lastUpdate: '2025-04-28',
    parties: { demandeur: 'نادية الفاسي', defendeur: 'يوسف الفاسي' },
    history: [
      { step: 1, date: '2024-01-10', event: 'إيداع طلب الطلاق',   status: 'done',    current: false },
      { step: 2, date: '2024-01-12', event: 'التسجيل',            status: 'done',    current: false },
      { step: 3, date: '2024-03-15', event: 'محاولة الصلح',        status: 'done',    current: false },
      { step: 4, date: '2024-11-20', event: 'الخبرة الاجتماعية',   status: 'done',    current: false },
      { step: 5, date: '2025-07-10', event: 'تحديد الجلسة',        status: 'pending', current: true  },
      { step: 6, date: null,         event: 'الحكم',               status: 'pending', current: false },
    ],
  },
}

const ALIASES = {
  casablanca: 'tpi-casa', 'tpi-casa': 'tpi-casa',
  rabat: 'tpi-rabat', 'tpi-rabat': 'tpi-rabat',
  marrakech: 'tpi-mkch', 'tpi-mkch': 'tpi-mkch',
}

async function searchLocalFallback(input) {
  await new Promise(r => setTimeout(r, 700))

  const payload = buildPayload(input)
  let { tribunal, annee, typeCode, numero } = payload

  if (payload.dossier) {
    const p = payload.dossier.split('/')
    if (p.length === 3) [numero, typeCode, annee] = p
  }

  const tCode = ALIASES[(tribunal || '').toLowerCase()] || (tribunal || '').toLowerCase()
  const key   = `${tCode}-${typeCode}-${numero}-${annee}`
  const found = MOCK_DB[key]

  if (found) {
    return { success: true, source: 'local-fallback', dossier: found }
  }

  return {
    success: false, found: false, source: 'local-fallback',
    message: 'لم يُعثر على ملف بالمعطيات المدخلة.',
  }
}

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = status
  }
}

export { ApiError }
