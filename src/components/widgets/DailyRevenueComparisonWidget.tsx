import { useKV } from '@/lib/useKV'
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay } from 'date-fns'
import { TrendUp, TrendDown } from '@phosphor-icons/react'

interface Appointment {
  id: string
  date: string
  price: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'no-show'
  paymentCompleted?: boolean
  amountPaid?: number
}

export function DailyRevenueComparisonWidget() {
  const [appointments] = useKV<Appointment[]>('appointments', [])

  const today = new Date()
  const todayDateString = format(today, 'yyyy-MM-dd')
  
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)

  const todayRevenue = (appointments || [])
    .filter(apt => 
      apt.date === todayDateString && 
      apt.status === 'completed' && 
      apt.paymentCompleted
    )
    .reduce((sum, apt) => sum + (apt.amountPaid || apt.price || 0), 0)

  const monthAppointments = (appointments || [])
    .filter(apt => {
      const aptDate = parseISO(apt.date)
      return isWithinInterval(aptDate, { start: monthStart, end: monthEnd }) &&
        apt.status === 'completed' &&
        apt.paymentCompleted &&
        apt.date !== todayDateString
    })

  const monthRevenue = monthAppointments.reduce((sum, apt) => sum + (apt.amountPaid || apt.price || 0), 0)

  const uniqueDays = new Set(monthAppointments.map(apt => apt.date))
  const daysWithRevenue = uniqueDays.size
  
  const averageDailyRevenue = daysWithRevenue > 0 ? monthRevenue / daysWithRevenue : 0

  const difference = todayRevenue - averageDailyRevenue
  const percentChange = averageDailyRevenue > 0 ? (difference / averageDailyRevenue) * 100 : 0
  const isPositive = difference >= 0

  return (
    <div className="relative z-10">
      <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
        <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">Daily Revenue</h3>
      </div>
      <div className="pb-1 pt-1 px-4 min-w-0">
        <div className="text-2xl font-bold text-white/95">
          ${todayRevenue.toLocaleString()}
        </div>
        <p className="text-[10px] text-white/60 mt-0.5 truncate font-medium">
          today's earnings
        </p>
      </div>
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-white/50">
            Avg: ${Math.round(averageDailyRevenue).toLocaleString()}
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? (
              <TrendUp size={12} weight="bold" />
            ) : (
              <TrendDown size={12} weight="bold" />
            )}
            {Math.abs(percentChange).toFixed(0)}%
          </div>
        </div>
        <div className="mt-2 relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min((todayRevenue / Math.max(averageDailyRevenue * 1.5, todayRevenue, 1)) * 100, 100)}%`,
              background: isPositive 
                ? 'linear-gradient(90deg, oklch(0.70 0.18 160), oklch(0.80 0.20 160))'
                : 'linear-gradient(90deg, oklch(0.65 0.20 200), oklch(0.75 0.22 200))',
              boxShadow: isPositive
                ? '0 0 12px oklch(0.70 0.18 160)'
                : '0 0 12px oklch(0.65 0.20 200)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
