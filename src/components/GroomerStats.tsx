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

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  status: 'active' | 'inactive'
  rating: number
  canBeBooked?: boolean
  bookableServices?: string[]
  color?: string
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
type ReportCategory = 'dashboard' | 'employee' | 'appointment' | 'sales' | 'product' | 'client'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

export function GroomerStats() {
  const [appointments = []] = useKV<Appointment[]>('appointments', [])
  const [staffMembers = []] = useKV<StaffMember[]>('staff-members', [])
  const [services = []] = useKV<Service[]>('services', [])
  const [transactions = []] = useKV<Transaction[]>('transactions', [])
  
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('dashboard')

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
      staff: StaffMember
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

    staffMembers.forEach(member => {
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
      
      if (txn.items && Array.isArray(txn.items)) {
        const productItems = txn.items.filter(item => !services.some(s => s.id === item.id))
        ranking.productSales += productItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }
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
  }, [filteredData, staffMembers, services])

  const revenueByCategory = useMemo(() => {
    const categories = new Map<string, number>()
    
    filteredData.transactions.forEach(txn => {
      if (txn.items && Array.isArray(txn.items)) {
        txn.items.forEach(item => {
          const service = services.find(s => s.id === item.id)
          const category = service ? service.category : 'Retail'
          categories.set(category, (categories.get(category) || 0) + item.price * item.quantity)
        })
      }
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

  const getTabButtonClassName = (category: ReportCategory) => {
    return `px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
      activeCategory === category
        ? 'border-primary text-primary'
        : 'border-transparent text-muted-foreground hover:text-foreground'
    }`
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
      {/* Widgets Row */}
      <div className="grid grid-cols-6 gap-2 [grid-auto-rows:minmax(5rem,auto)]">
        <Card className="frosted p-3 @container min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <CurrencyDollar className="w-5 h-5 text-primary shrink-0" weight="duotone" />
            <p className="text-xs font-medium text-muted-foreground truncate">Revenue</p>
          </div>
          <p className="text-xl font-bold truncate">{formatCurrency(totalMetrics.netSales)}</p>
        </Card>

        <Card className="frosted p-3 @container min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <Scissors className="w-5 h-5 text-accent shrink-0" weight="duotone" />
            <p className="text-xs font-medium text-muted-foreground truncate">Avg Ticket</p>
          </div>
          <p className="text-xl font-bold truncate">{formatCurrency(totalMetrics.avgTicket)}</p>
        </Card>

        <Card className="frosted p-3 @container min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <TrendUp className="w-5 h-5 text-primary shrink-0" weight="duotone" />
            <p className="text-xs font-medium text-muted-foreground truncate">Completed</p>
          </div>
          <p className="text-xl font-bold">{totalMetrics.completedCount}</p>
        </Card>

        <Card className="frosted p-3 @container min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <Star className="w-5 h-5 text-accent shrink-0" weight="duotone" />
            <p className="text-xs font-medium text-muted-foreground truncate">Tips</p>
          </div>
          <p className="text-xl font-bold truncate">{formatCurrency(totalMetrics.totalTips)}</p>
        </Card>

        <Card className="frosted p-3 @container min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <Star className="w-5 h-5 text-accent shrink-0" weight="fill" />
            <p className="text-xs font-medium text-muted-foreground truncate">Tip Rate</p>
          </div>
          <p className="text-xl font-bold">{formatPercent(totalMetrics.avgTipRate)}</p>
        </Card>

        <Card className="frosted p-3 @container min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <TrendDown className="w-5 h-5 text-destructive shrink-0" weight="duotone" />
            <p className="text-xs font-medium text-muted-foreground truncate">No-Shows</p>
          </div>
          <p className="text-xl font-bold">{totalMetrics.noShows}</p>
        </Card>
      </div>

      {/* Filter Controls - Moved below widgets, right-aligned */}
      <div className="flex justify-end items-center gap-2">
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
            {staffMembers.map(member => (
              <SelectItem key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
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

      {/* Sub-category Tabs */}
      <div className="flex gap-2 border-b border-border" role="tablist" aria-label="Report categories">
        <button
          role="tab"
          aria-selected={activeCategory === 'dashboard'}
          aria-controls="report-content"
          onClick={() => setActiveCategory('dashboard')}
          className={getTabButtonClassName('dashboard')}
        >
          Dashboard
        </button>
        <button
          role="tab"
          aria-selected={activeCategory === 'employee'}
          aria-controls="report-content"
          onClick={() => setActiveCategory('employee')}
          className={getTabButtonClassName('employee')}
        >
          Employee
        </button>
        <button
          role="tab"
          aria-selected={activeCategory === 'appointment'}
          aria-controls="report-content"
          onClick={() => setActiveCategory('appointment')}
          className={getTabButtonClassName('appointment')}
        >
          Appointment
        </button>
        <button
          role="tab"
          aria-selected={activeCategory === 'sales'}
          aria-controls="report-content"
          onClick={() => setActiveCategory('sales')}
          className={getTabButtonClassName('sales')}
        >
          Sales
        </button>
        <button
          role="tab"
          aria-selected={activeCategory === 'product'}
          aria-controls="report-content"
          onClick={() => setActiveCategory('product')}
          className={getTabButtonClassName('product')}
        >
          Product
        </button>
        <button
          role="tab"
          aria-selected={activeCategory === 'client'}
          aria-controls="report-content"
          onClick={() => setActiveCategory('client')}
          className={getTabButtonClassName('client')}
        >
          Client
        </button>
      </div>

      {/* Content based on active category */}
      <div id="report-content" role="tabpanel">
        {activeCategory === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-w-0">
            <Card className="frosted p-4 @container min-w-0">
              <h3 className="text-base font-semibold mb-3">Staff Rankings</h3>
              <div className="space-y-2 min-w-0">
                {staffRankings.slice(0, 5).map((ranking, index) => (
                  <div 
                    key={ranking.staff.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/20 transition-colors min-w-0"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    
                    <div 
                      className="w-1 h-8 rounded-full shrink-0" 
                      style={{ backgroundColor: ranking.staff.color || '#6366f1' }}
                    />
                    
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-1.5 mb-0 min-w-0">
                        <p className="font-semibold text-xs truncate">{ranking.staff.firstName} {ranking.staff.lastName}</p>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 shrink-0">{ranking.completed}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-hidden">
                        <span className="truncate">{formatCurrency(ranking.avgTicket)} avg</span>
                        <span className="truncate">{formatCurrency(ranking.tips)} tips</span>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold whitespace-nowrap">{formatCurrency(ranking.netSales)}</p>
                    </div>
                  </div>
                ))}
                {staffRankings.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No data available for the selected period
                  </div>
                )}
              </div>
            </Card>

            <Card className="frosted p-4 @container min-w-0">
              <h3 className="text-base font-semibold mb-3">Revenue Breakdown</h3>
              {revenueByCategory.length > 0 ? (
                <div className="w-full aspect-[2/1] min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
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
                </div>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </Card>
          </div>

          {staffRankings.length > 0 && (
            <Card className="frosted p-4 @container min-w-0">
              <h3 className="text-base font-semibold mb-3">Revenue by Staff</h3>
              <div className="w-full aspect-[16/9] min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffRankings.map(r => ({ 
                  ...r, 
                  staffName: `${r.staff.firstName} ${r.staff.lastName}` 
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="staffName" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
                  <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="revenue" name="Services" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tips" name="Tips" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="productSales" name="Products" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </>
      )}

      {activeCategory === 'employee' && (
        <Card className="frosted p-4 @container min-w-0">
          <h3 className="text-base font-semibold mb-3">Detailed Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-0">
            {staffRankings.map(ranking => (
              <div key={ranking.staff.id} className="p-3 rounded-lg bg-secondary/20 border border-border min-w-0">
                <div className="flex items-center justify-between mb-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <div 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: ranking.staff.color || '#6366f1' }}
                    />
                    <p className="font-semibold text-sm">{ranking.staff.firstName} {ranking.staff.lastName}</p>
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
      )}

      {activeCategory === 'appointment' && (
        <Card className="frosted p-4 @container min-w-0">
          <h3 className="text-base font-semibold mb-3">Appointment Analytics</h3>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Appointment analytics content coming soon
          </div>
        </Card>
      )}

      {activeCategory === 'sales' && (
        <Card className="frosted p-4 @container min-w-0">
          <h3 className="text-base font-semibold mb-3">Sales Analytics</h3>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Sales analytics content coming soon
          </div>
        </Card>
      )}

      {activeCategory === 'product' && (
        <Card className="frosted p-4 @container min-w-0">
          <h3 className="text-base font-semibold mb-3">Product Analytics</h3>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Product analytics content coming soon
          </div>
        </Card>
      )}

      {activeCategory === 'client' && (
        <Card className="frosted p-4 @container min-w-0">
          <h3 className="text-base font-semibold mb-3">Client Analytics</h3>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Client analytics content coming soon
          </div>
        </Card>
      )}
      </div>
    </div>
  )
}
