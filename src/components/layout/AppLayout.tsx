import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'
import {
  Bell,
  Building2,
  Check,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  LayoutDashboard,
  Megaphone,
  Radar,
  Shield,
  ShieldCheck,
  Siren,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTenant } from '@/context/TenantContext'
import { useCrisis, useEffectiveTenant } from '@/context/CrisisContext'
import { useLiveAlerts } from '@/context/LiveAlertsContext'
import { CrisisBanner } from '@/components/CrisisBanner'
import { TENANT_DATA, TENANT_ORDER } from '@/data'
import type { ThreatLevel } from '@/data/types'
import { cn } from '@/lib/utils'

const THREAT_DOT: Record<ThreatLevel, string> = {
  FAIBLE: 'bg-emerald-500',
  'MODÉRÉ': 'bg-amber-500',
  'ÉLEVÉ': 'bg-orange-500',
  CRITIQUE: 'bg-red-500',
}

const AGENCE_ITEMS = [{ to: '/agence', label: 'Vue agence', icon: Building2 }]

const NAV_ITEMS = [
  { to: '/', label: 'Vue d’ensemble', icon: LayoutDashboard, end: true },
  { to: '/securite', label: 'Sécurité', icon: ShieldCheck },
  { to: '/veille', label: 'Veille & Réputation', icon: Radar },
  { to: '/alertes', label: 'Alertes & Incidents', icon: Siren },
  { to: '/contenu', label: 'Contenu & Campagne', icon: Megaphone, tag: 'Phase 2' },
  { to: '/equipe', label: 'Équipe & Accès', icon: Users },
]

type NavItemDef = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  tag?: string
}

function SectionLabel({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  return (
    <>
      <p
        className={cn(
          'truncate px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-600',
          collapsed ? 'hidden' : 'hidden lg:block',
        )}
      >
        {children}
      </p>
      <div className={cn('mx-1 mb-1 mt-3 h-px bg-zinc-800', collapsed ? 'block' : 'lg:hidden')} />
    </>
  )
}

function NavItemLink({ item, collapsed, activeAlerts }: { item: NavItemDef; collapsed: boolean; activeAlerts: number }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={item.label}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-sky-400/10 text-sky-400 shadow-[inset_2px_0_0_0] shadow-sky-400'
            : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100',
        )
      }
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      <span className={cn('min-w-0 flex-1 truncate', collapsed ? 'hidden' : 'hidden lg:inline')}>{item.label}</span>
      {item.tag && (
        <span
          className={cn(
            'rounded border border-zinc-700 px-1 text-[9px] font-semibold uppercase tracking-wide text-zinc-500',
            collapsed ? 'hidden' : 'hidden lg:inline',
          )}
        >
          {item.tag}
        </span>
      )}
      {item.to === '/alertes' && activeAlerts > 0 && (
        <span
          className={cn(
            'flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white',
            collapsed && 'absolute ml-5 -mt-4 lg:static lg:ml-0 lg:mt-0',
            collapsed ? '' : 'hidden lg:flex',
          )}
        >
          {activeAlerts}
        </span>
      )}
    </NavLink>
  )
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="hidden text-right md:block">
      <p className="font-mono text-sm font-medium tabular-nums text-zinc-200">
        {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="text-[11px] text-zinc-500">dimanche 19 juillet 2026</p>
    </div>
  )
}

function TenantSwitcher() {
  const { tenant, tenantId, setTenant } = useTenant()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-auto max-w-full justify-between gap-3 border-zinc-700 bg-zinc-900 px-3 py-2 text-left hover:bg-zinc-800 hover:text-zinc-100"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={cn('h-2 w-2 shrink-0 rounded-full', THREAT_DOT[tenant.threat.level])} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">{tenant.meta.name}</p>
              <p className="truncate text-[11px] text-zinc-500">{tenant.meta.subtitle}</p>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 border-zinc-700 bg-zinc-900 text-zinc-100">
        <DropdownMenuLabel className="text-xs font-normal text-zinc-500">
          Espace de travail — sélection du tenant
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        {TENANT_ORDER.map((id) => {
          const t = TENANT_DATA[id]
          const active = id === tenantId
          return (
            <DropdownMenuItem
              key={id}
              onClick={() => setTenant(id)}
              className="flex cursor-pointer items-start gap-2.5 px-2 py-2.5 focus:bg-zinc-800 focus:text-zinc-100"
            >
              <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', THREAT_DOT[t.threat.level])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.meta.name}</p>
                <p className="truncate text-xs text-zinc-500">{t.meta.subtitle}</p>
                <p className="truncate text-[11px] text-zinc-600">{t.meta.detail}</p>
              </div>
              {active && <Check className="mt-1 h-4 w-4 shrink-0 text-sky-400" />}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator className="bg-zinc-800" />
        <p className="px-2 py-1.5 text-[11px] text-zinc-600">Isolation stricte des données par tenant — Bastion Agency</p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppLayout() {
  const { tenant } = useTenant()
  const effTenant = useEffectiveTenant()
  const { active: crisisActive, start: startCrisis, stop: stopCrisis } = useCrisis()
  const { countsForTenant } = useLiveAlerts()
  const [collapsed, setCollapsed] = useState(false)
  // Alertes automatiques GDELT du tenant courant (non résolues), ajoutées aux compteurs
  const liveCounts = countsForTenant(tenant.meta.id)
  const activeAlertsTotal = effTenant.kpis.activeAlerts + liveCounts.active
  const criticalAlertsTotal = effTenant.kpis.criticalAlerts + liveCounts.critical

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* ─── Barre latérale ─── */}
      <aside
        className={cn(
          'sticky top-0 flex h-screen shrink-0 flex-col border-r border-zinc-800 bg-[#0c0c0f] transition-[width] duration-200',
          collapsed ? 'w-16' : 'w-16 lg:w-64',
        )}
      >
        <div className={cn('flex items-center gap-3 border-b border-zinc-800 px-4 py-4', collapsed && 'justify-center px-2')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10">
            <Shield className="h-5 w-5 text-sky-400" />
          </div>
          <div className={cn('min-w-0', collapsed ? 'hidden' : 'hidden lg:block')}>
            <p className="text-sm font-bold tracking-[0.18em] text-zinc-50">BASTION</p>
            <p className="truncate text-[10px] leading-tight text-zinc-500">Centre de commandement digital</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          <SectionLabel collapsed={collapsed}>Agence</SectionLabel>
          {AGENCE_ITEMS.map((item) => (
            <NavItemLink key={item.to} item={item} collapsed={collapsed} activeAlerts={activeAlertsTotal} />
          ))}
          <SectionLabel collapsed={collapsed}>Espace client — {tenant.meta.name}</SectionLabel>
          {NAV_ITEMS.map((item) => (
            <NavItemLink key={item.to} item={item} collapsed={collapsed} activeAlerts={activeAlertsTotal} />
          ))}
        </nav>

        <div className="border-t border-zinc-800 p-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'hidden w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-800/70 hover:text-zinc-200 lg:flex',
              collapsed && 'justify-center px-0',
            )}
            title={collapsed ? 'Déplier le menu' : 'Replier le menu'}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && <span>Replier</span>}
          </button>
          <p className={cn('px-3 py-2 text-[10px] text-zinc-600', collapsed && 'hidden')}>
            Bastion v0.9 — prototype de démonstration
          </p>
        </div>
      </aside>

      {/* ─── Colonne principale ─── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <div className="w-64 min-w-0 max-w-[40vw]">
              <TenantSwitcher />
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={crisisActive ? stopCrisis : startCrisis}
                className={cn(
                  'border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300',
                  crisisActive && 'bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
                )}
              >
                <Siren className={cn('mr-2 h-4 w-4', crisisActive && 'animate-pulse')} />
                <span className="hidden sm:inline">{crisisActive ? 'Terminer la simulation' : 'Simuler une crise'}</span>
              </Button>
              <div className="hidden items-center gap-2 lg:flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs text-zinc-400">Dernière synchro il y a 2 min</span>
              </div>
              <div className="hidden h-6 w-px bg-zinc-800 lg:block" />
              <LiveClock />
              <div className="hidden h-6 w-px bg-zinc-800 md:block" />
              <button className="relative rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" title="Notifications">
                <Bell className="h-[18px] w-[18px]" />
                {criticalAlertsTotal > 0 && (
                  <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                    {criticalAlertsTotal}
                  </span>
                )}
              </button>
              <Avatar className="h-8 w-8 border border-zinc-700">
                <AvatarFallback className="bg-sky-400/15 text-xs font-semibold text-sky-400">OP</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <CrisisBanner />

        <main className="ops-grid flex-1 px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
