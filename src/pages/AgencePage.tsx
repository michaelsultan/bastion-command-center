import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Activity, ArrowRight, BellRing, Building2, Clock3, Gauge, ShieldCheck, Siren } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/PageHeader'
import { LiveBadge } from '@/components/LiveBadge'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { TempsReelBadge } from '@/components/TempsReelBadge'
import { ThreatBadge } from '@/components/ThreatBadge'
import { useTenant } from '@/context/TenantContext'
import { useCrisis } from '@/context/CrisisContext'
import { useLiveAlerts } from '@/context/LiveAlertsContext'
import { TENANT_DATA, TENANT_ORDER, formatNumber } from '@/data'
import type { TenantData } from '@/data/types'
import { cn } from '@/lib/utils'

// ─── Helpers de calcul (tout est dérivé des jeux de données par tenant) ──────

function shortName(name: string): string {
  return name.replace('Campagne ', '').replace('Mairie de ', '').replace(' 2026', '')
}

function scoreColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

/** Convertit un horodatage mock « JJ/MM HH:MM » en minutes comparables. */
function toMinutes(t: string): number {
  const m = t.match(/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/)
  if (!m) return 0
  return Number(m[1]) * 1440 + Number(m[3]) * 60 + Number(m[4])
}

function incidentOpen(t: TenantData): boolean {
  return !t.incident.status.toLowerCase().startsWith('résolu')
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-zinc-200">{label}</p>
      <p className="text-zinc-400">Valeur : {payload[0].value}</p>
    </div>
  )
}

export default function AgencePage() {
  const { setTenant } = useTenant()
  const { applyTo } = useCrisis()
  const { alerts: liveAlerts, totalCounts: liveTotals, countsForTenant } = useLiveAlerts()
  const navigate = useNavigate()

  const tenants = TENANT_ORDER.map((id) => applyTo(TENANT_DATA[id]))

  // KPI agrégés (incluant les alertes automatiques GDELT non résolues)
  const totalAlerts = tenants.reduce((s, t) => s + t.kpis.activeAlerts, 0) + liveTotals.active
  const totalCritical = tenants.reduce((s, t) => s + t.kpis.criticalAlerts, 0) + liveTotals.critical
  const avgScore = Math.round(tenants.reduce((s, t) => s + t.kpis.securityScore, 0) / tenants.length)
  const totalMentions = tenants.reduce((s, t) => s + t.kpis.mentions24h, 0)

  // Flux d'alertes critiques/élevées fusionné, trié par heure décroissante
  const alertFeed = [
    ...tenants.flatMap((t) =>
      t.alerts
        .filter((a) => a.severity === 'critique' || a.severity === 'elevee')
        .map((a) => ({ ...a, tenantShort: shortName(t.meta.name), tempsReel: false })),
    ),
    ...liveAlerts.map((a) => ({
      id: a.id,
      severity: a.severity,
      title: a.title,
      source: a.source,
      time: a.time,
      status: a.status,
      live: false,
      tenantShort: shortName(a.tenantName),
      tempsReel: true,
    })),
  ].sort(
    (a, b) =>
      Number(Boolean(b.live) || b.tempsReel) - Number(Boolean(a.live) || a.tempsReel) ||
      toMinutes(b.time) - toMinutes(a.time),
  )

  // Incidents ouverts
  const openIncidents = tenants
    .filter(incidentOpen)
    .map((t) => ({ tenant: t, inc: t.incident, current: t.incident.steps.find((s) => s.state === 'en_cours') }))

  // Données de comparaison
  const compare = tenants.map((t) => ({
    name: shortName(t.meta.name),
    score: t.kpis.securityScore,
    sentiment: t.kpis.netSentiment,
  }))
  const sentiments = compare.map((c) => c.sentiment)
  const sentMin = Math.min(0, ...sentiments) - 5
  const sentMax = Math.max(0, ...sentiments) + 5

  const openClient = (t: TenantData) => {
    setTenant(t.meta.id)
    navigate('/')
    toast.success('Espace client ouvert', { description: t.meta.name })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Vue agence"
        description="Supervision multi-clients — tous les espaces de campagne opérés par l’agence, au 19 juillet 2026."
      />

      {/* Bandeau KPI consolidé */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Campagnes actives"
          value={String(tenants.length)}
          icon={Building2}
          deltaLabel="espaces clients supervisés"
        />
        <StatCard
          title="Alertes actives"
          value={String(totalAlerts)}
          icon={BellRing}
          deltaLabel={totalCritical > 0 ? `dont ${totalCritical} critique${totalCritical > 1 ? 's' : ''}` : 'aucune critique'}
        >
          {totalCritical > 0 && <span className="mt-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
        </StatCard>
        <StatCard title="Score sécurité moyen" value={`${avgScore}/100`} icon={Gauge} deltaLabel="moyenne pondérée clients">
          <Progress value={avgScore} className="mt-3 h-1.5 bg-zinc-800 [&>div]:bg-sky-400" />
        </StatCard>
        <StatCard
          title="Mentions (24 h)"
          value={formatNumber(totalMentions)}
          icon={Activity}
          deltaLabel="tous clients confondus"
        />
      </div>

      {/* Cartes clients */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tenants.map((t) => {
          const open = incidentOpen(t)
          const sentiment = t.kpis.netSentiment
          return (
            <Card key={t.meta.id} className="flex flex-col bg-zinc-900/70">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base font-semibold text-zinc-50">{t.meta.name}</CardTitle>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{t.meta.subtitle}</p>
                  </div>
                  <ThreatBadge level={t.threat.level} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-4">
                <div>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-xs text-zinc-400">Score sécurité</span>
                    <span className="text-lg font-bold tabular-nums" style={{ color: scoreColor(t.kpis.securityScore) }}>
                      {t.kpis.securityScore}
                      <span className="text-xs font-normal text-zinc-500">/100</span>
                    </span>
                  </div>
                  <Progress value={t.kpis.securityScore} className="h-1.5 bg-zinc-800 [&>div]:bg-sky-400" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-2">
                    <p
                      className={cn(
                        'text-lg font-bold tabular-nums',
                        t.kpis.activeAlerts + countsForTenant(t.meta.id).active > 0 ? 'text-amber-400' : 'text-zinc-200',
                      )}
                    >
                      {t.kpis.activeAlerts + countsForTenant(t.meta.id).active}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">Alertes</p>
                  </div>
                  <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-2">
                    <p className={cn('text-lg font-bold tabular-nums', open ? 'text-red-400' : 'text-emerald-400')}>
                      {open ? 1 : 0}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">Incidents</p>
                  </div>
                  <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-2">
                    <p className={cn('text-lg font-bold tabular-nums', sentiment >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {sentiment > 0 ? '+' : ''}
                      {sentiment} %
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">Sentiment</p>
                  </div>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Clock3 className="h-3.5 w-3.5" /> Dernière synchro : {t.threat.updatedAt}
                </p>

                <Button
                  className="mt-auto w-full bg-sky-500 font-medium text-zinc-950 hover:bg-sky-400"
                  onClick={() => openClient(t)}
                >
                  Ouvrir l’espace client
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Flux d'alertes fusionné + incidents ouverts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="bg-zinc-900/70 xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Alertes critiques & élevées — tous clients</CardTitle>
            <p className="text-xs text-zinc-500">{alertFeed.length} alertes fusionnées, triées par horodatage</p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {alertFeed.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                <span className="mt-0.5 flex items-center gap-1.5">
                  <SeverityBadge severity={a.severity} />
                  {a.tempsReel ? <TempsReelBadge /> : a.live ? <LiveBadge /> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-zinc-200">{a.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    <span className="font-medium text-sky-400">{a.tenantShort}</span> · {a.source} ·{' '}
                    <span className="tabular-nums">{a.time}</span>
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/70">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-red-400" />
              <CardTitle className="text-sm font-medium text-zinc-200">Incidents en cours</CardTitle>
            </div>
            <p className="text-xs text-zinc-500">{openIncidents.length} incident{openIncidents.length > 1 ? 's' : ''} ouvert{openIncidents.length > 1 ? 's' : ''} sur {tenants.length} clients</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {openIncidents.map(({ tenant: t, inc, current }) => (
              <div key={inc.id} className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={inc.severity} />
                  <span className="text-[11px] font-medium text-sky-400">{shortName(t.meta.name)}</span>
                </div>
                <p className="text-sm font-medium leading-snug text-zinc-100">{inc.title}</p>
                <p className="mt-1 text-xs tabular-nums text-zinc-500">Détecté le {inc.detected}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status="en_cours" />
                  {current && <span className="truncate text-xs text-zinc-400">{current.title}</span>}
                </div>
              </div>
            ))}
            {openIncidents.length === 0 && (
              <p className="flex items-center gap-2 py-4 text-sm text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> Aucun incident ouvert — situation nominale.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparatif clients */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="bg-zinc-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Comparatif — score de sécurité</CardTitle>
            <p className="text-xs text-zinc-500">Barème : ≥ 80 protégé · 60–79 à surveiller · &lt; 60 vulnérable</p>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compare} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#27272a" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="score" barSize={18} radius={[0, 4, 4, 0]}>
                  {compare.map((c) => (
                    <Cell key={c.name} fill={scoreColor(c.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Comparatif — sentiment net</CardTitle>
            <p className="text-xs text-zinc-500">Solde positif − négatif sur 24 h, en points</p>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compare} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#27272a" />
                <XAxis type="number" domain={[sentMin, sentMax]} hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <ReferenceLine x={0} stroke="#3f3f46" />
                <Bar dataKey="sentiment" barSize={18} radius={[0, 4, 4, 0]}>
                  {compare.map((c) => (
                    <Cell key={c.name} fill={c.sentiment >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
