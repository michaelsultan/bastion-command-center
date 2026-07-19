import { toast } from 'sonner'
import {
  AlertTriangle,
  AtSign,
  CheckCircle2,
  DatabaseZap,
  FileText,
  Globe,
  KeyRound,
  Mail,
  Share2,
  ShieldX,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { useTenant } from '@/context/TenantContext'
import { PLAYBOOKS } from '@/data'
import type { AssetType, CheckStatus } from '@/data/types'
import { cn } from '@/lib/utils'

const ASSET_ICON: Record<AssetType, typeof Globe> = {
  'Site web': Globe,
  'Domaine': AtSign,
  'Compte social': Share2,
  'Email': Mail,
  'Outil': Wrench,
}

const CHECK_ICON: Record<CheckStatus, { icon: typeof CheckCircle2; className: string }> = {
  ok: { icon: CheckCircle2, className: 'text-emerald-500' },
  avertissement: { icon: AlertTriangle, className: 'text-amber-500' },
  critique: { icon: XCircle, className: 'text-red-500' },
}

const PLAYBOOK_ICON: Record<string, typeof KeyRound> = {
  compte: KeyRound,
  fuite: DatabaseZap,
  ddos: Zap,
  site: ShieldX,
}

function scoreColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

function ScoreGauge({ score }: { score: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c * (1 - score / 100)
  const color = scoreColor(score)
  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#27272a" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-zinc-500">/ 100</span>
      </div>
    </div>
  )
}

export default function SecuritePage() {
  const { tenant } = useTenant()
  const { kpis, stressTest } = tenant
  const delta = kpis.securityScoreDelta

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Sécurité"
        description="Posture de sécurité des actifs numériques — contrôles automatisés quotidiens à 06:00."
        actions={
          <Button
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={() => toast.info('Export du rapport de posture demandé — disponible dans quelques instants.')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Exporter le rapport
          </Button>
        }
      />

      {/* Score + stress test */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="bg-zinc-900/70">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-zinc-200">Score de sécurité global</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6 pt-4">
            <ScoreGauge score={kpis.securityScore} />
            <div className="space-y-2 text-sm">
              <p className="text-zinc-400">
                Évolution hebdomadaire :{' '}
                <span className={cn('font-semibold', delta >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {delta >= 0 ? '+' : ''}
                  {delta} pts
                </span>
              </p>
              <p className="text-zinc-400">
                Actifs surveillés : <span className="font-semibold text-zinc-200">{tenant.assets.length}</span>
              </p>
              <p className="text-zinc-400">
                Contrôles en échec :{' '}
                <span className="font-semibold text-zinc-200">
                  {tenant.checks.filter((c) => c.status !== 'ok').length}
                </span>
              </p>
              <p className="text-xs text-zinc-500">Barème : ≥ 80 protégé · 60–79 à surveiller · &lt; 60 vulnérable</p>
            </div>
          </CardContent>
        </Card>

        {/* Stress test pré-électoral */}
        <Card className="border-sky-400/20 bg-zinc-900/70 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-200">Test de stress pré-électoral</CardTitle>
              <Badge variant="outline" className="border-sky-400/40 bg-sky-400/10 text-sky-400">
                Dernier run : {stressTest.lastRun}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-zinc-50">{stressTest.readiness} %</span>
              <span className="pb-1 text-sm text-zinc-400">de préparation opérationnelle</span>
            </div>
            <Progress value={stressTest.readiness} className="h-2 bg-zinc-800 [&>div]:bg-sky-400" />
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {stressTest.points.map((p) => (
                <li key={p.label} className="flex items-start gap-2 text-sm text-zinc-300">
                  {p.ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  {p.label}
                </li>
              ))}
            </ul>
            <Button
              className="bg-sky-500 font-medium text-zinc-950 hover:bg-sky-400"
              onClick={() =>
                toast.success('Rapport de stress-test lancé', {
                  description: 'Le rapport consolidé sera joint au brief de demain matin.',
                })
              }
            >
              Lancer le rapport
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actifs */}
      <Card className="bg-zinc-900/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-200">Registre des actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Actif</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Statut</TableHead>
                <TableHead className="text-right text-zinc-400">Score</TableHead>
                <TableHead className="text-right text-zinc-400">Dernier contrôle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenant.assets.map((a) => {
                const Icon = ASSET_ICON[a.type]
                return (
                  <TableRow key={a.name} className="border-zinc-800 hover:bg-zinc-800/40">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
                        <span className="font-medium text-zinc-100">{a.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                        {a.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold tabular-nums" style={{ color: scoreColor(a.score) }}>
                        {a.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-zinc-500">{a.lastCheck}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contrôles automatisés */}
      <Card className="bg-zinc-900/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-200">Contrôles automatisés</CardTitle>
          <p className="text-xs text-zinc-500">Exécution quotidienne à 06:00 — alerte immédiate en cas d’échec critique</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {tenant.checks.map((c) => {
            const conf = CHECK_ICON[c.status]
            const Icon = conf.icon
            return (
              <div key={c.label} className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', conf.className)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-100">{c.label}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{c.detail}</p>
                  <p className="mt-1 text-[11px] tabular-nums text-zinc-600">Dernière exécution : {c.lastRun}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Playbooks */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-zinc-200">Playbooks de réponse à incident</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLAYBOOKS.map((p) => {
            const Icon = PLAYBOOK_ICON[p.key] ?? FileText
            return (
              <Card key={p.key} className="bg-zinc-900/70">
                <CardContent className="flex h-full flex-col p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-red-500/25 bg-red-500/10">
                    <Icon className="h-[18px] w-[18px] text-red-400" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-100">{p.title}</p>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-400">{p.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{p.steps} étapes</span>
                    <span>Revue : {p.lastReview}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    onClick={() => toast.info(`Playbook « ${p.title} » ouvert en mode consultation.`)}
                  >
                    Ouvrir le playbook
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
