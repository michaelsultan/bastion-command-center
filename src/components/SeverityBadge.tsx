import { Badge } from '@/components/ui/badge'
import type { Severity } from '@/data/types'
import { useLanguage } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/en'
import { cn } from '@/lib/utils'

const CLASSNAMES: Record<Severity, string> = {
  critique: 'border-red-500/40 bg-red-500/10 text-red-400',
  elevee: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
  moyenne: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  faible: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400',
}

const LABEL_KEYS: Record<Severity, TranslationKey> = {
  critique: 'severity.critique',
  elevee: 'severity.elevee',
  moyenne: 'severity.moyenne',
  faible: 'severity.faible',
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const { t } = useLanguage()
  return (
    <Badge variant="outline" className={cn('font-medium whitespace-nowrap', CLASSNAMES[severity], className)}>
      {t(LABEL_KEYS[severity])}
    </Badge>
  )
}
