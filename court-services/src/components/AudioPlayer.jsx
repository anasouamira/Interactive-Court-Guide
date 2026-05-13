import { useRef, useState, useEffect, useId } from 'react'
import { useAudio } from '../context/AudioContext'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────


function fmt(secs) {
  if (!isFinite(secs) || isNaN(secs)) return '00:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─────────────────────────────────────────────────────────────────────────────
// AudioPlayer
//
// Props:
//   src      {string}  — audio URL (required)
//   label    {string}  — accessible label shown above the player (optional)
//   variant  {'inline'|'overview'}
//             'overview'  → slightly more prominent style (used below hero)
//             'inline'    → compact style inside a section card (default)
// ─────────────────────────────────────────────="────────────────────────────────

export default function AudioPlayer({ src, label, variant = 'inline' }) {
  const uid = useId()                          // stable unique id per instance
  const audioRef = useRef(null)
  const progressRef = useRef(null)

  const { activeId, requestPlay, notifyStop } = useAudio()

  const isPlaying = activeId === uid

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // ── Sync external stop (another player started) ──────────────────────────
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
  
  }, [isPlaying])

  // ── Audio element event listeners ────────────────────────────────────────
  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    const onLoaded  = () => { setDuration(el.duration); setLoaded(true) }
    const onTime    = () => setCurrentTime(el.currentTime)
    const onEnded   = () => { notifyStop(uid); setCurrentTime(0) }
    const onError   = () => setError(true)

    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('timeupdate',     onTime)
    el.addEventListener('ended',          onEnded)
    el.addEventListener('error',          onError)

    return () => {
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('timeupdate',     onTime)
      el.removeEventListener('ended',          onEnded)
      el.removeEventListener('error',          onError)
    }
  }, [uid, notifyStop])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePlayPause = () => {
    const el = audioRef.current
    if (!el || error) return
    if (isPlaying) {
      el.pause()
      notifyStop(uid)
    } else {
      requestPlay(uid, el, { label })
    }
  }

  const handleSeek = (e) => {
    const el = audioRef.current
    if (!el || !duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    el.currentTime = ratio * duration
    setCurrentTime(el.currentTime)
  }

  const handleKeySeek = (e) => {
    const el = audioRef.current
    if (!el) return
    if (e.key === 'ArrowRight') el.currentTime = Math.min(duration, el.currentTime + 5)
    if (e.key === 'ArrowLeft')  el.currentTime = Math.max(0, el.currentTime - 5)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // ── Derived styles ────────────────────────────────────────────────────────
  const isOverview = variant === 'overview'

  if (error) return null   // silently hide broken audio sources

  return (
    <div
      className={`rounded-xl flex flex-col gap-3 ${
        isOverview
          ? 'bg-white/10 border border-white/20 p-4 backdrop-blur-sm'
          : 'bg-background border border-blue-100 p-3'
      }`}
      role="region"
      aria-label={label || 'مشغّل صوتي'}
    >
      {/* Hidden native audio — no controls, no autoplay */}
      <audio ref={audioRef} src={src} preload="metadata" aria-hidden="true" />

      {/* Label */}
      {label && (
        <p
          className={`text-xs font-medium flex items-center gap-1.5 ${
            isOverview ? 'text-white/80' : 'text-muted'
          }`}
        >
          <span aria-hidden="true">🎧</span>
          {label}
        </p>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-3">

        {/* Play / Pause button — 44×44px minimum touch target */}
        <button
          onClick={handlePlayPause}
          aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-lg transition-all duration-150 focus-ring ${
            isOverview
              ? 'bg-white text-blue-700 hover:scale-105 shadow-md'
              : 'text-white hover:scale-105 shadow'
          }`}
          style={
            isOverview
              ? {}
              : { background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }
          }
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Progress + time */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">

          {/* Progress bar */}
          <div
            ref={progressRef}
            role="slider"
            aria-label="موضع التشغيل"
            aria-valuemin={0}
            aria-valuemax={duration || 100}
            aria-valuenow={Math.round(currentTime)}
            tabIndex={0}
            className="relative h-2 rounded-full cursor-pointer focus-ring"
            style={{ background: isOverview ? 'rgba(255,255,255,0.2)' : '#E5E7EB' }}
            onClick={handleSeek}
            onKeyDown={handleKeySeek}
          >
            {/* Filled track */}
            <div
              className="absolute top-0 right-0 h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: isOverview
                  ? 'rgba(255,255,255,0.85)'
                  : 'linear-gradient(90deg, #3B82F6, #6366F1)',
              }}
            />
            {/* Thumb dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow transition-all duration-100"
              style={{
                right: `${progress}%`,
                transform: `translateX(50%) translateY(-50%)`,
                background: isOverview ? 'white' : '#3B82F6',
              }}
              aria-hidden="true"
            />
          </div>

          {/* Time display */}
          <div
            className={`flex justify-between text-xs tabular-nums ${
              isOverview ? 'text-white/70' : 'text-muted'
            }`}
          >
            <span>{fmt(currentTime)}</span>
            <span>{loaded ? fmt(duration) : '--:--'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
