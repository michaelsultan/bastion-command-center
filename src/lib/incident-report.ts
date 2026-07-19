import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CRISIS_BEATS, CRISIS_SCRIPT } from '@/data/crisis'
import type { CrisisScript } from '@/data/crisis'
import { formatNumber, formatReach } from '@/data'
import type { AlertItem, Severity, TenantData, TenantId } from '@/data/types'
import type { Lang } from '@/i18n/LanguageContext'
// Logo 55 LABS (blanc sur transparent), inliné en data URL pour jsPDF.addImage
import logo55LabsDataUrl from '@/assets/55labs-logo-white.png?inline'

// ─── Assainissement Latin-1 / WinAnsi ────────────────────────────────────────
// Les polices standard de jsPDF (helvetica, encodage WinAnsi/cp1252) couvrent
// les accents français mais pas les diacritiques roumains, polonais ou serbes.

const DIACRITICS: Record<string, string> = {
  // Roumain
  'ș': 's', 'Ș': 'S', 'ş': 's', 'Ş': 'S', 'ț': 't', 'Ț': 'T', 'ţ': 't', 'Ţ': 'T', 'ă': 'a', 'Ă': 'A',
  // Polonais
  'ł': 'l', 'Ł': 'L', 'ś': 's', 'Ś': 'S', 'ć': 'c', 'Ć': 'C', 'ź': 'z', 'Ź': 'Z', 'ż': 'z', 'Ż': 'Z',
  'ń': 'n', 'Ń': 'N', 'ą': 'a', 'Ą': 'A', 'ę': 'e', 'Ę': 'E',
  // Serbe / croate
  'č': 'c', 'Č': 'C', 'š': 's', 'Š': 'S', 'ž': 'z', 'Ž': 'Z', 'đ': 'd', 'Đ': 'D',
}

// Ponctuation et ligatures cp1252 sûres au-delà de Latin-1
const CP1252_EXTRA = new Set(['–', '—', '‘', '’', '‚', '“', '”', '„', '•', '…', '€', '‹', '›', '™', 'œ', 'Œ'])

export function sanitizeLatin1(input: string): string {
  return Array.from(input)
    .map((c) => {
      const mapped = DIACRITICS[c]
      if (mapped) return mapped
      if (c.charCodeAt(0) > 255 && !CP1252_EXTRA.has(c)) return '?'
      return c
    })
    .join('')
}

// ─── Modèle du rapport ───────────────────────────────────────────────────────

export interface IncidentReport {
  lang: Lang
  isSimulation: boolean
  incidentRef: string
  incidentTitle: string
  client: string
  contexte: string
  localisation: string
  periode: string
  gravite: string
  statut: string
  generatedAt: string
  synthese: string
  chronologie: { heure: string; evenement: string; operateur: string }[]
  alertes: { gravite: Severity; titre: string; source: string; statut: string }[]
  impact: { mentions: string; sentiment: string; portee: string; sources: string }
  mesures: string[]
  recommandations: string[]
  fileName: string
}

export interface CrisisSnapshot {
  active: boolean
  crisisTenantId: TenantId | null
  phase: number
  elapsed: number
  lastCrisis: { tenantId: TenantId; completed: boolean } | null
}

const SEVERITY_LABEL: Record<Lang, Record<Severity, string>> = {
  fr: { critique: 'Critique', elevee: 'Élevée', moyenne: 'Moyenne', faible: 'Faible' },
  en: { critique: 'Critical', elevee: 'High', moyenne: 'Medium', faible: 'Low' },
}

const STATUS_LABEL: Record<Lang, Record<string, string>> = {
  fr: { nouveau: 'Nouveau', en_cours: 'En cours', resolu: 'Résolu' },
  en: { nouveau: 'New', en_cours: 'In progress', resolu: 'Resolved' },
}

const CRISIS_RECOS: Record<Lang, string[]> = {
  fr: [
    'Poursuivre la surveillance renforcée des sujets sensibles pendant au moins 72 h (fréquence 15 min).',
    'Maintenir le filtrage renforcé des commentaires jusqu’au retour du sentiment net à son niveau de référence.',
    'Finaliser le signalement officiel auprès des plateformes et du CERT national, preuves archivées à l’appui.',
    'Vérifier l’activation de la MFA sur l’ensemble des comptes de l’équipe sous 24 h.',
    'Préparer une communication proactive si la rumeur repasse le seuil de viralité (éléments de langage validés).',
  ],
  en: [
    'Maintain enhanced monitoring of sensitive topics for at least 72 h (15 min frequency).',
    'Keep strengthened comment filtering until net sentiment returns to its baseline level.',
    'Finalize the official report to the platforms and the national CERT, with archived evidence attached.',
    'Verify MFA activation on all team accounts within 24 h.',
    'Prepare proactive communication if the rumor crosses the virality threshold again (validated talking points).',
  ],
}

const STANDING_RECOS: Record<Lang, string[]> = {
  fr: [
    'Maintenir la surveillance renforcée jusqu’à la clôture complète de l’incident.',
    'Vérifier l’activation de la MFA sur l’ensemble des comptes de l’équipe sous 24 h.',
    'Clôturer le post-mortem et mettre à jour les règles de détection automatique.',
    'Partager les indicateurs de compromission avec le CERT national.',
    'Conserver les preuves archivées en vue d’éventuelles suites judiciaires.',
  ],
  en: [
    'Maintain enhanced monitoring until the incident is fully closed.',
    'Verify MFA activation on all team accounts within 24 h.',
    'Complete the post-mortem and update the automatic detection rules.',
    'Share indicators of compromise with the national CERT.',
    'Keep the archived evidence for possible legal action.',
  ],
}

// Étapes considérées comme des contre-mesures (titres FR et EN)
const MEASURE_STEP =
  /contre-mesure|counter-measure|signalement|verrouillage|lockdown|réinitialis|filtrage|atténuation|mitigation|activation|suspension|suspended/i

function alertRows(alerts: AlertItem[], lang: Lang): IncidentReport['alertes'] {
  const order: Record<Severity, number> = { critique: 0, elevee: 1, moyenne: 2, faible: 3 }
  return [...alerts]
    .sort((a, b) => order[a.severity] - order[b.severity])
    .slice(0, 8)
    .map((a) => ({
      gravite: a.severity,
      titre: a.title,
      source: a.source,
      statut: STATUS_LABEL[lang][a.status] ?? a.status,
    }))
}

function sumReach(reaches: number[], lang: Lang): string {
  return `≈ ${formatReach(reaches.reduce((s, r) => s + r, 0), lang)} contacts`
}

/** Reconstruit la chronologie d'une crise (complète ou en cours à `elapsed`). */
function crisisChronologie(script: CrisisScript, elapsed: number, lang: Lang): IncidentReport['chronologie'] {
  const rows = script.steps
    .filter((s) => s.at <= elapsed)
    .map((s) => ({ heure: `T+${s.at} s`, evenement: `${s.title} — ${s.description}`, operateur: s.operator }))
  if (rows.length === 0) {
    rows.push({
      heure: 'T+0 s',
      evenement:
        lang === 'fr'
          ? 'Détection — pic de mentions anormal en cours d’analyse par le moteur de veille.'
          : 'Detection — abnormal mention spike being analyzed by the monitoring engine.',
      operateur: lang === 'fr' ? 'Système Bastion' : 'Bastion system',
    })
  }
  return rows
}

/**
 * Sélectionne la source du rapport :
 * 1. crise active sur ce tenant → état en direct (partiel selon elapsed) ;
 * 2. dernière crise de la session sur ce tenant → rapport complet de la simulation ;
 * 3. sinon → incident en cours du tenant (données de veille standard).
 */
export function buildIncidentReport(tenant: TenantData, crisis: CrisisSnapshot, lang: Lang = 'fr'): IncidentReport {
  const base = {
    lang,
    client: tenant.meta.name,
    contexte: tenant.meta.detail,
    localisation: tenant.meta.subtitle,
    periode: lang === 'fr' ? '13 – 19 juillet 2026' : 'July 13–19, 2026',
    generatedAt: '19/07/2026 09:41',
    fileName: `rapport-incident-${tenant.meta.id}-2026-07-19.pdf`,
  }
  const topSources = tenant.topSources.slice(0, 2).map((s) => s.name).join(' · ')

  // ── Cas 1 & 2 : simulation de crise (active ou terminée cette session) ──
  const isLive = crisis.active && crisis.crisisTenantId === tenant.meta.id
  const isAftermath = !isLive && crisis.lastCrisis?.tenantId === tenant.meta.id
  if (isLive || isAftermath) {
    const script = CRISIS_SCRIPT[lang][tenant.meta.id]
    const elapsed = isLive ? Math.max(crisis.elapsed, 0) : CRISIS_BEATS.response
    const liveAlerts = tenant.alerts.filter((a) => a.live).length
    const synthese = isLive
      ? lang === 'fr'
        ? `Une campagne de dénigrement coordonnée vise actuellement ${tenant.meta.name} : ${script.incidentSummary} ` +
          `Le dispositif Bastion a détecté l’attaque en temps réel, déclenché ${Math.max(liveAlerts, 1)} alerte(s) ` +
          `${crisis.phase >= 6 ? 'et activé le plan de réponse à T+28 s avec 6 contre-mesures.' : 'et ouvert un incident de niveau critique.'} ` +
          `Impact estimé à l’heure du rapport : vague de +${script.mentionsSpike} mentions supplémentaires, ` +
          `sentiment net dégradé de ${script.sentimentDrop} points, portée cumulée de l’ordre de ${formatReach(script.mentions.reduce((s, m) => s + m.reach, 0), lang)} contacts sur les contenus hostiles identifiés.`
        : `A coordinated smear campaign is currently targeting ${tenant.meta.name}: ${script.incidentSummary} ` +
          `The Bastion system detected the attack in real time, triggered ${Math.max(liveAlerts, 1)} alert(s) ` +
          `${crisis.phase >= 6 ? 'and activated the response plan at T+28 s with 6 counter-measures.' : 'and opened a critical-level incident.'} ` +
          `Estimated impact at report time: a wave of +${script.mentionsSpike} additional mentions, ` +
          `net sentiment down ${script.sentimentDrop} points, cumulative reach of about ${formatReach(script.mentions.reduce((s, m) => s + m.reach, 0), lang)} contacts on identified hostile content.`
      : lang === 'fr'
        ? `Le 19/07/2026, une campagne de dénigrement coordonnée a ciblé ${tenant.meta.name} : ${script.incidentSummary} ` +
          `Le dispositif Bastion a détecté l’attaque dès les premières secondes, déclenché 3 alertes (dont 1 critique) ` +
          `et activé le plan de réponse à T+28 s avec 6 contre-mesures. ` +
          `Impact estimé : +${script.mentionsSpike} mentions supplémentaires sur 24 h, sentiment net dégradé de ${script.sentimentDrop} points, ` +
          `portée cumulée de l’ordre de ${formatReach(script.mentions.reduce((s, m) => s + m.reach, 0), lang)} contacts sur les contenus hostiles. ` +
          `La propagation était en net repli à la fin de la simulation.`
        : `On 07/19/2026, a coordinated smear campaign targeted ${tenant.meta.name}: ${script.incidentSummary} ` +
          `The Bastion system detected the attack within seconds, triggered 3 alerts (including 1 critical) ` +
          `and activated the response plan at T+28 s with 6 counter-measures. ` +
          `Estimated impact: +${script.mentionsSpike} additional mentions over 24 h, net sentiment down ${script.sentimentDrop} points, ` +
          `cumulative reach of about ${formatReach(script.mentions.reduce((s, m) => s + m.reach, 0), lang)} contacts on hostile content. ` +
          `Propagation was clearly declining at the end of the simulation.`
    return {
      ...base,
      isSimulation: true,
      incidentRef: 'INC-LIVE-26',
      incidentTitle: script.incidentTitle,
      gravite: SEVERITY_LABEL[lang].critique,
      statut: isLive
        ? lang === 'fr' ? 'En cours — simulation' : 'In progress — simulation'
        : lang === 'fr' ? 'Plan de réponse activé — simulation' : 'Response plan activated — simulation',
      synthese,
      chronologie: crisisChronologie(script, elapsed, lang),
      alertes: alertRows(tenant.alerts.filter((a) => a.live), lang),
      impact: {
        mentions: `+${formatNumber(script.mentionsSpike, lang)}`,
        sentiment: `−${script.sentimentDrop} pts`,
        portee: sumReach(script.mentions.map((m) => m.reach), lang),
        sources: topSources,
      },
      mesures: isLive && crisis.phase < 6 ? [] : script.measures,
      recommandations: CRISIS_RECOS[lang],
    }
  }

  // ── Cas 3 : incident en cours standard ──
  const inc = tenant.incident
  const doneSteps = inc.steps.filter((s) => s.state === 'termine')
  const mesures = doneSteps
    .filter((s) => MEASURE_STEP.test(s.title))
    .concat(doneSteps)
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 6)
    .map((s) => `${s.title} — ${s.description.split('.')[0]}.`)
  const inProgress = inc.steps.filter((s) => s.state === 'en_cours').length
  return {
    ...base,
    isSimulation: false,
    incidentRef: inc.id,
    incidentTitle: inc.title,
    gravite: SEVERITY_LABEL[lang][inc.severity],
    statut: inc.status,
    synthese:
      lang === 'fr'
        ? `Incident ${inc.id} — ${inc.title}, détecté le ${inc.detected} sur l’espace ${tenant.meta.name}. ${inc.summary} ` +
          `À la date de génération de ce rapport, ${doneSteps.length} étape(s) du plan de réponse sont terminées ` +
          `et ${inProgress} est en cours. ` +
          `Sur les dernières 24 heures, l’espace compte ${formatNumber(tenant.kpis.mentions24h, lang)} mentions ` +
          `(sentiment net ${tenant.kpis.netSentiment > 0 ? '+' : ''}${tenant.kpis.netSentiment} %) et ${tenant.kpis.activeAlerts} alertes actives.`
        : `Incident ${inc.id} — ${inc.title}, detected on ${inc.detected} in the ${tenant.meta.name} workspace. ${inc.summary} ` +
          `As of this report's generation, ${doneSteps.length} response-plan step(s) are complete ` +
          `and ${inProgress} is in progress. ` +
          `Over the last 24 hours, the workspace shows ${formatNumber(tenant.kpis.mentions24h, lang)} mentions ` +
          `(net sentiment ${tenant.kpis.netSentiment > 0 ? '+' : ''}${tenant.kpis.netSentiment}%) and ${tenant.kpis.activeAlerts} active alerts.`,
    chronologie: inc.steps.map((s) => ({
      heure: s.time,
      evenement: `${s.title} — ${s.description}`,
      operateur: s.operator,
    })),
    alertes: alertRows(tenant.alerts, lang),
    impact: {
      mentions: formatNumber(tenant.kpis.mentions24h, lang),
      sentiment: `${tenant.kpis.netSentimentDelta > 0 ? '+' : ''}${tenant.kpis.netSentimentDelta} pts / 7 j`,
      portee: sumReach(tenant.mentions.map((m) => m.reach), lang),
      sources: topSources,
    },
    mesures,
    recommandations: STANDING_RECOS[lang],
  }
}

// ─── Rendu PDF ───────────────────────────────────────────────────────────────

const C = {
  ink: { r: 24, g: 24, b: 27 }, // zinc-900
  body: { r: 63, g: 63, b: 70 }, // zinc-600
  muted: { r: 113, g: 113, b: 122 }, // zinc-500
  sky: { r: 56, g: 189, b: 248 }, // sky-400
  red: { r: 239, g: 68, b: 68 },
  emerald: { r: 16, g: 185, b: 129 },
  amber: { r: 245, g: 158, b: 11 },
  orange: { r: 249, g: 115, b: 22 },
  band: { r: 12, g: 12, b: 15 },
  light: { r: 244, g: 244, b: 245 },
  border: { r: 212, g: 212, b: 216 },
}

const SEVERITY_RGB: Record<Severity, { r: number; g: number; b: number }> = {
  critique: C.red,
  elevee: C.orange,
  moyenne: C.amber,
  faible: C.muted,
}

const MARGIN = 14
const PAGE_W = 210
const PAGE_H = 297
const CONTENT_W = PAGE_W - MARGIN * 2

// Chaînes de l'habillage PDF (chrome), par langue
const PDF_STR = {
  fr: {
    subtitle: 'Centre de commandement digital',
    confidential: 'CONFIDENTIEL',
    title: "RAPPORT D'INCIDENT",
    simulation: 'SIMULATION',
    sections: {
      info: 'Informations générales',
      synthese: 'Synthèse exécutive',
      chrono: 'Chronologie des événements',
      alertes: 'Alertes déclenchées',
      impact: 'Impact estimé',
      mesures: 'Contre-mesures appliquées',
      recos: 'Recommandations',
    },
    infoLabels: ['Client / campagne', 'Contexte', 'Localisation', 'Période couverte', 'Niveau de gravité', 'Statut', 'Date de génération'],
    chronoHead: ['Heure', 'Événement', 'Opérateur'],
    alertsHead: ['Gravité', 'Titre', 'Source', 'Statut'],
    noAlerts: 'Aucune alerte déclenchée à ce stade',
    impactLabels: ['Mentions (24 h)', 'Sentiment net', 'Portée estimée', 'Principales sources'],
    noMesures: 'Plan de réponse en cours d’activation — les contre-mesures seront consignées dans la prochaine version du rapport.',
    footer: 'Généré par Bastion · 55 LABS le 19/07/2026 — Confidentiel, usage interne',
  },
  en: {
    subtitle: 'Digital Command Center',
    confidential: 'CONFIDENTIAL',
    title: 'INCIDENT REPORT',
    simulation: 'SIMULATION',
    sections: {
      info: 'General information',
      synthese: 'Executive summary',
      chrono: 'Event timeline',
      alertes: 'Triggered alerts',
      impact: 'Estimated impact',
      mesures: 'Applied counter-measures',
      recos: 'Recommendations',
    },
    infoLabels: ['Client / campaign', 'Context', 'Location', 'Covered period', 'Severity level', 'Status', 'Generation date'],
    chronoHead: ['Time', 'Event', 'Operator'],
    alertsHead: ['Severity', 'Title', 'Source', 'Status'],
    noAlerts: 'No alerts triggered at this stage',
    impactLabels: ['Mentions (24 h)', 'Net sentiment', 'Estimated reach', 'Top sources'],
    noMesures: 'Response plan being activated — counter-measures will be recorded in the next version of this report.',
    footer: 'Generated by Bastion · 55 LABS on 07/19/2026 — Confidential, internal use',
  },
} as const

interface DocWithTable extends jsPDF {
  lastAutoTable?: { finalY: number }
}

// Logo 55 LABS : 512×346 px → ratio largeur/hauteur ≈ 1,48
const LOGO_RATIO = 512 / 346

function footer(doc: jsPDF, page: number, total: number, text: string) {
  doc.setDrawColor(C.border.r, C.border.g, C.border.b)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(C.muted.r, C.muted.g, C.muted.b)
  doc.text(text, MARGIN, PAGE_H - 7)
  doc.text(`Page ${page} / ${total}`, PAGE_W - MARGIN, PAGE_H - 7, { align: 'right' })
}

export function exportIncidentReportPdf(report: IncidentReport): void {
  const S = PDF_STR[report.lang]
  const severityLabel = SEVERITY_LABEL[report.lang]
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }) as DocWithTable
  let y = 0

  // ── Bandeau d'en-tête ──
  doc.setFillColor(C.band.r, C.band.g, C.band.b)
  doc.rect(0, 0, PAGE_W, 26, 'F')
  // Logo 55 LABS (blanc sur transparent — lisible tel quel sur le bandeau sombre)
  const logoH = 9
  const logoW = logoH * LOGO_RATIO
  doc.addImage(logo55LabsDataUrl, 'PNG', MARGIN, 13 - logoH / 2, logoW, logoH)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  doc.text('BASTION', MARGIN + logoW + 4, 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(180, 180, 190)
  doc.text(S.subtitle, MARGIN + logoW + 4, 18.5)
  // Tag CONFIDENTIEL
  doc.setFillColor(C.red.r, C.red.g, C.red.b)
  doc.roundedRect(PAGE_W - MARGIN - 34, 9, 34, 8, 1.2, 1.2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(S.confidential, PAGE_W - MARGIN - 17, 14.4, { align: 'center' })

  y = 36

  // ── Titre ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(C.ink.r, C.ink.g, C.ink.b)
  doc.text(sanitizeLatin1(S.title), MARGIN, y)
  if (report.isSimulation) {
    const w = doc.getTextWidth(S.title) + 4
    doc.setFillColor(C.red.r, C.red.g, C.red.b)
    doc.roundedRect(MARGIN + w, y - 5.5, 30, 7, 1.2, 1.2, 'F')
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    doc.text(S.simulation, MARGIN + w + 15, y - 0.8, { align: 'center' })
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(C.muted.r, C.muted.g, C.muted.b)
  doc.text(sanitizeLatin1(`${report.incidentRef} — ${report.incidentTitle}`), MARGIN, y + 6)
  y += 14

  const sectionTitle = (num: string, title: string) => {
    if (y > PAGE_H - 42) {
      doc.addPage()
      y = MARGIN + 4
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(C.ink.r, C.ink.g, C.ink.b)
    doc.text(sanitizeLatin1(`${num} — ${title}`), MARGIN, y)
    doc.setFillColor(C.sky.r, C.sky.g, C.sky.b)
    doc.rect(MARGIN, y + 1.8, 22, 0.9, 'F')
    doc.setDrawColor(C.border.r, C.border.g, C.border.b)
    doc.setLineWidth(0.3)
    doc.line(MARGIN + 24, y + 2.2, PAGE_W - MARGIN, y + 2.2)
    y += 8
  }

  const bodyText = (text: string, size = 9.5, lh = 5) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    doc.setTextColor(C.body.r, C.body.g, C.body.b)
    const lines = doc.splitTextToSize(sanitizeLatin1(text), CONTENT_W) as string[]
    lines.forEach((line) => {
      if (y > PAGE_H - 20) {
        doc.addPage()
        y = MARGIN + 4
      }
      doc.text(line, MARGIN, y)
      y += lh
    })
  }

  // ── 01 — Informations générales ──
  sectionTitle('01', S.sections.info)
  const info: [string, string][] = [
    [S.infoLabels[0], report.client],
    [S.infoLabels[1], report.contexte],
    [S.infoLabels[2], report.localisation],
    [S.infoLabels[3], report.periode],
    [S.infoLabels[4], report.gravite],
    [S.infoLabels[5], report.statut],
    [S.infoLabels[6], report.generatedAt],
  ]
  info.forEach(([label, value], i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = MARGIN + col * (CONTENT_W / 2)
    const yy = y + row * 9
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(C.muted.r, C.muted.g, C.muted.b)
    doc.text(sanitizeLatin1(label.toUpperCase()), x, yy)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(C.ink.r, C.ink.g, C.ink.b)
    doc.text(sanitizeLatin1(value), x, yy + 4)
  })
  y += Math.ceil(info.length / 2) * 9 + 6

  // ── 02 — Synthèse exécutive ──
  sectionTitle('02', S.sections.synthese)
  bodyText(report.synthese)
  y += 4

  // ── 03 — Chronologie ──
  sectionTitle('03', S.sections.chrono)
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [[...S.chronoHead]],
    body: report.chronologie.map((r) => [sanitizeLatin1(r.heure), sanitizeLatin1(r.evenement), sanitizeLatin1(r.operateur)]),
    styles: { fontSize: 8.5, cellPadding: 2, textColor: [C.body.r, C.body.g, C.body.b], lineColor: [C.border.r, C.border.g, C.border.b], lineWidth: 0.2 },
    headStyles: { fillColor: [C.band.r, C.band.g, C.band.b], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: [C.light.r, C.light.g, C.light.b] },
    columnStyles: { 0: { cellWidth: 24, fontStyle: 'bold' }, 1: { cellWidth: 116 }, 2: { cellWidth: 'auto' } },
  })
  y = (doc.lastAutoTable?.finalY ?? y) + 8

  // ── 04 — Alertes déclenchées ──
  sectionTitle('04', S.sections.alertes)
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [[...S.alertsHead]],
    body: report.alertes.length
      ? report.alertes.map((a) => [severityLabel[a.gravite], sanitizeLatin1(a.titre), sanitizeLatin1(a.source), sanitizeLatin1(a.statut)])
      : [['—', S.noAlerts, '—', '—']],
    styles: { fontSize: 8.5, cellPadding: 2, textColor: [C.body.r, C.body.g, C.body.b], lineColor: [C.border.r, C.border.g, C.border.b], lineWidth: 0.2 },
    headStyles: { fillColor: [C.band.r, C.band.g, C.band.b], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: [C.light.r, C.light.g, C.light.b] },
    columnStyles: { 0: { cellWidth: 22, fontStyle: 'bold' }, 1: { cellWidth: 96 }, 2: { cellWidth: 38 }, 3: { cellWidth: 'auto' } },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        // Couleur par sévérité — indexée sur l'énum, pas sur le libellé traduit
        const sev = report.alertes[data.row.index]?.gravite
        const rgb = sev ? SEVERITY_RGB[sev] : undefined
        if (rgb) data.cell.styles.textColor = [rgb.r, rgb.g, rgb.b]
      }
    },
  })
  y = (doc.lastAutoTable?.finalY ?? y) + 8

  // ── 05 — Impact estimé ──
  sectionTitle('05', S.sections.impact)
  if (y > PAGE_H - 46) {
    doc.addPage()
    y = MARGIN + 4
  }
  const stats: [string, string][] = [
    [S.impactLabels[0], report.impact.mentions],
    [S.impactLabels[1], report.impact.sentiment],
    [S.impactLabels[2], report.impact.portee],
    [S.impactLabels[3], report.impact.sources],
  ]
  const boxW = CONTENT_W / 4 - 2
  stats.forEach(([label, value], i) => {
    const x = MARGIN + i * (boxW + 2.66)
    doc.setFillColor(C.light.r, C.light.g, C.light.b)
    doc.setDrawColor(C.border.r, C.border.g, C.border.b)
    doc.roundedRect(x, y, boxW, 20, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(C.muted.r, C.muted.g, C.muted.b)
    doc.text(sanitizeLatin1(label.toUpperCase()), x + 3, y + 5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(i === 3 ? 7 : 10)
    doc.setTextColor(C.ink.r, C.ink.g, C.ink.b)
    const val = sanitizeLatin1(value)
    const lines = doc.splitTextToSize(val, boxW - 5) as string[]
    doc.text(lines.slice(0, 2), x + 3, y + 11)
  })
  y += 28

  // ── 06 — Contre-mesures ──
  sectionTitle('06', S.sections.mesures)
  if (report.mesures.length === 0) {
    bodyText(S.noMesures)
  } else {
    report.mesures.forEach((m) => {
      if (y > PAGE_H - 22) {
        doc.addPage()
        y = MARGIN + 4
      }
      doc.setFillColor(C.emerald.r, C.emerald.g, C.emerald.b)
      doc.rect(MARGIN + 1, y - 3, 2.6, 2.6, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(C.body.r, C.body.g, C.body.b)
      const lines = doc.splitTextToSize(sanitizeLatin1(m), CONTENT_W - 8) as string[]
      doc.text(lines, MARGIN + 7, y)
      y += lines.length * 5 + 1.5
    })
  }
  y += 4

  // ── 07 — Recommandations ──
  sectionTitle('07', S.sections.recos)
  report.recommandations.forEach((r, i) => {
    if (y > PAGE_H - 22) {
      doc.addPage()
      y = MARGIN + 4
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(C.sky.r - 30, C.sky.g - 60, C.sky.b - 40)
    doc.text(`${i + 1}.`, MARGIN + 1, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(C.body.r, C.body.g, C.body.b)
    const lines = doc.splitTextToSize(sanitizeLatin1(r), CONTENT_W - 8) as string[]
    doc.text(lines, MARGIN + 8, y)
    y += lines.length * 5 + 1.5
  })

  // ── Pied de page sur chaque page ──
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    footer(doc, p, total, S.footer)
  }

  doc.save(report.fileName)
}
