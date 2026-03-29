import Link from 'next/link'
import { getBrands, getProducts } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

export const revalidate = 60 // Refresh data every 60 seconds

export default async function HomePage() {
  const [brands, products] = await Promise.all([getBrands(), getProducts()])
  const featured = products.slice(0, 6)

  const symptoms = [
    { icon: '🌙', title: 'Slaap & Rust', desc: 'Diepe, ongestoorde nachtrust', tags: ['#nachtrust', '#slaap', '#ontspanning'], color: '#7dbce0' },
    { icon: '✨', title: 'Huid & Glow', desc: 'Stralende, gehydrateerde huid', tags: ['#drogehuid', '#glow', '#rimpels'], color: '#e2725b' },
    { icon: '⚡', title: 'Hormonale Balans', desc: 'Ondersteuning bij overgang', tags: ['#opvliegers', '#overgang'], color: '#c6a048' },
    { icon: '💫', title: 'Haar & Vitaliteit', desc: 'Voller haar, meer energie', tags: ['#dunnerhaar', '#energie'], color: '#163a6b' },
  ]

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="min-h-[85vh] flex items-center relative overflow-hidden py-20">
        {/* Background shapes */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(ellipse,rgba(189,218,239,0.35),transparent_70%)] animate-breathe" />
          <div className="absolute -bottom-[10%] -left-[5%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(ellipse,rgba(247,206,196,0.2),transparent_65%)]" />
          <div className="absolute top-[10%] right-[8%] w-72 h-72 border-2 border-gold/10 rounded-full -rotate-12" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-1.5 rounded-full text-[11px] font-semibold text-gold tracking-[2px] uppercase mb-6">
              ✦ Welkom bij BloomClub
            </div>
            <h1 className="font-display text-[clamp(36px,5vw,58px)] leading-[1.1] text-navy mb-5">
              Jouw nieuwe{' '}
              <span className="text-coral italic relative">
                bloei
                <span className="absolute left-[-2%] bottom-0.5 w-[104%] h-2 bg-coral-pale rounded-sm -z-10" />
              </span>{' '}
              begint hier.
            </h1>
            <p className="text-[17px] leading-relaxed text-text-soft max-w-md mb-8">
              Gecureerde oplossingen en AI-ondersteuning voor elke fase van de overgang. Producten die écht werken, persoonlijk geadviseerd door Bloomie.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/bloomie" className="px-8 py-3.5 rounded-full bg-gradient-to-br from-navy to-navy-light text-white font-semibold text-[15px] shadow-lg shadow-navy/20 hover:-translate-y-0.5 transition-all">
                Doe de Vitaliteits-Scan →
              </Link>
              <Link href="/shop" className="px-8 py-3.5 rounded-full border-2 border-navy/10 text-navy font-semibold text-[15px] hover:border-coral hover:text-coral transition-all">
                Bekijk Webshop
              </Link>
            </div>
            <div className="flex gap-9 mt-10 pt-7 border-t border-navy/5">
              {[['12', 'Topmerken'], ['98%', 'Tevreden'], ['24/7', 'AI-advies']].map(([v, l]) => (
                <div key={l}>
                  <strong className="font-display text-3xl text-navy block leading-none">{v}</strong>
                  <span className="text-[11px] text-text-faint uppercase tracking-[1.5px]">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="hidden lg:block animate-fade-up [animation-delay:0.2s]">
            <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-navy/15 border border-gold/10 bg-gradient-to-b from-warm via-sky-pale/30 via-50% to-navy">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-30 animate-breathe">
                🌸
              </div>
              {/* Floating tags */}
              <div className="absolute top-[8%] left-3 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2.5 animate-breathe">
                <div className="w-2.5 h-2.5 rounded-full bg-sky" />
                <div><strong className="text-[13px] text-text block">#nachtrust</strong><span className="text-[11px] text-text-faint">Slaap beter</span></div>
              </div>
              <div className="absolute bottom-[25%] right-3 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2.5 animate-breathe [animation-delay:0.8s]">
                <div className="w-2.5 h-2.5 rounded-full bg-coral" />
                <div><strong className="text-[13px] text-text block">#stralende huid</strong><span className="text-[11px] text-text-faint">Glow routine</span></div>
              </div>
              <div className="absolute bottom-[8%] left-[8%] bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2.5 animate-breathe [animation-delay:1.6s]">
                <div className="w-2.5 h-2.5 rounded-full bg-gold" />
                <div><strong className="text-[13px] text-text block">#energie</strong><span className="text-[11px] text-text-faint">Meer pit</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SYMPTOOM NAVIGATOR ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold tracking-[3px] uppercase text-coral mb-3">Symptoom Navigator</div>
            <h2 className="font-display text-[clamp(26px,3.5vw,42px)] text-navy mb-3">Hoe kunnen we je helpen?</h2>
            <p className="text-[15px] text-text-soft max-w-md mx-auto">Zoek op gevoel, niet op productnaam.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {symptoms.map((cat, i) => (
              <Link href="/shop" key={i}
                className="group bg-white rounded-2xl overflow-hidden border border-navy/[0.03] hover:-translate-y-2 hover:shadow-xl transition-all duration-400">
                <div className="h-1 group-hover:h-1.5 transition-all" style={{ background: `linear-gradient(90deg, ${cat.color}, ${cat.color}90)` }} />
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: `${cat.color}12` }}>
                    {cat.icon}
                  </div>
                  <h3 className="font-display text-xl text-navy mb-2">{cat.title}</h3>
                  <p className="text-sm text-text-soft mb-3">{cat.desc}</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {cat.tags.map(t => (
                      <span key={t} className="text-[11px] font-semibold text-coral bg-coral/5 px-2.5 py-1 rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BLOOMIE PREVIEW ═══ */}
      <section className="py-24 relative">
        <div className="absolute -top-[5%] left-0 right-0 -bottom-[5%] bg-gradient-to-br from-cream via-sky-pale/10 to-warm -skew-y-3 -z-10" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-semibold tracking-[3px] uppercase text-coral mb-3">Maak kennis met Bloomie</div>
            <h2 className="font-display text-[clamp(26px,3.5vw,38px)] text-navy mb-4 leading-tight">Jouw persoonlijke AI-expert</h2>
            <p className="text-base text-text-soft leading-relaxed mb-7">
              Bloomie kent de beste oplossingen en adviseert je discreet en persoonlijk. Gebruik #hashtags om direct bij de juiste producten uit te komen.
            </p>
            <Link href="/bloomie" className="inline-block px-8 py-3.5 rounded-full bg-gradient-to-br from-navy to-navy-light text-white font-semibold shadow-lg shadow-navy/20 hover:-translate-y-0.5 transition-all">
              Start gesprek met Bloomie →
            </Link>
          </div>
          {/* Chat mockup */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-navy/10 overflow-hidden border border-navy/5">
            <div className="bg-gradient-to-br from-navy to-navy-light p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg border-2 border-white/15">🌸</div>
              <div>
                <div className="text-white font-bold text-[15px]">Bloomie</div>
                <div className="text-white/50 text-xs">Online</div>
              </div>
            </div>
            <div className="p-5 bg-cream flex flex-col gap-3 min-h-[200px]">
              <div className="bg-white p-3 px-4 rounded-2xl rounded-bl-sm text-sm text-text leading-relaxed max-w-[85%] shadow-sm">
                Hallo! 👋 Vertel me waar je mee worstelt, of gebruik een #hashtag.
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {['#drogehuid', '#nachtrust', '#opvliegers'].map(t => (
                    <span key={t} className="text-[11px] font-semibold text-coral bg-coral/5 px-2.5 py-0.5 rounded-lg">{t}</span>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy to-blue p-3 px-4 rounded-2xl rounded-br-sm text-sm text-white max-w-[80%] self-end">
                Ik lig veel te zweten &apos;s nachts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ UITGELICHTE PRODUCTEN ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold tracking-[3px] uppercase text-coral mb-3">Webshop</div>
            <h2 className="font-display text-[clamp(26px,3.5vw,42px)] text-navy mb-3">Geselecteerd door experts</h2>
            <p className="text-[15px] text-text-soft max-w-md mx-auto">Topproducten speciaal voor vrouwen 45+.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/shop" className="inline-block px-8 py-3.5 rounded-full border-2 border-navy/10 text-navy font-semibold hover:border-coral hover:text-coral transition-all">
              Bekijk alle producten →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ MERKEN ═══ */}
      <section className="py-20 bg-gradient-to-br from-navy-deep to-navy relative overflow-hidden">
        <div className="absolute -top-[30%] -right-[15%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(ellipse,rgba(58,124,197,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="text-xs font-semibold tracking-[3px] uppercase text-gold-light mb-3">Onze Merken</div>
          <h2 className="font-display text-[clamp(26px,3.5vw,40px)] text-white mb-8">Enkel het beste uit de Benelux</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {brands.map(b => (
              <Link key={b.id} href={`/merken/${b.slug}`}
                className="px-7 py-3.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/10 hover:border-gold-light hover:-translate-y-1 transition-all">
                <span className="font-display text-lg font-semibold text-white/60 hover:text-white transition-colors">{b.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TOP CAROUSEL ═══ */}
      <section className="py-24 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold tracking-[3px] uppercase text-coral mb-3">Bestsellers</div>
            <h2 className="font-display text-[clamp(26px,3.5vw,42px)] text-navy mb-3">Top 5 Meest Verkocht</h2>
            <p className="text-[15px] text-text-soft">Door jullie gekozen!</p>
          </div>
        </div>
        <div className="relative mt-10">
          <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-cream to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-cream to-transparent z-10 pointer-events-none" />
          <div className="flex gap-6 animate-scroll w-max hover:[animation-play-state:paused]">
            {[...products.slice(0, 5), ...products.slice(0, 5)].map((p, i) => (
              <Link key={`${p.id}-${i}`} href={`/shop/${p.slug}`}
                className="min-w-[240px] bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1.5 hover:shadow-md transition-all flex-shrink-0">
                <div className="h-44 flex items-center justify-center text-5xl relative" style={{ background: `linear-gradient(160deg, ${p.brand?.color || '#3a7cc5'}10, ${p.brand?.color || '#3a7cc5'}05)` }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{p.icon}</span>
                  )}
                  {i < 5 && (
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-light text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                      {i + 1}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-display text-base text-navy mb-1">{p.name}</h4>
                  <div className="text-[11px] text-text-faint mb-2">{p.brand?.name}</div>
                  <div className="font-display text-lg font-bold text-coral">€{p.price.toFixed(2).replace('.', ',')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
