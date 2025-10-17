import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendUp, TrendDown, CurrencyDollar } from '@phosphor-icons/react'
import { useMemo } from 'react'

interface Transaction {
  id: string
  total: number
  timestamp: Date | string
}

export function RevenueGaugeWidget() {
  const [transactions] = useKV<Transaction[]>('transactions', [])

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

  return (
    <div className="glass-widget rounded-2xl cursor-pointer min-w-0">
      <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3">
        <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/90">Today's Revenue</h3>
      </div>
      <div className="pb-2 pt-1 px-3 min-w-0">
        <div className="text-2xl font-bold bg-gradient-to-br from-accent via-primary to-accent bg-clip-text text-transparent">
          ${Math.round(todayRevenue)}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 overflow-hidden">
          {isPositive ? (
            <TrendUp className="h-3 w-3 text-emerald-400 shrink-0" weight="bold" />
          ) : (
            <TrendDown className="h-3 w-3 text-red-400 shrink-0" weight="bold" />
          )}
          <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
            {Math.abs(Math.round(percentChange))}%
          </span>
          <span className="truncate">vs. yesterday</span>
        </p>
      </div>
    </div>
  )
}
