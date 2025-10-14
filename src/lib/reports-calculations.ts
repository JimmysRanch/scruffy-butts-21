import { isWithinInterval, parseISO, differenceInDays } from 'date-fns'
import type { 
  Appointment, 
  Transaction, 
  GlobalFilters, 
  Settings,
  Staff,
  Service,
  Customer,
  TimeBasis
} from './reports-types'

export function getDateRangeFromFilter(filter: GlobalFilters['dateRange']): { start: Date; end: Date } {
  const now = new Date()
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  
  switch (filter.preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'yesterday': {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
    }
    case 'last7': {
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      return { start: startOfDay(start), end: endOfDay(now) }
    }
    case 'thisWeek': {
      const start = new Date(now)
      start.setDate(start.getDate() - now.getDay())
      return { start: startOfDay(start), end: endOfDay(now) }
    }
    case 'last30': {
      const start = new Date(now)
      start.setDate(start.getDate() - 30)
      return { start: startOfDay(start), end: endOfDay(now) }
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: startOfDay(start), end: endOfDay(now) }
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: startOfDay(start), end: endOfDay(end) }
    }
    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      const start = new Date(now.getFullYear(), quarter * 3, 1)
      return { start: startOfDay(start), end: endOfDay(now) }
    }
    case 'ytd': {
      const start = new Date(now.getFullYear(), 0, 1)
      return { start: startOfDay(start), end: endOfDay(now) }
    }
    case 'custom':
      if (filter.startDate && filter.endDate) {
        return { start: startOfDay(filter.startDate), end: endOfDay(filter.endDate) }
      }
      return { start: startOfDay(now), end: endOfDay(now) }
    default:
      return { start: startOfDay(now), end: endOfDay(now) }
  }
}

export function filterAppointments(
  appointments: Appointment[],
  filters: GlobalFilters
): Appointment[] {
  const { start, end } = getDateRangeFromFilter(filters.dateRange)
  
  return appointments.filter(apt => {
    if (!apt.date) return false
    
    try {
      const aptDate = parseISO(apt.date)
      if (!isWithinInterval(aptDate, { start, end })) return false
      
      if (filters.staffIds.length > 0 && apt.staffId && !filters.staffIds.includes(apt.staffId)) return false
      if (filters.serviceIds.length > 0 && !filters.serviceIds.includes(apt.serviceId)) return false
      if (filters.petSize.length > 0 && !filters.petSize.includes(apt.petSize)) return false
      if (filters.channel.length > 0 && !filters.channel.includes(apt.channel)) return false
      if (filters.appointmentStatus.length > 0) {
        const validStatuses: ('completed' | 'cancelled' | 'no-show')[] = filters.appointmentStatus
        if (apt.status !== 'scheduled' && !validStatuses.includes(apt.status)) return false
        if (apt.status === 'scheduled' && filters.appointmentStatus.length > 0) return false
      }
      
      return true
    } catch {
      return false
    }
  })
}

export function filterTransactions(
  transactions: Transaction[],
  filters: GlobalFilters,
  timeBasis: TimeBasis = 'checkout'
): Transaction[] {
  const { start, end } = getDateRangeFromFilter(filters.dateRange)
  
  return transactions.filter(txn => {
    const dateStr = timeBasis === 'transaction' ? txn.transactionDate : txn.checkoutDate
    if (!dateStr) return false
    
    try {
      const txnDate = parseISO(dateStr)
      if (!isWithinInterval(txnDate, { start, end })) return false
      
      if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(txn.paymentMethod)) return false
      
      return true
    } catch {
      return false
    }
  })
}

export function calculateRevenueMetrics(
  appointments: Appointment[],
  transactions: Transaction[],
  settings?: Settings
) {
  const completedAppointments = appointments.filter(apt => apt.status === 'completed')
  
  const appointmentRevenue = completedAppointments.reduce((sum, apt) => {
    return sum + apt.price - (apt.discount || 0)
  }, 0)
  
  const grossSales = transactions.reduce((sum, txn) => sum + txn.subtotal, 0)
  const discounts = transactions.reduce((sum, txn) => sum + (txn.discountTotal || 0), 0)
  const refunds = transactions.reduce((sum, txn) => sum + (txn.refundTotal || 0), 0)
  const netSales = grossSales - discounts - refunds
  const taxesCollected = transactions.reduce((sum, txn) => sum + (txn.taxTotal || 0), 0)
  const tips = transactions.reduce((sum, txn) => sum + (txn.tipTotal || 0), 0)
  const totalCollected = transactions.reduce((sum, txn) => sum + txn.totalCollected, 0)
  
  const processingFees = transactions.reduce((sum, txn) => {
    if (txn.processingFee) return sum + txn.processingFee
    
    if (settings) {
      const { feeRatePct, feeFixed, feeBasePolicy } = settings.processor
      let feeBase = txn.subtotal
      
      if (feeBasePolicy === 'subtotal+tax') {
        feeBase += txn.taxTotal
      } else if (feeBasePolicy === 'subtotal+tax+tip') {
        feeBase += txn.taxTotal + txn.tipTotal
      }
      
      return sum + (feeBase * (feeRatePct / 100)) + feeFixed
    }
    
    return sum
  }, 0)
  
  const invoiceCount = transactions.filter(txn => txn.status === 'completed').length
  const avgTicket = invoiceCount > 0 ? netSales / invoiceCount : 0
  
  return {
    grossSales,
    discounts,
    refunds,
    netSales,
    taxesCollected,
    tips,
    totalCollected,
    processingFees,
    invoiceCount,
    avgTicket,
    appointmentRevenue,
    completedCount: completedAppointments.length
  }
}

export function calculateMarginMetrics(
  appointments: Appointment[],
  transactions: Transaction[],
  services: Service[],
  staff: Staff[],
  settings?: Settings
) {
  const revenue = calculateRevenueMetrics(appointments, transactions, settings)
  
  let cogs = 0
  appointments.forEach(apt => {
    if (apt.status === 'completed') {
      const service = services.find(s => s.id === apt.serviceId)
      if (service?.estimatedSupplyCost) {
        cogs += service.estimatedSupplyCost
      }
    }
  })
  
  let directLabor = 0
  appointments.forEach(apt => {
    if (apt.status === 'completed' && apt.staffId) {
      const staffMember = staff.find(s => s.id === apt.staffId)
      if (staffMember) {
        const netRevenue = apt.price - (apt.discount || 0)
        
        if (staffMember.compensationModel === 'commission' && staffMember.commissionRate) {
          let laborCost = netRevenue * (staffMember.commissionRate / 100)
          if (staffMember.employerBurdenPct) {
            laborCost *= (1 + staffMember.employerBurdenPct / 100)
          }
          directLabor += laborCost
        } else if (staffMember.compensationModel === 'hourly' && staffMember.hourlyRate) {
          const hours = (apt.actualDuration || apt.plannedDuration) / 60
          let laborCost = hours * staffMember.hourlyRate
          if (staffMember.employerBurdenPct) {
            laborCost *= (1 + staffMember.employerBurdenPct / 100)
          }
          directLabor += laborCost
        }
      }
    }
  })
  
  const contributionMargin = revenue.netSales - cogs - revenue.processingFees - directLabor
  const contributionMarginPct = revenue.netSales > 0 ? (contributionMargin / revenue.netSales) * 100 : 0
  const grossMargin = revenue.netSales - cogs - revenue.processingFees
  const grossMarginPct = revenue.netSales > 0 ? (grossMargin / revenue.netSales) * 100 : 0
  
  const avgMarginPerAppointment = revenue.completedCount > 0 ? contributionMargin / revenue.completedCount : 0
  
  return {
    cogs,
    directLabor,
    contributionMargin,
    contributionMarginPct,
    grossMargin,
    grossMarginPct,
    avgMarginPerAppointment
  }
}

export function calculateAppointmentMetrics(appointments: Appointment[]) {
  const total = appointments.length
  const completed = appointments.filter(apt => apt.status === 'completed').length
  const cancelled = appointments.filter(apt => apt.status === 'cancelled').length
  const noShows = appointments.filter(apt => apt.status === 'no-show').length
  const scheduled = appointments.filter(apt => apt.status === 'scheduled').length
  
  const totalNonCancelled = total - cancelled
  const completionRate = totalNonCancelled > 0 ? (completed / totalNonCancelled) * 100 : 0
  const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0
  const noShowRate = totalNonCancelled > 0 ? (noShows / totalNonCancelled) * 100 : 0
  
  const durationVariances: number[] = []
  appointments.forEach(apt => {
    if (apt.status === 'completed' && apt.actualDuration && apt.plannedDuration) {
      durationVariances.push(apt.actualDuration - apt.plannedDuration)
    }
  })
  
  const avgDurationVariance = durationVariances.length > 0
    ? durationVariances.reduce((sum, v) => sum + v, 0) / durationVariances.length
    : 0
  
  return {
    total,
    completed,
    cancelled,
    noShows,
    scheduled,
    completionRate,
    cancellationRate,
    noShowRate,
    avgDurationVariance
  }
}

export function calculateRetentionMetrics(
  appointments: Appointment[],
  customers: Customer[]
) {
  const completedAppointments = appointments
    .filter(apt => apt.status === 'completed')
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
  
  let rebook0to24h = 0
  let rebook7d = 0
  let rebook30d = 0
  
  completedAppointments.forEach(apt => {
    if (apt.rebookedAt) {
      const rebookDate = parseISO(apt.rebookedAt)
      const completionDate = apt.completedAt ? parseISO(apt.completedAt) : parseISO(apt.date)
      const daysDiff = differenceInDays(rebookDate, completionDate)
      
      if (daysDiff <= 1) rebook0to24h++
      if (daysDiff <= 7) rebook7d++
      if (daysDiff <= 30) rebook30d++
    }
  })
  
  const totalCompleted = completedAppointments.length
  const rebookRate0to24h = totalCompleted > 0 ? (rebook0to24h / totalCompleted) * 100 : 0
  const rebookRate7d = totalCompleted > 0 ? (rebook7d / totalCompleted) * 100 : 0
  const rebookRate30d = totalCompleted > 0 ? (rebook30d / totalCompleted) * 100 : 0
  
  const customerIntervals: number[] = []
  const customerMap = new Map<string, Date[]>()
  
  completedAppointments.forEach(apt => {
    const dates = customerMap.get(apt.customerId) || []
    dates.push(parseISO(apt.date))
    customerMap.set(apt.customerId, dates)
  })
  
  customerMap.forEach(dates => {
    dates.sort((a, b) => a.getTime() - b.getTime())
    for (let i = 1; i < dates.length; i++) {
      customerIntervals.push(differenceInDays(dates[i], dates[i - 1]))
    }
  })
  
  const avgDaysToNextVisit = customerIntervals.length > 0
    ? customerIntervals.reduce((sum, days) => sum + days, 0) / customerIntervals.length
    : 0
  
  const now = new Date()
  const lapsedCustomers = customers.filter(customer => {
    if (!customer.lastVisit) return false
    const daysSinceLastVisit = differenceInDays(now, parseISO(customer.lastVisit))
    return daysSinceLastVisit > 90
  })
  
  return {
    rebookRate0to24h,
    rebookRate7d,
    rebookRate30d,
    avgDaysToNextVisit,
    lapsedCount: lapsedCustomers.length,
    lapsedCustomers
  }
}

export function calculateServiceBreakdown(
  appointments: Appointment[],
  services: Service[]
) {
  const serviceMap = new Map<string, {
    count: number
    revenue: number
    discounts: number
    avgDuration: number
    durationVariances: number[]
  }>()
  
  appointments.forEach(apt => {
    if (apt.status === 'completed') {
      const existing = serviceMap.get(apt.serviceId) || {
        count: 0,
        revenue: 0,
        discounts: 0,
        avgDuration: 0,
        durationVariances: []
      }
      
      existing.count++
      existing.revenue += apt.price
      existing.discounts += apt.discount || 0
      
      if (apt.actualDuration && apt.plannedDuration) {
        existing.durationVariances.push(apt.actualDuration - apt.plannedDuration)
      }
      
      serviceMap.set(apt.serviceId, existing)
    }
  })
  
  return Array.from(serviceMap.entries()).map(([serviceId, data]) => {
    const service = services.find(s => s.id === serviceId)
    const avgDurationVariance = data.durationVariances.length > 0
      ? data.durationVariances.reduce((sum, v) => sum + v, 0) / data.durationVariances.length
      : 0
    
    const netRevenue = data.revenue - data.discounts
    const avgTicket = data.count > 0 ? netRevenue / data.count : 0
    const discountPct = data.revenue > 0 ? (data.discounts / data.revenue) * 100 : 0
    
    return {
      serviceId,
      serviceName: service?.name || 'Unknown Service',
      serviceCategory: service?.category || 'Uncategorized',
      count: data.count,
      revenue: data.revenue,
      netRevenue,
      discounts: data.discounts,
      discountPct,
      avgTicket,
      avgDurationVariance,
      estimatedCOGS: service?.estimatedSupplyCost ? service.estimatedSupplyCost * data.count : 0
    }
  }).sort((a, b) => b.netRevenue - a.netRevenue)
}

export function calculateStaffPerformance(
  appointments: Appointment[],
  staff: Staff[],
  services: Service[]
) {
  const staffMap = new Map<string, {
    appointments: number
    revenue: number
    discounts: number
    tips: number
    hoursBooked: number
    hoursWorked: number
    noShows: number
    rebookCount: number
  }>()
  
  appointments.forEach(apt => {
    if (apt.staffId) {
      const existing = staffMap.get(apt.staffId) || {
        appointments: 0,
        revenue: 0,
        discounts: 0,
        tips: 0,
        hoursBooked: 0,
        hoursWorked: 0,
        noShows: 0,
        rebookCount: 0
      }
      
      if (apt.status === 'completed') {
        existing.appointments++
        existing.revenue += apt.price
        existing.discounts += apt.discount || 0
        existing.hoursWorked += (apt.actualDuration || apt.plannedDuration) / 60
        
        if (apt.rebookedAt) {
          existing.rebookCount++
        }
      } else if (apt.status === 'no-show') {
        existing.noShows++
      }
      
      existing.hoursBooked += apt.plannedDuration / 60
      
      staffMap.set(apt.staffId, existing)
    }
  })
  
  return Array.from(staffMap.entries()).map(([staffId, data]) => {
    const staffMember = staff.find(s => s.id === staffId)
    const netRevenue = data.revenue - data.discounts
    const revenuePerHour = data.hoursWorked > 0 ? netRevenue / data.hoursWorked : 0
    const avgTicket = data.appointments > 0 ? netRevenue / data.appointments : 0
    const rebookRate = data.appointments > 0 ? (data.rebookCount / data.appointments) * 100 : 0
    const totalScheduled = data.appointments + data.noShows
    const noShowRate = totalScheduled > 0 ? (data.noShows / totalScheduled) * 100 : 0
    
    return {
      staffId,
      staffName: staffMember?.name || `${staffMember?.firstName} ${staffMember?.lastName}` || 'Unknown',
      appointments: data.appointments,
      revenue: netRevenue,
      revenuePerHour,
      avgTicket,
      hoursWorked: data.hoursWorked,
      rebookRate,
      noShowRate,
      tips: data.tips
    }
  }).sort((a, b) => b.revenue - a.revenue)
}
