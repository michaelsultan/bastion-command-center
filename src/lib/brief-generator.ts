import { sentimentHeuristic } from '@/lib/gdelt'
import type { GdeltArticle, GdeltVolumePoint } from '@/lib/gdelt'
import type { Lang } from '@/i18n/LanguageContext'

// ─── Brief quotidien IA — génération à partir des articles GDELT réels ──────
// Deux moteurs : heuristique locale (par défaut, aucune donnée envoyée) et
// API LLM externe optionnelle (clé fournie par l'utilisateur, stockée en local).
// La langue de sortie suit la langue de l'interface.

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

const AUTRES: Record<Lang, string> = { fr: 'Autres sujets', en: 'Other topics' }

const TOPICS: { label: Record<Lang, string>; keywords: string[] }[] = [
  {
    label: { fr: 'Finances & budget', en: 'Finances & budget' },
    keywords: [
      'budget', 'buget', 'budżet', 'budzet', 'finanț', 'finant', 'fonduri', 'fonds', 'funds',
      ' bani', 'argent', 'taxe', 'impozit', 'podatk', 'dotac', 'subven', 'datorie', 'dette',
      ' lei', 'euro', ' eur', 'milion', 'million', 'pieniądz', 'pieniadz', 'cheltuiel', 'wydatek',
    ],
  },
  {
    label: { fr: 'Scandale & corruption', en: 'Scandal & corruption' },
    keywords: [
      'corup', 'corrupt', 'scandal', 'skandal', 'afera', 'fraud', 'fraude', 'oszust', 'kłamst',
      'klamst', 'dosar', 'détourn', 'deturn', 'areszt', 'spisek', 'abuz', 'dezinform', 'hoax',
      'fake', 'manipul',
    ],
  },
  {
    label: { fr: 'Sécurité & ordre public', en: 'Security & public order' },
    keywords: [
      'securit', 'siguranț', 'sigurant', 'bezpiecz', 'polic', 'poliți', 'incend', 'pożar', 'pozar',
      'accident', 'wypad', 'kradzież', 'furt', 'crim', 'infrac', 'agresi', 'viol',
    ],
  },
  {
    label: { fr: 'Urbanisme & travaux', en: 'Urban planning & works' },
    keywords: [
      'urbanis', 'travaux', 'chantier', 'construc', 'budow', 'drog', ' drum', 'voirie', 'permis',
      'rénov', 'renov', 'moderniz', 'trotuar', 'chodnik', 'infrastructur', 'quai', 'halles',
    ],
  },
  {
    label: { fr: 'Candidat & élections', en: 'Candidate & elections' },
    keywords: [
      'alegeri', 'élection', 'election', 'wybor', 'candidat', 'kandydat', 'campagne', 'kampan',
      'sondaj', 'sondage', 'sondaż', 'sondaz', 'vot', 'głos', 'glos', 'scrutin', 'maire', 'primar',
      'mayor', 'burmistrz', 'prezyden', 'débat', 'dezbatere', 'conseil municipal', 'consiliu',
    ],
  },
  {
    label: { fr: 'Transport & mobilité', en: 'Transport & mobility' },
    keywords: [
      'transport', 'tramvai', 'tramway', 'tramwaj', 'autobuz', 'autobus', ' bus ', 'navette',
      ' tren', 'train', 'kolej', 'mobilité', 'mobilitat', 'metro', 'vélo', 'rower', 'trafic',
    ],
  },
  {
    label: { fr: 'Culture & vie locale', en: 'Culture & local life' },
    keywords: [
      'cultur', 'festival', 'muzeu', 'musée', 'teatr', 'théâtre', 'bibliot', 'médiath', 'sport',
      'concert', 'spectacle', 'école', 'school', 'școal', 'scoal', 'szkoł', 'szkol', ' parc', ' park',
    ],
  },
  {
    label: { fr: 'Cybersécurité', en: 'Cybersecurity' },
    keywords: [
      'cyber', 'hack', 'phishing', 'rançon', 'ransomware', 'fuite de données', 'data leak',
      'scurgeri de date', 'atak',
    ],
  },
]

function classifyTopic(title: string, lang: Lang): string {
  const t = ` ${title.toLowerCase()} `
  let best = AUTRES[lang]
  let bestScore = 0
  for (const topic of TOPICS) {
    let score = 0
    for (const kw of topic.keywords) if (t.includes(kw)) score++
    if (score > bestScore) {
      bestScore = score
      best = topic.label[lang]
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

// ─── Chaînes du moteur heuristique ───────────────────────────────────────────

const STR = {
  noArticles: { fr: 'Aucun article disponible sur la période — la synthèse ne peut pas être établie.', en: 'No articles available for the period — the summary cannot be established.' },
  toneUndetermined: { fr: 'indéterminée', en: 'undetermined' },
  toneNegative: { fr: 'plutôt négative', en: 'rather negative' },
  tonePositive: { fr: 'plutôt positive', en: 'rather positive' },
  toneNeutral: { fr: 'plutôt neutre', en: 'rather neutral' },
  noNegative: { fr: 'Aucun titre à tonalité négative parmi les articles récupérés.', en: 'No negative-tone headlines among the fetched articles.' },
  noIncident: { fr: 'Aucun incident majeur détecté sur la période.', en: 'No major incidents detected during the period.' },
  lowVolume: { fr: 'Volume faible : envisager d’élargir la requête GDELT (variantes orthographiques, communes voisines) pour fiabiliser l’analyse.', en: 'Low volume: consider widening the GDELT query (spelling variants, neighboring towns) to make the analysis more reliable.' },
  keepWatching: { fr: 'Maintenir la veille standard : nouvelle génération de brief recommandée dans 24 heures.', en: 'Maintain standard monitoring: next brief generation recommended in 24 hours.' },
} as const

// ─── Moteur heuristique (chemin A — par défaut) ──────────────────────────────

export function generateHeuristicBrief(
  articles: GdeltArticle[],
  volume: GdeltVolumePoint[] | null,
  queryLabel: string,
  lang: Lang = 'fr',
): LiveBrief {
  const rows = articles.map((article) => ({
    article,
    sentiment: sentimentHeuristic(article.title),
    topic: classifyTopic(article.title, lang),
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
    n === 0 ? STR.toneUndetermined[lang]
    : negRatio >= 0.4 ? STR.toneNegative[lang]
    : posCount > neg.length ? STR.tonePositive[lang]
    : STR.toneNeutral[lang]

  const dominant = topTopics[0] as [string, number] | undefined

  const synthese: string[] = [
    n > 0
      ? lang === 'fr'
        ? `${n} articles analysés (période 7 jours), ${sources} sources, ${countries} pays. Thèmes dominants : ${topTopics.map(([t, c]) => `${t} (${c})`).join(', ')}. Tonalité globale : ${tone} (${negPct} % de titres à tonalité négative).`
        : `${n} articles analyzed (7-day window), ${sources} sources, ${countries} countries. Dominant themes: ${topTopics.map(([t, c]) => `${t} (${c})`).join(', ')}. Overall tone: ${tone} (${negPct}% negative-tone headlines).`
      : STR.noArticles[lang],
    lang === 'fr'
      ? `Contexte d’écoute : « ${queryLabel} » (requête GDELT). Analyse produite par le moteur heuristique local de Bastion — aucune donnée n’a quitté le navigateur.`
      : `Listening context: "${queryLabel}" (GDELT query). Analysis produced by Bastion's local heuristic engine — no data left the browser.`,
  ]

  // Signaux faibles : jusqu'à 3 titres négatifs (cliquables)
  const signauxFaibles: BriefItem[] = neg.slice(0, 3).map((r) => ({
    text: r.article.title,
    url: r.article.url,
    domain: r.article.domain,
  }))
  if (signauxFaibles.length === 0) {
    signauxFaibles.push({ text: STR.noNegative[lang] })
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
        text: lang === 'fr'
          ? `Possible campagne négative autour de « ${topic} » : ${topicRows.length} titres négatifs (${negPct} % de l’ensemble).`
          : `Possible negative campaign around "${topic}": ${topicRows.length} negative headlines (${negPct}% of the total).`,
      })
      for (const r of topicRows.slice(0, 2)) {
        incidents.push({ text: r.article.title, url: r.article.url, domain: r.article.domain })
      }
    }
  }
  const spike = detectSpike(volume)
  if (spike) {
    incidents.push({
      text: lang === 'fr'
        ? `Pic de volume inhabituel le ${spike.label} : ${spike.value} articles (×${spike.factor.toFixed(1)} vs moyenne de la période).`
        : `Unusual volume spike on ${spike.label}: ${spike.value} articles (×${spike.factor.toFixed(1)} vs period average).`,
    })
  }
  if (incidents.length === 0) {
    incidents.push({ text: STR.noIncident[lang] })
  }

  // Recommandations : règles simples dérivées des constats
  const recommandations: string[] = []
  if (negRatio >= NEGATIVE_RATIO_THRESHOLD && neg.length > 0) {
    const negTopic = classifyTopic(neg[0].article.title, lang)
    recommandations.push(
      lang === 'fr'
        ? `Préparer des éléments de langage factuels sur « ${negTopic} » et un Q&R validé avant la prochaine prise de parole publique.`
        : `Prepare factual talking points on "${negTopic}" and a validated Q&A before the next public statement.`,
    )
  }
  if (spike) {
    recommandations.push(
      lang === 'fr'
        ? `Surveillance renforcée tant que le pic du ${spike.label} n’est pas retombé : rafraîchir l’écoute toutes les 2 heures et vérifier l’origine des nouveaux articles.`
        : `Enhanced monitoring until the ${spike.label} spike subsides: refresh listening every 2 hours and check the origin of new articles.`,
    )
  }
  if (dominant) {
    recommandations.push(
      lang === 'fr'
        ? `Capitaliser sur le thème dominant « ${dominant[0]} » (${dominant[1]} articles) dans la communication de la semaine, en y associant un angle positif.`
        : `Capitalize on the dominant theme "${dominant[0]}" (${dominant[1]} articles) in this week's communication, with a positive angle.`,
    )
  }
  if (posCount > 0 && negRatio < NEGATIVE_RATIO_THRESHOLD) {
    recommandations.push(
      lang === 'fr'
        ? `Relayer les ${posCount} titres favorables auprès des relais locaux pour consolider la tonalité actuelle.`
        : `Relay the ${posCount} favorable headlines to local relays to consolidate the current tone.`,
    )
  }
  if (n < 5) {
    recommandations.push(STR.lowVolume[lang])
  }
  recommandations.push(STR.keepWatching[lang])

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

function parseBriefJson(content: string, lang: Lang): Pick<LiveBrief, 'synthese' | 'signauxFaibles' | 'incidents' | 'recommandations'> {
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
    incidents: incidents.length > 0 ? incidents.map((text) => ({ text })) : [{ text: STR.noIncident[lang] }],
    recommandations: recommandations.slice(0, 4),
  }
}

export async function generateLlmBrief(
  articles: GdeltArticle[],
  volume: GdeltVolumePoint[] | null,
  queryLabel: string,
  config: LlmConfig,
  lang: Lang = 'fr',
): Promise<LiveBrief> {
  const sample = articles.slice(0, 20)
  const headlines = sample.map((a, i) => `${i + 1}. [${a.domain}] ${a.title}`).join('\n')
  const volumeLine =
    volume && volume.length > 0
      ? lang === 'fr'
        ? `\nVolume quotidien (7 jours) : ${volume.map((v) => `${v.label} = ${v.value} articles`).join(', ')}.`
        : `\nDaily volume (7 days): ${volume.map((v) => `${v.label} = ${v.value} articles`).join(', ')}.`
      : ''
  const prompt =
    lang === 'fr'
      ? [
          `Tu es analyste de veille médiatique pour une campagne municipale. Écoute : « ${queryLabel} ».`,
          `À partir de ces ${sample.length} titres de presse réels, rédige en français un brief structuré en 4 sections : synthèse (2 phrases max), signaux faibles (titres négatifs marquants), incidents détectés (campagne négative ou pic de volume, sinon « aucun incident »), recommandations (2 à 4 actions concrètes).`,
          'Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni commentaire : {"synthese": string[], "signauxFaibles": string[], "incidents": string[], "recommandations": string[]}.',
          `Titres :\n${headlines}${volumeLine}`,
        ].join('\n')
      : [
          `You are a media-monitoring analyst for a municipal campaign. Listening context: "${queryLabel}".`,
          `Based on these ${sample.length} real press headlines, write in English a brief structured in 4 sections: summary (max 2 sentences), weak signals (notable negative headlines), detected incidents (negative campaign or volume spike, otherwise "no incident"), recommendations (2 to 4 concrete actions).`,
          'Reply ONLY with a valid JSON object, no markdown, no comments: {"synthese": string[], "signauxFaibles": string[], "incidents": string[], "recommandations": string[]}.',
          `Headlines:\n${headlines}${volumeLine}`,
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
          {
            role: 'system',
            content:
              lang === 'fr'
                ? 'Tu es un moteur de brief qui répond exclusivement en JSON valide, en français.'
                : 'You are a brief engine that replies exclusively in valid JSON, in English.',
          },
          { role: 'user', content: prompt },
        ],
      }),
      signal: ctrl.signal,
    })
  } catch {
    throw new Error(lang === 'fr' ? 'API LLM injoignable (réseau ou délai de 10 s dépassé)' : 'LLM API unreachable (network or 10 s timeout exceeded)')
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) throw new Error(`API LLM : HTTP ${res.status}`)
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content ?? ''
  const parsed = parseBriefJson(content, lang)
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
  lang: Lang = 'fr',
): LiveAlertDetection | null {
  if (articles.length < MIN_ARTICLES_FOR_ALERT) return null
  const rows = articles.map((article) => ({
    article,
    sentiment: sentimentHeuristic(article.title),
    topic: classifyTopic(article.title, lang),
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
  const theme = top ? top[0] : AUTRES[lang]
  const themeRows = top ? top[1] : neg
  const pct = Math.round(negRatio * 100)

  const plural = lang === 'fr' ? (themeRows.length > 1 ? 's' : '') : themeRows.length > 1 ? 's' : ''
  return {
    severity: pct > 50 ? 'critique' : 'elevee',
    title: lang === 'fr' ? `Possible campagne négative détectée — ${theme}` : `Possible negative campaign detected — ${theme}`,
    details: [
      lang === 'fr'
        ? `${neg.length} titres négatifs sur ${rows.length} articles analysés (${pct} % — seuil ${Math.round(NEGATIVE_RATIO_THRESHOLD * 100)} %).`
        : `${neg.length} negative headlines out of ${rows.length} analyzed articles (${pct}% — threshold ${Math.round(NEGATIVE_RATIO_THRESHOLD * 100)}%).`,
      lang === 'fr'
        ? `Thème le plus visé : « ${theme} » (${themeRows.length} titre${plural}).`
        : `Most-targeted theme: "${theme}" (${themeRows.length} headline${plural}).`,
      lang === 'fr'
        ? `Tenant : ${tenantName} — écoute « ${queryLabel} » (GDELT, 7 jours).`
        : `Tenant: ${tenantName} — listening "${queryLabel}" (GDELT, 7 days).`,
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
  lang: Lang = 'fr',
): LiveAlertDetection | null {
  const spike = detectSpike(volume)
  if (!spike) return null
  return {
    severity: 'elevee',
    title: lang === 'fr' ? 'Pic de volume de mentions détecté' : 'Mention volume spike detected',
    details: [
      lang === 'fr'
        ? `${spike.value} articles le ${spike.label} — ×${spike.factor.toFixed(1)} vs moyenne de la période (seuil ×${SPIKE_FACTOR}).`
        : `${spike.value} articles on ${spike.label} — ×${spike.factor.toFixed(1)} vs period average (threshold ×${SPIKE_FACTOR}).`,
      lang === 'fr'
        ? `Tenant : ${tenantName} — écoute « ${queryLabel} » (GDELT, 7 jours).`
        : `Tenant: ${tenantName} — listening "${queryLabel}" (GDELT, 7 days).`,
    ],
    links: [],
  }
}
