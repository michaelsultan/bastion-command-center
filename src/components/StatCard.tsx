import { Card, CardContent } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  delta?: number
  deltaSuffix?: string
  deltaLabel?: string
  invertDelta?: boolean
  children?: ReactNode
}

export function StatCard({ title, value, icon: Icon, delta, deltaSuffix = '', deltaLabel, invertDelta = false, children }: StatCardProps) {
  const hasDelta = typeof delta === 'number'
  const positive = hasDelta && delta! > 0
  const neutral = hasDelta && delta === 0
  // Couleur sémantique : parfois une hausse est mauvaise (invertDelta)
  const good = neutral ? null : invertDelta ? !positive : positive
  const DeltaIcon = neutral ? Minus : positive ? ArrowUpRight : ArrowDownRight

  return (
    <Card className="bg-zinc-900/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{title}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-50">{value}</p>
          </div>
          <div className="rounded-md border border-sky-400/20 bg-sky-400/10 p-2">
            <Icon className="h-4 w-4 text-sky-400" />
          </div>
        </div>
        {(hasDelta || deltaLabel) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {hasDelta && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium',
                  neutral && 'text-zinc-400',
                  good === true && 'text-emerald-400',
                  good === false && 'text-red-400',
                )}
              >
                <DeltaIcon className="h-3.5 w-3.5" />
                {positive ? '+' : ''}
                {delta}
                {deltaSuffix}
              </span>
            )}
            {deltaLabel && <span className="text-zinc-500">{deltaLabel}</span>}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}
