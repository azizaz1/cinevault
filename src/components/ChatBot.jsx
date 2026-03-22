import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `Tu es CineBot, un expert passionné de cinéma sur CineVault. 
Tu connais tout sur les films, acteurs, réalisateurs, oscars, box-office, histoire du cinéma.
Tu réponds en français ou anglais selon la langue de l'utilisateur.
Tu es enthousiaste, précis et tu donnes des recommandations personnalisées.
Garde tes réponses concises (max 3-4 phrases) sauf si on te demande plus de détails.
Tu peux utiliser des emojis 🎬`

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🎬 Salut ! Je suis CineBot, ton expert cinéma. Pose-moi n\'importe quelle question sur les films, acteurs ou réalisateurs !'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
'Authorization': `Bearer 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`,
        },
        body: JSON.stringify({
model: 'llama-3.3-70b-versatile',         messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({
              role: m.role,
              content: m.content
            }))
          ],
          max_tokens: 500,
        })
      })

      const data = await response.json()
      console.log('OpenRouter response:', data)
const reply = data.choices?.[0]?.message?.content || data.error?.message || 'Désolé, je n\'ai pas pu répondre.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erreur de connexion. Réessaie !' }])
    }
    setLoading(false)
  }

  const suggestions = [
    '🎬 Meilleurs films 2024 ?',
    '🏆 Oscar du meilleur film 2024 ?',
    '🎭 Films comme Oppenheimer ?',
    '⭐ Meilleur acteur de tous les temps ?',
  ]

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      zIndex: 9999, width: '380px',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(160deg, #100e11, #0a080b)',
      border: '1px solid rgba(201,168,76,0.2)',
      borderRadius: '16px',
      boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
      overflow: 'hidden',
      maxHeight: '560px',
    }}>

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(201,168,76,0.1)',
        background: 'rgba(201,168,76,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px',
          }}>🎬</div>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: '#f0ebe3' }}>CineBot</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#27ae60' }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: '#7a7070' }}>
                Online — Llama 3.3 70B
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#7a7070', width: '30px', height: '30px',
          borderRadius: '50%', fontSize: '14px', cursor: 'pointer',
        }}>×</button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        minHeight: '300px', maxHeight: '360px',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end', gap: '8px',
          }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #c9a84c, #8b6914)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🎬</div>
            )}
            <div style={{
              maxWidth: '78%', padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #c9a84c, #a8873c)'
                : 'rgba(255,255,255,0.06)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              fontFamily: "'Outfit', sans-serif", fontSize: '13px',
              lineHeight: 1.6,
              color: msg.role === 'user' ? '#080608' : '#c0b8b0',
              fontWeight: msg.role === 'user' ? 500 : 400,
                            textAlign: 'left',

            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #c9a84c, #8b6914)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🎬</div>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px 16px', display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#c9a84c', opacity: 0.7,
                  animation: 'pulse 1.2s ease infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)} style={{
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.15)',
              color: '#c9a84c', padding: '5px 10px',
              borderRadius: '12px', cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", fontSize: '11px',
              transition: 'all 0.2s',
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: '8px',
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything about cinema..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', color: '#f0ebe3',
            padding: '10px 14px',
            fontFamily: "'Outfit', sans-serif", fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#333' : '#c9a84c',
            color: loading || !input.trim() ? '#666' : '#080608',
            border: 'none', borderRadius: '8px',
            width: '40px', height: '40px',
            fontSize: '16px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', flexShrink: 0,
          }}
        >➤</button>
      </div>
    </div>
  )
}