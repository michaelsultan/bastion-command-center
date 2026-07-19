import { CheckCircle2, Download, Siren, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCrisis } from '@/context/CrisisContext'
import { TENANT_DATA } from '@/data'
import { cn } from '@/lib/utils'

export function CrisisBanner() {
  const crisis = useCrisis()
  const { active, phase, elapsed, ticker, measures, stop, crisisTenantId } = crisis
  if (!active || !crisisTenantId) return null

  const tenant = TENANT_DATA[crisisTenantId]
  const critical = phase >= 5
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')
  const recentEvents = ticker.slice(-3).reverse()

  const handleExport = async () => {
    // jsPDF est chargé à la demande pour garder le bundle principal léger
    const { buildIncidentReport, exportIncidentReportPdf } = await import('@/lib/incident-report')
    const report = buildIncidentReport(crisis.applyTo(tenant), crisis)
    exportIncidentReportPdf(report)
    toast.success('Rapport PDF généré', { description: report.fileName })
  }

  return (
    <div className="border-b border-red-500/40 bg-red-950/50 px-4 py-3 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Ligne principale */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Siren className="h-5 w-5 animate-pulse text-red-400" />
          <p className="text-sm font-bold tracking-wide text-red-300">
            {critical ? 'ATTAQUE COORDONNÉE EN COURS — NIVEAU CRITIQUE' : 'ANOMALIE DÉTECTÉE — pic de mentions en cours d’analyse'}
          </p>
          <span className="rounded border border-red-500/50 bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-400">
            Simulation
          </span>
          <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-200">{tenant.meta.name}</span>
          <span className="ml-auto flex items-center gap-3">
            <span className="font-mono text-sm tabular-nums text-red-200" title="Temps écoulé">
              T+{mm}:{ss}
            </span>
            <button
              onClick={stop}
              className="flex items-center gap-1 rounded border border-red-500/40 px-2 py-1 text-xs font-medium text-red-300 hover:bg-red-500/10"
            >
              <X className="h-3.5 w-3.5" />
              Terminer
            </button>
          </span>
        </div>

        {/* Ticker d'événements */}
        <div className="mt-2 space-y-0.5">
          {recentEvents.map((e, i) => (
            <p
              key={`${e.at}-${e.text}`}
              className={cn(
                'flex items-center gap-2 text-sm',
                i === 0 ? 'font-medium text-red-100' : 'text-xs text-red-300/60',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  i === 0 ? 'animate-pulse bg-red-400' : 'bg-red-500/40',
                )}
              />
              <span className="tabular-nums text-red-300/70">T+{String(e.at).padStart(2, '0')}s</span>
              {e.text}
            </p>
          ))}
        </div>

        {/* Contre-mesures déployées */}
        {measures.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-red-500/20 pt-2.5">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-red-300">Contre-mesures :</span>
            {measures.map((m) => (
              <span
                key={m}
                className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300"
              >
                <CheckCircle2 className="h-3 w-3" />
                {m}
              </span>
            ))}
            <button
              onClick={handleExport}
              className="ml-auto flex items-center gap-1.5 rounded border border-sky-400/40 bg-sky-400/10 px-2.5 py-1 text-xs font-medium text-sky-300 hover:bg-sky-400/20"
            >
              <Download className="h-3.5 w-3.5" />
              Exporter le rapport PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
