import { useState, useRef, useEffect } from 'react'
import { processMessage, getWelcomeMessage, getQuickChips } from '../chatbot'
import { useLang } from '../context/LanguageContext'

export default function Chatbot() {
  const { lang, t } = useLang()
  

  const QUICK_CHIPS = getQuickChips(lang)

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [chipsUsed, setChipsUsed] = useState(false)
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Reset welcome message when lang changes
  useEffect(() => {
    setMessages([{ id: 0, text: getWelcomeMessage(lang), isUser: false }])
    setChipsUsed(false)
  }, [lang])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const addMessages = (texts, isUser) => {
    const newMsgs = texts.map((text, i) => ({ id: Date.now() + i, text, isUser }))
    setMessages((prev) => [...prev, ...newMsgs])
  }

  const sendMessage = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setInput('')
    addMessages([trimmed], true)
    setTyping(true)
    setTimeout(() => {
      const replies = processMessage(trimmed, lang)
      setTyping(false)
      addMessages(replies, false)
    }, 700)
  }

  const handleChip = (msg) => {
    setChipsUsed(true)
    sendMessage(msg)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage(input)
  }

  return (
    <>
      {/* FAB */}
      <button
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white text-sm font-semibold rounded-full px-6 py-3.5 z-50 transition-all duration-200 focus-ring"
        style={{
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          boxShadow: '0 8px 30px rgba(37,99,235,0.45)',
        }}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t('chatbotClose') : t('chatbotOpen')}
        aria-expanded={open}
        aria-controls="chatbot-window"
      >
        <span aria-hidden="true">{open ? '✕' : '💬'}</span>
        {open ? t('chatbotClose') : t('chatbotOpen')}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          id="chatbot-window"
          role="dialog"
          aria-label={t('chatbotTitle')}
          aria-modal="false"
          className="fixed z-40 overflow-hidden"
          style={{
            bottom: '88px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(460px, calc(100vw - 32px))',
            background: '#fff',
            borderRadius: '24px',
            border: '1.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 24px 80px rgba(37,99,235,0.20), 0 4px 20px rgba(0,0,0,0.10)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)' }}
              aria-hidden="true"
            >
              ⚖️
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-0.5">{t('chatbotTitle')}</h3>
              <span className="text-xs text-white/70">{t('chatbotStatus')}</span>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex flex-col gap-2.5 p-4 overflow-y-auto"
            style={{ height: '240px' }}
            aria-live="polite"
            aria-label={t('chatbotTitle')}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed fade-in-up ${
                  m.isUser ? 'self-end text-white' : 'self-start text-text-main'
                }`}
                style={{
                  borderRadius: m.isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  background: m.isUser
                    ? 'linear-gradient(135deg, #3B82F6, #6366F1)'
                    : '#F0F4FF',
                }}
              >
                {m.text}
              </div>
            ))}
            {typing && (
              <div
                className="self-start px-4 py-2.5 text-sm text-muted italic"
                style={{ borderRadius: '4px 16px 16px 16px', background: '#F0F4FF' }}
                aria-label={t('chatbotTyping')}
              >
                {t('chatbotTyping')}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips */}
          {!chipsUsed && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  className="bg-background border border-gray-200 rounded-full px-3 py-1 text-xs text-text-main cursor-pointer transition-all hover:bg-blue-50 hover:border-primary hover:text-primary focus-ring"
                  onClick={() => handleChip(chip.msg)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 border border-gray-200 rounded-btn px-4 py-2.5 text-sm font-[inherit] outline-none transition-colors focus:border-primary"
              placeholder={t('chatbotPlaceholder')}
              aria-label={t('chatbotPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="w-10 h-10 flex items-center justify-center rounded-btn flex-shrink-0 text-white text-base transition-transform hover:scale-105 focus-ring"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
              aria-label={t('chatbotOpen')}
              onClick={() => sendMessage(input)}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
