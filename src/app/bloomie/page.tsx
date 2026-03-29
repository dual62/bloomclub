'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { getProducts, type Product } from '@/lib/supabase'
import { findMatchingProducts, generateResponse } from '@/lib/bloomie'

type Message = {
  role: 'user' | 'bot'
  text: string
  products?: Product[]
  time: string
}

export default function BloomieChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const { addToCart } = useCart()
  const endRef = useRef<HTMLDivElement>(null)
  const lastBotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProducts().then(p => setProducts(p))
  }, [])

  // When typing indicator shows, scroll to bottom
  // When bot responds, scroll to the bot's answer (not the input)
  useEffect(() => {
    if (typing) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [typing])

  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === 'bot') {
      // Small delay to let product cards render
      setTimeout(() => {
        lastBotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [messages])

  const send = (text: string) => {
    if (!text.trim() || typing) return
    const time = new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })
    setMessages(p => [...p, { role: 'user', text: text.trim(), time }])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const { tags, products: matched } = findMatchingProducts(text, products)
      const responseText = generateResponse(text, tags, matched)
      const time = new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })
      setMessages(p => [...p, { role: 'bot', text: responseText, products: matched, time }])
      setTyping(false)
    }, 800 + Math.random() * 1000)
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy to-navy-light px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl border-2 border-white/15">🌸</div>
        <div className="flex-1">
          <div className="text-white font-bold text-base flex items-center gap-2">
            Bloomie
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
          </div>
          <div className="text-white/50 text-xs">Jouw welzijns-adviseur</div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="bg-white/10 border border-white/15 text-white/70 px-3.5 py-1.5 rounded-full text-[11px] font-semibold">
            Nieuw gesprek
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 bg-gradient-to-b from-cream to-warm">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-10 animate-fade-up">
              <div className="text-5xl mb-4 animate-breathe">🌸</div>
              <h2 className="font-display text-3xl text-navy mb-2 text-center">Hallo, ik ben Bloomie!</h2>
              <p className="text-sm text-text-soft text-center max-w-sm mb-6">Vertel me waar je mee worstelt, of gebruik een #hashtag.</p>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {[
                  { t: 'Ik heb last van droge huid', i: '✨' },
                  { t: 'Ik slaap de laatste tijd slecht', i: '🌙' },
                  { t: 'Wat helpt tegen opvliegers?', i: '💨' },
                  { t: 'Mijn haar wordt dunner', i: '💫' },
                ].map((s, i) => (
                  <button key={i} onClick={() => send(s.t)}
                    className="bg-white border border-navy/5 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-text text-left hover:translate-x-1 hover:border-coral/30 transition-all">
                    <span className="text-lg">{s.i}</span>
                    <span className="flex-1">{s.t}</span>
                    <span className="text-text-faint">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isLastBot = msg.role === 'bot' && i === messages.length - 1
            return (
            <div key={i} ref={isLastBot ? lastBotRef : undefined} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
              {msg.role === 'bot' && <div className="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center text-sm flex-shrink-0">🌸</div>}
              <div className="max-w-[80%] flex flex-col gap-2">
                <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-navy to-navy-light text-white rounded-2xl rounded-br-sm shadow-md shadow-navy/15'
                    : 'bg-white text-text rounded-2xl rounded-bl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
                {msg.products?.map(p => (
                  <Link key={p.id} href={`/shop/${p.slug}`}
                    className="bg-white rounded-xl border border-navy/5 overflow-hidden hover:shadow-md transition-all block">
                    <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${p.brand?.color || '#3a7cc5'}, ${p.brand?.color || '#3a7cc5'}60)` }} />
                    <div className="p-3 flex gap-3 items-center">
                      <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-cream flex items-center justify-center">
                        {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xl">{p.icon}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-[1px]" style={{ color: p.brand?.color }}>{p.brand?.name}</div>
                        <div className="font-semibold text-sm text-navy truncate">{p.name}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-display text-base font-bold text-navy">€{p.price.toFixed(2).replace('.', ',')}</div>
                        <button onClick={(e) => { e.preventDefault(); addToCart(p); }}
                          className="mt-1 px-2.5 py-0.5 rounded-md bg-coral/10 text-coral text-[10px] font-bold">
                          + Mand
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className={`text-[10px] text-text-faint ${msg.role === 'user' ? 'text-right' : 'text-left'} px-1`}>{msg.time}</div>
              </div>
            </div>
            )
          })}

          {typing && (
            <div className="flex gap-2 items-end">
              <div className="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center text-sm">🌸</div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(j => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full bg-text-faint animate-bounce" style={{ animationDelay: `${j * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-navy/5 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex gap-2.5">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(input) }}
            placeholder="Stel je vraag of typ een #hashtag..."
            className="flex-1 px-5 py-3 rounded-full border border-navy/10 text-sm bg-cream focus:bg-white transition-all" />
          <button type="button" onClick={() => send(input)}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all ${
              input.trim() ? 'bg-gradient-to-br from-coral to-coral-soft text-white shadow-md shadow-coral/20' : 'bg-navy/5 text-text-faint'
            }`}>
            →
          </button>
        </div>
        <p className="text-center text-[10px] text-text-faint mt-1.5">Bloomie biedt productadvies, geen medisch advies.</p>
      </div>
    </div>
  )
}
