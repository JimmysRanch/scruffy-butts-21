import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, ChartBar, Clock, Dog } from '@phosphor-icons/react'
import { isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { RevenueGaugeWidget } from '@/components/widgets/RevenueGaugeWidget'
import { BookedWidget } from '@/components/widgets/BookedWidget'
import { RecentActivity } from '@/components/RecentActivity'
import { seedActivityData } from '@/lib/seed-activity-data'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'settings'

interface AppearanceSettings {
  compactMode?: boolean
  showWelcomeMessage?: boolean
}

interface DashboardProps {
  onNavigate: (view: View) => void
}

interface Appointment {
  id: string
  customerId: string
  petId: string
  serviceIds: string[]
  staffId: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
}

interface Customer {
  id: string
  name: string
}

interface Pet {
  id: string
  name: string
  customerId: string
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [pets] = useKV<Pet[]>('pets', [])
  const [appearance] = useKV<AppearanceSettings>('appearance-settings', {})

  useEffect(() => {
    seedActivityData()
  }, [])

  const isCompact = appearance?.compactMode || false

  const today = new Date()
  const todayAppointments = (appointments || []).filter(apt => 
    isToday(new Date(apt.date)) && apt.status !== 'cancelled'
  )

  const weekStart = startOfWeek(today, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
  const weekAppointments = (appointments || []).filter(apt =>
    isWithinInterval(new Date(apt.date), { start: weekStart, end: weekEnd }) && 
    apt.status !== 'cancelled'
  )

  const getCustomerName = (customerId: string) => {
    return customers?.find(c => c.id === customerId)?.name || 'Unknown'
  }

  const getPetName = (petId: string) => {
    return pets?.find(p => p.id === petId)?.name || 'Unknown'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
      case 'completed':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border border-gray-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
      case 'no-show':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30'
      default:
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 [grid-auto-rows:minmax(4rem,auto)] gap-3">
        <div className="glass-widget glass-card-hover cursor-pointer rounded-2xl min-w-0" onClick={() => onNavigate('appointments')}>
          <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3">
            <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/90">Today's Appointments</h3>
          </div>
          <div className="pb-2 pt-1 px-3 min-w-0">
            <div className="text-2xl font-bold bg-gradient-to-br from-accent via-primary to-accent bg-clip-text text-transparent">
              {todayAppointments.length}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-medium">
              {todayAppointments.length === 1 ? 'appointment' : 'appointments'} scheduled
            </p>
          </div>
        </div>

        <div className="glass-widget glass-card-hover cursor-pointer rounded-2xl min-w-0" onClick={() => onNavigate('customers')}>
          <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3">
            <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/90">Total Customers</h3>
          </div>
          <div className="pb-2 pt-1 px-3 min-w-0">
            <div className="text-2xl font-bold bg-gradient-to-br from-accent via-primary to-accent bg-clip-text text-transparent">
              {customers?.length || 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-medium">
              Active {customers?.length === 1 ? 'customer' : 'customers'}
            </p>
          </div>
        </div>

        <div className="glass-widget glass-card-hover cursor-pointer rounded-2xl min-w-0" onClick={() => onNavigate('appointments')}>
          <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3">
            <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/90">This Week</h3>
          </div>
          <div className="pb-2 pt-1 px-3 min-w-0">
            <div className="text-2xl font-bold bg-gradient-to-br from-accent via-primary to-accent bg-clip-text text-transparent">
              {weekAppointments.length}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-medium">
              {weekAppointments.length === 1 ? 'appointment' : 'appointments'} this week
            </p>
          </div>
        </div>
        
        <div className="glass-widget glass-card-hover cursor-pointer rounded-2xl min-w-0">
          <BookedWidget />
        </div>

        <RevenueGaugeWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <RecentActivity />
        
        <div className="glass-card rounded-2xl @container min-w-0">
          <div className="pb-3 pt-5 px-5">
            <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground">
              <div className="p-2 rounded-xl bg-gradient-to-br from-accent/20 via-primary/20 to-accent/20 ring-1 ring-white/10 shrink-0">
                <Calendar className="h-5 w-5 text-accent" weight="duotone" />
              </div>
              <span className="truncate">Today's Schedule</span>
            </h2>
            <p className="truncate text-xs font-medium text-muted-foreground mt-1">Appointments scheduled for today</p>
          </div>
          <div className="min-w-0 px-5 pb-5">
            {todayAppointments.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="w-fit mx-auto p-5 rounded-2xl mb-4 bg-white/5 ring-1 ring-white/10">
                  <Dog className="h-12 w-12 opacity-40 text-muted-foreground" weight="duotone" />
                </div>
                <p className="text-sm font-medium">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayAppointments.slice(0, 6).map((apt) => (
                  <div key={apt.id} className="rounded-xl border border-white/10 hover:border-accent/50 hover:bg-white/5 transition-all duration-200 p-3.5 min-w-0 backdrop-blur-sm">
                    <div className="flex flex-col @[480px]:flex-row @[480px]:items-center justify-between gap-2.5 min-w-0">
                      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 font-semibold min-w-[70px] bg-accent/20 text-accent px-3 py-1.5 rounded-lg shrink-0 text-sm ring-1 ring-accent/30">
                          <Clock size={15} weight="duotone" />
                          {apt.time}
                        </div>
                        <div className="min-w-0 overflow-hidden">
                          <div className="font-semibold truncate text-sm text-foreground">{getPetName(apt.petId)}</div>
                          <div className="text-muted-foreground text-xs truncate font-medium">{getCustomerName(apt.customerId)}</div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(apt.status)} shrink-0 self-start @[480px]:self-center text-[10px] px-2.5 py-1 font-semibold`}>
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}