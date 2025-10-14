export type TimeBasis = 'service' | 'checkout' | 'transaction'
export type DateRangePreset = 'today' | 'yesterday' | 'last7' | 'thisWeek' | 'last30' | 'thisMonth' | 'lastMonth' | 'quarter' | 'ytd' | 'custom'

export interface DateRangeFilter {
  preset: DateRangePreset
  startDate?: Date
  endDate?: Date
}

export interface GlobalFilters {
  dateRange: DateRangeFilter
  timeBasis: TimeBasis
  staffIds: string[]
  serviceIds: string[]
  petSize: ('small' | 'medium' | 'large')[]
  channel: ('walk-in' | 'phone' | 'online')[]
  clientType: ('new' | 'returning')[]
  appointmentStatus: ('completed' | 'cancelled' | 'no-show')[]
  paymentMethod: string[]
}

export interface KPIMetric {
  label: string
  value: number | string
  format: 'currency' | 'number' | 'percentage'
  delta?: number
  tooltip: string
  drillable?: boolean
}

export interface Insight {
  type: 'warning' | 'success' | 'info'
  message: string
  action?: string
  impact?: string
}

export interface ReportView {
  id: string
  name: string
  reportType: string
  filters: GlobalFilters
  columns?: string[]
  groupBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  customerId: string
  customerFirstName: string
  customerLastName: string
  petId: string
  petName: string
  petSize: 'small' | 'medium' | 'large'
  serviceId: string
  service: string
  serviceCategoryId?: string
  serviceCategory?: string
  staffId?: string
  date: string
  time: string
  plannedDuration: number
  actualDuration?: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  price: number
  discount?: number
  channel: 'walk-in' | 'phone' | 'online'
  bookedAt: string
  completedAt?: string
  cancelledAt?: string
  rebookedAt?: string
  remindersSent?: Array<{
    sentAt: string
    channel: 'sms' | 'email'
    confirmedAt?: string
  }>
  notes?: string
}

export interface Transaction {
  id: string
  appointmentId?: string
  customerId?: string
  checkoutDate: string
  transactionDate: string
  items: Array<{
    id?: string
    type: 'service' | 'product'
    name: string
    serviceId?: string
    staffId?: string
    quantity: number
    unitPrice: number
    lineDiscount?: number
    lineCost?: number
  }>
  subtotal: number
  discountTotal: number
  taxTotal: number
  tipTotal: number
  refundTotal?: number
  totalCollected: number
  paymentMethod: string
  processingFee?: number
  batchId?: string
  status: 'completed' | 'pending' | 'refunded'
}

export interface Service {
  id: string
  name: string
  category: string
  defaultDuration: number
  estimatedSupplyCost?: number
  petSizeRules?: Record<'small' | 'medium' | 'large', { price: number; duration: number }>
  active: boolean
  basePrice: number
}

export interface Staff {
  id: string
  firstName: string
  lastName: string
  name: string
  role: string
  compensationModel?: 'commission' | 'hourly'
  commissionRate?: number
  hourlyRate?: number
  employerBurdenPct?: number
  color: string
  active: boolean
  email: string
  phone: string
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zip?: string
  firstVisit?: string
  lastVisit?: string
  totalVisits?: number
  totalSpent?: number
  pets: Pet[]
  notes?: string
}

export interface Pet {
  id: string
  name: string
  breed: string
  size: 'small' | 'medium' | 'large'
  age?: number
  notes?: string
}

export interface Settings {
  processor: {
    feeRatePct: number
    feeFixed: number
    feeBasePolicy: 'subtotal' | 'subtotal+tax' | 'subtotal+tax+tip'
  }
  tips: {
    tipFeesApply: boolean
    tipFeePayer: 'business' | 'staff'
  }
  labor: {
    defaultCompensationModel: 'commission' | 'hourly'
    defaultCommissionRate: number
    defaultHourlyRate: number
    employerBurdenPct: number
  }
  retention: {
    rebookWindow0to24h: boolean
    rebookWindow7d: boolean
    rebookWindow30d: boolean
    lapsedThresholdDays: number
  }
  attribution: {
    windowDays: number
    confirmationWindowHours: number
  }
  messaging: {
    reminderSchedule: string[]
    messageCost: number
  }
}

export interface MetricDefinition {
  name: string
  formula: string
  exclusions: string
  timeBasisSensitivity: string
  defaultTimeBasis: TimeBasis
}
