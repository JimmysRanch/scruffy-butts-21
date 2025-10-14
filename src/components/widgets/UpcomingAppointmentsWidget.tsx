import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

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

interface UpcomingAppointmentsWidgetProps {
  isCompact?: boolean
}

export function UpcomingAppointmentsWidget({ isCompact = false }: UpcomingAppointmentsWidgetProps) {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const upcomingAppointments = (appointments || []).filter(apt => 
    apt.date && apt.date > today && apt.status === 'scheduled'
  ).slice(0, 5)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>
          Next scheduled appointments
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
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
                  <p className="text-sm font-medium">
                    {appointment.date ? (() => {
                      try {
                        const date = new Date(appointment.date)
                        return isNaN(date.getTime()) ? 'No date' : format(date, 'MMM dd')
                      } catch {
                        return 'No date'
                      }
                    })() : 'No date'}
                  </p>
                  <p className="text-sm text-muted-foreground">{appointment.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
