import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { en } from '@/i18n/en'
import type { TranslationKey } from '@/i18n/en'
import { fr } from '@/i18n/fr'

// ─── Langue de l'interface — anglais par défaut, persistance locale ─────────

export type Lang = 'en' | 'fr'

const STORAGE_KEY = 'bastion.lang'

const DICTS: Record<Lang, Record<TranslationKey, string>> = { en, fr }

export interface LanguageApi {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageApi | null>(null)

function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (_match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`,
  )
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'fr' ? 'fr' : 'en'
    } catch {
      return 'en'
    }
  })

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // stockage indisponible (mode privé) — la langue reste en mémoire
    }
  }, [])

  const t = useMemo(() => {
    const dict = DICTS[lang]
    return (key: TranslationKey, vars?: Record<string, string | number>) => interpolate(dict[key], vars)
  }, [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t('app.title')
  }, [lang, t])

  const value = useMemo<LanguageApi>(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageApi {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage doit être utilisé dans un LanguageProvider')
  return ctx
}
