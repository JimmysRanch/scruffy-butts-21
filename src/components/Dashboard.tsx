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
  name: string
  color: string
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [pets] = useKV<Pet[]>('pets', [])
  const [services] = useKV<Service[]>('services', [])
  const [staff] = useKV<StaffMember[]>('staff', [])
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
    return staff?.find(s => s.id === staffId)?.name || 'Unassigned'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no-show':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className={isCompact ? 'space-y-2' : 'space-y-4'}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className={`font-bold text-foreground ${isCompact ? 'text-2xl' : 'text-3xl'}`}>Dashboard</h1>
          {showWelcome && (
            <p className={`text-muted-foreground ${isCompact ? 'text-sm' : ''}`}>
              Welcome back! Here's what's happening today.
            </p>
          )}
        </div>
        <Button onClick={() => onNavigate('appointments')} className="flex items-center gap-2" size={isCompact ? "sm" : "default"}>
          <Plus size={18} />
          <span>New Appointment</span>
        </Button>
      </div>

      <div className={`grid md:grid-cols-3 ${isCompact ? 'gap-2' : 'gap-4'}`}>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('appointments')}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isCompact ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isCompact ? 'pt-1' : ''}>
            <div className={`font-bold ${isCompact ? 'text-xl' : 'text-2xl'}`}>{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayAppointments.filter(a => a.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('customers')}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isCompact ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isCompact ? 'pt-1' : ''}>
            <div className={`font-bold ${isCompact ? 'text-xl' : 'text-2xl'}`}>{customers?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pets?.length || 0} pets registered
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('appointments')}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isCompact ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isCompact ? 'pt-1' : ''}>
            <div className={`font-bold ${isCompact ? 'text-xl' : 'text-2xl'}`}>{weekAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              appointments scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      <div className={`grid md:grid-cols-2 ${isCompact ? 'gap-2' : 'gap-4'}`}>
        <Card>
          <CardHeader className={isCompact ? 'pb-2' : ''}>
            <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-base' : ''}`}>
              <Calendar className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
              Today's Schedule
            </CardTitle>
            <CardDescription className={isCompact ? 'text-xs' : ''}>Appointments scheduled for today</CardDescription>
          </CardHeader>
          <CardContent className={isCompact ? 'pt-2' : ''}>
            {todayAppointments.length === 0 ? (
              <div className={`text-center text-muted-foreground ${isCompact ? 'py-4' : 'py-8'}`}>
                <Dog className={`mx-auto mb-2 opacity-50 ${isCompact ? 'h-8 w-8' : 'h-12 w-12'}`} />
                <p className={isCompact ? 'text-sm' : ''}>No appointments scheduled for today</p>
              </div>
            ) : (
              <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
                {todayAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className={`flex items-center justify-between rounded-lg border ${isCompact ? 'p-2' : 'p-3'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 font-medium min-w-[60px] ${isCompact ? 'text-xs' : 'text-sm'}`}>
                        <Clock size={isCompact ? 12 : 14} />
                        {apt.time}
                      </div>
                      <div>
                        <div className={`font-medium ${isCompact ? 'text-sm' : ''}`}>{getPetName(apt.petId)}</div>
                        <div className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>{getCustomerName(apt.customerId)}</div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(apt.status)}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={isCompact ? 'pb-2' : ''}>
            <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-base' : ''}`}>
              <Clock className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
              Upcoming Appointments
            </CardTitle>
            <CardDescription className={isCompact ? 'text-xs' : ''}>Next scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent className={isCompact ? 'pt-2' : ''}>
            {upcomingAppointments.length === 0 ? (
              <div className={`text-center text-muted-foreground ${isCompact ? 'py-4' : 'py-8'}`}>
                <Calendar className={`mx-auto mb-2 opacity-50 ${isCompact ? 'h-8 w-8' : 'h-12 w-12'}`} />
                <p className={isCompact ? 'text-sm' : ''}>No upcoming appointments</p>
              </div>
            ) : (
              <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className={`flex items-center justify-between rounded-lg border ${isCompact ? 'p-2' : 'p-3'}`}>
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
                      <div className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>{getStaffName(apt.staffId)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={`grid md:grid-cols-2 ${isCompact ? 'gap-2' : 'gap-4'}`}>
        <Card>
          <CardHeader className={isCompact ? 'pb-2' : ''}>
            <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-base' : ''}`}>
              <Plus className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
              Quick Actions
            </CardTitle>
            <CardDescription className={isCompact ? 'text-xs' : ''}>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className={isCompact ? 'pt-2' : ''}>
            <div className={`grid grid-cols-2 ${isCompact ? 'gap-2' : 'gap-3'}`}>
              <Button variant="outline" onClick={() => onNavigate('appointments')} className={`h-auto flex-col ${isCompact ? 'py-2 gap-1' : 'py-4 gap-2'}`}>
                <Calendar size={isCompact ? 18 : 24} />
                <span className={isCompact ? 'text-xs' : 'text-sm'}>New Appointment</span>
              </Button>
              <Button variant="outline" onClick={() => onNavigate('customers')} className={`h-auto flex-col ${isCompact ? 'py-2 gap-1' : 'py-4 gap-2'}`}>
                <Users size={isCompact ? 18 : 24} />
                <span className={isCompact ? 'text-xs' : 'text-sm'}>Add Customer</span>
              </Button>
              <Button variant="outline" onClick={() => onNavigate('pos')} className={`h-auto flex-col ${isCompact ? 'py-2 gap-1' : 'py-4 gap-2'}`}>
                <CurrencyDollar size={isCompact ? 18 : 24} />
                <span className={isCompact ? 'text-xs' : 'text-sm'}>Point of Sale</span>
              </Button>
              <Button variant="outline" onClick={() => onNavigate('inventory')} className={`h-auto flex-col ${isCompact ? 'py-2 gap-1' : 'py-4 gap-2'}`}>
                <ChartBar size={isCompact ? 18 : 24} />
                <span className={isCompact ? 'text-xs' : 'text-sm'}>Inventory</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={isCompact ? 'pb-2' : ''}>
            <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-base' : ''}`}>
              <Dog className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
              Quick Stats
            </CardTitle>
            <CardDescription className={isCompact ? 'text-xs' : ''}>Overview of your business</CardDescription>
          </CardHeader>
          <CardContent className={isCompact ? 'pt-2' : ''}>
            <div className={isCompact ? 'space-y-2' : 'space-y-4'}>
              <div className="flex justify-between items-center">
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>Total Services</span>
                <span className={`font-semibold ${isCompact ? 'text-sm' : ''}`}>{services?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>Staff Members</span>
                <span className={`font-semibold ${isCompact ? 'text-sm' : ''}`}>{staff?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>Total Appointments</span>
                <span className={`font-semibold ${isCompact ? 'text-sm' : ''}`}>{appointments?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
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