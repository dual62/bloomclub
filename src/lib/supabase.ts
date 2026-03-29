import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Types ───
export type Brand = {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  color: string
  icon: string
  origin: string | null
  founded: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
}

export type Product = {
  id: string
  brand_id: string
  name: string
  slug: string
  description: string | null
  long_description: string | null
  price: number
  compare_price: number | null
  image_url: string | null
  icon: string
  badge: string | null
  tags: string[]
  stock: number
  is_active: boolean
  brand?: Brand
}

export type CartItem = Product & { qty: number }

export type OrderAddress = {
  name: string
  email: string
  street: string
  city: string
  zip: string
  phone: string
}

// ─── Data fetching ───
export async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) console.error('Error fetching brands:', error)
  return (data || []) as Brand[]
}

export async function getBrandBySlug(slug: string) {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) console.error('Error fetching brand:', error)
  return data as Brand | null
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brands(*)')
    .eq('is_active', true)
    .order('sort_order')
  if (error) console.error('Error fetching products:', error)
  return (data || []) as Product[]
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brands(*)')
    .eq('slug', slug)
    .single()
  if (error) console.error('Error fetching product:', error)
  return data as Product | null
}

export async function getProductsByBrand(brandId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brands(*)')
    .eq('brand_id', brandId)
    .eq('is_active', true)
    .order('sort_order')
  if (error) console.error('Error fetching brand products:', error)
  return (data || []) as Product[]
}

export async function getProductsByTag(tag: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brands(*)')
    .contains('tags', [tag])
    .eq('is_active', true)
  if (error) console.error('Error fetching products by tag:', error)
  return (data || []) as Product[]
}
