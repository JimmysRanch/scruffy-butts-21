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

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'reports' | 'settings'

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
        return <AppointmentScheduler />
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
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  const isCompact = appearance?.compactMode || false

  return (
    <div className="min-h-screen">
      <Navigation currentView={currentView} onNavigate={setCurrentView} isCompact={isCompact} />
      <main className={`w-full px-3 md:px-4 lg:px-5 xl:px-6 max-w-[2000px] mx-auto ${isCompact ? 'py-1.5' : 'py-2 sm:py-3'}`}>
        {renderView()}
      </main>
      <Toaster />
    </div>
  )
}

export default App