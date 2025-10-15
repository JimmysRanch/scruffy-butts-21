import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, ChartBar, Plus, Clock, Dog, CurrencyDollar } from '@phosphor-icons/react'
import { format, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'

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

interface Service {
  id: string
  name: string
}

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  hireDate: string
  address: string
  city: string
  state: string
  zip: string
  specialties: string[]
  notes: string
  status: 'active' | 'inactive'
  rating: number
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [pets] = useKV<Pet[]>('pets', [])
  const [services] = useKV<Service[]>('services', [])
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])
  const [appearance] = useKV<AppearanceSettings>('appearance-settings', {})

  const isCompact = appearance?.compactMode || false
  const showWelcome = appearance?.showWelcomeMessage !== false

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

  const upcomingAppointments = (appointments || [])
    .filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate >= today && apt.status === 'scheduled'
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  const getCustomerName = (customerId: string) => {
    return customers?.find(c => c.id === customerId)?.name || 'Unknown'
  }

  const getPetName = (petId: string) => {
    return pets?.find(p => p.id === petId)?.name || 'Unknown'
  }

  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds.map(id => services?.find(s => s.id === id)?.name || 'Unknown').join(', ')
  }

  const getStaffName = (staffId: string) => {
    const member = staffMembers?.find(s => s.id === staffId)
    return member ? `${member.firstName} ${member.lastName}` : 'Unassigned'
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-2">
        <Button 
          onClick={() => onNavigate('appointments')} 
          className="glass-button flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300" 
          size={isCompact ? "sm" : "default"}
        >
          <Plus size={18} weight="bold" />
          <span>New Appointment</span>
        </Button>
      </div>

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

      <div className={`grid md:grid-cols-2 ${isCompact ? 'gap-2' : 'gap-4'}`}>
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

        <Card className="frosted border-white/20 liquid-shine">
          <CardHeader className={isCompact ? 'pb-2' : ''}>
            <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-base' : ''}`}>
              <div className="glass-dark p-1.5 rounded-lg liquid-pulse">
                <Clock className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} weight="fill" />
              </div>
              Upcoming Appointments
            </CardTitle>
            <CardDescription className={isCompact ? 'text-xs' : ''}>Next scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent className={isCompact ? 'pt-2' : ''}>
            {upcomingAppointments.length === 0 ? (
              <div className={`text-center text-muted-foreground ${isCompact ? 'py-4' : 'py-8'}`}>
                <div className="glass-dark w-fit mx-auto p-4 rounded-2xl mb-3">
                  <Calendar className={`opacity-50 ${isCompact ? 'h-8 w-8' : 'h-12 w-12'}`} weight="fill" />
                </div>
                <p className={isCompact ? 'text-sm' : ''}>No upcoming appointments</p>
              </div>
            ) : (
              <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className={`glass-dark rounded-xl border border-white/20 hover:glass transition-all duration-200 ${isCompact ? 'p-2' : 'p-3'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${isCompact ? 'text-sm' : ''}`}>{getPetName(apt.petId)}</div>
                        <div className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                          {format(new Date(apt.date), 'MMM d')} at {apt.time}
                        </div>
                        <div className={`text-muted-foreground mt-1 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                          {getServiceNames(apt.serviceIds)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium glass-dark px-2 py-1 rounded-lg ${isCompact ? 'text-xs' : 'text-sm'}`}>
                          {getStaffName(apt.staffId)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={`grid md:grid-cols-2 ${isCompact ? 'gap-2' : 'gap-4'}`}>
        <Card className="frosted border-white/20">
          <CardHeader className={isCompact ? 'pb-2' : ''}>
            <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-base' : ''}`}>
              <div className="glass-dark p-1.5 rounded-lg">
                <Plus className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} weight="bold" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription className={isCompact ? 'text-xs' : ''}>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className={isCompact ? 'pt-2' : ''}>
            <div className={`grid grid-cols-2 ${isCompact ? 'gap-2' : 'gap-3'}`}>
              <Button variant="outline" onClick={() => onNavigate('appointments')} className={`glass-button h-auto flex-col border-white/20 ${isCompact ? 'py-2 gap-1' : 'py-4 gap-2'}`}>
                <Calendar size={isCompact ? 18 : 24} weight="fill" />
                <span className={isCompact ? 'text-xs' : 'text-sm'}>New Appointment</span>
              </Button>
              <Button variant="outline" onClick={() => onNavigate('customers')} className={`glass-button h-auto flex-col border-white/20 ${isCompact ? 'py-2 gap-1' : 'py-4 gap-2'}`}>
                <Users size={isCompact ? 18 : 24} weight="fill" />
                <span className={isCompact ? 'text-xs' : 'text-sm'}>Add Customer</span>
              </Button>
              <Button variant="outline" onClick={() => onNavigate('pos')} className={`glass-button h-auto flex-col border-white/20 ${isCompact ? 'py-2 gap-1' : 'py-4 gap-2'}`}>
                <CurrencyDollar size={isCompact ? 18 : 24} weight="fill" />
                <span className={isCompact ? 'text-xs' : 'text-sm'}>Point of Sale</span>
              </Button>
              <Button variant="outline" onClick={() => onNavigate('inventory')} className={`glass-button h-auto flex-col border-white/20 ${isCompact ? 'py-2 gap-1' : 'py-4 gap-2'}`}>
                <ChartBar size={isCompact ? 18 : 24} weight="fill" />
                <span className={isCompact ? 'text-xs' : 'text-sm'}>Inventory</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="frosted border-white/20">
          <CardHeader className={isCompact ? 'pb-2' : ''}>
            <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-base' : ''}`}>
              <div className="glass-dark p-1.5 rounded-lg">
                <Dog className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} weight="fill" />
              </div>
              Quick Stats
            </CardTitle>
            <CardDescription className={isCompact ? 'text-xs' : ''}>Overview of your business</CardDescription>
          </CardHeader>
          <CardContent className={isCompact ? 'pt-2' : ''}>
            <div className={isCompact ? 'space-y-2' : 'space-y-4'}>
              <div className="flex justify-between items-center glass-dark px-3 py-2 rounded-lg">
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>Total Services</span>
                <span className={`font-semibold ${isCompact ? 'text-sm' : ''}`}>{services?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center glass-dark px-3 py-2 rounded-lg">
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>Staff Members</span>
                <span className={`font-semibold ${isCompact ? 'text-sm' : ''}`}>{staffMembers?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center glass-dark px-3 py-2 rounded-lg">
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>Total Appointments</span>
                <span className={`font-semibold ${isCompact ? 'text-sm' : ''}`}>{appointments?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center glass-dark px-3 py-2 rounded-lg">
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>Completed This Week</span>
                <span className={`font-semibold ${isCompact ? 'text-sm' : ''}`}>
                  {weekAppointments.filter(a => a.status === 'completed').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}