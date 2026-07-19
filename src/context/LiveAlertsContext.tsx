import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AlertStatus, Severity, TenantId } from '@/data/types'

// ─── Alertes temps réel — détection automatique GDELT (session uniquement) ───
// Les alertes sont créées par la page Veille après analyse des articles réels,
// partagées ici pour être visibles sur Alertes, Vue d'ensemble, Vue agence et
// dans le compteur de la barre latérale. Aucune persistance : la session suffit.
// « Résolu » fait foi : l'épisode de détection est clos et la clé est masquée
// tant que la condition persiste. Seules deux choses réarment la détection :
// la résorption de la condition, ou la réouverture manuelle de l'alerte.

export type LiveAlertKind = 'campagne' | 'pic'

export interface LiveAlertLink {
  title: string
  url: string
  domain: string
}

/** Charge utile produite par le détecteur (brief-generator) avant création. */
export interface LiveDetection {
  severity: Severity
  title: string
  details: string[]
  links: LiveAlertLink[]
}

export interface LiveAlert extends LiveDetection {
  id: string
  key: string
  kind: LiveAlertKind
  tenantId: TenantId
  tenantName: string
  source: string
  time: string
  status: AlertStatus
}

export type ReportResult = 'created' | 'updated' | 'cleared' | 'suppressed' | 'none'

interface LiveAlertsApi {
  alerts: LiveAlert[]
  reportDetection: (
    tenantId: TenantId,
    tenantName: string,
    kind: LiveAlertKind,
    detection: LiveDetection | null,
  ) => ReportResult
  setLiveAlertStatus: (id: string, status: AlertStatus) => void
  alertsForTenant: (tenantId: TenantId) => LiveAlert[]
  countsForTenant: (tenantId: TenantId) => { active: number; critical: number }
  totalCounts: { active: number; critical: number }
}

const LiveAlertsContext = createContext<LiveAlertsApi | null>(null)

/** Horodatage au même format « JJ/MM HH:MM » que les données de démonstration. */
function nowStamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function LiveAlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<LiveAlert[]>([])
  // Épisodes ouverts : clé `${tenantId}:${kind}` → id de l'alerte. Non réactif par
  // design : la dédup est une mécanique interne, l'UI ne lit que `alerts`.
  const episodesRef = useRef(new Map<string, string>())
  // Clés masquées par une résolution opérateur : clé → id de l'alerte résolue.
  // Levées uniquement à la résorption de la condition ou à la réouverture manuelle.
  const suppressedRef = useRef(new Map<string, string>())
  const counterRef = useRef(0)

  const reportDetection = useCallback<LiveAlertsApi['reportDetection']>(
    (tenantId, tenantName, kind, detection) => {
      const key = `${tenantId}:${kind}`
      if (!detection) {
        // Condition résorbée : l'épisode se ferme et toute résolution opérateur
        // est oubliée — une récidive créera une nouvelle alerte.
        const had = episodesRef.current.delete(key)
        suppressedRef.current.delete(key)
        return had ? 'cleared' : 'none'
      }
      if (suppressedRef.current.has(key)) {
        // L'opérateur a résolu cette alerte alors que la condition persiste :
        // la résolution fait foi — on ne recrée ni ne rouvre rien.
        return 'suppressed'
      }
      const time = nowStamp()
      const existingId = episodesRef.current.get(key)
      if (existingId) {
        // Même épisode : on met à jour l'alerte existante (compteurs, horodatage,
        // sévérité) sans la dupliquer. Le statut choisi par l'opérateur est préservé.
        setAlerts((prev) => prev.map((a) => (a.id === existingId ? { ...a, ...detection, time } : a)))
        return 'updated'
      }
      counterRef.current += 1
      const alert: LiveAlert = {
        id: `GDELT-${String(counterRef.current).padStart(2, '0')}`,
        key,
        kind,
        tenantId,
        tenantName,
        source: 'Veille GDELT — temps réel',
        time,
        status: 'nouveau',
        ...detection,
      }
      episodesRef.current.set(key, alert.id)
      setAlerts((prev) => [alert, ...prev])
      return 'created'
    },
    [],
  )

  const setLiveAlertStatus = useCallback((id: string, status: AlertStatus) => {
    setAlerts((prev) => {
      const target = prev.find((a) => a.id === id)
      if (target) {
        if (status === 'resolu') {
          // Résolution : on clos l'épisode et on masque la clé, sauf si un épisode
          // plus récent (autre alerte) a déjà pris la clé — il reste propriétaire.
          const currentId = episodesRef.current.get(target.key)
          if (currentId === target.id || currentId === undefined) {
            episodesRef.current.delete(target.key)
            suppressedRef.current.set(target.key, target.id)
          }
        } else if (suppressedRef.current.get(target.key) === target.id) {
          // Réouverture manuelle : la détection est réarmée pour cet épisode —
          // la prochaine analyse mettra à jour cette alerte au lieu d'en créer une.
          suppressedRef.current.delete(target.key)
          episodesRef.current.set(target.key, target.id)
        }
      }
      return prev.map((a) => (a.id === id ? { ...a, status } : a))
    })
  }, [])

  const alertsForTenant = useCallback((tenantId: TenantId) => alerts.filter((a) => a.tenantId === tenantId), [alerts])

  const countsForTenant = useCallback(
    (tenantId: TenantId) => {
      const list = alerts.filter((a) => a.tenantId === tenantId && a.status !== 'resolu')
      return { active: list.length, critical: list.filter((a) => a.severity === 'critique').length }
    },
    [alerts],
  )

  const totalCounts = useMemo(() => {
    const list = alerts.filter((a) => a.status !== 'resolu')
    return { active: list.length, critical: list.filter((a) => a.severity === 'critique').length }
  }, [alerts])

  const value = useMemo<LiveAlertsApi>(
    () => ({ alerts, reportDetection, setLiveAlertStatus, alertsForTenant, countsForTenant, totalCounts }),
    [alerts, reportDetection, setLiveAlertStatus, alertsForTenant, countsForTenant, totalCounts],
  )

  return <LiveAlertsContext.Provider value={value}>{children}</LiveAlertsContext.Provider>
}

export function useLiveAlerts(): LiveAlertsApi {
  const ctx = useContext(LiveAlertsContext)
  if (!ctx) throw new Error('useLiveAlerts doit être utilisé dans un LiveAlertsProvider')
  return ctx
}
