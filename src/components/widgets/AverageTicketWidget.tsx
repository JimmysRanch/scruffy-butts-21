import { useKV } from '@github/spark/hooks'
import { format, subDays } from 'date-fns'

interface Appointment {
  id: string
  date: string
  price: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'no-show'
  paymentCompleted?: boolean
}

export function AverageTicketWidget() {
  const [appointments] = useKV<Appointment[]>('appointments', [])

  const today = new Date()
  const sevenDaysAgo = subDays(today, 7)
  const fourteenDaysAgo = subDays(today, 14)

  const last7DaysAppointments = (appointments || []).filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate >= sevenDaysAgo && aptDate <= today && apt.status === 'completed' && apt.paymentCompleted
  })

  const previous7DaysAppointments = (appointments || []).filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate >= fourteenDaysAgo && aptDate < sevenDaysAgo && apt.status === 'completed' && apt.paymentCompleted
  })

  const currentAverage = last7DaysAppointments.length > 0
    ? Math.round(last7DaysAppointments.reduce((sum, apt) => sum + apt.price, 0) / last7DaysAppointments.length)
    : 0

  const previousAverage = previous7DaysAppointments.length > 0
    ? Math.round(previous7DaysAppointments.reduce((sum, apt) => sum + apt.price, 0) / previous7DaysAppointments.length)
    : 0

  const percentChange = previousAverage > 0
    ? ((currentAverage - previousAverage) / previousAverage) * 100
    : 0

  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(today, 6 - i), 'yyyy-MM-dd')
    const dayAppointments = last7DaysAppointments.filter(apt => apt.date === date)
    const dayAverage = dayAppointments.length > 0
      ? dayAppointments.reduce((sum, apt) => sum + apt.price, 0) / dayAppointments.length
      : 0
    return dayAverage
  })

  const maxValue = Math.max(...last7DaysData, 1)
  const normalizedData = last7DaysData.map(val => (val / maxValue) * 100)

  const pathData = normalizedData.map((value, index) => {
    const x = (index / (normalizedData.length - 1)) * 100
    const y = 100 - value
    return `${index === 0 ? 'M' : 'L'} ${x},${y}`
  }).join(' ')

  const areaPath = `${pathData} L 100,100 L 0,100 Z`

  return (
    <div className="relative z-10">
      <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
        <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">Avg. Ticket</h3>
      </div>
      <div className="pb-1 pt-1 px-4 min-w-0">
        <div className="text-2xl font-bold text-white/95">
          ${currentAverage}
        </div>
        <p className="text-[10px] text-white/60 mt-0.5 truncate font-medium">
          last 7 days
        </p>
      </div>
      <div className="px-4 pb-2">
        <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none" className="opacity-70">
          <defs>
            <linearGradient id="avgTicketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.70 0.20 210)" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="oklch(0.70 0.20 210)" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <path d={normalizedData.map((value, index) => {
            const x = (index / (normalizedData.length - 1)) * 100
            const y = 32 - (value / 100) * 32
            return `${index === 0 ? 'M' : 'L'} ${x},${y}`
          }).join(' ') + ' L 100,32 L 0,32 Z'} fill="url(#avgTicketGradient)"/>
          <path d={normalizedData.map((value, index) => {
            const x = (index / (normalizedData.length - 1)) * 100
            const y = 32 - (value / 100) * 32
            return `${index === 0 ? 'M' : 'L'} ${x},${y}`
          }).join(' ')} stroke="oklch(0.70 0.20 210)" strokeWidth="2" fill="none" className="drop-shadow-[0_0_4px_oklch(0.70_0.20_210)]"/>
        </svg>
      </div>
    </div>
  )
}
