import type { Mention, TenantId } from './types'

// ─── Scénarios de simulation de crise (« mode crise » démo) ──────────────────
// Chaque tenant dispose de son propre script : les beats de la machine à états
// de CrisisContext interpolent ces contenus.

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

export const CRISIS_SCRIPT: Record<TenantId, CrisisScript> = {
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
