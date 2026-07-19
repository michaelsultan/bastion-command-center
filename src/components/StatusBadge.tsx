import { Badge } from '@/components/ui/badge'
import type { AlertStatus, AssetStatus, CheckStatus } from '@/data/types'
import { useLanguage } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/en'
import { cn } from '@/lib/utils'

type Status = AlertStatus | AssetStatus | CheckStatus

const CLASSNAMES: Record<Status, string> = {
  nouveau: 'border-sky-400/40 bg-sky-400/10 text-sky-400',
  en_cours: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  resolu: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  'Protégé': 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  'À surveiller': 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  'Vulnérable': 'border-red-500/40 bg-red-500/10 text-red-400',
  ok: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  avertissement: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  critique: 'border-red-500/40 bg-red-500/10 text-red-400',
}

const LABEL_KEYS: Record<Status, TranslationKey> = {
  nouveau: 'status.nouveau',
  en_cours: 'status.en_cours',
  resolu: 'status.resolu',
  'Protégé': 'status.asset.Protégé',
  'À surveiller': 'status.asset.À surveiller',
  'Vulnérable': 'status.asset.Vulnérable',
  ok: 'status.check.ok',
  avertissement: 'status.check.avertissement',
  critique: 'status.check.critique',
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { t } = useLanguage()
  return (
    <Badge variant="outline" className={cn('font-medium whitespace-nowrap', CLASSNAMES[status], className)}>
      {t(LABEL_KEYS[status])}
    </Badge>
  )
}
