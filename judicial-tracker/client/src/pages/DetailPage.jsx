import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getService } from '../data/services'
import { useLang } from '../context/LanguageContext'
import AudioPlayer from '../components/AudioPlayer'

// ─── Primitive UI atoms ───────────────────────────────────────────────────────

function SectionCard({ children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-clay p-6 ${className}`}
      style={{
        boxShadow: '0 4px 20px rgba(37,99,235,0.07)',
        border: '1.5px solid rgba(255,255,255,0.9)',
      }}
    >
      {children}
    </div>
  )
}

function SectionHeading({ icon, label }) {
  return (
    <h2 className="text-base font-semibold text-text-main mb-5 flex items-center gap-2">
      <span aria-hidden="true">{icon}</span>
      {label}
    </h2>
  )
}

// ─── Section renderers (pure — read only from props) ─────────────────────────

/** 1. Use Cases */
function UseCasesSection({ heading, items }) {
  if (!items?.length) return null
  return (
    <SectionCard>
      <SectionHeading icon="🎯" label={heading} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-background rounded-xl px-3 py-2.5 text-sm text-text-main"
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

/** 2. Steps */
function StepsSection({ heading, items, audioSrc, audioLabel }) {
  if (!items?.length) return null
  return (
    <SectionCard>
      <SectionHeading icon="🔢" label={heading} />
      {audioSrc && (
        <div className="mb-4">
          <AudioPlayer src={audioSrc} label={audioLabel} variant="inline" />
        </div>
      )}
      <ol className="space-y-5" aria-label={heading}>
        {items.map((step, i) => (
          <li key={i} className="flex items-start gap-4">
            {/* Step number bubble */}
            <div
              className="min-w-[36px] h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                boxShadow: '0 3px 10px rgba(59,130,246,0.35)',
              }}
              aria-hidden="true"
            >
              {i + 1}
            </div>
            <div className="pt-1">
              <p className="text-sm font-semibold text-text-main mb-1">
                <span aria-hidden="true" className="ml-1">{step.icon}</span>
                {step.title}
              </p>
              <p className="text-xs text-muted leading-relaxed">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}

/** 3. Requirements */
function RequirementsSection({ heading, items, audioSrc, audioLabel }) {
  if (!items?.length) return null
  return (
    <SectionCard>
      <SectionHeading icon="📋" label={heading} />
      {audioSrc && (
        <div className="mb-4">
          <AudioPlayer src={audioSrc} label={audioLabel} variant="inline" />
        </div>
      )}
      <ul className="space-y-3" aria-label={heading}>
        {items.map((req, i) => (
          <li key={i} className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
              style={{ background: '#EFF6FF' }}
              aria-hidden="true"
            >
              {req.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-text-main">{req.label}</p>
              {req.note && (
                <p className="text-xs text-muted mt-0.5">{req.note}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

/** 4. Channels */
function ChannelsSection({ heading, items, audioSrc, audioLabel }) {
  if (!items?.length) return null
  return (
    <SectionCard>
      <SectionHeading icon="📍" label={heading} />
      {audioSrc && (
        <div className="mb-4">
          <AudioPlayer src={audioSrc} label={audioLabel} variant="inline" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((ch, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl p-3"
            style={{ background: '#F0F4FF' }}
          >
            <span className="text-2xl flex-shrink-0" aria-hidden="true">
              {ch.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-text-main">{ch.name}</p>
              <p className="text-xs text-muted mt-0.5">{ch.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

/** 5. Outcomes */
const OUTCOME_STYLES = {
  positive: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  neutral:  { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
  negative: { bg: '#FFF1F2', border: '#FDA4AF', text: '#BE123C' },
}

function OutcomesSection({ heading, items, audioSrc, audioLabel }) {
  if (!items?.length) return null
  return (
    <SectionCard>
      <SectionHeading icon="🎲" label={heading} />
      {audioSrc && (
        <div className="mb-4">
          <AudioPlayer src={audioSrc} label={audioLabel} variant="inline" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((out, i) => {
          const style = OUTCOME_STYLES[out.type] || OUTCOME_STYLES.neutral
          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
              style={{
                background: style.bg,
                border: `1.5px solid ${style.border}`,
                color: style.text,
              }}
            >
              <span aria-hidden="true">{out.icon}</span>
              {out.label}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

/** 6. Rights */
function RightsSection({ heading, items }) {
  if (!items?.length) return null
  return (
    <SectionCard>
      <SectionHeading icon="🛡️" label={heading} />
      <ul className="space-y-2.5" aria-label={heading}>
        {items.map((right, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-text-main">
            <span className="text-primary mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
            {right}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

/** 7. Warnings */
function WarningsSection({ heading, items }) {
  if (!items?.length) return null
  return (
    <SectionCard style={{ borderColor: '#FCA5A5' }}>
      <SectionHeading icon="⚠️" label={heading} />
      <ul className="space-y-2.5" aria-label={heading}>
        {items.map((warn, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-text-main">
            <span className="flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} aria-hidden="true">
              !
            </span>
            {warn}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

/** 8. FAQ */
function FaqSection({ heading, items }) {
  const [open, setOpen] = useState(null)
  if (!items?.length) return null
  return (
    <SectionCard>
      <SectionHeading icon="❓" label={heading} />
      <div className="space-y-2" role="list" aria-label={heading}>
        {items.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ border: '1.5px solid #E5E7EB' }}
            role="listitem"
          >
            <button
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-text-main text-right bg-white hover:bg-background transition-colors focus-ring"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{faq.question}</span>
              <span
                className="flex-shrink-0 transition-transform duration-200"
                style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
            {open === i && (
              <div className="px-4 pb-4 pt-1 text-sm text-muted leading-relaxed bg-white">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Detail Page (generic template — driven entirely by service data) ─────────

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const service = getService(id, lang)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  if (!service) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-20 text-center">
        <p className="text-muted text-lg mb-4">{t('notFound')}</p>
        <button
          className="btn-primary focus-ring"
          onClick={() => navigate('/')}
          aria-label={t('back')}
        >
          {t('back')}
        </button>
      </div>
    )
  }

  const handleCta = () => {
    // CTA action — extendable per service (e.g. navigate to a form route)
    // Currently scrolls to first step as a placeholder
    document.getElementById('section-steps')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="font-poppins">
      <main className="max-w-screen-xl mx-auto px-4 pt-8 pb-40">

        {/* ── Back button ── */}
        <button
          className="inline-flex items-center gap-2 bg-white rounded-btn px-5 py-2.5 text-sm font-medium text-text-main mb-7 transition-all duration-200 hover:-translate-y-0.5 focus-ring"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
          onClick={() => navigate('/')}
          aria-label={t('back')}
        >
          {t('back')}
        </button>

        {/* ── 1. Hero header ── */}
        <header
          className="text-center rounded-clay-lg px-8 py-10 mb-8"
          style={{
            background: 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)',
            boxShadow: '0 12px 40px rgba(29,78,216,0.3)',
          }}
        >
          <div className="text-5xl mb-3" aria-hidden="true">{service.icon}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {service.title}
          </h1>
          <p className="text-white/85 text-base max-w-lg mx-auto leading-relaxed mb-6">
            {service.description}
          </p>
          <button
            className="inline-flex items-center gap-2 font-semibold text-sm px-7 py-3 rounded-btn transition-all duration-200 focus-ring"
            style={{
              background: 'rgba(255,255,255,0.95)',
              color: '#1D4ED8',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
            onClick={handleCta}
            aria-label={service.cta}
          >
            {service.cta} ←
          </button>
        </header>

        {/* ── Overview audio — only renders if service.audio.overview exists ── */}
        {service.audio?.overview && (
          <div
            className="mb-2 rounded-clay p-4"
            style={{
              background: '#fff',
              boxShadow: '0 4px 20px rgba(37,99,235,0.08)',
              border: '1.5px solid rgba(255,255,255,0.9)',
            }}
          >
            <AudioPlayer
              src={service.audio.overview}
              label={t('audioOverview')}
              variant="inline"
            />
          </div>
        )}

        {/* ── Content sections — rendered from data only ── */}
        <div className="space-y-5">

          {/* 2. Use Cases */}
          <UseCasesSection
            heading={t('sectionUseCases')}
            items={service.useCases}
          />

          {/* 3. Steps */}
          <div id="section-steps">
            <StepsSection
              heading={t('sectionSteps')}
              items={service.steps}
              audioSrc={service.audio?.steps}
              audioLabel={t('audioSteps')}
            />
          </div>

          {/* 4. Requirements */}
          <RequirementsSection
            heading={t('sectionRequirements')}
            items={service.requirements}
            audioSrc={service.audio?.requirements}
            audioLabel={t('audioRequirements')}
          />

          {/* 5. Channels */}
          <ChannelsSection
            heading={t('sectionChannels')}
            items={service.channels}
            audioSrc={service.audio?.channels}
            audioLabel={t('audioChannels')}
          />

          {/* 6. Outcomes */}
          <OutcomesSection
            heading={t('sectionOutcomes')}
            items={service.outcomes}
            audioSrc={service.audio?.outcomes}
            audioLabel={t('audioOutcomes')}
          />

          {/* 7 + 8. Rights & Warnings — side by side on wider screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <RightsSection
              heading={t('sectionRights')}
              items={service.rights}
            />
            <WarningsSection
              heading={t('sectionWarnings')}
              items={service.warnings}
            />
          </div>

          {/* 9. FAQ */}
          <FaqSection
            heading={t('sectionFaq')}
            items={service.faq}
          />

          {/* 10. Bottom CTA */}
          <div
            className="text-center rounded-clay-lg py-10 px-6"
            style={{
              background: 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)',
              boxShadow: '0 8px 30px rgba(29,78,216,0.25)',
            }}
          >
            <p className="text-white/85 text-sm mb-4">
              {t('detailFooterNote')}
            </p>
            <button
              className="inline-flex items-center gap-2 font-semibold text-sm px-8 py-3 rounded-btn transition-all duration-200 focus-ring"
              style={{
                background: 'rgba(255,255,255,0.95)',
                color: '#1D4ED8',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
              onClick={handleCta}
              aria-label={service.cta}
            >
              {service.cta} ←
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
