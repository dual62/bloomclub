'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', street: '', city: '', zip: '', phone: '' })
  const [shipping, setShipping] = useState('standard')
  const [payment, setPayment] = useState('ideal')

  const shippingCost = cartTotal >= 50 ? 0 : (shipping === 'express' ? 7.95 : 4.95)
  const total = cartTotal + shippingCost
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const canNext = step === 1 ? (form.name && form.email && form.street && form.city && form.zip) : true

  const placeOrder = async () => {
    setProcessing(true)

    const orderNumber = `BC-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`
    const orderData = {
      orderNumber,
      items: cart.map(item => ({ name: item.name, brand: item.brand?.name, price: item.price, qty: item.qty })),
      subtotal: cartTotal,
      shippingCost,
      total,
      shippingMethod: shipping === 'express' ? 'Express (1-2 werkdagen)' : 'Standaard (3-5 werkdagen)',
      paymentMethod: payment === 'ideal' ? 'iDEAL' : payment === 'bancontact' ? 'Bancontact' : 'Creditcard',
      address: form,
    }

    // Send confirmation email
    try {
      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderData }),
      })
    } catch (e) {
      console.error('Email sending failed:', e)
    }

    // In production: also save order to Supabase and call Mollie
    clearCart()
    setProcessing(false)
    router.push('/confirmation')
  }

  if (cart.length === 0) return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="text-5xl mb-4">🛒</div>
      <h1 className="font-display text-2xl text-navy mb-3">Je winkelmand is leeg</h1>
      <Link href="/shop" className="text-coral font-semibold">Ga naar de webshop →</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/cart" className="text-sm text-text-soft hover:text-coral">← Terug naar winkelmand</Link>
      <h1 className="font-display text-3xl text-navy mt-5 mb-8">Afrekenen</h1>

      {/* Progress */}
      <div className="flex gap-1 mb-9">
        {['Gegevens', 'Verzending', 'Betaling'].map((s, i) => (
          <div key={i} className={`flex-1 h-1 rounded-sm transition-colors ${i + 1 <= step ? 'bg-coral' : 'bg-navy/5'}`} />
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="animate-fade-up">
          <h2 className="font-display text-2xl text-navy mb-5">Bezorggegevens</h2>
          <div className="bg-white rounded-2xl p-7 border border-navy/[0.03] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Naam *" value={form.name} onChange={v => upd('name', v)} span2 />
            <Input label="E-mail *" value={form.email} onChange={v => upd('email', v)} type="email" span2 />
            <Input label="Straat + huisnr *" value={form.street} onChange={v => upd('street', v)} span2 />
            <Input label="Postcode *" value={form.zip} onChange={v => upd('zip', v)} />
            <Input label="Stad *" value={form.city} onChange={v => upd('city', v)} />
            <Input label="Telefoon" value={form.phone} onChange={v => upd('phone', v)} span2 />
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="animate-fade-up">
          <h2 className="font-display text-2xl text-navy mb-5">Verzendmethode</h2>
          <div className="flex flex-col gap-3">
            {[
              { id: 'standard', label: 'Standaard verzending', desc: '3-5 werkdagen', price: cartTotal >= 50 ? 'Gratis' : '€4,95', icon: '📦' },
              { id: 'express', label: 'Express verzending', desc: '1-2 werkdagen', price: cartTotal >= 50 ? '€3,00' : '€7,95', icon: '⚡' },
            ].map(opt => (
              <div key={opt.id} onClick={() => setShipping(opt.id)}
                className={`bg-white rounded-2xl p-5 flex items-center gap-4 cursor-pointer border-2 transition-all ${shipping === opt.id ? 'border-coral' : 'border-navy/5'}`}>
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1"><div className="font-semibold text-[15px] text-navy">{opt.label}</div><div className="text-xs text-text-faint">{opt.desc}</div></div>
                <span className={`font-bold ${opt.price === 'Gratis' ? 'text-green-500' : 'text-navy'}`}>{opt.price}</span>
                <div className={`w-5 h-5 rounded-full border-2 transition-all ${shipping === opt.id ? 'border-[6px] border-coral' : 'border-navy/15'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="animate-fade-up">
          <h2 className="font-display text-2xl text-navy mb-5">Betaalmethode</h2>
          <div className="flex flex-col gap-3 mb-6">
            {[
              { id: 'ideal', label: 'iDEAL', desc: 'Direct betalen via je bank', icon: '🏦', tag: 'Populair' },
              { id: 'bancontact', label: 'Bancontact', desc: 'Betalen met Bancontact', icon: '💳', tag: 'België' },
              { id: 'creditcard', label: 'Creditcard', desc: 'Visa, Mastercard, Amex', icon: '💎', tag: '' },
            ].map(opt => (
              <div key={opt.id} onClick={() => setPayment(opt.id)}
                className={`bg-white rounded-2xl p-5 flex items-center gap-4 cursor-pointer border-2 transition-all ${payment === opt.id ? 'border-coral' : 'border-navy/5'}`}>
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px] text-navy">{opt.label}</span>
                    {opt.tag && <span className="text-[10px] font-bold text-coral bg-coral/5 px-2 py-0.5 rounded-md">{opt.tag}</span>}
                  </div>
                  <div className="text-xs text-text-faint">{opt.desc}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all ${payment === opt.id ? 'border-[6px] border-coral' : 'border-navy/15'}`} />
              </div>
            ))}
          </div>

          <div className="bg-cream rounded-2xl p-5 border border-navy/[0.03]">
            <h3 className="text-sm font-bold text-navy mb-3">Overzicht</h3>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-text-soft mb-2">
                <span>{item.qty}× {item.name}</span>
                <span className="font-semibold text-navy">€{(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm text-text-soft mb-2 pt-2 border-t border-navy/5">
              <span>Verzending</span>
              <span className={`font-semibold ${shippingCost === 0 ? 'text-green-500' : 'text-navy'}`}>{shippingCost === 0 ? 'Gratis' : `€${shippingCost.toFixed(2).replace('.', ',')}`}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-navy/5 font-bold text-base text-navy">
              <span>Totaal</span><span>€{total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          <p className="text-center text-[11px] text-text-faint mt-3">🔒 Beveiligde betaling via Mollie · SSL versleuteld</p>

          {/* Email notice */}
          <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl text-center">
            <p className="text-xs text-green-700 font-medium">📧 Een bevestigingsmail wordt verstuurd naar <strong>{form.email}</strong></p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-7 justify-between">
        {step > 1 && <button onClick={() => setStep(step - 1)} className="px-7 py-3.5 rounded-xl border border-navy/10 text-text-soft font-semibold text-sm">← Vorige</button>}
        <div className="flex-1" />
        {step < 3 ? (
          <button onClick={() => canNext && setStep(step + 1)}
            className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all ${canNext ? 'bg-gradient-to-br from-navy to-navy-light text-white shadow-lg shadow-navy/20' : 'bg-navy/10 text-text-faint cursor-not-allowed'}`}>
            Volgende →
          </button>
        ) : (
          <button onClick={placeOrder} disabled={processing}
            className={`px-8 py-3.5 rounded-xl font-bold text-[15px] text-white shadow-lg transition-all ${processing ? 'bg-coral/60 cursor-wait' : 'bg-gradient-to-br from-coral to-coral-soft shadow-coral/20'}`}>
            {processing ? '⏳ Bestelling verwerken...' : `Betaal €${total.toFixed(2).replace('.', ',')} →`}
          </button>
        )}
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', span2 }: { label: string; value: string; onChange: (v: string) => void; type?: string; span2?: boolean }) {
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-navy/10 text-sm bg-cream transition-all" />
    </div>
  )
}
