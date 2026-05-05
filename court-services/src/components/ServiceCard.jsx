import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'

export default function ServiceCard({ service, animationClass = '' }) {
  const navigate = useNavigate()
  const { t } = useLang()

  const handleActivate = () => navigate(`/service/${service.id}`)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleActivate()
    }
  }

  return (
    <article
      className={`clay-card cursor-pointer transition-all duration-200 p-7 flex flex-col items-center text-center gap-3 ${animationClass}`}
      role="button"
      tabIndex={0}
      aria-label={service.title}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-[18px] flex items-center justify-center text-3xl mb-1"
        style={{ background: service.iconBg }}
        aria-hidden="true"
      >
        {service.icon}
      </div>

      {/* Title */}
      <h2 className="text-base font-semibold text-text-main leading-snug">
        {service.title}
      </h2>

      {/* Description */}
      <p className="text-sm text-muted leading-relaxed max-w-[220px]">
        {service.desc}
      </p>

      {/* CTA */}
      <span className="text-xs font-semibold text-primary mt-1 opacity-70">
        {t('viewDetails')}
      </span>
    </article>
  )
}
