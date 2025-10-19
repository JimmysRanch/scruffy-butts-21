import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Calendar, Users, ChartBar, Clock, Dog, Package, User, Phone, Envelope, PencilSimple, Trash, ArrowClockwise, CheckCircle, Bell, CreditCard, WarningCircle, Gear } from '@phosphor-icons/react'
import { isToday, startOfWeek, endOfWeek, isWithinInterval, format, parseISO, isBefore, startOfDay } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookedWidget } from '@/components/widgets/BookedWidget'
import { GroomerWorkloadWidget } from '@/components/widgets/GroomerWorkloadWidget'
import { TotalAppointmentsWidget } from '@/components/widgets/TotalAppointmentsWidget'
import { TodayScheduleWidget } from '@/components/widgets/TodayScheduleWidget'
import { MonthlyRevenueWidget } from '@/components/widgets/MonthlyRevenueWidget'
import { AverageTicketWidget } from '@/components/widgets/AverageTicketWidget'
import { UpcomingAppointmentsWidget } from '@/components/widgets/UpcomingAppointmentsWidget'
import { QuickActionsWidget } from '@/components/widgets/QuickActionsWidget'
import { ActivityFeedWidget } from '@/components/widgets/ActivityFeedWidget'
import { RecentActivity } from '@/components/RecentActivity'
import { AppointmentCheckout } from '@/components/AppointmentCheckout'
import { seedActivityData } from '@/lib/seed-activity-data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'reports' | 'settings' | 'new-appointment' | 'customize-dashboard'

interface AppearanceSettings {
  compactMode?: boolean
  showWelcomeMessage?: boolean
}

interface TestDashboardProps {
  onNavigate: (view: View) => void
}

interface Appointment {
  id: string
  petName: string
  petId?: string
  customerFirstName: string
  customerLastName: string
  customerId: string
  service: string
  serviceId: string
  staffId?: string
  groomerRequested?: boolean
  date: string
  time: string
  endTime?: string
  duration: number
  price: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  reminderSent?: boolean
  confirmationSent?: boolean
  pickupNotificationSent?: boolean
  pickupNotificationAcknowledged?: boolean
  checkInTime?: string
  checkOutTime?: string
  paymentCompleted?: boolean
  paymentMethod?: 'cash' | 'card' | 'cashapp' | 'chime'
  amountPaid?: number
  pickedUpTime?: string
  createdAt: string
  rating?: number
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  pets: Pet[]
  name?: string
}

interface Pet {
  id: string
  name: string
  breed: string
  size: 'small' | 'medium' | 'large'
  notes?: string
  customerId?: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
  description: string
}

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  hireDate: string
  address: string
  city: string
  state: string
  zip: string
  specialties: string[]
  notes: string
  status: 'active' | 'inactive'
}

const STATUS_COLORS: Record<Appointment['status'], string> = {
  'scheduled': 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  'confirmed': 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
  'checked-in': 'border-blue-500/40 bg-blue-500/10 text-blue-100',
  'in-progress': 'border-purple-500/40 bg-purple-500/10 text-purple-100',
  'ready-for-pickup': 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100',
  'completed': 'border-gray-500/40 bg-gray-500/10 text-gray-100',
  'cancelled': 'border-red-500/40 bg-red-500/10 text-red-100',
  'no-show': 'border-orange-500/40 bg-orange-500/10 text-orange-100'
}

const WIDGET_ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  'total-appointments': Calendar,
  'week-appointments': Calendar,
  'booked-widget': ChartBar,
  'revenue-gauge': ChartBar,
  'active-clients': Users,
  'monthly-revenue': ChartBar,
  'average-ticket': ChartBar,
  'messages': Calendar,
  'groomer-workload': Users
}

interface StoredWidgetConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  defaultSize: { w: number; h: number }
}

const DEFAULT_WIDGETS: StoredWidgetConfig[] = [
  {
    id: 'total-appointments',
    name: 'Total Appointments',
    description: 'Shows total appointment count for today',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },
  {
    id: 'week-appointments',
    name: 'This Week',
    description: 'Shows appointments scheduled this week',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },
  {
    id: 'booked-widget',
    name: 'Booked Today',
    description: 'Shows booking percentage for today',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },

  {
    id: 'active-clients',
    name: 'Active Clients',
    description: 'Shows total clients with pets',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },
  {
    id: 'monthly-revenue',
    name: 'Monthly Revenue',
    description: 'Shows revenue for current month with trend',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },
  {
    id: 'average-ticket',
    name: 'Average Ticket',
    description: 'Shows average transaction value',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },
  {
    id: 'messages',
    name: 'Messages',
    description: 'Recent customer messages',
    enabled: true,
    defaultSize: { w: 2, h: 1 }
  },
  {
    id: 'groomer-workload',
    name: 'Groomer Workload',
    description: 'Shows staff workload distribution',
    enabled: true,
    defaultSize: { w: 2, h: 1 }
  },
  {
    id: 'today-schedule',
    name: 'Today\'s Schedule',
    description: 'Detailed view of today\'s appointments',
    enabled: true,
    defaultSize: { w: 2, h: 2 }
  },
  {
    id: 'upcoming-appointments',
    name: 'Upcoming Appointments',
    description: 'Next scheduled appointments',
    enabled: true,
    defaultSize: { w: 2, h: 1 }
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    description: 'Frequently used actions',
    enabled: true,
    defaultSize: { w: 1, h: 1 }
  },
  {
    id: 'activity-feed',
    name: 'Activity Feed',
    description: 'Recent business activities',
    enabled: true,
    defaultSize: { w: 2, h: 2 }
  }
]

export function TestDashboard({ onNavigate }: TestDashboardProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])
  const [appearance] = useKV<AppearanceSettings>('appearance-settings', {})
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const widgetsWithIcons = DEFAULT_WIDGETS.map(w => ({
    ...w,
    icon: WIDGET_ICON_MAP[w.id] || Calendar
  }))

  useEffect(() => {
    seedActivityData()
  }, [])

  const isCompact = appearance?.compactMode || false

  const today = new Date()
  const todayDateString = format(today, 'yyyy-MM-dd')
  const todayAppointments = (appointments || []).filter(apt => 
    apt.date === todayDateString && apt.status !== 'cancelled'
  ).sort((a, b) => {
    const timeA = a.time || ''
    const timeB = b.time || ''
    return timeA.localeCompare(timeB)
  })

  const weekStart = startOfWeek(today, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
  const weekAppointments = (appointments || []).filter(apt =>
    isWithinInterval(new Date(apt.date), { start: weekStart, end: weekEnd }) && 
    apt.status !== 'cancelled'
  )

  const handleViewAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setIsDetailOpen(true)
  }

  const handleEditAppointment = (apt: Appointment) => {
    setIsDetailOpen(false)
    toast.info('Edit functionality - navigate to appointments view')
    onNavigate('appointments')
  }

  const handleDeleteAppointment = (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      setAppointments((current) => (current || []).filter(apt => apt.id !== id))
      setIsDetailOpen(false)
      toast.success('Appointment deleted')
    }
  }

  const handleDuplicateAppointment = (apt: Appointment) => {
    setIsDetailOpen(false)
    toast.info('Duplicate functionality - navigate to appointments view')
    onNavigate('appointments')
  }

  const handleRebookAppointment = (apt: Appointment) => {
    setIsDetailOpen(false)
    toast.info('Rebook functionality - navigate to appointments view')
    onNavigate('appointments')
  }

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((current) =>
      (current || []).map(apt => apt.id === id ? { ...apt, status } : apt)
    )
    setSelectedAppointment(prev => prev ? { ...prev, status } : null)
    toast.success(`Appointment ${status}`)
  }

  const handleCheckoutComplete = () => {
    setIsCheckoutOpen(false)
    setIsDetailOpen(false)
    toast.success('Checkout completed')
  }

  const selectedCustomer = selectedAppointment 
    ? customers?.find(c => c.id === selectedAppointment.customerId)
    : null

  const selectedStaff = selectedAppointment?.staffId
    ? staffMembers?.find(s => s.id === selectedAppointment.staffId)
    : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
      case 'completed':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border border-gray-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
      case 'no-show':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30'
      default:
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
    }
  }

  const getStaffName = (staffId?: string) => {
    if (!staffId) return null
    const staff = staffMembers?.find(s => s.id === staffId)
    return staff ? `${staff.firstName} ${staff.lastName}` : null
  }

  const enabledWidgets = widgetsWithIcons.filter(w => w.enabled)

  return (
    <div className="space-y-6 relative z-10">

      <div className="grid grid-cols-6 gap-4 min-w-0 overflow-x-auto">
        {enabledWidgets.find(w => w.id === 'total-appointments') && (
          <div className="glass-widget glass-widget-turquoise cursor-pointer rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]" onClick={() => onNavigate('appointments')}>
            <TotalAppointmentsWidget />
          </div>
        )}

        {enabledWidgets.find(w => w.id === 'week-appointments') && (
          <div className="glass-widget glass-widget-turquoise cursor-pointer rounded-[1.25rem] min-w-0 overflow-hidden group transition-all duration-500 hover:scale-[1.02]" onClick={() => onNavigate('appointments')}>
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
                <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">This Week</h3>
              </div>
              <div className="pb-1 pt-1 px-4 min-w-0">
                <div className="text-2xl font-bold text-white/95">
                  {weekAppointments.length}
                </div>
                <p className="text-[10px] text-white/60 mt-0.5 truncate font-medium">
                  {weekAppointments.length === 1 ? 'appointment' : 'appointments'}
                </p>
              </div>
              <div className="px-4 pb-2">
                <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none" className="opacity-70">
                  <defs>
                    <linearGradient id="weekGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="oklch(0.70 0.20 210)" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="oklch(0.70 0.20 210)" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,24 L14,18 L28,12 L42,16 L56,8 L70,14 L84,10 L100,6 L100,32 L0,32 Z" fill="url(#weekGradient)"/>
                  <path d="M0,24 L14,18 L28,12 L42,16 L56,8 L70,14 L84,10 L100,6" stroke="oklch(0.70 0.20 210)" strokeWidth="2" fill="none" className="drop-shadow-[0_0_4px_oklch(0.70_0.20_210)]"/>
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {enabledWidgets.find(w => w.id === 'booked-widget') && (
          <div className="glass-widget glass-widget-turquoise rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
                <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">Booked Today</h3>
              </div>
              <div className="pb-1 pt-1 px-4 min-w-0">
                <div className="text-2xl font-bold text-white/95">
                  {todayAppointments.length > 0 ? Math.round((todayAppointments.filter(a => a.status !== 'cancelled').length / Math.max(todayAppointments.length, 8)) * 100) : 0}%
                </div>
                <p className="text-[10px] text-white/60 mt-0.5 truncate font-medium">
                  capacity filled
                </p>
              </div>
              <div className="px-4 pb-2">
                <div className="relative h-7 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${todayAppointments.length > 0 ? Math.round((todayAppointments.filter(a => a.status !== 'cancelled').length / Math.max(todayAppointments.length, 8)) * 100) : 0}%`,
                      background: 'linear-gradient(90deg, oklch(0.70 0.20 210), oklch(0.75 0.22 200))',
                      boxShadow: '0 0 12px oklch(0.70 0.20 210)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {enabledWidgets.find(w => w.id === 'active-clients') && (
          <div className="glass-widget glass-widget-turquoise rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
                <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">Active Clients</h3>
              </div>
              <div className="pb-1 pt-1 px-4 min-w-0">
                <div className="text-2xl font-bold text-white/95">
                  {(customers || []).filter(c => c.pets && c.pets.length > 0).length}
                </div>
                <p className="text-[10px] text-white/60 mt-0.5 truncate font-medium">
                  clients with pets
                </p>
              </div>
              <div className="px-4 pb-2 flex items-end justify-between gap-1">
                {[16, 22, 18, 24, 20, 26, 22, 28, 24, 30, 26, 32].map((height, i) => (
                  <div 
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-500"
                    style={{
                      height: `${height}px`,
                      background: 'linear-gradient(180deg, oklch(0.75 0.20 210), oklch(0.65 0.18 215))',
                      boxShadow: '0 0 6px oklch(0.70 0.20 210)'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {enabledWidgets.find(w => w.id === 'monthly-revenue') && (
          <div className="glass-widget glass-widget-turquoise rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <MonthlyRevenueWidget />
          </div>
        )}

        {enabledWidgets.find(w => w.id === 'average-ticket') && (
          <div className="glass-widget glass-widget-turquoise rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <AverageTicketWidget />
          </div>
        )}
      </div>

      <div className="grid grid-cols-6 gap-4">
        {enabledWidgets.find(w => w.id === 'messages') && (
          <div className="col-span-6 sm:col-span-6 lg:col-span-3 glass-widget glass-widget-turquoise rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
                <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">Messages</h3>
              </div>
              <div className="pb-3 pt-1 px-4 min-w-0">
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User size={12} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-white/90">Sarah Johnson</span>
                        <span className="text-[9px] text-white/50">10m ago</span>
                      </div>
                      <p className="text-[10px] text-white/70 truncate">Can we reschedule Buddy's appointment?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User size={12} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-white/90">Mike Chen</span>
                        <span className="text-[9px] text-white/50">1h ago</span>
                      </div>
                      <p className="text-[10px] text-white/70 truncate">Thanks for the great service today!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {enabledWidgets.find(w => w.id === 'groomer-workload') && (
          <div className="col-span-6 sm:col-span-6 lg:col-span-3 glass-widget glass-widget-turquoise rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <GroomerWorkloadWidget />
          </div>
        )}
      </div>

      {enabledWidgets.find(w => w.id === 'today-schedule') && (
        <div className="glass-card rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.01]">
          <TodayScheduleWidget onAppointmentClick={handleViewAppointment} />
        </div>
      )}

      {enabledWidgets.find(w => w.id === 'upcoming-appointments') && (
        <div className="glass-card rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.01]">
          <UpcomingAppointmentsWidget />
        </div>
      )}

      {enabledWidgets.find(w => w.id === 'quick-actions') && (
        <div className="glass-card rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.01]">
          <QuickActionsWidget onNavigate={onNavigate} />
        </div>
      )}

      {enabledWidgets.find(w => w.id === 'activity-feed') && (
        <div className="glass-card rounded-[1.25rem] min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.01]">
          <ActivityFeedWidget />
        </div>
      )}

      <div className="glass-card rounded-[1.25rem] @container min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.01]">
        <RecentActivity />
      </div>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Appointment Details</SheetTitle>
            <SheetDescription>View and manage appointment</SheetDescription>
          </SheetHeader>
          
          {selectedAppointment && (
            <AppointmentDetails
              appointment={selectedAppointment}
              customer={selectedCustomer}
              staffMember={selectedStaff}
              onStatusChange={(status) => updateAppointmentStatus(selectedAppointment.id, status)}
              onEdit={handleEditAppointment}
              onDelete={() => handleDeleteAppointment(selectedAppointment.id)}
              onDuplicate={handleDuplicateAppointment}
              onRebook={handleRebookAppointment}
              onClose={() => setIsDetailOpen(false)}
              onCheckout={() => {
                setIsDetailOpen(false)
                setIsCheckoutOpen(true)
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      <AppointmentCheckout
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        appointment={selectedAppointment}
        customer={selectedCustomer || null}
        staffMember={selectedStaff}
        onComplete={handleCheckoutComplete}
        onBack={() => {
          setIsCheckoutOpen(false)
          setIsDetailOpen(true)
        }}
      />
    </div>
  )
}

function AppointmentDetails({ 
  appointment, 
  customer, 
  staffMember,
  onStatusChange, 
  onEdit, 
  onDelete,
  onDuplicate,
  onRebook,
  onClose,
  onCheckout
}: { 
  appointment: Appointment
  customer?: Customer | null
  staffMember?: StaffMember | null
  onStatusChange: (status: Appointment['status']) => void
  onEdit: (apt: Appointment) => void
  onDelete: () => void
  onDuplicate: (apt: Appointment) => void
  onRebook: (apt: Appointment) => void
  onClose: () => void
  onCheckout?: () => void
}) {
  const isPast = isBefore(parseISO(appointment.date), startOfDay(new Date()))

  const getNextAction = () => {
    switch (appointment.status) {
      case 'scheduled':
        return { label: 'Confirm Appointment', action: () => onStatusChange('confirmed'), icon: CheckCircle }
      case 'confirmed':
        return { label: 'Check In', action: () => onStatusChange('checked-in'), icon: CheckCircle }
      case 'checked-in':
        return { label: 'Start Grooming', action: () => onStatusChange('in-progress'), icon: Clock }
      case 'in-progress':
        return { label: 'Mark Ready for Pickup', action: () => onStatusChange('ready-for-pickup'), icon: Bell }
      case 'ready-for-pickup':
        return { label: 'Checkout & Complete', action: onCheckout || (() => {}), icon: CreditCard }
      default:
        return null
    }
  }

  const nextAction = getNextAction()

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Dog size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{appointment.petName}</h2>
            <p className="text-sm text-muted-foreground">
              {appointment.customerFirstName} {appointment.customerLastName}
            </p>
          </div>
        </div>
        <Badge className={cn('text-xs', STATUS_COLORS[appointment.status])}>
          {appointment.status.replace('-', ' ')}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span>{format(parseISO(appointment.date), 'EEE, MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-muted-foreground" />
                <span>{appointment.time}</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Package size={16} className="text-muted-foreground" />
                <span>{appointment.service}</span>
              </div>
              <div className="text-lg font-bold text-primary">${appointment.price}</div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} />
              <span>Duration: {appointment.duration} minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {customer && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <User size={14} />
              Contact
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Envelope size={14} className="text-muted-foreground" />
                <span className="truncate">{customer.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {staffMember && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {staffMember.firstName[0]}{staffMember.lastName[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {staffMember.firstName} {staffMember.lastName}
                </div>
                <div className="text-xs text-muted-foreground">{staffMember.position}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {appointment.notes && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Notes
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{appointment.notes}</p>
          </CardContent>
        </Card>
      )}

      {isPast && appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no-show' && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-700">
          <CardContent className="p-3 flex items-start gap-2">
            <WarningCircle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-100">
              <div className="font-semibold">Past appointment</div>
              <div>Update status to complete or cancel</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {nextAction && appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no-show' && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Next Step
          </div>
          <Button 
            onClick={nextAction.action} 
            className="w-full" 
            size="lg"
          >
            <nextAction.icon size={18} className="mr-2" />
            {nextAction.label}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          More Actions
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => onEdit(appointment)}>
            <PencilSimple size={16} className="mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => onRebook(appointment)}>
            <ArrowClockwise size={16} className="mr-2" />
            Rebook
          </Button>
        </div>
        <Button 
          variant="outline" 
          onClick={onDelete} 
          className="w-full text-destructive hover:bg-destructive/10"
        >
          <Trash size={16} className="mr-2" />
          Delete Appointment
        </Button>
      </div>

      {appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no-show' && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Update Status
            </div>
            <Select value={appointment.status} onValueChange={(value) => onStatusChange(value as Appointment['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="ready-for-pickup">Ready for Pickup</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  )
}
