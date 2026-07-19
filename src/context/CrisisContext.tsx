import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { useTenant } from '@/context/TenantContext'
import { CRISIS_BEATS, CRISIS_SCRIPT } from '@/data/crisis'
import { TENANT_DATA } from '@/data'
import type { CrisisScript } from '@/data/crisis'
import type { AlertItem, IncidentStep, TenantData, TenantId, ThreatLevel } from '@/data/types'

// ─── Machine à états de la simulation de crise ───────────────────────────────
// phase 0 : inactif
// phase 1 : t=0    anomalie détectée (bannière)
// phase 2 : t+5    alerte 1 (Élevée)
// phase 3 : t+10   alerte 2 (Élevée) + niveau de menace relevé d'un cran
// phase 4 : t+16   alerte 3 (Critique) + chute du sentiment + vague de mentions
// phase 5 : t+22   ATTAQUE COORDONNÉE — incident ouvert, niveau CRITIQUE
// phase 6 : t+28   plan de réponse activé (état final maintenu)

const ESCALATE: Record<ThreatLevel, ThreatLevel> = {
  FAIBLE: 'MODÉRÉ',
  'MODÉRÉ': 'ÉLEVÉ',
  'ÉLEVÉ': 'CRITIQUE',
  CRITIQUE: 'CRITIQUE',
}

interface TickerEvent {
  at: number
  text: string
}

interface CrisisState {
  active: boolean
  crisisTenantId: TenantId | null
  phase: number
  elapsed: number
  /** Dernière crise de la session — conservée après « Terminer » pour le rapport PDF. */
  lastCrisis: { tenantId: TenantId; completed: boolean } | null
}

const IDLE: CrisisState = { active: false, crisisTenantId: null, phase: 0, elapsed: 0, lastCrisis: null }

interface CrisisApi extends CrisisState {
  start: () => void
  stop: () => void
  applyTo: (base: TenantData) => TenantData
  ticker: TickerEvent[]
  measures: string[]
}

const CrisisContext = createContext<CrisisApi | null>(null)

function buildTicker(script: CrisisScript): TickerEvent[] {
  return [
    { at: 0, text: 'Pic de mentions détecté — analyse du moteur de veille en cours' },
    { at: CRISIS_BEATS.alert1, text: `Alerte Élevée : ${script.alert1}` },
    { at: CRISIS_BEATS.alert2, text: `Alerte Élevée : ${script.alert2}` },
    { at: CRISIS_BEATS.alert3, text: `Alerte Critique : ${script.alert3}` },
    { at: CRISIS_BEATS.incident, text: `Incident ouvert : ${script.incidentTitle}` },
    { at: CRISIS_BEATS.response, text: 'Plan de réponse activé — 6 contre-mesures lancées simultanément' },
  ]
}

export function CrisisProvider({ children }: { children: ReactNode }) {
  const { tenantId } = useTenant()
  const [state, setState] = useState<CrisisState>(IDLE)
  const timeoutsRef = useRef<number[]>([])
  const intervalRef = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t))
    timeoutsRef.current = []
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearTimers()
    setState((s) => {
      if (s.active) {
        toast.info('Simulation terminée', { description: 'État normal restauré sur l’ensemble des écrans.' })
      }
      // lastCrisis est conservé : le rapport PDF reste disponible après la fin.
      return { ...IDLE, lastCrisis: s.lastCrisis }
    })
  }, [clearTimers])

  const start = useCallback(() => {
    setState((s) => {
      if (s.active) return s // impossible de lancer deux simulations
      const script = CRISIS_SCRIPT[tenantId]

      toast.warning('SIMULATION — Anomalie détectée', {
        description: `Pic de mentions en cours d’analyse sur « ${TENANT_DATA[tenantId].meta.name} ».`,
      })

      const beat = (delay: number, fn: () => void) => {
        timeoutsRef.current.push(window.setTimeout(fn, delay * 1000))
      }

      beat(CRISIS_BEATS.alert1, () => {
        setState((p) => ({ ...p, phase: 2 }))
        toast.warning('SIMULATION — Nouvelle alerte (Élevée)', { description: script.alert1 })
      })
      beat(CRISIS_BEATS.alert2, () => {
        setState((p) => ({ ...p, phase: 3 }))
        toast.warning('SIMULATION — Coordination confirmée', {
          description: `${script.alert2}. Niveau de menace relevé.`,
        })
      })
      beat(CRISIS_BEATS.alert3, () => {
        setState((p) => ({ ...p, phase: 4 }))
        toast.error('SIMULATION — Alerte critique', { description: script.alert3 })
      })
      beat(CRISIS_BEATS.incident, () => {
        setState((p) => ({ ...p, phase: 5 }))
        toast.error('SIMULATION — Attaque coordonnée en cours', {
          description: `Incident ouvert : ${script.incidentTitle}.`,
        })
      })
      beat(CRISIS_BEATS.response, () => {
        setState((p) => ({
          ...p,
          phase: 6,
          lastCrisis: p.lastCrisis ? { ...p.lastCrisis, completed: true } : p.lastCrisis,
        }))
        toast.success('SIMULATION — Plan de réponse activé', {
          description: 'Playbook « Campagne de dénigrement » : 6 contre-mesures lancées.',
        })
      })

      intervalRef.current = window.setInterval(() => {
        setState((p) => (p.active ? { ...p, elapsed: p.elapsed + 1 } : p))
      }, 1000)

      return { active: true, crisisTenantId: tenantId, phase: 1, elapsed: 0, lastCrisis: { tenantId, completed: false } }
    })
  }, [tenantId])

  // Garde contre les fuites de timers au démontage
  useEffect(() => clearTimers, [clearTimers])

  const applyTo = useCallback(
    (base: TenantData): TenantData => {
      const { active, crisisTenantId, phase, elapsed } = state
      if (!active || !crisisTenantId || base.meta.id !== crisisTenantId || phase === 0) return base
      const script = CRISIS_SCRIPT[crisisTenantId]

      const ago = (at: number) => {
        const d = Math.max(0, elapsed - at)
        return d < 60 ? `il y a ${d} s` : `il y a ${Math.floor(d / 60)} min`
      }

      // Alertes injectées (les plus récentes en tête)
      const injected: AlertItem[] = []
      if (phase >= 4)
        injected.push({
          id: 'ALT-LIVE-03',
          severity: 'critique',
          title: script.alert3,
          source: script.alert3Source,
          time: ago(CRISIS_BEATS.alert3),
          status: 'nouveau',
          live: true,
        })
      if (phase >= 3)
        injected.push({
          id: 'ALT-LIVE-02',
          severity: 'elevee',
          title: script.alert2,
          source: script.alert2Source,
          time: ago(CRISIS_BEATS.alert2),
          status: 'nouveau',
          live: true,
        })
      if (phase >= 2)
        injected.push({
          id: 'ALT-LIVE-01',
          severity: 'elevee',
          title: script.alert1,
          source: script.alert1Source,
          time: ago(CRISIS_BEATS.alert1),
          status: 'nouveau',
          live: true,
        })

      // Niveau de menace : relevé d'un cran à la phase 3, CRITIQUE à la phase 5
      const level: ThreatLevel = phase >= 5 ? 'CRITIQUE' : phase >= 3 ? ESCALATE[base.threat.level] : base.threat.level
      const summary =
        phase >= 5
          ? 'Attaque coordonnée en cours — plan de réponse activé, contre-mesures en déploiement.'
          : phase >= 3
            ? 'Coordination confirmée entre comptes — niveau de menace relevé. Analyse en cours.'
            : 'Pic de mentions anormal en cours d’analyse par le moteur de veille.'

      // Vague de mentions : montée progressive sur ~12 s à partir de t+16
      const spike =
        phase >= 4
          ? Math.min(script.mentionsSpike, Math.round(((elapsed - CRISIS_BEATS.alert3) / 12) * script.mentionsSpike))
          : 0
      const sentDrop = phase >= 4 ? script.sentimentDrop : 0

      // Point « LIVE » du graphique de sentiment
      const last = base.sentimentTrend[base.sentimentTrend.length - 1]
      let trend = base.sentimentTrend
      if (phase >= 4) {
        const positif = Math.max(4, last.positif - 12)
        const negatif = Math.min(80, last.negatif + 16)
        const neutre = Math.max(0, 100 - positif - negatif)
        trend = [...base.sentimentTrend, { date: 'LIVE', positif, neutre, negatif }]
      }

      // Mentions injectées dans le flux
      const injectedMentions = phase >= 4 ? script.mentions : phase >= 2 ? script.mentions.slice(0, 1) : []

      // Incident de crise à chronologie progressive
      let incident = base.incident
      if (phase >= 5) {
        const visible = script.steps.filter((s) => s.at <= elapsed)
        const steps: IncidentStep[] = visible.map((s, i) => ({
          time: `T+${s.at} s`,
          title: s.title,
          description: s.description,
          operator: s.operator,
          state: i === visible.length - 1 ? 'en_cours' : 'termine',
        }))
        steps.push({
          time: '—',
          title: 'Post-mortem & clôture',
          description: 'Analyse complète une fois la propagation retombée sous le seuil d’alerte.',
          operator: 'À attribuer',
          state: 'a_venir',
        })
        incident = {
          id: 'INC-LIVE-26',
          title: script.incidentTitle,
          severity: 'critique',
          status: 'En cours',
          detected: '19/07/2026 — simulation en direct',
          summary: script.incidentSummary,
          steps,
        }
      }

      return {
        ...base,
        threat: { ...base.threat, level, summary, updatedAt: '19/07/2026 — en direct' },
        kpis: {
          ...base.kpis,
          activeAlerts: base.kpis.activeAlerts + injected.length,
          criticalAlerts: base.kpis.criticalAlerts + (phase >= 4 ? 1 : 0),
          netSentiment: base.kpis.netSentiment - sentDrop,
          mentions24h: base.kpis.mentions24h + spike,
        },
        alerts: [...injected, ...base.alerts],
        mentions: [...injectedMentions, ...base.mentions],
        sentimentTrend: trend,
        incident,
      }
    },
    [state],
  )

  const value = useMemo<CrisisApi>(() => {
    const script = state.crisisTenantId ? CRISIS_SCRIPT[state.crisisTenantId] : null
    return {
      ...state,
      start,
      stop,
      applyTo,
      ticker: script ? buildTicker(script).filter((e) => e.at <= state.elapsed) : [],
      measures: script && state.phase >= 6 ? script.measures : [],
    }
  }, [state, start, stop, applyTo])

  return <CrisisContext.Provider value={value}>{children}</CrisisContext.Provider>
}

export function useCrisis(): CrisisApi {
  const ctx = useContext(CrisisContext)
  if (!ctx) throw new Error('useCrisis doit être utilisé dans un CrisisProvider')
  return ctx
}

/** Données du tenant courant, enrichies de la simulation de crise si active. */
export function useEffectiveTenant(): TenantData {
  const { tenant } = useTenant()
  const { applyTo } = useCrisis()
  return applyTo(tenant)
}
