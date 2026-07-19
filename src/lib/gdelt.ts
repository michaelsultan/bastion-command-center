import type { Sentiment, TenantId } from '@/data/types'
import type { Lang } from '@/i18n/LanguageContext'

// ─── GDELT DOC 2 API — couche d'accès (via proxy Vite /api/gdelt) ───────────

export interface GdeltArticle {
  url: string
  title: string
  seendate: string
  domain: string
  language: string
  sourcecountry: string
}

export interface GdeltVolumePoint {
  label: string // 'DD/MM'
  value: number
}

export const GDELT_QUERIES: Record<TenantId, { query: string; label: Record<Lang, string> }> = {
  marinescu: {
    query: '("Cluj-Napoca" OR Cluj) sourcelang:romanian',
    label: { fr: 'Cluj-Napoca — presse roumaine', en: 'Cluj-Napoca — Romanian press' },
  },
  kowalska: {
    query: '(Gdańsk OR Gdansk) sourcelang:polish',
    label: { fr: 'Gdańsk — presse polonaise', en: 'Gdańsk — Polish press' },
  },
  // Novaria est fictive : requête générique « actualité municipale » (marquée démo)
  novaria: {
    query: '("city council" OR "municipal election" OR mayor) sourcelang:french',
    label: { fr: 'Actualité municipale — requête générique (démo)', en: 'Municipal news — generic query (demo)' },
  },
}

class GdeltError extends Error {
  code: 'rate_limit' | 'network' | 'bad_data'
  constructor(code: 'rate_limit' | 'network' | 'bad_data', message: string) {
    super(message)
    this.code = code
  }
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  let res: Response
  try {
    res = await fetch(url, { signal })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new GdeltError('network', 'Réseau ou proxy indisponible')
  }
  if (!res.ok) throw new GdeltError(res.status === 429 ? 'rate_limit' : 'network', `HTTP ${res.status}`)
  const text = await res.text()
  // GDELT renvoie du texte brut (HTTP 200) en cas de limitation de débit
  if (!text.trimStart().startsWith('{')) {
    throw new GdeltError('rate_limit', 'Limitation de débit GDELT (1 requête / 5 s)')
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new GdeltError('bad_data', 'Réponse GDELT illisible')
  }
}

export function isGdeltRateLimit(e: unknown): boolean {
  return e instanceof GdeltError && e.code === 'rate_limit'
}

export async function fetchGdeltArticles(tenantId: TenantId, signal?: AbortSignal): Promise<GdeltArticle[]> {
  const { query } = GDELT_QUERIES[tenantId]
  const url = `/api/gdelt?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=30&format=json&sort=hybridrel&timespan=7d`
  const json = (await fetchJson(url, signal)) as { articles?: Record<string, unknown>[] }
  if (!Array.isArray(json.articles)) throw new GdeltError('bad_data', 'Champ « articles » absent')
  return json.articles.map((a) => ({
    url: String(a.url ?? ''),
    title: String(a.title ?? ''),
    seendate: String(a.seendate ?? ''),
    domain: String(a.domain ?? ''),
    language: String(a.language ?? ''),
    sourcecountry: String(a.sourcecountry ?? a.sourceCountry ?? ''),
  }))
}

export async function fetchGdeltVolume(tenantId: TenantId, signal?: AbortSignal): Promise<GdeltVolumePoint[]> {
  const { query } = GDELT_QUERIES[tenantId]
  const url = `/api/gdelt?query=${encodeURIComponent(query)}&mode=timelinevolinfo&format=json&timespan=7d`
  const json = (await fetchJson(url, signal)) as { timeline?: Record<string, unknown>[] }
  if (!Array.isArray(json.timeline)) throw new GdeltError('bad_data', 'Champ « timeline » absent')
  // Agrégation par jour (tolérante aux formats YYYYMMDD / YYYY-MM-DD / YYYYMMDDTHHMMSSZ)
  const byDay = new Map<string, number>()
  for (const p of json.timeline) {
    const raw = String(p.date ?? '')
    const m = raw.match(/(\d{4})-?(\d{2})-?(\d{2})/)
    if (!m) continue
    const key = `${m[1]}-${m[2]}-${m[3]}`
    byDay.set(key, (byDay.get(key) ?? 0) + Number(p.value ?? 0))
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([day, value]) => ({ label: `${day.slice(8, 10)}/${day.slice(5, 7)}`, value }))
}

// ─── Heuristique de sentiment (FR / EN / RO / PL) — transparente et locale ──

const NEGATIVE = [
  'scandal', 'skandal', 'fraud', 'fraude', 'corup', 'corrupt', 'acuzat', 'acuzaț', 'acusat', 'accus',
  'afera', 'atak', 'attaque', 'crise', 'crisis', 'menace', 'alerte', 'protest', 'grève', 'greva',
  'échec', 'echec', 'condamn', 'dezinformare', 'rumeur', 'hoax', 'fals', 'fake', 'cyber', 'hack',
  'fuite', 'leak', 'înșel', 'insel', 'abuz', 'dosar', 'enquête', 'klamst', 'oszust', 'zdrad',
  'areszt', 'spisek', 'podejrz', 'refuz', 'refus', 'échec',
]

const POSITIVE = [
  'succès', 'succes', 'sukces', 'aprobata', 'reusit', 'reușit', 'record', 'croissance', 'growth',
  'invest', 'moderniz', 'modernisation', 'premiu', 'premiere', 'distinc', 'victoire', 'victory',
  'lancement', 'lansare', 'parteneriat', 'partenariat', 'ouverture', 'deschidere', 'inaugur',
  'otwarcie', 'zwycięstw', 'zwyciestw', 'rozwoj', 'développement', 'progrès', 'promovabilitate',
]

export function sentimentHeuristic(title: string): Sentiment {
  const t = ` ${title.toLowerCase()} `
  let pos = 0
  let neg = 0
  for (const w of POSITIVE) if (t.includes(w)) pos++
  for (const w of NEGATIVE) if (t.includes(w)) neg++
  if (neg > pos) return 'negatif'
  if (pos > neg) return 'positif'
  return 'neutre'
}

// ─── Formatage ───────────────────────────────────────────────────────────────

export function relativeTime(seendate: string, lang: Lang = 'fr'): string {
  const m = seendate.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/)
  if (!m) return seendate
  const date = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6]))
  const diff = Date.now() - date
  const min = Math.floor(diff / 60000)
  if (lang === 'fr') {
    if (diff < 0) return 'à l’instant'
    if (min < 60) return `il y a ${min} min`
    const h = Math.floor(min / 60)
    if (h < 48) return `il y a ${h} h`
    return `il y a ${Math.floor(h / 24)} j`
  }
  if (diff < 0) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  if (h < 48) return `${h} h ago`
  return `${Math.floor(h / 24)} d ago`
}
