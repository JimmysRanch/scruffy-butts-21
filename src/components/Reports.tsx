import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CalendarDots, TrendUp, TrendDown, Clock, CurrencyDollar, Users, Scissors, Star, ChartBar } from '@phosphor-icons/react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

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
  paymentMethod: 'cash' | 'card' | 'other'
}

type DateRange = '7days' | '30days' | '90days' | 'thisMonth' | 'lastMonth' | 'allTime'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

export function Reports() {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [staff] = useKV<Staff[]>('staff', [])
  const [services] = useKV<Service[]>('services', [])
  const [transactions] = useKV<Transaction[]>('transactions', [])
  
  const [dateRange, setDateRange] = useState<DateRange>('30days')
  const [selectedStaff, setSelectedStaff] = useState<string>('all')

  const filteredData = useMemo(() => {
    const now = new Date()
    let startDate = new Date()
    
    const allAppointments = appointments || []
    const allTransactions = transactions || []
    
    switch (dateRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        return {
          appointments: allAppointments.filter(apt => {
            const aptDate = new Date(apt.date)
            return aptDate >= startDate && aptDate <= endDate && 
              (selectedStaff === 'all' || apt.staffId === selectedStaff)
          }),
          transactions: allTransactions.filter(txn => {
            const txnDate = new Date(txn.date)
            return txnDate >= startDate && txnDate <= endDate && 
              (selectedStaff === 'all' || txn.staffId === selectedStaff)
          })
        }
      case 'allTime':
        return {
          appointments: allAppointments.filter(apt => 
            selectedStaff === 'all' || apt.staffId === selectedStaff
          ),
          transactions: allTransactions.filter(txn => 
            selectedStaff === 'all' || txn.staffId === selectedStaff
          )
        }
    }

    return {
      appointments: allAppointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate >= startDate && 
          (selectedStaff === 'all' || apt.staffId === selectedStaff)
      }),
      transactions: allTransactions.filter(txn => {
        const txnDate = new Date(txn.date)
        return txnDate >= startDate && 
          (selectedStaff === 'all' || txn.staffId === selectedStaff)
      })
    }
  }, [appointments, transactions, dateRange, selectedStaff])

  const staffPerformance = useMemo(() => {
    const performanceMap = new Map<string, {
      staff: Staff
      appointments: number
      completedAppointments: number
      revenue: number
      tips: number
      avgTicket: number
      noShows: number
      cancellations: number
      servicesByCategory: Map<string, number>
      hoursWorked: number
      revenuePerHour: number
    }>()

    const allStaff = staff || []
    const allServices = services || []

    allStaff.forEach(member => {
      performanceMap.set(member.id, {
        staff: member,
        appointments: 0,
        completedAppointments: 0,
        revenue: 0,
        tips: 0,
        avgTicket: 0,
        noShows: 0,
        cancellations: 0,
        servicesByCategory: new Map(),
        hoursWorked: 0,
        revenuePerHour: 0
      })
    })

    filteredData.appointments.forEach(apt => {
      if (!apt.staffId) return
      
      const perf = performanceMap.get(apt.staffId)
      if (!perf) return

      perf.appointments++
      
      if (apt.status === 'completed') {
        perf.completedAppointments++
        perf.revenue += apt.price || 0
        perf.hoursWorked += (apt.duration || 60) / 60
        
        apt.serviceIds?.forEach(serviceId => {
          const service = allServices.find(s => s.id === serviceId)
          if (service) {
            const count = perf.servicesByCategory.get(service.category) || 0
            perf.servicesByCategory.set(service.category, count + 1)
          }
        })
      } else if (apt.status === 'no-show') {
        perf.noShows++
      } else if (apt.status === 'cancelled') {
        perf.cancellations++
      }
    })

    filteredData.transactions.forEach(txn => {
      if (!txn.staffId) return
      
      const perf = performanceMap.get(txn.staffId)
      if (!perf) return

      perf.tips += txn.tip || 0
    })

    performanceMap.forEach(perf => {
      if (perf.completedAppointments > 0) {
        perf.avgTicket = perf.revenue / perf.completedAppointments
      }
      if (perf.hoursWorked > 0) {
        perf.revenuePerHour = perf.revenue / perf.hoursWorked
      }
    })

    return Array.from(performanceMap.values())
  }, [filteredData, staff, services])

  const topPerformers = useMemo(() => {
    return [...staffPerformance]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [staffPerformance])

  const revenueByStaff = useMemo(() => {
    return staffPerformance
      .filter(p => p.revenue > 0)
      .map(p => ({
        name: p.staff.name,
        revenue: p.revenue,
        tips: p.tips,
        total: p.revenue + p.tips
      }))
      .sort((a, b) => b.total - a.total)
  }, [staffPerformance])

  const appointmentsByStaff = useMemo(() => {
    return staffPerformance
      .filter(p => p.appointments > 0)
      .map(p => ({
        name: p.staff.name,
        completed: p.completedAppointments,
        noShows: p.noShows,
        cancellations: p.cancellations,
        total: p.appointments
      }))
      .sort((a, b) => b.total - a.total)
  }, [staffPerformance])

  const efficiencyMetrics = useMemo(() => {
    return staffPerformance
      .filter(p => p.appointments > 0)
      .map(p => ({
        name: p.staff.name,
        completionRate: p.appointments > 0 ? (p.completedAppointments / p.appointments) * 100 : 0,
        avgTicket: p.avgTicket,
        revenuePerHour: p.revenuePerHour,
        noShowRate: p.appointments > 0 ? (p.noShows / p.appointments) * 100 : 0
      }))
  }, [staffPerformance])

  const radarData = useMemo(() => {
    if (selectedStaff === 'all') return []
    
    const perf = staffPerformance.find(p => p.staff.id === selectedStaff)
    if (!perf) return []

    const maxRevenue = Math.max(...staffPerformance.map(p => p.revenue))
    const maxAppointments = Math.max(...staffPerformance.map(p => p.completedAppointments))
    const maxTips = Math.max(...staffPerformance.map(p => p.tips))
    const maxRevenuePerHour = Math.max(...staffPerformance.map(p => p.revenuePerHour))

    return [
      {
        metric: 'Revenue',
        value: maxRevenue > 0 ? (perf.revenue / maxRevenue) * 100 : 0,
        fullMark: 100
      },
      {
        metric: 'Appointments',
        value: maxAppointments > 0 ? (perf.completedAppointments / maxAppointments) * 100 : 0,
        fullMark: 100
      },
      {
        metric: 'Tips',
        value: maxTips > 0 ? (perf.tips / maxTips) * 100 : 0,
        fullMark: 100
      },
      {
        metric: 'Efficiency',
        value: maxRevenuePerHour > 0 ? (perf.revenuePerHour / maxRevenuePerHour) * 100 : 0,
        fullMark: 100
      },
      {
        metric: 'Completion',
        value: perf.appointments > 0 ? (perf.completedAppointments / perf.appointments) * 100 : 0,
        fullMark: 100
      }
    ]
  }, [staffPerformance, selectedStaff])

  const totalStats = useMemo(() => {
    const total = staffPerformance.reduce((acc, perf) => ({
      revenue: acc.revenue + perf.revenue,
      tips: acc.tips + perf.tips,
      appointments: acc.appointments + perf.completedAppointments,
      hoursWorked: acc.hoursWorked + perf.hoursWorked,
      noShows: acc.noShows + perf.noShows
    }), { revenue: 0, tips: 0, appointments: 0, hoursWorked: 0, noShows: 0 })

    return {
      ...total,
      avgTicket: total.appointments > 0 ? total.revenue / total.appointments : 0,
      revenuePerHour: total.hoursWorked > 0 ? total.revenue / total.hoursWorked : 0,
      noShowRate: total.appointments + total.noShows > 0 ? (total.noShows / (total.appointments + total.noShows)) * 100 : 0
    }
  }, [staffPerformance])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ChartBar className="w-8 h-8 text-primary" weight="duotone" />
            Staff Performance Reports
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive performance metrics and insights</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[160px] frosted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-[180px] frosted">
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {(staff || []).map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="frosted p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(totalStats.revenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">{totalStats.appointments} appointments</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <CurrencyDollar className="w-6 h-6 text-primary" weight="duotone" />
            </div>
          </div>
        </Card>

        <Card className="frosted p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Ticket</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(totalStats.avgTicket)}</p>
              <p className="text-xs text-muted-foreground mt-1">per appointment</p>
            </div>
            <div className="p-3 rounded-xl bg-accent/10">
              <Scissors className="w-6 h-6 text-accent" weight="duotone" />
            </div>
          </div>
        </Card>

        <Card className="frosted p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue/Hour</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(totalStats.revenuePerHour)}</p>
              <p className="text-xs text-muted-foreground mt-1">{totalStats.hoursWorked.toFixed(1)} hours worked</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/10">
              <Clock className="w-6 h-6 text-primary" weight="duotone" />
            </div>
          </div>
        </Card>

        <Card className="frosted p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">No-Show Rate</p>
              <p className="text-3xl font-bold mt-2">{formatPercent(totalStats.noShowRate)}</p>
              <p className="text-xs text-muted-foreground mt-1">{totalStats.noShows} no-shows</p>
            </div>
            <div className="p-3 rounded-xl bg-destructive/10">
              <CalendarDots className="w-6 h-6 text-destructive" weight="duotone" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="frosted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="frosted p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performers by Revenue</h3>
              <div className="space-y-4">
                {topPerformers.map((perf, index) => (
                  <div key={perf.staff.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{perf.staff.name}</p>
                      <p className="text-sm text-muted-foreground">{perf.completedAppointments} appointments</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(perf.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(perf.avgTicket)}/apt</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="frosted p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByStaff}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.revenue)}`}
                  >
                    {revenueByStaff.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {selectedStaff !== 'all' && radarData.length > 0 && (
            <Card className="frosted p-6">
              <h3 className="text-lg font-semibold mb-4">Individual Performance Radar</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Performance" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="frosted p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Staff Member</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueByStaff}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" name="Service Revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="tips" name="Tips" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="frosted p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Details</h3>
              <div className="space-y-3">
                {staffPerformance
                  .filter(p => p.revenue > 0)
                  .sort((a, b) => b.revenue - a.revenue)
                  .map(perf => (
                    <div key={perf.staff.id} className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                      <div>
                        <p className="font-medium">{perf.staff.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {perf.completedAppointments} appointments · {formatCurrency(perf.avgTicket)}/apt
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(perf.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(perf.revenuePerHour)}/hr</p>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="frosted p-6">
              <h3 className="text-lg font-semibold mb-4">Tips Summary</h3>
              <div className="space-y-3">
                {staffPerformance
                  .filter(p => p.tips > 0)
                  .sort((a, b) => b.tips - a.tips)
                  .map(perf => (
                    <div key={perf.staff.id} className="flex justify-between items-center p-3 rounded-lg bg-accent/10">
                      <div>
                        <p className="font-medium">{perf.staff.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercent(perf.revenue > 0 ? (perf.tips / perf.revenue) * 100 : 0)} tip rate
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(perf.tips)}</p>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card className="frosted p-6">
            <h3 className="text-lg font-semibold mb-4">Appointment Breakdown by Staff</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={appointmentsByStaff}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="noShows" name="No-Shows" fill="#ef4444" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cancellations" name="Cancelled" fill="#f59e0b" stackId="a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {staffPerformance
              .filter(p => p.appointments > 0)
              .sort((a, b) => b.completedAppointments - a.completedAppointments)
              .map(perf => {
                const completionRate = perf.appointments > 0 ? (perf.completedAppointments / perf.appointments) * 100 : 0
                const noShowRate = perf.appointments > 0 ? (perf.noShows / perf.appointments) * 100 : 0
                
                return (
                  <Card key={perf.staff.id} className="frosted p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{perf.staff.name}</h4>
                        <p className="text-sm text-muted-foreground">{perf.staff.role}</p>
                      </div>
                      <Badge variant="secondary">{perf.appointments} total</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completed</span>
                          <span className="font-medium">{perf.completedAppointments}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">No-Shows</p>
                          <p className="text-sm font-medium">{perf.noShows} ({formatPercent(noShowRate)})</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cancelled</p>
                          <p className="text-sm font-medium">{perf.cancellations}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="frosted p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Per Hour</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={efficiencyMetrics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenuePerHour" name="Revenue/Hour" fill="#6366f1" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="frosted p-6">
              <h3 className="text-lg font-semibold mb-4">Average Ticket Size</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={efficiencyMetrics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="avgTicket" name="Avg Ticket" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="frosted p-6">
            <h3 className="text-lg font-semibold mb-4">Completion Rate vs No-Show Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={efficiencyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value: number) => formatPercent(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completionRate" 
                  name="Completion Rate" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="noShowRate" 
                  name="No-Show Rate" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffPerformance
              .filter(p => p.appointments > 0)
              .sort((a, b) => b.revenuePerHour - a.revenuePerHour)
              .map(perf => {
                const completionRate = perf.appointments > 0 ? (perf.completedAppointments / perf.appointments) * 100 : 0
                const isTopPerformer = perf.revenuePerHour >= totalStats.revenuePerHour * 1.2
                
                return (
                  <Card key={perf.staff.id} className="frosted p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{perf.staff.name}</h4>
                        <p className="text-xs text-muted-foreground">{perf.hoursWorked.toFixed(1)} hours</p>
                      </div>
                      {isTopPerformer && (
                        <Star className="w-5 h-5 text-accent" weight="fill" />
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue/Hour</p>
                        <p className="text-2xl font-bold">{formatCurrency(perf.revenuePerHour)}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Completion</p>
                          <p className="text-sm font-medium">{formatPercent(completionRate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Ticket</p>
                          <p className="text-sm font-medium">{formatCurrency(perf.avgTicket)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
