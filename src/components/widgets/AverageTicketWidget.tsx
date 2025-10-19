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

  const goal = 75
  const progressPercent = Math.min(Math.round((currentAverage / goal) * 100), 100)

  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(today, 6 - i), 'yyyy-MM-dd')
    const dayAppointments = last7DaysAppointments.filter(apt => apt.date === date)
    const dayAverage = dayAppointments.length > 0
      ? dayAppointments.reduce((sum, apt) => sum + apt.price, 0) / dayAppointments.length
      : 0
    return dayAverage
  })

  const maxValue = Math.max(...last7DaysData, goal)
  const normalizedData = last7DaysData.map(val => (val / maxValue) * 100)

  const pathData = normalizedData.map((value, index) => {
    const x = (index / (normalizedData.length - 1)) * 100
    const y = 100 - value
    return `${index === 0 ? 'M' : 'L'} ${x},${y}`
  }).join(' ')

  const areaPath = `${pathData} L 100,100 L 0,100 Z`
  const goalY = 100 - (goal / maxValue) * 100

  return (
    <div className="relative z-10 h-full flex flex-col">
      <div className="flex items-start justify-between pt-3 px-4 pb-2">
        <div className="flex-1">
          <h3 className="text-sm font-bold tracking-tight text-foreground/90">Average Ticket</h3>
          <p className="text-[11px] text-white/60 mt-0.5 font-medium">Last 7 days</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <span className="text-xs font-bold text-emerald-400">+{percentChange.toFixed(1)}%</span>
        </div>
      </div>

      <div className="px-4 pb-2 flex-1 flex flex-col justify-center">
        <div className="mb-1">
          <div className="text-4xl font-bold text-white/95 leading-none">${currentAverage}</div>
          <div className="text-[11px] text-white/60 mt-1 font-medium">Goal ${goal}</div>
        </div>

        <div className="relative w-full h-16 mb-2">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="avgTicketAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.65 0.20 200)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="oklch(0.65 0.20 200)" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <line
              x1="0"
              y1={goalY}
              x2="100"
              y2={goalY}
              stroke="oklch(0.70 0.04 240)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.6"
            />

            <path
              d={areaPath}
              fill="url(#avgTicketAreaGradient)"
            />

            <path
              d={pathData}
              fill="none"
              stroke="oklch(0.70 0.22 200)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 6px oklch(0.65 0.20 200))' }}
            />
          </svg>
        </div>

        <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, oklch(0.60 0.20 200), oklch(0.70 0.22 200))',
              boxShadow: '0 0 12px oklch(0.65 0.20 200)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <div className="text-[11px] font-bold text-white/90 mt-1.5">{progressPercent}% of goal</div>
      </div>
    </div>
  )
}
