import { getBrands, getProducts } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import ShopFilters from './ShopFilters'

export const revalidate = 60

export default async function ShopPage() {
  const [brands, products] = await Promise.all([getBrands(), getProducts()])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <div className="text-xs font-semibold tracking-[3px] uppercase text-coral mb-3">Webshop</div>
        <h1 className="font-display text-[clamp(28px,4vw,44px)] text-navy mb-3">Alle producten</h1>
        <p className="text-[15px] text-text-soft">{products.length} producten beschikbaar</p>
      </div>
      <ShopFilters brands={brands} products={products} />
    </div>
  )
}
