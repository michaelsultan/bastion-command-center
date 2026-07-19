import { Facebook, Instagram, MessageSquare, Newspaper, Send, Twitter } from 'lucide-react'
import type { SourceType } from '@/data/types'
import { useLanguage } from '@/i18n/LanguageContext'
import type { LanguageApi } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/en'
import { cn } from '@/lib/utils'

const CONFIG: Record<SourceType, { icon: typeof Facebook; className: string; labelKey: TranslationKey | null }> = {
  facebook: { icon: Facebook, className: 'text-blue-400', labelKey: null }, // nom de produit
  x: { icon: Twitter, className: 'text-zinc-300', labelKey: null },
  telegram: { icon: Send, className: 'text-sky-400', labelKey: null },
  presse: { icon: Newspaper, className: 'text-zinc-300', labelKey: 'source.presse' },
  forum: { icon: MessageSquare, className: 'text-zinc-400', labelKey: null },
  instagram: { icon: Instagram, className: 'text-pink-400', labelKey: null },
}

const PRODUCT_LABELS: Record<SourceType, string> = {
  facebook: 'Facebook',
  x: 'X',
  telegram: 'Telegram',
  presse: 'Presse',
  forum: 'Forum',
  instagram: 'Instagram',
}

export function SourceIcon({ source, className }: { source: SourceType; className?: string }) {
  const { t } = useLanguage()
  const c = CONFIG[source]
  const Icon = c.icon
  const label = c.labelKey ? t(c.labelKey) : PRODUCT_LABELS[source]
  return <Icon className={cn('h-4 w-4 shrink-0', c.className, className)} aria-label={label} />
}

export function sourceLabel(source: SourceType, t: LanguageApi['t']): string {
  const key = CONFIG[source].labelKey
  return key ? t(key) : PRODUCT_LABELS[source]
}
