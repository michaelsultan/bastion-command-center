import { Badge } from '@/components/ui/badge'
import type { Sentiment } from '@/data/types'
import { useLanguage } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/en'
import { cn } from '@/lib/utils'

const CLASSNAMES: Record<Sentiment, string> = {
  positif: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  neutre: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400',
  negatif: 'border-red-500/40 bg-red-500/10 text-red-400',
}

const LABEL_KEYS: Record<Sentiment, TranslationKey> = {
  positif: 'sentiment.positif',
  neutre: 'sentiment.neutre',
  negatif: 'sentiment.negatif',
}

export function SentimentBadge({ sentiment, className }: { sentiment: Sentiment; className?: string }) {
  const { t } = useLanguage()
  return (
    <Badge variant="outline" className={cn('font-medium whitespace-nowrap', CLASSNAMES[sentiment], className)}>
      {t(LABEL_KEYS[sentiment])}
    </Badge>
  )
}
