import { Badge } from '@/components/ui/badge'
import type { Severity } from '@/data/types'
import { cn } from '@/lib/utils'

const CONFIG: Record<Severity, { label: string; className: string }> = {
  critique: { label: 'Critique', className: 'border-red-500/40 bg-red-500/10 text-red-400' },
  elevee: { label: 'Élevée', className: 'border-orange-500/40 bg-orange-500/10 text-orange-400' },
  moyenne: { label: 'Moyenne', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  faible: { label: 'Faible', className: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400' },
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const c = CONFIG[severity]
  return (
    <Badge variant="outline" className={cn('font-medium whitespace-nowrap', c.className, className)}>
      {c.label}
    </Badge>
  )
}
