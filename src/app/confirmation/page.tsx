'use client'
import Link from 'next/link'

export default function ConfirmationPage() {
  const orderId = `BC-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`

  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <div className="text-7xl mb-4 animate-breathe">✅</div>
      <h1 className="font-display text-3xl text-navy mb-3">Bedankt voor je bestelling!</h1>
      <p className="text-base text-text-soft mb-2">Bestelnummer: <strong className="text-navy">{orderId}</strong></p>
      <p className="text-sm text-text-faint italic mb-8">
        Je ontvangt een bevestigingsmail met track & trace informatie zodra je bestelling is verzonden.
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/shop" className="px-8 py-3.5 rounded-full bg-gradient-to-br from-navy to-navy-light text-white font-semibold shadow-lg shadow-navy/20">
          Verder winkelen
        </Link>
        <Link href="/" className="px-8 py-3.5 rounded-full border-2 border-navy/10 text-navy font-semibold">
          Naar home
        </Link>
      </div>
    </div>
  )
}
