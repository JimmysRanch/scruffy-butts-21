import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { CaretUp } from '@phosphor-icons/react'
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

  const maxPercentage = 100

  return (
    <Card className="glass col-span-2 border-white/20 transition-all duration-300 hover:shadow-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-1">Booked</h3>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-foreground">{avgPercentage}%</div>
            <div className="flex items-center justify-end gap-1 mt-1 text-emerald-600">
              <CaretUp weight="fill" size={16} />
              <span className="text-sm font-medium">{percentageChange}% vs last week</span>
            </div>
          </div>
        </div>

        <div className="relative h-48">
          <div className="absolute inset-0 flex items-end justify-between gap-4">
            {weekData.map((data, index) => {
              const heightPercentage = (data.percentage / maxPercentage) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-3">
                  <div className="relative w-full flex flex-col items-center">
                    <span className="text-sm font-semibold text-foreground mb-1">{data.percentage}%</span>
                    <div 
                      className="w-full rounded-full bg-gradient-to-t from-[#ff6b7a] to-[#ff8a97] transition-all duration-500 ease-out shadow-lg"
                      style={{ 
                        height: `${Math.max(heightPercentage, 5)}%`,
                        minHeight: '40px'
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">{data.day}</span>
                </div>
              )
            })}
          </div>
          
          <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between pointer-events-none">
            <span className="text-xs text-muted-foreground/60">100</span>
            <span className="text-xs text-muted-foreground/60">80</span>
            <span className="text-xs text-muted-foreground/60">60</span>
            <span className="text-xs text-muted-foreground/60">40</span>
            <span className="text-xs text-muted-foreground/60">20</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
