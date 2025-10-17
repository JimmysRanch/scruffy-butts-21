import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartBar, CaretUp, CaretDown } from '@phosphor-icons/react'
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'

interface Appointment {
  id: string
  date: string
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  staffId: string
}

interface StaffMember {
  id: string
  name: string
  role: string
  regularSchedule?: {
    [key: string]: {
      enabled: boolean
      start?: string
      end?: string
      canBeBooked?: boolean
      services?: string[]
    }
  }
}

export function BookedWidget() {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 })

  const getCurrentWeekPercentage = (): number => {
    const weekAppointments = (appointments || []).filter(apt =>
      isWithinInterval(new Date(apt.date), { start: weekStart, end: weekEnd }) &&
      apt.status !== 'cancelled' &&
      apt.status !== 'no-show'
    )

    const totalWeekHours = (staffMembers || []).reduce((total, staff) => {
      let weekHours = 0
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      days.forEach(day => {
        const daySchedule = staff.regularSchedule?.[day]
        if (daySchedule?.enabled && daySchedule?.canBeBooked && daySchedule.start && daySchedule.end) {
          const [startHour] = daySchedule.start.split(':').map(Number)
          const [endHour] = daySchedule.end.split(':').map(Number)
          weekHours += (endHour - startHour)
        }
      })
      return total + weekHours
    }, 0)

    if (totalWeekHours === 0) return 0

    const bookedHours = weekAppointments.length * 1
    return Math.min(Math.round((bookedHours / totalWeekHours) * 100), 100)
  }

  const currentWeekPercentage = getCurrentWeekPercentage()
  const lastWeekPercentage = 52
  const percentageChange = currentWeekPercentage - lastWeekPercentage
  const isPositive = percentageChange > 0

  return (
    <Card className="glass cursor-pointer hover:glass-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-white/20 liquid-bubble liquid-morph">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 pt-2 px-3">
        <CardTitle className="text-xs font-medium">Booked This Week</CardTitle>
        <div className="glass-dark p-1 rounded-lg">
          <ChartBar className="h-3 w-3 text-primary" weight="fill" />
        </div>
      </CardHeader>
      <CardContent className="pb-1 pt-1 px-3">
        <div className="text-lg font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
          {currentWeekPercentage}%
        </div>
        <p className={`text-[10px] mt-0 flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {isPositive ? <CaretUp weight="fill" size={10} /> : <CaretDown weight="fill" size={10} />}
          {Math.abs(percentageChange)}% vs last week
        </p>
      </CardContent>
    </Card>
  )
}
