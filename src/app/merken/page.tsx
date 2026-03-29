import { getBrands } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function MerkenPage() {
  const brands = await getBrands()

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-14">
        <div className="text-xs font-semibold tracking-[3px] uppercase text-coral mb-3">Onze Merken</div>
        <h1 className="font-display text-[clamp(28px,4vw,44px)] text-navy mb-3">Enkel het beste uit de Benelux</h1>
        <p className="text-[15px] text-text-soft max-w-md mx-auto">{brands.length} merken beschikbaar</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map(b => (
          <Link key={b.id} href={`/merken/${b.slug}`}
            className="group bg-white rounded-2xl overflow-hidden border border-navy/[0.03] hover:-translate-y-2 hover:shadow-xl transition-all duration-400">
            <div className="h-1 group-hover:h-1.5 transition-all" style={{ background: `linear-gradient(90deg, ${b.color}, ${b.color}90)` }} />
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ background: `${b.color}12` }}>
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-navy">{b.name}</h3>
                  <div className="text-xs text-text-faint">{b.origin} · sinds {b.founded}</div>
                </div>
              </div>
              <p className="text-sm italic font-medium mb-2" style={{ color: b.color }}>{b.tagline}</p>
              <p className="text-sm text-text-soft leading-relaxed line-clamp-2">{b.description}</p>
              <div className="mt-4 pt-4 border-t border-navy/5 flex justify-between items-center">
                <span className="text-xs text-text-faint">Bekijk assortiment</span>
                <span className="text-sm font-semibold" style={{ color: b.color }}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
