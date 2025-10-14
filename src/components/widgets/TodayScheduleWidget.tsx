import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

interface TodayScheduleWidgetProps {
  isCompact?: boolean
}

export function TodayScheduleWidget({ isCompact = false }: TodayScheduleWidgetProps) {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayAppointments = (appointments || []).filter(apt => apt.date && apt.date === today)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Today's Schedule</CardTitle>
        <CardDescription>
          {todayAppointments.length} appointments scheduled for today
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
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
  )
}
