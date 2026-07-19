import { Link } from 'react-router'
import {
  Activity,
  ArrowRight,
  BellRing,
  CalendarClock,
  Gauge,
  HeartPulse,
  MapPin,
  Mic,
  Sparkles,
  Users,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LiveBadge } from '@/components/LiveBadge'
import { PageHeader } from '@/components/PageHeader'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatCard } from '@/components/StatCard'
import { TempsReelBadge } from '@/components/TempsReelBadge'
import { ThreatBanner } from '@/components/ThreatBanner'
import { useEffectiveTenant } from '@/context/CrisisContext'
import { useLiveAlerts } from '@/context/LiveAlertsContext'
import { formatNumber } from '@/data'
import type { CampaignEvent } from '@/data/types'

const EVENT_ICON: Record<CampaignEvent['type'], typeof MapPin> = {
  terrain: MapPin,
  media: Mic,
  reunion: Users,
}

function SentimentTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-zinc-200">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name} : {p.value} %
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const tenant = useEffectiveTenant()
  const { kpis } = tenant
  const { alertsForTenant, countsForTenant } = useLiveAlerts()
  const liveAlerts = alertsForTenant(tenant.meta.id)
  const liveCounts = countsForTenant(tenant.meta.id)
  const activeTotal = kpis.activeAlerts + liveCounts.active
  const criticalTotal = kpis.criticalAlerts + liveCounts.critical

  // Flux fusionné : alertes temps réel GDELT en tête, puis alertes curées/crise
  const alertFeed = [
    ...liveAlerts.map((a) => ({
      key: a.id,
      severity: a.severity,
      title: a.title,
      source: a.source,
      time: a.time,
      badge: 'tempsreel' as const,
    })),
    ...tenant.alerts.map((a) => ({
      key: a.id,
      severity: a.severity,
      title: a.title,
      source: a.source,
      time: a.time,
      badge: a.live ? ('live' as const) : null,
    })),
  ].slice(0, 6)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Vue d’ensemble"
        description={`${tenant.meta.name} — ${tenant.meta.detail}. Synthèse du poste de commandement au 19 juillet 2026.`}
      />

      <ThreatBanner level={tenant.threat.level} summary={tenant.threat.summary} updatedAt={tenant.threat.updatedAt} />

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Score sécurité global"
          value={`${kpis.securityScore}/100`}
          icon={Gauge}
          delta={kpis.securityScoreDelta}
          deltaLabel="vs sem. dernière"
          invertDelta={false}
        >
          <Progress value={kpis.securityScore} className="mt-3 h-1.5 bg-zinc-800 [&>div]:bg-sky-400" />
        </StatCard>
        <StatCard
          title="Mentions (24 h)"
          value={formatNumber(kpis.mentions24h)}
          icon={Activity}
          delta={kpis.mentionsDelta}
          deltaSuffix=" %"
          deltaLabel="vs veille"
          invertDelta
        />
        <StatCard
          title="Sentiment net"
          value={`${kpis.netSentiment > 0 ? '+' : ''}${kpis.netSentiment} %`}
          icon={HeartPulse}
          delta={kpis.netSentimentDelta}
          deltaSuffix=" pts"
          deltaLabel="sur 7 jours"
        />
        <StatCard
          title="Alertes actives"
          value={String(activeTotal)}
          icon={BellRing}
          deltaLabel={criticalTotal > 0 ? `dont ${criticalTotal} critique${criticalTotal > 1 ? 's' : ''}` : 'aucune critique'}
        >
          {criticalTotal > 0 && <span className="mt-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
        </StatCard>
      </div>

      {/* Graphique + flux d'alertes */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="bg-zinc-900/70 xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Évolution du sentiment — 7 derniers jours</CardTitle>
            <p className="text-xs text-zinc-500">Part des mentions par tonalité (%)</p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tenant.sentimentTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gNeu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#71717a" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#71717a" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<SentimentTooltip />} />
                <Area type="monotone" dataKey="positif" name="Positif" stackId="1" stroke="#10b981" fill="url(#gPos)" strokeWidth={2} />
                <Area type="monotone" dataKey="neutre" name="Neutre" stackId="1" stroke="#71717a" fill="url(#gNeu)" strokeWidth={2} />
                <Area type="monotone" dataKey="negatif" name="Négatif" stackId="1" stroke="#ef4444" fill="url(#gNeg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/70">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-200">Flux d’alertes en direct</CardTitle>
              <Link to="/alertes" className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300">
                Tout voir <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertFeed.map((a) => (
              <div key={a.key} className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <SeverityBadge severity={a.severity} />
                    {a.badge === 'tempsreel' && <TempsReelBadge />}
                    {a.badge === 'live' && <LiveBadge />}
                  </span>
                  <span className="text-[11px] tabular-nums text-zinc-500">{a.time}</span>
                </div>
                <p className="text-sm leading-snug text-zinc-200">{a.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{a.source}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Brief IA + Aujourd'hui */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="bg-zinc-900/70 xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <CardTitle className="text-sm font-medium text-zinc-200">Brief quotidien IA — {tenant.brief.dateLabel}</CardTitle>
            </div>
            <p className="text-xs text-zinc-500">Généré le {tenant.brief.generatedAt} · moteur d’analyse Bastion</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-zinc-300">{tenant.brief.synthese[0]}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
              <span>{tenant.brief.signauxFaibles.length} signaux faibles</span>
              <span>{tenant.brief.incidents.length} incidents suivis</span>
              <span>{tenant.brief.recommandations.length} recommandations</span>
            </div>
            <Link to="/veille" className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300">
              Lire le brief complet <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/70">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-sky-400" />
              <CardTitle className="text-sm font-medium text-zinc-200">Aujourd’hui — dimanche 19 juillet</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenant.events.map((e, i) => {
              const Icon = EVENT_ICON[e.type]
              return (
                <div key={i} className="flex gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900">
                    <Icon className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium tabular-nums text-sky-400">{e.time}</p>
                    <p className="text-sm leading-snug text-zinc-200">{e.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{e.location}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
