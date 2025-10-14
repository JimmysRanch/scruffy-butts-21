import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  CurrencyDollar, 
  CalendarBlank, 
  TrendUp, 
  Users, 
  ChartBar,
  FileText,
  Download,
  Star,
  Clock,
  Dog
} from '@phosphor-icons/react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, isWithinInterval, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface Appointment {
  id: string
  petName: string
  customerFirstName: string
  customerLastName: string
  customerId: string
  service: string
  date: string
  time: string
  duration: number
  price: number
  status: 'scheduled' | 'completed' | 'cancelled'
  staffId?: string
  notes?: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  pets: Pet[]
}

interface Pet {
  id: string
  name: string
  breed: string
  size: 'small' | 'medium' | 'large'
  notes?: string
}

interface Staff {
  id: string
  name: string
  role: string
  email: string
  phone: string
  color: string
  active: boolean
}

interface Transaction {
  id: string
  date: string
  items: Array<{
    name: string
    price: number
    quantity: number
  }>
  subtotal: number
  tax: number
  tip: number
  total: number
  paymentMethod: string
  customerId?: string
  appointmentId?: string
}

type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom'

export function Reports() {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [staff] = useKV<Staff[]>('staff', [])
  const [transactions] = useKV<Transaction[]>('transactions', [])
  const [appearance] = useKV<{ compactMode?: boolean }>('appearance-settings', {})

  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [customStartDate, setCustomStartDate] = useState<Date>()
  const [customEndDate, setCustomEndDate] = useState<Date>()
  const [selectedStaff, setSelectedStaff] = useState<string>('all')

  const isCompact = appearance?.compactMode || false

  const getDateRangeFilter = () => {
    const now = new Date()
    
    switch (dateRange) {
      case 'today':
        return { start: now, end: now }
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) }
      case 'custom':
        return { 
          start: customStartDate || startOfMonth(now), 
          end: customEndDate || endOfMonth(now) 
        }
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }

  const filteredAppointments = useMemo(() => {
    const { start, end } = getDateRangeFilter()
    return (appointments || []).filter(apt => {
      const aptDate = parseISO(apt.date)
      const inRange = isWithinInterval(aptDate, { start, end })
      const matchesStaff = selectedStaff === 'all' || apt.staffId === selectedStaff
      return inRange && matchesStaff
    })
  }, [appointments, dateRange, customStartDate, customEndDate, selectedStaff])

  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRangeFilter()
    return (transactions || []).filter(txn => {
      const txnDate = parseISO(txn.date)
      return isWithinInterval(txnDate, { start, end })
    })
  }, [transactions, dateRange, customStartDate, customEndDate])

  const revenueMetrics = useMemo(() => {
    const completed = filteredAppointments.filter(apt => apt.status === 'completed')
    const totalRevenue = completed.reduce((sum, apt) => sum + apt.price, 0)
    const transactionRevenue = filteredTransactions.reduce((sum, txn) => sum + txn.total, 0)
    const totalCombined = totalRevenue + transactionRevenue
    
    const { start, end } = getDateRangeFilter()
    const previousPeriod = {
      start: subDays(start, 30),
      end: subDays(end, 30)
    }
    
    const prevAppointments = (appointments || []).filter(apt => {
      const aptDate = parseISO(apt.date)
      return isWithinInterval(aptDate, previousPeriod) && apt.status === 'completed'
    })
    
    const prevRevenue = prevAppointments.reduce((sum, apt) => sum + apt.price, 0)
    const growthRate = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    return {
      total: totalCombined,
      appointments: totalRevenue,
      retail: transactionRevenue,
      average: completed.length > 0 ? totalRevenue / completed.length : 0,
      growth: growthRate,
      count: completed.length
    }
  }, [filteredAppointments, filteredTransactions, appointments])

  const appointmentMetrics = useMemo(() => {
    const total = filteredAppointments.length
    const completed = filteredAppointments.filter(apt => apt.status === 'completed').length
    const cancelled = filteredAppointments.filter(apt => apt.status === 'cancelled').length
    const scheduled = filteredAppointments.filter(apt => apt.status === 'scheduled').length
    const completionRate = total > 0 ? (completed / total) * 100 : 0
    const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0

    return { total, completed, cancelled, scheduled, completionRate, cancellationRate }
  }, [filteredAppointments])

  const serviceBreakdown = useMemo(() => {
    const serviceMap = new Map<string, { count: number; revenue: number }>()
    
    filteredAppointments.forEach(apt => {
      if (apt.status === 'completed') {
        const existing = serviceMap.get(apt.service) || { count: 0, revenue: 0 }
        serviceMap.set(apt.service, {
          count: existing.count + 1,
          revenue: existing.revenue + apt.price
        })
      }
    })

    return Array.from(serviceMap.entries())
      .map(([service, data]) => ({ service, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredAppointments])

  const staffPerformance = useMemo(() => {
    const staffMap = new Map<string, { appointments: number; revenue: number; name: string }>()
    
    filteredAppointments.forEach(apt => {
      if (apt.status === 'completed' && apt.staffId) {
        const staffMember = (staff || []).find(s => s.id === apt.staffId)
        const staffName = staffMember?.name || 'Unassigned'
        
        const existing = staffMap.get(apt.staffId) || { appointments: 0, revenue: 0, name: staffName }
        staffMap.set(apt.staffId, {
          name: staffName,
          appointments: existing.appointments + 1,
          revenue: existing.revenue + apt.price
        })
      }
    })

    return Array.from(staffMap.entries())
      .map(([id, data]) => ({ staffId: id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredAppointments, staff])

  const customerInsights = useMemo(() => {
    const customerMap = new Map<string, { visits: number; revenue: number; lastVisit: string; name: string }>()
    
    filteredAppointments.forEach(apt => {
      if (apt.status === 'completed') {
        const name = `${apt.customerFirstName} ${apt.customerLastName}`
        const existing = customerMap.get(apt.customerId) || { 
          visits: 0, 
          revenue: 0, 
          lastVisit: apt.date,
          name 
        }
        
        customerMap.set(apt.customerId, {
          name,
          visits: existing.visits + 1,
          revenue: existing.revenue + apt.price,
          lastVisit: apt.date > existing.lastVisit ? apt.date : existing.lastVisit
        })
      }
    })

    const allCustomers = Array.from(customerMap.entries())
      .map(([id, data]) => ({ customerId: id, ...data }))
    
    const topCustomers = [...allCustomers].sort((a, b) => b.revenue - a.revenue).slice(0, 10)
    const avgVisits = allCustomers.length > 0 ? allCustomers.reduce((sum, c) => sum + c.visits, 0) / allCustomers.length : 0
    const avgRevenue = allCustomers.length > 0 ? allCustomers.reduce((sum, c) => sum + c.revenue, 0) / allCustomers.length : 0

    return { topCustomers, avgVisits, avgRevenue, totalActive: allCustomers.length }
  }, [filteredAppointments])

  const peakTimes = useMemo(() => {
    const hourMap = new Map<number, number>()
    
    filteredAppointments.forEach(apt => {
      if (!apt.time || typeof apt.time !== 'string') return
      
      const timeParts = apt.time.split(':')
      if (timeParts.length > 0) {
        const hour = parseInt(timeParts[0])
        if (!isNaN(hour)) {
          hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
        }
      }
    })

    return Array.from(hourMap.entries())
      .map(([hour, count]) => ({ 
        hour: `${hour}:00`, 
        count,
        formatted: format(new Date().setHours(hour, 0), 'h:mm a')
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredAppointments])

  const handleExport = () => {
    const reportData = {
      dateRange: getDateRangeFilter(),
      revenue: revenueMetrics,
      appointments: appointmentMetrics,
      services: serviceBreakdown,
      staff: staffPerformance,
      customers: customerInsights,
      peakTimes
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `scruffy-butts-report-${format(new Date(), 'yyyy-MM-dd')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`font-bold text-foreground ${isCompact ? 'text-2xl' : 'text-3xl'}`}>Reports & Analytics</h1>
          <p className={`text-muted-foreground ${isCompact ? 'text-sm' : ''}`}>
            Track performance and business insights
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2">
          <Download size={18} />
          <span>Export Report</span>
        </Button>
      </div>

      <div className={`flex flex-wrap ${isCompact ? 'gap-2' : 'gap-4'}`}>
        <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {dateRange === 'custom' && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal")}>
                  <CalendarBlank className="mr-2" size={16} />
                  {customStartDate ? format(customStartDate, 'MMM dd, yyyy') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal")}>
                  <CalendarBlank className="mr-2" size={16} />
                  {customEndDate ? format(customEndDate, 'MMM dd, yyyy') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <Select value={selectedStaff} onValueChange={setSelectedStaff}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {(staff || []).map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${isCompact ? 'gap-3' : 'gap-4'}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CurrencyDollar className="text-muted-foreground" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.total.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendUp size={14} className={revenueMetrics.growth >= 0 ? 'text-green-500' : 'text-red-500'} />
              <span className={revenueMetrics.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {revenueMetrics.growth >= 0 ? '+' : ''}{revenueMetrics.growth.toFixed(1)}%
              </span>
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <CalendarBlank className="text-muted-foreground" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentMetrics.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {appointmentMetrics.completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <ChartBar className="text-muted-foreground" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.average.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {revenueMetrics.count} completed services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="text-muted-foreground" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerInsights.totalActive}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {customerInsights.avgVisits.toFixed(1)} visits
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className={isCompact ? 'space-y-3' : 'space-y-4'}>
          <div className={`grid grid-cols-1 lg:grid-cols-2 ${isCompact ? 'gap-3' : 'gap-4'}`}>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue sources for selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Dog className="text-primary" size={20} />
                      <span className="font-medium">Grooming Services</span>
                    </div>
                    <span className="font-bold">${revenueMetrics.appointments.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CurrencyDollar className="text-accent" size={20} />
                      <span className="font-medium">Retail Sales</span>
                    </div>
                    <span className="font-bold">${revenueMetrics.retail.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Revenue</span>
                      <span className="text-xl font-bold">${revenueMetrics.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
                <CardDescription>Breakdown of appointment outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Completed</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{appointmentMetrics.completed}</div>
                      <div className="text-xs text-muted-foreground">{appointmentMetrics.completionRate.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{appointmentMetrics.scheduled}</div>
                      <div className="text-xs text-muted-foreground">
                        {((appointmentMetrics.scheduled / appointmentMetrics.total) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">Cancelled</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{appointmentMetrics.cancelled}</div>
                      <div className="text-xs text-muted-foreground">{appointmentMetrics.cancellationRate.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Appointments</span>
                      <span className="text-xl font-bold">{appointmentMetrics.total}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>Busiest appointment times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {peakTimes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No appointment data available</p>
                ) : (
                  peakTimes.map((time, idx) => (
                    <div key={time.hour} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <Clock size={18} className="text-muted-foreground" />
                        <span className="font-medium">{time.formatted}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(time.count / peakTimes[0].count) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold w-12 text-right">{time.count}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className={isCompact ? 'space-y-3' : 'space-y-4'}>
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>Revenue and bookings by service type</CardDescription>
            </CardHeader>
            <CardContent>
              {serviceBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No service data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Avg Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceBreakdown.map((service) => (
                      <TableRow key={service.service}>
                        <TableCell className="font-medium">{service.service}</TableCell>
                        <TableCell className="text-right">{service.count}</TableCell>
                        <TableCell className="text-right">${service.revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(service.revenue / service.count).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className={isCompact ? 'space-y-3' : 'space-y-4'}>
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>Individual staff member metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {staffPerformance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No staff performance data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead className="text-right">Appointments</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Avg per Appointment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffPerformance.map((staff) => (
                      <TableRow key={staff.staffId}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell className="text-right">{staff.appointments}</TableCell>
                        <TableCell className="text-right">${staff.revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(staff.revenue / staff.appointments).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className={isCompact ? 'space-y-3' : 'space-y-4'}>
          <div className={`grid grid-cols-1 lg:grid-cols-3 ${isCompact ? 'gap-3' : 'gap-4'} mb-4`}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Customer Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerInsights.avgVisits.toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Customer Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${customerInsights.avgRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerInsights.totalActive}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Highest value customers by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {customerInsights.topCustomers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No customer data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Visits</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                      <TableHead className="text-right">Last Visit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerInsights.topCustomers.map((customer, idx) => (
                      <TableRow key={customer.customerId}>
                        <TableCell>
                          <div className="flex items-center">
                            {idx < 3 && <Star className="text-accent mr-1" size={16} weight="fill" />}
                            <span className="font-medium">#{idx + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-right">{customer.visits}</TableCell>
                        <TableCell className="text-right">${customer.revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{format(parseISO(customer.lastVisit), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
