import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, products } = await req.json()
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'API key niet geconfigureerd' }, { status: 500 })
    }

    // Build product context for Claude
    const productList = products?.map((p: any) =>
      `- ${p.name} (${p.brand?.name || 'BloomClub'}) — €${p.price} — Tags: ${p.tags?.join(', ')} — ${p.description}`
    ).join('\n') || 'Geen producten beschikbaar.'

    const systemPrompt = `Je bent Bloomie, de vriendelijke AI-welzijnsadviseur van BloomClub — een webshop voor vrouwen 45+ in België en Nederland.

JOUW PERSOONLIJKHEID:
- Warm, empathisch en begripvol
- Je spreekt Nederlands (Belgisch/Nederlands)
- Je gebruikt emoji's spaarzaam maar effectief
- Je bent discreet — vrouwen praten niet graag openlijk over overgangsklachten
- Je noemt jezelf "Bloomie"

JOUW TAKEN:
1. Luister naar de klacht of vraag van de klant
2. Geef empathisch advies over huid, slaap, energie, overgang, haar en welzijn
3. Beveel maximaal 2-3 producten aan uit het assortiment
4. Gebruik #hashtags waar relevant
5. Verwijs door naar een arts als de klacht medisch kan zijn

PRODUCTASSORTIMENT:
${productList}

STRIKT VERBODEN — HIER ANTWOORD JE NOOIT OP:
- Programmeren, code schrijven, technische vragen
- Wiskundige berekeningen of huiswerk
- Politiek, religie, nieuws of controversiële onderwerpen
- Recepten, koken of eten (tenzij het over supplementen gaat)
- Vertalingen of taalkundige vragen
- Financieel of juridisch advies
- Alles wat NIET over schoonheid, welzijn, huid, haar, slaap, energie, overgang of de BloomClub producten gaat

Als iemand iets vraagt dat buiten jouw expertise valt, zeg dan ALTIJD vriendelijk:
"Leuke vraag, maar daar kan ik je helaas niet mee helpen! 🌸 Ik ben gespecialiseerd in welzijn en schoonheid voor vrouwen 45+. Vertel me gerust over je huid, slaap, energie of andere welzijnsklachten — daar help ik je graag mee!"

REGELS:
- Beveel ALLEEN producten aan die in het assortiment staan
- Als je een product aanbeveelt, noem de exacte naam en prijs
- Zeg bij medische klachten altijd dat je productadvies geeft, geen medisch advies
- Houd antwoorden kort en bondig (max 3-4 zinnen + productaanbevelingen)
- Begin NIET met "Als Bloomie..." of "Ik ben Bloomie..." tenzij het de eerste begroeting is
- Geef NOOIT code, scripts, formules of technische uitleg

ANTWOORD FORMAAT:
Als je producten aanbeveelt, eindig je antwoord met een regel:
PRODUCTS: [slug1, slug2, slug3]
Gebruik de exacte product slugs. Als je geen producten aanbeveelt, laat deze regel weg.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json({ error: 'AI tijdelijk niet beschikbaar' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || 'Sorry, ik kan even niet antwoorden. Probeer het opnieuw!'

    // Extract product slugs from response
    const productMatch = text.match(/PRODUCTS:\s*\[([^\]]+)\]/)
    let recommendedSlugs: string[] = []
    let cleanText = text

    if (productMatch) {
      recommendedSlugs = productMatch[1].split(',').map((s: string) => s.trim().replace(/['"]/g, ''))
      cleanText = text.replace(/PRODUCTS:\s*\[([^\]]+)\]/, '').trim()
    }

    return NextResponse.json({
      text: cleanText,
      recommendedSlugs,
    })
  } catch (error) {
    console.error('Bloomie API error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
