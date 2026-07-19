import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { TenantData, TenantId } from '@/data/types'
import { TENANT_DATA } from '@/data'
import { useLanguage } from '@/i18n/LanguageContext'

interface TenantContextValue {
  tenantId: TenantId
  tenant: TenantData
  setTenant: (id: TenantId) => void
}

const TenantContext = createContext<TenantContextValue | null>(null)

export function TenantProvider({ children }: { children: ReactNode }) {
  const { lang } = useLanguage()
  const [tenantId, setTenantId] = useState<TenantId>('marinescu')

  const value = useMemo<TenantContextValue>(
    () => ({
      tenantId,
      tenant: TENANT_DATA[lang][tenantId],
      setTenant: setTenantId,
    }),
    [lang, tenantId],
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant doit être utilisé dans un TenantProvider')
  return ctx
}
