import { Route, Routes } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { CrisisProvider } from '@/context/CrisisContext'
import { LiveAlertsProvider } from '@/context/LiveAlertsContext'
import { TenantProvider } from '@/context/TenantContext'
import AgencePage from '@/pages/AgencePage'
import AlertesPage from '@/pages/AlertesPage'
import ContenuPage from '@/pages/ContenuPage'
import DashboardPage from '@/pages/DashboardPage'
import EquipePage from '@/pages/EquipePage'
import SecuritePage from '@/pages/SecuritePage'
import VeillePage from '@/pages/VeillePage'

export default function App() {
  return (
    <TenantProvider>
      <CrisisProvider>
        <LiveAlertsProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/agence" element={<AgencePage />} />
              <Route path="/" element={<DashboardPage />} />
              <Route path="/securite" element={<SecuritePage />} />
              <Route path="/veille" element={<VeillePage />} />
              <Route path="/alertes" element={<AlertesPage />} />
              <Route path="/contenu" element={<ContenuPage />} />
              <Route path="/equipe" element={<EquipePage />} />
            </Route>
          </Routes>
          <Toaster theme="dark" position="bottom-right" />
        </LiveAlertsProvider>
      </CrisisProvider>
    </TenantProvider>
  )
}
