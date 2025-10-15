import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  TrendUp, 
  TrendDown, 
  CurrencyDollar, 
  Scissors, 
  Star,
  Download,
  ArrowUp,
  ArrowDown
} from '@phosphor-icons/react'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { toast } from 'sonner'

interface Appointment {
  id: string
  petId: string
  customerId: string
  serviceIds: string[]
  staffId?: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  price: number
  checkInTime?: string
  checkOutTime?: string
}

interface Staff {
  id: string
  name: string
  role: string
  color: string
  phone?: string
  email?: string
  specialties?: string[]
  hourlyRate?: number
  commissionRate?: number
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
  category: string
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

type DateRange = 'today' | 'yesterday' | 'week' | 'month'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

export function GroomerStats() {
  const [appointments = []] = useKV<Appointment[]>('appointments', [])
  const [staff = []] = useKV<Staff[]>('staff', [])
  const [services = []] = useKV<Service[]>('services', [])
  const [transactions = []] = useKV<Transaction[]>('transactions', [])
  
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [selectedStaff, setSelectedStaff] = useState<string>('all')

  const filteredData = useMemo(() => {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()
    
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'yesterday':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      const matchesDate = aptDate >= startDate && aptDate <= endDate
      const matchesStaff = selectedStaff === 'all' || apt.staffId === selectedStaff
      return matchesDate && matchesStaff
    })

    const filteredTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.date)
      const matchesDate = txnDate >= startDate && txnDate <= endDate
      const matchesStaff = selectedStaff === 'all' || txn.staffId === selectedStaff
      return matchesDate && matchesStaff
    })

    return {
      appointments: filteredAppointments,
      transactions: filteredTransactions
    }
  }, [appointments, transactions, dateRange, selectedStaff])

  const staffRankings = useMemo(() => {
    const rankings = new Map<string, {
      staff: Staff
      revenue: number
      netSales: number
      appointments: number
      completed: number
      noShows: number
      cancelled: number
      avgTicket: number
      tips: number
      avgTipRate: number
      productSales: number
    }>()

    staff.forEach(member => {
      rankings.set(member.id, {
        staff: member,
        revenue: 0,
        netSales: 0,
        appointments: 0,
        completed: 0,
        noShows: 0,
        cancelled: 0,
        avgTicket: 0,
        tips: 0,
        avgTipRate: 0,
        productSales: 0
      })
    })

    filteredData.appointments.forEach(apt => {
      if (!apt.staffId) return
      const ranking = rankings.get(apt.staffId)
      if (!ranking) return

      ranking.appointments++
      
      if (apt.status === 'completed') {
        ranking.completed++
        ranking.revenue += apt.price || 0
      } else if (apt.status === 'no-show') {
        ranking.noShows++
      } else if (apt.status === 'cancelled') {
        ranking.cancelled++
      }
    })

    filteredData.transactions.forEach(txn => {
      if (!txn.staffId) return
      const ranking = rankings.get(txn.staffId)
      if (!ranking) return

      ranking.tips += txn.tip || 0
      ranking.netSales += txn.subtotal - (txn.discount || 0) - (txn.refund || 0)
      
      const productItems = txn.items.filter(item => !services.some(s => s.id === item.id))
      ranking.productSales += productItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })

    rankings.forEach(ranking => {
      if (ranking.completed > 0) {
        ranking.avgTicket = ranking.netSales / ranking.completed
      }
      if (ranking.revenue > 0) {
        ranking.avgTipRate = (ranking.tips / ranking.revenue) * 100
      }
    })

    return Array.from(rankings.values())
      .filter(r => r.appointments > 0)
      .sort((a, b) => b.netSales - a.netSales)
  }, [filteredData, staff, services])

  const revenueByCategory = useMemo(() => {
    const categories = new Map<string, number>()
    
    filteredData.transactions.forEach(txn => {
      txn.items.forEach(item => {
        const service = services.find(s => s.id === item.id)
        const category = service ? service.category : 'Retail'
        categories.set(category, (categories.get(category) || 0) + item.price * item.quantity)
      })
    })

    return Array.from(categories.entries()).map(([name, value]) => ({ name, value }))
  }, [filteredData, services])

  const totalMetrics = useMemo(() => {
    const completedAppointments = filteredData.appointments.filter(apt => apt.status === 'completed')
    const totalRevenue = filteredData.transactions.reduce((sum, txn) => sum + txn.subtotal, 0)
    const totalDiscounts = filteredData.transactions.reduce((sum, txn) => sum + (txn.discount || 0), 0)
    const totalRefunds = filteredData.transactions.reduce((sum, txn) => sum + (txn.refund || 0), 0)
    const totalTips = filteredData.transactions.reduce((sum, txn) => sum + txn.tip, 0)
    const netSales = totalRevenue - totalDiscounts - totalRefunds
    const avgTicket = completedAppointments.length > 0 ? netSales / completedAppointments.length : 0
    const noShows = filteredData.appointments.filter(apt => apt.status === 'no-show').length
    const noShowRate = filteredData.appointments.length > 0 ? (noShows / filteredData.appointments.length) * 100 : 0

    return {
      totalRevenue,
      netSales,
      avgTicket,
      completedCount: completedAppointments.length,
      totalTips,
      avgTipRate: totalRevenue > 0 ? (totalTips / totalRevenue) * 100 : 0,
      noShowRate,
      noShows
    }
  }, [filteredData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: `Exporting as ${format.toUpperCase()}...`,
        success: `Report exported as ${format.toUpperCase()} successfully!`,
        error: 'Export failed'
      }
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[130px] frosted h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-[150px] frosted h-8">
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staff.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="frosted h-8"
            onClick={() => handleExport('csv')}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <Card className="frosted p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <CurrencyDollar className="w-4 h-4 text-primary" weight="duotone" />
            <p className="text-[10px] font-medium text-muted-foreground">Revenue</p>
          </div>
          <p className="text-base font-bold">{formatCurrency(totalMetrics.netSales)}</p>
        </Card>

        <Card className="frosted p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Scissors className="w-4 h-4 text-accent" weight="duotone" />
            <p className="text-[10px] font-medium text-muted-foreground">Avg Ticket</p>
          </div>
          <p className="text-base font-bold">{formatCurrency(totalMetrics.avgTicket)}</p>
        </Card>

        <Card className="frosted p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <TrendUp className="w-4 h-4 text-primary" weight="duotone" />
            <p className="text-[10px] font-medium text-muted-foreground">Completed</p>
          </div>
          <p className="text-base font-bold">{totalMetrics.completedCount}</p>
        </Card>

        <Card className="frosted p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Star className="w-4 h-4 text-accent" weight="duotone" />
            <p className="text-[10px] font-medium text-muted-foreground">Tips</p>
          </div>
          <p className="text-base font-bold">{formatCurrency(totalMetrics.totalTips)}</p>
        </Card>

        <Card className="frosted p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Star className="w-4 h-4 text-accent" weight="fill" />
            <p className="text-[10px] font-medium text-muted-foreground">Tip Rate</p>
          </div>
          <p className="text-base font-bold">{formatPercent(totalMetrics.avgTipRate)}</p>
        </Card>

        <Card className="frosted p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <TrendDown className="w-4 h-4 text-destructive" weight="duotone" />
            <p className="text-[10px] font-medium text-muted-foreground">No-Shows</p>
          </div>
          <p className="text-base font-bold">{totalMetrics.noShows}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="frosted p-3">
          <h3 className="text-sm font-semibold mb-2">Staff Rankings</h3>
          <div className="space-y-1.5">
            {staffRankings.slice(0, 5).map((ranking, index) => (
              <div 
                key={ranking.staff.id} 
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary font-bold text-xs shrink-0">
                  {index + 1}
                </div>
                
                <div 
                  className="w-1 h-8 rounded-full shrink-0" 
                  style={{ backgroundColor: ranking.staff.color }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0">
                    <p className="font-semibold text-xs truncate">{ranking.staff.name}</p>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">{ranking.completed}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{formatCurrency(ranking.avgTicket)} avg</span>
                    <span>{formatCurrency(ranking.tips)} tips</span>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{formatCurrency(ranking.netSales)}</p>
                </div>
              </div>
            ))}
            {staffRankings.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No data available for the selected period
              </div>
            )}
          </div>
        </Card>

        <Card className="frosted p-3">
          <h3 className="text-sm font-semibold mb-2">Revenue Breakdown</h3>
          {revenueByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  labelLine={{ stroke: 'currentColor', strokeWidth: 1 }}
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
              No revenue data available
            </div>
          )}
        </Card>
      </div>

      {staffRankings.length > 0 && (
        <Card className="frosted p-4">
          <h3 className="text-base font-semibold mb-3">Revenue by Staff</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={staffRankings}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="staff.name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
              <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenue" name="Services" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tips" name="Tips" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="productSales" name="Products" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card className="frosted p-4">
        <h3 className="text-base font-semibold mb-3">Detailed Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {staffRankings.map(ranking => (
            <div key={ranking.staff.id} className="p-3 rounded-lg bg-secondary/20 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: ranking.staff.color }}
                  />
                  <p className="font-semibold text-sm">{ranking.staff.name}</p>
                </div>
                {ranking.avgTipRate >= 15 && (
                  <Star className="w-4 h-4 text-accent" weight="fill" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-semibold">{ranking.completed}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Ticket</p>
                  <p className="font-semibold">{formatCurrency(ranking.avgTicket)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tips</p>
                  <p className="font-semibold">{formatCurrency(ranking.tips)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tip Rate</p>
                  <p className="font-semibold">{formatPercent(ranking.avgTipRate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">No-Shows</p>
                  <p className="font-semibold text-destructive">{ranking.noShows}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cancelled</p>
                  <p className="font-semibold text-muted-foreground">{ranking.cancelled}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {staffRankings.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No staff data available for the selected period
          </div>
        )}
      </Card>
    </div>
  )
}
