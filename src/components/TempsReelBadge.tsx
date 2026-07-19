import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

/** Badge des alertes auto-générées par l'écoute GDELT — distingué du badge « Live » de la simulation de crise. */
export function TempsReelBadge({ className }: { className?: string }) {
  const { t } = useLanguage()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border border-emerald-500/50 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400',
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      {t('badge.tempsreel')}
    </span>
  )
}
