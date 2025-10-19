import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Dashboard } from '@/components/Dashboard'
import { AppointmentScheduler } from '@/components/AppointmentScheduler'
import { CustomerManager } from '@/components/CustomerManager'
import { StaffManager } from '@/components/StaffManager'
import { PointOfSale } from '@/components/PointOfSale'
import { InventoryManager } from '@/components/InventoryManager'
import { Settings } from '@/components/Settings'
import { Navigation } from '@/components/Navigation'
import { GroomerStats } from '@/components/GroomerStats'
import { NewAppointment } from '@/components/NewAppointment'
import { DashboardCustomization } from '@/components/DashboardCustomization'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'reports' | 'settings' | 'new-appointment' | 'add-pet' | 'edit-pet' | 'customize-dashboard'

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
  showWelcomeMessage: boolean
}

function App() {
  const [currentView, setCurrentView] = useState<View>(() => {
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view') as View | null
    return view && ['dashboard', 'appointments', 'customers', 'staff', 'pos', 'inventory', 'reports', 'settings', 'new-appointment', 'add-pet', 'edit-pet', 'customize-dashboard'].includes(view)
      ? view
      : 'dashboard'
  })
  const [appearance] = useKV<AppearanceSettings>('appearance-settings', {
    theme: 'light',
    compactMode: false,
    showWelcomeMessage: true
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (currentView !== 'dashboard') {
      params.set('view', currentView)
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, '', newUrl)
    } else {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [currentView])

  useEffect(() => {
    const root = document.documentElement
    const theme = appearance?.theme || 'light'
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)
      
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [appearance?.theme])

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />
      case 'appointments':
        return <AppointmentScheduler onNavigateToNewAppointment={() => setCurrentView('new-appointment')} />
      case 'customers':
        return <CustomerManager />
      case 'staff':
        return <StaffManager />
      case 'pos':
        return <PointOfSale />
      case 'inventory':
        return <InventoryManager />
      case 'reports':
        return <GroomerStats />
      case 'settings':
        return <Settings />
      case 'new-appointment':
        return <NewAppointment onBack={() => setCurrentView('appointments')} />
      case 'customize-dashboard':
        return <DashboardCustomization onBack={() => setCurrentView('dashboard')} />
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  const isCompact = appearance?.compactMode || false

  return (
    <div className="min-h-[100svh] md:min-h-[100dvh] relative">
      <Navigation currentView={currentView} onNavigate={setCurrentView} isCompact={isCompact} />
      <main className="pt-24 w-full px-4 max-w-[2000px] mx-auto pb-8 relative z-10">
        {renderView()}
      </main>
      <Toaster />
    </div>
  )
}

export default App