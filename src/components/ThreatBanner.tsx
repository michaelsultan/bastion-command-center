import type { ThreatLevel } from '@/data/types'
import { useLanguage } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/en'
import { ShieldAlert, ShieldCheck, ShieldHalf, ShieldX } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEVEL_KEYS: Record<ThreatLevel, TranslationKey> = {
  FAIBLE: 'threat.level.FAIBLE',
  'MODÉRÉ': 'threat.level.MODÉRÉ',
  'ÉLEVÉ': 'threat.level.ÉLEVÉ',
  CRITIQUE: 'threat.level.CRITIQUE',
}

const CONFIG: Record<
  ThreatLevel,
  { icon: typeof ShieldAlert; text: string; bar: string; bg: string; border: string; dot: string }
> = {
  FAIBLE: {
    icon: ShieldCheck,
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  'MODÉRÉ': {
    icon: ShieldHalf,
    text: 'text-amber-400',
    bar: 'bg-amber-500',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  'ÉLEVÉ': {
    icon: ShieldAlert,
    text: 'text-orange-400',
    bar: 'bg-orange-500',
    bg: 'bg-orange-500/5',
    border: 'border-orange-500/30',
    dot: 'bg-orange-500',
  },
  CRITIQUE: {
    icon: ShieldX,
    text: 'text-red-400',
    bar: 'bg-red-500',
    bg: 'bg-red-500/5',
    border: 'border-red-500/30',
    dot: 'bg-red-500',
  },
}

interface ThreatBannerProps {
  level: ThreatLevel
  summary: string
  updatedAt: string
}

export function ThreatBanner({ level, summary, updatedAt }: ThreatBannerProps) {
  const { t } = useLanguage()
  const c = CONFIG[level]
  const Icon = c.icon
  return (
    <div className={cn('relative overflow-hidden rounded-lg border pl-5 pr-4 py-4', c.bg, c.border)}>
      <span className={cn('absolute inset-y-0 left-0 w-1', c.bar)} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2.5">
          <Icon className={cn('h-6 w-6', c.text)} />
          <span className="text-sm text-zinc-400">{t('threat.banner.label')}</span>
          <span className={cn('text-lg font-bold tracking-wide', c.text)}>{t(LEVEL_KEYS[level])}</span>
          <span className={cn('relative flex h-2.5 w-2.5')}>
            <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', c.dot)} />
            <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', c.dot)} />
          </span>
        </div>
        <p className="min-w-0 flex-1 text-sm text-zinc-300">{summary}</p>
        <span className="whitespace-nowrap text-xs text-zinc-500">{t('threat.banner.assessed', { date: updatedAt })}</span>
      </div>
    </div>
  )
}
