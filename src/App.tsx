import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Dashboard } from '@/components/Dashboard'
import { AppointmentScheduler } from '@/components/AppointmentScheduler'
import { CustomerManager } from '@/components/CustomerManager'
import { StaffManager } from '@/components/StaffManager'
import { PointOfSale } from '@/components/PointOfSale'
import { Reports } from '@/components/Reports'
import { Settings } from '@/components/Settings'
import { Navigation } from '@/components/Navigation'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'reports' | 'settings'

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
  showWelcomeMessage: boolean
}

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [appearance] = useKV<AppearanceSettings>('appearance-settings', {
    theme: 'light',
    compactMode: false,
    showWelcomeMessage: true
  })

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />
      case 'appointments':
        return <AppointmentScheduler />
      case 'customers':
        return <CustomerManager />
      case 'staff':
        return <StaffManager />
      case 'pos':
        return <PointOfSale />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  const isCompact = appearance?.compactMode || false

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onNavigate={setCurrentView} isCompact={isCompact} />
      <main className={`container mx-auto px-4 ${isCompact ? 'py-3' : 'py-6'}`}>
        {renderView()}
      </main>
      <Toaster />
    </div>
  )
}

export default App