import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { AudioProvider } from './context/AudioContext'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import Chatbot from './components/Chatbot'
import StickyAudioBar from './components/StickyAudioBar'

export default function App() {
  return (
    <LanguageProvider>
      <AudioProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/service/:id" element={<DetailPage />} />
        </Routes>
        <Chatbot />
        <StickyAudioBar />
      </AudioProvider>
    </LanguageProvider>
  )
}
