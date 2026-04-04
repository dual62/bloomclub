import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('RESEND_API_KEY is missing')
    return NextResponse.json({ error: 'E-mail niet geconfigureerd' }, { status: 500 })
  }

  let body: any
  try {
    body = await req.json()
  } catch (e) {
    console.error('Invalid JSON body')
    return NextResponse.json({ error: 'Ongeldige data' }, { status: 400 })
  }

  const order = body.order
  if (!order || !order.address?.email) {
    console.error('Missing order or email:', JSON.stringify(body).slice(0, 200))
    return NextResponse.json({ error: 'E-mailadres ontbreekt' }, { status: 400 })
  }

  const toEmail = order.address.email
  console.log('Sending confirmation to:', toEmail)

  // Build simple HTML email
  const itemRows = (order.items || []).map((item: any) =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${item.qty || item.quantity || 1}× ${item.name || item.product_name || 'Product'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600;">€${(parseFloat(item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2).replace('.', ',')}</td>
    </tr>`
  ).join('')

  const html = `
  <div style="max-width:500px;margin:0 auto;font-family:Arial,sans-serif;color:#1a2940;">
    <div style="text-align:center;padding:24px 0;">
      <div style="font-size:32px;">🌸</div>
      <h1 style="font-size:18px;letter-spacing:2px;margin:8px 0 0;">BLOOMCLUB</h1>
      <p style="font-size:11px;color:#888;margin:2px 0;">Platform voor vitaal ouder worden</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #eee;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:36px;">✅</div>
        <h2 style="font-size:20px;margin:8px 0 4px;">Bedankt voor je bestelling!</h2>
        <p style="font-size:14px;color:#666;">Bestelnummer: <strong>${order.orderNumber || 'BC-2026'}</strong></p>
      </div>
      <table style="width:100%;border-collapse:collapse;">${itemRows}</table>
      <div style="margin-top:16px;padding-top:12px;border-top:2px solid #eee;">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:4px;">
          <span>Subtotaal: €${parseFloat(order.subtotal || 0).toFixed(2).replace('.', ',')}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:8px;">
          <span>Verzending: ${parseFloat(order.shippingCost || 0) === 0 ? 'Gratis' : '€' + parseFloat(order.shippingCost || 0).toFixed(2).replace('.', ',')}</span>
        </div>
        <div style="font-size:18px;font-weight:700;padding-top:8px;border-top:1px solid #eee;">
          Totaal: €${parseFloat(order.total || 0).toFixed(2).replace('.', ',')}
        </div>
      </div>
      <div style="margin-top:20px;padding:12px;background:#f8f4ee;border-radius:8px;font-size:13px;color:#666;">
        <strong style="color:#1a2940;">Bezorgadres:</strong><br>
        ${order.address?.name || ''}<br>
        ${order.address?.street || ''}<br>
        ${order.address?.zip || ''} ${order.address?.city || ''}<br><br>
        📦 ${order.shippingMethod || 'Standaard verzending'}<br>
        💳 ${order.paymentMethod || 'iDEAL'}
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#aaa;margin-top:20px;">
      © 2026 BloomClub · Alle rechten voorbehouden
    </p>
  </div>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'onbofrom: 'BloomClub <noreply@bloomclub.be>',arding@resend.dev',
        to: toEmail,
        subject: `Orderbevestiging ${order.orderNumber || ''} - BloomClub`,
        html: html,
      }),
    })

    const result = await res.json()
    console.log('Resend response:', res.status, JSON.stringify(result))

    if (!res.ok) {
      console.error('Resend error:', result)
      return NextResponse.json({ error: result.message || 'Verzenden mislukt' }, { status: res.status })
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (err: any) {
    console.error('Fetch to Resend failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
