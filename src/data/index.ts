import type { Lang } from '@/i18n/LanguageContext'
import type { TenantData, TenantId } from './types'
import { marinescu } from './marinescu'
import { kowalska } from './kowalska'
import { novaria } from './novaria'

export const TENANT_ORDER: TenantId[] = ['marinescu', 'kowalska', 'novaria']

// Jeux de données bilingues — TenantContext choisit [langue][tenant]
export const TENANT_DATA: Record<Lang, Record<TenantId, TenantData>> = {
  en: { marinescu: marinescu.en, kowalska: kowalska.en, novaria: novaria.en },
  fr: { marinescu: marinescu.fr, kowalska: kowalska.fr, novaria: novaria.fr },
}

export interface Playbook {
  key: string
  title: string
  description: string
  steps: number
  lastReview: string
}

// Procédures standardisées — communes à tous les tenants, bilingues
export const PLAYBOOKS: Record<Lang, Playbook[]> = {
  fr: [
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
  ],
  en: [
    {
      key: 'compte',
      title: 'Account takeover',
      description: 'Lockdown, session revocation, evidence, recovery and communication.',
      steps: 6,
      lastReview: '02/07/2026',
    },
    {
      key: 'fuite',
      title: 'Data breach',
      description: 'Containment, GDPR assessment, notification of individuals and authorities.',
      steps: 7,
      lastReview: '28/06/2026',
    },
    {
      key: 'ddos',
      title: 'DDoS attack',
      description: 'Filtering activation, failover, traffic monitoring, CERT report.',
      steps: 5,
      lastReview: '18/07/2026',
    },
    {
      key: 'site',
      title: 'Website takeover',
      description: 'Controlled shutdown, restore from clean backup, forensic analysis.',
      steps: 8,
      lastReview: '30/06/2026',
    },
  ],
}

const LOCALES: Record<Lang, string> = { fr: 'fr-FR', en: 'en-US' }

export function formatReach(n: number, lang: Lang = 'fr'): string {
  const locale = LOCALES[lang]
  if (n >= 1000) return `${(n / 1000).toLocaleString(locale, { maximumFractionDigits: 1 })} k`
  return n.toLocaleString(locale)
}

export function formatNumber(n: number, lang: Lang = 'fr'): string {
  return n.toLocaleString(LOCALES[lang])
}
