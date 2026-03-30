'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase, type Brand, type Product } from '@/lib/supabase'

const ADMIN_PASSWORD = 'BloomClub2026!'

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [tab, setTab] = useState<'brands' | 'products' | 'orders'>('brands')
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuth(true); setPwError(false)
      try { sessionStorage.setItem('bc-admin', 'true') } catch(e) {}
    } else { setPwError(true) }
  }

  useEffect(() => {
    try { if (sessionStorage.getItem('bc-admin') === 'true') setAuth(true) } catch(e) {}
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [{ data: b }, { data: p }, { data: o }] = await Promise.all([
      supabase.from('brands').select('*').order('sort_order'),
      supabase.from('products').select('*, brand:brands(name, slug)').order('sort_order'),
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(50),
    ])
    setBrands(b || [])
    setProducts(p || [])
    setOrders(o || [])
    setLoading(false)
  }

  useEffect(() => { if (auth) loadData() }, [auth])
  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  if (!auth) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-gradient-to-br from-navy to-navy-light flex items-center justify-center text-3xl text-white shadow-xl">🔐</div>
          <h1 className="font-display text-3xl text-navy">Admin Panel</h1>
          <p className="text-text-soft text-sm mt-1">Voer het wachtwoord in</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-navy/5 border border-navy/[0.03]">
          {pwError && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">⚠ Onjuist wachtwoord</div>}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-1.5">Wachtwoord</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') login() }} placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-navy/10 text-sm bg-cream" />
          </div>
          <button onClick={login} className="w-full py-3.5 rounded-xl bg-gradient-to-br from-navy to-navy-light text-white font-bold shadow-lg shadow-navy/20">
            Inloggen →
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-navy text-white px-7 py-3 rounded-full text-sm font-semibold shadow-xl z-50 animate-fade-up">✓ {toast}</div>}

      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-navy">⚙ Admin Panel</h1>
          <p className="text-sm text-text-soft mt-1">{brands.length} merken · {products.length} producten · {orders.length} bestellingen</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="px-4 py-2 rounded-xl bg-navy/5 text-navy text-sm font-semibold">↻ Ververs</button>
          <button onClick={() => { setAuth(false); try { sessionStorage.removeItem('bc-admin') } catch(e) {} }}
            className="px-4 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-semibold">Uitloggen</button>
        </div>
      </div>

      <div className="flex gap-1 mb-8 border-b border-navy/5">
        {([['brands','Merken','🏷️'],['products','Producten','📦'],['orders','Bestellingen','🧾']] as const).map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-3 text-sm font-semibold border-b-[3px] transition-all ${tab === id ? 'text-navy border-coral' : 'text-text-faint border-transparent'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-16 text-text-faint"><div className="text-4xl mb-3 animate-spin">🌸</div>Laden...</div>}
      {!loading && tab === 'brands' && <BrandsTab brands={brands} onRefresh={loadData} notify={notify} />}
      {!loading && tab === 'products' && <ProductsTab products={products} brands={brands} onRefresh={loadData} notify={notify} />}
      {!loading && tab === 'orders' && <OrdersTab orders={orders} onRefresh={loadData} notify={notify} />}
    </div>
  )
}

// ═══════════════════════════════════════════
// IMAGE UPLOAD COMPONENT
// ═══════════════════════════════════════════
function ImageUpload({ currentUrl, onUpload, folder }: { currentUrl?: string | null, onUpload: (url: string) => void, folder: string }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (error) {
      alert('Upload fout: ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path)

    onUpload(publicUrl)
    setUploading(false)
  }

  return (
    <div>
      <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-2">Afbeelding</label>
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-navy/10 overflow-hidden flex items-center justify-center bg-cream flex-shrink-0">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-text-faint">📷</span>
          )}
        </div>
        <div className="flex-1">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              uploading ? 'bg-navy/10 text-text-faint cursor-wait' : 'bg-navy/5 text-navy hover:bg-navy/10'
            }`}>
            {uploading ? '⏳ Uploaden...' : '📁 Foto kiezen'}
          </button>
          <p className="text-[10px] text-text-faint mt-1.5">JPG, PNG of WebP · Max 5MB</p>
          {preview && (
            <button onClick={() => { setPreview(''); onUpload('') }}
              className="text-[11px] text-red-400 mt-1 hover:text-red-600">✕ Verwijderen</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// BRANDS TAB
// ═══════════════════════════════════════════
function BrandsTab({ brands, onRefresh, notify }: { brands: Brand[], onRefresh: () => void, notify: (s: string) => void }) {
  const [editing, setEditing] = useState<Brand | null>(null)
  const [adding, setAdding] = useState(false)
  const emptyBrand = { slug: '', name: '', tagline: '', description: '', color: '#3a7cc5', icon: '🌸', origin: '', founded: '', image_url: '', sort_order: brands.length }

  const saveBrand = async (brand: any, isNew: boolean) => {
    if (!brand.name || !brand.slug) { alert('Naam en slug zijn verplicht'); return }
    if (isNew) {
      const { error } = await supabase.from('brands').insert(brand)
      if (error) { alert('Fout: ' + error.message); return }
      notify('Merk toegevoegd!')
    } else {
      const { error } = await supabase.from('brands').update(brand).eq('id', brand.id)
      if (error) { alert('Fout: ' + error.message); return }
      notify('Merk bijgewerkt!')
    }
    setEditing(null); setAdding(false); onRefresh()
  }

  const deleteBrand = async (id: string) => {
    if (!confirm('Merk verwijderen? Alle producten worden ook verwijderd.')) return
    await supabase.from('brands').delete().eq('id', id)
    notify('Merk verwijderd'); onRefresh()
  }

  if (editing || adding) return <BrandForm brand={editing || emptyBrand} isNew={adding} onSave={saveBrand} onCancel={() => { setEditing(null); setAdding(false) }} />

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-display text-2xl text-navy">Merken ({brands.length})</h2>
        <button onClick={() => setAdding(true)} className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-coral to-coral-soft text-white text-sm font-bold shadow-md shadow-coral/20">+ Nieuw merk</button>
      </div>
      <div className="flex flex-col gap-3">
        {brands.map(b => (
          <div key={b.id} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-navy/[0.03] flex-wrap">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${b.color}12` }}>
              {b.image_url ? <img src={b.image_url} alt={b.name} className="w-full h-full object-cover" /> : b.icon}
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold text-navy">{b.name}</div>
              <div className="text-xs text-text-faint">{b.slug} · {b.origin} · {b.founded}</div>
            </div>
            <span className="text-xs px-3 py-1 rounded-lg font-semibold" style={{ background: `${b.color}10`, color: b.color }}>{b.tagline}</span>
            <div className="flex gap-2">
              <button onClick={() => setEditing(b)} className="px-4 py-2 rounded-lg bg-navy/5 text-navy text-xs font-semibold">✏ Bewerk</button>
              <button onClick={() => deleteBrand(b.id)} className="px-4 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-semibold">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BrandForm({ brand, isNew, onSave, onCancel }: { brand: any, isNew: boolean, onSave: (b: any, isNew: boolean) => void, onCancel: () => void }) {
  const [form, setForm] = useState({ ...brand })
  const upd = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))
  const colors = ['#e2725b', '#3a7cc5', '#c6a048', '#8a5c9e', '#5a9e6b', '#e06090', '#4a8c8c', '#c47030']
  const icons = ['🧴', '💊', '🖌️', '✨', '🫖', '🌸', '💫', '🌿', '🌙', '☀️', '💎', '🍃']

  return (
    <div className="max-w-2xl">
      <button onClick={onCancel} className="text-sm text-text-soft hover:text-coral mb-4 block">← Terug</button>
      <h2 className="font-display text-2xl text-navy mb-6">{isNew ? 'Nieuw merk' : `${form.name} bewerken`}</h2>
      <div className="bg-white rounded-2xl p-7 border border-navy/[0.03] flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Naam *" value={form.name} onChange={(v: string) => { upd('name', v); if (isNew) upd('slug', v.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')) }} />
          <Field label="Slug *" value={form.slug} onChange={(v: string) => upd('slug', v)} />
        </div>
        <Field label="Tagline" value={form.tagline || ''} onChange={(v: string) => upd('tagline', v)} />
        <Field label="Beschrijving" value={form.description || ''} onChange={(v: string) => upd('description', v)} multiline />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Land" value={form.origin || ''} onChange={(v: string) => upd('origin', v)} />
          <Field label="Opgericht" value={form.founded || ''} onChange={(v: string) => upd('founded', v)} />
        </div>

        <ImageUpload currentUrl={form.image_url} onUpload={(url) => upd('image_url', url)} folder="brands" />

        <div>
          <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-2">Kleur</label>
          <div className="flex gap-2 flex-wrap">
            {colors.map(c => (
              <div key={c} onClick={() => upd('color', c)}
                className={`w-9 h-9 rounded-lg cursor-pointer transition-all ${form.color === c ? 'ring-2 ring-navy ring-offset-2 scale-110' : ''}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-2">Icoon</label>
          <div className="flex gap-2 flex-wrap">
            {icons.map(ic => (
              <div key={ic} onClick={() => upd('icon', ic)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl cursor-pointer ${form.icon === ic ? 'bg-coral/10 ring-2 ring-coral' : 'bg-navy/[0.03]'}`}>{ic}</div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-navy/5">
          <button onClick={onCancel} className="px-6 py-3 rounded-xl border border-navy/10 text-text-soft font-semibold text-sm">Annuleren</button>
          <button onClick={() => { const { id, created_at, updated_at, is_active, ...rest } = form; onSave(isNew ? rest : form, isNew) }}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-coral to-coral-soft text-white font-bold text-sm shadow-md shadow-coral/20">
            {isNew ? 'Toevoegen' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// PRODUCTS TAB
// ═══════════════════════════════════════════
function ProductsTab({ products, brands, onRefresh, notify }: { products: any[], brands: Brand[], onRefresh: () => void, notify: (s: string) => void }) {
  const [editing, setEditing] = useState<any>(null)
  const [adding, setAdding] = useState(false)
  const emptyProduct = { name: '', slug: '', description: '', long_description: '', price: 0, icon: '🌸', badge: '', tags: [], stock: 0, brand_id: brands[0]?.id || '', image_url: '' }

  const saveProduct = async (product: any, isNew: boolean) => {
    if (!product.name || !product.slug || !product.brand_id) { alert('Naam, slug en merk zijn verplicht'); return }
    const data = { ...product, price: parseFloat(product.price) || 0, stock: parseInt(product.stock) || 0 }
    if (isNew) {
      const { error } = await supabase.from('products').insert(data)
      if (error) { alert('Fout: ' + error.message); return }
      notify('Product toegevoegd!')
    } else {
      const { error } = await supabase.from('products').update(data).eq('id', product.id)
      if (error) { alert('Fout: ' + error.message); return }
      notify('Product bijgewerkt!')
    }
    setEditing(null); setAdding(false); onRefresh()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Product verwijderen?')) return
    await supabase.from('products').delete().eq('id', id)
    notify('Product verwijderd'); onRefresh()
  }

  const updateStock = async (id: string, stock: number) => {
    await supabase.from('products').update({ stock: Math.max(0, stock) }).eq('id', id)
    onRefresh()
  }

  if (editing || adding) return <ProductForm product={editing || emptyProduct} brands={brands} isNew={adding} onSave={saveProduct} onCancel={() => { setEditing(null); setAdding(false) }} />

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-display text-2xl text-navy">Producten ({products.length})</h2>
        <button onClick={() => setAdding(true)} className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-coral to-coral-soft text-white text-sm font-bold shadow-md shadow-coral/20">+ Nieuw product</button>
      </div>
      <div className="flex flex-col gap-3">
        {products.map((p: any) => (
          <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-navy/[0.03] flex-wrap">
            <div className="w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-cream">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xl">{p.icon}</span>}
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="font-semibold text-navy text-sm">{p.name}</div>
              <div className="text-xs text-text-faint">{p.brand?.name} · €{parseFloat(p.price).toFixed(2).replace('.', ',')} · {p.tags?.join(' ')}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-faint">Voorraad:</span>
              <button onClick={() => updateStock(p.id, p.stock - 1)} className="w-7 h-7 rounded-md border border-navy/10 bg-cream text-sm font-bold flex items-center justify-center">−</button>
              <span className={`font-bold text-sm min-w-[24px] text-center ${p.stock <= 5 ? 'text-red-500' : 'text-navy'}`}>{p.stock}</span>
              <button onClick={() => updateStock(p.id, p.stock + 1)} className="w-7 h-7 rounded-md border border-navy/10 bg-cream text-sm font-bold flex items-center justify-center">+</button>
            </div>
            {p.badge && <span className="text-[10px] font-bold text-coral bg-coral/8 px-2.5 py-1 rounded-md">{p.badge}</span>}
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="px-3 py-1.5 rounded-lg bg-navy/5 text-navy text-xs font-semibold">✏</button>
              <button onClick={() => deleteProduct(p.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductForm({ product, brands, isNew, onSave, onCancel }: { product: any, brands: Brand[], isNew: boolean, onSave: (p: any, isNew: boolean) => void, onCancel: () => void }) {
  const [form, setForm] = useState({ ...product, tags: product.tags || [] })
  const [tagInput, setTagInput] = useState('')
  const upd = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))
  const addTag = () => { if (!tagInput.trim()) return; upd('tags', [...form.tags, tagInput.startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`]); setTagInput('') }
  const icons = ['🧴', '💊', '🖌️', '✨', '🫖', '🌸', '💫', '🌿', '🌙', '☀️', '💎', '💨', '👁️', '🐟']

  return (
    <div className="max-w-2xl">
      <button onClick={onCancel} className="text-sm text-text-soft hover:text-coral mb-4 block">← Terug</button>
      <h2 className="font-display text-2xl text-navy mb-6">{isNew ? 'Nieuw product' : `${form.name} bewerken`}</h2>
      <div className="bg-white rounded-2xl p-7 border border-navy/[0.03] flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Naam *" value={form.name} onChange={(v: string) => { upd('name', v); if (isNew) upd('slug', v.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')) }} />
          <Field label="Slug *" value={form.slug} onChange={(v: string) => upd('slug', v)} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-1.5">Merk *</label>
          <select value={form.brand_id} onChange={e => upd('brand_id', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-navy/10 text-sm bg-cream">
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <Field label="Korte beschrijving" value={form.description || ''} onChange={(v: string) => upd('description', v)} multiline />
        <Field label="Uitgebreide beschrijving" value={form.long_description || ''} onChange={(v: string) => upd('long_description', v)} multiline />
        <div className="grid grid-cols-3 gap-4">
          <Field label="Prijs *" value={form.price} onChange={(v: string) => upd('price', v)} />
          <Field label="Voorraad" value={form.stock} onChange={(v: string) => upd('stock', v)} />
          <Field label="Badge" value={form.badge || ''} onChange={(v: string) => upd('badge', v)} placeholder="bijv. Bestseller" />
        </div>

        <ImageUpload currentUrl={form.image_url} onUpload={(url) => upd('image_url', url)} folder="products" />

        <div>
          <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-2">Icoon (fallback)</label>
          <div className="flex gap-2 flex-wrap">
            {icons.map(ic => (
              <div key={ic} onClick={() => upd('icon', ic)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl cursor-pointer ${form.icon === ic ? 'bg-coral/10 ring-2 ring-coral' : 'bg-navy/[0.03]'}`}>{ic}</div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-2">Tags ({form.tags.length})</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.tags.map((tag: string, i: number) => (
              <span key={i} className="text-xs font-semibold text-coral bg-coral/8 px-3 py-1 rounded-lg flex items-center gap-1.5">
                {tag}<span onClick={() => upd('tags', form.tags.filter((_: any, j: number) => j !== i))} className="cursor-pointer opacity-50 hover:opacity-100">×</span>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="#nieuwetag" className="flex-1 px-4 py-2 rounded-xl border border-navy/10 text-sm bg-cream" />
            <button onClick={addTag} className="px-4 py-2 rounded-xl bg-navy text-white text-sm font-bold">+</button>
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-navy/5">
          <button onClick={onCancel} className="px-6 py-3 rounded-xl border border-navy/10 text-text-soft font-semibold text-sm">Annuleren</button>
          <button onClick={() => { const { id, created_at, updated_at, is_active, brand, sort_order, ...rest } = form; onSave(isNew ? rest : form, isNew) }}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-coral to-coral-soft text-white font-bold text-sm shadow-md shadow-coral/20">
            {isNew ? 'Toevoegen' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// ORDERS TAB
// ═══════════════════════════════════════════
function OrdersTab({ orders, onRefresh, notify }: { orders: any[], onRefresh: () => void, notify: (s: string) => void }) {
  const statusColors: Record<string, string> = { pending: '#c6a048', paid: '#3a7cc5', processing: '#3a7cc5', shipped: '#8a5c9e', delivered: '#22c55e', cancelled: '#ef4444' }
  const statusLabels: Record<string, string> = { pending: 'In afwachting', paid: 'Betaald', processing: 'In behandeling', shipped: 'Verzonden', delivered: 'Afgeleverd', cancelled: 'Geannuleerd' }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    notify('Status bijgewerkt'); onRefresh()
  }

  if (orders.length === 0) return (
    <div className="text-center py-16 text-text-faint"><div className="text-4xl mb-3">🧾</div><p>Nog geen bestellingen.</p></div>
  )

  return (
    <div>
      <h2 className="font-display text-2xl text-navy mb-5">Bestellingen ({orders.length})</h2>
      <div className="flex flex-col gap-3">
        {orders.map((o: any) => {
          const sc = statusColors[o.status] || '#8a97a8'
          return (
            <div key={o.id} className="bg-white rounded-2xl p-5 border border-navy/[0.03]">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="font-semibold text-navy">{o.order_number}</div>
                  <div className="text-xs text-text-faint">{new Date(o.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: `${sc}15`, color: sc }}>{statusLabels[o.status] || o.status}</span>
                  <span className="font-bold text-navy">€{parseFloat(o.total).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              {o.order_items?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-navy/5">
                  {o.order_items.map((item: any, i: number) => (
                    <div key={i} className="text-xs text-text-soft py-1">{item.quantity}× {item.product_name} — €{parseFloat(item.price).toFixed(2).replace('.', ',')}</div>
                  ))}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-navy/5 flex gap-3 flex-wrap text-xs text-text-faint">
                {o.shipping_email && <span>📧 {o.shipping_email}</span>}
                {o.shipping_street && <span>📍 {o.shipping_street}, {o.shipping_zip} {o.shipping_city}</span>}
                {o.payment_method && <span>💳 {o.payment_method}</span>}
              </div>
              <div className="mt-3 flex gap-2">
                <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-navy/10 text-xs bg-cream font-semibold">
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════
function Field({ label, value, onChange, placeholder, multiline }: { label: string; value: any; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-text-soft uppercase tracking-[1px] mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-navy/10 text-sm bg-cream resize-y" />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl border border-navy/10 text-sm bg-cream" />
      )}
    </div>
  )
}
