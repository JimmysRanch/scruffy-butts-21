import { useKV } from '@github/spark/hooks'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartBar } from '@phosphor-icons/react'
import { startOfWeek, addDays, isSameDay, format } from 'date-fns'

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

  const getDayPercentage = (dayOffset: number): number => {
    const targetDate = addDays(weekStart, dayOffset)
    
    const dayAppointments = (appointments || []).filter(apt =>
      isSameDay(new Date(apt.date), targetDate) &&
      apt.status !== 'cancelled' &&
      apt.status !== 'no-show'
    )

    const dayName = format(targetDate, 'EEEE').toLowerCase()
    const totalDayHours = (staffMembers || []).reduce((total, staff) => {
      const daySchedule = staff.regularSchedule?.[dayName]
      if (daySchedule?.enabled && daySchedule?.canBeBooked && daySchedule.start && daySchedule.end) {
        const [startHour] = daySchedule.start.split(':').map(Number)
        const [endHour] = daySchedule.end.split(':').map(Number)
        return total + (endHour - startHour)
      }
      return total
    }, 0)

    if (totalDayHours === 0) return 0

    const bookedHours = dayAppointments.length * 1
    return Math.min(Math.round((bookedHours / totalDayHours) * 100), 100)
  }

  const weekData = [
    { day: 'Tue', percentage: getDayPercentage(2) },
    { day: 'Wed', percentage: getDayPercentage(3) },
    { day: 'Thu', percentage: getDayPercentage(4) },
    { day: 'Fri', percentage: getDayPercentage(5) },
    { day: 'Sat', percentage: getDayPercentage(6) }
  ]

  const avgPercentage = Math.round(weekData.reduce((sum, d) => sum + d.percentage, 0) / weekData.length)
  const lastWeekAvg = 52
  const percentageChange = avgPercentage - lastWeekAvg

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-1.5 px-2.5">
        <CardTitle className="text-[11px] font-medium truncate">Weekly Capacity</CardTitle>
      </CardHeader>
      <CardContent className="pb-1 pt-0.5 px-2.5 min-w-0">
        <div className="text-base font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
          {avgPercentage}%
        </div>
        <p className="text-[9px] text-muted-foreground mt-0 truncate">
          {percentageChange >= 0 ? '+' : ''}{percentageChange}% vs last week
        </p>
      </CardContent>
    </>
  )
}
