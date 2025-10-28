import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendUp, 
  TrendDown, 
  CurrencyDollar,
  Warning,
  Receipt,
  Wallet,
  CreditCard,
  Users,
  ShoppingCart,
  Percent,
  CalendarBlank
} from '@phosphor-icons/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart
} from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns'

interface FinanceDashboardProps {
  onNavigateToTab: (tab: string) => void
}

interface Transaction {
  id: string
  date: string
  customerId?: string
  staffId?: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  subtotal: number
  tax: number
  tip: number
  total: number
  paymentMethod: 'cash' | 'card' | 'cashapp' | 'chime'
  discount?: number
  refund?: number
}

export function FinanceDashboard({ onNavigateToTab }: FinanceDashboardProps) {
  const [transactions = []] = useKV<Transaction[]>('transactions', [])
  
  // Calculate monthly metrics
  const monthlyMetrics = useMemo(() => {
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return isWithinInterval(transactionDate, { start: currentMonthStart, end: currentMonthEnd })
    })

    const lastMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return isWithinInterval(transactionDate, { start: lastMonthStart, end: lastMonthEnd })
    })

    const moneyIn = currentMonthTransactions.reduce((sum, t) => sum + (t.total - (t.refund || 0)), 0)
    const lastMonthMoneyIn = lastMonthTransactions.reduce((sum, t) => sum + (t.total - (t.refund || 0)), 0)
    
    // Placeholder for expenses (would come from expenses data)
    const moneyOut = 0
    const lastMonthMoneyOut = 0

    const whatsLeft = moneyIn - moneyOut
    const lastMonthWhatsLeft = lastMonthMoneyIn - lastMonthMoneyOut

    const moneyInChange = lastMonthMoneyIn > 0 
      ? ((moneyIn - lastMonthMoneyIn) / lastMonthMoneyIn) * 100 
      : 0
    const moneyOutChange = lastMonthMoneyOut > 0 
      ? ((moneyOut - lastMonthMoneyOut) / lastMonthMoneyOut) * 100 
      : 0
    const whatsLeftChange = lastMonthWhatsLeft > 0 
      ? ((whatsLeft - lastMonthWhatsLeft) / lastMonthWhatsLeft) * 100 
      : 0

    return {
      moneyIn,
      moneyOut,
      whatsLeft,
      moneyInChange,
      moneyOutChange,
      whatsLeftChange
    }
  }, [transactions])

  // Generate monthly overview chart data
  const monthlyChartData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd })
      })

      const revenue = monthTransactions.reduce((sum, t) => sum + (t.total - (t.refund || 0)), 0)
      const expenses = 0 // Placeholder
      const profit = revenue - expenses

      months.push({
        month: format(monthDate, 'MMM'),
        revenue,
        expenses,
        profit
      })
    }
    return months
  }, [transactions])

  const actionCards = [
    { 
      title: 'Invoices', 
      icon: Receipt, 
      preview: '0 overdue', 
      total: '$0',
      action: 'View/Create',
      tab: 'invoices'
    },
    { 
      title: 'Payments', 
      icon: Wallet, 
      preview: 'Next payout', 
      total: '$0',
      action: 'View Ledger',
      tab: 'payments'
    },
    { 
      title: 'Expenses', 
      icon: TrendDown, 
      preview: '0 upcoming', 
      total: '$0',
      action: 'Manage',
      tab: 'expenses'
    },
    { 
      title: 'Taxes', 
      icon: Percent, 
      preview: 'QTD collected', 
      total: '$0',
      action: 'Open Taxes',
      tab: 'taxes'
    },
    { 
      title: 'Payroll', 
      icon: Users, 
      preview: 'Next run', 
      total: 'Not scheduled',
      action: 'Open Payroll',
      tab: 'payroll'
    },
    { 
      title: 'Vendors', 
      icon: Users, 
      preview: '0 active', 
      total: '',
      action: 'Manage',
      tab: 'vendors'
    },
    { 
      title: 'Purchase Orders', 
      icon: ShoppingCart, 
      preview: '0 outstanding', 
      total: '',
      action: 'Track',
      tab: 'purchase-orders'
    },
    { 
      title: 'Fees', 
      icon: CreditCard, 
      preview: 'MTD processor fees', 
      total: '$0',
      action: 'Review',
      tab: 'payments'
    }
  ]

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="frosted p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Money In (This Month)</h3>
              <TrendUp className="w-5 h-5 text-green-500" weight="duotone" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              ${monthlyMetrics.moneyIn.toFixed(2)}
            </div>
            <div className={`text-sm flex items-center gap-1 ${monthlyMetrics.moneyInChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {monthlyMetrics.moneyInChange >= 0 ? (
                <TrendUp className="w-4 h-4" weight="bold" />
              ) : (
                <TrendDown className="w-4 h-4" weight="bold" />
              )}
              {Math.abs(monthlyMetrics.moneyInChange).toFixed(1)}% vs previous month
            </div>
          </div>
        </Card>

        <Card className="frosted p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Money Out (This Month)</h3>
              <TrendDown className="w-5 h-5 text-orange-500" weight="duotone" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              ${monthlyMetrics.moneyOut.toFixed(2)}
            </div>
            <div className={`text-sm flex items-center gap-1 ${monthlyMetrics.moneyOutChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {monthlyMetrics.moneyOutChange <= 0 ? (
                <TrendDown className="w-4 h-4" weight="bold" />
              ) : (
                <TrendUp className="w-4 h-4" weight="bold" />
              )}
              {Math.abs(monthlyMetrics.moneyOutChange).toFixed(1)}% vs previous month
            </div>
          </div>
        </Card>

        <Card className="frosted p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">What's Left (This Month)</h3>
              <CurrencyDollar className="w-5 h-5 text-primary" weight="duotone" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              ${monthlyMetrics.whatsLeft.toFixed(2)}
            </div>
            <div className={`text-sm flex items-center gap-1 ${monthlyMetrics.whatsLeftChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {monthlyMetrics.whatsLeftChange >= 0 ? (
                <TrendUp className="w-4 h-4" weight="bold" />
              ) : (
                <TrendDown className="w-4 h-4" weight="bold" />
              )}
              {Math.abs(monthlyMetrics.whatsLeftChange).toFixed(1)}% vs previous month
            </div>
          </div>
        </Card>
      </div>

      {/* Alert Banner */}
      <Card className="frosted p-4 border-l-4 border-yellow-500">
        <div className="flex items-center gap-3">
          <Warning className="w-6 h-6 text-yellow-500" weight="duotone" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">No active alerts</p>
            <p className="text-xs text-muted-foreground">All financial tasks are up to date</p>
          </div>
        </div>
      </Card>

      {/* Monthly Overview Chart */}
      <Card className="frosted p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CalendarBlank className="w-5 h-5 text-primary" weight="duotone" />
          Monthly Overview
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <ChartTooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} name="Profit" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Action Card Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionCards.map((card) => {
            const Icon = card.icon
            return (
              <Card 
                key={card.title} 
                className="frosted p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => onNavigateToTab(card.tab)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className="w-6 h-6 text-primary" weight="duotone" />
                    <span className="text-xs text-muted-foreground">{card.preview}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{card.title}</h4>
                    {card.total && (
                      <p className="text-lg font-bold text-primary">{card.total}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    {card.action}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
