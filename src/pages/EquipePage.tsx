import { toast } from 'sonner'
import { AlertTriangle, BellRing, CheckCircle2, FileCheck2, History, ScrollText, ShieldCheck } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/PageHeader'
import { useTenant } from '@/context/TenantContext'
import type { AuditEntry } from '@/data/types'
import { cn } from '@/lib/utils'

const AUDIT_ICON: Record<AuditEntry['type'], { icon: typeof History; className: string }> = {
  securite: { icon: ShieldCheck, className: 'border-red-500/25 bg-red-500/10 text-red-400' },
  compte: { icon: CheckCircle2, className: 'border-zinc-600 bg-zinc-800 text-zinc-400' },
  contenu: { icon: ScrollText, className: 'border-sky-400/25 bg-sky-400/10 text-sky-400' },
  alerte: { icon: BellRing, className: 'border-amber-500/25 bg-amber-500/10 text-amber-400' },
}

export default function EquipePage() {
  const { tenant } = useTenant()
  const { charter } = tenant
  const pct = Math.round((charter.signed / charter.total) * 100)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Équipe & Accès"
        description="Contrôle d’accès basé sur les rôles (RBAC), MFA obligatoire et journal d’audit complet."
      />

      {/* Membres */}
      <Card className="bg-zinc-900/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-200">Membres de l’espace de travail</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Membre</TableHead>
                <TableHead className="text-zinc-400">Rôle</TableHead>
                <TableHead className="text-zinc-400">MFA</TableHead>
                <TableHead className="text-right text-zinc-400">Dernière activité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenant.team.map((m) => (
                <TableRow key={m.email} className="border-zinc-800 hover:bg-zinc-800/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-zinc-700">
                        <AvatarFallback className="bg-zinc-800 text-xs font-semibold text-zinc-300">{m.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{m.name}</p>
                        <p className="text-xs text-zinc-500">{m.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'border-zinc-700 text-zinc-300',
                        m.role.includes('lecture seule') && 'border-violet-400/40 bg-violet-400/10 text-violet-300',
                      )}
                    >
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {m.mfa ? (
                      <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                        Activé
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-400">
                        <AlertTriangle className="mr-1 h-3 w-3" />À activer
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-zinc-400">{m.lastActive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Journal d'audit */}
        <Card className="bg-zinc-900/70 xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-sky-400" />
              <CardTitle className="text-sm font-medium text-zinc-200">Journal d’audit — actions sensibles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {tenant.audit.map((a, i) => {
              const conf = AUDIT_ICON[a.type]
              const Icon = conf.icon
              return (
                <div key={i} className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                  <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border', conf.className)}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-200">{a.action}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {a.actor} · <span className="tabular-nums">{a.time}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Charte numérique */}
        <Card className="bg-zinc-900/70">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-sky-400" />
              <CardTitle className="text-sm font-medium text-zinc-200">Charte numérique</CardTitle>
            </div>
            <p className="text-xs text-zinc-500">Accusé de lecture obligatoire — version en vigueur depuis le {charter.lastUpdate}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-zinc-50">
                {charter.signed}/{charter.total}
              </span>
              <span className="pb-1 text-sm text-zinc-400">signatures</span>
            </div>
            <Progress value={pct} className="h-2 bg-zinc-800 [&>div]:bg-emerald-500" />
            {charter.pending.length > 0 ? (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">En attente de signature</p>
                <ul className="space-y-1">
                  {charter.pending.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-zinc-300">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Charte signée par l’ensemble de l’équipe.
              </p>
            )}
            {charter.pending.length > 0 && (
              <Button
                variant="outline"
                className="w-full border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
                onClick={() => toast.success('Relance envoyée', { description: `Rappel de signature transmis à ${charter.pending.join(', ')}.` })}
              >
                Relancer les signataires
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
