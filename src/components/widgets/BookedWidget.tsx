import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CaretUp, CaretDown } from '@phosphor-icons/react'
import { startOfWeek, endOfWeek, isWithinInterval, format, addDays } from 'date-fns'

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

  const getBookedPercentageForDay = (dayOffset: number): number => {
    const targetDate = addDays(weekStart, dayOffset)
    const dayName = format(targetDate, 'EEEE').toLowerCase()

    const totalAvailableHours = (staffMembers || []).reduce((total, staff) => {
      const daySchedule = staff.regularSchedule?.[dayName]
      if (daySchedule?.enabled && daySchedule?.canBeBooked && daySchedule.start && daySchedule.end) {
        const [startHour] = daySchedule.start.split(':').map(Number)
        const [endHour] = daySchedule.end.split(':').map(Number)
        return total + (endHour - startHour)
      }
      return total
    }, 0)

    if (totalAvailableHours === 0) return 0

    const dayAppointments = (appointments || []).filter(apt => {
      const aptDate = new Date(apt.date)
      return (
        format(aptDate, 'yyyy-MM-dd') === format(targetDate, 'yyyy-MM-dd') &&
        apt.status !== 'cancelled' &&
        apt.status !== 'no-show'
      )
    })

    const bookedHours = dayAppointments.length * 1

    return Math.min(Math.round((bookedHours / totalAvailableHours) * 100), 100)
  }

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

  const weekDays = [
    { name: 'Tue', offset: 2 },
    { name: 'Wed', offset: 3 },
    { name: 'Thu', offset: 4 },
    { name: 'Fri', offset: 5 },
    { name: 'Sat', offset: 6 }
  ]

  return (
    <Card className="glass border-none overflow-hidden bg-gradient-to-br from-[oklch(0.25_0.05_250)] to-[oklch(0.22_0.06_260)] text-white">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium opacity-90">Booked</CardTitle>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">{currentWeekPercentage}%</div>
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <CaretUp weight="fill" size={14} /> : <CaretDown weight="fill" size={14} />}
              {Math.abs(percentageChange)}% vs last week
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <div className="flex items-end justify-between gap-2 h-32">
          {weekDays.map((day) => {
            const percentage = getBookedPercentageForDay(day.offset)
            const barHeight = Math.max(percentage * 0.8, 5)

            return (
              <div key={day.name} className="flex flex-col items-center gap-2 flex-1">
                <div className="text-xs font-semibold mb-1">{percentage}%</div>
                <div className="relative w-full flex items-end" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-xl bg-gradient-to-t from-[#ff6b6b] to-[#ff8787] transition-all duration-500 ease-out"
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                <div className="text-xs opacity-60 font-medium">{day.name}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
