// ResultCard.jsx — عرض نتيجة الملف القضائي (عربي فقط)

const STATUS_CONFIG = {
  en_cours:   { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8', dot: '#3B82F6', icon: '⚖️'  },
  en_attente: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#F59E0B', icon: '⏳'  },
  juge:       { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D', dot: '#22C55E', icon: '✅'  },
  reporte:    { bg: '#FFF7ED', border: '#FDBA74', text: '#C2410C', dot: '#F97316', icon: '🔁'  },
  default:    { bg: '#F9FAFB', border: '#E5E7EB', text: '#374151', dot: '#9CA3AF', icon: '📋'  },
}

const SOURCE_LABELS = {
  'mock':          { label: 'بيانات تجريبية',    bg: '#FFF7ED', border: '#FDBA74', text: '#C2410C' },
  'mock-fallback': { label: 'بيانات محلية',       bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  'local-fallback':{ label: 'بيانات محلية',       bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  'mahakim-live':  { label: '🟢 بيانات حقيقية',  bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
}

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Intl.DateTimeFormat('ar-MA', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d))
  } catch { return d }
}

function getStatus(s) { return STATUS_CONFIG[s] || STATUS_CONFIG.default }

// ── Badge ─────────────────────────────────────────────────────────────────────

function StatusBadge({ status, statusLabel }) {
  const s = getStatus(status)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, border: `1.5px solid ${s.border}`, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.dot }} />
      {statusLabel || '—'}
    </span>
  )
}

// ── Source badge ──────────────────────────────────────────────────────────────

function SourceBadge({ source }) {
  if (!source) return null
  const cfg = SOURCE_LABELS[source] || SOURCE_LABELS['mock']
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}>
      {cfg.label}
    </span>
  )
}

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }) {
  if (!value || value === '—') return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-base w-5 text-center flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
      </div>
    </div>
  )
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function Timeline({ history }) {
  if (!history?.length) return null
  return (
    <div dir="rtl">
      {history.map((step, i) => {
        const isLast    = i === history.length - 1
        const isDone    = step.status === 'done'
        const isCurrent = step.current

        const dotBg = isDone
          ? 'linear-gradient(135deg,#22C55E,#16A34A)'
          : isCurrent
          ? 'linear-gradient(135deg,#3B82F6,#6366F1)'
          : '#E5E7EB'

        const textColor = isDone ? '#15803D' : isCurrent ? '#1D4ED8' : '#9CA3AF'

        return (
          <div key={i} className="flex gap-3.5">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 24 }}>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0 z-10"
                style={{ background: dotBg, fontSize: 10, fontWeight: 700,
                  boxShadow: isCurrent ? '0 0 0 3px rgba(59,130,246,0.2)' : 'none' }}
              >
                {isDone ? '✓' : isCurrent ? '◉' : step.step}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 mt-0.5"
                  style={{ background: isDone ? '#86EFAC' : '#F3F4F6', minHeight: 24 }} />
              )}
            </div>
            <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-5'}`}>
              <p className="text-sm font-semibold leading-snug" style={{ color: textColor }}>
                {step.event}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 tabular-nums">{formatDate(step.date)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main ResultCard ───────────────────────────────────────────────────────────

export default function ResultCard({ dossier, source }) {
  const s = getStatus(dossier.status)

  return (
    <div className="space-y-4 fade-in-up" dir="rtl">

      {/* رأس البطاقة */}
      <div className="rounded-xl overflow-hidden"
        style={{ boxShadow: '0 6px 24px rgba(29,78,216,0.18)' }}>

        <div className="px-5 py-4"
          style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#4C1D95 100%)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white/60 text-xs mb-0.5">رقم الملف</p>
              <p className="text-white text-xl font-bold tracking-widest font-mono" dir="ltr">
                {dossier.numeroComplet}
              </p>
            </div>
            <StatusBadge status={dossier.status} statusLabel={dossier.statusLabel} />
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-5 py-2.5 flex flex-wrap gap-x-6 gap-y-1 items-center">
          <div>
            <p className="text-xs text-gray-400">نوع القضية</p>
            <p className="text-xs font-semibold text-gray-700">{dossier.type || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">الغرفة</p>
            <p className="text-xs font-semibold text-gray-700">{dossier.chambre || '—'}</p>
          </div>
          <div className="mr-auto">
            <SourceBadge source={source} />
          </div>
        </div>
      </div>

      {/* حالة الملف */}
      <div className="rounded-xl p-4 flex items-center gap-3.5" role="status"
        style={{ background: s.bg, border: `1.5px solid ${s.border}` }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: s.border }} aria-hidden="true">
          {s.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium" style={{ color: s.text }}>الحالة الراهنة</p>
          <p className="font-bold text-sm" style={{ color: s.text }}>{dossier.statusLabel}</p>
          {dossier.nextSession && (
            <p className="text-xs mt-0.5" style={{ color: s.text }}>
              الجلسة القادمة: <strong className="tabular-nums">{formatDate(dossier.nextSession)}</strong>
            </p>
          )}
        </div>
      </div>

      {/* تفاصيل الأطراف والمعلومات */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-3"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          الأطراف والمعلومات
        </h4>
        <InfoRow icon="🏛️" label="المحكمة"       value={dossier.tribunal} />
        <InfoRow icon="👤" label="المدّعي"        value={dossier.parties?.demandeur} />
        <InfoRow icon="🏢" label="المدّعى عليه"   value={dossier.parties?.defendeur} />
        <InfoRow icon="👨‍⚖️" label="القاضي"        value={dossier.judge} />
        <InfoRow icon="📅" label="آخر تحديث"      value={formatDate(dossier.lastUpdate)} />
        {dossier.nextSession && (
          <InfoRow icon="🗓️" label="الجلسة القادمة" value={formatDate(dossier.nextSession)} />
        )}
      </div>

      {/* مسار الملف */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          مسار الملف
        </h4>
        <Timeline history={dossier.history} />
      </div>

    </div>
  )
}

export { StatusBadge, Timeline, formatDate }
