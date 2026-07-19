// ─── Bastion — types du domaine ──────────────────────────────────────────────

export type TenantId = 'marinescu' | 'kowalska' | 'novaria'

export interface TenantMeta {
  id: TenantId
  name: string
  subtitle: string
  detail: string
  initials: string
}

export type ThreatLevel = 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'CRITIQUE'
export type Severity = 'critique' | 'elevee' | 'moyenne' | 'faible'
export type Sentiment = 'positif' | 'neutre' | 'negatif'
export type AlertStatus = 'nouveau' | 'en_cours' | 'resolu'
export type SourceType = 'facebook' | 'x' | 'telegram' | 'presse' | 'forum' | 'instagram'
export type AssetType = 'Site web' | 'Domaine' | 'Compte social' | 'Email' | 'Outil'
export type AssetStatus = 'Protégé' | 'À surveiller' | 'Vulnérable'
export type CheckStatus = 'ok' | 'avertissement' | 'critique'

export interface Kpis {
  securityScore: number
  securityScoreDelta: number
  mentions24h: number
  mentionsDelta: number
  netSentiment: number
  netSentimentDelta: number
  activeAlerts: number
  criticalAlerts: number
}

export interface SentimentPoint {
  date: string
  positif: number
  neutre: number
  negatif: number
}

export interface AlertItem {
  id: string
  severity: Severity
  title: string
  source: string
  time: string
  status: AlertStatus
  live?: boolean
}

export interface IncidentStep {
  time: string
  title: string
  description: string
  operator: string
  state: 'termine' | 'en_cours' | 'a_venir'
}

export interface Incident {
  id: string
  title: string
  severity: Severity
  status: string
  detected: string
  summary: string
  steps: IncidentStep[]
}

export interface Mention {
  id: string
  source: SourceType
  author: string
  excerpt: string
  sentiment: Sentiment
  reach: number
  time: string
  topic: string
  live?: boolean
}

export interface HeatmapRow {
  topic: string
  positif: number
  neutre: number
  negatif: number
  risque: number
}

export interface TopSource {
  name: string
  type: SourceType
  mentions: number
  negativity: number
}

export interface DailyBrief {
  dateLabel: string
  generatedAt: string
  synthese: string[]
  signauxFaibles: string[]
  incidents: string[]
  recommandations: string[]
}

export interface Asset {
  name: string
  type: AssetType
  status: AssetStatus
  score: number
  lastCheck: string
}

export interface SecurityCheckItem {
  label: string
  status: CheckStatus
  detail: string
  lastRun: string
}

export interface StressTestPoint {
  label: string
  ok: boolean
}

export interface StressTest {
  readiness: number
  lastRun: string
  points: StressTestPoint[]
}

export interface TeamMember {
  name: string
  role: string
  email: string
  mfa: boolean
  lastActive: string
  initials: string
}

export interface AuditEntry {
  time: string
  actor: string
  action: string
  type: 'securite' | 'compte' | 'contenu' | 'alerte'
}

export interface CharterStatus {
  signed: number
  total: number
  pending: string[]
  lastUpdate: string
}

export interface CampaignEvent {
  time: string
  title: string
  location: string
  type: 'terrain' | 'media' | 'reunion'
}

export interface WeekPost {
  time: string
  platform: SourceType
  title: string
}

export interface WeekDay {
  day: string
  date: string
  today?: boolean
  posts: WeekPost[]
}

export interface ContentCard {
  title: string
  platform: SourceType
  author: string
  tag: string
}

export interface Pipeline {
  brouillon: ContentCard[]
  relecture: ContentCard[]
  approuve: ContentCard[]
  planifie: ContentCard[]
}

export interface PlatformStat {
  platform: string
  portee: number
  engagement: number
}

export interface TenantData {
  meta: TenantMeta
  threat: { level: ThreatLevel; summary: string; updatedAt: string }
  kpis: Kpis
  sentimentTrend: SentimentPoint[]
  alerts: AlertItem[]
  incident: Incident
  mentions: Mention[]
  heatmap: HeatmapRow[]
  topSources: TopSource[]
  brief: DailyBrief
  assets: Asset[]
  checks: SecurityCheckItem[]
  stressTest: StressTest
  team: TeamMember[]
  audit: AuditEntry[]
  charter: CharterStatus
  events: CampaignEvent[]
  week: WeekDay[]
  pipeline: Pipeline
  platformStats: PlatformStat[]
}
