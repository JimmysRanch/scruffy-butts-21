import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { TrendUp, TrendDown } from '@phosphor-icons/react'
import { useMemo } from 'react'

interface Transaction {
  id: string
  total: number
  timestamp: Date | string
}

export function RevenueGaugeWidget() {
  const [transactions] = useKV<Transaction[]>('transactions', [])
  const [expectedRevenue] = useKV<number>('expected-daily-revenue', 300)

  const { todayRevenue, yesterdayRevenue } = useMemo(() => {
    if (!transactions) return { todayRevenue: 0, yesterdayRevenue: 0 }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = new Date(todayEnd)
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)

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

    const yesterdayRevenue = transactions
      .filter(t => {
        try {
          const date = new Date(t.timestamp)
          if (isNaN(date.getTime())) return false
          return date >= yesterdayStart && date <= yesterdayEnd
        } catch {
          return false
        }
      })
      .reduce((sum, t) => sum + t.total, 0)

    return { todayRevenue, yesterdayRevenue }
  }, [transactions])

  const percentChange = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
    : todayRevenue > 0 ? 100 : 0
  
  const isPositive = percentChange >= 0

  const expected = expectedRevenue || 300
  const gaugePercentage = Math.min((todayRevenue / expected) * 100, 100)
  const gaugeRotation = (gaugePercentage / 100) * 180

  return (
    <Card className="glass border-white/20 col-span-full md:col-span-2 lg:col-span-2 p-8">
      <CardContent className="p-0 flex flex-col items-center">
        <div className="w-full mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1e3a5f] dark:text-foreground mb-1">
            Revenue
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground">Today</p>
        </div>

        <div className="relative w-full max-w-md aspect-[2/1] mb-8">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="100%" stopColor="#2d5a8f" />
              </linearGradient>
            </defs>
            
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
              strokeLinecap="round"
            />
            
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${(gaugePercentage / 100) * 251.2} 251.2`}
              style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
            />
            
            <g transform={`rotate(${gaugeRotation - 90} 100 100)`}>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="30"
                stroke="#6b7280"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="12" fill="#6b7280" />
              <circle cx="100" cy="100" r="6" fill="white" />
            </g>
          </svg>
        </div>

        <div className="flex items-end justify-center gap-12 mb-6 w-full">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-[#1e3a5f] dark:text-foreground">
              ${Math.round(todayRevenue)}
            </div>
            <p className="text-lg md:text-xl text-muted-foreground mt-1">Actual</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-medium text-muted-foreground">
              {Math.round(expected)}
            </div>
            <p className="text-base md:text-lg text-muted-foreground mt-1">Expected</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-lg md:text-xl text-muted-foreground">
          {isPositive ? (
            <TrendUp className="h-6 w-6 text-emerald-600" weight="bold" />
          ) : (
            <TrendDown className="h-6 w-6 text-red-600" weight="bold" />
          )}
          <span className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {Math.abs(Math.round(percentChange))}%
          </span>
          <span>up from Yesterday</span>
        </div>
      </CardContent>
    </Card>
  )
}
