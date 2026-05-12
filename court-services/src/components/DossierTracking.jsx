import './DossierTracking.css'
import { useEffect, useState } from 'react'

export default function DossierTracking() {
  const [mobile, setMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="iframe-box">
      <iframe
        src="https://www.mahakim.ma/#/suivi/dossier-suivi"
        title="Mahakim"
        className={mobile ? 'mobile-frame' : 'desktop-frame'}
      />
    </div>
  
  )
}