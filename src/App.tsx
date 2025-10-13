import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Dashboard } from '@/components/Dashboard'
import { AppointmentScheduler } from '@/components/AppointmentScheduler'
import { CustomerManager } from '@/components/CustomerManager'
import { StaffManager } from '@/components/StaffManager'
import { PointOfSale } from '@/components/PointOfSale'
import { Settings } from '@/components/Settings'
import { Navigation } from '@/components/Navigation'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'settings'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')

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
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
      <main className="container mx-auto px-4 py-6">
        {renderView()}
      </main>
      <Toaster />
    </div>
  )
}

export default App