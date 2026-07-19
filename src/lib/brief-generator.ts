import { sentimentHeuristic } from '@/lib/gdelt'
import type { GdeltArticle, GdeltVolumePoint } from '@/lib/gdelt'

// ─── Brief quotidien IA — génération à partir des articles GDELT réels ──────
// Deux moteurs : heuristique locale (par défaut, aucune donnée envoyée) et
// API LLM externe optionnelle (clé fournie par l'utilisateur, stockée en local).

export interface BriefItem {
  text: string
  url?: string
  domain?: string
}

export interface LiveBrief {
  engine: 'heuristic' | 'llm'
  articleCount: number
  generatedAt: Date
  synthese: string[]
  signauxFaibles: BriefItem[]
  incidents: BriefItem[]
  recommandations: string[]
}

export interface LlmConfig {
  baseUrl: string
  apiKey: string
  model: string
}

export const DEFAULT_LLM_CONFIG: LlmConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
}

const LLM_STORAGE_KEY = 'bastion.llmConfig'
const LLM_TIMEOUT_MS = 10_000
const NEGATIVE_RATIO_THRESHOLD = 0.35
const SPIKE_FACTOR = 1.8

export function loadLlmConfig(): LlmConfig {
  try {
    const raw = localStorage.getItem(LLM_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_LLM_CONFIG }
    const parsed = JSON.parse(raw) as Partial<LlmConfig>
    return {
      baseUrl: typeof parsed.baseUrl === 'string' && parsed.baseUrl.trim() ? parsed.baseUrl : DEFAULT_LLM_CONFIG.baseUrl,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: typeof parsed.model === 'string' && parsed.model.trim() ? parsed.model : DEFAULT_LLM_CONFIG.model,
    }
  } catch {
    return { ...DEFAULT_LLM_CONFIG }
  }
}

export function saveLlmConfig(config: LlmConfig): void {
  try {
    localStorage.setItem(LLM_STORAGE_KEY, JSON.stringify(config))
  } catch {
    // stockage indisponible (mode privé) — la config reste en mémoire
  }
}

// ─── Taxonomie des sujets (FR / EN / RO / PL) ────────────────────────────────

const AUTRES = 'Autres sujets'

const TOPICS: { label: string; keywords: string[] }[] = [
  {
    label: 'Finances & budget',
    keywords: [
      'budget', 'buget', 'budżet', 'budzet', 'finanț', 'finant', 'fonduri', 'fonds', 'funds',
      ' bani', 'argent', 'taxe', 'impozit', 'podatk', 'dotac', 'subven', 'datorie', 'dette',
      ' lei', 'euro', ' eur', 'milion', 'million', 'pieniądz', 'pieniadz', 'cheltuiel', 'wydatek',
    ],
  },
  {
    label: 'Scandale & corruption',
    keywords: [
      'corup', 'corrupt', 'scandal', 'skandal', 'afera', 'fraud', 'fraude', 'oszust', 'kłamst',
      'klamst', 'dosar', 'détourn', 'deturn', 'areszt', 'spisek', 'abuz', 'dezinform', 'hoax',
      'fake', 'manipul',
    ],
  },
  {
    label: 'Sécurité & ordre public',
    keywords: [
      'securit', 'siguranț', 'sigurant', 'bezpiecz', 'polic', 'poliți', 'incend', 'pożar', 'pozar',
      'accident', 'wypad', 'kradzież', 'furt', 'crim', 'infrac', 'agresi', 'viol',
    ],
  },
  {
    label: 'Urbanisme & travaux',
    keywords: [
      'urbanis', 'travaux', 'chantier', 'construc', 'budow', 'drog', ' drum', 'voirie', 'permis',
      'rénov', 'renov', 'moderniz', 'trotuar', 'chodnik', 'infrastructur', 'quai', 'halles',
    ],
  },
  {
    label: 'Candidat & élections',
    keywords: [
      'alegeri', 'élection', 'election', 'wybor', 'candidat', 'kandydat', 'campagne', 'kampan',
      'sondaj', 'sondage', 'sondaż', 'sondaz', 'vot', 'głos', 'glos', 'scrutin', 'maire', 'primar',
      'mayor', 'burmistrz', 'prezyden', 'débat', 'dezbatere', 'conseil municipal', 'consiliu',
    ],
  },
  {
    label: 'Transport & mobilité',
    keywords: [
      'transport', 'tramvai', 'tramway', 'tramwaj', 'autobuz', 'autobus', ' bus ', 'navette',
      ' tren', 'train', 'kolej', 'mobilité', 'mobilitat', 'metro', 'vélo', 'rower', 'trafic',
    ],
  },
  {
    label: 'Culture & vie locale',
    keywords: [
      'cultur', 'festival', 'muzeu', 'musée', 'teatr', 'théâtre', 'bibliot', 'médiath', 'sport',
      'concert', 'spectacle', 'école', 'school', 'școal', 'scoal', 'szkoł', 'szkol', ' parc', ' park',
    ],
  },
  {
    label: 'Cybersécurité',
    keywords: [
      'cyber', 'hack', 'phishing', 'rançon', 'ransomware', 'fuite de données', 'data leak',
      'scurgeri de date', 'atak',
    ],
  },
]

function classifyTopic(title: string): string {
  const t = ` ${title.toLowerCase()} `
  let best = AUTRES
  let bestScore = 0
  for (const topic of TOPICS) {
    let score = 0
    for (const kw of topic.keywords) if (t.includes(kw)) score++
    if (score > bestScore) {
      bestScore = score
      best = topic.label
    }
  }
  return best
}

// ─── Détection de pic de volume ──────────────────────────────────────────────

interface Spike {
  label: string
  value: number
  factor: number
}

function detectSpike(volume: GdeltVolumePoint[] | null): Spike | null {
  if (!volume || volume.length < 3) return null
  const values = volume.map((v) => v.value)
  const max = Math.max(...values)
  const avgOthers = (values.reduce((s, v) => s + v, 0) - max) / (values.length - 1)
  if (avgOthers <= 0 || max < avgOthers * SPIKE_FACTOR) return null
  const day = volume.find((v) => v.value === max)
  if (!day) return null
  return { label: day.label, value: max, factor: max / avgOthers }
}

// ─── Moteur heuristique (chemin A — par défaut) ──────────────────────────────

export function generateHeuristicBrief(
  articles: GdeltArticle[],
  volume: GdeltVolumePoint[] | null,
  queryLabel: string,
): LiveBrief {
  const rows = articles.map((article) => ({
    article,
    sentiment: sentimentHeuristic(article.title),
    topic: classifyTopic(article.title),
  }))
  const n = rows.length

  // Titres négatifs, les plus récents d'abord
  const neg = rows
    .filter((r) => r.sentiment === 'negatif')
    .sort((a, b) => b.article.seendate.localeCompare(a.article.seendate))
  const posCount = rows.filter((r) => r.sentiment === 'positif').length
  const negRatio = n > 0 ? neg.length / n : 0
  const negPct = Math.round(negRatio * 100)

  const sources = new Set(articles.map((a) => a.domain).filter(Boolean)).size
  const countries = new Set(articles.map((a) => a.sourcecountry).filter(Boolean)).size

  // Thèmes dominants (tous articles)
  const byTopic = new Map<string, number>()
  for (const r of rows) byTopic.set(r.topic, (byTopic.get(r.topic) ?? 0) + 1)
  const topTopics = [...byTopic.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)

  const tone =
    n === 0 ? 'indéterminée'
    : negRatio >= 0.4 ? 'plutôt négative'
    : posCount > neg.length ? 'plutôt positive'
    : 'plutôt neutre'

  const dominant = topTopics[0] as [string, number] | undefined

  const synthese: string[] = [
    n > 0
      ? `${n} articles analysés (période 7 jours), ${sources} sources, ${countries} pays. Thèmes dominants : ${topTopics.map(([t, c]) => `${t} (${c})`).join(', ')}. Tonalité globale : ${tone} (${negPct} % de titres à tonalité négative).`
      : 'Aucun article disponible sur la période — la synthèse ne peut pas être établie.',
    `Contexte d’écoute : « ${queryLabel} » (requête GDELT). Analyse produite par le moteur heuristique local de Bastion — aucune donnée n’a quitté le navigateur.`,
  ]

  // Signaux faibles : jusqu'à 3 titres négatifs (cliquables)
  const signauxFaibles: BriefItem[] = neg.slice(0, 3).map((r) => ({
    text: r.article.title,
    url: r.article.url,
    domain: r.article.domain,
  }))
  if (signauxFaibles.length === 0) {
    signauxFaibles.push({ text: 'Aucun titre à tonalité négative parmi les articles récupérés.' })
  }

  // Incidents : campagne négative et/ou pic de volume
  const incidents: BriefItem[] = []
  if (negRatio >= NEGATIVE_RATIO_THRESHOLD && neg.length > 0) {
    const negByTopic = new Map<string, typeof neg>()
    for (const r of neg) {
      const arr = negByTopic.get(r.topic) ?? []
      arr.push(r)
      negByTopic.set(r.topic, arr)
    }
    const negTop = [...negByTopic.entries()].sort((a, b) => b[1].length - a[1].length)[0] as
      | [string, typeof neg]
      | undefined
    if (negTop) {
      const [topic, topicRows] = negTop
      incidents.push({
        text: `Possible campagne négative autour de « ${topic} » : ${topicRows.length} titres négatifs (${negPct} % de l’ensemble).`,
      })
      for (const r of topicRows.slice(0, 2)) {
        incidents.push({ text: r.article.title, url: r.article.url, domain: r.article.domain })
      }
    }
  }
  const spike = detectSpike(volume)
  if (spike) {
    incidents.push({
      text: `Pic de volume inhabituel le ${spike.label} : ${spike.value} articles (×${spike.factor.toFixed(1)} vs moyenne de la période).`,
    })
  }
  if (incidents.length === 0) {
    incidents.push({ text: 'Aucun incident majeur détecté sur la période.' })
  }

  // Recommandations : règles simples dérivées des constats
  const recommandations: string[] = []
  if (negRatio >= NEGATIVE_RATIO_THRESHOLD && neg.length > 0) {
    const negTopic = classifyTopic(neg[0].article.title)
    recommandations.push(
      `Préparer des éléments de langage factuels sur « ${negTopic} » et un Q&R validé avant la prochaine prise de parole publique.`,
    )
  }
  if (spike) {
    recommandations.push(
      `Surveillance renforcée tant que le pic du ${spike.label} n’est pas retombé : rafraîchir l’écoute toutes les 2 heures et vérifier l’origine des nouveaux articles.`,
    )
  }
  if (dominant) {
    recommandations.push(
      `Capitaliser sur le thème dominant « ${dominant[0]} » (${dominant[1]} articles) dans la communication de la semaine, en y associant un angle positif.`,
    )
  }
  if (posCount > 0 && negRatio < NEGATIVE_RATIO_THRESHOLD) {
    recommandations.push(
      `Relayer les ${posCount} titres favorables auprès des relais locaux pour consolider la tonalité actuelle.`,
    )
  }
  if (n < 5) {
    recommandations.push(
      'Volume faible : envisager d’élargir la requête GDELT (variantes orthographiques, communes voisines) pour fiabiliser l’analyse.',
    )
  }
  recommandations.push('Maintenir la veille standard : nouvelle génération de brief recommandée dans 24 heures.')

  return {
    engine: 'heuristic',
    articleCount: n,
    generatedAt: new Date(),
    synthese,
    signauxFaibles,
    incidents,
    recommandations: recommandations.slice(0, 4),
  }
}

// ─── Moteur LLM externe (chemin B — optionnel) ───────────────────────────────

function parseBriefJson(content: string): Pick<LiveBrief, 'synthese' | 'signauxFaibles' | 'incidents' | 'recommandations'> {
  const cleaned = content.replace(/```(?:json)?/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('Réponse LLM non JSON')
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>
  const asStrings = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : []
  const synthese = asStrings(parsed.synthese)
  const recommandations = asStrings(parsed.recommandations)
  if (synthese.length === 0 || recommandations.length === 0) throw new Error('Brief LLM incomplet')
  const signaux = asStrings(parsed.signauxFaibles)
  const incidents = asStrings(parsed.incidents)
  return {
    synthese,
    signauxFaibles: signaux.map((text) => ({ text })),
    incidents: incidents.length > 0 ? incidents.map((text) => ({ text })) : [{ text: 'Aucun incident majeur détecté sur la période.' }],
    recommandations: recommandations.slice(0, 4),
  }
}

export async function generateLlmBrief(
  articles: GdeltArticle[],
  volume: GdeltVolumePoint[] | null,
  queryLabel: string,
  config: LlmConfig,
): Promise<LiveBrief> {
  const sample = articles.slice(0, 20)
  const headlines = sample.map((a, i) => `${i + 1}. [${a.domain}] ${a.title}`).join('\n')
  const volumeLine =
    volume && volume.length > 0
      ? `\nVolume quotidien (7 jours) : ${volume.map((v) => `${v.label} = ${v.value} articles`).join(', ')}.`
      : ''
  const prompt = [
    `Tu es analyste de veille médiatique pour une campagne municipale. Écoute : « ${queryLabel} ».`,
    `À partir de ces ${sample.length} titres de presse réels, rédige en français un brief structuré en 4 sections : synthèse (2 phrases max), signaux faibles (titres négatifs marquants), incidents détectés (campagne négative ou pic de volume, sinon « aucun incident »), recommandations (2 à 4 actions concrètes).`,
    'Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni commentaire : {"synthese": string[], "signauxFaibles": string[], "incidents": string[], "recommandations": string[]}.',
    `Titres :\n${headlines}${volumeLine}`,
  ].join('\n')

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), LLM_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(`${config.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model.trim() || DEFAULT_LLM_CONFIG.model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'Tu es un moteur de brief qui répond exclusivement en JSON valide, en français.' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: ctrl.signal,
    })
  } catch {
    throw new Error('API LLM injoignable (réseau ou délai de 10 s dépassé)')
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) throw new Error(`API LLM : HTTP ${res.status}`)
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content ?? ''
  const parsed = parseBriefJson(content)
  return {
    ...parsed,
    engine: 'llm',
    articleCount: sample.length,
    generatedAt: new Date(),
  }
}

// ─── Détection temps réel → alertes automatiques ─────────────────────────────
// Réutilise la taxonomie (classifyTopic), sentimentHeuristic et les seuils
// NEGATIVE_RATIO_THRESHOLD / SPIKE_FACTOR définis pour le brief.

// Garde-fou : pas d'alerte sur un échantillon trop faible (1 titre négatif sur
// 1 article ne doit pas déclencher une alerte critique à 100 %).
const MIN_ARTICLES_FOR_ALERT = 5

export interface LiveAlertDetection {
  severity: 'elevee' | 'critique'
  title: string
  details: string[]
  links: { title: string; url: string; domain: string }[]
}

/** Campagne négative : ratio de titres négatifs ≥ 35 % (élevée), > 50 % (critique). */
export function detectNegativeCampaign(
  articles: GdeltArticle[],
  queryLabel: string,
  tenantName: string,
): LiveAlertDetection | null {
  if (articles.length < MIN_ARTICLES_FOR_ALERT) return null
  const rows = articles.map((article) => ({
    article,
    sentiment: sentimentHeuristic(article.title),
    topic: classifyTopic(article.title),
  }))
  const neg = rows
    .filter((r) => r.sentiment === 'negatif')
    .sort((a, b) => b.article.seendate.localeCompare(a.article.seendate))
  const negRatio = neg.length / rows.length
  if (negRatio < NEGATIVE_RATIO_THRESHOLD) return null

  const negByTopic = new Map<string, typeof neg>()
  for (const r of neg) {
    const arr = negByTopic.get(r.topic) ?? []
    arr.push(r)
    negByTopic.set(r.topic, arr)
  }
  const top = [...negByTopic.entries()].sort((a, b) => b[1].length - a[1].length)[0] as [string, typeof neg] | undefined
  const theme = top ? top[0] : AUTRES
  const themeRows = top ? top[1] : neg
  const pct = Math.round(negRatio * 100)

  return {
    severity: pct > 50 ? 'critique' : 'elevee',
    title: `Possible campagne négative détectée — ${theme}`,
    details: [
      `${neg.length} titres négatifs sur ${rows.length} articles analysés (${pct} % — seuil ${Math.round(NEGATIVE_RATIO_THRESHOLD * 100)} %).`,
      `Thème le plus visé : « ${theme} » (${themeRows.length} titre${themeRows.length > 1 ? 's' : ''}).`,
      `Tenant : ${tenantName} — écoute « ${queryLabel} » (GDELT, 7 jours).`,
    ],
    links: themeRows.slice(0, 2).map((r) => ({
      title: r.article.title,
      url: r.article.url,
      domain: r.article.domain,
    })),
  }
}

/** Pic de volume : jour maximal ≥ 1,8 × la moyenne des autres jours (série chargée). */
export function detectVolumeSpikeAlert(
  volume: GdeltVolumePoint[] | null,
  queryLabel: string,
  tenantName: string,
): LiveAlertDetection | null {
  const spike = detectSpike(volume)
  if (!spike) return null
  return {
    severity: 'elevee',
    title: 'Pic de volume de mentions détecté',
    details: [
      `${spike.value} articles le ${spike.label} — ×${spike.factor.toFixed(1)} vs moyenne de la période (seuil ×${SPIKE_FACTOR}).`,
      `Tenant : ${tenantName} — écoute « ${queryLabel} » (GDELT, 7 jours).`,
    ],
    links: [],
  }
}
