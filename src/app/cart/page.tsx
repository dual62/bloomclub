'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'

export default function CartPage() {
  const { cart, updateQty, cartTotal, cartCount } = useCart()

  if (cart.length === 0) return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h1 className="font-display text-3xl text-navy mb-3">Je winkelmand is leeg</h1>
      <p className="text-text-soft mb-7">Ontdek onze producten of vraag advies aan Bloomie!</p>
      <Link href="/shop" className="inline-block px-8 py-3.5 rounded-full bg-gradient-to-br from-navy to-navy-light text-white font-semibold shadow-lg shadow-navy/20">
        Naar de webshop →
      </Link>
    </div>
  )

  const shipping = cartTotal >= 50 ? 0 : 4.95
  const total = cartTotal + shipping

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-navy mb-8">Winkelmand ({cartCount})</h1>

      <div className="flex flex-col gap-3 mb-8">
        {cart.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-navy/[0.03]">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-cream flex items-center justify-center">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{item.icon}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[15px] text-navy truncate">{item.name}</div>
              <div className="text-xs text-text-faint">{item.brand?.name || ''}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 rounded-lg border border-navy/10 bg-cream text-base font-bold flex items-center justify-center">−</button>
              <span className="w-7 text-center font-bold text-sm">{item.qty}</span>
              <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-lg border border-navy/10 bg-cream text-base font-bold flex items-center justify-center">+</button>
            </div>
            <div className="font-bold text-navy min-w-[70px] text-right">€{(item.price * item.qty).toFixed(2).replace('.', ',')}</div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-7 border border-navy/[0.03]">
        <div className="flex justify-between mb-2 text-sm text-text-soft">
          <span>Subtotaal</span><span>€{cartTotal.toFixed(2).replace('.', ',')}</span>
        </div>
        <div className="flex justify-between mb-2 text-sm text-text-soft">
          <span>Verzending</span>
          <span>{shipping === 0 ? <span className="text-green-500 font-semibold">Gratis</span> : `€${shipping.toFixed(2).replace('.', ',')}`}</span>
        </div>
        {cartTotal < 50 && (
          <p className="text-xs text-gold mb-2">💡 Nog €{(50 - cartTotal).toFixed(2).replace('.', ',')} voor gratis verzending!</p>
        )}
        <div className="flex justify-between pt-3 border-t border-navy/5 text-lg font-bold text-navy">
          <span>Totaal</span>
          <span className="font-display text-2xl">€{total.toFixed(2).replace('.', ',')}</span>
        </div>
        <Link href="/checkout"
          className="block w-full py-4 mt-5 rounded-2xl bg-gradient-to-br from-coral to-coral-soft text-white text-base font-bold text-center shadow-lg shadow-coral/20 hover:-translate-y-0.5 transition-all">
          Naar afrekenen →
        </Link>
      </div>
    </div>
  )
}
