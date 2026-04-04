'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Profile = {
  id: string
  name: string
  email: string
  role: string
  brand_id: string | null
  company: string | null
}

export default function VerkoperDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [brand, setBrand] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab] = useState<'overzicht' | 'producten' | 'bestellingen' | 'omzet'>('overzicht')
  const [toast, setToast] = useState('')

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // Check auth & load profile
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthLoading(false); return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (prof) {
        setProfile(prof)
        if (prof.brand_id) {
          await loadData(prof.brand_id)
        }
      }
      setAuthLoading(false)
    }
    init()
  }, [])

  const loadData = async (brandId: string) => {
    setLoading(true)
    const [{ data: b }, { data: p }, { data: o }] = await Promise.all([
      supabase.from('brands').select('*').eq('id', brandId).single(),
      supabase.from('products').select('*').eq('brand_id', brandId).order('sort_order'),
      supabase.from('order_items').select('*, order:orders(*)').eq('product_id', brandId),
    ])

    // Get orders that contain this brand's products
    const { data: brandProducts } = await supabase.from('products').select('id').eq('brand_id', brandId)
    const productIds = (brandProducts || []).map(p => p.id)

    let brandOrders: any[] = []
    if (productIds.length > 0) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*, order:orders(*)')
        .in('product_id', productIds)
      
      // Group by order
      const orderMap = new Map()
      ;(items || []).forEach((item: any) => {
        if (item.order) {
          const existing = orderMap.get(item.order.id)
          if (existing) {
            existing.items.push(item)
          } else {
            orderMap.set(item.order.id, { ...item.order, items: [item] })
          }
        }
      })
      brandOrders = Array.from(orderMap.values()).sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    setBrand(b)
    setProducts(p || [])
    setOrders(brandOrders)
    setLoading(false)
  }

  const updateStock = async (id: string, stock: number) => {
    const newStock = Math.max(0, stock)
    await supabase.from('products').update({ stock: newStock }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))
    notify('Voorraad bijgewerkt')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // ─── Not logged in ───
  if (authLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3 animate-spin">🌸</div><p className="text-text-faint">Laden...</p></div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="font-display text-3xl text-navy mb-3">Verkoper Dashboard</h1>
        <p className="text-text-soft mb-6">Log in met je verkopersaccount om je dashboard te bekijken.</p>
        <Link href="/login" className="inline-block px-8 py-3.5 rounded-full bg-gradient-to-br from-navy to-navy-light text-white font-semibold shadow-lg shadow-navy/20">
          Inloggen →
        </Link>
      </div>
    </div>
  )

  if (profile.role !== 'verkoper') return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🛍️</div>
        <h1 className="font-display text-3xl text-navy mb-3">Geen verkopers-account</h1>
        <p className="text-text-soft mb-6">Dit dashboard is alleen voor verkopers. Jouw account is geregistreerd als koper.</p>
        <Link href="/" className="inline-block px-8 py-3.5 rounded-full bg-gradient-to-br from-coral to-coral-soft text-white font-semibold">
          Naar de webshop →
        </Link>
      </div>
    </div>
  )

  if (!profile.brand_id) return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="font-display text-3xl text-navy mb-3">Account in behandeling</h1>
        <p className="text-text-soft mb-6">Je verkopersaccount is nog niet gekoppeld aan een merk. Neem contact op met BloomClub via <strong>info@bloomclub.be</strong>.</p>
      </div>
    </div>
  )

  // ─── Calculate stats ───
  const totalSold = products.reduce((s, p) => s + (p.sold || 0), 0)
  const totalRevenue = orders.reduce((s, o) => {
    const orderItems = o.items || []
    return s + orderItems.reduce((is: number, i: any) => is + (parseFloat(i.price) * i.quantity), 0)
  }, 0)
  const thisMonthOrders = orders.filter((o: any) => {
    const d = new Date(o.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthRevenue = thisMonthOrders.reduce((s: number, o: any) => {
    return s + (o.items || []).reduce((is: number, i: any) => is + (parseFloat(i.price) * i.quantity), 0)
  }, 0)

  const tabs = [
    { id: 'overzicht' as const, label: 'Overzicht', icon: '📊' },
    { id: 'producten' as const, label: 'Producten', icon: '📦' },
    { id: 'bestellingen' as const, label: 'Bestellingen', icon: '🧾' },
    { id: 'omzet' as const, label: 'Omzet', icon: '💰' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-navy text-white px-7 py-3 rounded-full text-sm font-semibold shadow-xl z-50 animate-fade-up">✓ {toast}</div>}

      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {brand && (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${brand.color}12` }}>
              {brand.icon}
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl text-navy">{brand?.name || 'Dashboard'}</h1>
            <p className="text-sm text-text-soft mt-1">Welkom, {profile.name} · Verkoper dashboard</p>
          </div>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors">
          Uitloggen
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-navy/5 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-semibold border-b-[3px] transition-all whitespace-nowrap ${
              tab === t.id ? 'text-navy border-coral' : 'text-text-faint border-transparent hover:text-text-soft'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-text-faint"><div className="text-4xl mb-3 animate-spin">🌸</div>Dashboard laden...</div>
      ) : (
        <>
          {/* ═══ OVERZICHT ═══ */}
          {tab === 'overzicht' && (
            <div className="animate-fade-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon="💰" label="Totale omzet" value={`€${totalRevenue.toFixed(2).replace('.', ',')}`} color="#22c55e" />
                <StatCard icon="📈" label="Deze maand" value={`€${monthRevenue.toFixed(2).replace('.', ',')}`} color="#3a7cc5" />
                <StatCard icon="📦" label="Bestellingen" value={String(orders.length)} color="#e2725b" />
                <StatCard icon="🏪" label="Producten" value={String(products.length)} color="#c6a048" />
              </div>

              {/* Low stock alert */}
              {products.filter(p => p.stock <= 5).length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8">
                  <h3 className="text-sm font-bold text-red-600 mb-3">⚠ Lage voorraad</h3>
                  {products.filter(p => p.stock <= 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-red-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.icon}</span>
                        <span className="text-sm font-semibold text-navy">{p.name}</span>
                      </div>
                      <span className="text-sm font-bold text-red-500">{p.stock} op voorraad</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent orders */}
              <h3 className="font-display text-xl text-navy mb-4">Recente bestellingen</h3>
              {orders.length === 0 ? (
                <p className="text-text-faint text-sm">Nog geen bestellingen.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.slice(0, 5).map((o: any) => (
                    <OrderRow key={o.id} order={o} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ PRODUCTEN ═══ */}
          {tab === 'producten' && (
            <div className="animate-fade-up">
              <h2 className="font-display text-2xl text-navy mb-5">Mijn producten ({products.length})</h2>
              <div className="flex flex-col gap-3">
                {products.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-navy/[0.03] flex-wrap">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-cream">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-2xl">{p.icon}</span>}
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <div className="font-semibold text-navy">{p.name}</div>
                      <div className="text-xs text-text-faint">€{parseFloat(p.price).toFixed(2).replace('.', ',')} · {(p.tags || []).join(' ')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-faint">Voorraad:</span>
                      <button onClick={() => updateStock(p.id, p.stock - 1)}
                        className="w-8 h-8 rounded-lg border border-navy/10 bg-cream text-sm font-bold flex items-center justify-center hover:bg-warm-dark transition-colors">−</button>
                      <span className={`font-bold text-base min-w-[30px] text-center ${p.stock <= 5 ? 'text-red-500' : 'text-navy'}`}>{p.stock}</span>
                      <button onClick={() => updateStock(p.id, p.stock + 1)}
                        className="w-8 h-8 rounded-lg border border-navy/10 bg-cream text-sm font-bold flex items-center justify-center hover:bg-warm-dark transition-colors">+</button>
                    </div>
                    {p.badge && <span className="text-[10px] font-bold text-coral bg-coral/8 px-2.5 py-1 rounded-md">{p.badge}</span>}
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${p.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                      {p.stock <= 0 ? 'Uitverkocht' : p.stock <= 5 ? 'Bijna op' : 'Op voorraad'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ BESTELLINGEN ═══ */}
          {tab === 'bestellingen' && (
            <div className="animate-fade-up">
              <h2 className="font-display text-2xl text-navy mb-5">Bestellingen ({orders.length})</h2>
              {orders.length === 0 ? (
                <div className="text-center py-16 text-text-faint">
                  <div className="text-4xl mb-3">🧾</div>
                  <p>Nog geen bestellingen voor jouw producten.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map((o: any) => <OrderRow key={o.id} order={o} expanded />)}
                </div>
              )}
            </div>
          )}

          {/* ═══ OMZET ═══ */}
          {tab === 'omzet' && (
            <div className="animate-fade-up">
              <h2 className="font-display text-2xl text-navy mb-5">Omzet & Statistieken</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon="💰" label="Totale omzet" value={`€${totalRevenue.toFixed(2).replace('.', ',')}`} color="#22c55e" />
                <StatCard icon="📈" label="Deze maand" value={`€${monthRevenue.toFixed(2).replace('.', ',')}`} color="#3a7cc5" />
                <StatCard icon="🛒" label="Bestellingen" value={String(orders.length)} color="#e2725b" />
                <StatCard icon="💸" label="Jouw aandeel (85%)" value={`€${(totalRevenue * 0.85).toFixed(2).replace('.', ',')}`} color="#c6a048" />
              </div>

              {/* Top products */}
              <div className="bg-white rounded-2xl p-6 border border-navy/[0.03] mb-6">
                <h3 className="font-display text-xl text-navy mb-4">Top producten</h3>
                {products
                  .sort((a, b) => (b.sold || 0) - (a.sold || 0))
                  .map((p, i) => (
                    <div key={p.id} className="flex items-center gap-4 py-3 border-b border-navy/[0.03] last:border-0">
                      <span className="text-sm font-bold text-gold w-6">#{i + 1}</span>
                      <span className="text-xl">{p.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-navy">{p.name}</div>
                        <div className="text-xs text-text-faint">€{parseFloat(p.price).toFixed(2).replace('.', ',')} · voorraad: {p.stock}</div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Mollie split info */}
              <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-green-700 mb-2">⚡ Directe uitbetaling via Mollie Split Payments</h3>
                <p className="text-sm text-green-600">Bij elke bestelling wordt jouw aandeel (85%) automatisch en direct naar je bankrekening overgemaakt. Geen wachttijden, geen facturen.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Components ───
function StatCard({ icon, label, value, color }: { icon: string, label: string, value: string, color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-navy/[0.03] flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${color}12` }}>
        {icon}
      </div>
      <div>
        <div className="font-display text-2xl font-bold text-navy leading-none">{value}</div>
        <div className="text-xs text-text-faint mt-1">{label}</div>
      </div>
    </div>
  )
}

function OrderRow({ order, expanded }: { order: any, expanded?: boolean }) {
  const statusColors: Record<string, string> = {
    pending: '#c6a048', paid: '#3a7cc5', processing: '#3a7cc5',
    shipped: '#8a5c9e', delivered: '#22c55e', cancelled: '#ef4444',
  }
  const statusLabels: Record<string, string> = {
    pending: 'In afwachting', paid: 'Betaald', processing: 'In behandeling',
    shipped: 'Verzonden', delivered: 'Afgeleverd', cancelled: 'Geannuleerd',
  }
  const sc = statusColors[order.status] || '#8a97a8'
  const items = order.items || []
  const orderTotal = items.reduce((s: number, i: any) => s + (parseFloat(i.price) * i.quantity), 0)

  return (
    <div className="bg-white rounded-2xl p-5 border border-navy/[0.03]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-semibold text-navy">{order.order_number}</div>
          <div className="text-xs text-text-faint">
            {new Date(order.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: `${sc}15`, color: sc }}>
            {statusLabels[order.status] || order.status}
          </span>
          <span className="font-bold text-navy">€{orderTotal.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>
      {expanded && items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-navy/5">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm text-text-soft py-1.5">
              <span>{item.quantity}× {item.product_name}</span>
              <span className="font-semibold text-navy">€{(parseFloat(item.price) * item.quantity).toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-semibold text-green-600 pt-2 mt-2 border-t border-navy/5">
            <span>Jouw aandeel (85%)</span>
            <span>€{(orderTotal * 0.85).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      )}
      {order.shipping_email && (
        <div className="mt-3 pt-3 border-t border-navy/5 flex gap-3 flex-wrap text-xs text-text-faint">
          <span>📧 {order.shipping_email}</span>
          {order.shipping_city && <span>📍 {order.shipping_city}</span>}
        </div>
      )}
    </div>
  )
}
