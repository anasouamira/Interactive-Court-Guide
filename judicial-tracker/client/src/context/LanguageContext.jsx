import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('court_lang')
      return saved === 'ma' ? 'ma' : 'ar'
    } catch {
      return 'ar'
    }
  })

  // Sync <html> dir attribute (both langs are RTL)
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl')
    document.documentElement.setAttribute('lang', lang === 'ma' ? 'ar-MA' : 'ar')
  }, [lang])

  const setLang = (newLang) => {
    setLangState(newLang)
    try {
      localStorage.setItem('court_lang', newLang)
    } catch {}
  }

  const t = (key) => translations[lang]?.[key] ?? translations['ar'][key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
