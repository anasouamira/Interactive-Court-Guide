import Header from '../components/Header'
import ServiceCard from '../components/ServiceCard'
import CaseTracker from '../components/CaseTracker'
import { getAllServices } from '../data/services'
import { useLang } from '../context/LanguageContext'

const STAGGER = ['stagger-1','stagger-2','stagger-3','stagger-4','stagger-5','stagger-6','stagger-6','stagger-6','stagger-6','stagger-6']

export default function HomePage() {
  const { lang, t } = useLang()
  const services = getAllServices(lang)

  return (
    <div className="font-poppins">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 pb-40">
        {/* Section heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-main mb-2">{t('servicesTitle')}</h2>
          <p className="text-sm text-muted">{t('servicesSubtitle')}</p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              animationClass={`fade-in-up ${STAGGER[i] || ''}`}
            />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted mt-12">{t('footerNote')}</p>

        {/* ── Case Tracking Section ── */}
        <CaseTracker />
      </main>
    </div>
  )
}
