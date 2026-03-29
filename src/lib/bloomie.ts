import type { Product } from '@/lib/supabase'

const KEYWORD_MAP: Record<string, string[]> = {
  "droge huid":["#drogehuid"],"droog":["#drogehuid"],"rimpel":["#rimpels"],"lijntjes":["#rimpels"],
  "slaap":["#nachtrust","#slaap"],"slapen":["#nachtrust"],"slapeloo":["#nachtrust"],
  "nachtrust":["#nachtrust"],"moe":["#energie","#vermoeidheid"],"energie":["#energie"],
  "vermoeid":["#vermoeidheid"],"opvlieger":["#opvliegers"],"overgang":["#overgang"],
  "haar":["#dunnerhaar","#haar"],"dunner haar":["#dunnerhaar"],"nagel":["#nagels"],
  "zon":["#huidbescherming","#spf"],"spf":["#spf"],"glow":["#glow"],"stral":["#glow"],
  "collageen":["#collageen"],"stress":["#stress","#ontspanning"],
  "zweet":["#opvliegers","#overgang","#nachtrust"],"zweten":["#opvliegers","#overgang"],
  "nachtzweet":["#opvliegers","#nachtrust"],"warmte":["#opvliegers"],"heet":["#opvliegers"],
  "stemmingswisseling":["#overgang","#stress"],"prikkelba":["#overgang","#stress"],
  "wakker":["#nachtrust"],"piekeren":["#nachtrust","#stress"],
  "gewricht":["#gewrichten"],"stijf":["#gewrichten"],"pijn":["#spierpijn"],
  "kramp":["#spierpijn"],"angst":["#stress"],"botten":["#botten"],
  "immuun":["#immuunsysteem"],"vitamine":["#supplementen"],"huid":["#drogehuid"],
  "antiaging":["#antiaging"],"anti-aging":["#antiaging"],"oog":["#ogen"],
  "wallen":["#ogen"],"uitgeput":["#energie"],"futloos":["#energie"],
  "supplement":["#supplementen"],"serum":["#glow"],"crème":["#antiaging"],
  "transpir":["#opvliegers","#overgang"],"humeur":["#overgang","#stress"],
  "onrust":["#stress","#ontspanning"],"jeuk":["#drogehuid"],
  "pigment":["#antiaging","#glow"],"verslapt":["#antiaging","#collageen"],
  "lusteloos":["#energie"],"sloom":["#energie"],
  "concentrat":["#energie"],"geheug":["#vitaliteit"],
  "brainfog":["#energie","#vitaliteit"],"brain fog":["#energie","#vitaliteit"],
}

export function findMatchingProducts(text: string, products: Product[]) {
  const lower = text.toLowerCase()
  const hashtagPattern = /#[\w]+/g
  const foundTags = lower.match(hashtagPattern) || []

  for (const [kw, tags] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(kw)) foundTags.push(...tags)
  }

  const uniqueTags = [...new Set(foundTags)]
  if (uniqueTags.length === 0) return { tags: [] as string[], products: [] as Product[] }

  const scored = products
    .map(p => ({ ...p, score: uniqueTags.filter(t => p.tags?.includes(t)).length }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)

  return { tags: uniqueTags, products: scored.slice(0, 3) }
}

export function generateResponse(text: string, tags: string[], matchedProducts: Product[]) {
  const lower = text.toLowerCase()

  if (tags.length === 0) {
    if (["hoi","hallo","hey","hi","dag","goedemorgen","goedemiddag"].some(g => lower.includes(g))) {
      return "Hallo! 👋 Ik ben Bloomie, jouw welzijns-adviseur. Vertel me waar je mee worstelt, of gebruik een #hashtag.\n\nBijvoorbeeld: \"Ik slaap slecht\" of typ #drogehuid"
    }
    return "Ik help je graag verder! 🌸 Probeer het eens met:\n\n• Huid: #drogehuid #rimpels #glow\n• Slaap: #nachtrust\n• Overgang: #opvliegers\n• Energie: #energie\n• Haar: #dunnerhaar\n\nOf beschrijf je klacht in je eigen woorden!"
  }

  const tagStr = tags.slice(0, 3).join(", ")
  const intros = [
    `Goed dat je het vraagt! Voor ${tagStr} heb ik deze aanraders:`,
    `Ik begrijp het. Voor ${tagStr} raad ik aan:`,
    `Dat hoor ik vaker! Voor ${tagStr} zijn dit mijn toppers:`,
  ]
  return intros[Math.floor(Math.random() * intros.length)] + "\n\nKlik op een product voor meer details!"
}
