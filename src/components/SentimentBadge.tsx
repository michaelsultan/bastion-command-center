import { Badge } from '@/components/ui/badge'
import type { Sentiment } from '@/data/types'
import { cn } from '@/lib/utils'

const CONFIG: Record<Sentiment, { label: string; className: string }> = {
  positif: { label: 'Positif', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  neutre: { label: 'Neutre', className: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400' },
  negatif: { label: 'Négatif', className: 'border-red-500/40 bg-red-500/10 text-red-400' },
}

export function SentimentBadge({ sentiment, className }: { sentiment: Sentiment; className?: string }) {
  const c = CONFIG[sentiment]
  return (
    <Badge variant="outline" className={cn('font-medium whitespace-nowrap', c.className, className)}>
      {c.label}
    </Badge>
  )
}
