import { useAudio } from '../context/AudioContext'

// ─────────────────────────────────────────────────────────────────────────────
// StickyAudioBar
// Appears at the bottom of the screen whenever an audio is playing.
// Shows the label passed via context's activeLabel, and a pause button.
// ─────────────────────────────────────────────────────────────────────────────

export default function StickyAudioBar() {
  const { activeId, activeMeta, stopActive } = useAudio()

  // Only render when something is actively playing
  if (!activeId || !activeMeta) return null

  return (
    <div
      className="fixed bottom-24 left-1/2 z-50 fade-in-up"
      style={{ transform: 'translateX(-50%)', width: 'min(480px, calc(100vw - 32px))' }}
      role="status"
      aria-live="polite"
      aria-label="مشغّل صوتي نشط"
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #1D4ED8, #6D28D9)',
          border: '1.5px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Animated wave icon */}
        <span className="text-lg flex-shrink-0" aria-hidden="true">🎧</span>

        {/* Label */}
        <p className="flex-1 text-white text-xs font-medium truncate">
          {activeMeta.label || 'جارٍ التشغيل...'}
        </p>

        {/* Pause button */}
        <button
          onClick={stopActive}
          aria-label="إيقاف مؤقت للصوت الجاري"
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm transition-colors focus-ring flex-shrink-0"
        >
          ⏸
        </button>
      </div>
    </div>
  )
}
