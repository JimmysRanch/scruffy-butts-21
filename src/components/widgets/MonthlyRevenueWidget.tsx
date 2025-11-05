import { useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns'
import { TrendUp, TrendDown, CurrencyDollar } from '@phosphor-icons/react'

interface Appointment {
  id: string
  date: string
  price: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'no-show'
  paymentCompleted?: boolean
  amountPaid?: number
}

export function MonthlyRevenueWidget() {
  const [appointments] = useKV<Appointment[]>('appointments', [])

  const { currentRevenue, previousRevenue, percentageChange, sparklineData } = useMemo(() => {
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const previousMonth = subMonths(now, 1)
    const previousMonthStart = startOfMonth(previousMonth)
    const previousMonthEnd = endOfMonth(previousMonth)

    const currentMonthAppointments = (appointments || []).filter(apt => {
      const aptDate = parseISO(apt.date)
      return isWithinInterval(aptDate, { start: currentMonthStart, end: currentMonthEnd }) &&
        apt.status === 'completed' &&
        apt.paymentCompleted
    })

    const previousMonthAppointments = (appointments || []).filter(apt => {
      const aptDate = parseISO(apt.date)
      return isWithinInterval(aptDate, { start: previousMonthStart, end: previousMonthEnd }) &&
        apt.status === 'completed' &&
        apt.paymentCompleted
    })

    const currentRevenue = currentMonthAppointments.reduce((sum, apt) => sum + (apt.amountPaid || apt.price || 0), 0)
    const previousRevenue = previousMonthAppointments.reduce((sum, apt) => sum + (apt.amountPaid || apt.price || 0), 0)

    const percentageChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0 ? 100 : 0

    const daysInMonth = currentMonthEnd.getDate()
    const sparklineData: number[] = []
    
    for (let day = 1; day <= Math.min(daysInMonth, 30); day++) {
      const dayRevenue = currentMonthAppointments
        .filter(apt => new Date(apt.date).getDate() === day)
        .reduce((sum, apt) => sum + (apt.amountPaid || apt.price || 0), 0)
      sparklineData.push(dayRevenue)
    }

    return { currentRevenue, previousRevenue, percentageChange, sparklineData }
  }, [appointments])

  const maxValue = Math.max(...sparklineData, 1)
  const minValue = Math.min(...sparklineData)
  
  const pathData = sparklineData.length > 1 ? sparklineData.map((value, index) => {
    const x = (index / (sparklineData.length - 1)) * 100
    const y = 28 - ((value - minValue) / (maxValue - minValue || 1)) * 20
    return { x, y }
  }) : [{ x: 0, y: 28 }, { x: 100, y: 28 }]

  const linePath = pathData.map((point, i) => 
    i === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`
  ).join(' ')

  const areaPath = `${linePath} L100,28 L0,28 Z`

  const isPositive = percentageChange >= 0

  return (
    <div className="relative z-10">
      <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
        <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">Monthly Revenue</h3>
        <div className="p-1.5 rounded-lg bg-green-500/20">
          <CurrencyDollar size={14} className="text-green-400" />
        </div>
      </div>
      <div className="pb-0 pt-1 px-4 min-w-0">
        <div className="text-2xl font-bold text-white/95">
          ${currentRevenue.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isPositive ? (
            <TrendUp size={12} className="text-cyan-400" weight="bold" />
          ) : (
            <TrendDown size={12} className="text-red-400" weight="bold" />
          )}
          <span className={`text-[10px] font-semibold ${isPositive ? 'text-cyan-400' : 'text-red-400'}`}>
            {Math.abs(percentageChange).toFixed(1)}% from last month
          </span>
        </div>
      </div>
      <div className="px-4 pb-2 pt-1">
        <svg width="100%" height="28" viewBox="0 0 100 28" preserveAspectRatio="none" className="opacity-70">
          <defs>
            <linearGradient id="monthlyRevenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.70 0.20 210)" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="oklch(0.70 0.20 210)" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <path 
            d={areaPath.replace(/32/g, '28')} 
            fill="url(#monthlyRevenueGradient)"
          />
          <path 
            d={linePath.replace(/32/g, '28')} 
            stroke="oklch(0.70 0.20 210)" 
            strokeWidth="2" 
            fill="none" 
            className="drop-shadow-[0_0_4px_oklch(0.70_0.20_210)]"
          />
        </svg>
      </div>
    </div>
  )
}
