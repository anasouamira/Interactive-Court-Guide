import { useState, useRef } from 'react'
import { useLang } from '../context/LanguageContext'

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — mirrors real Mahakim data structures
// ─────────────────────────────────────────────────────────────────────────────

const TRIBUNALS = [
  { id: '',         label: '— Sélectionner le tribunal / اختر المحكمة —', labelAr: '' },
  { id: 'tpi-casa', label: 'Tribunal de 1ère Instance de Casablanca',      labelAr: 'المحكمة الابتدائية بالدار البيضاء' },
  { id: 'tpi-rabat',label: 'Tribunal de 1ère Instance de Rabat',           labelAr: 'المحكمة الابتدائية بالرباط' },
  { id: 'tpi-mkch', label: 'Tribunal de 1ère Instance de Marrakech',       labelAr: 'المحكمة الابتدائية بمراكش' },
  { id: 'tpi-fes',  label: 'Tribunal de 1ère Instance de Fès',             labelAr: 'المحكمة الابتدائية بفاس' },
  { id: 'tpi-tng',  label: 'Tribunal de 1ère Instance de Tanger',          labelAr: 'المحكمة الابتدائية بطنجة' },
  { id: 'tpi-agd',  label: 'Tribunal de 1ère Instance d\'Agadir',          labelAr: 'المحكمة الابتدائية بأكادير' },
  { id: 'tpi-mek',  label: 'Tribunal de 1ère Instance de Meknès',          labelAr: 'المحكمة الابتدائية بمكناس' },
  { id: 'tpi-ouj',  label: 'Tribunal de 1ère Instance d\'Oujda',           labelAr: 'المحكمة الابتدائية بوجدة' },
  { id: 'ca-casa',  label: 'Cour d\'Appel de Casablanca',                  labelAr: 'محكمة الاستئناف بالدار البيضاء' },
  { id: 'ca-rabat', label: 'Cour d\'Appel de Rabat',                       labelAr: 'محكمة الاستئناف بالرباط' },
  { id: 'ca-mkch',  label: 'Cour d\'Appel de Marrakech',                   labelAr: 'محكمة الاستئناف بمراكش' },
  { id: 'ca-fes',   label: 'Cour d\'Appel de Fès',                         labelAr: 'محكمة الاستئناف بفاس' },
  { id: 'tcom-casa',label: 'Tribunal de Commerce de Casablanca',           labelAr: 'المحكمة التجارية بالدار البيضاء' },
  { id: 'tadm-rabat',label:'Tribunal Administratif de Rabat',              labelAr: 'المحكمة الإدارية بالرباط' },
]

// Case codes as used in Mahakim (رمز النوع)
const CASE_CODES = [
  { id: '',    label: '— Code —' },
  { id: 'A',   label: 'A — مدني عام' },
  { id: 'B',   label: 'B — تجاري' },
  { id: 'C',   label: 'C — جنحي' },
  { id: 'D',   label: 'D — جنائي' },
  { id: 'E',   label: 'E — إداري' },
  { id: 'F',   label: 'F — أسرة' },
  { id: 'G',   label: 'G — عقاري' },
  { id: 'H',   label: 'H — استئناف' },
  { id: 'I',   label: 'I — نقض' },
]

// Example cases using exact 3-field structure: year / code / number
const EXAMPLES = [
  { year: '2024', code: 'A', number: '4521', tribunal: 'tpi-casa' },
  { year: '2023', code: 'C', number: '1837', tribunal: 'tpi-rabat' },
  { year: '2024', code: 'F', number: '9104', tribunal: 'tpi-mkch' },
]

// ─── Mock result database keyed by year-code-number-tribunal ─────────────────
const MOCK_DB = {
  '2024-A-4521-tpi-casa': {
    ref:         '4521/A/2024',
    refAr:       '4521/أ/2024',
    tribunal:    'Tribunal de 1ère Instance de Casablanca',
    tribunalAr:  'المحكمة الابتدائية بالدار البيضاء',
    type:        'Civil — مدني',
    status:      'active',
    statusFr:    'En cours',
    statusAr:    'جارٍ',
    chambre:     'Chambre civile n° 3 / الغرفة المدنية 3',
    juge:        'M. Hassan Benali / الأستاذ حسن بنعلي',
    plaintiff:   'Alaoui Mohamed Amine',
    plaintiffAr: 'العلوي محمد أمين',
    defendant:   'Société IMMO CASA SA',
    defendantAr: 'شركة إيمو كازا',
    lastUpdate:  '14/05/2025',
    nextHearing: '22/06/2025',
    timeline: [
      { fr: 'Dépôt de la requête',       ar: 'إيداع المقال',              date: '15/01/2024', done: true  },
      { fr: 'Enregistrement du dossier', ar: 'تسجيل الملف',              date: '18/01/2024', done: true  },
      { fr: '1ère audience',             ar: 'الجلسة الأولى',             date: '20/03/2024', done: true  },
      { fr: 'Expertise ordonnée',        ar: 'الأمر بالخبرة',             date: '15/05/2024', done: true  },
      { fr: 'Rapport d\'expertise',      ar: 'إيداع تقرير الخبير',        date: '10/01/2025', done: true  },
      { fr: 'Audience en délibéré',      ar: 'جلسة المداولة',             date: '22/06/2025', done: false, current: true },
      { fr: 'Prononcé du jugement',      ar: 'النطق بالحكم',              date: '—',          done: false },
    ],
  },
  '2023-C-1837-tpi-rabat': {
    ref:         '1837/C/2023',
    refAr:       '1837/ج/2023',
    tribunal:    'Tribunal de 1ère Instance de Rabat',
    tribunalAr:  'المحكمة الابتدائية بالرباط',
    type:        'Correctionnel — جنحي',
    status:      'closed',
    statusFr:    'Jugement rendu',
    statusAr:    'صدر الحكم',
    chambre:     'Chambre correctionnelle n° 1 / الغرفة الجنحية 1',
    juge:        'Mme. Fatima Chraibi / الأستاذة فاطمة الشرايبي',
    plaintiff:   'Ministère Public',
    plaintiffAr: 'النيابة العامة',
    defendant:   'Khalid Rami',
    defendantAr: 'خالد رامي',
    lastUpdate:  '03/04/2025',
    nextHearing: '—',
    timeline: [
      { fr: 'Saisine du parquet',        ar: 'إحالة النيابة العامة',      date: '05/02/2023', done: true },
      { fr: 'Ouverture de l\'instruction', ar: 'فتح التحقيق',            date: '20/03/2023', done: true },
      { fr: 'Renvoi en jugement',        ar: 'الإحالة للمحاكمة',         date: '10/10/2023', done: true },
      { fr: 'Audience principale',       ar: 'الجلسة الرئيسية',          date: '15/01/2025', done: true },
      { fr: 'Plaidoiries',               ar: 'المرافعات',                date: '20/02/2025', done: true },
      { fr: 'Jugement rendu',            ar: 'النطق بالحكم',             date: '03/04/2025', done: true },
    ],
  },
  '2024-F-9104-tpi-mkch': {
    ref:         '9104/F/2024',
    refAr:       '9104/و/2024',
    tribunal:    'Section de la Famille — Marrakech',
    tribunalAr:  'قسم قضاء الأسرة — مراكش',
    type:        'Famille — أسرة',
    status:      'pending',
    statusFr:    'En attente',
    statusAr:    'في الانتظار',
    chambre:     'Section Famille / قسم الأسرة',
    juge:        'M. Driss Ouali / الأستاذ إدريس وعلي',
    plaintiff:   'Nadia El Fassi',
    plaintiffAr: 'نادية الفاسي',
    defendant:   'Youssef El Fassi',
    defendantAr: 'يوسف الفاسي',
    lastUpdate:  '28/04/2025',
    nextHearing: '10/07/2025',
    timeline: [
      { fr: 'Dépôt de la demande',      ar: 'إيداع الطلب',               date: '10/01/2024', done: true  },
      { fr: 'Enregistrement',           ar: 'التسجيل',                   date: '12/01/2024', done: true  },
      { fr: 'Tentative de conciliation',ar: 'محاولة الصلح',              date: '15/03/2024', done: true  },
      { fr: 'Expertise sociale',        ar: 'الخبرة الاجتماعية',         date: '20/11/2024', done: true  },
      { fr: 'Fixation d\'audience',     ar: 'تحديد الجلسة',              date: '10/07/2025', done: false, current: true },
      { fr: 'Jugement',                 ar: 'الحكم',                     date: '—',          done: false },
    ],
  },
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS = {
  active:  { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D', dot: '#22C55E',  icon: '⚖️' },
  pending: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#F59E0B',  icon: '⏳' },
  closed:  { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', dot: '#F43F5E',  icon: '✅' },
}

const FIELD_CLS =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white ' +
  'outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ' +
  'text-gray-800 placeholder-gray-400 font-[inherit]'

const LABEL_CLS = 'block text-xs font-semibold text-gray-500 mb-1'

// ─── Primitive components ─────────────────────────────────────────────────────

function Divider() {
  return <div className="border-t border-gray-100 my-4" />
}

function Badge({ status, fr, ar }) {
  const s = STATUS[status] || STATUS.pending
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
      style={{ background: s.bg, border: `1.5px solid ${s.border}`, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
        style={{ background: s.dot }} />
      {fr} / {ar}
    </span>
  )
}

function SkeletonRow({ w = '100%' }) {
  return <div className="h-3.5 bg-gray-200 rounded animate-pulse" style={{ width: w }} />
}

function SkeletonBlock() {
  return (
    <div className="space-y-3 p-5 bg-white rounded-xl border border-gray-100">
      <SkeletonRow w="60%" />
      <SkeletonRow w="80%" />
      <SkeletonRow w="45%" />
    </div>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ steps }) {
  return (
    <div className="relative">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const isDone = step.done
        const isCurrent = step.current

        const dotColor = isDone
          ? '#22C55E'
          : isCurrent
          ? '#2563EB'
          : '#D1D5DB'

        const lineColor = isDone ? '#86EFAC' : '#E5E7EB'

        return (
          <div key={i} className="flex gap-3.5">
            {/* Dot + line */}
            <div className="flex flex-col items-center" style={{ width: 24, flexShrink: 0 }}>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0 z-10"
                style={{
                  background: dotColor,
                  fontSize: 10,
                  fontWeight: 700,
                  boxShadow: isCurrent ? `0 0 0 3px ${dotColor}33` : 'none',
                }}
              >
                {isDone ? '✓' : isCurrent ? '◉' : i + 1}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 mt-1" style={{ background: lineColor, minHeight: 24 }} />
              )}
            </div>

            {/* Text */}
            <div className={`pb-5 min-w-0 flex-1 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex flex-wrap items-baseline gap-x-1.5">
                <span
                  className="text-sm font-semibold leading-snug"
                  style={{ color: isDone ? '#15803D' : isCurrent ? '#1D4ED8' : '#9CA3AF' }}
                >
                  {step.fr}
                </span>
                <span className="text-gray-300 text-xs">/</span>
                <span
                  className="text-xs"
                  style={{ color: isDone ? '#16A34A' : isCurrent ? '#3B82F6' : '#9CA3AF' }}
                  dir="rtl"
                >
                  {step.ar}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 tabular-nums">{step.date}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ labelFr, labelAr, value, valueAr }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="sm:w-40 flex-shrink-0">
        <span className="text-xs text-gray-400 font-medium">{labelFr}</span>
        <span className="text-gray-300 mx-1 text-xs">/</span>
        <span className="text-xs text-gray-400" dir="rtl">{labelAr}</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-gray-800 break-words">{value}</span>
        {valueAr && (
          <>
            <span className="text-gray-300 mx-1.5 text-xs">/</span>
            <span className="text-sm text-gray-600 break-words" dir="rtl">{valueAr}</span>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ data }) {
  const s = STATUS[data.status] || STATUS.pending

  return (
    <div className="space-y-4 fade-in-up">

      {/* ── Case header ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ boxShadow: '0 4px 20px rgba(29,78,216,0.18)' }}
      >
        {/* Header bar */}
        <div
          className="px-5 py-4"
          style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #5B21B6 100%)' }}
        >
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-white/60 text-xs font-medium mb-0.5">
                Réf. dossier / رقم الملف
              </p>
              <p className="text-white text-lg font-bold tracking-wide font-mono">
                {data.ref}
              </p>
              <p className="text-white/50 text-xs font-mono mt-0.5" dir="rtl">
                {data.refAr}
              </p>
            </div>
            <Badge status={data.status} fr={data.statusFr} ar={data.statusAr} />
          </div>
        </div>

        {/* Sub-header */}
        <div className="bg-blue-950/5 border-t border-blue-100 px-5 py-3 flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <p className="text-xs text-gray-400">Tribunal</p>
            <p className="text-xs font-semibold text-gray-700">{data.tribunal}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Type</p>
            <p className="text-xs font-semibold text-gray-700">{data.type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Chambre / الغرفة</p>
            <p className="text-xs font-semibold text-gray-700">{data.chambre}</p>
          </div>
        </div>
      </div>

      {/* ── Status box ── */}
      <div
        className="rounded-xl p-4 flex items-center gap-4"
        style={{
          background: s.bg,
          border: `1.5px solid ${s.border}`,
        }}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: s.border }}
        >
          {s.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium" style={{ color: s.text }}>
            Statut actuel / الحالة الراهنة
          </p>
          <p className="font-bold text-sm" style={{ color: s.text }}>
            {data.statusFr} — <span dir="rtl">{data.statusAr}</span>
          </p>
          {data.nextHearing !== '—' && (
            <p className="text-xs mt-0.5" style={{ color: s.text }}>
              Prochaine audience / الجلسة القادمة :{' '}
              <strong className="tabular-nums">{data.nextHearing}</strong>
            </p>
          )}
        </div>
      </div>

      {/* ── Details table ── */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-3"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Parties & Informations / الأطراف والمعلومات
        </h4>
        <DetailRow
          labelFr="Demandeur" labelAr="المدّعي"
          value={data.plaintiff} valueAr={data.plaintiffAr}
        />
        <DetailRow
          labelFr="Défendeur" labelAr="المدّعى عليه"
          value={data.defendant} valueAr={data.defendantAr}
        />
        <DetailRow
          labelFr="Juge" labelAr="القاضي"
          value={data.juge}
        />
        <DetailRow
          labelFr="Dernière MàJ" labelAr="آخر تحديث"
          value={data.lastUpdate}
        />
        {data.nextHearing !== '—' && (
          <DetailRow
            labelFr="Prochaine audience" labelAr="الجلسة القادمة"
            value={data.nextHearing}
          />
        )}
      </div>

      {/* ── Timeline ── */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Historique du dossier / مسار الملف
        </h4>
        <Timeline steps={data.timeline} />
      </div>

    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ year, code, number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 py-14 px-6 text-center"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-base font-bold text-gray-700 mb-2">
        Dossier introuvable / لم يُعثر على الملف
      </h3>
      <p className="text-sm text-gray-400 max-w-sm mx-auto">
        Le dossier <span className="font-mono font-semibold text-gray-600">{number}/{code}/{year}</span> n'a pas été trouvé.
        <br />
        Vérifiez l'année, le code et le numéro.
      </p>
      <p className="text-xs text-gray-400 mt-2" dir="rtl">
        لم يُعثر على الملف رقم {number}/{code}/{year}. تحقق من السنة والرمز والرقم.
      </p>
      <div
        className="mt-5 inline-block px-4 py-2 rounded-lg text-xs font-medium"
        style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
      >
        💡 Essayez les exemples ci-dessous / جرّب أحد الأمثلة أسفله
      </div>
    </div>
  )
}

// ─── Idle placeholder ─────────────────────────────────────────────────────────

function IdleState() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 py-14 px-6 text-center"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)', minHeight: 320 }}>
      <div className="text-5xl mb-4">🏛️</div>
      <h3 className="text-sm font-bold text-gray-700 mb-1">
        Système de suivi judiciaire
      </h3>
      <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
        Renseignez les informations du dossier dans le formulaire et cliquez sur «&nbsp;Rechercher&nbsp;» pour consulter son état.
      </p>
      <p className="text-xs text-gray-400 max-w-xs mx-auto mt-2 leading-relaxed" dir="rtl">
        أدخل معلومات الملف في النموذج ثم انقر على «بحث» للاطلاع على حالته.
      </p>

      <Divider />

      {/* Statut legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {[
          { status: 'active',  fr: 'En cours',        ar: 'جارٍ' },
          { status: 'pending', fr: 'En attente',       ar: 'في الانتظار' },
          { status: 'closed',  fr: 'Jugement rendu',   ar: 'صدر الحكم' },
        ].map(s => (
          <span key={s.status}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium"
            style={{
              background: STATUS[s.status].bg,
              border: `1px solid ${STATUS[s.status].border}`,
              color: STATUS[s.status].text,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS[s.status].dot }} />
            {s.fr} / <span dir="rtl">{s.ar}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)', minHeight: 320 }}>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-700">Recherche en cours...</p>
          <p className="text-xs text-gray-400" dir="rtl">جارٍ البحث في قاعدة البيانات القضائية...</p>
        </div>
      </div>
      <div className="space-y-4">
        <SkeletonBlock />
        <SkeletonBlock />
        <div className="space-y-2.5 px-1">
          {[90, 70, 55, 80].map((w, i) => (
            <SkeletonRow key={i} w={`${w}%`} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function CaseTracker() {
  const { lang } = useLang()

  // Exact 3-field structure matching Mahakim
  const [form, setForm] = useState({
    year:     new Date().getFullYear().toString(),
    code:     '',
    number:   '',
    tribunal: '',
  })

  const [phase, setPhase]   = useState('idle')   // idle | loading | result | empty
  const [result, setResult] = useState(null)
  const [lastQuery, setLastQuery] = useState({ year: '', code: '', number: '' })
  const [recent, setRecent] = useState([])

  const resultRef = useRef(null)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function runSearch({ year, code, number, tribunal }) {
    const key = `${year}-${code}-${number}-${tribunal}`
    setLastQuery({ year, code, number })
    setPhase('loading')

    setTimeout(() => {
      const found = MOCK_DB[key] || null
      setResult(found)
      setPhase(found ? 'result' : 'empty')

      // Track recent
      setRecent(prev => {
        const entry = { year, code, number, tribunal, key }
        return [entry, ...prev.filter(r => r.key !== key)].slice(0, 4)
      })

      // Scroll to result on mobile
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }, 1500)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.year || !form.code || !form.number.trim() || !form.tribunal) return
    runSearch(form)
  }

  function applyExample(ex) {
    setForm({ ...ex })
    runSearch(ex)
  }

  const canSubmit = form.year && form.code && form.number.trim() && form.tribunal

  return (
    <section className="mt-16 mb-6" aria-label="Suivi des dossiers judiciaires">

      {/* ── Section heading ── */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}
        >
          <span>🏛️</span>
          Système judiciaire marocain — المنظومة القضائية المغربية
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Suivi des Dossiers Judiciaires
        </h2>
        <p className="text-lg font-semibold text-gray-500 mb-2" dir="rtl">
          تتبع الملفات القضائية
        </p>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Consultez en temps réel l'état d'avancement de votre dossier judiciaire.
        </p>
      </div>

      {/* ── 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ════ LEFT COLUMN — Search form ════ */}
        <div className="lg:col-span-2 space-y-4">

          {/* Form card */}
          <div
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
          >
            {/* Card header bar — matches Mahakim style */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5"
              style={{ background: '#F8FAFF' }}>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1E40AF, #5B21B6)' }}
              >
                🔎
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700 leading-tight">
                  Rechercher un dossier
                </p>
                <p className="text-xs text-gray-400" dir="rtl">البحث عن ملف قضائي</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>

              {/* Tribunal */}
              <div>
                <label htmlFor="ct-tribunal" className={LABEL_CLS}>
                  Tribunal <span className="font-normal text-gray-400" dir="rtl">/ المحكمة</span>
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    id="ct-tribunal"
                    name="tribunal"
                    value={form.tribunal}
                    onChange={handleChange}
                    className={FIELD_CLS + ' appearance-none cursor-pointer pr-8'}
                    aria-required="true"
                  >
                    {TRIBUNALS.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                </div>
              </div>

              {/* Three-field row: Year / Code / Number — exact Mahakim structure */}
              <div>
                <p className={LABEL_CLS}>
                  Identification du dossier{' '}
                  <span className="font-normal text-gray-400" dir="rtl">/ بيانات الملف</span>
                  <span className="text-red-400 ml-1">*</span>
                </p>

                <div className="grid grid-cols-3 gap-2">

                  {/* Year */}
                  <div>
                    <label htmlFor="ct-year" className="block text-xs text-gray-400 mb-1">
                      Année / السنة
                    </label>
                    <input
                      id="ct-year"
                      name="year"
                      type="number"
                      min="1990"
                      max="2030"
                      value={form.year}
                      onChange={handleChange}
                      className={FIELD_CLS + ' text-center font-mono tabular-nums'}
                      placeholder="2024"
                      aria-required="true"
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label htmlFor="ct-code" className="block text-xs text-gray-400 mb-1">
                      Code / الرمز
                    </label>
                    <div className="relative">
                      <select
                        id="ct-code"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        className={FIELD_CLS + ' text-center font-mono font-bold appearance-none cursor-pointer px-1'}
                        aria-required="true"
                      >
                        {CASE_CODES.map(c => (
                          <option key={c.id} value={c.id}>{c.id || '—'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Number */}
                  <div>
                    <label htmlFor="ct-number" className="block text-xs text-gray-400 mb-1">
                      Numéro / الرقم
                    </label>
                    <input
                      id="ct-number"
                      name="number"
                      type="text"
                      inputMode="numeric"
                      value={form.number}
                      onChange={handleChange}
                      className={FIELD_CLS + ' text-center font-mono tabular-nums'}
                      placeholder="4521"
                      maxLength={8}
                      aria-required="true"
                    />
                  </div>

                </div>

                {/* Format hint — exactly as shown on Mahakim */}
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <span>ℹ️</span>
                  Format :{' '}
                  <span className="font-mono font-semibold text-gray-500">
                    {form.number || 'XXXX'}/{form.code || '?'}/{form.year || 'AAAA'}
                  </span>
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!canSubmit || phase === 'loading'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-white transition-all duration-150 focus-ring"
                style={{
                  background: canSubmit
                    ? 'linear-gradient(135deg, #1E40AF, #5B21B6)'
                    : '#CBD5E1',
                  boxShadow: canSubmit ? '0 4px 14px rgba(30,64,175,0.4)' : 'none',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
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
                    <span>🔎</span>
                    Rechercher / بحث
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Example cases */}
          <div
            className="bg-white rounded-xl border border-gray-100 p-4"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Exemples / أمثلة
            </p>
            <div className="space-y-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => applyExample(ex)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-blue-50 focus-ring"
                  style={{ border: '1px solid #E5E7EB' }}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-mono font-bold text-blue-700">
                      {ex.number}/{ex.code}/{ex.year}
                    </span>
                    <span className="text-xs text-gray-400 ml-2 truncate hidden sm:inline">
                      {TRIBUNALS.find(t => t.id === ex.tribunal)?.label.split(' de ')[1]?.split('/')[0]?.trim() || ''}
                    </span>
                  </div>
                  <span className="text-gray-300 text-xs flex-shrink-0">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent searches */}
          {recent.length > 0 && (
            <div
              className="bg-white rounded-xl border border-gray-100 p-4"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
            >
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Récents / الأخيرة
              </p>
              <div className="space-y-1.5">
                {recent.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => applyExample(r)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors focus-ring"
                    style={{ border: '1px solid #F3F4F6' }}
                  >
                    <span className="text-gray-300 text-xs">🕐</span>
                    <span className="text-xs font-mono font-semibold text-gray-600">
                      {r.number}/{r.code}/{r.year}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Code legend */}
          <div
            className="bg-white rounded-xl border border-gray-100 p-4"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Codes des dossiers / رموز الملفات
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {CASE_CODES.slice(1).map(c => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <span
                    className="w-5 h-5 rounded text-center text-xs font-mono font-bold flex-shrink-0 flex items-center justify-center"
                    style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}
                  >
                    {c.id}
                  </span>
                  <span className="text-xs text-gray-500 truncate">{c.label.split('—')[1]?.trim()}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ════ RIGHT COLUMN — Results ════ */}
        <div className="lg:col-span-3" ref={resultRef}>
          {phase === 'idle'    && <IdleState />}
          {phase === 'loading' && <LoadingState />}
          {phase === 'result'  && result && <ResultCard data={result} />}
          {phase === 'empty'   && (
            <EmptyState
              year={lastQuery.year}
              code={lastQuery.code}
              number={lastQuery.number}
            />
          )}
        </div>

      </div>

      {/* ── Legal disclaimer ── */}
      <div
        className="mt-8 p-3.5 rounded-xl text-center"
        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
      >
        <p className="text-xs text-gray-400 leading-relaxed">
          ⚠️{' '}
          <span className="font-semibold text-gray-500">Données simulées</span>
          {' '}— Ce module est une démonstration UI uniquement, sans connexion à une base de données réelle.
          Pour le suivi officiel, consultez{' '}
          <span className="text-blue-600 font-semibold">mahakim.ma</span>
          {' '}ou{' '}
          <span className="text-blue-600 font-semibold">justice.gov.ma</span>
        </p>
        <p className="text-xs text-gray-400 mt-1" dir="rtl">
          ⚠️ بيانات تجريبية — هذا النموذج للعرض فقط. للتتبع الرسمي، زر{' '}
          <span className="text-blue-600 font-semibold">mahakim.ma</span>
        </p>
      </div>
    </section>
  )
}
