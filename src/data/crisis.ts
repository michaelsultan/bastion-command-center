import type { Lang } from '@/i18n/LanguageContext'
import type { Mention, TenantId } from './types'

// ─── Scénarios de simulation de crise (« mode crise » démo) ──────────────────
// Chaque tenant dispose de son propre script : les beats de la machine à états
// de CrisisContext interpolent ces contenus. Bilingue : CrisisContext choisit
// la langue active ; les extraits de mentions restent en français (tag `lang`).

export interface CrisisStepDef {
  at: number // secondes après le déclenchement
  title: string
  description: string
  operator: string
}

export interface CrisisScript {
  alert1: string
  alert1Source: string
  alert2: string
  alert2Source: string
  alert3: string
  alert3Source: string
  mentions: Mention[]
  incidentTitle: string
  incidentSummary: string
  steps: CrisisStepDef[]
  measures: string[]
  sentimentDrop: number // points de sentiment net perdus à t+16
  mentionsSpike: number // mentions supplémentaires au maximum de la vague
}

export const CRISIS_BEATS = { alert1: 5, alert2: 10, alert3: 16, incident: 22, response: 28 } as const

const fr: Record<TenantId, CrisisScript> = {
  marinescu: {
    alert1: 'Vague de mentions négatives — groupes Facebook clujois',
    alert1Source: 'Veille Facebook',
    alert2: 'Comptes coordonnés détectés sur Telegram — similarité de texte 94 %',
    alert2Source: 'Veille Telegram',
    alert3: 'Faux « audit » des fonds européens diffusé en masse',
    alert3Source: 'Détection de contenu fabriqué',
    mentions: [
      {
        id: 'cm1',
        source: 'facebook',
        author: 'Groupe « Clujeni adevărați »',
        excerpt: 'URGENT : l’audit secret sur les fonds européens de Cluj a fuité. Marinescu doit démissionner ce soir. Partagez massivement !',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 21400,
        time: 'LIVE',
        topic: 'Finances municipales',
        live: true,
      },
      {
        id: 'cm2',
        source: 'telegram',
        author: 'Canal « Cluj Realitatea »',
        excerpt: 'DOCUMENT EXCLUSIF : preuve que la mairie a détourné 4 millions d’euros. Les médias cachent tout. Diffusez avant suppression.',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 15200,
        time: 'LIVE',
        topic: 'Finances municipales',
        live: true,
      },
      {
        id: 'cm3',
        source: 'x',
        author: '@cluj_adevar_2026',
        excerpt: 'Tout le monde sait maintenant. #MarinescuDemisia #Cluj',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 6800,
        time: 'LIVE',
        topic: 'Personnel du candidat',
        live: true,
      },
    ],
    incidentTitle: 'Campagne de dénigrement coordonnée — simulation',
    incidentSummary:
      'Propagation synchronisée d’un faux « audit » des fonds européens : publication quasi simultanée dans 8 groupes Facebook clujois et relais par 17 comptes Telegram créés cette semaine. Similarité textuelle de 94 % entre les messages.',
    steps: [
      { at: 22, title: 'Détection confirmée', description: 'Volume de mentions négatives ×5,1 vs. base de référence ; bascule en mode incident.', operator: 'Système Bastion' },
      { at: 24, title: 'Qualification', description: 'Faux document identifié : métadonnées incohérentes, logo d’un institut qui n’existe pas. Coordination confirmée (94 % de similarité).', operator: 'R. Ionescu — Opérateur sécurité' },
      { at: 26, title: 'Verrouillage préventif', description: 'Comptes d’administration sensibles passés en mode restreint ; sessions actives revérifiées.', operator: 'R. Ionescu — Opérateur sécurité' },
      { at: 28, title: 'Plan de réponse activé', description: 'Playbook « Campagne de dénigrement » : 6 contre-mesures lancées simultanément.', operator: 'I. Dumitru — Responsable com' },
    ],
    measures: [
      'Signalement groupé transmis à Meta et Telegram',
      'Communiqué pré-approuvé publié sur les canaux officiels',
      'Verrouillage des comptes d’administration sensibles',
      'Notification de l’équipe de campagne (SMS + in-app)',
      'Fiche factuelle « fonds européens » épinglée sur la page',
      'Rapport d’incident transmis au CERT-RO',
    ],
    sentimentDrop: 15,
    mentionsSpike: 220,
  },

  kowalska: {
    alert1: 'Vague de mentions négatives — groupes Facebook de Gdańsk',
    alert1Source: 'Veille Facebook',
    alert2: 'Comptes coordonnés détectés sur Telegram — similarité de texte 94 %',
    alert2Source: 'Veille Telegram',
    alert3: 'Fausse « facture » de financement de campagne en circulation',
    alert3Source: 'Détection de contenu fabriqué',
    mentions: [
      {
        id: 'cm1',
        source: 'facebook',
        author: 'Groupe « Gdańsk Bez Cenzury »',
        excerpt: 'PREUVE : la campagne Kowalska financée par des fonds étrangers. La facture circule, la candidate doit s’expliquer immédiatement.',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 13900,
        time: 'LIVE',
        topic: 'Finances de campagne',
        live: true,
      },
      {
        id: 'cm2',
        source: 'telegram',
        author: 'Canal « Trójmiasto Info »',
        excerpt: 'La facture que personne ne devait voir. 400 000 zł venues d’on ne sait où. Partagez avant que son équipe ne fasse supprimer.',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 9800,
        time: 'LIVE',
        topic: 'Finances de campagne',
        live: true,
      },
      {
        id: 'cm3',
        source: 'x',
        author: '@gdansk_prawda',
        excerpt: 'Silence radio du QG Kowalska depuis la fuite. Étonnant, non ?',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 4200,
        time: 'LIVE',
        topic: 'Personnel de la candidate',
        live: true,
      },
    ],
    incidentTitle: 'Campagne de dénigrement coordonnée — simulation',
    incidentSummary:
      'Diffusion synchronisée d’une fausse « facture » de financement étranger de la campagne : 5 groupes Facebook de Gdańsk et 14 comptes Telegram récents. Similarité textuelle de 94 %, graphisme imitant un cabinet comptable réel.',
    steps: [
      { at: 22, title: 'Détection confirmée', description: 'Volume de mentions négatives ×4,6 vs. base de référence ; bascule en mode incident.', operator: 'Système Bastion' },
      { at: 24, title: 'Qualification', description: 'Document fabriqué : numéro de facture inexistant, en-tête copiée d’un cabinet comptable de Poznań. Coordination confirmée.', operator: 'J. Wiśniewski — Opérateur sécurité' },
      { at: 26, title: 'Verrouillage préventif', description: 'Accès administrateurs des pages officielles passés en mode restreint.', operator: 'J. Wiśniewski — Opérateur sécurité' },
      { at: 28, title: 'Plan de réponse activé', description: 'Playbook « Campagne de dénigrement » : 6 contre-mesures lancées simultanément.', operator: 'A. Zielińska — Responsable com' },
    ],
    measures: [
      'Signalement groupé transmis à Meta et Telegram',
      'Démenti pré-approuvé publié sur les canaux officiels',
      'Verrouillage des comptes d’administration sensibles',
      'Notification de l’équipe de campagne (SMS + in-app)',
      'Fiche de transparence financière épinglée sur la page',
      'Rapport d’incident transmis au CERT Polska',
    ],
    sentimentDrop: 18,
    mentionsSpike: 160,
  },

  novaria: {
    alert1: 'Vague de mentions négatives — groupes Facebook de Novaria',
    alert1Source: 'Veille Facebook',
    alert2: 'Comptes coordonnés détectés sur Telegram — similarité de texte 94 %',
    alert2Source: 'Veille Telegram',
    alert3: 'Faux « contrat » du marché de voirie diffusé en masse',
    alert3Source: 'Détection de contenu fabriqué',
    mentions: [
      {
        id: 'cm1',
        source: 'telegram',
        author: 'Canal « Novaria Libre »',
        excerpt: 'LE CONTRAT SECRET DU QUAI OUEST EST LÀ. 5,8 M€ pour des travaux évalués à 2 M€. Dobrović doit partir. RT avant censure.',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 11700,
        time: 'LIVE',
        topic: 'Marchés publics',
        live: true,
      },
      {
        id: 'cm2',
        source: 'facebook',
        author: 'Groupe « Non au quai Ouest »',
        excerpt: 'On nous ment depuis le début : le vrai contrat prouve le détournement. Rendez-vous mardi 18:00 en nombre !',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 8400,
        time: 'LIVE',
        topic: 'Urbanisme',
        live: true,
      },
      {
        id: 'cm3',
        source: 'forum',
        author: 'novaria-forum.net — fil « Voirie »',
        excerpt: 'Le document circule partout ce soir. Si c’est vrai, c’est un scandale. Si c’est faux, la mairie doit réagir vite.',
        lang: 'FR',
        sentiment: 'neutre',
        reach: 2600,
        time: 'LIVE',
        topic: 'Marchés publics',
        live: true,
      },
    ],
    incidentTitle: 'Campagne de dénigrement coordonnée — simulation',
    incidentSummary:
      'Propagation synchronisée d’un faux « contrat » du marché de voirie à 48 h de la mobilisation du quai Ouest : 4 groupes Facebook et le canal « Novaria Libre » relayé par 11 comptes récents. Similarité textuelle de 94 %.',
    steps: [
      { at: 22, title: 'Détection confirmée', description: 'Volume de mentions négatives ×4,2 vs. base de référence ; bascule en mode incident.', operator: 'Système Bastion' },
      { at: 24, title: 'Qualification', description: 'Document fabriqué : numérotation incohérente avec le registre des marchés, montants impossibles. Coordination confirmée.', operator: 'M. Stojanović — Opératrice sécurité' },
      { at: 26, title: 'Verrouillage préventif', description: 'Comptes de publication municipaux passés en double validation.', operator: 'M. Stojanović — Opératrice sécurité' },
      { at: 28, title: 'Plan de réponse activé', description: 'Playbook « Campagne de dénigrement » : 6 contre-mesures lancées simultanément.', operator: 'P. Nikolić — Responsable com' },
    ],
    measures: [
      'Signalement groupé transmis à Meta et Telegram',
      'Communiqué pré-approuvé publié sur les canaux officiels',
      'Verrouillage des comptes de publication municipaux',
      'Notification du cabinet et des modérateurs (SMS + in-app)',
      'Fiche de transparence du marché épinglée sur la page',
      'Rapport d’incident transmis au CERT national',
    ],
    sentimentDrop: 12,
    mentionsSpike: 140,
  },
}

const en: Record<TenantId, CrisisScript> = {
  marinescu: {
    alert1: 'Wave of negative mentions — Cluj Facebook groups',
    alert1Source: 'Facebook monitoring',
    alert2: 'Coordinated accounts detected on Telegram — 94% text similarity',
    alert2Source: 'Telegram monitoring',
    alert3: 'Fake EU-funds "audit" spread en masse',
    alert3Source: 'Fabricated-content detection',
    mentions: [
      {
        id: 'cm1',
        source: 'facebook',
        author: 'Groupe « Clujeni adevărați »',
        excerpt: 'URGENT : l’audit secret sur les fonds européens de Cluj a fuité. Marinescu doit démissionner ce soir. Partagez massivement !',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 21400,
        time: 'LIVE',
        topic: 'Municipal finances',
        live: true,
      },
      {
        id: 'cm2',
        source: 'telegram',
        author: 'Canal « Cluj Realitatea »',
        excerpt: 'DOCUMENT EXCLUSIF : preuve que la mairie a détourné 4 millions d’euros. Les médias cachent tout. Diffusez avant suppression.',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 15200,
        time: 'LIVE',
        topic: 'Municipal finances',
        live: true,
      },
      {
        id: 'cm3',
        source: 'x',
        author: '@cluj_adevar_2026',
        excerpt: 'Tout le monde sait maintenant. #MarinescuDemisia #Cluj',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 6800,
        time: 'LIVE',
        topic: "Candidate's staff",
        live: true,
      },
    ],
    incidentTitle: 'Coordinated smear campaign — simulation',
    incidentSummary:
      'Synchronized spread of a fake EU-funds "audit": near-simultaneous posting in 8 Cluj Facebook groups and relay by 17 Telegram accounts created this week. 94% textual similarity between messages.',
    steps: [
      { at: 22, title: 'Detection confirmed', description: 'Negative mention volume ×5.1 vs. baseline; switching to incident mode.', operator: 'Bastion system' },
      { at: 24, title: 'Qualification', description: 'Fake document identified: inconsistent metadata, logo of a nonexistent institute. Coordination confirmed (94% similarity).', operator: 'R. Ionescu — Security operator' },
      { at: 26, title: 'Preventive lockdown', description: 'Sensitive admin accounts switched to restricted mode; active sessions re-verified.', operator: 'R. Ionescu — Security operator' },
      { at: 28, title: 'Response plan activated', description: '"Smear campaign" playbook: 6 counter-measures launched simultaneously.', operator: 'I. Dumitru — Head of comms' },
    ],
    measures: [
      'Bulk report sent to Meta and Telegram',
      'Pre-approved statement published on official channels',
      'Sensitive admin accounts locked down',
      'Campaign team notified (SMS + in-app)',
      '"EU funds" fact sheet pinned to the page',
      'Incident report sent to CERT-RO',
    ],
    sentimentDrop: 15,
    mentionsSpike: 220,
  },

  kowalska: {
    alert1: 'Wave of negative mentions — Gdańsk Facebook groups',
    alert1Source: 'Facebook monitoring',
    alert2: 'Coordinated accounts detected on Telegram — 94% text similarity',
    alert2Source: 'Telegram monitoring',
    alert3: 'Fake campaign-funding "invoice" in circulation',
    alert3Source: 'Fabricated-content detection',
    mentions: [
      {
        id: 'cm1',
        source: 'facebook',
        author: 'Groupe « Gdańsk Bez Cenzury »',
        excerpt: 'PREUVE : la campagne Kowalska financée par des fonds étrangers. La facture circule, la candidate doit s’expliquer immédiatement.',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 13900,
        time: 'LIVE',
        topic: 'Campaign finances',
        live: true,
      },
      {
        id: 'cm2',
        source: 'telegram',
        author: 'Canal « Trójmiasto Info »',
        excerpt: 'La facture que personne ne devait voir. 400 000 zł venues d’on ne sait où. Partagez avant que son équipe ne fasse supprimer.',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 9800,
        time: 'LIVE',
        topic: 'Campaign finances',
        live: true,
      },
      {
        id: 'cm3',
        source: 'x',
        author: '@gdansk_prawda',
        excerpt: 'Silence radio du QG Kowalska depuis la fuite. Étonnant, non ?',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 4200,
        time: 'LIVE',
        topic: "Candidate's staff",
        live: true,
      },
    ],
    incidentTitle: 'Coordinated smear campaign — simulation',
    incidentSummary:
      'Synchronized spread of a fake foreign campaign-funding "invoice": 5 Gdańsk Facebook groups and 14 recent Telegram accounts. 94% textual similarity, graphics mimicking a real accounting firm.',
    steps: [
      { at: 22, title: 'Detection confirmed', description: 'Negative mention volume ×4.6 vs. baseline; switching to incident mode.', operator: 'Bastion system' },
      { at: 24, title: 'Qualification', description: 'Fabricated document: nonexistent invoice number, letterhead copied from a Poznań accounting firm. Coordination confirmed.', operator: 'J. Wiśniewski — Security operator' },
      { at: 26, title: 'Preventive lockdown', description: 'Admin access to official pages switched to restricted mode.', operator: 'J. Wiśniewski — Security operator' },
      { at: 28, title: 'Response plan activated', description: '"Smear campaign" playbook: 6 counter-measures launched simultaneously.', operator: 'A. Zielińska — Head of comms' },
    ],
    measures: [
      'Bulk report sent to Meta and Telegram',
      'Pre-approved rebuttal published on official channels',
      'Sensitive admin accounts locked down',
      'Campaign team notified (SMS + in-app)',
      'Financial transparency sheet pinned to the page',
      'Incident report sent to CERT Polska',
    ],
    sentimentDrop: 18,
    mentionsSpike: 160,
  },

  novaria: {
    alert1: 'Wave of negative mentions — Novaria Facebook groups',
    alert1Source: 'Facebook monitoring',
    alert2: 'Coordinated accounts detected on Telegram — 94% text similarity',
    alert2Source: 'Telegram monitoring',
    alert3: 'Fake roadworks "contract" spread en masse',
    alert3Source: 'Fabricated-content detection',
    mentions: [
      {
        id: 'cm1',
        source: 'telegram',
        author: 'Canal « Novaria Libre »',
        excerpt: 'LE CONTRAT SECRET DU QUAI OUEST EST LÀ. 5,8 M€ pour des travaux évalués à 2 M€. Dobrović doit partir. RT avant censure.',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 11700,
        time: 'LIVE',
        topic: 'Public contracts',
        live: true,
      },
      {
        id: 'cm2',
        source: 'facebook',
        author: 'Groupe « Non au quai Ouest »',
        excerpt: 'On nous ment depuis le début : le vrai contrat prouve le détournement. Rendez-vous mardi 18:00 en nombre !',
        lang: 'FR',
        sentiment: 'negatif',
        reach: 8400,
        time: 'LIVE',
        topic: 'Urban planning',
        live: true,
      },
      {
        id: 'cm3',
        source: 'forum',
        author: 'novaria-forum.net — fil « Voirie »',
        excerpt: 'Le document circule partout ce soir. Si c’est vrai, c’est un scandale. Si c’est faux, la mairie doit réagir vite.',
        lang: 'FR',
        sentiment: 'neutre',
        reach: 2600,
        time: 'LIVE',
        topic: 'Public contracts',
        live: true,
      },
    ],
    incidentTitle: 'Coordinated smear campaign — simulation',
    incidentSummary:
      'Synchronized spread of a fake roadworks "contract" 48 h before the West quay mobilization: 4 Facebook groups and the "Novaria Libre" channel relayed by 11 recent accounts. 94% textual similarity.',
    steps: [
      { at: 22, title: 'Detection confirmed', description: 'Negative mention volume ×4.2 vs. baseline; switching to incident mode.', operator: 'Bastion system' },
      { at: 24, title: 'Qualification', description: 'Fabricated document: numbering inconsistent with the contracts register, impossible amounts. Coordination confirmed.', operator: 'M. Stojanović — Security operator' },
      { at: 26, title: 'Preventive lockdown', description: 'Municipal publishing accounts switched to dual validation.', operator: 'M. Stojanović — Security operator' },
      { at: 28, title: 'Response plan activated', description: '"Smear campaign" playbook: 6 counter-measures launched simultaneously.', operator: 'P. Nikolić — Head of comms' },
    ],
    measures: [
      'Bulk report sent to Meta and Telegram',
      'Pre-approved statement published on official channels',
      'Municipal publishing accounts locked down',
      'Mayor’s office and moderators notified (SMS + in-app)',
      'Contract transparency sheet pinned to the page',
      'Incident report sent to the national CERT',
    ],
    sentimentDrop: 12,
    mentionsSpike: 140,
  },
}

export const CRISIS_SCRIPT: Record<Lang, Record<TenantId, CrisisScript>> = { en, fr }
