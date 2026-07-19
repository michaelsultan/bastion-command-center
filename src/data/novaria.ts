import type { TenantData } from './types'

export const novaria: TenantData = {
  meta: {
    id: 'novaria',
    name: 'Mairie de Novaria',
    subtitle: 'Cabinet du maire — mandat en cours',
    detail: 'I. Dobrović · maire · mandature 2024 – 2028',
    initials: 'MN',
  },

  threat: {
    level: 'MODÉRÉ',
    summary:
      'Stabilisation après l’attaque DDoS du 17/07 contre le portail municipal. Rumeur persistante sur un marché public de voirie.',
    updatedAt: '19/07/2026 09:30',
  },

  kpis: {
    securityScore: 68,
    securityScoreDelta: -6,
    mentions24h: 437,
    mentionsDelta: 5,
    netSentiment: 3,
    netSentimentDelta: -2,
    activeAlerts: 5,
    criticalAlerts: 1,
  },

  sentimentTrend: [
    { date: '13/07', positif: 38, neutre: 42, negatif: 20 },
    { date: '14/07', positif: 39, neutre: 41, negatif: 20 },
    { date: '15/07', positif: 37, neutre: 43, negatif: 20 },
    { date: '16/07', positif: 35, neutre: 42, negatif: 23 },
    { date: '17/07', positif: 30, neutre: 41, negatif: 29 },
    { date: '18/07', positif: 32, neutre: 42, negatif: 26 },
    { date: '19/07', positif: 34, neutre: 42, negatif: 24 },
  ],

  alerts: [
    { id: 'ALT-2026-054', severity: 'critique', title: 'Document falsifié (« facture » du marché de voirie) diffusé sur Telegram', source: 'Veille Telegram', time: '19/07 07:58', status: 'en_cours' },
    { id: 'ALT-2026-053', severity: 'elevee', title: 'Mobilisation annoncée contre le permis du quai Ouest — mardi 18:00', source: 'Facebook — événement public', time: '18/07 20:11', status: 'en_cours' },
    { id: 'ALT-2026-052', severity: 'moyenne', title: 'Certificat TLS du portail citoyen expire dans 21 jours', source: 'Contrôle TLS', time: '19/07 06:00', status: 'nouveau' },
    { id: 'ALT-2026-051', severity: 'moyenne', title: '2 adresses municipales présentes dans un corpus de fuite publié le 14/07', source: 'HaveIBeenPwned', time: '16/07 06:00', status: 'resolu' },
    { id: 'ALT-2026-050', severity: 'elevee', title: 'Attaque DDoS sur novaria.gov — pics à 3,2 Gbps', source: 'Supervision réseau', time: '17/07 21:02', status: 'resolu' },
    { id: 'ALT-2026-049', severity: 'faible', title: 'Compte X « Novaria Libre » reprenant la charte de la mairie', source: 'Veille X', time: '17/07 09:36', status: 'resolu' },
  ],

  incident: {
    id: 'INC-2026-019',
    title: 'Attaque DDoS contre le portail novaria.gov',
    severity: 'elevee',
    status: 'Atténuée — surveillance',
    detected: '17/07/2026 21:02',
    summary:
      'Attaque par déni de service distribué contre le portail municipal (pics à 3,2 Gbps) pendant 2 h 38, coïncidant avec la publication de la fiche de transparence du marché de voirie. Atténuée par le filtrage du prestataire ; aucune donnée compromise.',
    steps: [
      { time: '17/07 21:02', title: 'Détection', description: 'Alerte supervision : trafic entrant ×26 en 4 minutes, disponibilité du portail dégradée (37 %).', operator: 'Système Bastion', state: 'termine' },
      { time: '17/07 21:15', title: 'Qualification', description: 'Attaque volumétrique UDP/HTTPS multi-sources (≈ 11 000 IP). Aucun signe d’intrusion associé ; cible = disponibilité uniquement.', operator: 'M. Stojanović — Opératrice sécurité', state: 'termine' },
      { time: '17/07 21:31', title: 'Contre-mesures', description: 'Activation du filtrage anti-DDoS du prestataire, bascule sur les règles « mode assiégé », page de statut publiée sur les réseaux officiels.', operator: 'M. Stojanović — Opératrice sécurité', state: 'termine' },
      { time: '17/07 23:40', title: 'Atténuation confirmée', description: 'Trafic revenu à la normale, disponibilité 100 %. Aucune donnée compromise. Rapport transmis au CERT national.', operator: 'M. Stojanović — Opératrice sécurité', state: 'termine' },
      { time: 'Depuis 18/07 08:00', title: 'Surveillance', description: 'Seuils d’alerte réseau abaissés jusqu’au 24/07 ; corrélation recherchée entre l’attaque et la diffusion du document falsifié sur Telegram.', operator: 'J. Marković — Chef de cabinet', state: 'en_cours' },
      { time: '—', title: 'Post-mortem & clôture', description: 'Revue des capacités d’absorption avec le prestataire ; mise à jour du playbook DDoS.', operator: 'À attribuer', state: 'a_venir' },
    ],
  },

  mentions: [
    { id: 'm01', source: 'telegram', author: 'Canal « Novaria Libre »', excerpt: 'FACTURE AUTHENTIQUE : 2,3 M€ pour un kilomètre d’avenue des Tilleuls. Où est passé l’argent ? La mairie doit s’expliquer.', sentiment: 'negatif', reach: 8900, time: '19/07 07:58', topic: 'Marchés publics' },
    { id: 'm02', source: 'facebook', author: 'Événement « Non au quai Ouest »', excerpt: 'Rendez-vous mardi 18:00 devant l’hôtel de ville : nous demandons la suspension du permis et une vraie concertation publique.', sentiment: 'negatif', reach: 5600, time: '18/07 20:11', topic: 'Urbanisme' },
    { id: 'm03', source: 'presse', author: 'Novaria Vjesnik', excerpt: 'La mairie publie l’intégralité du marché de voirie : montants, attributaire et calendrier accessibles en ligne. Une première.', sentiment: 'positif', reach: 28400, time: '18/07 15:44', topic: 'Marchés publics' },
    { id: 'm04', source: 'presse', author: 'Portail 24sata', excerpt: 'Le site de la mairie visé par une cyberattaque vendredi soir. Services en ligne rétablis avant minuit, aucune donnée volée.', sentiment: 'neutre', reach: 41200, time: '18/07 09:12', topic: 'Cybersécurité' },
    { id: 'm05', source: 'facebook', author: 'Page officielle de la Ville', excerpt: 'Réouverture de la médiathèque centrale après travaux : 4 200 visiteurs ce samedi. Merci pour votre patience.', sentiment: 'positif', reach: 11800, time: '18/07 18:30', topic: 'Culture' },
    { id: 'm06', source: 'forum', author: 'novaria-forum.net — fil « Voirie »', excerpt: 'Deux poids deux mesures : l’avenue refaite en centre-ville pendant que nos rues attendent depuis 2019.', sentiment: 'negatif', reach: 2300, time: '18/07 13:26', topic: 'Marchés publics' },
    { id: 'm07', source: 'x', author: '@novaria_transit', excerpt: 'Nouvelle navette électrique centre ↔ gare : fréquence 10 min dès septembre. Bonne nouvelle pour les usagers.', sentiment: 'positif', reach: 3400, time: '18/07 11:05', topic: 'Transport' },
    { id: 'm08', source: 'telegram', author: 'Canal « Novaria Libre »', excerpt: 'Le maire Dobrović a peur du débat public. Partagez la facture avant le conseil de jeudi.', sentiment: 'negatif', reach: 7200, time: '17/07 22:48', topic: 'Personnel du maire' },
    { id: 'm09', source: 'instagram', author: '@novaria.city', excerpt: 'Les quais réaménagés en images : avant / après du secteur Ouest.', sentiment: 'positif', reach: 6900, time: '17/07 17:20', topic: 'Urbanisme' },
    { id: 'm10', source: 'forum', author: 'novaria-forum.net — fil « Conseil municipal »', excerpt: 'Ordre du jour du conseil de jeudi : voirie, budget culturel, sécurité. Séance ouverte au public.', sentiment: 'neutre', reach: 1100, time: '17/07 10:02', topic: 'Vie municipale' },
  ],

  heatmap: [
    { topic: 'Marchés publics', positif: 31, neutre: 48, negatif: 76, risque: 62 },
    { topic: 'Urbanisme', positif: 28, neutre: 51, negatif: 54, risque: 55 },
    { topic: 'Cybersécurité', positif: 12, neutre: 66, negatif: 21, risque: 34 },
    { topic: 'Personnel du maire', positif: 18, neutre: 33, negatif: 29, risque: 41 },
    { topic: 'Transport', positif: 44, neutre: 38, negatif: 12, risque: 16 },
    { topic: 'Culture', positif: 57, neutre: 29, negatif: 6, risque: 8 },
  ],

  topSources: [
    { name: 'Presse régionale', type: 'presse', mentions: 118, negativity: 24 },
    { name: 'Groupes Facebook Novaria', type: 'facebook', mentions: 92, negativity: 48 },
    { name: 'Canal « Novaria Libre »', type: 'telegram', mentions: 61, negativity: 88 },
    { name: 'novaria-forum.net', type: 'forum', mentions: 47, negativity: 39 },
    { name: 'X — zone Novaria', type: 'x', mentions: 33, negativity: 21 },
  ],

  brief: {
    dateLabel: 'Dimanche 19 juillet 2026',
    generatedAt: '19/07/2026 06:00',
    synthese: [
      'La situation se stabilise après l’attaque DDoS du 17/07 contre le portail municipal (atténuée en 2 h 38, aucune donnée compromise). Le volume de mentions reste proche de la normale (437 sur 24 h, +5 %).',
      'La rumeur visant le marché public de voirie de l’avenue des Tilleuls persiste dans deux groupes Facebook et sur le canal Telegram « Novaria Libre », mais ne s’amplifie plus depuis la publication de la fiche de transparence — saluée par la presse régionale.',
    ],
    signauxFaibles: [
      'Le canal Telegram « Novaria Libre » (4 200 abonnés) diffuse depuis le 16/07 un document présenté comme une facture du marché de voirie ; les métadonnées et la numérotation prouvent qu’il s’agit d’un montage.',
      'L’événement Facebook « Non au permis du quai Ouest » rassemble 1 800 participants ; tonalité revendicative mais non hostile. Une mobilisation physique est annoncée mardi 21/07 à 18:00 devant l’hôtel de ville.',
      'Deux adresses électroniques municipales figuraient dans un corpus de fuite publié le 14/07 ; mots de passe réinitialisés, aucune connexion anormale détectée depuis.',
      'La corrélation entre l’attaque DDoS (17/07, 21:02) et la diffusion du document falsifié (16/07) reste à établir ; l’hypothèse d’une action coordonnée n’est pas écartée.',
    ],
    incidents: [
      'INC-2026-019 — Attaque DDoS sur novaria.gov : atténuée le 17/07 à 23:40. Surveillance réseau renforcée jusqu’au 24/07, rapport transmis au CERT national.',
      'ALT-2026-054 — Document falsifié sur le marché de voirie : incident ouvert ce matin, archives probantes en cours de constitution.',
      'ALT-2026-052 — Certificat TLS du portail citoyen : expiration dans 21 jours, renouvellement planifié le 22/07 (avancement au 20/07 recommandé).',
    ],
    recommandations: [
      'Publier avant lundi 10:00 le complément de transparence du marché de voirie (décomposition des coûts au mètre linéaire, comparaison régionale) et le référencer dans les réponses aux commentaires.',
      'Briefer le cabinet avant la mobilisation de mardi : prise de parole courte du maire, éléments de langage validés, consigne de ne pas répondre aux provocations en ligne.',
      'Avancer le renouvellement du certificat TLS au 20/07 et vérifier la chaîne de confiance complète du portail citoyen.',
      'Conserver le canal « Novaria Libre » sous surveillance renforcée ; archiver le document falsifié et ses diffusions pour d’éventuelles suites judiciaires.',
    ],
  },

  assets: [
    { name: 'novaria.gov', type: 'Site web', status: 'Protégé', score: 78, lastCheck: '19/07 06:00' },
    { name: 'Portail citoyen — services.novaria.gov', type: 'Site web', status: 'À surveiller', score: 62, lastCheck: '19/07 06:00' },
    { name: 'novaria.gov (zone DNS)', type: 'Domaine', status: 'Protégé', score: 83, lastCheck: '19/07 06:00' },
    { name: 'Page Facebook de la Ville', type: 'Compte social', status: 'Protégé', score: 86, lastCheck: '19/07 06:00' },
    { name: '@VilleNovaria — X', type: 'Compte social', status: 'Protégé', score: 81, lastCheck: '19/07 06:00' },
    { name: 'cabinet@novaria.gov', type: 'Email', status: 'À surveiller', score: 59, lastCheck: '19/07 06:00' },
    { name: 'Intranet municipal (SaaS)', type: 'Outil', status: 'Protégé', score: 74, lastCheck: '19/07 06:00' },
  ],

  checks: [
    { label: 'Configuration TLS / HTTPS', status: 'ok', detail: 'TLS 1.2/1.3 sur l’ensemble des vhosts', lastRun: '19/07 06:00' },
    { label: 'Expiration du certificat', status: 'critique', detail: 'Portail citoyen : expiration dans 21 jours (renouvellement planifié)', lastRun: '19/07 06:00' },
    { label: 'En-têtes de sécurité HTTP', status: 'avertissement', detail: 'CSP absente sur le portail citoyen (hébergement historique)', lastRun: '19/07 06:00' },
    { label: 'Détection de changement DNS', status: 'ok', detail: 'Aucune modification depuis le 11/06', lastRun: '19/07 06:00' },
    { label: 'SPF / DKIM / DMARC', status: 'avertissement', detail: 'DKIM absent sur la messagerie du cabinet', lastRun: '19/07 06:00' },
    { label: 'Exposition de fuites (HIBP)', status: 'avertissement', detail: '2 adresses municipales exposées — réinitialisées le 16/07', lastRun: '19/07 06:00' },
    { label: 'Disponibilité', status: 'avertissement', detail: '99,1 % sur 7 jours — incident DDoS du 17/07', lastRun: '19/07 06:00' },
    { label: 'Intégrité du contenu', status: 'ok', detail: 'Empreinte inchangée depuis le 18/07 06:00', lastRun: '19/07 06:00' },
  ],

  stressTest: {
    readiness: 64,
    lastRun: '12/07/2026',
    points: [
      { label: 'Sauvegardes vérifiées (restauration testée le 04/07)', ok: true },
      { label: 'Playbook DDoS éprouvé en conditions réelles le 17/07', ok: true },
      { label: 'DKIM à déployer sur la messagerie du cabinet', ok: false },
      { label: 'Certificat TLS du portail citoyen à renouveler', ok: false },
      { label: 'MFA à activer pour 1 membre du cabinet', ok: false },
    ],
  },

  team: [
    { name: 'Jelena Marković', role: 'Chef de cabinet', email: 'j.markovic@novaria.gov', mfa: true, lastActive: 'il y a 9 min', initials: 'JM' },
    { name: 'Petar Nikolić', role: 'Responsable communication', email: 'p.nikolic@novaria.gov', mfa: true, lastActive: 'il y a 22 min', initials: 'PN' },
    { name: 'Milica Stojanović', role: 'Opératrice sécurité', email: 'm.stojanovic@novaria.gov', mfa: true, lastActive: 'il y a 5 min', initials: 'MS' },
    { name: 'Stefan Jovanović', role: 'Modérateur', email: 's.jovanovic@novaria.gov', mfa: true, lastActive: 'il y a 38 min', initials: 'SJ' },
    { name: 'Ana Kovač', role: 'Modératrice', email: 'a.kovac@novaria.gov', mfa: false, lastActive: 'hier 19:24', initials: 'AK' },
    { name: 'Ivan Dobrović', role: 'Maire — lecture seule', email: 'i.dobrovic@novaria.gov', mfa: true, lastActive: 'il y a 1 h', initials: 'ID' },
  ],

  audit: [
    { time: '19/07 08:14', actor: 'Milica Stojanović', action: 'Document falsifié Telegram archivé (preuve n° 2026-077)', type: 'securite' },
    { time: '18/07 16:52', actor: 'Petar Nikolić', action: 'Complément de transparence « marché de voirie » soumis en relecture', type: 'contenu' },
    { time: '18/07 08:05', actor: 'Jelena Marković', action: 'Seuils d’alerte réseau abaissés jusqu’au 24/07', type: 'alerte' },
    { time: '17/07 21:31', actor: 'Milica Stojanović', action: 'Filtrage anti-DDoS « mode assiégé » activé sur novaria.gov', type: 'securite' },
    { time: '16/07 09:47', actor: 'Stefan Jovanović', action: 'Réinitialisation de 2 comptes municipaux exposés', type: 'securite' },
    { time: '15/07 14:12', actor: 'Jelena Marković', action: 'Export du rapport mensuel RGPD (registre de traitement)', type: 'compte' },
  ],

  charter: {
    signed: 5,
    total: 6,
    pending: ['Ana Kovač'],
    lastUpdate: '14/07/2026',
  },

  events: [
    { time: '10:30', title: 'Visite de la médiathèque rénovée avec la presse locale', location: 'Médiathèque centrale', type: 'media' },
    { time: '15:00', title: 'Réunion cabinet — préparation de la mobilisation du 21/07', location: 'Hôtel de ville', type: 'reunion' },
    { time: '17:30', title: 'Rencontre des commerçants de l’avenue des Tilleuls', location: 'Avenue des Tilleuls', type: 'terrain' },
  ],

  week: [
    { day: 'lun.', date: '13/07', posts: [{ time: '09:30', platform: 'facebook', title: 'Réouverture médiathèque — programme' }] },
    { day: 'mar.', date: '14/07', posts: [{ time: '11:00', platform: 'x', title: 'Navette électrique — les chiffres' }] },
    { day: 'mer.', date: '15/07', posts: [{ time: '10:00', platform: 'instagram', title: 'Avant / après — quais Ouest' }] },
    { day: 'jeu.', date: '16/07', posts: [{ time: '12:00', platform: 'presse', title: 'Fiche transparence — marché de voirie' }] },
    { day: 'ven.', date: '17/07', posts: [{ time: '21:40', platform: 'facebook', title: 'Statut incident — portail en ligne' }] },
    { day: 'sam.', date: '18/07', posts: [{ time: '09:00', platform: 'presse', title: 'Communiqué — cyberattaque repoussée' }] },
    { day: 'dim.', date: '19/07', today: true, posts: [{ time: '11:30', platform: 'facebook', title: 'Médiathèque — merci aux visiteurs' }] },
  ],

  pipeline: {
    brouillon: [
      { title: 'Prise de parole du maire — mobilisation du 21/07', platform: 'facebook', author: 'Petar N.', tag: 'Crise' },
    ],
    relecture: [
      { title: 'Complément transparence — coûts de voirie au mètre', platform: 'presse', author: 'Petar N.', tag: 'Fact-check' },
      { title: 'Post — ordre du jour du conseil de jeudi', platform: 'facebook', author: 'Stefan J.', tag: 'Vie municipale' },
    ],
    approuve: [
      { title: 'Récap hebdo — services en ligne rétablis', platform: 'x', author: 'Ana K.', tag: 'Info service' },
    ],
    planifie: [
      { title: 'Photos — visite médiathèque', platform: 'instagram', author: 'Petar N.', tag: 'Culture' },
      { title: 'Fiche — navette électrique septembre', platform: 'facebook', author: 'Stefan J.', tag: 'Transport' },
    ],
  },

  platformStats: [
    { platform: 'Facebook', portee: 76000, engagement: 3.9 },
    { platform: 'Instagram', portee: 34000, engagement: 5.2 },
    { platform: 'X', portee: 19000, engagement: 1.8 },
    { platform: 'Telegram', portee: 12000, engagement: 4.1 },
  ],
}
