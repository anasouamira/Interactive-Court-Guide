import { useLang } from '../context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useLang()

  return (
    <header
      className="relative overflow-hidden text-center px-6 pt-12 pb-14 mb-10"
      style={{
        background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        borderRadius: '0 0 32px 32px',
        boxShadow: '0 20px 60px rgba(37,99,235,0.35)',
      }}
    >
      {/* Glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.12) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Decorative dots */}
      <div className="absolute top-5 right-5 flex gap-2" aria-hidden="true">
        {['opacity-60', 'opacity-30', 'opacity-20'].map((op, i) => (
          <span key={i} className={`w-2 h-2 rounded-full bg-white ${op}`} />
        ))}
      </div>

      {/* Badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-medium mb-5"
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          backdropFilter: 'blur(8px)',
          letterSpacing: '0.4px',
        }}
      >
        <span aria-hidden="true">⚖️</span>
        {t('headerBadge')}
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3 whitespace-pre-line">
        {t('headerTitle')}
      </h1>
      <p className="text-white/85 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
        {t('headerSubtitle')}
      </p>

      {/* Language switcher — sits below subtitle, fully centered */}
      <div className="flex justify-center">
        <LanguageSwitcher />
      </div>
    </header>
  )
}
