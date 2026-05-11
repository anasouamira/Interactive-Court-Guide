import { useLang } from '../context/LanguageContext'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div
      className="inline-flex rounded-full p-0.5 mt-6"
      style={{
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.25)',
      }}
      role="group"
      aria-label="اختيار اللغة"
    >
      <button
        onClick={() => setLang('ar')}
        aria-pressed={lang === 'ar'}
        className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 focus-ring"
        style={{
          background: lang === 'ar' ? 'rgba(255,255,255,0.9)' : 'transparent',
          color: lang === 'ar' ? '#2563EB' : 'rgba(255,255,255,0.8)',
          boxShadow: lang === 'ar' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        العربية
      </button>
      <button
        onClick={() => setLang('ma')}
        aria-pressed={lang === 'ma'}
        className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 focus-ring"
        style={{
          background: lang === 'ma' ? 'rgba(255,255,255,0.9)' : 'transparent',
          color: lang === 'ma' ? '#2563EB' : 'rgba(255,255,255,0.8)',
          boxShadow: lang === 'ma' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        الدارجة
      </button>
    </div>
  )
}
