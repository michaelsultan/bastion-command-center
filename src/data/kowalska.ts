import type { Lang } from '@/i18n/LanguageContext'
import type { TenantData } from './types'

// ─── Tenant Kowalska — données bilingues ─────────────────────────────────────
// Les extraits de mentions restent dans leur langue d'origine (tag `lang`) dans
// les deux jeux de données ; seules les métadonnées sont traduites.

const fr: TenantData = {
  meta: {
    id: 'kowalska',
    name: 'Campagne Kowalska',
    subtitle: 'Ville de Gdańsk — Pologne',
    detail: 'M. Kowalska · candidate · élections oct. 2026',
    initials: 'CK',
  },

  threat: {
    level: 'FAIBLE',
    summary:
      'Situation globalement calme. Une capture de sondage falsifiée circule sur X ; le compte usurpateur signalé a été suspendu.',
    updatedAt: '19/07/2026 09:30',
  },

  kpis: {
    securityScore: 86,
    securityScoreDelta: 4,
    mentions24h: 612,
    mentionsDelta: 12,
    netSentiment: 24,
    netSentimentDelta: 6,
    activeAlerts: 3,
    criticalAlerts: 0,
  },

  sentimentTrend: [
    { date: '13/07', positif: 34, neutre: 44, negatif: 22 },
    { date: '14/07', positif: 36, neutre: 43, negatif: 21 },
    { date: '15/07', positif: 35, neutre: 44, negatif: 21 },
    { date: '16/07', positif: 41, neutre: 41, negatif: 18 },
    { date: '17/07', positif: 44, neutre: 39, negatif: 17 },
    { date: '18/07', positif: 46, neutre: 38, negatif: 16 },
    { date: '19/07', positif: 47, neutre: 37, negatif: 16 },
  ],

  alerts: [
    { id: 'ALT-2026-033', severity: 'moyenne', title: 'Capture de sondage « IBRiS » falsifiée en circulation sur X', source: 'Veille X', time: '19/07 08:12', status: 'en_cours' },
    { id: 'ALT-2026-032', severity: 'moyenne', title: '2 nouveaux comptes imitant l’identité de la candidate détectés', source: 'Veille X', time: '19/07 06:48', status: 'nouveau' },
    { id: 'ALT-2026-031', severity: 'elevee', title: 'Hameçonnage ciblant la messagerie de campagne (3 messages)', source: 'Filtre anti-phishing', time: '18/07 17:26', status: 'resolu' },
    { id: 'ALT-2026-030', severity: 'faible', title: 'Compte usurpateur @Kowalska_GDN suspendu par X', source: 'Veille X', time: '19/07 04:12', status: 'resolu' },
    { id: 'ALT-2026-028', severity: 'faible', title: 'Hausse des commentaires hostiles sous les vidéos du débat (organique)', source: 'Modération YouTube', time: '17/07 22:15', status: 'resolu' },
  ],

  incident: {
    id: 'INC-2026-007',
    title: 'Usurpation de compte X — @Kowalska_GDN',
    severity: 'moyenne',
    status: 'Résolu — surveillance maintenue',
    detected: '17/07/2026 14:52',
    summary:
      'Un compte X imitant l’identité de la candidate (photo officielle, nom quasi identique) publiait des messages contradictoires sur le programme de transport. Suspendu par X dans la nuit du 18 au 19/07 ; deux comptes similaires sont déjà surveillés.',
    steps: [
      { time: '17/07 14:52', title: 'Détection', description: 'Alerte de similarité d’identité : compte créé le 15/07, photo officielle, 2 400 abonnés en 48 h.', operator: 'Système Bastion', state: 'termine' },
      { time: '17/07 15:20', title: 'Qualification', description: 'Comportement typique d’usurpation : reprises de déclarations réelles modifiées, liens vers un formulaire de dons frauduleux.', operator: 'J. Wiśniewski — Opérateur sécurité', state: 'termine' },
      { time: '17/07 16:05', title: 'Contre-mesures', description: 'Signalement accéléré à X (formulaire impersonation + preuve d’identité), avertissement publié sur le compte officiel, formulaire de dons signalé à la CERT Polska.', operator: 'A. Zielińska — Responsable com', state: 'termine' },
      { time: '19/07 04:12', title: 'Suspension du compte', description: 'X a suspendu @Kowalska_GDN. Archivage des 43 publications pour le dossier juridique.', operator: 'Système Bastion', state: 'termine' },
      { time: 'Depuis 19/07 06:00', title: 'Surveillance des réapparitions', description: '2 comptes similaires détectés (même banque d’images). Signalements pré-remplis, prêts à déposer.', operator: 'J. Wiśniewski — Opérateur sécurité', state: 'en_cours' },
      { time: '—', title: 'Post-mortem & clôture', description: 'Bilan juridique avec le cabinet de Gdańsk ; décision sur le dépôt de plainte pour escroquerie au don.', operator: 'P. Nowak', state: 'a_venir' },
    ],
  },

  mentions: [
    { id: 'm01', source: 'x', author: '@gdansk_stopklatka', excerpt: 'SONDAGE CHOC : Kowalska à 18 % selon IBRiS. La candidate perd le nord.', lang: 'FR', sentiment: 'negatif', reach: 12400, time: '19/07 08:12', topic: 'Sondages' },
    { id: 'm02', source: 'presse', author: 'Gazeta Wyborcza Trójmiasto', excerpt: 'Après le débat de jeudi, Maria Kowalska apparaît comme l’alternative la plus crédible : précision des chiffres, ton présidentiel.', lang: 'FR', sentiment: 'positif', reach: 58200, time: '19/07 07:40', topic: 'Débat TV' },
    { id: 'm03', source: 'facebook', author: 'Groupe « Wrzeszcz dla ludzi »', excerpt: 'Les pistes cyclables de l’avenue Grunwaldzka : la candidate Kowalska promet une concertation réelle, pas une décision imposée.', lang: 'FR', sentiment: 'positif', reach: 4700, time: '18/07 21:05', topic: 'Transport' },
    { id: 'm04', source: 'instagram', author: '@gdansk.official.fan', excerpt: 'Reel du débat : la séquence où Kowalska cite le coût réel du stade a dépassé les 90 000 vues.', lang: 'FR', sentiment: 'positif', reach: 21800, time: '18/07 19:32', topic: 'Débat TV' },
    { id: 'm05', source: 'forum', author: 'trojmiasto.pl — fil « Élections »', excerpt: 'Débat : Kowalska solide sur le budget, évasive sur le chantier naval. Les dockers attendent un engagement clair.', lang: 'FR', sentiment: 'neutre', reach: 6200, time: '18/07 17:48', topic: 'Chantier naval' },
    { id: 'm06', source: 'facebook', author: 'Page officielle campagne', excerpt: 'Merci Gdańsk ! 800 personnes à la réunion publique d’Oliwa ce soir. Prochaine étape : Zaspa, mardi 18:00.', lang: 'FR', sentiment: 'positif', reach: 15600, time: '18/07 22:14', topic: 'Campagne de terrain' },
    { id: 'm07', source: 'telegram', author: 'Canal « Trójmiasto Info »', excerpt: 'La mairie sortante accuse Kowalska de populisme après ses propositions sur les transports gratuits pour les étudiants.', lang: 'FR', sentiment: 'negatif', reach: 5400, time: '18/07 15:27', topic: 'Transport' },
    { id: 'm08', source: 'x', author: '@ibw_pomorze', excerpt: 'Fact-check : le « sondage IBRiS » partagé ce matin ne correspond à aucune publication de l’institut. Capture fabriquée.', lang: 'FR', sentiment: 'neutre', reach: 9800, time: '19/07 09:02', topic: 'Sondages' },
    { id: 'm09', source: 'presse', author: 'Radio Gdańsk', excerpt: 'Mobilité : la candidate propose une ligne de tramway vers l’aéroport et le doublement des pistes cyclables d’ici 2030.', lang: 'FR', sentiment: 'neutre', reach: 33500, time: '18/07 12:10', topic: 'Transport' },
    { id: 'm10', source: 'forum', author: 'wirtualna-gdynia.net', excerpt: 'Vu à Zaspa : affiches Kowalska recouvertes par des autocollants de la majorité sortante. Ambiance de fin de campagne…', lang: 'FR', sentiment: 'neutre', reach: 1800, time: '18/07 10:44', topic: 'Campagne de terrain' },
  ],

  heatmap: [
    { topic: 'Chantier naval', positif: 24, neutre: 58, negatif: 41, risque: 52 },
    { topic: 'Transport', positif: 52, neutre: 63, negatif: 34, risque: 36 },
    { topic: 'Sondages', positif: 12, neutre: 38, negatif: 29, risque: 44 },
    { topic: 'Débat TV', positif: 88, neutre: 42, negatif: 18, risque: 14 },
    { topic: 'Personnel de la candidate', positif: 19, neutre: 27, negatif: 12, risque: 22 },
    { topic: 'Environnement', positif: 34, neutre: 29, negatif: 9, risque: 12 },
  ],

  topSources: [
    { name: 'Presse régionale Trójmiasto', type: 'presse', mentions: 128, negativity: 18 },
    { name: 'Groupes Facebook Gdańsk', type: 'facebook', mentions: 96, negativity: 34 },
    { name: 'X — zone Pomeranie', type: 'x', mentions: 84, negativity: 42 },
    { name: 'Forums trojmiasto.pl', type: 'forum', mentions: 52, negativity: 28 },
    { name: 'Canaux Telegram locaux', type: 'telegram', mentions: 31, negativity: 55 },
  ],

  brief: {
    dateLabel: 'Dimanche 19 juillet 2026',
    generatedAt: '19/07/2026 06:00',
    synthese: [
      'Journée globalement calme. Le volume de mentions reste modéré (612 sur 24 h, +12 %) et le sentiment net s’établit à +24, meilleure valeur de la semaine, porté par les retombées très favorables du débat de jeudi sur TVP Gdańsk.',
      'Le seul point d’attention : une capture d’écran falsifiée présentant un sondage « IBRiS » défavorable circule sur X depuis hier soir. Sa propagation reste limitée (≈ 340 partages) et un premier fact-check indépendant a été publié ce matin.',
    ],
    signauxFaibles: [
      'La capture de sondage falsifiée reprend la charte graphique d’IBRiS avec une erreur de logo (ancienne version). Aucun sondage correspondant n’existe ; l’institut a été informé et confirme n’avoir rien publié.',
      'Le compte usurpateur @Kowalska_GDN, signalé le 17/07, a été suspendu par X cette nuit à 04:12. Deux comptes similaires (même banque d’images) sont déjà sous surveillance.',
      'Le fil « chantier naval » reste polarisé mais stable ; les dockers attendent un engagement chiffré de la candidate, attendu cette semaine selon la presse.',
      'La controverse sur les pistes cyclables de Wrzeszcz demeure organique (auteurs identifiés, historiques de compte anciens) — aucune manipulation détectée.',
    ],
    incidents: [
      'INC-2026-007 — Usurpation de compte X : résolue le 19/07 à 04:12 (suspension par la plateforme). Surveillance des réapparitions maintenue, dossier juridique en préparation.',
      'ALT-2026-031 — Hameçonnage ciblant la messagerie de campagne : 3 messages depuis le domaine intervilles-gdansk.pl, tous interceptés. Filtres mis à jour, aucune ouverture détectée.',
      'ALT-2026-033 — Capture de sondage falsifiée sur X : incident ouvert ce matin, démenti visuel en préparation.',
    ],
    recommandations: [
      'Publier avant 11:00 un démenti visuel « vrai / faux sondage » (format simple, partageable) et le transmettre aux relais bénévoles.',
      'Relancer la demande de certification du compte X officiel et activer la surveillance automatisée des noms proches (déjà 2 variantes détectées).',
      'Maintenir le cap éditorial post-débat : rediffuser l’extrait vidéo le plus partagé (2 min 14, séquence « coût du stade ») en début d’après-midi.',
      'Préparer la prise de parole sur le chantier naval annoncée mardi : chiffres de l’emploi validés par le service économique avant diffusion.',
    ],
  },

  assets: [
    { name: 'kowalska2026.pl', type: 'Site web', status: 'Protégé', score: 94, lastCheck: '19/07 06:00' },
    { name: 'kowalska2026.pl (zone DNS)', type: 'Domaine', status: 'Protégé', score: 91, lastCheck: '19/07 06:00' },
    { name: 'Page Facebook de campagne', type: 'Compte social', status: 'Protégé', score: 89, lastCheck: '19/07 06:00' },
    { name: '@MariaKowalska — X', type: 'Compte social', status: 'À surveiller', score: 72, lastCheck: '19/07 06:00' },
    { name: '@kowalska.gdansk — Instagram', type: 'Compte social', status: 'Protégé', score: 93, lastCheck: '19/07 06:00' },
    { name: 'biuro@kowalska2026.pl', type: 'Email', status: 'Protégé', score: 84, lastCheck: '19/07 06:00' },
    { name: 'CRM bénévoles (SaaS)', type: 'Outil', status: 'Protégé', score: 88, lastCheck: '19/07 06:00' },
  ],

  checks: [
    { label: 'Configuration TLS / HTTPS', status: 'ok', detail: 'TLS 1.3, note A+ (SSL Labs)', lastRun: '19/07 06:00' },
    { label: 'Expiration du certificat', status: 'ok', detail: 'Valide jusqu’au 14/11/2026', lastRun: '19/07 06:00' },
    { label: 'En-têtes de sécurité HTTP', status: 'ok', detail: 'CSP stricte, HSTS preload actif', lastRun: '19/07 06:00' },
    { label: 'Détection de changement DNS', status: 'ok', detail: 'Aucune modification depuis le 28/06', lastRun: '19/07 06:00' },
    { label: 'SPF / DKIM / DMARC', status: 'ok', detail: 'DMARC en mode « reject » — configuration exemplaire', lastRun: '19/07 06:00' },
    { label: 'Exposition de fuites (HIBP)', status: 'ok', detail: 'Aucune adresse de l’équipe dans les corpus récents', lastRun: '19/07 06:00' },
    { label: 'Disponibilité', status: 'ok', detail: '99,98 % sur 30 jours', lastRun: '19/07 06:00' },
    { label: 'Intégrité du contenu', status: 'ok', detail: 'Empreinte inchangée depuis le 18/07 06:00', lastRun: '19/07 06:00' },
  ],

  stressTest: {
    readiness: 91,
    lastRun: '12/07/2026',
    points: [
      { label: 'MFA activé sur la totalité des comptes d’accès', ok: true },
      { label: 'Sauvegardes du site vérifiées (restauration testée le 06/07)', ok: true },
      { label: 'Playbooks d’incident relus et à jour', ok: true },
      { label: 'Certification du compte X officiel encore en attente', ok: false },
    ],
  },

  team: [
    { name: 'Piotr Nowak', role: 'Directeur de campagne', email: 'p.nowak@kowalska2026.pl', mfa: true, lastActive: 'il y a 7 min', initials: 'PN' },
    { name: 'Agnieszka Zielińska', role: 'Responsable communication', email: 'a.zielinska@kowalska2026.pl', mfa: true, lastActive: 'il y a 18 min', initials: 'AZ' },
    { name: 'Jakub Wiśniewski', role: 'Opérateur sécurité', email: 'j.wisniewski@kowalska2026.pl', mfa: true, lastActive: 'il y a 3 min', initials: 'JW' },
    { name: 'Katarzyna Lewandowska', role: 'Modératrice', email: 'k.lewandowska@kowalska2026.pl', mfa: true, lastActive: 'il y a 42 min', initials: 'KL' },
    { name: 'Tomasz Kamiński', role: 'Modérateur', email: 't.kaminski@kowalska2026.pl', mfa: true, lastActive: 'il y a 1 h', initials: 'TK' },
    { name: 'Maria Kowalska', role: 'Candidate — lecture seule', email: 'm.kowalska@kowalska2026.pl', mfa: true, lastActive: 'il y a 2 h', initials: 'MK' },
  ],

  audit: [
    { time: '19/07 08:31', actor: 'Agnieszka Zielińska', action: 'Démenti visuel « vrai / faux sondage » soumis en relecture', type: 'contenu' },
    { time: '19/07 06:55', actor: 'Jakub Wiśniewski', action: '2 comptes X similaires ajoutés à la liste de surveillance', type: 'alerte' },
    { time: '18/07 17:41', actor: 'Jakub Wiśniewski', action: 'Domaine intervilles-gdansk.pl bloqué au filtre de messagerie', type: 'securite' },
    { time: '18/07 11:02', actor: 'Piotr Nowak', action: 'Export du rapport hebdomadaire de veille (PDF)', type: 'contenu' },
    { time: '17/07 16:20', actor: 'Katarzyna Lewandowska', action: 'Signalement d’usurpation transmis à X avec preuve d’identité', type: 'securite' },
    { time: '17/07 09:14', actor: 'Maria Kowalska', action: 'Charte numérique signée (version 2.3)', type: 'compte' },
  ],

  charter: {
    signed: 6,
    total: 6,
    pending: [],
    lastUpdate: '17/07/2026',
  },

  events: [
    { time: '10:00', title: 'Porte-à-porte — quartier de Zaspa avec les bénévoles', location: 'Gdańsk, Zaspa', type: 'terrain' },
    { time: '13:30', title: 'Interview Radio Gdańsk — mobilité et budget', location: 'Studio', type: 'media' },
    { time: '17:00', title: 'Préparation de la prise de parole « chantier naval » de mardi', location: 'QG de campagne', type: 'reunion' },
  ],

  week: [
    { day: 'lun.', date: '13/07', posts: [{ time: '09:00', platform: 'facebook', title: 'Programme mobilité — les 5 engagements' }] },
    { day: 'mar.', date: '14/07', posts: [{ time: '11:30', platform: 'x', title: 'Thread — coût réel du stade' }, { time: '18:00', platform: 'instagram', title: 'Story répétition débat' }] },
    { day: 'mer.', date: '15/07', posts: [{ time: '20:00', platform: 'presse', title: 'Avant-débat — nos axes' }] },
    { day: 'jeu.', date: '16/07', posts: [{ time: '21:45', platform: 'facebook', title: 'Réaction à chaud post-débat' }, { time: '22:10', platform: 'x', title: 'Merci + replay du débat' }] },
    { day: 'ven.', date: '17/07', posts: [{ time: '12:00', platform: 'instagram', title: 'Reel — meilleurs moments du débat' }] },
    { day: 'sam.', date: '18/07', posts: [{ time: '10:00', platform: 'facebook', title: 'Photos — réunion publique d’Oliwa' }] },
    { day: 'dim.', date: '19/07', today: true, posts: [{ time: '11:00', platform: 'x', title: 'Démenti — vrai / faux sondage' }, { time: '14:30', platform: 'instagram', title: 'Reel — extrait débat (2:14)' }] },
  ],

  pipeline: {
    brouillon: [
      { title: 'Prise de parole — chantier naval (chiffres emploi)', platform: 'presse', author: 'Agnieszka Z.', tag: 'Économie' },
    ],
    relecture: [
      { title: 'Démenti visuel — vrai / faux sondage', platform: 'x', author: 'Agnieszka Z.', tag: 'Crise' },
      { title: 'Post Facebook — compte-rendu porte-à-porte Zaspa', platform: 'facebook', author: 'Katarzyna L.', tag: 'Terrain' },
    ],
    approuve: [
      { title: 'Reel — extrait débat « coût du stade »', platform: 'instagram', author: 'Tomasz K.', tag: 'Vidéo' },
    ],
    planifie: [
      { title: 'Thread X — tramway aéroport, les chiffres', platform: 'x', author: 'Piotr N.', tag: 'Transport' },
      { title: 'Newsletter hebdo n° 19', platform: 'presse', author: 'Agnieszka Z.', tag: 'Newsletter' },
    ],
  },

  platformStats: [
    { platform: 'Facebook', portee: 98000, engagement: 5.6 },
    { platform: 'Instagram', portee: 121000, engagement: 7.2 },
    { platform: 'X', portee: 64000, engagement: 3.1 },
    { platform: 'YouTube', portee: 47000, engagement: 4.4 },
  ],
}

const en: TenantData = {
  meta: {
    id: 'kowalska',
    name: 'Kowalska Campaign',
    subtitle: 'City of Gdańsk — Poland',
    detail: 'M. Kowalska · candidate · Oct. 2026 elections',
    initials: 'CK',
  },

  threat: {
    level: 'FAIBLE',
    summary:
      'Overall calm situation. A falsified poll screenshot is circulating on X; the reported impersonator account has been suspended.',
    updatedAt: '19/07/2026 09:30',
  },

  kpis: {
    securityScore: 86,
    securityScoreDelta: 4,
    mentions24h: 612,
    mentionsDelta: 12,
    netSentiment: 24,
    netSentimentDelta: 6,
    activeAlerts: 3,
    criticalAlerts: 0,
  },

  sentimentTrend: [
    { date: '13/07', positif: 34, neutre: 44, negatif: 22 },
    { date: '14/07', positif: 36, neutre: 43, negatif: 21 },
    { date: '15/07', positif: 35, neutre: 44, negatif: 21 },
    { date: '16/07', positif: 41, neutre: 41, negatif: 18 },
    { date: '17/07', positif: 44, neutre: 39, negatif: 17 },
    { date: '18/07', positif: 46, neutre: 38, negatif: 16 },
    { date: '19/07', positif: 47, neutre: 37, negatif: 16 },
  ],

  alerts: [
    { id: 'ALT-2026-033', severity: 'moyenne', title: 'Falsified "IBRiS" poll screenshot circulating on X', source: 'X monitoring', time: '19/07 08:12', status: 'en_cours' },
    { id: 'ALT-2026-032', severity: 'moyenne', title: "2 new accounts impersonating the candidate's identity detected", source: 'X monitoring', time: '19/07 06:48', status: 'nouveau' },
    { id: 'ALT-2026-031', severity: 'elevee', title: 'Phishing targeting the campaign mailbox (3 messages)', source: 'Anti-phishing filter', time: '18/07 17:26', status: 'resolu' },
    { id: 'ALT-2026-030', severity: 'faible', title: 'Impersonator account @Kowalska_GDN suspended by X', source: 'X monitoring', time: '19/07 04:12', status: 'resolu' },
    { id: 'ALT-2026-028', severity: 'faible', title: 'Rise in hostile comments under debate videos (organic)', source: 'YouTube moderation', time: '17/07 22:15', status: 'resolu' },
  ],

  incident: {
    id: 'INC-2026-007',
    title: 'X account impersonation — @Kowalska_GDN',
    severity: 'moyenne',
    status: 'Resolved — monitoring maintained',
    detected: '17/07/2026 14:52',
    summary:
      "An X account impersonating the candidate (official photo, near-identical name) was posting contradictory messages about the transport program. Suspended by X overnight 07/18–19; two similar accounts are already being watched.",
    steps: [
      { time: '17/07 14:52', title: 'Detection', description: 'Identity-similarity alert: account created 07/15, official photo, 2,400 followers in 48 h.', operator: 'Bastion system', state: 'termine' },
      { time: '17/07 15:20', title: 'Qualification', description: 'Typical impersonation behavior: altered reposts of real statements, links to a fraudulent donation form.', operator: 'J. Wiśniewski — Security operator', state: 'termine' },
      { time: '17/07 16:05', title: 'Counter-measures', description: 'Expedited report to X (impersonation form + ID proof), warning posted on the official account, donation form reported to CERT Polska.', operator: 'A. Zielińska — Head of comms', state: 'termine' },
      { time: '19/07 04:12', title: 'Account suspended', description: 'X suspended @Kowalska_GDN. All 43 posts archived for the legal file.', operator: 'Bastion system', state: 'termine' },
      { time: 'Since 19/07 06:00', title: 'Reappearance watch', description: '2 similar accounts detected (same image bank). Pre-filled reports ready to file.', operator: 'J. Wiśniewski — Security operator', state: 'en_cours' },
      { time: '—', title: 'Post-mortem & closure', description: 'Legal review with the Gdańsk law firm; decision on filing a donation-fraud complaint.', operator: 'P. Nowak', state: 'a_venir' },
    ],
  },

  // Extraits conservés dans leur langue d'origine (tag `lang`)
  mentions: [
    { id: 'm01', source: 'x', author: '@gdansk_stopklatka', excerpt: 'SONDAGE CHOC : Kowalska à 18 % selon IBRiS. La candidate perd le nord.', lang: 'FR', sentiment: 'negatif', reach: 12400, time: '19/07 08:12', topic: 'Polls' },
    { id: 'm02', source: 'presse', author: 'Gazeta Wyborcza Trójmiasto', excerpt: 'Après le débat de jeudi, Maria Kowalska apparaît comme l’alternative la plus crédible : précision des chiffres, ton présidentiel.', lang: 'FR', sentiment: 'positif', reach: 58200, time: '19/07 07:40', topic: 'TV debate' },
    { id: 'm03', source: 'facebook', author: 'Groupe « Wrzeszcz dla ludzi »', excerpt: 'Les pistes cyclables de l’avenue Grunwaldzka : la candidate Kowalska promet une concertation réelle, pas une décision imposée.', lang: 'FR', sentiment: 'positif', reach: 4700, time: '18/07 21:05', topic: 'Transport' },
    { id: 'm04', source: 'instagram', author: '@gdansk.official.fan', excerpt: 'Reel du débat : la séquence où Kowalska cite le coût réel du stade a dépassé les 90 000 vues.', lang: 'FR', sentiment: 'positif', reach: 21800, time: '18/07 19:32', topic: 'TV debate' },
    { id: 'm05', source: 'forum', author: 'trojmiasto.pl — fil « Élections »', excerpt: 'Débat : Kowalska solide sur le budget, évasive sur le chantier naval. Les dockers attendent un engagement clair.', lang: 'FR', sentiment: 'neutre', reach: 6200, time: '18/07 17:48', topic: 'Shipyard' },
    { id: 'm06', source: 'facebook', author: 'Page officielle campagne', excerpt: 'Merci Gdańsk ! 800 personnes à la réunion publique d’Oliwa ce soir. Prochaine étape : Zaspa, mardi 18:00.', lang: 'FR', sentiment: 'positif', reach: 15600, time: '18/07 22:14', topic: 'Field campaign' },
    { id: 'm07', source: 'telegram', author: 'Canal « Trójmiasto Info »', excerpt: 'La mairie sortante accuse Kowalska de populisme après ses propositions sur les transports gratuits pour les étudiants.', lang: 'FR', sentiment: 'negatif', reach: 5400, time: '18/07 15:27', topic: 'Transport' },
    { id: 'm08', source: 'x', author: '@ibw_pomorze', excerpt: 'Fact-check : le « sondage IBRiS » partagé ce matin ne correspond à aucune publication de l’institut. Capture fabriquée.', lang: 'FR', sentiment: 'neutre', reach: 9800, time: '19/07 09:02', topic: 'Polls' },
    { id: 'm09', source: 'presse', author: 'Radio Gdańsk', excerpt: 'Mobilité : la candidate propose une ligne de tramway vers l’aéroport et le doublement des pistes cyclables d’ici 2030.', lang: 'FR', sentiment: 'neutre', reach: 33500, time: '18/07 12:10', topic: 'Transport' },
    { id: 'm10', source: 'forum', author: 'wirtualna-gdynia.net', excerpt: 'Vu à Zaspa : affiches Kowalska recouvertes par des autocollants de la majorité sortante. Ambiance de fin de campagne…', lang: 'FR', sentiment: 'neutre', reach: 1800, time: '18/07 10:44', topic: 'Field campaign' },
  ],

  heatmap: [
    { topic: 'Shipyard', positif: 24, neutre: 58, negatif: 41, risque: 52 },
    { topic: 'Transport', positif: 52, neutre: 63, negatif: 34, risque: 36 },
    { topic: 'Polls', positif: 12, neutre: 38, negatif: 29, risque: 44 },
    { topic: 'TV debate', positif: 88, neutre: 42, negatif: 18, risque: 14 },
    { topic: "Candidate's staff", positif: 19, neutre: 27, negatif: 12, risque: 22 },
    { topic: 'Environment', positif: 34, neutre: 29, negatif: 9, risque: 12 },
  ],

  topSources: [
    { name: 'Trójmiasto regional press', type: 'presse', mentions: 128, negativity: 18 },
    { name: 'Gdańsk Facebook groups', type: 'facebook', mentions: 96, negativity: 34 },
    { name: 'X — Pomerania area', type: 'x', mentions: 84, negativity: 42 },
    { name: 'trojmiasto.pl forums', type: 'forum', mentions: 52, negativity: 28 },
    { name: 'Local Telegram channels', type: 'telegram', mentions: 31, negativity: 55 },
  ],

  brief: {
    dateLabel: 'Sunday, July 19, 2026',
    generatedAt: '19/07/2026 06:00',
    synthese: [
      'Overall calm day. Mention volume remains moderate (612 over 24 h, +12%) and net sentiment stands at +24, the week’s best value, lifted by the very favorable fallout from Thursday’s debate on TVP Gdańsk.',
      'The only watchpoint: a falsified screenshot showing an unfavorable "IBRiS" poll has been circulating on X since last night. Spread remains limited (≈ 340 shares) and a first independent fact-check was published this morning.',
    ],
    signauxFaibles: [
      'The falsified poll screenshot reuses the IBRiS visual identity with a logo error (old version). No matching poll exists; the institute has been informed and confirms it published nothing.',
      'The impersonator account @Kowalska_GDN, reported on 07/17, was suspended by X overnight at 04:12. Two similar accounts (same image bank) are already under surveillance.',
      'The "shipyard" thread remains polarized but stable; dockworkers expect a costed commitment from the candidate, expected this week per the press.',
      'The Wrzeszcz bike-lane controversy remains organic (identified authors, long account histories) — no manipulation detected.',
    ],
    incidents: [
      'INC-2026-007 — X account impersonation: resolved 07/19 at 04:12 (platform suspension). Reappearance watch maintained, legal file in preparation.',
      'ALT-2026-031 — Phishing targeting the campaign mailbox: 3 messages from the intervilles-gdansk.pl domain, all intercepted. Filters updated, no opens detected.',
      'ALT-2026-033 — Falsified poll screenshot on X: incident opened this morning, visual rebuttal in preparation.',
    ],
    recommandations: [
      'Publish a "real / fake poll" visual rebuttal (simple, shareable format) before 11:00 and send it to volunteer relays.',
      'Refile the verification request for the official X account and enable automated monitoring of look-alike names (2 variants already detected).',
      'Hold the post-debate editorial line: rebroadcast the most-shared video excerpt (2 min 14, "stadium cost" sequence) in the early afternoon.',
      'Prepare the shipyard statement announced for Tuesday: employment figures validated by the economic department before release.',
    ],
  },

  assets: [
    { name: 'kowalska2026.pl', type: 'Site web', status: 'Protégé', score: 94, lastCheck: '19/07 06:00' },
    { name: 'kowalska2026.pl (DNS zone)', type: 'Domaine', status: 'Protégé', score: 91, lastCheck: '19/07 06:00' },
    { name: 'Campaign Facebook page', type: 'Compte social', status: 'Protégé', score: 89, lastCheck: '19/07 06:00' },
    { name: '@MariaKowalska — X', type: 'Compte social', status: 'À surveiller', score: 72, lastCheck: '19/07 06:00' },
    { name: '@kowalska.gdansk — Instagram', type: 'Compte social', status: 'Protégé', score: 93, lastCheck: '19/07 06:00' },
    { name: 'biuro@kowalska2026.pl', type: 'Email', status: 'Protégé', score: 84, lastCheck: '19/07 06:00' },
    { name: 'Volunteer CRM (SaaS)', type: 'Outil', status: 'Protégé', score: 88, lastCheck: '19/07 06:00' },
  ],

  checks: [
    { label: 'TLS / HTTPS configuration', status: 'ok', detail: 'TLS 1.3, A+ grade (SSL Labs)', lastRun: '19/07 06:00' },
    { label: 'Certificate expiry', status: 'ok', detail: 'Valid until 14/11/2026', lastRun: '19/07 06:00' },
    { label: 'HTTP security headers', status: 'ok', detail: 'Strict CSP, HSTS preload active', lastRun: '19/07 06:00' },
    { label: 'DNS change detection', status: 'ok', detail: 'No changes since 28/06', lastRun: '19/07 06:00' },
    { label: 'SPF / DKIM / DMARC', status: 'ok', detail: 'DMARC in "reject" mode — exemplary configuration', lastRun: '19/07 06:00' },
    { label: 'Leak exposure (HIBP)', status: 'ok', detail: 'No team addresses in recent corpora', lastRun: '19/07 06:00' },
    { label: 'Availability', status: 'ok', detail: '99.98% over 30 days', lastRun: '19/07 06:00' },
    { label: 'Content integrity', status: 'ok', detail: 'Fingerprint unchanged since 18/07 06:00', lastRun: '19/07 06:00' },
  ],

  stressTest: {
    readiness: 91,
    lastRun: '12/07/2026',
    points: [
      { label: 'MFA enabled on all access accounts', ok: true },
      { label: 'Site backups verified (restore tested on 06/07)', ok: true },
      { label: 'Incident playbooks reviewed and up to date', ok: true },
      { label: 'Official X account verification still pending', ok: false },
    ],
  },

  team: [
    { name: 'Piotr Nowak', role: 'Campaign director', email: 'p.nowak@kowalska2026.pl', mfa: true, lastActive: '7 min ago', initials: 'PN' },
    { name: 'Agnieszka Zielińska', role: 'Head of communications', email: 'a.zielinska@kowalska2026.pl', mfa: true, lastActive: '18 min ago', initials: 'AZ' },
    { name: 'Jakub Wiśniewski', role: 'Security operator', email: 'j.wisniewski@kowalska2026.pl', mfa: true, lastActive: '3 min ago', initials: 'JW' },
    { name: 'Katarzyna Lewandowska', role: 'Moderator', email: 'k.lewandowska@kowalska2026.pl', mfa: true, lastActive: '42 min ago', initials: 'KL' },
    { name: 'Tomasz Kamiński', role: 'Moderator', email: 't.kaminski@kowalska2026.pl', mfa: true, lastActive: '1 h ago', initials: 'TK' },
    { name: 'Maria Kowalska', role: 'Candidate — read-only', email: 'm.kowalska@kowalska2026.pl', mfa: true, lastActive: '2 h ago', initials: 'MK' },
  ],

  audit: [
    { time: '19/07 08:31', actor: 'Agnieszka Zielińska', action: '"Real / fake poll" visual rebuttal submitted for review', type: 'contenu' },
    { time: '19/07 06:55', actor: 'Jakub Wiśniewski', action: '2 similar X accounts added to the watch list', type: 'alerte' },
    { time: '18/07 17:41', actor: 'Jakub Wiśniewski', action: 'intervilles-gdansk.pl domain blocked at the mail filter', type: 'securite' },
    { time: '18/07 11:02', actor: 'Piotr Nowak', action: 'Weekly monitoring report export (PDF)', type: 'contenu' },
    { time: '17/07 16:20', actor: 'Katarzyna Lewandowska', action: 'Impersonation report sent to X with ID proof', type: 'securite' },
    { time: '17/07 09:14', actor: 'Maria Kowalska', action: 'Digital charter signed (version 2.3)', type: 'compte' },
  ],

  charter: {
    signed: 6,
    total: 6,
    pending: [],
    lastUpdate: '17/07/2026',
  },

  events: [
    { time: '10:00', title: 'Door-to-door — Zaspa neighborhood with volunteers', location: 'Gdańsk, Zaspa', type: 'terrain' },
    { time: '13:30', title: 'Radio Gdańsk interview — mobility and budget', location: 'Studio', type: 'media' },
    { time: '17:00', title: 'Preparation of Tuesday’s "shipyard" statement', location: 'Campaign HQ', type: 'reunion' },
  ],

  week: [
    { day: 'Mon.', date: '13/07', posts: [{ time: '09:00', platform: 'facebook', title: 'Mobility program — the 5 commitments' }] },
    { day: 'Tue.', date: '14/07', posts: [{ time: '11:30', platform: 'x', title: 'Thread — the stadium’s real cost' }, { time: '18:00', platform: 'instagram', title: 'Debate rehearsal story' }] },
    { day: 'Wed.', date: '15/07', posts: [{ time: '20:00', platform: 'presse', title: 'Pre-debate — our lines' }] },
    { day: 'Thu.', date: '16/07', posts: [{ time: '21:45', platform: 'facebook', title: 'Hot post-debate reaction' }, { time: '22:10', platform: 'x', title: 'Thanks + debate replay' }] },
    { day: 'Fri.', date: '17/07', posts: [{ time: '12:00', platform: 'instagram', title: 'Reel — debate highlights' }] },
    { day: 'Sat.', date: '18/07', posts: [{ time: '10:00', platform: 'facebook', title: 'Photos — Oliwa public meeting' }] },
    { day: 'Sun.', date: '19/07', today: true, posts: [{ time: '11:00', platform: 'x', title: 'Rebuttal — real / fake poll' }, { time: '14:30', platform: 'instagram', title: 'Reel — debate excerpt (2:14)' }] },
  ],

  pipeline: {
    brouillon: [
      { title: 'Statement — shipyard (employment figures)', platform: 'presse', author: 'Agnieszka Z.', tag: 'Economy' },
    ],
    relecture: [
      { title: 'Visual rebuttal — real / fake poll', platform: 'x', author: 'Agnieszka Z.', tag: 'Crisis' },
      { title: 'Facebook post — Zaspa door-to-door recap', platform: 'facebook', author: 'Katarzyna L.', tag: 'Field' },
    ],
    approuve: [
      { title: 'Reel — "stadium cost" debate excerpt', platform: 'instagram', author: 'Tomasz K.', tag: 'Video' },
    ],
    planifie: [
      { title: 'X thread — airport tramway, the figures', platform: 'x', author: 'Piotr N.', tag: 'Transport' },
      { title: 'Weekly newsletter #19', platform: 'presse', author: 'Agnieszka Z.', tag: 'Newsletter' },
    ],
  },

  platformStats: [
    { platform: 'Facebook', portee: 98000, engagement: 5.6 },
    { platform: 'Instagram', portee: 121000, engagement: 7.2 },
    { platform: 'X', portee: 64000, engagement: 3.1 },
    { platform: 'YouTube', portee: 47000, engagement: 4.4 },
  ],
}

export const kowalska: Record<Lang, TenantData> = { en, fr }
