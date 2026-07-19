import { Facebook, Instagram, MessageSquare, Newspaper, Send, Twitter } from 'lucide-react'
import type { SourceType } from '@/data/types'
import { cn } from '@/lib/utils'

const CONFIG: Record<SourceType, { icon: typeof Facebook; className: string; label: string }> = {
  facebook: { icon: Facebook, className: 'text-blue-400', label: 'Facebook' },
  x: { icon: Twitter, className: 'text-zinc-300', label: 'X' },
  telegram: { icon: Send, className: 'text-sky-400', label: 'Telegram' },
  presse: { icon: Newspaper, className: 'text-zinc-300', label: 'Presse' },
  forum: { icon: MessageSquare, className: 'text-zinc-400', label: 'Forum' },
  instagram: { icon: Instagram, className: 'text-pink-400', label: 'Instagram' },
}

export function SourceIcon({ source, className }: { source: SourceType; className?: string }) {
  const c = CONFIG[source]
  const Icon = c.icon
  return <Icon className={cn('h-4 w-4 shrink-0', c.className, className)} aria-label={c.label} />
}

export function sourceLabel(source: SourceType): string {
  return CONFIG[source].label
}
