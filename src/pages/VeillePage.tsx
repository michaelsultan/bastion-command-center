import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  ChevronDown,
  ExternalLink,
  Eye,
  KeyRound,
  Lightbulb,
  Newspaper,
  RefreshCw,
  Signal,
  Sparkles,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LiveBadge } from '@/components/LiveBadge'
import { PageHeader } from '@/components/PageHeader'
import { SentimentBadge } from '@/components/SentimentBadge'
import { SourceIcon } from '@/components/SourceIcon'
import { useCrisis, useEffectiveTenant } from '@/context/CrisisContext'
import { useLiveAlerts } from '@/context/LiveAlertsContext'
import { useTenant } from '@/context/TenantContext'
import { useLanguage } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/en'
import { formatReach } from '@/data'
import type { Sentiment } from '@/data/types'
import {
  fetchGdeltArticles,
  fetchGdeltVolume,
  GDELT_QUERIES,
  isGdeltRateLimit,
  relativeTime,
  sentimentHeuristic,
} from '@/lib/gdelt'
import type { GdeltArticle, GdeltVolumePoint } from '@/lib/gdelt'
import {
  DEFAULT_LLM_CONFIG,
  detectNegativeCampaign,
  detectVolumeSpikeAlert,
  generateHeuristicBrief,
  generateLlmBrief,
  loadLlmConfig,
  saveLlmConfig,
} from '@/lib/brief-generator'
import type { BriefItem, LiveBrief, LlmConfig } from '@/lib/brief-generator'
import { cn } from '@/lib/utils'

const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positif: '#10b981',
  neutre: '#71717a',
  negatif: '#ef4444',
}

const SENTIMENT_KEY: Record<Sentiment, TranslationKey> = {
  positif: 'sentiment.positif',
  neutre: 'sentiment.neutre',
  negatif: 'sentiment.negatif',
}

type Filter = 'toutes' | Sentiment
type Mode = 'demo' | 'live'

function riskColor(r: number): string {
  if (r >= 70) return 'text-red-400'
  if (r >= 50) return 'text-orange-400'
  if (r >= 35) return 'text-amber-400'
  return 'text-emerald-400'
}

function riskBar(r: number): string {
  if (r >= 70) return 'bg-red-500'
  if (r >= 50) return 'bg-orange-500'
  if (r >= 35) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function DemoDataBadge() {
  const { t } = useLanguage()
  return (
    <Badge variant="outline" className="border-zinc-600 bg-zinc-800/60 text-[10px] font-normal text-zinc-400">
      {t('common.demoData')}
    </Badge>
  )
}

// Élément de brief : titre cliquable si l'article source est disponible
function BriefItemRow({ item }: { item: BriefItem }) {
  const body = (
    <>
      {item.text}
      {item.domain && <span className="text-zinc-500"> — {item.domain}</span>}
    </>
  )
  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-start gap-1 transition-colors hover:text-sky-300"
      >
        <span>{body}</span>
        <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-zinc-600 group-hover:text-sky-400" />
      </a>
    )
  }
  return <span>{body}</span>
}

export default function VeillePage() {
  const tenant = useEffectiveTenant()
  const { tenantId } = useTenant()
  const crisis = useCrisis()
  const { reportDetection, alertsForTenant } = useLiveAlerts()
  const { lang, t } = useLanguage()
  const [mode, setMode] = useState<Mode>('demo')
  const [filter, setFilter] = useState<Filter>('toutes')
  const [articles, setArticles] = useState<GdeltArticle[] | null>(null)
  const [volume, setVolume] = useState<GdeltVolumePoint[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [volumeLoading, setVolumeLoading] = useState(false)
  const [volumeError, setVolumeError] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [reloadTick, setReloadTick] = useState(0)
  const [liveBrief, setLiveBrief] = useState<LiveBrief | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [llmConfig, setLlmConfig] = useState<LlmConfig>(() => loadLlmConfig())
  const [llmOpen, setLlmOpen] = useState(false)

  const tenantLiveAlerts = alertsForTenant(tenantId)
  const timeLocale = lang === 'fr' ? 'fr-FR' : 'en-US'
  const queryLabel = GDELT_QUERIES[tenantId].label[lang]

  // La simulation de crise repose sur le récit curé : retour forcé en mode démo
  useEffect(() => {
    if (crisis.active) setMode('demo')
  }, [crisis.active])

  // Récupération GDELT (articles immédiats, série temporelle décalée : 1 req / 5 s)
  useEffect(() => {
    if (mode !== 'live') return
    const ctrl = new AbortController()
    let timer: number | undefined
    const tenantName = tenant.meta.name
    setLoading(true)
    setArticles(null)
    setVolume(null)
    setVolumeError(false)
    setLiveBrief(null)
    fetchGdeltArticles(tenantId, ctrl.signal)
      .then((list) => {
        if (ctrl.signal.aborted) return
        setArticles(list)
        setLastSync(new Date())
        setLoading(false)
        // Détection automatique : campagne négative ≥ 35 % de titres négatifs
        const detection = detectNegativeCampaign(list, queryLabel, tenantName, lang)
        const result = reportDetection(tenantId, tenantName, 'campagne', detection)
        if (result === 'created' && detection) {
          const toastFn = detection.severity === 'critique' ? toast.error : toast.warning
          toastFn(t('ve.toast.alertCreated', { title: detection.title }), {
            description: t('ve.toast.alertCreated.desc'),
          })
        }
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return
        setLoading(false)
        toast.error(t('ve.toast.fail.title'), {
          description: isGdeltRateLimit(err) ? t('ve.toast.fail.rate') : t('ve.toast.fail.net'),
        })
        setMode('demo')
      })
    setVolumeLoading(true)
    timer = window.setTimeout(() => {
      fetchGdeltVolume(tenantId, ctrl.signal)
        .then((points) => {
          if (ctrl.signal.aborted) return
          setVolume(points)
          setVolumeLoading(false)
          // Détection automatique : pic de volume ≥ 1,8 × la moyenne de la période
          const detection = detectVolumeSpikeAlert(points, queryLabel, tenantName, lang)
          const result = reportDetection(tenantId, tenantName, 'pic', detection)
          if (result === 'created' && detection) {
            toast.warning(t('ve.toast.alertCreated', { title: detection.title }), {
              description: t('ve.toast.alertCreated.desc'),
            })
          }
        })
        .catch(() => {
          if (ctrl.signal.aborted) return
          setVolumeError(true)
          setVolumeLoading(false)
        })
    }, 5600)
    return () => {
      ctrl.abort()
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [mode, tenantId, reloadTick, tenant.meta.name, reportDetection, lang, queryLabel, t])

  // Configuration LLM : persistée uniquement dans localStorage (prototype)
  const updateLlmConfig = (patch: Partial<LlmConfig>) => {
    setLlmConfig((prev) => {
      const next = { ...prev, ...patch }
      saveLlmConfig(next)
      return next
    })
  }

  // Génération du brief : API LLM si une clé est configurée, sinon heuristique locale
  const handleGenerateBrief = async () => {
    if (!articles || articles.length === 0 || briefLoading) return
    setBriefLoading(true)
    if (llmConfig.apiKey.trim()) {
      try {
        const brief = await generateLlmBrief(articles, volume, queryLabel, llmConfig, lang)
        setLiveBrief(brief)
        setBriefLoading(false)
        return
      } catch {
        toast.error(t('brief.llm.fail'), {
          description: t('brief.llm.fail.desc'),
        })
      }
    }
    // Délai volontaire pour rendre l'état de génération perceptible
    await new Promise((resolve) => setTimeout(resolve, 800))
    setLiveBrief(generateHeuristicBrief(articles, volume, queryLabel, lang))
    setBriefLoading(false)
  }

  // Articles enrichis de l'heuristique de sentiment (calculée une seule fois)
  const articleRows = useMemo(
    () => (articles ?? []).map((article) => ({ article, sentiment: sentimentHeuristic(article.title) })),
    [articles],
  )
  const filteredArticles = useMemo(
    () => articleRows.filter((r) => filter === 'toutes' || r.sentiment === filter),
    [articleRows, filter],
  )
  const filteredMentions = useMemo(
    () => (filter === 'toutes' ? tenant.mentions : tenant.mentions.filter((m) => m.sentiment === filter)),
    [filter, tenant],
  )

  const distribution = useMemo(() => {
    const counts: Record<Sentiment, number> = { positif: 0, neutre: 0, negatif: 0 }
    if (mode === 'live') articleRows.forEach((r) => counts[r.sentiment]++)
    else tenant.mentions.forEach((m) => counts[m.sentiment]++)
    return (Object.keys(counts) as Sentiment[]).map((k) => ({ name: t(SENTIMENT_KEY[k]), key: k, value: counts[k] }))
  }, [mode, articleRows, tenant, t])

  const maxByCol = useMemo(() => {
    const max = { positif: 1, neutre: 1, negatif: 1 }
    tenant.heatmap.forEach((r) => {
      max.positif = Math.max(max.positif, r.positif)
      max.neutre = Math.max(max.neutre, r.neutre)
      max.negatif = Math.max(max.negatif, r.negatif)
    })
    return max
  }, [tenant])

  const donutTotal = mode === 'live' ? articleRows.length : tenant.mentions.length

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={t('ve.title')}
        description={mode === 'live' ? t('ve.desc.live', { label: queryLabel }) : t('ve.desc.demo')}
        actions={
          <div className="flex rounded-md border border-zinc-700 bg-zinc-900 p-0.5">
            <button
              onClick={() => setMode('demo')}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                mode === 'demo' ? 'bg-sky-400/15 text-sky-400' : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              {t('ve.mode.demo')}
            </button>
            <button
              onClick={() => setMode('live')}
              disabled={crisis.active}
              title={crisis.active ? t('ve.mode.crisisTitle') : t('ve.mode.liveTitle')}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                mode === 'live' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200',
                crisis.active && 'cursor-not-allowed opacity-40',
              )}
            >
              {t('ve.mode.live')}
            </button>
          </div>
        }
      />

      {/* Confirmation d'alerte automatique issue de l'analyse temps réel */}
      {mode === 'live' && tenantLiveAlerts.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <BellRing className="h-4 w-4 shrink-0 text-emerald-400" />
          <p className="min-w-0 flex-1 text-sm text-zinc-200">
            {tenantLiveAlerts.length === 1
              ? t('ve.alertBanner.one')
              : t('ve.alertBanner.many', { count: tenantLiveAlerts.length })}
            {' — '}
            {tenantLiveAlerts[0].title}
          </p>
          <Link to="/alertes" className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300">
            {t('ve.alertBanner.view')} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Flux de mentions */}
        <Card className="bg-zinc-900/70 xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-zinc-200">
                  {mode === 'live' ? t('ve.feed.live') : t('ve.feed.demo')}
                </CardTitle>
                {mode === 'live' && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {mode === 'live' && (
                  <>
                    {lastSync && (
                      <span className="text-[11px] tabular-nums text-zinc-500">
                        {t('common.lastSync', { time: lastSync.toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' }) })}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 border-zinc-700 bg-transparent text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                      onClick={() => setReloadTick((tick) => tick + 1)}
                      disabled={loading}
                    >
                      <RefreshCw className={cn('mr-1.5 h-3 w-3', loading && 'animate-spin')} />
                      {t('common.refresh')}
                    </Button>
                  </>
                )}
                <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                  <TabsList className="bg-zinc-800/80">
                    <TabsTrigger value="toutes">{t('ve.filter.all')}</TabsTrigger>
                    <TabsTrigger value="negatif">{t('ve.filter.neg')}</TabsTrigger>
                    <TabsTrigger value="neutre">{t('ve.filter.neu')}</TabsTrigger>
                    <TabsTrigger value="positif">{t('ve.filter.pos')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mode === 'demo' && (
              <>
                {filteredMentions.length === 0 && (
                  <p className="py-6 text-center text-sm text-zinc-500">{t('ve.empty.demo')}</p>
                )}
                {filteredMentions.map((m) => (
                  <article key={m.id} className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3.5">
                    <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <SourceIcon source={m.source} />
                      <span className="font-medium text-zinc-200">{m.author}</span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{m.topic}</span>
                      <span
                        className="rounded border border-zinc-700 px-1 py-0 text-[9px] font-semibold uppercase tracking-wide text-zinc-500"
                        title="Langue de l’extrait original / Original excerpt language"
                      >
                        {m.lang}
                      </span>
                      {m.live && <LiveBadge />}
                      <span className="ml-auto tabular-nums text-zinc-500">{m.time}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-300">{m.excerpt}</p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <SentimentBadge sentiment={m.sentiment} />
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Eye className="h-3.5 w-3.5" /> {t('common.contacts', { count: formatReach(m.reach, lang) })}
                      </span>
                    </div>
                  </article>
                ))}
              </>
            )}

            {mode === 'live' && loading && (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3.5">
                    <Skeleton className="mb-2 h-3 w-2/5 bg-zinc-800" />
                    <Skeleton className="h-4 w-full bg-zinc-800" />
                    <Skeleton className="mt-1.5 h-4 w-3/4 bg-zinc-800" />
                  </div>
                ))}
              </div>
            )}

            {mode === 'live' && !loading && (
              <>
                {filteredArticles.length === 0 && (
                  <p className="py-6 text-center text-sm text-zinc-500">{t('ve.empty.live')}</p>
                )}
                {filteredArticles.map(({ article, sentiment }) => (
                  <a
                    key={article.url}
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-md border border-zinc-800 bg-zinc-950/50 p-3.5 transition-colors hover:border-sky-400/40 hover:bg-zinc-900/60"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <Newspaper className="h-4 w-4 shrink-0 text-zinc-300" />
                      <span className="font-medium text-zinc-200">{article.domain}</span>
                      {article.sourcecountry && (
                        <Badge variant="outline" className="border-zinc-700 px-1.5 py-0 text-[10px] text-zinc-400">
                          {article.sourcecountry}
                        </Badge>
                      )}
                      {article.language && (
                        <Badge variant="outline" className="border-zinc-700 px-1.5 py-0 text-[10px] text-zinc-400">
                          {article.language}
                        </Badge>
                      )}
                      <span className="ml-auto flex items-center gap-2 tabular-nums text-zinc-500">
                        {relativeTime(article.seendate, lang)}
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-200">{article.title}</p>
                    <div className="mt-2.5">
                      <SentimentBadge sentiment={sentiment} />
                    </div>
                  </a>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Colonne droite : donut + sources */}
        <div className="space-y-4">
          <Card className="bg-zinc-900/70">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-medium text-zinc-200">{t('ve.donut.title')}</CardTitle>
                {mode === 'live' && (
                  <Badge variant="outline" className="border-sky-400/40 bg-sky-400/10 text-[10px] font-normal text-sky-400">
                    {t('ve.donut.heuristic')}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                {mode === 'live' ? t('ve.donut.liveSub') : t('ve.donut.demoSub')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                      {distribution.map((d) => (
                        <Cell key={d.key} fill={SENTIMENT_COLORS[d.key as Sentiment]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                      itemStyle={{ color: '#e4e4e7' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-zinc-50">{donutTotal}</span>
                  <span className="text-[11px] text-zinc-500">{mode === 'live' ? t('ve.donut.articles') : t('ve.donut.mentions')}</span>
                </div>
              </div>
              <div className="mt-1 flex justify-center gap-4">
                {distribution.map((d) => (
                  <div key={d.key} className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SENTIMENT_COLORS[d.key as Sentiment] }} />
                    {d.name} · {d.value}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/70">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-medium text-zinc-200">{t('ve.sources.title')}</CardTitle>
                {mode === 'live' && <DemoDataBadge />}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tenant.topSources.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex items-center gap-2 text-sm">
                    <SourceIcon source={s.type} />
                    <span className="min-w-0 flex-1 truncate text-zinc-200">{s.name}</span>
                    <span className="text-xs tabular-nums text-zinc-500">{t('ve.sources.mentions', { count: s.mentions })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full rounded-full bg-red-500/80" style={{ width: `${s.negativity}%` }} />
                    </div>
                    <span className="w-16 text-right text-[11px] text-zinc-500">{t('ve.sources.neg', { count: s.negativity })}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Volume GDELT — mode temps réel uniquement */}
      {mode === 'live' && (
        <Card className="bg-zinc-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">{t('ve.volume.title')}</CardTitle>
            <p className="text-xs text-zinc-500">{t('ve.volume.sub')}</p>
          </CardHeader>
          <CardContent className="h-64">
            {volumeError && (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed border-zinc-700 text-sm text-zinc-500">
                {t('ve.volume.error')}
              </div>
            )}
            {!volumeError && (volumeLoading || !volume) && (
              <div className="space-y-3 pt-4">
                <Skeleton className="h-4 w-1/3 bg-zinc-800" />
                <Skeleton className="h-40 w-full bg-zinc-800" />
              </div>
            )}
            {!volumeError && !volumeLoading && volume && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volume} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: '#e4e4e7' }}
                    formatter={(value) => [t('ve.volume.tooltipValue', { count: String(value) }), t('ve.volume.tooltipName')]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="url(#gVol)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cartographie de risque */}
      <Card className="bg-zinc-900/70">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-zinc-200">{t('ve.heatmap.title')}</CardTitle>
            {mode === 'live' && <DemoDataBadge />}
          </div>
          <p className="text-xs text-zinc-500">{t('ve.heatmap.sub')}</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-1 text-sm">
            <thead>
              <tr>
                <th className="px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">{t('ve.heatmap.topic')}</th>
                <th className="px-3 py-1.5 text-center text-xs font-medium uppercase tracking-wide text-emerald-500/80">{t('sentiment.positif')}</th>
                <th className="px-3 py-1.5 text-center text-xs font-medium uppercase tracking-wide text-zinc-400">{t('sentiment.neutre')}</th>
                <th className="px-3 py-1.5 text-center text-xs font-medium uppercase tracking-wide text-red-500/80">{t('sentiment.negatif')}</th>
                <th className="px-3 py-1.5 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">{t('ve.heatmap.risk')}</th>
              </tr>
            </thead>
            <tbody>
              {tenant.heatmap.map((row) => (
                <tr key={row.topic}>
                  <td className="rounded bg-zinc-950/60 px-3 py-2 font-medium text-zinc-200">{row.topic}</td>
                  {(['positif', 'neutre', 'negatif'] as const).map((col) => {
                    const intensity = row[col] / maxByCol[col]
                    const base = col === 'positif' ? '16,185,129' : col === 'neutre' ? '113,113,122' : '239,68,68'
                    return (
                      <td
                        key={col}
                        className="rounded px-3 py-2 text-center font-semibold tabular-nums"
                        style={{ background: `rgba(${base},${0.06 + intensity * 0.5})`, color: `rgba(${base},1)` }}
                      >
                        {row[col]}
                      </td>
                    )
                  })}
                  <td className="rounded bg-zinc-950/60 px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                        <div className={cn('h-full rounded-full', riskBar(row.risque))} style={{ width: `${row.risque}%` }} />
                      </div>
                      <span className={cn('w-8 text-right font-semibold tabular-nums', riskColor(row.risque))}>{row.risque}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Brief quotidien IA */}
      <Card id="brief" className="border-sky-400/25 bg-zinc-900/70">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-sky-400/30 bg-sky-400/10">
              <Sparkles className="h-[18px] w-[18px] text-sky-400" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold text-zinc-50">{t('brief.title')}</CardTitle>
              <p className="text-xs text-zinc-500">
                {mode === 'live'
                  ? t('brief.sub.live', { label: queryLabel })
                  : `${tenant.brief.dateLabel} — ${tenant.meta.name}`}
              </p>
            </div>
            {mode === 'live' && liveBrief && (
              <>
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-[10px] font-normal text-emerald-400">
                  {t('brief.generatedLive', {
                    count: liveBrief.articleCount,
                    time: liveBrief.generatedAt.toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' }),
                  })}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-normal',
                    liveBrief.engine === 'llm'
                      ? 'border-violet-400/40 bg-violet-400/10 text-violet-300'
                      : 'border-amber-400/40 bg-amber-400/10 text-amber-300',
                  )}
                >
                  {liveBrief.engine === 'llm' ? t('brief.engine.llm') : t('brief.engine.heuristic')}
                </Badge>
              </>
            )}
            {mode === 'demo' && (
              <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-[11px] text-zinc-400">
                {t('brief.demo.generated', { date: tenant.brief.generatedAt })}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 pt-5 lg:grid-cols-2">
          {mode === 'demo' && (
            <>
          <section className="lg:col-span-2">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-400">{t('brief.section.synthese')}</h3>
            <div className="space-y-2">
              {tenant.brief.synthese.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-zinc-300">{p}</p>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Signal className="h-3.5 w-3.5" /> {t('brief.section.signals')}
            </h3>
            <ul className="space-y-2">
              {tenant.brief.signauxFaibles.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-300">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <AlertTriangle className="h-3.5 w-3.5" /> {t('brief.section.incidents')}
            </h3>
            <ul className="space-y-2">
              {tenant.brief.incidents.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-300">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  {s}
                </li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-2">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Lightbulb className="h-3.5 w-3.5" /> {t('brief.section.recos')}
            </h3>
            <ol className="space-y-2">
              {tenant.brief.recommandations.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-400/40 bg-sky-400/10 text-[11px] font-bold text-sky-400">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ol>
          </section>
            </>
          )}

          {mode === 'live' && (
            <div className="space-y-4 lg:col-span-2">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateBrief}
                  disabled={briefLoading || loading || !articles || articles.length === 0}
                  className="h-8 border-sky-400/30 bg-sky-400/10 text-xs text-sky-300 hover:bg-sky-400/20 hover:text-sky-200"
                >
                  <Sparkles className={cn('mr-1.5 h-3.5 w-3.5', briefLoading && 'animate-pulse')} />
                  {liveBrief ? t('brief.regenerate') : t('brief.generate')}
                </Button>
                {briefLoading && <span className="text-xs text-zinc-500">{t('brief.generating')}</span>}
                {!briefLoading && !loading && (!articles || articles.length === 0) && (
                  <span className="text-xs text-zinc-500">{t('brief.waiting')}</span>
                )}
              </div>

              <Collapsible open={llmOpen} onOpenChange={setLlmOpen} className="rounded-md border border-zinc-800 bg-zinc-950/50">
                <CollapsibleTrigger className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:text-zinc-100">
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5 text-zinc-500" />
                    {t('brief.llm.toggle')}
                  </span>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-zinc-500 transition-transform', llmOpen && 'rotate-180')} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 border-t border-zinc-800 px-3.5 py-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="llm-base-url" className="text-[11px] text-zinc-500">{t('brief.llm.baseUrl')}</Label>
                      <Input
                        id="llm-base-url"
                        value={llmConfig.baseUrl}
                        onChange={(e) => updateLlmConfig({ baseUrl: e.target.value })}
                        placeholder={DEFAULT_LLM_CONFIG.baseUrl}
                        className="h-8 border-zinc-700 bg-zinc-900 text-xs text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="llm-api-key" className="text-[11px] text-zinc-500">{t('brief.llm.apiKey')}</Label>
                      <Input
                        id="llm-api-key"
                        type="password"
                        value={llmConfig.apiKey}
                        onChange={(e) => updateLlmConfig({ apiKey: e.target.value })}
                        placeholder="sk-…"
                        autoComplete="off"
                        className="h-8 border-zinc-700 bg-zinc-900 text-xs text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="llm-model" className="text-[11px] text-zinc-500">{t('brief.llm.model')}</Label>
                      <Input
                        id="llm-model"
                        value={llmConfig.model}
                        onChange={(e) => updateLlmConfig({ model: e.target.value })}
                        placeholder={DEFAULT_LLM_CONFIG.model}
                        className="h-8 border-zinc-700 bg-zinc-900 text-xs text-zinc-200"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-500/80">{t('brief.llm.warning')}</p>
                  {llmConfig.apiKey.trim() && (
                    <p className="text-[11px] text-emerald-500/80">
                      {t('brief.llm.configured', { model: llmConfig.model || DEFAULT_LLM_CONFIG.model })}
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {briefLoading && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-2/3 bg-zinc-800" />
                  <Skeleton className="h-4 w-full bg-zinc-800" />
                  <div className="grid gap-4 pt-1 lg:grid-cols-2">
                    <Skeleton className="h-24 w-full bg-zinc-800" />
                    <Skeleton className="h-24 w-full bg-zinc-800" />
                  </div>
                </div>
              )}

              {!briefLoading && !liveBrief && (
                <div className="rounded-md border border-dashed border-zinc-700 px-4 py-6 text-center text-sm text-zinc-500">
                  {articles && articles.length > 0 ? t('brief.placeholder.ready') : t('brief.placeholder.waiting')}
                </div>
              )}

              {!briefLoading && liveBrief && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <section className="lg:col-span-2">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-400">{t('brief.section.synthese')}</h3>
                    <div className="space-y-2">
                      {liveBrief.synthese.map((p, i) => (
                        <p key={i} className="text-sm leading-relaxed text-zinc-300">{p}</p>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
                      <Signal className="h-3.5 w-3.5" /> {t('brief.section.signals')}
                    </h3>
                    <ul className="space-y-2">
                      {liveBrief.signauxFaibles.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-300">
                          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <BriefItemRow item={item} />
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
                      <AlertTriangle className="h-3.5 w-3.5" /> {t('brief.section.incidents')}
                    </h3>
                    <ul className="space-y-2">
                      {liveBrief.incidents.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-300">
                          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                          <BriefItemRow item={item} />
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="lg:col-span-2">
                    <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
                      <Lightbulb className="h-3.5 w-3.5" /> {t('brief.section.recos')}
                    </h3>
                    <ol className="space-y-2">
                      {liveBrief.recommandations.map((r, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-400/40 bg-sky-400/10 text-[11px] font-bold text-sky-400">
                            {i + 1}
                          </span>
                          {r}
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
