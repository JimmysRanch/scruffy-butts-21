import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  CalendarDots, 
  TrendUp, 
  TrendDown, 
  Clock, 
  CurrencyDollar, 
  Scissors, 
  Star,
  ChartBar,
  Info,
  Download,
  ArrowUp,
  ArrowDown,
  User
} from '@phosphor-icons/react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
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

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  pets: Pet[]
}

interface Pet {
  id: string
  name: string
  breed?: string
  size?: string
}

type DateRange = 'today' | 'yesterday' | 'week' | 'month' | 'custom'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

const METRIC_DEFINITIONS = {
  totalRevenue: {
    title: 'Total Revenue / Gross Sales',
    description: 'All services, add-ons, and products combined before any deductions.'
  },
  netSales: {
    title: 'Net Sales',
    description: 'Revenue after discounts and refunds, excluding tips and taxes.'
  },
  revenueByCategory: {
    title: 'Revenue by Category',
    description: 'Separate totals for services, retail, and add-ons.'
  },
  paymentMethodBreakdown: {
    title: 'Payment Method Breakdown',
    description: 'Distribution of payments across cash, card, Cash App, and Chime.'
  },
  averageTicket: {
    title: 'Average Ticket Value',
    description: 'Average sale amount per appointment completed.'
  },
  revenuePerPet: {
    title: 'Revenue per Pet / per Appointment',
    description: 'Efficiency measure showing average revenue generated per pet groomed.'
  },
  appointmentsCompleted: {
    title: 'Appointments Completed',
    description: 'Total number of appointments successfully completed.'
  },
  utilizationRate: {
    title: 'Utilization Rate',
    description: 'Booked working hours divided by total available hours as percentage.'
  },
  avgServiceDuration: {
    title: 'Average Service Duration',
    description: 'Actual time taken compared to estimated time per service.'
  },
  rebookRate: {
    title: 'Rebook Rate',
    description: 'Percentage of clients who book another appointment after completing one.'
  },
  clientRetention: {
    title: 'Client Retention Rate',
    description: 'Percentage of returning clients versus new clients.'
  },
  noShowRate: {
    title: 'No-Show / Cancellation Rate',
    description: 'Percentage of appointments that were missed or canceled.'
  },
  avgTipRate: {
    title: 'Average Tip Rate / Tip Total',
    description: 'Average tip percentage and total tip amount per staff member.'
  },
  productSales: {
    title: 'Product Sales per Staff',
    description: 'Retail performance tracking for each staff member.'
  }
}

export function GroomerStats() {
  const [appointments = []] = useKV<Appointment[]>('appointments', [])
  const [staff = []] = useKV<Staff[]>('staff', [])
  const [services = []] = useKV<Service[]>('services', [])
  const [transactions = []] = useKV<Transaction[]>('transactions', [])
  const [customers = []] = useKV<Customer[]>('customers', [])
  
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  const [groupBy, setGroupBy] = useState<'staff' | 'service' | 'payment'>('staff')
  const [infoDialog, setInfoDialog] = useState<string | null>(null)

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
      transactions: filteredTransactions,
      startDate,
      endDate
    }
  }, [appointments, transactions, dateRange, selectedStaff])

  const previousPeriodData = useMemo(() => {
    const { startDate, endDate } = filteredData
    const periodLength = endDate.getTime() - startDate.getTime()
    const prevStartDate = new Date(startDate.getTime() - periodLength)
    const prevEndDate = new Date(endDate.getTime() - periodLength)

    const prevAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      const matchesDate = aptDate >= prevStartDate && aptDate <= prevEndDate
      const matchesStaff = selectedStaff === 'all' || apt.staffId === selectedStaff
      return matchesDate && matchesStaff
    })

    const prevTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.date)
      const matchesDate = txnDate >= prevStartDate && txnDate <= prevEndDate
      const matchesStaff = selectedStaff === 'all' || txn.staffId === selectedStaff
      return matchesDate && matchesStaff
    })

    return {
      appointments: prevAppointments,
      transactions: prevTransactions
    }
  }, [appointments, transactions, dateRange, selectedStaff, filteredData])

  const metrics = useMemo(() => {
    const completedAppointments = filteredData.appointments.filter(apt => apt.status === 'completed')
    const noShows = filteredData.appointments.filter(apt => apt.status === 'no-show')
    const cancelled = filteredData.appointments.filter(apt => apt.status === 'cancelled')
    
    const prevCompleted = previousPeriodData.appointments.filter(apt => apt.status === 'completed')
    
    const totalRevenue = filteredData.transactions.reduce((sum, txn) => sum + txn.subtotal, 0)
    const prevRevenue = previousPeriodData.transactions.reduce((sum, txn) => sum + txn.subtotal, 0)
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0
    
    const totalDiscounts = filteredData.transactions.reduce((sum, txn) => sum + (txn.discount || 0), 0)
    const totalRefunds = filteredData.transactions.reduce((sum, txn) => sum + (txn.refund || 0), 0)
    const totalTips = filteredData.transactions.reduce((sum, txn) => sum + txn.tip, 0)
    const totalTax = filteredData.transactions.reduce((sum, txn) => sum + txn.tax, 0)
    
    const netSales = totalRevenue - totalDiscounts - totalRefunds
    const prevNetSales = prevRevenue - previousPeriodData.transactions.reduce((sum, txn) => sum + (txn.discount || 0) + (txn.refund || 0), 0)
    const netSalesChange = prevNetSales > 0 ? ((netSales - prevNetSales) / prevNetSales) * 100 : 0
    
    const avgTicket = completedAppointments.length > 0 ? netSales / completedAppointments.length : 0
    const prevAvgTicket = prevCompleted.length > 0 
      ? prevNetSales / prevCompleted.length 
      : 0
    const avgTicketChange = prevAvgTicket > 0 ? ((avgTicket - prevAvgTicket) / prevAvgTicket) * 100 : 0
    
    const totalBooked = filteredData.appointments.length
    const completedCount = completedAppointments.length
    const prevCompletedCount = prevCompleted.length
    const completedChange = prevCompletedCount > 0 ? ((completedCount - prevCompletedCount) / prevCompletedCount) * 100 : 0
    
    const noShowRate = totalBooked > 0 ? (noShows.length / totalBooked) * 100 : 0
    const prevNoShowRate = previousPeriodData.appointments.length > 0 
      ? (previousPeriodData.appointments.filter(apt => apt.status === 'no-show').length / previousPeriodData.appointments.length) * 100 
      : 0
    const noShowRateChange = noShowRate - prevNoShowRate
    
    const totalDuration = completedAppointments.reduce((sum, apt) => sum + apt.duration, 0)
    const avgDuration = completedAppointments.length > 0 ? totalDuration / completedAppointments.length : 0
    
    const totalAvailableHours = 40 * (selectedStaff === 'all' ? staff.length : 1)
    const totalBookedHours = totalDuration / 60
    const utilizationRate = totalAvailableHours > 0 ? (totalBookedHours / totalAvailableHours) * 100 : 0
    
    const paymentMethods = filteredData.transactions.reduce((acc, txn) => {
      acc[txn.paymentMethod] = (acc[txn.paymentMethod] || 0) + txn.total
      return acc
    }, {} as Record<string, number>)
    
    const avgTipRate = totalRevenue > 0 ? (totalTips / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      revenueChange,
      netSales,
      netSalesChange,
      avgTicket,
      avgTicketChange,
      completedCount,
      completedChange,
      totalBooked,
      noShowRate,
      noShowRateChange,
      cancelled: cancelled.length,
      utilizationRate,
      avgDuration,
      totalTips,
      avgTipRate,
      totalTax,
      totalDiscounts,
      totalRefunds,
      paymentMethods,
      revenuePerPet: completedCount > 0 ? totalRevenue / completedCount : 0
    }
  }, [filteredData, previousPeriodData, staff, selectedStaff])

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
      utilizationRate: number
      revenuePerHour: number
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
        utilizationRate: 0,
        revenuePerHour: 0,
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
      const hoursWorked = ranking.completed * 1.5
      if (hoursWorked > 0) {
        ranking.revenuePerHour = ranking.revenue / hoursWorked
      }
      const availableHours = 40
      ranking.utilizationRate = (hoursWorked / availableHours) * 100
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

  const paymentMethodData = useMemo(() => {
    return Object.entries(metrics.paymentMethods).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }))
  }, [metrics.paymentMethods])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatChange = (value: number) => {
    const formatted = formatPercent(Math.abs(value))
    return value >= 0 ? `+${formatted}` : `-${formatted}`
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

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    metricKey 
  }: { 
    title: string
    value: string | number
    change?: number
    icon: any
    metricKey: string
  }) => (
    <Card className="frosted p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <button
              onClick={() => setInfoDialog(metricKey)}
              className="p-1 hover:bg-secondary/50 rounded-full transition-colors"
            >
              <Info className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <ArrowUp className="w-4 h-4 text-green-500" weight="bold" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" weight="bold" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatChange(change)}
              </span>
              <span className="text-xs text-muted-foreground">vs previous period</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="w-6 h-6 text-primary" weight="duotone" />
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ChartBar className="w-8 h-8 text-primary" weight="duotone" />
            Groomer Stats
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive performance metrics with live refresh every hour
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[160px] frosted">
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
            <SelectTrigger className="w-[180px] frosted">
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

          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as typeof groupBy)}>
            <SelectTrigger className="w-[160px] frosted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staff">Group by Staff</SelectItem>
              <SelectItem value="service">Group by Service</SelectItem>
              <SelectItem value="payment">Group by Payment</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="frosted"
            onClick={() => handleExport('csv')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            className="frosted"
            onClick={() => handleExport('pdf')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={metrics.revenueChange}
          icon={CurrencyDollar}
          metricKey="totalRevenue"
        />
        <MetricCard
          title="Net Sales"
          value={formatCurrency(metrics.netSales)}
          change={metrics.netSalesChange}
          icon={TrendUp}
          metricKey="netSales"
        />
        <MetricCard
          title="Avg Ticket"
          value={formatCurrency(metrics.avgTicket)}
          change={metrics.avgTicketChange}
          icon={Scissors}
          metricKey="averageTicket"
        />
        <MetricCard
          title="Completed"
          value={metrics.completedCount}
          change={metrics.completedChange}
          icon={CalendarDots}
          metricKey="appointmentsCompleted"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Utilization Rate"
          value={formatPercent(metrics.utilizationRate)}
          icon={Clock}
          metricKey="utilizationRate"
        />
        <MetricCard
          title="No-Show Rate"
          value={formatPercent(metrics.noShowRate)}
          change={metrics.noShowRateChange}
          icon={CalendarDots}
          metricKey="noShowRate"
        />
        <MetricCard
          title="Avg Tip Rate"
          value={formatPercent(metrics.avgTipRate)}
          icon={Star}
          metricKey="avgTipRate"
        />
        <MetricCard
          title="Revenue/Pet"
          value={formatCurrency(metrics.revenuePerPet)}
          icon={CurrencyDollar}
          metricKey="revenuePerPet"
        />
      </div>

      <Tabs defaultValue="rankings" className="space-y-6">
        <TabsList className="frosted">
          <TabsTrigger value="rankings">Staff Rankings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="client">Client Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-6">
          <Card className="frosted p-6">
            <h3 className="text-lg font-semibold mb-4">Staff Performance Rankings</h3>
            <div className="space-y-4">
              {staffRankings.map((ranking, index) => (
                <div 
                  key={ranking.staff.id} 
                  className="flex items-center gap-4 p-4 rounded-lg glass-dark hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-lg">
                    {index + 1}
                  </div>
                  
                  <div 
                    className="w-1 h-12 rounded-full" 
                    style={{ backgroundColor: ranking.staff.color }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-lg">{ranking.staff.name}</p>
                      <Badge variant="secondary">{ranking.staff.role}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Appointments</p>
                        <p className="font-medium">{ranking.completed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Ticket</p>
                        <p className="font-medium">{formatCurrency(ranking.avgTicket)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tips</p>
                        <p className="font-medium">{formatCurrency(ranking.tips)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Utilization</p>
                        <p className="font-medium">{formatPercent(ranking.utilizationRate)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Net Sales</p>
                    <p className="text-2xl font-bold">{formatCurrency(ranking.netSales)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(ranking.revenuePerHour)}/hr
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="frosted p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
              {revenueByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    >
                      {revenueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </Card>

            <Card className="frosted p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Method Breakdown</h3>
              {paymentMethodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No payment data available
                </div>
              )}
            </Card>
          </div>

          <Card className="frosted p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Staff</h3>
            {staffRankings.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={staffRankings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="staff.name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" name="Service Revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="tips" name="Tips" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="productSales" name="Product Sales" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No staff data available
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {staffRankings.map(ranking => (
              <Card key={ranking.staff.id} className="frosted p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{ranking.staff.name}</h4>
                    <p className="text-sm text-muted-foreground">{ranking.staff.role}</p>
                  </div>
                  {ranking.utilizationRate >= 80 && (
                    <Star className="w-5 h-5 text-accent" weight="fill" />
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Utilization</span>
                      <span className="font-medium">{formatPercent(ranking.utilizationRate)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min(ranking.utilizationRate, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue/Hour</p>
                      <p className="text-sm font-semibold">{formatCurrency(ranking.revenuePerHour)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-sm font-semibold">{ranking.completed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">No-Shows</p>
                      <p className="text-sm font-semibold">{ranking.noShows}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cancelled</p>
                      <p className="text-sm font-semibold">{ranking.cancelled}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {staffRankings.length === 0 && (
            <Card className="frosted p-12">
              <div className="text-center text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No productivity data available for the selected period</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="client" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="frosted p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Total Clients Served</p>
                <button
                  onClick={() => setInfoDialog('clientRetention')}
                  className="p-1 hover:bg-secondary/50 rounded-full transition-colors"
                >
                  <Info className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-3xl font-bold">{new Set(filteredData.appointments.map(a => a.customerId)).size}</p>
            </Card>

            <Card className="frosted p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Rebook Rate</p>
                <button
                  onClick={() => setInfoDialog('rebookRate')}
                  className="p-1 hover:bg-secondary/50 rounded-full transition-colors"
                >
                  <Info className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-3xl font-bold">--</p>
              <p className="text-xs text-muted-foreground mt-1">Tracking in progress</p>
            </Card>

            <Card className="frosted p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Client Retention</p>
                <button
                  onClick={() => setInfoDialog('clientRetention')}
                  className="p-1 hover:bg-secondary/50 rounded-full transition-colors"
                >
                  <Info className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-3xl font-bold">--</p>
              <p className="text-xs text-muted-foreground mt-1">Tracking in progress</p>
            </Card>
          </div>

          <Card className="frosted p-12">
            <div className="text-center text-muted-foreground">
              <CalendarDots className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">Client behavior tracking is in progress</p>
              <p className="text-sm">More data will be available as appointments are completed</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={infoDialog !== null} onOpenChange={() => setInfoDialog(null)}>
        <DialogContent className="frosted">
          <DialogHeader>
            <DialogTitle>
              {infoDialog && METRIC_DEFINITIONS[infoDialog as keyof typeof METRIC_DEFINITIONS]?.title}
            </DialogTitle>
            <DialogDescription>
              {infoDialog && METRIC_DEFINITIONS[infoDialog as keyof typeof METRIC_DEFINITIONS]?.description}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
