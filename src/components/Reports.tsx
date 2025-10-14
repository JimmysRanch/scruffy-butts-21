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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
  Dog
} from '@phosphor-icons/react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, isWithinInterval, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'sonner'

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
      if (!apt.date || typeof apt.date !== 'string') return false
      try {
        const aptDate = parseISO(apt.date)
        const inRange = isWithinInterval(aptDate, { start, end })
        const matchesStaff = selectedStaff === 'all' || apt.staffId === selectedStaff
        return inRange && matchesStaff
      } catch {
        return false
      }
    })
  }, [appointments, dateRange, customStartDate, customEndDate, selectedStaff])

  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRangeFilter()
    return (transactions || []).filter(txn => {
      if (!txn.date || typeof txn.date !== 'string') return false
      try {
        const txnDate = parseISO(txn.date)
        return isWithinInterval(txnDate, { start, end })
      } catch {
        return false
      }
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
      if (!apt.date || typeof apt.date !== 'string') return false
      try {
        const aptDate = parseISO(apt.date)
        return isWithinInterval(aptDate, previousPeriod) && apt.status === 'completed'
      } catch {
        return false
      }
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
      
      try {
        const timeStr = apt.time.trim()
        if (!timeStr) return
        
        const isPM = timeStr.toLowerCase().includes('pm')
        const isAM = timeStr.toLowerCase().includes('am')
        
        const timeWithoutPeriod = timeStr.replace(/\s*(am|pm)/gi, '').trim()
        if (!timeWithoutPeriod) return
        
        const timeParts = timeWithoutPeriod.split(':')
        
        if (timeParts.length > 0 && timeParts[0]) {
          let hour = parseInt(timeParts[0])
          if (!isNaN(hour)) {
            if (isPM && hour !== 12) {
              hour += 12
            } else if (isAM && hour === 12) {
              hour = 0
            }
            hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
          }
        }
      } catch (error) {
        return
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

  const handleExportCSV = () => {
    try {
      const { start, end } = getDateRangeFilter()
      const dateRangeStr = `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
      
      let csvContent = 'Scruffy Butts - Business Report\n'
      csvContent += `Report Period:,${dateRangeStr}\n`
      csvContent += `Generated:,${format(new Date(), 'MMM dd, yyyy HH:mm')}\n\n`
      
      csvContent += 'REVENUE SUMMARY\n'
      csvContent += 'Metric,Value\n'
      csvContent += `Total Revenue,$${revenueMetrics.total.toFixed(2)}\n`
      csvContent += `Grooming Services,$${revenueMetrics.appointments.toFixed(2)}\n`
      csvContent += `Retail Sales,$${revenueMetrics.retail.toFixed(2)}\n`
      csvContent += `Average Transaction,$${revenueMetrics.average.toFixed(2)}\n`
      csvContent += `Growth Rate,${revenueMetrics.growth >= 0 ? '+' : ''}${revenueMetrics.growth.toFixed(1)}%\n\n`
      
      csvContent += 'APPOINTMENT SUMMARY\n'
      csvContent += 'Status,Count,Percentage\n'
      csvContent += `Completed,${appointmentMetrics.completed},${appointmentMetrics.completionRate.toFixed(1)}%\n`
      csvContent += `Scheduled,${appointmentMetrics.scheduled},${((appointmentMetrics.scheduled / (appointmentMetrics.total || 1)) * 100).toFixed(1)}%\n`
      csvContent += `Cancelled,${appointmentMetrics.cancelled},${appointmentMetrics.cancellationRate.toFixed(1)}%\n`
      csvContent += `Total,${appointmentMetrics.total},100%\n\n`
      
      csvContent += 'SERVICE PERFORMANCE\n'
      csvContent += 'Service,Bookings,Revenue,Avg Price\n'
      serviceBreakdown.forEach(service => {
        csvContent += `${service.service},${service.count},$${service.revenue.toFixed(2)},$${(service.revenue / service.count).toFixed(2)}\n`
      })
      csvContent += '\n'
      
      csvContent += 'STAFF PERFORMANCE\n'
      csvContent += 'Staff Member,Appointments,Revenue,Avg per Appointment\n'
      staffPerformance.forEach(staff => {
        csvContent += `${staff.name},${staff.appointments},$${staff.revenue.toFixed(2)},$${(staff.revenue / staff.appointments).toFixed(2)}\n`
      })
      csvContent += '\n'
      
      csvContent += 'TOP CUSTOMERS\n'
      csvContent += 'Rank,Customer,Visits,Total Spent,Last Visit\n'
      customerInsights.topCustomers.forEach((customer, idx) => {
        const lastVisit = customer.lastVisit ? format(parseISO(customer.lastVisit), 'MMM dd, yyyy') : 'N/A'
        csvContent += `${idx + 1},${customer.name},${customer.visits},$${customer.revenue.toFixed(2)},${lastVisit}\n`
      })
      csvContent += '\n'
      
      csvContent += 'PEAK HOURS\n'
      csvContent += 'Time,Appointments\n'
      peakTimes.forEach(time => {
        csvContent += `${time.formatted},${time.count}\n`
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

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      const { start, end } = getDateRangeFilter()
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
      doc.text('Revenue Summary', 20, yPos)
      
      yPos += 8
      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue', `$${revenueMetrics.total.toFixed(2)}`],
          ['Grooming Services', `$${revenueMetrics.appointments.toFixed(2)}`],
          ['Retail Sales', `$${revenueMetrics.retail.toFixed(2)}`],
          ['Average Transaction', `$${revenueMetrics.average.toFixed(2)}`],
          ['Growth Rate', `${revenueMetrics.growth >= 0 ? '+' : ''}${revenueMetrics.growth.toFixed(1)}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [67, 75, 150] },
        margin: { left: 20 }
      })
      
      yPos = (doc as any).lastAutoTable.finalY + 15
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Appointment Summary', 20, yPos)
      
      yPos += 8
      autoTable(doc, {
        startY: yPos,
        head: [['Status', 'Count', 'Percentage']],
        body: [
          ['Completed', appointmentMetrics.completed.toString(), `${appointmentMetrics.completionRate.toFixed(1)}%`],
          ['Scheduled', appointmentMetrics.scheduled.toString(), `${((appointmentMetrics.scheduled / (appointmentMetrics.total || 1)) * 100).toFixed(1)}%`],
          ['Cancelled', appointmentMetrics.cancelled.toString(), `${appointmentMetrics.cancellationRate.toFixed(1)}%`],
          ['Total', appointmentMetrics.total.toString(), '100%']
        ],
        theme: 'grid',
        headStyles: { fillColor: [67, 75, 150] },
        margin: { left: 20 }
      })
      
      doc.addPage()
      yPos = 20
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Service Performance', 20, yPos)
      
      yPos += 8
      if (serviceBreakdown.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Service', 'Bookings', 'Revenue', 'Avg Price']],
          body: serviceBreakdown.map(service => [
            service.service,
            service.count.toString(),
            `$${service.revenue.toFixed(2)}`,
            `$${(service.revenue / service.count).toFixed(2)}`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [67, 75, 150] },
          margin: { left: 20 }
        })
        yPos = (doc as any).lastAutoTable.finalY + 15
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text('No service data available', 20, yPos)
        yPos += 15
      }
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Staff Performance', 20, yPos)
      
      yPos += 8
      if (staffPerformance.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Staff Member', 'Appointments', 'Revenue', 'Avg per Appointment']],
          body: staffPerformance.map(staff => [
            staff.name,
            staff.appointments.toString(),
            `$${staff.revenue.toFixed(2)}`,
            `$${(staff.revenue / staff.appointments).toFixed(2)}`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [67, 75, 150] },
          margin: { left: 20 }
        })
        yPos = (doc as any).lastAutoTable.finalY + 15
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text('No staff performance data available', 20, yPos)
        yPos += 15
      }
      
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Top Customers', 20, yPos)
      
      yPos += 8
      if (customerInsights.topCustomers.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Rank', 'Customer', 'Visits', 'Total Spent', 'Last Visit']],
          body: customerInsights.topCustomers.map((customer, idx) => [
            `#${idx + 1}`,
            customer.name,
            customer.visits.toString(),
            `$${customer.revenue.toFixed(2)}`,
            customer.lastVisit ? format(parseISO(customer.lastVisit), 'MMM dd, yyyy') : 'N/A'
          ]),
          theme: 'grid',
          headStyles: { fillColor: [67, 75, 150] },
          margin: { left: 20 }
        })
        yPos = (doc as any).lastAutoTable.finalY + 15
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text('No customer data available', 20, yPos)
        yPos += 15
      }
      
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Peak Hours', 20, yPos)
      
      yPos += 8
      if (peakTimes.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Time', 'Appointments']],
          body: peakTimes.map(time => [
            time.formatted,
            time.count.toString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [67, 75, 150] },
          margin: { left: 20 }
        })
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text('No peak hour data available', 20, yPos)
      }
      
      doc.save(`scruffy-butts-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      
      toast.success('Report exported as PDF')
    } catch (error) {
      toast.error('Failed to export PDF')
      console.error(error)
    }
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download size={18} />
              <span>Export Report</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF} className="flex items-center space-x-2">
              <FilePdf size={18} />
              <span>Export as PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV} className="flex items-center space-x-2">
              <FileCsv size={18} />
              <span>Export as CSV</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                        {appointmentMetrics.total > 0 ? ((appointmentMetrics.scheduled / appointmentMetrics.total) * 100).toFixed(1) : '0.0'}%
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
                            style={{ width: `${peakTimes[0].count > 0 ? (time.count / peakTimes[0].count) * 100 : 0}%` }}
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
                        <TableCell className="text-right">{customer.lastVisit ? format(parseISO(customer.lastVisit), 'MMM dd, yyyy') : 'N/A'}</TableCell>
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
