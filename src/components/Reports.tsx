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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  CurrencyDollar, 
  CalendarBlank, 
  TrendUp, 
  Users, 
  ChartBar,
  FilePdf,
  FileCsv,
  Download,
  Star,
  Clock,
  Dog,
  Info,
  ArrowUp,
  ArrowDown,
  Warning,
  CheckCircle,
  Percent,
  Receipt
} from '@phosphor-icons/react'
import { format, parseISO, subDays, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'sonner'
import type { 
  GlobalFilters, 
  DateRangePreset, 
  TimeBasis,
  KPIMetric,
  Appointment,
  Transaction,
  Service,
  Staff,
  Customer,
  Settings,
  Pet
} from '@/lib/reports-types'
import {
  filterAppointments,
  filterTransactions,
  calculateRevenueMetrics,
  calculateMarginMetrics,
  calculateAppointmentMetrics,
  calculateRetentionMetrics,
  calculateServiceBreakdown,
  calculateStaffPerformance,
  getDateRangeFromFilter
} from '@/lib/reports-calculations'

interface StoredAppointment {
  id: string
  petName: string
  customerFirstName: string
  customerLastName: string
  customerId: string
  service: string
  serviceId?: string
  date: string
  time: string
  duration: number
  price: number
  discount?: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  staffId?: string
  channel?: 'walk-in' | 'phone' | 'online'
  notes?: string
}

interface StoredTransaction {
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

function convertStoredToAppointment(stored: StoredAppointment): Appointment {
  return {
    id: stored.id,
    customerId: stored.customerId,
    customerFirstName: stored.customerFirstName,
    customerLastName: stored.customerLastName,
    petId: '',
    petName: stored.petName,
    petSize: 'medium',
    serviceId: stored.serviceId || stored.service,
    service: stored.service,
    staffId: stored.staffId,
    date: stored.date,
    time: stored.time,
    plannedDuration: stored.duration,
    status: stored.status,
    price: stored.price,
    discount: stored.discount,
    channel: stored.channel || 'walk-in',
    bookedAt: stored.date,
    notes: stored.notes
  }
}

function convertStoredToTransaction(stored: StoredTransaction): Transaction {
  return {
    id: stored.id,
    checkoutDate: stored.date,
    transactionDate: stored.date,
    appointmentId: stored.appointmentId,
    customerId: stored.customerId,
    items: stored.items.map(item => ({
      type: 'service',
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price
    })),
    subtotal: stored.subtotal,
    discountTotal: 0,
    taxTotal: stored.tax,
    tipTotal: stored.tip,
    totalCollected: stored.total,
    paymentMethod: stored.paymentMethod,
    status: 'completed'
  }
}

export function Reports() {
  const [storedAppointments] = useKV<StoredAppointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [storedStaff] = useKV<Staff[]>('staff', [])
  const [storedTransactions] = useKV<StoredTransaction[]>('transactions', [])
  const [services] = useKV<Service[]>('services', [])
  const [appearance] = useKV<{ compactMode?: boolean }>('appearance-settings', {})
  const [settings] = useKV<Settings>('report-settings', {
    processor: { feeRatePct: 2.9, feeFixed: 0.30, feeBasePolicy: 'subtotal' },
    tips: { tipFeesApply: false, tipFeePayer: 'staff' },
    labor: { defaultCompensationModel: 'commission', defaultCommissionRate: 40, defaultHourlyRate: 15, employerBurdenPct: 15 },
    retention: { rebookWindow0to24h: true, rebookWindow7d: true, rebookWindow30d: true, lapsedThresholdDays: 90 },
    attribution: { windowDays: 7, confirmationWindowHours: 48 },
    messaging: { reminderSchedule: ['48h', '4h'], messageCost: 0.015 }
  })

  const appointments = useMemo(() => 
    (storedAppointments || []).map(convertStoredToAppointment), 
    [storedAppointments]
  )
  
  const transactions = useMemo(() => 
    (storedTransactions || []).map(convertStoredToTransaction),
    [storedTransactions]
  )

  const staff = storedStaff || []

  const [filters, setFilters] = useState<GlobalFilters>({
    dateRange: { preset: 'thisMonth' },
    timeBasis: 'checkout',
    staffIds: [],
    serviceIds: [],
    petSize: [],
    channel: [],
    clientType: [],
    appointmentStatus: [],
    paymentMethod: []
  })

  const [compareMode, setCompareMode] = useState(false)
  const [showInsights, setShowInsights] = useState(true)

  const isCompact = appearance?.compactMode || false

  const filteredAppointments = useMemo(() => 
    filterAppointments(appointments, filters),
    [appointments, filters]
  )

  const filteredTransactions = useMemo(() => 
    filterTransactions(transactions, filters, filters.timeBasis),
    [transactions, filters]
  )

  const revenueMetrics = useMemo(() => 
    calculateRevenueMetrics(filteredAppointments, filteredTransactions, settings),
    [filteredAppointments, filteredTransactions, settings]
  )

  const marginMetrics = useMemo(() => 
    calculateMarginMetrics(filteredAppointments, filteredTransactions, services || [], staff, settings),
    [filteredAppointments, filteredTransactions, services, staff, settings]
  )

  const appointmentMetrics = useMemo(() => 
    calculateAppointmentMetrics(filteredAppointments),
    [filteredAppointments]
  )

  const retentionMetrics = useMemo(() => 
    calculateRetentionMetrics(filteredAppointments, customers || []),
    [filteredAppointments, customers]
  )

  const activeCustomers = customers || []

  const serviceBreakdown = useMemo(() => 
    calculateServiceBreakdown(filteredAppointments, services || []),
    [filteredAppointments, services]
  )

  const staffPerformance = useMemo(() => 
    calculateStaffPerformance(filteredAppointments, staff, services || []),
    [filteredAppointments, staff, services]
  )

  const priorPeriodMetrics = useMemo(() => {
    const { start, end } = getDateRangeFromFilter(filters.dateRange)
    const daysDiff = differenceInDays(end, start)
    
    const priorFilters: GlobalFilters = {
      ...filters,
      dateRange: {
        preset: 'custom',
        startDate: subDays(start, daysDiff + 1),
        endDate: subDays(end, daysDiff + 1)
      }
    }
    
    const priorAppointments = filterAppointments(appointments, priorFilters)
    const priorTransactions = filterTransactions(transactions, priorFilters, filters.timeBasis)
    
    return calculateRevenueMetrics(priorAppointments, priorTransactions, settings)
  }, [appointments, transactions, filters, settings])

  const insights = useMemo(() => {
    const insights: Array<{ type: 'warning' | 'success' | 'info'; message: string; action?: string }> = []
    
    const revenueDelta = priorPeriodMetrics.netSales > 0 
      ? ((revenueMetrics.netSales - priorPeriodMetrics.netSales) / priorPeriodMetrics.netSales) * 100
      : 0
    
    if (revenueDelta < -10) {
      insights.push({
        type: 'warning',
        message: `Revenue down ${Math.abs(revenueDelta).toFixed(1)}% vs prior period`,
        action: 'Review service pricing and promotional strategies'
      })
    } else if (revenueDelta > 15) {
      insights.push({
        type: 'success',
        message: `Revenue up ${revenueDelta.toFixed(1)}% vs prior period`,
        action: 'Consider scaling successful strategies'
      })
    }
    
    if (appointmentMetrics.noShowRate > 15) {
      insights.push({
        type: 'warning',
        message: `No-show rate at ${appointmentMetrics.noShowRate.toFixed(1)}% - above industry average`,
        action: 'Add appointment reminders 4 hours before scheduled time'
      })
    }
    
    if (retentionMetrics.rebookRate7d < 30 && filteredAppointments.length > 10) {
      insights.push({
        type: 'info',
        message: `Only ${retentionMetrics.rebookRate7d.toFixed(1)}% rebook within 7 days`,
        action: 'Train staff on rebooking at checkout'
      })
    }
    
    if (marginMetrics.contributionMarginPct < 30 && revenueMetrics.netSales > 0) {
      insights.push({
        type: 'warning',
        message: `Contribution margin at ${marginMetrics.contributionMarginPct.toFixed(1)}% - review costs`,
        action: 'Check supply costs and processing fees'
      })
    }
    
    if (retentionMetrics.lapsedCount > 0) {
      insights.push({
        type: 'info',
        message: `${retentionMetrics.lapsedCount} customers haven't visited in 90+ days`,
        action: 'Send win-back campaign'
      })
    }
    
    return insights
  }, [revenueMetrics, priorPeriodMetrics, appointmentMetrics, retentionMetrics, marginMetrics, filteredAppointments.length])

  const kpis: KPIMetric[] = useMemo(() => {
    const revenueDelta = priorPeriodMetrics.netSales > 0 
      ? ((revenueMetrics.netSales - priorPeriodMetrics.netSales) / priorPeriodMetrics.netSales) * 100
      : 0

    return [
      {
        label: 'Net Sales',
        value: revenueMetrics.netSales,
        format: 'currency',
        delta: revenueDelta,
        tooltip: 'Money from services/products after discounts & refunds. Excludes tax & tips.',
        drillable: true
      },
      {
        label: 'Contribution Margin',
        value: marginMetrics.contributionMargin,
        format: 'currency',
        delta: undefined,
        tooltip: 'Net Sales minus supplies, card fees, and labor costs',
        drillable: true
      },
      {
        label: 'Margin %',
        value: marginMetrics.contributionMarginPct,
        format: 'percentage',
        delta: undefined,
        tooltip: 'Percentage of revenue remaining after variable costs',
        drillable: false
      },
      {
        label: 'Avg Ticket',
        value: revenueMetrics.avgTicket,
        format: 'currency',
        delta: undefined,
        tooltip: 'Average revenue per transaction',
        drillable: false
      },
      {
        label: 'Completed Appts',
        value: appointmentMetrics.completed,
        format: 'number',
        delta: undefined,
        tooltip: 'Number of successfully completed appointments',
        drillable: true
      },
      {
        label: 'No-Show Rate',
        value: appointmentMetrics.noShowRate,
        format: 'percentage',
        delta: undefined,
        tooltip: 'Percentage of appointments where client didn\'t arrive',
        drillable: true
      },
      {
        label: '7-Day Rebook',
        value: retentionMetrics.rebookRate7d,
        format: 'percentage',
        delta: undefined,
        tooltip: 'Percentage of visits with next appointment booked within 7 days',
        drillable: true
      },
      {
        label: 'Active Customers',
        value: activeCustomers.length,
        format: 'number',
        delta: undefined,
        tooltip: 'Total customers in the system',
        drillable: true
      }
    ]
  }, [revenueMetrics, marginMetrics, appointmentMetrics, retentionMetrics, priorPeriodMetrics, activeCustomers.length])

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      const { start, end } = getDateRangeFromFilter(filters.dateRange)
      const dateRangeStr = `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
      
      let yPos = 20
      
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Scruffy Butts', 20, yPos)
      
      yPos += 8
      doc.setFontSize(16)
      doc.text('Business Report', 20, yPos)
      
      yPos += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Report Period: ${dateRangeStr}`, 20, yPos)
      
      yPos += 5
      doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, yPos)
      
      yPos += 15
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Key Performance Indicators', 20, yPos)
      
      yPos += 8
      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: kpis.map(kpi => {
          let valueStr = ''
          if (kpi.format === 'currency') {
            valueStr = `$${(kpi.value as number).toFixed(2)}`
          } else if (kpi.format === 'percentage') {
            valueStr = `${(kpi.value as number).toFixed(1)}%`
          } else {
            valueStr = kpi.value.toString()
          }
          return [kpi.label, valueStr]
        }),
        theme: 'grid',
        headStyles: { fillColor: [67, 75, 150] },
        margin: { left: 20 }
      })
      
      yPos = (doc as any).lastAutoTable.finalY + 15
      
      if (insights.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Key Insights', 20, yPos)
        
        yPos += 8
        insights.forEach((insight, idx) => {
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          const icon = insight.type === 'warning' ? '⚠' : insight.type === 'success' ? '✓' : 'ℹ'
          doc.text(`${icon} ${insight.message}`, 25, yPos)
          yPos += 5
          if (insight.action) {
            doc.setFont('helvetica', 'italic')
            doc.text(`   → ${insight.action}`, 25, yPos)
            yPos += 6
          }
        })
        yPos += 10
      }
      
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Service Performance', 20, yPos)
      
      yPos += 8
      if (serviceBreakdown.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Service', 'Count', 'Revenue', 'Avg Ticket', 'Discount %']],
          body: serviceBreakdown.map(service => [
            service.serviceName,
            service.count.toString(),
            `$${service.netRevenue.toFixed(2)}`,
            `$${service.avgTicket.toFixed(2)}`,
            `${service.discountPct.toFixed(1)}%`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [67, 75, 150] },
          margin: { left: 20 }
        })
        yPos = (doc as any).lastAutoTable.finalY + 15
      }
      
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Staff Performance', 20, yPos)
      
      yPos += 8
      if (staffPerformance.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Staff', 'Appts', 'Revenue', '$/Hour', 'Rebook %']],
          body: staffPerformance.map(s => [
            s.staffName,
            s.appointments.toString(),
            `$${s.revenue.toFixed(2)}`,
            `$${s.revenuePerHour.toFixed(2)}`,
            `${s.rebookRate.toFixed(1)}%`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [67, 75, 150] },
          margin: { left: 20 }
        })
      }
      
      doc.save(`scruffy-butts-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      toast.success('Report exported as PDF')
    } catch (error) {
      toast.error('Failed to export PDF')
      console.error(error)
    }
  }

  const handleExportCSV = () => {
    try {
      const { start, end } = getDateRangeFromFilter(filters.dateRange)
      const dateRangeStr = `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
      
      let csvContent = 'Scruffy Butts - Business Report\n'
      csvContent += `Report Period:,${dateRangeStr}\n`
      csvContent += `Generated:,${format(new Date(), 'MMM dd, yyyy HH:mm')}\n\n`
      
      csvContent += 'KEY PERFORMANCE INDICATORS\n'
      csvContent += 'Metric,Value\n'
      kpis.forEach(kpi => {
        let valueStr = ''
        if (kpi.format === 'currency') {
          valueStr = `$${(kpi.value as number).toFixed(2)}`
        } else if (kpi.format === 'percentage') {
          valueStr = `${(kpi.value as number).toFixed(1)}%`
        } else {
          valueStr = kpi.value.toString()
        }
        csvContent += `${kpi.label},${valueStr}\n`
      })
      csvContent += '\n'
      
      if (insights.length > 0) {
        csvContent += 'KEY INSIGHTS\n'
        csvContent += 'Type,Message,Action\n'
        insights.forEach(insight => {
          csvContent += `${insight.type},${insight.message},${insight.action || ''}\n`
        })
        csvContent += '\n'
      }
      
      csvContent += 'SERVICE PERFORMANCE\n'
      csvContent += 'Service,Category,Count,Revenue,Avg Ticket,Discount %\n'
      serviceBreakdown.forEach(service => {
        csvContent += `${service.serviceName},${service.serviceCategory},${service.count},$${service.netRevenue.toFixed(2)},$${service.avgTicket.toFixed(2)},${service.discountPct.toFixed(1)}%\n`
      })
      csvContent += '\n'
      
      csvContent += 'STAFF PERFORMANCE\n'
      csvContent += 'Staff,Appointments,Revenue,Revenue per Hour,Avg Ticket,Rebook Rate,No-Show Rate\n'
      staffPerformance.forEach(s => {
        csvContent += `${s.staffName},${s.appointments},$${s.revenue.toFixed(2)},$${s.revenuePerHour.toFixed(2)},$${s.avgTicket.toFixed(2)},${s.rebookRate.toFixed(1)}%,${s.noShowRate.toFixed(1)}%\n`
      })
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `scruffy-butts-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('Report exported as CSV')
    } catch (error) {
      toast.error('Failed to export CSV')
      console.error(error)
    }
  }

  const updateFilters = (update: Partial<GlobalFilters>) => {
    setFilters(prev => ({ ...prev, ...update }))
  }

  return (
    <TooltipProvider>
      <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className={`font-bold text-foreground ${isCompact ? 'text-2xl' : 'text-3xl'}`}>
              Reports & Analytics
            </h1>
            <p className={`text-muted-foreground ${isCompact ? 'text-sm' : ''}`}>
              Comprehensive business insights and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={filters.timeBasis} 
              onValueChange={(value) => updateFilters({ timeBasis: value as TimeBasis })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Service Date</SelectItem>
                <SelectItem value="checkout">Checkout Date</SelectItem>
                <SelectItem value="transaction">Transaction Date</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download size={18} />
                  <span>Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF} className="flex items-center gap-2">
                  <FilePdf size={18} />
                  <span>Export as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV} className="flex items-center gap-2">
                  <FileCsv size={18} />
                  <span>Export as CSV</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Select 
                value={filters.dateRange.preset} 
                onValueChange={(value) => updateFilters({ 
                  dateRange: { preset: value as DateRangePreset }
                })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {filters.dateRange.preset === 'custom' && (
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                        <CalendarBlank className="mr-2" size={16} />
                        {filters.dateRange.startDate ? format(filters.dateRange.startDate, 'MMM dd') : 'Start'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                        mode="single" 
                        selected={filters.dateRange.startDate} 
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, startDate: date }
                        })} 
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-muted-foreground">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                        <CalendarBlank className="mr-2" size={16} />
                        {filters.dateRange.endDate ? format(filters.dateRange.endDate, 'MMM dd') : 'End'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                        mode="single" 
                        selected={filters.dateRange.endDate} 
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, endDate: date }
                        })} 
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${isCompact ? 'gap-3' : 'gap-4'}`}>
          {kpis.slice(0, 4).map((kpi, idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <Card className="cursor-help">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                    <Info className="text-muted-foreground" size={16} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {kpi.format === 'currency' && '$'}
                      {kpi.format === 'currency' 
                        ? (kpi.value as number).toFixed(2)
                        : kpi.format === 'percentage'
                        ? (kpi.value as number).toFixed(1)
                        : kpi.value
                      }
                      {kpi.format === 'percentage' && '%'}
                    </div>
                    {kpi.delta !== undefined && (
                      <div className="flex items-center text-xs mt-1">
                        {kpi.delta >= 0 ? (
                          <ArrowUp size={14} className="text-green-500" />
                        ) : (
                          <ArrowDown size={14} className="text-red-500" />
                        )}
                        <span className={kpi.delta >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {Math.abs(kpi.delta).toFixed(1)}%
                        </span>
                        <span className="ml-1 text-muted-foreground">vs prior</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{kpi.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${isCompact ? 'gap-3' : 'gap-4'}`}>
          {kpis.slice(4).map((kpi, idx) => (
            <Tooltip key={idx + 4}>
              <TooltipTrigger asChild>
                <Card className="cursor-help">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                    <Info className="text-muted-foreground" size={16} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {kpi.format === 'currency' && '$'}
                      {kpi.format === 'currency' 
                        ? (kpi.value as number).toFixed(2)
                        : kpi.format === 'percentage'
                        ? (kpi.value as number).toFixed(1)
                        : kpi.value
                      }
                      {kpi.format === 'percentage' && '%'}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{kpi.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {insights.length > 0 && showInsights && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Key Insights</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowInsights(false)}
                >
                  Dismiss
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg",
                    insight.type === 'warning' && "bg-orange-50 border border-orange-200",
                    insight.type === 'success' && "bg-green-50 border border-green-200",
                    insight.type === 'info' && "bg-blue-50 border border-blue-200"
                  )}
                >
                  {insight.type === 'warning' && <Warning size={20} className="text-orange-600 mt-0.5" />}
                  {insight.type === 'success' && <CheckCircle size={20} className="text-green-600 mt-0.5" />}
                  {insight.type === 'info' && <Info size={20} className="text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{insight.message}</p>
                    {insight.action && (
                      <p className="text-xs text-muted-foreground mt-1">→ {insight.action}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue & Margin</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className={isCompact ? 'space-y-3' : 'space-y-4'}>
            <div className={`grid grid-cols-1 lg:grid-cols-2 ${isCompact ? 'gap-3' : 'gap-4'}`}>
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Revenue composition for selected period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="text-primary" size={20} />
                      <span className="font-medium">Gross Sales</span>
                    </div>
                    <span className="font-bold">${revenueMetrics.grossSales.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="text-orange-500" size={20} />
                      <span className="font-medium">Discounts</span>
                    </div>
                    <span className="font-bold text-orange-500">-${revenueMetrics.discounts.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="text-red-500" size={20} />
                      <span className="font-medium">Refunds</span>
                    </div>
                    <span className="font-bold text-red-500">-${revenueMetrics.refunds.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Net Sales</span>
                      <span className="text-xl font-bold text-primary">${revenueMetrics.netSales.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment Summary</CardTitle>
                  <CardDescription>Appointment status breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="default">Completed</Badge>
                    <div className="text-right">
                      <div className="font-bold">{appointmentMetrics.completed}</div>
                      <div className="text-xs text-muted-foreground">
                        {appointmentMetrics.completionRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Scheduled</Badge>
                    <div className="text-right">
                      <div className="font-bold">{appointmentMetrics.scheduled}</div>
                      <div className="text-xs text-muted-foreground">
                        {appointmentMetrics.total > 0 
                          ? ((appointmentMetrics.scheduled / appointmentMetrics.total) * 100).toFixed(1)
                          : '0.0'
                        }%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive">No-Shows</Badge>
                    <div className="text-right">
                      <div className="font-bold">{appointmentMetrics.noShows}</div>
                      <div className="text-xs text-muted-foreground">
                        {appointmentMetrics.noShowRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold">{appointmentMetrics.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className={isCompact ? 'space-y-3' : 'space-y-4'}>
            <div className={`grid grid-cols-1 lg:grid-cols-3 ${isCompact ? 'gap-3' : 'gap-4'}`}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Contribution Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${marginMetrics.contributionMargin.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {marginMetrics.contributionMarginPct.toFixed(1)}% margin
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Cost of Goods Sold</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${marginMetrics.cogs.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Supply costs</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Processing Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${revenueMetrics.processingFees.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {revenueMetrics.netSales > 0 
                      ? ((revenueMetrics.processingFees / revenueMetrics.netSales) * 100).toFixed(2)
                      : '0.00'
                    }% of sales
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className={isCompact ? 'space-y-3' : 'space-y-4'}>
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>Revenue and bookings by service</CardDescription>
              </CardHeader>
              <CardContent>
                {serviceBreakdown.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No service data available for selected period
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Avg Ticket</TableHead>
                        <TableHead className="text-right">Discount %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceBreakdown.map((service, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{service.serviceName}</TableCell>
                          <TableCell>{service.serviceCategory}</TableCell>
                          <TableCell className="text-right">{service.count}</TableCell>
                          <TableCell className="text-right">${service.netRevenue.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${service.avgTicket.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{service.discountPct.toFixed(1)}%</TableCell>
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
                <CardDescription>Individual staff metrics and productivity</CardDescription>
              </CardHeader>
              <CardContent>
                {staffPerformance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No staff performance data available for selected period
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead className="text-right">Appts</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">$/Hour</TableHead>
                        <TableHead className="text-right">Avg Ticket</TableHead>
                        <TableHead className="text-right">Rebook %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffPerformance.map((s, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{s.staffName}</TableCell>
                          <TableCell className="text-right">{s.appointments}</TableCell>
                          <TableCell className="text-right">${s.revenue.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${s.revenuePerHour.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${s.avgTicket.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{s.rebookRate.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className={isCompact ? 'space-y-3' : 'space-y-4'}>
            <div className={`grid grid-cols-1 lg:grid-cols-4 ${isCompact ? 'gap-3' : 'gap-4'}`}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Rebook at Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{retentionMetrics.rebookRate0to24h.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">0-24 hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">7-Day Rebook</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{retentionMetrics.rebookRate7d.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Within 7 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">30-Day Rebook</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{retentionMetrics.rebookRate30d.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Lapsed Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{retentionMetrics.lapsedCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">90+ days inactive</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>At-Risk Customers</CardTitle>
                <CardDescription>Customers who haven't visited in 90+ days</CardDescription>
              </CardHeader>
              <CardContent>
                {retentionMetrics.lapsedCustomers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No at-risk customers found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {retentionMetrics.lapsedCustomers.slice(0, 10).map((customer, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg border">
                        <div>
                          <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                          <p className="text-xs text-muted-foreground">
                            Last visit: {customer.lastVisit ? format(parseISO(customer.lastVisit), 'MMM dd, yyyy') : 'N/A'}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Contact
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
