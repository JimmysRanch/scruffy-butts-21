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
    <div className="space-y-3">
      <div className="grid grid-cols-5 [grid-auto-rows:minmax(4rem,auto)] gap-2">
        <Card className="glass cursor-pointer hover:glass-dark border-white/20 min-w-0" onClick={() => onNavigate('appointments')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-1.5 px-2.5">
            <CardTitle className="text-[11px] font-medium truncate">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent className="pb-1 pt-0.5 px-2.5 min-w-0">
            <div className="text-base font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              {todayAppointments.length}
            </div>
            <p className="text-[9px] text-muted-foreground mt-0 truncate">
              {todayAppointments.length === 1 ? 'appointment' : 'appointments'} scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="glass cursor-pointer hover:glass-dark border-white/20 min-w-0" onClick={() => onNavigate('customers')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-1.5 px-2.5">
            <CardTitle className="text-[11px] font-medium truncate">Total Customers</CardTitle>
          </CardHeader>
          <CardContent className="pb-1 pt-0.5 px-2.5 min-w-0">
            <div className="text-base font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              {customers?.length || 0}
            </div>
            <p className="text-[9px] text-muted-foreground mt-0 truncate">
              Active {customers?.length === 1 ? 'customer' : 'customers'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass cursor-pointer hover:glass-dark border-white/20 min-w-0" onClick={() => onNavigate('appointments')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-1.5 px-2.5">
            <CardTitle className="text-[11px] font-medium truncate">This Week</CardTitle>
          </CardHeader>
          <CardContent className="pb-1 pt-0.5 px-2.5 min-w-0">
            <div className="text-base font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              {weekAppointments.length}
            </div>
            <p className="text-[9px] text-muted-foreground mt-0 truncate">
              {weekAppointments.length === 1 ? 'appointment' : 'appointments'} this week
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass cursor-pointer hover:glass-dark border-white/20 min-w-0">
          <BookedWidget />
        </Card>

        <RevenueGaugeWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <RecentActivity />
        
        <Card className="frosted border-white/20 @container min-w-0">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="glass-dark p-1.5 rounded-lg shrink-0">
                <Calendar className="h-4 w-4" weight="fill" />
              </div>
              <span className="truncate">Today's Schedule</span>
            </CardTitle>
            <CardDescription className="truncate text-xs">Appointments scheduled for today</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 px-4 pb-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="glass-dark w-fit mx-auto p-4 rounded-2xl mb-3">
                  <Dog className="h-10 w-10 opacity-50" weight="fill" />
                </div>
                <p className="text-sm">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayAppointments.slice(0, 6).map((apt) => (
                  <div key={apt.id} className="glass-dark rounded-lg border border-white/20 hover:glass transition-all duration-200 p-3 min-w-0">
                    <div className="flex flex-col @[480px]:flex-row @[480px]:items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1.5 font-medium min-w-[65px] glass-dark px-2.5 py-1 rounded-lg shrink-0 text-sm">
                          <Clock size={14} weight="fill" />
                          {apt.time}
                        </div>
                        <div className="min-w-0 overflow-hidden">
                          <div className="font-medium truncate text-sm">{getPetName(apt.petId)}</div>
                          <div className="text-muted-foreground text-xs truncate">{getCustomerName(apt.customerId)}</div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(apt.status)} backdrop-blur-sm shrink-0 self-start @[480px]:self-center text-[10px] px-2 py-0.5`}>
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}