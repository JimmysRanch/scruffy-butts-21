import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, ChartBar, Plus } from '@phosphor-icons/react'
import { format } from 'date-fns'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'settings'

interface DashboardProps {
  onNavigate: (view: View) => void
}

interface Appointment {
  id: string
  petName: string
  customerFirstName: string
  customerLastName: string
  customerId: string
  service: string
  date: string
  time: string
  duration: number
  price: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  pets: Pet[]
  name?: string
}

interface Pet {
  id: string
  name: string
  breed: string
  size: 'small' | 'medium' | 'large'
  notes?: string
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [appearance] = useKV<{ compactMode?: boolean }>('appearance-settings', {})

  const isCompact = appearance?.compactMode || false

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayAppointments = (appointments || []).filter(apt => apt.date && apt.date === today)
  const upcomingAppointments = (appointments || []).filter(apt => 
    apt.date && apt.date > today && apt.status === 'scheduled'
  ).slice(0, 3)

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      icon: Calendar,
      action: () => onNavigate('appointments'),
    },
    {
      title: "Total Customers",
      value: (customers || []).length,
      icon: Users,
      action: () => onNavigate('customers'),
    },
    {
      title: "This Week",
      value: (appointments || []).filter(apt => {
        if (!apt.date) return false
        try {
          const aptDate = new Date(apt.date)
          const weekStart = new Date()
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          return aptDate >= weekStart && aptDate <= weekEnd
        } catch {
          return false
        }
      }).length,
      icon: ChartBar,
      action: () => onNavigate('appointments'),
    },
  ]

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`font-bold text-foreground ${isCompact ? 'text-2xl' : 'text-3xl'}`}>Dashboard</h1>
          <p className={`text-muted-foreground ${isCompact ? 'text-sm' : ''}`}>
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <Button onClick={() => onNavigate('appointments')} className="flex items-center space-x-2">
          <Plus size={18} />
          <span>New Appointment</span>
        </Button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 ${isCompact ? 'gap-3' : 'gap-6'}`}>
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={stat.action}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon size={20} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 ${isCompact ? 'gap-3' : 'gap-6'}`}>
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              {todayAppointments.length} appointments scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className={`text-muted-foreground text-center ${isCompact ? 'py-4' : 'py-8'}`}>
                No appointments scheduled for today
              </p>
            ) : (
              <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className={`flex items-center justify-between bg-secondary rounded-lg ${isCompact ? 'p-2' : 'p-3'}`}>
                    <div>
                      <p className="font-medium">{appointment.petName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.customerFirstName} {appointment.customerLastName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.time}</p>
                      <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Next few scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className={`text-muted-foreground text-center ${isCompact ? 'py-4' : 'py-8'}`}>
                No upcoming appointments
              </p>
            ) : (
              <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className={`flex items-center justify-between bg-secondary rounded-lg ${isCompact ? 'p-2' : 'p-3'}`}>
                    <div>
                      <p className="font-medium">{appointment.petName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.customerFirstName} {appointment.customerLastName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{appointment.date ? format(new Date(appointment.date), 'MMM dd') : 'No date'}</p>
                      <p className="text-sm text-muted-foreground">{appointment.time}</p>
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