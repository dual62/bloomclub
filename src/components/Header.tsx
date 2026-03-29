'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { cartCount } = useCart()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Webshop' },
    { href: '/merken', label: 'Merken' },
    { href: '/bloomie', label: 'Bloomie' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-warm/90 backdrop-blur-xl border-b border-navy/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-coral to-gold flex items-center justify-center text-white text-lg">
            🌸
          </div>
          <div>
            <div className="font-bold text-[15px] text-navy tracking-[2px] uppercase leading-none">BLOOMCLUB</div>
            <div className="text-[10px] text-text-faint italic font-display">Vitaal ouder worden</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm font-medium transition-colors pb-0.5 border-b-2 ${
                pathname === l.href
                  ? 'text-coral border-coral font-bold'
                  : 'text-text border-transparent hover:text-coral'
              }`}>
              {l.label}
            </Link>
          ))}

          {/* Cart */}
          <Link href="/cart" className="relative p-1">
            <span className="text-lg">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-coral text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Login */}
          <Link href="/login"
            className="px-5 py-2 rounded-full text-xs font-semibold bg-gradient-to-br from-coral to-coral-soft text-white shadow-md shadow-coral/20 hover:shadow-lg transition-all">
            Inloggen
          </Link>
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/cart" className="relative p-1" onClick={() => setMenuOpen(false)}>
            <span className="text-lg">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-coral text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col gap-1 p-1.5">
            <span className={`block w-5 h-0.5 bg-navy rounded transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-5 h-0.5 bg-navy rounded transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-navy rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-warm border-b border-navy/5 shadow-lg p-4 flex flex-col gap-1 animate-fade-up">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-[15px] font-semibold ${
                pathname === l.href ? 'text-coral bg-coral/5' : 'text-navy'
              }`}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-[15px] font-semibold text-coral bg-coral/5 mt-1">
            Inloggen / Registreren
          </Link>
        </div>
      )}
    </header>
  )
}
