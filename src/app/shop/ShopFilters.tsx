'use client'
import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import type { Brand, Product } from '@/lib/supabase'

export default function ShopFilters({ brands, products }: { brands: Brand[], products: Product[] }) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('popular')

  const filters = [{ id: 'all', label: 'Alles' }, ...brands.map(b => ({ id: b.id, label: b.name }))]
  let filtered = filter === 'all' ? products : products.filter(p => p.brand_id === filter)
  if (sort === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price)

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-3 mb-8">
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === f.id ? 'bg-navy text-white' : 'bg-navy/5 text-text-soft hover:bg-navy/10'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="px-4 py-2 rounded-lg border border-navy/10 bg-cream text-sm cursor-pointer">
          <option value="popular">Populair</option>
          <option value="price-low">Prijs: laag → hoog</option>
          <option value="price-high">Prijs: hoog → laag</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-text-faint">
          <div className="text-4xl mb-3">🔍</div>
          <p>Geen producten gevonden voor dit filter.</p>
        </div>
      )}
    </div>
  )
}
