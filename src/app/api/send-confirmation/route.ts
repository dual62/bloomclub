import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { order } = await req.json()
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'E-mail service niet geconfigureerd' }, { status: 500 })
    }

    const itemsHtml = order.items?.map((item: any) =>
      `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ece3;font-size:14px;color:#1a2940;">
          ${item.qty || item.quantity}× ${item.name || item.product_name}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ece3;font-size:14px;color:#1a2940;text-align:right;font-weight:600;">
          €${(parseFloat(item.price) * (item.qty || item.quantity || 1)).toFixed(2).replace('.', ',')}
        </td>
      </tr>`
    ).join('') || ''

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:0;background:#fdfaf5;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
        
        <!-- Header -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-size:36px;margin-bottom:8px;">🌸</div>
          <h1 style="font-size:20px;font-weight:700;color:#163a6b;letter-spacing:3px;margin:0;">BLOOMCLUB</h1>
          <p style="font-size:12px;color:#8a97a8;margin:4px 0 0;font-style:italic;">Platform voor vitaal ouder worden</p>
        </div>

        <!-- Card -->
        <div style="background:#ffffff;border-radius:20px;padding:32px;box-shadow:0 2px 12px rgba(22,58,107,0.06);">
          
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:40px;margin-bottom:12px;">✅</div>
            <h2 style="font-size:22px;color:#163a6b;margin:0 0 4px;">Bedankt voor je bestelling!</h2>
            <p style="font-size:14px;color:#5e7086;margin:0;">Bestelnummer: <strong style="color:#163a6b;">${order.orderNumber || 'BC-2026-XXXX'}</strong></p>
          </div>

          <!-- Order items -->
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr style="background:#f8f4ee;">
              <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#8a97a8;text-transform:uppercase;letter-spacing:1px;">Product</td>
              <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#8a97a8;text-transform:uppercase;letter-spacing:1px;text-align:right;">Bedrag</td>
            </tr>
            ${itemsHtml}
          </table>

          <!-- Totals -->
          <div style="border-top:2px solid #f0ece3;padding-top:16px;margin-top:8px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#5e7086;margin-bottom:6px;">
              <span>Subtotaal</span>
              <span>€${parseFloat(order.subtotal || 0).toFixed(2).replace('.', ',')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#5e7086;margin-bottom:12px;">
              <span>Verzending</span>
              <span>${parseFloat(order.shippingCost || 0) === 0 ? '<span style="color:#22c55e;font-weight:600;">Gratis</span>' : '€' + parseFloat(order.shippingCost).toFixed(2).replace('.', ',')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#163a6b;padding-top:12px;border-top:1px solid #f0ece3;">
              <span>Totaal</span>
              <span>€${parseFloat(order.total || 0).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <!-- Shipping info -->
          <div style="margin-top:24px;padding:16px;background:#f8f4ee;border-radius:12px;">
            <h3 style="font-size:13px;font-weight:700;color:#163a6b;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Bezorggegevens</h3>
            <p style="font-size:13px;color:#5e7086;margin:0;line-height:1.6;">
              ${order.address?.name || ''}<br>
              ${order.address?.street || ''}<br>
              ${order.address?.zip || ''} ${order.address?.city || ''}<br>
              ${order.address?.email || ''}
            </p>
            <p style="font-size:12px;color:#8a97a8;margin:10px 0 0;">
              📦 ${order.shippingMethod || 'Standaard verzending'}<br>
              💳 ${order.paymentMethod || 'iDEAL'}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align:center;margin-top:28px;padding:20px 0;">
          <p style="font-size:13px;color:#5e7086;margin:0 0 8px;">
            Je ontvangt een e-mail met track & trace zodra je bestelling verzonden is.
          </p>
          <p style="font-size:11px;color:#8a97a8;margin:0;font-style:italic;">
            Bloomclub biedt ondersteuning bij welzijn. Onze producten zijn supplementen en verzorging, geen geneesmiddelen.
          </p>
          <p style="font-size:11px;color:#8a97a8;margin:16px 0 0;">
            © 2026 BloomClub · Alle rechten voorbehouden
          </p>
        </div>
      </div>
    </body>
    </html>`

    // Send via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'BloomClub <onboarding@resend.dev>',
        to: [order.address?.email],
        subject: `Orderbevestiging ${order.orderNumber || ''} — BloomClub`,
        html: emailHtml,
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.text()
      console.error('Resend error:', err)
      return NextResponse.json({ error: 'E-mail verzenden mislukt' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
