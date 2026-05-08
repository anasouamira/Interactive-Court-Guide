import { useState, useRef } from 'react'
import { useLang } from '../context/LanguageContext'

// ─── Mock data ────────────────────────────────────────────────────────────────

const TRIBUNALS = [
  { id: 'casablanca',  label: 'Tribunal de Casablanca / محكمة الدار البيضاء' },
  { id: 'rabat',       label: 'Tribunal de Rabat / محكمة الرباط' },
  { id: 'marrakech',   label: 'Tribunal de Marrakech / محكمة مراكش' },
  { id: 'fes',         label: 'Tribunal de Fès / محكمة فاس' },
  { id: 'tanger',      label: 'Tribunal de Tanger / محكمة طنجة' },
  { id: 'agadir',      label: 'Tribunal de Agadir / محكمة أكادير' },
  { id: 'meknes',      label: 'Tribunal de Meknès / محكمة مكناس' },
  { id: 'oujda',       label: 'Tribunal de Oujda / محكمة وجدة' },
]

const CASE_TYPES = [
  { id: '',          label: 'Tous types / كل الأنواع' },
  { id: 'civil',     label: 'Civil / مدني' },
  { id: 'penal',     label: 'Pénal / جنائي' },
  { id: 'commercial',label: 'Commercial / تجاري' },
  { id: 'famille',   label: 'Famille / أسرة' },
  { id: 'admin',     label: 'Administratif / إداري' },
]

const EXAMPLE_CASES = [
  { number: '4521', year: '2024', tribunal: 'casablanca', type: 'civil' },
  { number: '1837', year: '2023', tribunal: 'rabat',      type: 'penal' },
  { number: '9104', year: '2024', tribunal: 'marrakech',  type: 'famille' },
]

const MOCK_RESULTS = {
  '4521-2024-casablanca': {
    ref:       'N° 4521/2024 — رقم 4521/2024',
    tribunal:  'Tribunal de Première Instance de Casablanca',
    tribunalAr:'محكمة الابتدائية بالدار البيضاء',
    type:      'Civil / مدني',
    status:    'active',
    statusLabel: 'En cours / جارٍ',
    plaintiff:  'Mohamed Alaoui / محمد العلوي',
    defendant:  'Société Immo SA',
    lastUpdate: '14 mai 2025 / 14 ماي 2025',
    nextHearing:'22 juin 2025 / 22 يونيو 2025',
    judge:      'M. Hassan Benali / الأستاذ حسن بنعلي',
    chamber:    'Chambre 3 / الغرفة 3',
    timeline: [
      { id: 1, label: 'Dépôt de la plainte', labelAr: 'إيداع الشكوى',       date: '15 jan. 2024', done: true },
      { id: 2, label: 'Enregistrement du dossier', labelAr: 'تسجيل الملف',  date: '18 jan. 2024', done: true },
      { id: 3, label: '1ère audience',        labelAr: 'الجلسة الأولى',      date: '20 mar. 2024', done: true },
      { id: 4, label: 'Expertise ordonnée',   labelAr: 'أمر بالخبرة',        date: '15 mai 2024',  done: true },
      { id: 5, label: 'Dépôt rapport expert', labelAr: 'إيداع تقرير الخبير', date: '10 jan. 2025', done: true },
      { id: 6, label: 'Audience en cours',    labelAr: 'الجلسة الجارية',     date: '22 juin 2025', done: false, current: true },
      { id: 7, label: 'Jugement',             labelAr: 'صدور الحكم',          date: '—',            done: false },
    ],
  },
  '1837-2023-rabat': {
    ref:       'N° 1837/2023 — رقم 1837/2023',
    tribunal:  'Tribunal de Première Instance de Rabat',
    tribunalAr:'المحكمة الابتدائية بالرباط',
    type:      'Pénal / جنائي',
    status:    'closed',
    statusLabel: 'Jugement rendu / صدر الحكم',
    plaintiff:  'Ministère Public / النيابة العامة',
    defendant:  'Khalid Rami / خالد رامي',
    lastUpdate: '03 avril 2025 / 03 أبريل 2025',
    nextHearing: '—',
    judge:      'Mme. Fatima Chraibi / الأستاذة فاطمة الشرايبي',
    chamber:    'Chambre Correctionnelle / الغرفة الجنحية',
    timeline: [
      { id: 1, label: 'Plainte déposée',       labelAr: 'إيداع الشكوى',        date: '05 fév. 2023', done: true },
      { id: 2, label: 'Enregistrement',         labelAr: 'تسجيل الملف',         date: '07 fév. 2023', done: true },
      { id: 3, label: 'Instruction ouverte',    labelAr: 'فتح التحقيق',          date: '20 mar. 2023', done: true },
      { id: 4, label: 'Renvoi en jugement',     labelAr: 'الإحالة للمحاكمة',    date: '10 oct. 2023', done: true },
      { id: 5, label: 'Audience principale',    labelAr: 'الجلسة الرئيسية',     date: '15 jan. 2025', done: true },
      { id: 6, label: 'Jugement rendu',         labelAr: 'صدور الحكم',           date: '03 avr. 2025', done: true },
    ],
  },
  '9104-2024-marrakech': {
    ref:       'N° 9104/2024 — رقم 9104/2024',
    tribunal:  'Section de la Famille — Marrakech',
    tribunalAr:'قسم قضاء الأسرة — مراكش',
    type:      'Famille / أسرة',
    status:    'pending',
    statusLabel: 'En attente / في الانتظار',
    plaintiff:  'Nadia El Fassi / نادية الفاسي',
    defendant:  'Youssef El Fassi / يوسف الفاسي',
    lastUpdate: '28 avril 2025 / 28 أبريل 2025',
    nextHearing:'10 juillet 2025 / 10 يوليوز 2025',
    judge:      'M. Driss Ouali / الأستاذ إدريس وعلي',
    chamber:    'Section Famille / قسم الأسرة',
    timeline: [
      { id: 1, label: 'Demande de divorce',     labelAr: 'طلب الطلاق',           date: '10 jan. 2024', done: true },
      { id: 2, label: 'Enregistrement',         labelAr: 'تسجيل الملف',           date: '12 jan. 2024', done: true },
      { id: 3, label: 'Tentative de conciliation', labelAr: 'جلسة الصلح',        date: '15 mar. 2024', done: true },
      { id: 4, label: 'Expertise sociale',      labelAr: 'خبرة اجتماعية',         date: '20 nov. 2024', done: true },
      { id: 5, label: 'Audience fixée',         labelAr: 'تحديد جلسة',            date: '10 juil. 2025', done: false, current: true },
      { id: 6, label: 'Jugement',               labelAr: 'صدور الحكم',             date: '—',            done: false },
    ],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  active:  { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D', dot: '#22C55E' },
  pending: { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', dot: '#F59E0B' },
  closed:  { bg: '#FFF1F2', border: '#FDA4AF', text: '#BE123C', dot: '#F43F5E' },
}

const INPUT_CLS =
  'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-[inherit] ' +
  'outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 ' +
  'bg-white text-text-main placeholder-gray-400'

const LABEL_CLS = 'block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide'

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px bg-gray-100" />
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
      />
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

function FieldIcon({ children }) {
  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none select-none">
      {children}
    </span>
  )
}

function StatusBadge({ status, label }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, border: `1.5px solid ${s.border}`, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {label}
    </span>
  )
}

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      {[80, 60, 100, 70, 90].map((w, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded-lg" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

function Timeline({ steps }) {
  return (
    <ol className="relative" aria-label="Timeline du dossier">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <li key={step.id} className="flex gap-4 pb-0">
            {/* Line + dot column */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10"
                style={{
                  background: step.done
                    ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                    : step.current
                    ? 'linear-gradient(135deg, #3B82F6, #6366F1)'
                    : '#E5E7EB',
                  color: step.done || step.current ? '#fff' : '#9CA3AF',
                  boxShadow: step.current ? '0 0 0 3px rgba(59,130,246,0.2)' : 'none',
                }}
              >
                {step.done ? '✓' : step.current ? '●' : i + 1}
              </div>
              {!isLast && (
                <div
                  className="w-0.5 flex-1 mt-1"
                  style={{
                    background: step.done
                      ? 'linear-gradient(180deg, #22C55E, #86EFAC)'
                      : '#E5E7EB',
                    minHeight: 28,
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-5 ${isLast ? '' : ''}`}>
              <p
                className="text-sm font-semibold leading-snug"
                style={{ color: step.done ? '#15803D' : step.current ? '#1D4ED8' : '#9CA3AF' }}
              >
                {step.label}
                <span className="font-normal text-gray-400 mx-1">/</span>
                <span className="font-normal" style={{ color: step.done ? '#16A34A' : step.current ? '#3B82F6' : '#9CA3AF' }}>
                  {step.labelAr}
                </span>
              </p>
              <p className="text-xs text-muted mt-0.5">{step.date}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-base flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted font-medium">{label}</p>
        <p className="text-sm text-text-main font-semibold break-words">{value}</p>
      </div>
    </div>
  )
}

function EmptyState({ query }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-5xl mb-4" aria-hidden="true">🔍</div>
      <h3 className="text-base font-semibold text-text-main mb-1">
        Aucun dossier trouvé / لم يُعثر على ملف
      </h3>
      <p className="text-sm text-muted max-w-xs mx-auto">
        Le dossier <span className="font-semibold text-text-main">N° {query}</span> n'existe pas
        dans notre système. Vérifiez le numéro et l'année.
        <br />
        <span className="text-xs mt-1 block">
          لم نجد الملف رقم {query}. تحقق من الرقم والسنة.
        </span>
      </p>
      <div
        className="mt-4 inline-block px-4 py-2 rounded-xl text-xs font-medium"
        style={{ background: '#EFF6FF', color: '#1D4ED8' }}
      >
        💡 Essayez un des exemples ci-dessous / جرّب أحد الأمثلة أسفله
      </div>
    </div>
  )
}

function ResultCard({ result }) {
  const s = STATUS_STYLES[result.status] || STATUS_STYLES.pending

  return (
    <div className="space-y-5 fade-in-up">
      {/* Case header */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)',
          boxShadow: '0 8px 32px rgba(29,78,216,0.25)',
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-white/70 text-xs font-medium mb-0.5">Référence / المرجع</p>
            <p className="text-white font-bold text-base leading-snug">{result.ref}</p>
          </div>
          <StatusBadge status={result.status} label={result.statusLabel} />
        </div>
        <SectionDivider />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <p className="text-white/60 text-xs">Tribunal</p>
            <p className="text-white text-xs font-semibold leading-snug mt-0.5">{result.tribunal}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">النوع / Type</p>
            <p className="text-white text-xs font-semibold mt-0.5">{result.type}</p>
          </div>
        </div>
      </div>

      {/* Status highlight */}
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{ background: s.bg, border: `1.5px solid ${s.border}` }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
          style={{ background: s.border }}>
          {result.status === 'active' ? '⚖️' : result.status === 'closed' ? '✅' : '⏳'}
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: s.text }}>Statut / الحالة</p>
          <p className="font-bold text-sm" style={{ color: s.text }}>{result.statusLabel}</p>
          {result.nextHearing !== '—' && (
            <p className="text-xs mt-0.5" style={{ color: s.text }}>
              Prochaine audience / الجلسة القادمة: <strong>{result.nextHearing}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div
        className="rounded-2xl p-4"
        style={{ background: '#fff', boxShadow: '0 2px 12px rgba(37,99,235,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
      >
        <h4 className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
          Détails / التفاصيل
        </h4>
        <InfoRow icon="👤" label="Plaignant / المدّعي"       value={result.plaintiff} />
        <InfoRow icon="🏢" label="Défendeur / المدّعى عليه"  value={result.defendant} />
        <InfoRow icon="👨‍⚖️" label="Juge / القاضي"            value={result.judge} />
        <InfoRow icon="🏛️" label="Chambre / الغرفة"          value={result.chamber} />
        <InfoRow icon="📅" label="Dernière MàJ / آخر تحديث"  value={result.lastUpdate} />
      </div>

      {/* Timeline */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#fff', boxShadow: '0 2px 12px rgba(37,99,235,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
      >
        <h4 className="text-xs font-bold text-muted uppercase tracking-wide mb-4">
          Chronologie / المسار الزمني
        </h4>
        <Timeline steps={result.timeline} />
      </div>
    </div>
  )
}

// ─── Main CaseTracker component ───────────────────────────────────────────────

export default function CaseTracker() {
  const { lang } = useLang()

  const [form, setForm] = useState({ number: '', year: new Date().getFullYear().toString(), tribunal: '', type: '' })
  const [phase, setPhase] = useState('idle') // idle | loading | result | empty
  const [result, setResult] = useState(null)
  const [recentSearches, setRecentSearches] = useState([])
  const [queryLabel, setQueryLabel] = useState('')
  const resultsRef = useRef(null)

  const isRtl = lang === 'ar' || lang === 'ma'

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function runSearch({ number, year, tribunal }) {
    const key = `${number}-${year}-${tribunal}`
    const label = `N° ${number}/${year}`
    setQueryLabel(label)
    setPhase('loading')

    setTimeout(() => {
      const found = MOCK_RESULTS[key] || null
      setResult(found)
      setPhase(found ? 'result' : 'empty')
      // Add to recent searches
      setRecentSearches(prev => {
        const entry = { key, label, tribunal, type: found?.type || '—' }
        const filtered = prev.filter(s => s.key !== key)
        return [entry, ...filtered].slice(0, 4)
      })
      // Scroll to results on mobile
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }, 1400)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.number.trim() || !form.tribunal) return
    runSearch(form)
  }

  function applyExample(ex) {
    setForm({ number: ex.number, year: ex.year, tribunal: ex.tribunal, type: ex.type })
    runSearch(ex)
  }

  const canSearch = form.number.trim() && form.tribunal

  return (
    <section
      className="mt-16 mb-8"
      aria-label="Suivi des dossiers judiciaires"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Section header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
        >
          🏛️ Système judiciaire marocain / المنظومة القضائية المغربية
        </div>
        <h2 className="text-2xl font-bold text-text-main mb-2">
          Suivi des Dossiers Judiciaires
        </h2>
        <p className="text-base font-semibold text-muted" dir="rtl">
          تتبع الملفات القضائية
        </p>
        <p className="text-sm text-muted mt-2 max-w-lg mx-auto">
          Consultez l'état d'avancement de votre dossier judiciaire.
          <span className="block text-xs mt-0.5" dir="rtl">
            تعرف على حالة ملفك القضائي ومراحل سير الإجراءات.
          </span>
        </p>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start" dir="ltr">

        {/* ── LEFT: Search panel ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Search card */}
          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: '0 4px 24px rgba(37,99,235,0.08)', border: '1.5px solid rgba(255,255,255,0.9)' }}
          >
            {/* Card header */}
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff' }}
              >
                🔎
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main">Rechercher un dossier</h3>
                <p className="text-xs text-muted" dir="rtl">البحث عن ملف قضائي</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Case number */}
              <div>
                <label htmlFor="case-number" className={LABEL_CLS}>
                  <span>Numéro du dossier</span>
                  <span className="mr-1 font-normal text-muted normal-case tracking-normal" dir="rtl"> / رقم الملف</span>
                </label>
                <div className="relative">
                  <input
                    id="case-number"
                    name="number"
                    type="text"
                    inputMode="numeric"
                    value={form.number}
                    onChange={handleChange}
                    placeholder="ex: 4521"
                    className={INPUT_CLS}
                    autoComplete="off"
                    aria-required="true"
                  />
                  <FieldIcon>📌</FieldIcon>
                </div>
              </div>

              {/* Year */}
              <div>
                <label htmlFor="case-year" className={LABEL_CLS}>
                  Année / السنة
                </label>
                <div className="relative">
                  <select
                    id="case-year"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    className={INPUT_CLS + ' appearance-none pr-9 cursor-pointer'}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <FieldIcon>📅</FieldIcon>
                </div>
              </div>

              {/* Tribunal */}
              <div>
                <label htmlFor="case-tribunal" className={LABEL_CLS}>
                  Tribunal <span className="font-normal text-muted normal-case tracking-normal" dir="rtl">/ المحكمة</span>
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    id="case-tribunal"
                    name="tribunal"
                    value={form.tribunal}
                    onChange={handleChange}
                    className={INPUT_CLS + ' appearance-none pr-9 cursor-pointer'}
                    aria-required="true"
                  >
                    <option value="">— Sélectionner / اختر المحكمة —</option>
                    {TRIBUNALS.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <FieldIcon>🏛️</FieldIcon>
                </div>
              </div>

              {/* Case type */}
              <div>
                <label htmlFor="case-type" className={LABEL_CLS}>
                  Type d'affaire <span className="font-normal text-muted normal-case tracking-normal" dir="rtl">/ نوع القضية</span>
                  <span className="text-gray-400 ml-1 text-xs font-normal normal-case">(optionnel)</span>
                </label>
                <div className="relative">
                  <select
                    id="case-type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={INPUT_CLS + ' appearance-none pr-9 cursor-pointer'}
                  >
                    {CASE_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <FieldIcon>📋</FieldIcon>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSearch || phase === 'loading'}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: canSearch
                    ? 'linear-gradient(135deg, #2563EB, #7C3AED)'
                    : '#D1D5DB',
                  boxShadow: canSearch ? '0 4px 16px rgba(37,99,235,0.35)' : 'none',
                }}
                aria-label="Rechercher le dossier"
              >
                {phase === 'loading' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    🔎 Rechercher / بحث
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Example cases */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ boxShadow: '0 2px 12px rgba(37,99,235,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-3">
              Exemples / أمثلة
            </p>
            <div className="space-y-2">
              {EXAMPLE_CASES.map(ex => (
                <button
                  key={ex.number}
                  onClick={() => applyExample(ex)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-blue-50 group focus-ring"
                  style={{ border: '1px solid #E5E7EB' }}
                >
                  <div>
                    <span className="text-xs font-bold text-primary">N° {ex.number}/{ex.year}</span>
                    <span className="text-xs text-muted ml-2">
                      {TRIBUNALS.find(t => t.id === ex.tribunal)?.label.split('/')[0].trim()}
                    </span>
                  </div>
                  <span className="text-xs text-muted group-hover:text-primary transition-colors">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div
              className="bg-white rounded-2xl p-4"
              style={{ boxShadow: '0 2px 12px rgba(37,99,235,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
            >
              <p className="text-xs font-bold text-muted uppercase tracking-wide mb-3">
                Récents / الأخيرة
              </p>
              <div className="space-y-2">
                {recentSearches.map(s => (
                  <div
                    key={s.key}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}
                  >
                    <span className="text-xs" aria-hidden="true">🕐</span>
                    <span className="text-xs font-semibold text-text-main">{s.label}</span>
                    {s.type !== '—' && (
                      <span className="text-xs text-muted ml-auto">{s.type.split('/')[0].trim()}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Results panel ── */}
        <div className="lg:col-span-3" ref={resultsRef}>
          {phase === 'idle' && (
            <div
              className="bg-white rounded-2xl p-10 text-center"
              style={{ boxShadow: '0 2px 12px rgba(37,99,235,0.06)', border: '1px solid rgba(0,0,0,0.04)', minHeight: 340 }}
            >
              <div className="text-6xl mb-5" aria-hidden="true">🏛️</div>
              <h3 className="text-base font-bold text-text-main mb-2">
                Système de suivi judiciaire
              </h3>
              <p className="text-sm text-muted max-w-xs mx-auto mb-1">
                Entrez le numéro de votre dossier et sélectionnez le tribunal pour consulter l'état de votre affaire.
              </p>
              <p className="text-xs text-muted max-w-xs mx-auto" dir="rtl">
                أدخل رقم ملفك واختر المحكمة للاطلاع على حالة قضيتك.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {['En cours ⚖️', 'En attente ⏳', 'Jugement rendu ✅'].map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium text-muted"
                    style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {phase === 'loading' && (
            <div
              className="bg-white rounded-2xl p-8"
              style={{ boxShadow: '0 2px 12px rgba(37,99,235,0.06)', border: '1px solid rgba(0,0,0,0.04)', minHeight: 340 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-text-main">Recherche en cours...</p>
                  <p className="text-xs text-muted" dir="rtl">جارٍ البحث في قاعدة البيانات...</p>
                </div>
              </div>
              <SkeletonLoader />
              <div className="mt-6 space-y-3">
                <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
                <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          )}

          {phase === 'result' && result && (
            <ResultCard result={result} />
          )}

          {phase === 'empty' && (
            <div
              className="bg-white rounded-2xl"
              style={{ boxShadow: '0 2px 12px rgba(37,99,235,0.06)', border: '1px solid rgba(0,0,0,0.04)', minHeight: 340 }}
            >
              <EmptyState query={queryLabel} />
            </div>
          )}
        </div>
      </div>

      {/* Legal disclaimer */}
      <p
        className="text-center text-xs text-muted mt-8 max-w-lg mx-auto"
        style={{ lineHeight: 1.7 }}
      >
        ⚠️ Ce système affiche des données simulées à titre illustratif uniquement.
        <span className="block" dir="rtl">
          هذا النظام يعرض بيانات تجريبية للأغراض التوضيحية فقط.
        </span>
        Pour accéder aux données réelles, consultez{' '}
        <span className="text-primary font-medium">justice.gov.ma</span>
      </p>
    </section>
  )
}
