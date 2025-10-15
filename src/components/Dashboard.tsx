import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, ChartBar, Clock, Dog } from '@phosphor-icons/react'
import { isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'

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
    <div className={isCompact ? 'space-y-2' : 'space-y-4'}>
      <div className={`grid md:grid-cols-3 ${isCompact ? 'gap-2' : 'gap-4'}`}>
        <Card className="glass cursor-pointer hover:glass-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-white/20 liquid-bubble liquid-morph" onClick={() => onNavigate('appointments')}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isCompact ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <div className="glass-dark p-2 rounded-lg liquid-glow">
              <Calendar className="h-4 w-4 text-primary" weight="fill" />
            </div>
          </CardHeader>
          <CardContent className={isCompact ? 'pt-1' : ''}>
            <div className={`font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent ${isCompact ? 'text-xl' : 'text-2xl'}`}>
              {todayAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayAppointments.filter(a => a.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="glass cursor-pointer hover:glass-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-white/20 liquid-bubble liquid-morph" onClick={() => onNavigate('customers')}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isCompact ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <div className="glass-dark p-2 rounded-lg liquid-glow">
              <Users className="h-4 w-4 text-accent" weight="fill" />
            </div>
          </CardHeader>
          <CardContent className={isCompact ? 'pt-1' : ''}>
            <div className={`font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent ${isCompact ? 'text-xl' : 'text-2xl'}`}>
              {customers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pets?.length || 0} pets registered
            </p>
          </CardContent>
        </Card>

        <Card className="glass cursor-pointer hover:glass-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-white/20 liquid-bubble liquid-morph" onClick={() => onNavigate('appointments')}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isCompact ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <div className="glass-dark p-2 rounded-lg liquid-glow">
              <ChartBar className="h-4 w-4 text-primary" weight="fill" />
            </div>
          </CardHeader>
          <CardContent className={isCompact ? 'pt-1' : ''}>
            <div className={`font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent ${isCompact ? 'text-xl' : 'text-2xl'}`}>
              {weekAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              appointments scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="frosted border-white/20 liquid-shine">
        <CardHeader className={isCompact ? 'pb-2' : ''}>
          <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-base' : ''}`}>
            <div className="glass-dark p-1.5 rounded-lg liquid-pulse">
              <Calendar className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} weight="fill" />
            </div>
            Today's Schedule
          </CardTitle>
          <CardDescription className={isCompact ? 'text-xs' : ''}>Appointments scheduled for today</CardDescription>
        </CardHeader>
        <CardContent className={isCompact ? 'pt-2' : ''}>
          {todayAppointments.length === 0 ? (
            <div className={`text-center text-muted-foreground ${isCompact ? 'py-4' : 'py-8'}`}>
              <div className="glass-dark w-fit mx-auto p-4 rounded-2xl mb-3">
                <Dog className={`opacity-50 ${isCompact ? 'h-8 w-8' : 'h-12 w-12'}`} weight="fill" />
              </div>
              <p className={isCompact ? 'text-sm' : ''}>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
              {todayAppointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className={`glass-dark rounded-xl border border-white/20 hover:glass transition-all duration-200 ${isCompact ? 'p-2' : 'p-3'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 font-medium min-w-[60px] glass-dark px-2 py-1 rounded-lg ${isCompact ? 'text-xs' : 'text-sm'}`}>
                        <Clock size={isCompact ? 12 : 14} weight="fill" />
                        {apt.time}
                      </div>
                      <div>
                        <div className={`font-medium ${isCompact ? 'text-sm' : ''}`}>{getPetName(apt.petId)}</div>
                        <div className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>{getCustomerName(apt.customerId)}</div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(apt.status)} backdrop-blur-sm`}>
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
  )
}