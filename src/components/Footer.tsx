import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white pt-16 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="font-bold text-base tracking-[2px]">BLOOMCLUB</div>
            <div className="text-xs italic text-white/40 font-display mb-3">Platform voor vitaal ouder worden</div>
            <p className="text-sm text-white/45 leading-relaxed max-w-[260px]">
              Het platform waar vrouwen 45+ terecht kunnen voor de beste producten en persoonlijk AI-advies.
            </p>
            <div className="flex gap-2 mt-4 flex-wrap">
              {['💳 iDEAL', '💳 Bancontact', '🔒 SSL', '🔒 Mollie'].map(b => (
                <span key={b} className="bg-white/5 border border-white/8 rounded-md px-3 py-1 text-[11px] font-semibold text-white/60">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Webshop */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[2.5px] text-gold-light mb-5">Webshop</h4>
            {['Alle producten', 'Bestsellers', 'Merken'].map(label => (
              <Link key={label} href="/shop" className="block text-sm text-white/50 hover:text-white transition-colors mb-3">
                {label}
              </Link>
            ))}
          </div>

          {/* Merken */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[2.5px] text-gold-light mb-5">Merken</h4>
            {['Centpur', 'VitaminFit', 'SunShield', 'GlowAge', 'PureVital'].map(name => (
              <Link key={name} href={`/merken/${name.toLowerCase()}`} className="block text-sm text-white/50 hover:text-white transition-colors mb-3">
                {name}
              </Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[2.5px] text-gold-light mb-5">Account</h4>
            {[
              { label: 'Inloggen', href: '/login' },
              { label: 'Webshop', href: '/shop' },
              { label: 'Bloomie', href: '/bloomie' },
            ].map(l => (
              <Link key={l.label} href={l.href} className="block text-sm text-white/50 hover:text-white transition-colors mb-3">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-white/5 py-6">
          <p className="text-[11px] text-white/30 text-center italic max-w-xl mx-auto mb-4 leading-relaxed">
            Bloomclub biedt ondersteuning bij welzijn. Onze producten zijn supplementen en verzorging, geen geneesmiddelen. Raadpleeg bij klachten altijd een arts.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-white/25 gap-3">
            <span>© 2026 BloomClub. Alle rechten voorbehouden.</span>
            <div className="flex gap-5">
              {['Algemene Voorwaarden', 'Retourbeleid', 'Privacy', 'Cookies'].map(l => (
                <span key={l} className="hover:text-white/60 cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
