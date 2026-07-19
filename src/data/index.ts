import type { TenantData, TenantId } from './types'
import { marinescu } from './marinescu'
import { kowalska } from './kowalska'
import { novaria } from './novaria'

export const TENANT_ORDER: TenantId[] = ['marinescu', 'kowalska', 'novaria']

export const TENANT_DATA: Record<TenantId, TenantData> = {
  marinescu,
  kowalska,
  novaria,
}

export interface Playbook {
  key: string
  title: string
  description: string
  steps: number
  lastReview: string
}

// Procédures standardisées — communes à tous les tenants
export const PLAYBOOKS: Playbook[] = [
  {
    key: 'compte',
    title: 'Piratage de compte',
    description: 'Verrouillage, révocation des sessions, preuve, reprise de contrôle et communication.',
    steps: 6,
    lastReview: '02/07/2026',
  },
  {
    key: 'fuite',
    title: 'Fuite de données',
    description: 'Confinement, évaluation RGPD, notification des personnes et des autorités.',
    steps: 7,
    lastReview: '28/06/2026',
  },
  {
    key: 'ddos',
    title: 'Attaque DDoS',
    description: 'Activation du filtrage, bascule de secours, suivi du trafic, rapport CERT.',
    steps: 5,
    lastReview: '18/07/2026',
  },
  {
    key: 'site',
    title: 'Prise de contrôle du site',
    description: 'Mise hors ligne contrôlée, restauration depuis sauvegarde saine, analyse forensique.',
    steps: 8,
    lastReview: '30/06/2026',
  },
]

export function formatReach(n: number): string {
  if (n >= 1000) return `${(n / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k`
  return n.toLocaleString('fr-FR')
}

export function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}
