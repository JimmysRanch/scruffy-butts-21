import { useKV } from '@github/spark/hooks'
import { useMemo } from 'react'
import { RevenueTodayGauge } from './RevenueTodayGauge'

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

  return (
    <div className="relative z-10 h-full">
      <RevenueTodayGauge actual={todayRevenue} expected={expectedRevenue} />
    </div>
  )
}
