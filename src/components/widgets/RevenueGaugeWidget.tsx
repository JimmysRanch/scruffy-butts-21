import { useKV } from '@github/spark/hooks'
import { useMemo } from 'react'

interface Transaction {
  id: string
  total: number
  timestamp: Date | string
}

export function RevenueGaugeWidget() {
  const [transactions] = useKV<Transaction[]>('transactions', [])

  const { todayRevenue, expectedRevenue } = useMemo(() => {
    if (!transactions) return { todayRevenue: 150, expectedRevenue: 300 }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    const todayRevenue = transactions
      .filter(t => {
        try {
          const date = new Date(t.timestamp)
          if (isNaN(date.getTime())) return false
          return date >= todayStart && date <= todayEnd
        } catch {
          return false
        }
      })
      .reduce((sum, t) => sum + t.total, 0)

    const expectedRevenue = 300

    return { todayRevenue: todayRevenue || 150, expectedRevenue }
  }, [transactions])

  const progressPercentage = Math.min((todayRevenue / expectedRevenue) * 100, 100)
  
  const radius = 32
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference
  const center = 42

  return (
    <div className="relative z-10 h-full flex flex-col">
      <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
        <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">Revenue</h3>
      </div>
      <div className="flex-1 flex items-center justify-center pb-2 px-4">
        <div className="relative">
          <svg width="100" height="100" viewBox="0 0 84 84" className="transform -rotate-90">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.50 0.20 200)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="oklch(0.65 0.22 200)" stopOpacity="0.8"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="oklch(0.30 0.12 200 / 0.3)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter="url(#glow)"
              className="drop-shadow-[0_0_8px_oklch(0.65_0.22_200)]"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[9px] text-white/60 mb-0.5 font-medium">Today</div>
            <div className="text-2xl font-bold text-white/95">
              ${Math.round(todayRevenue)}
            </div>
            <div className="text-[9px] text-white/60 mt-0.5 font-medium">Actual</div>
          </div>
          
          <div className="absolute -right-12 top-1/2 -translate-y-1/2">
            <div className="text-[9px] text-white/60 font-medium">Expected</div>
            <div className="text-base font-bold text-white/80">{expectedRevenue}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
