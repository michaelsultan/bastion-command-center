import { Fragment } from 'react'
import { CheckCircle2, CircleDot, Circle, Clock3, Download, ExternalLink, User2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/PageHeader'
import { LiveBadge } from '@/components/LiveBadge'
import { SeverityBadge } from '@/components/SeverityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { TempsReelBadge } from '@/components/TempsReelBadge'
import { useCrisis, useEffectiveTenant } from '@/context/CrisisContext'
import { useLiveAlerts } from '@/context/LiveAlertsContext'
import type { AlertStatus } from '@/data/types'
import { cn } from '@/lib/utils'

// Cycle de statut des alertes temps réel : Nouveau → En cours → Résolu
const NEXT_STATUS: Record<AlertStatus, AlertStatus> = {
  nouveau: 'en_cours',
  en_cours: 'resolu',
  resolu: 'nouveau',
}

export default function AlertesPage() {
  const tenant = useEffectiveTenant()
  const crisis = useCrisis()
  const { alertsForTenant, countsForTenant, setLiveAlertStatus } = useLiveAlerts()
  const inc = tenant.incident
  const liveAlerts = alertsForTenant(tenant.meta.id)
  const liveCounts = countsForTenant(tenant.meta.id)

  const handleExport = async () => {
    // jsPDF est chargé à la demande pour garder le bundle principal léger
    const { buildIncidentReport, exportIncidentReportPdf } = await import('@/lib/incident-report')
    const report = buildIncidentReport(tenant, crisis)
    exportIncidentReportPdf(report)
    toast.success('Rapport PDF généré', { description: report.fileName })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Alertes & Incidents"
        description={`${tenant.kpis.activeAlerts + liveCounts.active} alertes actives · 1 incident ouvert — règles de notification : e-mail, SMS et in-app.`}
        actions={
          <Button
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter le rapport PDF
          </Button>
        }
      />

      {/* Table des alertes */}
      <Card className="bg-zinc-900/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-200">Alertes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Réf.</TableHead>
                <TableHead className="text-zinc-400">Sévérité</TableHead>
                <TableHead className="min-w-[280px] text-zinc-400">Intitulé</TableHead>
                <TableHead className="text-zinc-400">Source</TableHead>
                <TableHead className="text-zinc-400">Horodatage</TableHead>
                <TableHead className="text-right text-zinc-400">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liveAlerts.map((a) => (
                <Fragment key={a.id}>
                  <TableRow className="border-zinc-800 bg-emerald-500/[0.04] hover:bg-zinc-800/40">
                    <TableCell className="font-mono text-xs text-zinc-500">{a.id}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        <SeverityBadge severity={a.severity} />
                        <TempsReelBadge />
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-100">{a.title}</TableCell>
                    <TableCell className="text-sm text-zinc-400">{a.source}</TableCell>
                    <TableCell className="text-sm tabular-nums text-zinc-400">{a.time}</TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => setLiveAlertStatus(a.id, NEXT_STATUS[a.status])}
                        title="Changer le statut : Nouveau → En cours → Résolu"
                        className="inline-flex cursor-pointer rounded transition-opacity hover:opacity-75"
                      >
                        <StatusBadge status={a.status} />
                      </button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-zinc-800 bg-emerald-500/[0.04] hover:bg-zinc-800/40">
                    <TableCell colSpan={6} className="py-2 pl-8">
                      <div className="space-y-1 text-xs">
                        {a.details.map((d, i) => (
                          <p key={i} className="text-zinc-400">{d}</p>
                        ))}
                        {a.links.length > 0 && (
                          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                            <span className="text-zinc-500">Titres concernés :</span>
                            {a.links.map((l, i) => (
                              <a
                                key={i}
                                href={l.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex max-w-80 items-center gap-1 text-sky-400 transition-colors hover:text-sky-300"
                              >
                                <span className="truncate">{l.title}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            ))}
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
              {tenant.alerts.map((a) => (
                <TableRow key={a.id} className="border-zinc-800 hover:bg-zinc-800/40">
                  <TableCell className="font-mono text-xs text-zinc-500">{a.id}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <SeverityBadge severity={a.severity} />
                      {a.live && <LiveBadge />}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-100">{a.title}</TableCell>
                  <TableCell className="text-sm text-zinc-400">{a.source}</TableCell>
                  <TableCell className="text-sm tabular-nums text-zinc-400">{a.time}</TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={a.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Incident ouvert — chronologie */}
      <Card className="bg-zinc-900/70">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base font-semibold text-zinc-50">
                  {inc.id} — {inc.title}
                </CardTitle>
                <SeverityBadge severity={inc.severity} />
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-400">
                  {inc.status}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock3 className="h-3.5 w-3.5" /> Détecté le {inc.detected}
              </p>
            </div>
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-zinc-300">{inc.summary}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <ol className="relative space-y-6 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-zinc-800">
            {inc.steps.map((s, i) => (
              <li key={i} className="relative flex gap-4 pl-0">
                <div className="z-10 mt-0.5 shrink-0">
                  {s.state === 'termine' && <CheckCircle2 className="h-5 w-5 rounded-full bg-zinc-900 text-emerald-500" />}
                  {s.state === 'en_cours' && (
                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900">
                      <span className="absolute h-full w-full animate-ping rounded-full bg-sky-400 opacity-40" />
                      <CircleDot className="relative h-5 w-5 text-sky-400" />
                    </span>
                  )}
                  {s.state === 'a_venir' && <Circle className="h-5 w-5 rounded-full bg-zinc-900 text-zinc-600" />}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <p className={cn('text-sm font-semibold', s.state === 'a_venir' ? 'text-zinc-500' : 'text-zinc-100')}>
                      {s.title}
                    </p>
                    <span className="text-xs tabular-nums text-zinc-500">{s.time}</span>
                  </div>
                  <p className={cn('mt-1 text-sm leading-relaxed', s.state === 'a_venir' ? 'text-zinc-500' : 'text-zinc-400')}>
                    {s.description}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500">
                    <User2 className="h-3.5 w-3.5" /> {s.operator}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
