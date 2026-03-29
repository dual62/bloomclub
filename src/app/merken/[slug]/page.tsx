import { getBrandBySlug, getProductsByBrand, getBrands } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

export const revalidate = 60

export async function generateStaticParams() {
  const brands = await getBrands()
  return brands.map(b => ({ slug: b.slug }))
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) notFound()

  const products = await getProductsByBrand(brand.id)

  return (
    <div>
      {/* Hero */}
      <div className="py-14 px-6" style={{ background: `linear-gradient(160deg, ${brand.color}10, ${brand.color}04, #fdfaf5)` }}>
        <div className="max-w-7xl mx-auto">
          <Link href="/merken" className="text-sm text-text-soft hover:text-coral transition-colors">← Alle merken</Link>
          <div className="flex items-center gap-6 mt-6 flex-wrap">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg" style={{ background: `${brand.color}12`, boxShadow: `0 8px 24px ${brand.color}15` }}>
              {brand.icon}
            </div>
            <div>
              <h1 className="font-display text-[clamp(30px,4vw,46px)] text-navy leading-tight">{brand.name}</h1>
              <p className="text-base italic font-medium mt-1" style={{ color: brand.color }}>{brand.tagline}</p>
              <div className="flex gap-4 mt-2 text-sm text-text-faint">
                <span>📍 {brand.origin}</span>
                <span>📅 Sinds {brand.founded}</span>
                <span>📦 {products.length} producten</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-base text-text-soft leading-relaxed max-w-2xl mb-10">{brand.description}</p>
        <h2 className="font-display text-2xl text-navy mb-6">Producten van {brand.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  )
}
