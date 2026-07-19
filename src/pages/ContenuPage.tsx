import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { SourceIcon } from '@/components/SourceIcon'
import { useTenant } from '@/context/TenantContext'
import { formatNumber } from '@/data'
import type { ContentCard as ContentCardData, Pipeline } from '@/data/types'
import { cn } from '@/lib/utils'

const COLUMNS: { key: keyof Pipeline; label: string; dot: string }[] = [
  { key: 'brouillon', label: 'Brouillon', dot: 'bg-zinc-400' },
  { key: 'relecture', label: 'En relecture', dot: 'bg-amber-500' },
  { key: 'approuve', label: 'Approuvé', dot: 'bg-emerald-500' },
  { key: 'planifie', label: 'Planifié', dot: 'bg-sky-400' },
]

function PipelineCard({ card }: { card: ContentCardData }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
      <p className="text-sm leading-snug text-zinc-200">{card.title}</p>
      <div className="mt-2.5 flex items-center gap-2">
        <SourceIcon source={card.platform} />
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{card.tag}</span>
        <span className="ml-auto text-[11px] text-zinc-500">{card.author}</span>
      </div>
    </div>
  )
}

export default function ContenuPage() {
  const { tenant } = useTenant()
  const maxPortee = Math.max(...tenant.platformStats.map((p) => p.portee))

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Contenu & Campagne"
        description="Calendrier éditorial, pipeline de validation et performances par plateforme."
        actions={
          <Badge variant="outline" className="border-violet-400/40 bg-violet-400/10 px-3 py-1 text-violet-300">
            Phase 2 — Aperçu
          </Badge>
        }
      />

      {/* Calendrier éditorial */}
      <Card className="bg-zinc-900/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-200">Calendrier éditorial — semaine du 13 au 19 juillet 2026</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="grid min-w-[900px] grid-cols-7 gap-2">
            {tenant.week.map((d) => (
              <div
                key={d.date}
                className={cn(
                  'rounded-md border p-2',
                  d.today ? 'border-sky-400/50 bg-sky-400/5' : 'border-zinc-800 bg-zinc-950/50',
                )}
              >
                <div className="mb-2 flex items-baseline justify-between">
                  <span className={cn('text-xs font-semibold uppercase', d.today ? 'text-sky-400' : 'text-zinc-400')}>
                    {d.day}
                  </span>
                  <span className={cn('text-[11px] tabular-nums', d.today ? 'text-sky-400' : 'text-zinc-500')}>{d.date}</span>
                </div>
                <div className="space-y-1.5">
                  {d.posts.length === 0 && <p className="text-[11px] italic text-zinc-600">—</p>}
                  {d.posts.map((p, i) => (
                    <div key={i} className="rounded border border-zinc-800 bg-zinc-900/80 p-1.5">
                      <div className="flex items-center gap-1.5">
                        <SourceIcon source={p.platform} className="h-3 w-3" />
                        <span className="text-[10px] tabular-nums text-zinc-500">{p.time}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-zinc-300">{p.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline éditorial */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-zinc-200">Pipeline de contenu</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const cards = tenant.pipeline[col.key]
            return (
              <div key={col.key} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={cn('h-2 w-2 rounded-full', col.dot)} />
                  <span className="text-sm font-medium text-zinc-200">{col.label}</span>
                  <span className="ml-auto rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] tabular-nums text-zinc-400">
                    {cards.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {cards.map((c, i) => (
                    <PipelineCard key={i} card={c} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Statistiques par plateforme */}
      <Card className="bg-zinc-900/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-200">Performance par plateforme — 7 derniers jours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tenant.platformStats.map((p) => (
            <div key={p.platform} className="grid grid-cols-[110px_1fr_auto] items-center gap-4">
              <span className="text-sm text-zinc-200">{p.platform}</span>
              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                    style={{ width: `${Math.round((p.portee / maxPortee) * 100)}%` }}
                  />
                </div>
                <span className="w-20 text-right text-sm tabular-nums text-zinc-300">{formatNumber(p.portee)}</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 tabular-nums text-emerald-400">
                {p.engagement.toLocaleString('fr-FR')} % eng.
              </Badge>
            </div>
          ))}
          <p className="pt-1 text-xs text-zinc-500">Portée = contacts uniques estimés · Engagement = interactions / portée.</p>
        </CardContent>
      </Card>
    </div>
  )
}
