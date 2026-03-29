'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import type { Product } from '@/lib/supabase'

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const brand = product.brand

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-navy/[0.03] hover:-translate-y-2 hover:shadow-xl transition-all duration-400 cursor-pointer">
      {/* Image */}
      <Link href={`/shop/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-cream to-warm">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">{product.icon}</div>
          )}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-coral text-white text-[11px] font-bold px-3.5 py-1 rounded-xl">
              {product.badge}
            </span>
          )}
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-semibold text-gold flex items-center gap-1">
            ✦ Expert pick
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="p-5">
        <div className="text-[10px] font-bold uppercase tracking-[1.5px] mb-1" style={{ color: brand?.color || '#3a7cc5' }}>
          {brand?.name || 'BloomClub'}
        </div>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-lg font-semibold text-navy mb-1.5 leading-tight hover:text-coral transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-text-soft leading-relaxed mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-display text-xl font-bold text-navy">
            €{product.price.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-navy-light text-white text-lg flex items-center justify-center shadow-md shadow-navy/20 hover:scale-110 transition-transform"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
