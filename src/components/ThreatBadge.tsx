import { Badge } from '@/components/ui/badge'
import type { ThreatLevel } from '@/data/types'
import { cn } from '@/lib/utils'

const CONFIG: Record<ThreatLevel, { className: string; dot: string }> = {
  FAIBLE: { className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-500' },
  'MODÉRÉ': { className: 'border-amber-500/40 bg-amber-500/10 text-amber-400', dot: 'bg-amber-500' },
  'ÉLEVÉ': { className: 'border-orange-500/40 bg-orange-500/10 text-orange-400', dot: 'bg-orange-500' },
  CRITIQUE: { className: 'border-red-500/40 bg-red-500/10 text-red-400', dot: 'bg-red-500' },
}

export function ThreatBadge({ level, className }: { level: ThreatLevel; className?: string }) {
  const c = CONFIG[level]
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium whitespace-nowrap', c.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      Menace {level}
    </Badge>
  )
}
