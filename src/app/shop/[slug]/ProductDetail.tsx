'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import type { Product } from '@/lib/supabase'

export default function ProductDetail({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const { addToCart } = useCart()
  const brand = product.brand

  const handleAdd = () => {
    addToCart(product, qty)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/shop" className="text-sm text-text-soft hover:text-coral transition-colors">← Terug naar webshop</Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-7">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden aspect-square relative" style={{ background: `linear-gradient(160deg, ${brand?.color || '#3a7cc5'}08, ${brand?.color || '#3a7cc5'}03)` }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">{product.icon}</div>
          )}
          {product.badge && (
            <span className="absolute top-5 left-5 bg-coral text-white text-xs font-bold px-4 py-1.5 rounded-2xl">{product.badge}</span>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[2px] mb-1.5" style={{ color: brand?.color || '#3a7cc5' }}>
            {brand?.name}
          </div>
          <h1 className="font-display text-3xl font-semibold text-navy mb-3 leading-tight">{product.name}</h1>

          <div className="flex gap-1.5 flex-wrap mb-5">
            {product.tags?.map(t => (
              <span key={t} className="text-[11px] font-semibold text-coral bg-coral/5 px-3 py-1 rounded-lg">{t}</span>
            ))}
          </div>

          <p className="text-[15px] text-text-soft leading-relaxed mb-3">{product.description}</p>
          <p className="text-sm text-text-soft leading-relaxed mb-6">{product.long_description}</p>

          <div className="inline-flex items-center gap-1 bg-gold/8 rounded-lg px-3 py-1 mb-6">
            <span className="text-[11px] font-semibold text-gold">✦ Geselecteerd door onze experts</span>
          </div>

          <div className="font-display text-4xl font-bold text-navy mb-5">
            €{product.price.toFixed(2).replace('.', ',')}
          </div>

          <div className="flex gap-3 items-center mb-5">
            <div className="flex items-center border border-navy/10 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 bg-cream hover:bg-warm-dark text-lg font-bold transition-colors">−</button>
              <span className="w-10 text-center font-bold text-[15px]">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 bg-cream hover:bg-warm-dark text-lg font-bold transition-colors">+</button>
            </div>
            <button onClick={handleAdd}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-br from-navy to-navy-light text-white text-[15px] font-bold shadow-lg shadow-navy/20 hover:-translate-y-0.5 transition-all">
              In winkelmand →
            </button>
          </div>

          {product.stock !== undefined && product.stock <= 10 && product.stock > 0 && (
            <p className="text-xs text-coral font-semibold">⚠ Nog maar {product.stock} op voorraad!</p>
          )}
        </div>
      </div>
    </div>
  )
}
