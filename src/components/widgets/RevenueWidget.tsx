import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendUp, TrendDown, CurrencyDollar } from '@phosphor-icons/react'
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns'

interface Transaction {
  id: string
  total: number
  timestamp: Date | string
}

interface RevenueWidgetProps {
  period: 'today' | 'week' | 'month'
}

export function RevenueWidget({ period }: RevenueWidgetProps) {
  const [transactions] = useKV<Transaction[]>('transactions', [])

  const getRevenue = () => {
    if (!transactions) return { current: 0, previous: 0, label: '' }

    const now = new Date()
    let currentStart: Date
    let currentEnd: Date
    let previousStart: Date
    let previousEnd: Date
    let label: string

    switch (period) {
      case 'today':
        currentStart = new Date(now.setHours(0, 0, 0, 0))
        currentEnd = new Date(now.setHours(23, 59, 59, 999))
        previousStart = new Date(currentStart)
        previousStart.setDate(previousStart.getDate() - 1)
        previousEnd = new Date(previousStart)
        previousEnd.setHours(23, 59, 59, 999)
        label = "Today's Revenue"
        break
      case 'week':
        currentStart = startOfWeek(now)
        currentEnd = endOfWeek(now)
        previousStart = new Date(currentStart)
        previousStart.setDate(previousStart.getDate() - 7)
        previousEnd = new Date(currentEnd)
        previousEnd.setDate(previousEnd.getDate() - 7)
        label = "This Week's Revenue"
        break
      case 'month':
        currentStart = startOfMonth(now)
        currentEnd = endOfMonth(now)
        previousStart = new Date(currentStart)
        previousStart.setMonth(previousStart.getMonth() - 1)
        previousEnd = endOfMonth(previousStart)
        label = "This Month's Revenue"
        break
    }

    const current = transactions
      .filter(t => {
        try {
          const date = new Date(t.timestamp)
          if (isNaN(date.getTime())) return false
          return date >= currentStart && date <= currentEnd
        } catch {
          return false
        }
      })
      .reduce((sum, t) => sum + t.total, 0)

    const previous = transactions
      .filter(t => {
        try {
          const date = new Date(t.timestamp)
          if (isNaN(date.getTime())) return false
          return date >= previousStart && date <= previousEnd
        } catch {
          return false
        }
      })
      .reduce((sum, t) => sum + t.total, 0)

    return { current, previous, label }
  }

  const { current, previous, label } = getRevenue()
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
  const isPositive = change >= 0

  return (
    <Card className="h-full border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-xs font-medium">{label}</CardTitle>
        <div className="glass-dark p-1 rounded-lg">
          <CurrencyDollar className="h-3 w-3 text-accent" weight="fill" />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-lg font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
          ${current.toFixed(2)}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
          {isPositive ? (
            <TrendUp className="h-2 w-2 text-emerald-600" weight="fill" />
          ) : (
            <TrendDown className="h-2 w-2 text-red-600" weight="fill" />
          )}
          <span className={isPositive ? 'text-emerald-600' : 'text-red-600'}>
            {Math.abs(change).toFixed(1)}%
          </span>
          {' '}from {period === 'today' ? 'yesterday' : period === 'week' ? 'last week' : 'last month'}
        </p>
      </CardContent>
    </Card>
  )
}
