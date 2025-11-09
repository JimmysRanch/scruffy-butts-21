'use client'

import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/Dashboard'
import { AppointmentScheduler } from '@/components/AppointmentScheduler'
import { CustomerManager } from '@/components/CustomerManager'
import { StaffManager } from '@/components/StaffManager'
import { PointOfSale } from '@/components/PointOfSale'
import { InventoryManager } from '@/components/InventoryManager'
import { Settings } from '@/components/Settings'
import { Navigation } from '@/components/Navigation'
import { GroomerStats } from '@/components/GroomerStats'
import { Finances } from '@/components/Finances'
import { NewAppointment } from '@/components/NewAppointment'
import { DashboardCustomization } from '@/components/DashboardCustomization'
import { AppointmentDetail } from '@/components/AppointmentDetail'
import { AppointmentCheckout } from '@/components/AppointmentCheckout'
import { KiraKiraEffect } from '@/components/KiraKiraEffect'

type View =
  | 'dashboard'
  | 'appointments'
  | 'customers'
  | 'staff'
  | 'pos'
  | 'inventory'
  | 'finances'
  | 'reports'
  | 'settings'
  | 'new-appointment'
  | 'add-pet'
  | 'edit-pet'
  | 'customize-dashboard'
  | 'appointment-detail'
  | 'appointment-checkout'

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
  showWelcomeMessage: boolean
  enableKiraKira: boolean
}

const VALID_VIEWS: View[] = [
  'dashboard',
  'appointments',
  'customers',
  'staff',
  'pos',
  'inventory',
  'finances',
  'reports',
  'settings',
  'new-appointment',
  'add-pet',
  'edit-pet',
  'customize-dashboard',
  'appointment-detail',
  'appointment-checkout',
]

export default function App() {
  // STATE

  // Start on dashboard; read URL on client after mount
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

  // Temporary in-memory state instead of Spark useKV (so it won't crash in Next/Vercel)
  const [appointments] = useState<any[]>([])
  const [appearance] = useState<AppearanceSettings>({
    theme: 'light',
    compactMode: false,
    showWelcomeMessage: true,
    enableKiraKira: true,
  })

  // EFFECT: Read URL params on first client render
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view') as View | null
    const appointmentIdParam = params.get('appointmentId')

    if (viewParam && VALID_VIEWS.includes(viewParam)) {
      setCurrentView(viewParam)
    }

    if (appointmentIdParam) {
      setSelectedAppointmentId(appointmentIdParam)
    }
  }, [])

  // EFFECT: Sync URL when view / selected appointment changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)

    if (currentView !== 'dashboard') {
      params.set('view', currentView)

      if (
        (currentView === 'appointment-detail' || currentView === 'appointment-checkout') &&
        selectedAppointmentId
      ) {
        params.set('appointmentId', selectedAppointmentId)
      } else {
        params.delete('appointmentId')
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, '', newUrl)
    } else {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [currentView, selectedAppointmentId])

  // EFFECT: Theme handling
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const theme = appearance?.theme || 'light'

    const applyTheme = (isDark: boolean) => {
      if (isDark) root.classList.add('dark')
      else root.classList.remove('dark')
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handleChange)

      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [appearance?.theme])

  // VIEW RENDERER

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />
      case 'appointments':
        return (
          <AppointmentScheduler
            onNavigateToNewAppointment={() => setCurrentView('new-appointment')}
            onNavigateToDetail={(appointmentId: string) => {
              setSelectedAppointmentId(appointmentId)
              setCurrentView('appointment-detail')
            }}
          />
        )
      case 'appointment-detail':
        if (!selectedAppointmentId) {
          setCurrentView('appointments')
          return null
        }
        return (
          <AppointmentDetail
            appointmentId={selectedAppointmentId}
            onBack={() => setCurrentView('appointments')}
            onEdit={() => setCurrentView('appointments')}
            onNavigateToCheckout={(appointmentId: string) => {
              setSelectedAppointmentId(appointmentId)
              setCurrentView('appointment-checkout')
            }}
          />
        )
      case 'appointment-checkout':
        if (!selectedAppointmentId) {
          setCurrentView('appointments')
          return null
        }
        const checkoutAppointment = (appointments || []).find(
          (apt) => apt.id === selectedAppointmentId
        )
        if (!checkoutAppointment) {
          setCurrentView('appointments')
          return null
        }
        return (
          <AppointmentCheckout
            appointment={checkoutAppointment}
            onBack={() => setCurrentView('appointment-detail')}
            onComplete={() => {
              setCurrentView('appointments')
              setSelectedAppointmentId(null)
            }}
          />
        )
      case 'customers':
        return <CustomerManager />
      case 'staff':
        return <StaffManager />
      case 'pos':
        return <PointOfSale />
      case 'inventory':
        return <InventoryManager />
      case 'finances':
        return <Finances />
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

  // LAYOUT

  return (
    <div className="min-h-[100svh] md:min-h-[100dvh] relative">
      {(appearance?.enableKiraKira ?? true) && <KiraKiraEffect />}
      <Navigation
        currentView={currentView}
        onNavigate={setCurrentView}
        isCompact={isCompact}
      />
      <main className="pt-24 w-full px-4 max-w-[2000px] mx-auto pb-8 relative z-10">
        {renderView()}
      </main>
    </div>
  )
}
