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
    <div className="relative z-10">
      <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
        <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">Weekly Capacity</h3>
      </div>
      <div className="pb-3 pt-1 px-4 min-w-0">
        <div className="text-2xl font-bold text-white/95">
          {avgPercentage}%
        </div>
        <p className="text-[10px] text-white/60 mt-0.5 truncate font-medium">
          {percentageChange >= 0 ? '+' : ''}{percentageChange}% vs. last week
        </p>
      </div>
      <div className="absolute bottom-2 right-3 flex gap-0.5 items-end opacity-40">
        {weekData.map((d, i) => (
          <div key={i} className="w-5 flex flex-col items-center gap-0.5">
            <div 
              className="w-full rounded-t-sm bg-amber-400 shadow-[0_0_8px_oklch(0.60_0.18_60)]" 
              style={{ height: `${Math.max(d.percentage * 0.18, 4)}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
