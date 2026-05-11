import { createContext, useContext, useRef, useState, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// AudioContext
// Central controller for the entire page's audio playback.
// Guarantees only ONE player is active at a time.
//
// Exposes:
//   activeId    {string|null}  — uid of the currently playing player
//   activeMeta  {object|null}  — { label } of the active player (for sticky bar)
//   requestPlay (id, el, meta) — start playing; stops any current audio first
//   notifyStop  (id)           — called when a player pauses or ends
//   stopActive  ()             — pause + reset the currently active player
// ─────────────────────────────────────────────────────────────────────────────

const AudioContext = createContext(null)

export function AudioProvider({ children }) {
  const activeRef  = useRef(null)   // the live <audio> DOM element
  const [activeId,   setActiveId]   = useState(null)
  const [activeMeta, setActiveMeta] = useState(null)

  /** Start playing a new player; stops any previous one first */
  const requestPlay = useCallback((id, audioEl, meta = {}) => {
    if (activeRef.current && activeRef.current !== audioEl) {
      activeRef.current.pause()
      activeRef.current.currentTime = 0
    }
    activeRef.current = audioEl
    setActiveId(id)
    setActiveMeta(meta)
    audioEl.play().catch(() => {
      // Browser autoplay policy or missing src — fail silently
    })
  }, [])

  /** Called by a player when it pauses or ends naturally */
  const notifyStop = useCallback((id) => {
    setActiveId((prev) => (prev === id ? null : prev))
    setActiveMeta((prev) => (activeRef.current ? prev : null))
  }, [])

  /** Programmatically stop whatever is playing (used by sticky bar) */
  const stopActive = useCallback(() => {
    if (activeRef.current) {
      activeRef.current.pause()
      activeRef.current.currentTime = 0
    }
    setActiveId(null)
    setActiveMeta(null)
    activeRef.current = null
  }, [])

  return (
    <AudioContext.Provider value={{ activeId, activeMeta, requestPlay, notifyStop, stopActive }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used inside <AudioProvider>')
  return ctx
}
