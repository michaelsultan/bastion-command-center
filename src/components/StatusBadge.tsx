import { Badge } from '@/components/ui/badge'
import type { AlertStatus, AssetStatus, CheckStatus } from '@/data/types'
import { cn } from '@/lib/utils'

type Status = AlertStatus | AssetStatus | CheckStatus

const CONFIG: Record<Status, { label: string; className: string }> = {
  nouveau: { label: 'Nouveau', className: 'border-sky-400/40 bg-sky-400/10 text-sky-400' },
  en_cours: { label: 'En cours', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  resolu: { label: 'Résolu', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  'Protégé': { label: 'Protégé', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  'À surveiller': { label: 'À surveiller', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  'Vulnérable': { label: 'Vulnérable', className: 'border-red-500/40 bg-red-500/10 text-red-400' },
  ok: { label: 'Conforme', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  avertissement: { label: 'Avertissement', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  critique: { label: 'Critique', className: 'border-red-500/40 bg-red-500/10 text-red-400' },
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const c = CONFIG[status]
  return (
    <Badge variant="outline" className={cn('font-medium whitespace-nowrap', c.className, className)}>
      {c.label}
    </Badge>
  )
}
