'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!email || !password) { setError('Vul e-mail en wachtwoord in'); return }
    if (mode === 'register' && !name) { setError('Vul je naam in'); return }
    setLoading(true)

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } }
        })
        if (error) throw error
        setSuccess('Account aangemaakt! Check je e-mail om te bevestigen.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
      }
    } catch (e: any) {
      setError(e.message || 'Er ging iets mis')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(ellipse,rgba(189,218,239,0.3),transparent_70%)]" />
      <div className="absolute -bottom-[15%] -left-[5%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(ellipse,rgba(247,206,196,0.2),transparent_65%)]" />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-gradient-to-br from-coral to-gold flex items-center justify-center text-3xl text-white shadow-xl shadow-coral/25">
            🌸
          </div>
          <h1 className="font-display text-3xl text-navy">
            {mode === 'login' ? 'Welkom terug' : 'Account aanmaken'}
          </h1>
          <p className="text-text-soft text-[15px] mt-1.5">
            {mode === 'login' ? 'Log in op je BloomClub account' : 'Word lid van de BloomClub community'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-navy/5 border border-navy/[0.03]">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              ⚠ {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm font-medium">
              ✓ {success}
            </div>
          )}

          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-1.5">Naam</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Je volledige naam"
                className="w-full px-4 py-3 rounded-xl border border-navy/10 text-sm bg-cream transition-all" />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-1.5">E-mailadres</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jouw@email.nl"
              className="w-full px-4 py-3 rounded-xl border border-navy/10 text-sm bg-cream transition-all" />
          </div>

          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-1.5">Wachtwoord</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 tekens"
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
              className="w-full px-4 py-3 rounded-xl border border-navy/10 text-sm bg-cream transition-all" />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all ${
              loading ? 'bg-navy/50 cursor-wait' : 'bg-gradient-to-br from-navy to-navy-light shadow-lg shadow-navy/20 hover:-translate-y-0.5'
            }`}>
            {loading ? 'Even geduld...' : mode === 'login' ? 'Inloggen →' : 'Account aanmaken →'}
          </button>

          <div className="text-center mt-6 pt-5 border-t border-navy/5">
            <p className="text-sm text-text-soft">
              {mode === 'login' ? 'Nog geen account? ' : 'Al een account? '}
              <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
                className="text-coral font-semibold cursor-pointer hover:underline">
                {mode === 'login' ? 'Registreer hier' : 'Log hier in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
