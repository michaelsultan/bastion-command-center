import type { Lang } from '@/i18n/LanguageContext'
import type { TenantData } from './types'

// ─── Tenant Marinescu — données bilingues ────────────────────────────────────
// Les extraits de mentions restent dans leur langue d'origine (tag `lang`) dans
// les deux jeux de données ; seules les métadonnées sont traduites.

const fr: TenantData = {
  meta: {
    id: 'marinescu',
    name: 'Campagne Marinescu 2026',
    subtitle: 'Mairie de Cluj-Napoca — Roumanie',
    detail: 'A. Marinescu · maire sortant · élections sept. 2026',
    initials: 'CM',
  },

  threat: {
    level: 'ÉLEVÉ',
    summary:
      'Campagne de dénigrement coordonnée en cours sur Facebook et Telegram. Rumeur sur les finances municipales en diffusion active.',
    updatedAt: '19/07/2026 09:30',
  },

  kpis: {
    securityScore: 74,
    securityScoreDelta: -3,
    mentions24h: 1284,
    mentionsDelta: 38,
    netSentiment: -12,
    netSentimentDelta: -9,
    activeAlerts: 7,
    criticalAlerts: 2,
  },

  sentimentTrend: [
    { date: '13/07', positif: 46, neutre: 34, negatif: 20 },
    { date: '14/07', positif: 44, neutre: 36, negatif: 20 },
    { date: '15/07', positif: 47, neutre: 33, negatif: 20 },
    { date: '16/07', positif: 42, neutre: 35, negatif: 23 },
    { date: '17/07', positif: 38, neutre: 34, negatif: 28 },
    { date: '18/07', positif: 31, neutre: 33, negatif: 36 },
    { date: '19/07', positif: 29, neutre: 33, negatif: 38 },
  ],

  alerts: [
    { id: 'ALT-2026-121', severity: 'critique', title: 'Rumeur « fonds européens détournés » en propagation rapide', source: 'Facebook — 6 groupes locaux', time: '19/07 08:47', status: 'en_cours' },
    { id: 'ALT-2026-120', severity: 'critique', title: 'Domaine typosquatté marinescu-informatii.ro actif', source: 'Surveillance DNS', time: '19/07 07:12', status: 'en_cours' },
    { id: 'ALT-2026-119', severity: 'elevee', title: '12 comptes Telegram coordonnés republiant des visuels identiques', source: 'Veille Telegram', time: '18/07 22:38', status: 'en_cours' },
    { id: 'ALT-2026-118', severity: 'elevee', title: 'Adresse e-mail d’un bénévole exposée dans une fuite de données', source: 'HaveIBeenPwned', time: '18/07 18:05', status: 'resolu' },
    { id: 'ALT-2026-117', severity: 'moyenne', title: 'Pic de comptes suspects sous les publications de campagne (14 %)', source: 'Modération Facebook', time: '18/07 15:22', status: 'en_cours' },
    { id: 'ALT-2026-116', severity: 'moyenne', title: 'Post de 2019 sur les transports reparti hors contexte sur X', source: 'Veille X', time: '18/07 11:40', status: 'nouveau' },
    { id: 'ALT-2026-114', severity: 'faible', title: 'Politique DMARC du domaine de campagne en mode « quarantine » partiel', source: 'Contrôle e-mail', time: '17/07 06:00', status: 'nouveau' },
    { id: 'ALT-2026-112', severity: 'faible', title: 'Certificat TLS de la plateforme bénévoles expire dans 34 jours', source: 'Contrôle TLS', time: '16/07 06:00', status: 'resolu' },
  ],

  incident: {
    id: 'INC-2026-041',
    title: 'Campagne de dénigrement coordonnée',
    severity: 'critique',
    status: 'En cours',
    detected: '18/07/2026 21:14',
    summary:
      'Diffusion synchronisée d’une rumeur visant les finances municipales : messages quasi identiques dans 6 groupes Facebook clujois (≈ 45 000 membres cumulés), relayés par 12 comptes Telegram créés après le 10/07.',
    steps: [
      { time: '18/07 21:14', title: 'Détection', description: 'Détecteur de viralité : volume de mentions négatives ×4,2 vs. base de référence sur le sujet « Finances municipales ».', operator: 'Système Bastion', state: 'termine' },
      { time: '18/07 21:40', title: 'Qualification', description: 'Similarité textuelle de 92 % entre 31 messages ; 8 comptes Telegram ont publié leur premier message à moins de 3 minutes d’intervalle. Coordination confirmée.', operator: 'R. Ionescu — Opérateur sécurité', state: 'termine' },
      { time: '18/07 23:05', title: 'Contre-mesures', description: 'Signalement des 6 groupes et des 12 comptes avec captures archivées ; activation du filtrage renforcé des commentaires ; fiche factuelle « finances européennes » validée pour publication.', operator: 'I. Dumitru — Responsable com', state: 'termine' },
      { time: '19/07 06:00', title: 'Information du candidat', description: 'Note de synthèse transmise à A. Marinescu et au directeur de campagne ; prise de parole publique écartée à ce stade pour ne pas amplifier la rumeur.', operator: 'A. Popescu — Directeur de campagne', state: 'termine' },
      { time: 'Depuis 19/07 08:00', title: 'Surveillance renforcée', description: 'Fréquence de veille portée à 15 min sur les sujets « Finances municipales » et « Personnel du candidat » ; seuil d’alerte abaissé jusqu’au 21/07.', operator: 'É. Stan — Modération', state: 'en_cours' },
      { time: '—', title: 'Post-mortem & clôture', description: 'Analyse complète et mise à jour des règles de détection une fois la propagation retombée sous le seuil d’alerte.', operator: 'À attribuer', state: 'a_venir' },
    ],
  },

  mentions: [
    { id: 'm01', source: 'facebook', author: 'Groupe « Clujeni adevărați »', excerpt: 'On nous cache la vérité : l’argent européen de la ville a disparu et Marinescu refuse de publier les comptes. Partagez avant que ce soit supprimé.', lang: 'FR', sentiment: 'negatif', reach: 18400, time: '19/07 08:47', topic: 'Finances municipales' },
    { id: 'm02', source: 'telegram', author: 'Canal « Cluj Realitatea »', excerpt: 'DOCUMENTS EXCLUSIFS sur le détournement des fonds de la mairie de Cluj. Le maire sortant doit répondre.', lang: 'FR', sentiment: 'negatif', reach: 9800, time: '19/07 08:12', topic: 'Finances municipales' },
    { id: 'm03', source: 'presse', author: 'Monitorul de Cluj', excerpt: 'Visite du marché Mihai Viteazul : le maire sortant annonce la modernisation de trois halles supplémentaires d’ici 2027. Accueil chaleureux des commerçants.', lang: 'FR', sentiment: 'positif', reach: 42100, time: '19/07 07:55', topic: 'Bilan du mandat' },
    { id: 'm04', source: 'x', author: '@cluj_watch', excerpt: 'Rappel : en 2019 Marinescu promettait un tramway vers Florești. Toujours rien. #Cluj', lang: 'FR', sentiment: 'negatif', reach: 5600, time: '19/07 07:31', topic: 'Transport' },
    { id: 'm05', source: 'facebook', author: 'Page officielle campagne', excerpt: 'Merci aux 300 bénévoles mobilisés ce week-end dans les quartiers Mărăști et Gheorgheni. La campagne de terrain continue dimanche.', lang: 'FR', sentiment: 'positif', reach: 12300, time: '18/07 20:14', topic: 'Campagne de terrain' },
    { id: 'm06', source: 'forum', author: 'clujforum.ro — fil « Élections 2026 »', excerpt: 'Sondage informel du forum : Marinescu 41 %, en baisse de 6 points depuis juin. Débat houleux sur la gestion du budget.', lang: 'FR', sentiment: 'neutre', reach: 3100, time: '18/07 19:48', topic: 'Sondages' },
    { id: 'm07', source: 'presse', author: 'Știri de Cluj (TV)', excerpt: 'Débat municipal : le maire défend un excédent budgétaire de 42 M lei et promet la publication intégrale des audits européens.', lang: 'FR', sentiment: 'neutre', reach: 38700, time: '18/07 18:20', topic: 'Finances municipales' },
    { id: 'm08', source: 'instagram', author: '@cluj.tineret', excerpt: 'Story : affiches de campagne Marinescu dégradées près de l’université. Photos à l’appui, signalement déposé.', lang: 'FR', sentiment: 'neutre', reach: 8900, time: '18/07 16:02', topic: 'Campagne de terrain' },
    { id: 'm09', source: 'facebook', author: 'Groupe « Mănăștur în mișcare »', excerpt: 'Réunion publique jeudi : les habitants veulent des réponses sur la sécurité au quartier, pas des promesses.', lang: 'FR', sentiment: 'neutre', reach: 2700, time: '18/07 14:36', topic: 'Sécurité' },
    { id: 'm10', source: 'x', author: '@andra_cluj', excerpt: 'La visite au marché de ce matin était sincère et bien menée. Le bilan sur les halles parle de lui-même.', lang: 'FR', sentiment: 'positif', reach: 1900, time: '18/07 11:15', topic: 'Bilan du mandat' },
  ],

  heatmap: [
    { topic: 'Finances municipales', positif: 18, neutre: 42, negatif: 148, risque: 86 },
    { topic: 'Personnel du candidat', positif: 12, neutre: 31, negatif: 74, risque: 68 },
    { topic: 'Transport', positif: 22, neutre: 55, negatif: 48, risque: 54 },
    { topic: 'Sécurité', positif: 31, neutre: 44, negatif: 29, risque: 38 },
    { topic: 'Urbanisme', positif: 41, neutre: 38, negatif: 17, risque: 24 },
    { topic: 'Bilan du mandat', positif: 96, neutre: 47, negatif: 33, risque: 21 },
  ],

  topSources: [
    { name: 'Groupes Facebook clujois (6)', type: 'facebook', mentions: 214, negativity: 71 },
    { name: 'Canaux Telegram locaux', type: 'telegram', mentions: 132, negativity: 82 },
    { name: 'Presse régionale', type: 'presse', mentions: 96, negativity: 22 },
    { name: 'X — zone Cluj', type: 'x', mentions: 88, negativity: 47 },
    { name: 'clujforum.ro', type: 'forum', mentions: 41, negativity: 38 },
  ],

  brief: {
    dateLabel: 'Dimanche 19 juillet 2026',
    generatedAt: '19/07/2026 06:00',
    synthese: [
      'Le volume de mentions de la campagne a fortement augmenté (+38 % sur 24 h), porté par la diffusion d’une rumeur visant les finances municipales dans plusieurs groupes Facebook locaux. Le sentiment net passe à −12, son niveau le plus bas depuis le début du mois.',
      'La visite du marché Mihai Viteazul d’hier a en revanche généré une couverture presse très favorable (42 100 contacts estimés, tonalité positive à 91 %), qui contrebalance partiellement la dynamique négative.',
    ],
    signauxFaibles: [
      'La rumeur « fonds européens détournés » circule depuis le 17/07 dans au moins 6 groupes Facebook clujois (≈ 45 000 membres cumulés). La similarité textuelle entre les messages (92 %) indique une diffusion coordonnée, pas un mouvement spontané.',
      '12 comptes Telegram créés après le 10/07 relaient en boucle les mêmes visuels ; 8 d’entre eux ont publié leur premier message à moins de 3 minutes d’intervalle.',
      'Le domaine marinescu-informatii.ro, enregistré le 16/07 via un registrar anonyme, reproduit la charte du site de campagne : risque de typosquattage et d’hameçonnage des sympathisants.',
      'Un post de 2019 du candidat sur le tramway de Florești refait surface hors contexte sur X ; reprise encore limitée (5 600 contacts).',
    ],
    incidents: [
      'INC-2026-041 — Campagne de dénigrement coordonnée, ouverte le 18/07 à 21:14. Signalements déposés, surveillance renforcée en cours (voir Alertes & Incidents).',
      'ALT-2026-118 — Exposition de fuite : l’adresse d’un bénévole apparaît dans un corpus de données dérobées (HaveIBeenPwned). Mot de passe réinitialisé le 18/07, aucune connexion anormale détectée.',
      'ALT-2026-117 — Taux de comptes suspects sous les publications Facebook de la campagne à 14 % (seuil d’alerte : 8 %). Filtrage renforcé activé.',
    ],
    recommandations: [
      'Publier avant 12:00 la fiche factuelle sur les financements européens (audit 2025, chiffres sourcés) et l’épingler sur la page Facebook — répondre sur les faits sans jamais citer la rumeur nommément.',
      'Signaler les 6 groupes et les 12 comptes Telegram via les procédures de signalement coordonné ; verser les captures archivées au dossier INC-2026-041.',
      'Faire bloquer le domaine marinescu-informatii.ro (plainte registrar + notification CERT-RO) et avertir les bénévoles par message interne dès ce matin.',
      'Capitaliser sur la visite du marché : rediffuser les extraits presse positifs entre 18:00 et 20:00, tranche de meilleure audience du dimanche.',
      'Ne pas engager directement les comptes hostiles ; laisser la modération masquer les commentaires selon la charte numérique.',
    ],
  },

  assets: [
    { name: 'marinescu2026.ro', type: 'Site web', status: 'Protégé', score: 92, lastCheck: '19/07 06:00' },
    { name: 'marinescu2026.ro (zone DNS)', type: 'Domaine', status: 'Protégé', score: 88, lastCheck: '19/07 06:00' },
    { name: 'Page Facebook de campagne', type: 'Compte social', status: 'Protégé', score: 85, lastCheck: '19/07 06:00' },
    { name: '@marinescu.cluj — Instagram', type: 'Compte social', status: 'Protégé', score: 95, lastCheck: '19/07 06:00' },
    { name: '@AMarinescu2026 — X', type: 'Compte social', status: 'À surveiller', score: 71, lastCheck: '19/07 06:00' },
    { name: 'contact@marinescu2026.ro', type: 'Email', status: 'À surveiller', score: 68, lastCheck: '19/07 06:00' },
    { name: 'Espace bénévoles (SaaS)', type: 'Outil', status: 'Vulnérable', score: 54, lastCheck: '19/07 06:00' },
    { name: 'Canal Telegram officiel', type: 'Compte social', status: 'Protégé', score: 90, lastCheck: '19/07 06:00' },
  ],

  checks: [
    { label: 'Configuration TLS / HTTPS', status: 'ok', detail: 'TLS 1.3, suite de chiffrement conforme', lastRun: '19/07 06:00' },
    { label: 'Expiration du certificat', status: 'avertissement', detail: 'Certificat « espace bénévoles » expire dans 34 jours', lastRun: '19/07 06:00' },
    { label: 'En-têtes de sécurité HTTP', status: 'ok', detail: 'CSP, HSTS, X-Frame-Options présents sur le site principal', lastRun: '19/07 06:00' },
    { label: 'Détection de changement DNS', status: 'ok', detail: 'Aucune modification depuis le 02/07', lastRun: '19/07 06:00' },
    { label: 'SPF / DKIM / DMARC', status: 'avertissement', detail: 'DMARC en « quarantine » partiel — passer en « reject »', lastRun: '19/07 06:00' },
    { label: 'Exposition de fuites (HIBP)', status: 'avertissement', detail: '1 adresse bénévole exposée — réinitialisée le 18/07', lastRun: '19/07 06:00' },
    { label: 'Disponibilité', status: 'ok', detail: '100 % sur 30 jours, 41 points de mesure', lastRun: '19/07 06:00' },
    { label: 'Intégrité du contenu', status: 'ok', detail: 'Empreinte inchangée depuis le 18/07 06:00', lastRun: '19/07 06:00' },
  ],

  stressTest: {
    readiness: 82,
    lastRun: '12/07/2026',
    points: [
      { label: 'MFA activé sur 5 comptes d’accès sur 6', ok: false },
      { label: 'Sauvegardes du site vérifiées (restauration testée le 05/07)', ok: true },
      { label: 'Playbooks d’incident relus et à jour', ok: true },
      { label: 'Politique DMARC à durcir avant le 01/09', ok: false },
    ],
  },

  team: [
    { name: 'Andrei Popescu', role: 'Directeur de campagne', email: 'a.popescu@marinescu2026.ro', mfa: true, lastActive: 'il y a 4 min', initials: 'AP' },
    { name: 'Ioana Dumitru', role: 'Responsable communication', email: 'i.dumitru@marinescu2026.ro', mfa: true, lastActive: 'il y a 12 min', initials: 'ID' },
    { name: 'Radu Ionescu', role: 'Opérateur sécurité', email: 'r.ionescu@marinescu2026.ro', mfa: true, lastActive: 'il y a 2 min', initials: 'RI' },
    { name: 'Elena Stan', role: 'Modératrice', email: 'e.stan@marinescu2026.ro', mfa: true, lastActive: 'il y a 26 min', initials: 'ES' },
    { name: 'Vlad Mureșan', role: 'Analyste veille', email: 'v.muresan@marinescu2026.ro', mfa: true, lastActive: 'il y a 1 h', initials: 'VM' },
    { name: 'Alexandru Marinescu', role: 'Candidat — lecture seule', email: 'a.marinescu@marinescu2026.ro', mfa: false, lastActive: 'hier 21:48', initials: 'AM' },
  ],

  audit: [
    { time: '19/07 08:58', actor: 'Radu Ionescu', action: 'Seuil d’alerte du sujet « Finances municipales » abaissé à 15 min', type: 'alerte' },
    { time: '19/07 07:31', actor: 'Ioana Dumitru', action: 'Fiche factuelle « financements européens » validée pour publication', type: 'contenu' },
    { time: '18/07 23:12', actor: 'Radu Ionescu', action: 'Signalement groupé transmis à Meta (6 groupes, captures jointes)', type: 'securite' },
    { time: '18/07 18:26', actor: 'Elena Stan', action: 'Réinitialisation du mot de passe d’un compte bénévole exposé', type: 'securite' },
    { time: '18/07 09:14', actor: 'Andrei Popescu', action: 'Connexion depuis un nouvel appareil (Cluj-Napoca, IP 86.120.x.x)', type: 'compte' },
    { time: '17/07 16:40', actor: 'Vlad Mureșan', action: 'Export du rapport hebdomadaire de veille (PDF)', type: 'contenu' },
  ],

  charter: {
    signed: 5,
    total: 6,
    pending: ['Alexandru Marinescu'],
    lastUpdate: '16/07/2026',
  },

  events: [
    { time: '09:00 – 11:30', title: 'Visite du marché Mihai Viteazul et rencontre des commerçants', location: 'Cluj-Napoca, centre', type: 'terrain' },
    { time: '14:00', title: 'Point presse hebdomadaire — bilan sécurité des quartiers', location: 'QG de campagne', type: 'media' },
    { time: '18:30', title: 'Réunion de coordination — cellule de réponse à la rumeur', location: 'Visioconférence', type: 'reunion' },
  ],

  week: [
    { day: 'lun.', date: '13/07', posts: [{ time: '10:00', platform: 'facebook', title: 'Bilan — 42 M lei d’excédent réinvestis' }, { time: '18:00', platform: 'instagram', title: 'Story coulisses QG' }] },
    { day: 'mar.', date: '14/07', posts: [{ time: '09:30', platform: 'x', title: 'Thread — les chiffres du budget, simplement' }] },
    { day: 'mer.', date: '15/07', posts: [{ time: '12:00', platform: 'facebook', title: 'Vidéo — sécurité quartier Mărăști' }, { time: '19:00', platform: 'telegram', title: 'Résumé de journée bénévoles' }] },
    { day: 'jeu.', date: '16/07', posts: [{ time: '11:00', platform: 'presse', title: 'Tribune — moderniser les halles' }] },
    { day: 'ven.', date: '17/07', posts: [{ time: '17:30', platform: 'instagram', title: 'Reel — une semaine de terrain' }] },
    { day: 'sam.', date: '18/07', posts: [{ time: '10:30', platform: 'facebook', title: 'Photos — visite du marché' }] },
    { day: 'dim.', date: '19/07', today: true, posts: [{ time: '12:00', platform: 'facebook', title: 'Fiche — financements européens' }, { time: '18:30', platform: 'x', title: 'Extraits presse du marché' }] },
  ],

  pipeline: {
    brouillon: [
      { title: 'Communiqué — réponse factuelle aux rumeurs budgétaires', platform: 'presse', author: 'Ioana D.', tag: 'Crise' },
      { title: 'Clip vidéo — bilan sécurité quartier Gheorgheni', platform: 'facebook', author: 'Vlad M.', tag: 'Terrain' },
    ],
    relecture: [
      { title: 'Newsletter hebdo n° 28 — une semaine de campagne', platform: 'presse', author: 'Ioana D.', tag: 'Newsletter' },
    ],
    approuve: [
      { title: 'Fiche factuelle — financements européens', platform: 'facebook', author: 'Ioana D.', tag: 'Fact-check' },
      { title: 'Story Instagram — merci aux bénévoles', platform: 'instagram', author: 'Elena S.', tag: 'Mobilisation' },
    ],
    planifie: [
      { title: 'Extraits presse — visite du marché', platform: 'x', author: 'Vlad M.', tag: 'Presse' },
      { title: 'Thread budget — épisode 2', platform: 'x', author: 'Ioana D.', tag: 'Pédagogie' },
    ],
  },

  platformStats: [
    { platform: 'Facebook', portee: 184000, engagement: 4.8 },
    { platform: 'Instagram', portee: 96000, engagement: 6.1 },
    { platform: 'X', portee: 41000, engagement: 2.3 },
    { platform: 'Telegram', portee: 22000, engagement: 5.4 },
  ],
}

const en: TenantData = {
  meta: {
    id: 'marinescu',
    name: 'Marinescu 2026 Campaign',
    subtitle: 'Cluj-Napoca City Hall — Romania',
    detail: 'A. Marinescu · incumbent mayor · Sept. 2026 elections',
    initials: 'CM',
  },

  threat: {
    level: 'ÉLEVÉ',
    summary:
      'Coordinated smear campaign in progress on Facebook and Telegram. Rumor about municipal finances actively spreading.',
    updatedAt: '19/07/2026 09:30',
  },

  kpis: {
    securityScore: 74,
    securityScoreDelta: -3,
    mentions24h: 1284,
    mentionsDelta: 38,
    netSentiment: -12,
    netSentimentDelta: -9,
    activeAlerts: 7,
    criticalAlerts: 2,
  },

  sentimentTrend: [
    { date: '13/07', positif: 46, neutre: 34, negatif: 20 },
    { date: '14/07', positif: 44, neutre: 36, negatif: 20 },
    { date: '15/07', positif: 47, neutre: 33, negatif: 20 },
    { date: '16/07', positif: 42, neutre: 35, negatif: 23 },
    { date: '17/07', positif: 38, neutre: 34, negatif: 28 },
    { date: '18/07', positif: 31, neutre: 33, negatif: 36 },
    { date: '19/07', positif: 29, neutre: 33, negatif: 38 },
  ],

  alerts: [
    { id: 'ALT-2026-121', severity: 'critique', title: '"Misappropriated EU funds" rumor spreading fast', source: 'Facebook — 6 local groups', time: '19/07 08:47', status: 'en_cours' },
    { id: 'ALT-2026-120', severity: 'critique', title: 'Typosquatted domain marinescu-informatii.ro active', source: 'DNS monitoring', time: '19/07 07:12', status: 'en_cours' },
    { id: 'ALT-2026-119', severity: 'elevee', title: '12 coordinated Telegram accounts reposting identical visuals', source: 'Telegram monitoring', time: '18/07 22:38', status: 'en_cours' },
    { id: 'ALT-2026-118', severity: 'elevee', title: "Volunteer's email address exposed in a data leak", source: 'HaveIBeenPwned', time: '18/07 18:05', status: 'resolu' },
    { id: 'ALT-2026-117', severity: 'moyenne', title: 'Spike in suspicious accounts under campaign posts (14%)', source: 'Facebook moderation', time: '18/07 15:22', status: 'en_cours' },
    { id: 'ALT-2026-116', severity: 'moyenne', title: '2019 transport post recirculating out of context on X', source: 'X monitoring', time: '18/07 11:40', status: 'nouveau' },
    { id: 'ALT-2026-114', severity: 'faible', title: 'Campaign domain DMARC policy in partial "quarantine" mode', source: 'Email check', time: '17/07 06:00', status: 'nouveau' },
    { id: 'ALT-2026-112', severity: 'faible', title: 'Volunteer platform TLS certificate expires in 34 days', source: 'TLS check', time: '16/07 06:00', status: 'resolu' },
  ],

  incident: {
    id: 'INC-2026-041',
    title: 'Coordinated smear campaign',
    severity: 'critique',
    status: 'In progress',
    detected: '18/07/2026 21:14',
    summary:
      'Synchronized spread of a rumor targeting municipal finances: near-identical messages in 6 Cluj Facebook groups (≈ 45,000 combined members), relayed by 12 Telegram accounts created after 07/10.',
    steps: [
      { time: '18/07 21:14', title: 'Detection', description: 'Virality detector: negative mention volume ×4.2 vs. baseline on the "Municipal finances" topic.', operator: 'Bastion system', state: 'termine' },
      { time: '18/07 21:40', title: 'Qualification', description: '92% textual similarity across 31 messages; 8 Telegram accounts posted their first message within 3 minutes of each other. Coordination confirmed.', operator: 'R. Ionescu — Security operator', state: 'termine' },
      { time: '18/07 23:05', title: 'Counter-measures', description: 'Reported the 6 groups and 12 accounts with archived screenshots; enabled strengthened comment filtering; "European funding" fact sheet approved for publication.', operator: 'I. Dumitru — Head of comms', state: 'termine' },
      { time: '19/07 06:00', title: 'Candidate briefing', description: 'Summary note sent to A. Marinescu and the campaign director; public statement ruled out at this stage to avoid amplifying the rumor.', operator: 'A. Popescu — Campaign director', state: 'termine' },
      { time: 'Since 19/07 08:00', title: 'Enhanced monitoring', description: 'Monitoring frequency raised to 15 min on "Municipal finances" and "Candidate\'s staff" topics; alert threshold lowered until 07/21.', operator: 'É. Stan — Moderation', state: 'en_cours' },
      { time: '—', title: 'Post-mortem & closure', description: 'Full analysis and detection-rule update once propagation falls back below the alert threshold.', operator: 'To be assigned', state: 'a_venir' },
    ],
  },

  // Extraits conservés dans leur langue d'origine (tag `lang`)
  mentions: [
    { id: 'm01', source: 'facebook', author: 'Groupe « Clujeni adevărați »', excerpt: 'On nous cache la vérité : l’argent européen de la ville a disparu et Marinescu refuse de publier les comptes. Partagez avant que ce soit supprimé.', lang: 'FR', sentiment: 'negatif', reach: 18400, time: '19/07 08:47', topic: 'Municipal finances' },
    { id: 'm02', source: 'telegram', author: 'Canal « Cluj Realitatea »', excerpt: 'DOCUMENTS EXCLUSIFS sur le détournement des fonds de la mairie de Cluj. Le maire sortant doit répondre.', lang: 'FR', sentiment: 'negatif', reach: 9800, time: '19/07 08:12', topic: 'Municipal finances' },
    { id: 'm03', source: 'presse', author: 'Monitorul de Cluj', excerpt: 'Visite du marché Mihai Viteazul : le maire sortant annonce la modernisation de trois halles supplémentaires d’ici 2027. Accueil chaleureux des commerçants.', lang: 'FR', sentiment: 'positif', reach: 42100, time: '19/07 07:55', topic: 'Term record' },
    { id: 'm04', source: 'x', author: '@cluj_watch', excerpt: 'Rappel : en 2019 Marinescu promettait un tramway vers Florești. Toujours rien. #Cluj', lang: 'FR', sentiment: 'negatif', reach: 5600, time: '19/07 07:31', topic: 'Transport' },
    { id: 'm05', source: 'facebook', author: 'Page officielle campagne', excerpt: 'Merci aux 300 bénévoles mobilisés ce week-end dans les quartiers Mărăști et Gheorgheni. La campagne de terrain continue dimanche.', lang: 'FR', sentiment: 'positif', reach: 12300, time: '18/07 20:14', topic: 'Field campaign' },
    { id: 'm06', source: 'forum', author: 'clujforum.ro — fil « Élections 2026 »', excerpt: 'Sondage informel du forum : Marinescu 41 %, en baisse de 6 points depuis juin. Débat houleux sur la gestion du budget.', lang: 'FR', sentiment: 'neutre', reach: 3100, time: '18/07 19:48', topic: 'Polls' },
    { id: 'm07', source: 'presse', author: 'Știri de Cluj (TV)', excerpt: 'Débat municipal : le maire défend un excédent budgétaire de 42 M lei et promet la publication intégrale des audits européens.', lang: 'FR', sentiment: 'neutre', reach: 38700, time: '18/07 18:20', topic: 'Municipal finances' },
    { id: 'm08', source: 'instagram', author: '@cluj.tineret', excerpt: 'Story : affiches de campagne Marinescu dégradées près de l’université. Photos à l’appui, signalement déposé.', lang: 'FR', sentiment: 'neutre', reach: 8900, time: '18/07 16:02', topic: 'Field campaign' },
    { id: 'm09', source: 'facebook', author: 'Groupe « Mănăștur în mișcare »', excerpt: 'Réunion publique jeudi : les habitants veulent des réponses sur la sécurité au quartier, pas des promesses.', lang: 'FR', sentiment: 'neutre', reach: 2700, time: '18/07 14:36', topic: 'Security' },
    { id: 'm10', source: 'x', author: '@andra_cluj', excerpt: 'La visite au marché de ce matin était sincère et bien menée. Le bilan sur les halles parle de lui-même.', lang: 'FR', sentiment: 'positif', reach: 1900, time: '18/07 11:15', topic: 'Term record' },
  ],

  heatmap: [
    { topic: 'Municipal finances', positif: 18, neutre: 42, negatif: 148, risque: 86 },
    { topic: "Candidate's staff", positif: 12, neutre: 31, negatif: 74, risque: 68 },
    { topic: 'Transport', positif: 22, neutre: 55, negatif: 48, risque: 54 },
    { topic: 'Security', positif: 31, neutre: 44, negatif: 29, risque: 38 },
    { topic: 'Urban planning', positif: 41, neutre: 38, negatif: 17, risque: 24 },
    { topic: 'Term record', positif: 96, neutre: 47, negatif: 33, risque: 21 },
  ],

  topSources: [
    { name: 'Cluj Facebook groups (6)', type: 'facebook', mentions: 214, negativity: 71 },
    { name: 'Local Telegram channels', type: 'telegram', mentions: 132, negativity: 82 },
    { name: 'Regional press', type: 'presse', mentions: 96, negativity: 22 },
    { name: 'X — Cluj area', type: 'x', mentions: 88, negativity: 47 },
    { name: 'clujforum.ro', type: 'forum', mentions: 41, negativity: 38 },
  ],

  brief: {
    dateLabel: 'Sunday, July 19, 2026',
    generatedAt: '19/07/2026 06:00',
    synthese: [
      'Campaign mention volume rose sharply (+38% over 24 h), driven by the spread of a rumor targeting municipal finances in several local Facebook groups. Net sentiment falls to −12, its lowest level since the start of the month.',
      'Yesterday’s Mihai Viteazul market visit, however, generated very favorable press coverage (42,100 estimated contacts, 91% positive tone), partially offsetting the negative dynamic.',
    ],
    signauxFaibles: [
      'The "misappropriated EU funds" rumor has been circulating since 07/17 in at least 6 Cluj Facebook groups (≈ 45,000 combined members). The 92% textual similarity between messages indicates coordinated distribution, not a spontaneous movement.',
      '12 Telegram accounts created after 07/10 are looping the same visuals; 8 of them posted their first message within 3 minutes of each other.',
      'The domain marinescu-informatii.ro, registered on 07/16 via an anonymous registrar, mimics the campaign site’s branding: typosquatting and supporter-phishing risk.',
      'A 2019 candidate post about the Florești tramway is resurfacing out of context on X; reach still limited (5,600 contacts).',
    ],
    incidents: [
      'INC-2026-041 — Coordinated smear campaign, opened 07/18 at 21:14. Reports filed, enhanced monitoring in progress (see Alerts & Incidents).',
      'ALT-2026-118 — Leak exposure: a volunteer’s address appears in a stolen-data corpus (HaveIBeenPwned). Password reset on 07/18, no abnormal sign-in detected.',
      'ALT-2026-117 — Suspicious-account rate under campaign Facebook posts at 14% (alert threshold: 8%). Strengthened filtering enabled.',
    ],
    recommandations: [
      'Publish the EU-funding fact sheet (2025 audit, sourced figures) before 12:00 and pin it on the Facebook page — respond with facts without ever naming the rumor.',
      'Report the 6 groups and 12 Telegram accounts via coordinated-reporting procedures; add the archived screenshots to case INC-2026-041.',
      'Get the marinescu-informatii.ro domain taken down (registrar complaint + CERT-RO notification) and warn volunteers by internal message this morning.',
      'Capitalize on the market visit: rebroadcast positive press excerpts between 18:00 and 20:00, Sunday’s peak-audience slot.',
      'Do not engage hostile accounts directly; let moderation hide comments per the digital charter.',
    ],
  },

  assets: [
    { name: 'marinescu2026.ro', type: 'Site web', status: 'Protégé', score: 92, lastCheck: '19/07 06:00' },
    { name: 'marinescu2026.ro (DNS zone)', type: 'Domaine', status: 'Protégé', score: 88, lastCheck: '19/07 06:00' },
    { name: 'Campaign Facebook page', type: 'Compte social', status: 'Protégé', score: 85, lastCheck: '19/07 06:00' },
    { name: '@marinescu.cluj — Instagram', type: 'Compte social', status: 'Protégé', score: 95, lastCheck: '19/07 06:00' },
    { name: '@AMarinescu2026 — X', type: 'Compte social', status: 'À surveiller', score: 71, lastCheck: '19/07 06:00' },
    { name: 'contact@marinescu2026.ro', type: 'Email', status: 'À surveiller', score: 68, lastCheck: '19/07 06:00' },
    { name: 'Volunteer space (SaaS)', type: 'Outil', status: 'Vulnérable', score: 54, lastCheck: '19/07 06:00' },
    { name: 'Official Telegram channel', type: 'Compte social', status: 'Protégé', score: 90, lastCheck: '19/07 06:00' },
  ],

  checks: [
    { label: 'TLS / HTTPS configuration', status: 'ok', detail: 'TLS 1.3, compliant cipher suite', lastRun: '19/07 06:00' },
    { label: 'Certificate expiry', status: 'avertissement', detail: '"Volunteer space" certificate expires in 34 days', lastRun: '19/07 06:00' },
    { label: 'HTTP security headers', status: 'ok', detail: 'CSP, HSTS, X-Frame-Options present on main site', lastRun: '19/07 06:00' },
    { label: 'DNS change detection', status: 'ok', detail: 'No changes since 02/07', lastRun: '19/07 06:00' },
    { label: 'SPF / DKIM / DMARC', status: 'avertissement', detail: 'DMARC in partial "quarantine" — move to "reject"', lastRun: '19/07 06:00' },
    { label: 'Leak exposure (HIBP)', status: 'avertissement', detail: '1 volunteer address exposed — reset on 18/07', lastRun: '19/07 06:00' },
    { label: 'Availability', status: 'ok', detail: '100% over 30 days, 41 measurement points', lastRun: '19/07 06:00' },
    { label: 'Content integrity', status: 'ok', detail: 'Fingerprint unchanged since 18/07 06:00', lastRun: '19/07 06:00' },
  ],

  stressTest: {
    readiness: 82,
    lastRun: '12/07/2026',
    points: [
      { label: 'MFA enabled on 5 of 6 access accounts', ok: false },
      { label: 'Site backups verified (restore tested on 05/07)', ok: true },
      { label: 'Incident playbooks reviewed and up to date', ok: true },
      { label: 'DMARC policy to harden before 01/09', ok: false },
    ],
  },

  team: [
    { name: 'Andrei Popescu', role: 'Campaign director', email: 'a.popescu@marinescu2026.ro', mfa: true, lastActive: '4 min ago', initials: 'AP' },
    { name: 'Ioana Dumitru', role: 'Head of communications', email: 'i.dumitru@marinescu2026.ro', mfa: true, lastActive: '12 min ago', initials: 'ID' },
    { name: 'Radu Ionescu', role: 'Security operator', email: 'r.ionescu@marinescu2026.ro', mfa: true, lastActive: '2 min ago', initials: 'RI' },
    { name: 'Elena Stan', role: 'Moderator', email: 'e.stan@marinescu2026.ro', mfa: true, lastActive: '26 min ago', initials: 'ES' },
    { name: 'Vlad Mureșan', role: 'Monitoring analyst', email: 'v.muresan@marinescu2026.ro', mfa: true, lastActive: '1 h ago', initials: 'VM' },
    { name: 'Alexandru Marinescu', role: 'Candidate — read-only', email: 'a.marinescu@marinescu2026.ro', mfa: false, lastActive: 'yesterday 21:48', initials: 'AM' },
  ],

  audit: [
    { time: '19/07 08:58', actor: 'Radu Ionescu', action: 'Alert threshold for "Municipal finances" topic lowered to 15 min', type: 'alerte' },
    { time: '19/07 07:31', actor: 'Ioana Dumitru', action: '"European funding" fact sheet approved for publication', type: 'contenu' },
    { time: '18/07 23:12', actor: 'Radu Ionescu', action: 'Bulk report sent to Meta (6 groups, screenshots attached)', type: 'securite' },
    { time: '18/07 18:26', actor: 'Elena Stan', action: 'Password reset for an exposed volunteer account', type: 'securite' },
    { time: '18/07 09:14', actor: 'Andrei Popescu', action: 'Sign-in from a new device (Cluj-Napoca, IP 86.120.x.x)', type: 'compte' },
    { time: '17/07 16:40', actor: 'Vlad Mureșan', action: 'Weekly monitoring report export (PDF)', type: 'contenu' },
  ],

  charter: {
    signed: 5,
    total: 6,
    pending: ['Alexandru Marinescu'],
    lastUpdate: '16/07/2026',
  },

  events: [
    { time: '09:00 – 11:30', title: 'Mihai Viteazul market visit and meeting with vendors', location: 'Cluj-Napoca, city center', type: 'terrain' },
    { time: '14:00', title: 'Weekly press briefing — neighborhood security update', location: 'Campaign HQ', type: 'media' },
    { time: '18:30', title: 'Coordination meeting — rumor response cell', location: 'Video conference', type: 'reunion' },
  ],

  week: [
    { day: 'Mon.', date: '13/07', posts: [{ time: '10:00', platform: 'facebook', title: 'Record — 42 M lei surplus reinvested' }, { time: '18:00', platform: 'instagram', title: 'HQ behind-the-scenes story' }] },
    { day: 'Tue.', date: '14/07', posts: [{ time: '09:30', platform: 'x', title: 'Thread — budget figures, simply explained' }] },
    { day: 'Wed.', date: '15/07', posts: [{ time: '12:00', platform: 'facebook', title: 'Video — Mărăști neighborhood security' }, { time: '19:00', platform: 'telegram', title: 'Volunteer day recap' }] },
    { day: 'Thu.', date: '16/07', posts: [{ time: '11:00', platform: 'presse', title: 'Op-ed — modernizing the market halls' }] },
    { day: 'Fri.', date: '17/07', posts: [{ time: '17:30', platform: 'instagram', title: 'Reel — a week in the field' }] },
    { day: 'Sat.', date: '18/07', posts: [{ time: '10:30', platform: 'facebook', title: 'Photos — market visit' }] },
    { day: 'Sun.', date: '19/07', today: true, posts: [{ time: '12:00', platform: 'facebook', title: 'Fact sheet — European funding' }, { time: '18:30', platform: 'x', title: 'Market press excerpts' }] },
  ],

  pipeline: {
    brouillon: [
      { title: 'Press release — factual response to budget rumors', platform: 'presse', author: 'Ioana D.', tag: 'Crisis' },
      { title: 'Video clip — Gheorgheni neighborhood security update', platform: 'facebook', author: 'Vlad M.', tag: 'Field' },
    ],
    relecture: [
      { title: 'Weekly newsletter #28 — a week of campaigning', platform: 'presse', author: 'Ioana D.', tag: 'Newsletter' },
    ],
    approuve: [
      { title: 'Fact sheet — European funding', platform: 'facebook', author: 'Ioana D.', tag: 'Fact-check' },
      { title: 'Instagram story — thank you to volunteers', platform: 'instagram', author: 'Elena S.', tag: 'Mobilization' },
    ],
    planifie: [
      { title: 'Press excerpts — market visit', platform: 'x', author: 'Vlad M.', tag: 'Press' },
      { title: 'Budget thread — episode 2', platform: 'x', author: 'Ioana D.', tag: 'Explainer' },
    ],
  },

  platformStats: [
    { platform: 'Facebook', portee: 184000, engagement: 4.8 },
    { platform: 'Instagram', portee: 96000, engagement: 6.1 },
    { platform: 'X', portee: 41000, engagement: 2.3 },
    { platform: 'Telegram', portee: 22000, engagement: 5.4 },
  ],
}

export const marinescu: Record<Lang, TenantData> = { en, fr }
