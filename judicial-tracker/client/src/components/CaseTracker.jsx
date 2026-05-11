import { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../context/LanguageContext'
import { searchDossier, buildPayload } from '../api/dossierApi'
import ResultCard from './ResultCard'

// ─── الثوابت ──────────────────────────────────────────────────────────────────

const TRIBUNALS = [
  { id: '',            label: '— اختر المحكمة —' },
  { id: 'tpi-casa',   label: 'المحكمة الابتدائية بالدار البيضاء' },
  { id: 'tpi-rabat',  label: 'المحكمة الابتدائية بالرباط' },
  { id: 'tpi-mkch',   label: 'المحكمة الابتدائية بمراكش' },
  { id: 'tpi-fes',    label: 'المحكمة الابتدائية بفاس' },
  { id: 'tpi-tng',    label: 'المحكمة الابتدائية بطنجة' },
  { id: 'tpi-agd',    label: 'المحكمة الابتدائية بأكادير' },
  { id: 'tpi-mek',    label: 'المحكمة الابتدائية بمكناس' },
  { id: 'tpi-ouj',    label: 'المحكمة الابتدائية بوجدة' },
  { id: 'ca-casa',    label: 'محكمة الاستئناف بالدار البيضاء' },
  { id: 'ca-rabat',   label: 'محكمة الاستئناف بالرباط' },
  { id: 'ca-mkch',    label: 'محكمة الاستئناف بمراكش' },
  { id: 'tcom-casa',  label: 'المحكمة التجارية بالدار البيضاء' },
  { id: 'tadm-rabat', label: 'المحكمة الإدارية بالرباط' },
]

// أنواع الملفات — أرقام فقط (1–9) وفق النظام المغربي
const TYPE_CODES = [
  { id: '',  label: '— نوع الملف —' },
  { id: '1', label: '1 — مدني'     },
  { id: '2', label: '2 — تجاري'    },
  { id: '3', label: '3 — جنحي'     },
  { id: '4', label: '4 — جنائي'    },
  { id: '5', label: '5 — إداري'    },
  { id: '6', label: '6 — أسرة'     },
  { id: '7', label: '7 — عقاري'    },
  { id: '8', label: '8 — استئناف'  },
  { id: '9', label: '9 — نقض'      },
]

// أمثلة — صيغة رقم/نوع/سنة
const EXAMPLES = [
  { tribunal: 'tpi-casa',  annee: '2024', typeCode: '1', numero: '4521', label: '4521/1/2024 — الدار البيضاء' },
  { tribunal: 'tpi-rabat', annee: '2023', typeCode: '3', numero: '1837', label: '1837/3/2023 — الرباط'       },
  { tribunal: 'tpi-mkch',  annee: '2024', typeCode: '6', numero: '9104', label: '9104/6/2024 — مراكش'        },
]

// ─── Session storage ──────────────────────────────────────────────────────────

const SESSION_KEY = 'dossier_recent_ar'

function loadRecent() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]') } catch { return [] }
}
function saveRecent(entries) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(entries)) } catch {}
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const FIELD = [
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white',
  'outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
  'text-gray-800 placeholder-gray-400 font-[inherit]',
].join(' ')

const LABEL = 'block text-xs font-semibold text-gray-500 mb-1.5'

// ─── حالات العرض ──────────────────────────────────────────────────────────────

function IdleState() {
  return (
    <div dir="rtl" className="bg-white rounded-xl border border-gray-100 py-14 px-6 text-center"
      style={{ minHeight: 300, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div className="text-5xl mb-4" aria-hidden="true">🏛️</div>
      <h3 className="text-sm font-bold text-gray-700 mb-2">نظام تتبع الملفات القضائية</h3>
      <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
        أدخل رقم الملف والمحكمة ثم اضغط على «بحث» للاطلاع على حالة قضيتك.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5 mt-6">
        {[
          { s: 'en_cours',   dot: '#3B82F6', bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8', label: 'جارٍ'           },
          { s: 'en_attente', dot: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', label: 'في الانتظار'    },
          { s: 'juge',       dot: '#22C55E', bg: '#F0FDF4', border: '#86EFAC', text: '#15803D', label: 'صدر الحكم'      },
          { s: 'reporte',    dot: '#F97316', bg: '#FFF7ED', border: '#FDBA74', text: '#C2410C', label: 'مؤجَّل'         },
        ].map(c => (
          <span key={c.s}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div dir="rtl" className="bg-white rounded-xl border border-gray-100 p-6"
      style={{ minHeight: 300, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
        <p className="text-sm font-semibold text-gray-700">جارٍ البحث في قاعدة البيانات القضائية...</p>
      </div>
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl" />
        <div className="h-14 bg-gray-200 rounded-xl" />
        <div className="space-y-2.5">
          {[85, 70, 90, 60, 75].map((w, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded-lg" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function NotFoundState({ query, onRetry }) {
  return (
    <div dir="rtl" className="bg-white rounded-xl border border-gray-100 py-14 px-6 text-center"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)', minHeight: 280 }}>
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-base font-bold text-gray-700 mb-2">لم يُعثر على الملف</h3>
      {query && (
        <p className="text-sm text-gray-500 mb-1">
          الملف <span className="font-mono font-semibold" dir="ltr">{query}</span> غير موجود في النظام.
        </p>
      )}
      <p className="text-xs text-gray-400 max-w-xs mx-auto">تحقق من رقم الملف ونوعه وسنته والمحكمة المختارة.</p>
      {onRetry && (
        <button onClick={onRetry}
          className="mt-5 px-5 py-2 rounded-lg text-sm font-semibold text-white focus-ring"
          style={{ background: 'linear-gradient(135deg,#1E40AF,#5B21B6)' }}>
          ↺ إعادة المحاولة
        </button>
      )}
    </div>
  )
}

function ErrorState({ message, offline, onRetry }) {
  return (
    <div dir="rtl" className="rounded-xl border p-5"
      style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3' }}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{offline ? '📡' : '⚠️'}</span>
        <div>
          <h4 className="text-sm font-bold text-red-700 mb-0.5">
            {offline ? 'الخادم غير متاح' : 'خطأ في البحث'}
          </h4>
          <p className="text-xs text-red-600 leading-relaxed">{message}</p>
          {offline && (
            <p className="text-xs text-red-500 mt-1.5">
              💡 تم تفعيل البيانات المحلية تلقائياً — حاول مجدداً بالضغط على أمثلة.
            </p>
          )}
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="mt-4 px-4 py-1.5 rounded-lg text-xs font-semibold text-white focus-ring"
          style={{ background: '#DC2626' }}>
          ↺ إعادة المحاولة
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// المكوّن الرئيسي
// ─────────────────────────────────────────────────────────────────────────────

export default function CaseTracker() {
  const { lang } = useLang()

  // وضع الإدخال: 'structured' (حقول منفصلة) أو 'string' (رقم الملف الكامل)
  const [inputMode, setInputMode] = useState('structured')

  const [form, setForm] = useState({
    tribunal: '',
    annee:    String(new Date().getFullYear()),
    typeCode: '',
    numero:   '',
  })
  const [dossierString, setDossierString] = useState('')
  const [validationErr, setValidationErr] = useState(null)

  // حالة البحث
  const [phase, setPhase]       = useState('idle')   // idle|loading|result|notFound|error
  const [result, setResult]     = useState(null)
  const [errorInfo, setErrorInfo] = useState(null)
  const [lastQuery, setLastQuery] = useState('')
  const [dataSource, setDataSource] = useState(null)

  const [recent, setRecent] = useState(() => loadRecent())

  const abortRef  = useRef(null)
  const resultRef = useRef(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  // ── التحقق من المدخلات ────────────────────────────────────────────────────

  function validate() {
    if (!form.tribunal) {
      setValidationErr('يرجى اختيار المحكمة.')
      return false
    }
    if (inputMode === 'string') {
      if (!dossierString.trim()) {
        setValidationErr('يرجى إدخال رقم الملف.')
        return false
      }
      if (!/^\d{1,8}\/[1-9]\/\d{4}$/.test(dossierString.trim())) {
        setValidationErr('الصيغة غير صحيحة. المطلوب: رقم/نوع/سنة (مثال: 4521/1/2024)')
        return false
      }
    } else {
      if (!form.typeCode) { setValidationErr('يرجى اختيار نوع الملف.'); return false }
      if (!form.numero.trim()) { setValidationErr('يرجى إدخال رقم الملف.'); return false }
      if (!/^\d{1,8}$/.test(form.numero.trim())) { setValidationErr('رقم الملف يجب أن يكون أرقاماً فقط.'); return false }
      if (!form.annee) { setValidationErr('يرجى إدخال السنة.'); return false }
    }
    setValidationErr(null)
    return true
  }

  // ── تنفيذ البحث ───────────────────────────────────────────────────────────

  const executeSearch = useCallback(async (payload) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    // بناء تسمية لعرضها في السجل
    const queryLabel = payload.dossier
      ? `${payload.dossier} — ${payload.tribunal}`
      : `${payload.numero}/${payload.typeCode}/${payload.annee} — ${payload.tribunal}`

    setLastQuery(queryLabel)
    setPhase('loading')
    setResult(null)
    setErrorInfo(null)
    setDataSource(null)

    try {
      const res = await searchDossier(payload, { signal: abortRef.current.signal })

      setDataSource(res.source || null)

      if (res.success && res.dossier) {
        setResult(res.dossier)
        setPhase('result')

        // حفظ في السجل الأخير
        const entry   = { label: queryLabel, payload, timestamp: Date.now() }
        const updated = [entry, ...recent.filter(r => r.label !== queryLabel)].slice(0, 5)
        setRecent(updated)
        saveRecent(updated)

      } else if (res.found === false || !res.success) {
        setPhase('notFound')
      } else {
        setPhase('error')
        setErrorInfo({ message: res.error || 'خطأ غير متوقع.', offline: res.offline })
      }

    } catch (err) {
      if (err.name === 'AbortError') return
      setPhase('error')
      setErrorInfo({ message: err.message || 'خطأ في الاتصال.', offline: false })
    }

    // تمرير تلقائي نحو النتائج على الجوّال
    setTimeout(() => {
      if (window.innerWidth < 1024) {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }, [form, dossierString, inputMode, recent])

  function handleSubmit(e) {
    e?.preventDefault?.()
    if (!validate()) return
    const payload = inputMode === 'string'
      ? buildPayload({ tribunal: form.tribunal, dossierString })
      : buildPayload({ tribunal: form.tribunal, annee: form.annee, typeCode: form.typeCode, numero: form.numero })
    executeSearch(payload)
  }

  function applyExample(ex) {
    setForm({ tribunal: ex.tribunal, annee: ex.annee, typeCode: ex.typeCode, numero: ex.numero })
    setDossierString('')
    setInputMode('structured')
    setValidationErr(null)
    executeSearch(buildPayload({ tribunal: ex.tribunal, annee: ex.annee, typeCode: ex.typeCode, numero: ex.numero }))
  }

  const canSubmit = form.tribunal && (
    inputMode === 'string'
      ? dossierString.trim()
      : form.typeCode && form.numero.trim() && form.annee
  )

  return (
    <section className="mt-16 mb-6" aria-label="تتبع الملفات القضائية" dir="rtl">

      {/* رأس القسم */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
          🏛️ المنظومة القضائية المغربية
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">تتبع الملفات القضائية</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          تعرف على حالة ملفك القضائي ومراحل سير الإجراءات.
        </p>
      </div>

      {/* الشبكة الرئيسية */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ═══ العمود الأيمن — النموذج ═══ */}
        <div className="lg:col-span-2 space-y-4">

          {/* بطاقة البحث */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>

            {/* رأس البطاقة */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5"
              style={{ background: '#F8FAFF' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#1E40AF,#5B21B6)' }}>
                🔎
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700">البحث عن ملف قضائي</p>
              </div>

              {/* تبديل الوضع */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs flex-shrink-0">
                <button
                  onClick={() => { setInputMode('structured'); setValidationErr(null) }}
                  title="حقول منفصلة"
                  className={`px-2.5 py-1.5 font-medium transition-colors ${
                    inputMode === 'structured' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  حقول
                </button>
                <button
                  onClick={() => { setInputMode('string'); setValidationErr(null) }}
                  title="رقم الملف الكامل"
                  className={`px-2.5 py-1.5 font-medium transition-colors ${
                    inputMode === 'string' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  كامل
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>

              {/* المحكمة */}
              <div>
                <label htmlFor="ct-tribunal" className={LABEL}>
                  المحكمة <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select id="ct-tribunal" value={form.tribunal}
                    onChange={e => { setForm(f => ({ ...f, tribunal: e.target.value })); setValidationErr(null) }}
                    className={FIELD + ' appearance-none cursor-pointer pr-8'}
                    aria-required="true">
                    {TRIBUNALS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                </div>
              </div>

              {/* وضع الحقول المنفصلة */}
              {inputMode === 'structured' ? (
                <div>
                  <p className={LABEL}>
                    بيانات الملف <span className="text-red-400">*</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">

                    {/* السنة */}
                    <div>
                      <label htmlFor="ct-annee" className="block text-xs text-gray-400 mb-1.5">السنة</label>
                      <input id="ct-annee" type="number" min="1990" max="2030"
                        value={form.annee}
                        onChange={e => { setForm(f => ({ ...f, annee: e.target.value })); setValidationErr(null) }}
                        className={FIELD + ' text-center font-mono tabular-nums'}
                        placeholder="2024" aria-required="true" />
                    </div>

                    {/* نوع الملف — رقم فقط */}
                    <div>
                      <label htmlFor="ct-type" className="block text-xs text-gray-400 mb-1.5">النوع</label>
                      <div className="relative">
                        <select id="ct-type" value={form.typeCode}
                          onChange={e => { setForm(f => ({ ...f, typeCode: e.target.value })); setValidationErr(null) }}
                          className={FIELD + ' text-center font-mono font-bold appearance-none cursor-pointer px-1'}
                          aria-required="true">
                          {TYPE_CODES.map(c => <option key={c.id} value={c.id}>{c.id || '—'}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* رقم الملف */}
                    <div>
                      <label htmlFor="ct-numero" className="block text-xs text-gray-400 mb-1.5">الرقم</label>
                      <input id="ct-numero" type="text" inputMode="numeric"
                        value={form.numero}
                        onChange={e => {
                          // أرقام فقط
                          const v = e.target.value.replace(/\D/g, '')
                          setForm(f => ({ ...f, numero: v }))
                          setValidationErr(null)
                        }}
                        className={FIELD + ' text-center font-mono tabular-nums'}
                        placeholder="4521" maxLength={8} aria-required="true" />
                    </div>

                  </div>

                  {/* معاينة الصيغة */}
                  <p className="text-xs text-gray-400 mt-1.5" dir="ltr">
                    ℹ️ الصيغة:{' '}
                    <span className="font-mono font-semibold text-gray-500">
                      {form.numero || 'XXXX'}/{form.typeCode || '?'}/{form.annee || 'SSSS'}
                    </span>
                  </p>
                </div>
              ) : (
                /* وضع الرقم الكامل */
                <div>
                  <label htmlFor="ct-full" className={LABEL}>
                    رقم الملف الكامل <span className="text-red-400">*</span>
                  </label>
                  <input id="ct-full" type="text" dir="ltr"
                    value={dossierString}
                    onChange={e => { setDossierString(e.target.value); setValidationErr(null) }}
                    className={FIELD + ' font-mono'}
                    placeholder="4521/1/2024"
                    aria-required="true" />
                  <p className="text-xs text-gray-400 mt-1.5">
                    الصيغة: رقم/نوع(1-9)/سنة
                  </p>
                </div>
              )}

              {/* رسالة التحقق */}
              {validationErr && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <span>⚠️</span><span>{validationErr}</span>
                </div>
              )}

              {/* زر البحث */}
              <button type="submit"
                disabled={!canSubmit || phase === 'loading'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-white transition-all duration-150 focus-ring"
                style={{
                  background:  canSubmit ? 'linear-gradient(135deg,#1E40AF,#5B21B6)' : '#CBD5E1',
                  boxShadow:   canSubmit ? '0 4px 14px rgba(30,64,175,0.4)' : 'none',
                  cursor:      canSubmit ? 'pointer' : 'not-allowed',
                }}>
                {phase === 'loading' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جارٍ البحث...
                  </>
                ) : (
                  <><span>🔎</span> بحث</>
                )}
              </button>

            </form>
          </div>

          {/* الأمثلة */}
          <div className="bg-white rounded-xl border border-gray-100 p-4"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              أمثلة جاهزة
            </p>
            <div className="space-y-2">
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => applyExample(ex)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-right transition-colors hover:bg-blue-50 focus-ring"
                  style={{ border: '1px solid #E5E7EB' }}>
                  <span className="text-xs font-mono font-bold text-blue-700" dir="ltr">{ex.label}</span>
                  <span className="text-gray-300 text-xs flex-shrink-0">←</span>
                </button>
              ))}
            </div>
          </div>

          {/* آخر عمليات البحث */}
          {recent.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                الأخيرة
              </p>
              <div className="space-y-1.5">
                {recent.map((r, i) => (
                  <button key={i} onClick={() => executeSearch(r.payload)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-right hover:bg-gray-50 transition-colors focus-ring"
                    style={{ border: '1px solid #F3F4F6' }}>
                    <span className="text-gray-300 text-xs flex-shrink-0">🕐</span>
                    <span className="text-xs font-mono font-semibold text-gray-600 truncate" dir="ltr">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* دليل أنواع الملفات */}
          <div className="bg-white rounded-xl border border-gray-100 p-4"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              أنواع الملفات
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {TYPE_CODES.slice(1).map(c => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded text-center text-xs font-mono font-bold flex-shrink-0 flex items-center justify-center"
                    style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
                    {c.id}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {c.label.split('—')[1]?.trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ═══ العمود الأيسر — النتائج ═══ */}
        <div className="lg:col-span-3" ref={resultRef}>
          {phase === 'idle'     && <IdleState />}
          {phase === 'loading'  && <LoadingState />}
          {phase === 'result'   && result && <ResultCard dossier={result} source={dataSource} />}
          {phase === 'notFound' && <NotFoundState query={lastQuery} onRetry={handleSubmit} />}
          {phase === 'error' && errorInfo && (
            <ErrorState message={errorInfo.message} offline={errorInfo.offline} onRetry={handleSubmit} />
          )}
        </div>

      </div>

      {/* إشعار قانوني */}
      <div className="mt-8 p-3.5 rounded-xl text-center"
        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <p className="text-xs text-gray-400 leading-relaxed">
          هذا النظام يتصل بالخادم المحلي{' '}
          <span className="font-mono font-semibold text-gray-500">localhost:5000</span>.
          {' '}للتتبع الرسمي زر{' '}
          <a href="https://www.mahakim.ma" target="_blank" rel="noopener noreferrer"
            className="text-blue-600 font-semibold hover:underline">mahakim.ma</a>
        </p>
      </div>

    </section>
  )
}
