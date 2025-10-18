import { useState, useMemo, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, Calendar, Clock, User, MagnifyingGlass, Funnel, Phone, Envelope, 
  CheckCircle, XCircle, ClockCounterClockwise, PencilSimple, Trash, 
  CaretLeft, CaretRight, List, CalendarBlank, UserCircle, Dog, Package,
  Bell, BellSlash, Copy, Check, WarningCircle, ArrowClockwise, CreditCard
} from '@phosphor-icons/react'
import { AppointmentCheckout } from '@/components/AppointmentCheckout'
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths, isSameDay, parseISO, isToday, isBefore, startOfDay } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
  rating: number
}

type ViewMode = 'day' | 'week' | 'month' | 'list'
type FilterStatus = 'all' | 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'no-show'

const STATUS_COLORS = {
  scheduled: 'bg-primary/10 text-primary border-primary/30',
  confirmed: 'bg-green-500/10 text-green-400 border-green-500/30',
  'checked-in': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'in-progress': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'ready-for-pickup': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  completed: 'bg-white/10 text-white/70 border-white/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  'no-show': 'bg-red-500/10 text-red-400 border-red-500/30'
}

const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
]

interface AppointmentSchedulerProps {
  onNavigateToNewAppointment?: () => void
}

export function AppointmentScheduler({ onNavigateToNewAppointment }: AppointmentSchedulerProps = {}) {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [services] = useKV<Service[]>('services', [])
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])
  const [appearance] = useKV<{ compactMode?: boolean }>('appearance-settings', {})
  
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterStaff, setFilterStaff] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  
  const [formCustomer, setFormCustomer] = useState('')
  const [formPet, setFormPet] = useState('')
  const [formService, setFormService] = useState('')
  const [formStaff, setFormStaff] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formSendReminder, setFormSendReminder] = useState(true)
  const [formSendConfirmation, setFormSendConfirmation] = useState(true)
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null)

  const isCompact = appearance?.compactMode || false

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [time, period] = startTime.split(' ')
    const [hours, minutes] = time.split(':').map(Number)
    let hour24 = hours
    if (period === 'PM' && hours !== 12) hour24 += 12
    if (period === 'AM' && hours === 12) hour24 = 0
    
    const totalMinutes = hour24 * 60 + minutes + durationMinutes
    const endHour24 = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60
    
    const endHour12 = endHour24 % 12 || 12
    const endPeriod = endHour24 >= 12 ? 'PM' : 'AM'
    
    return `${endHour12}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`
  }

  const handleCreateAppointment = () => {
    if (!formCustomer || !formPet || !formService || !formDate || !formTime) {
      toast.error('Please fill in all required fields')
      return
    }

    const customer = (customers || []).find(c => c.id === formCustomer)
    const pet = customer?.pets.find(p => p.id === formPet)
    const service = (services || []).find(s => s.id === formService)

    if (!customer || !pet || !service) {
      toast.error('Invalid selection')
      return
    }

    const endTime = calculateEndTime(formTime, service.duration)
    const appointmentDate = formDate

    const conflicts = (appointments || []).filter(apt => 
      apt.date === appointmentDate &&
      apt.staffId === (formStaff === 'unassigned' ? undefined : formStaff) &&
      apt.status !== 'cancelled' &&
      apt.status !== 'no-show' &&
      apt.id !== selectedAppointment?.id
    )

    if (conflicts.length > 0 && formStaff !== 'unassigned') {
      toast.warning('Time slot may conflict with existing appointment')
    }

    if (selectedAppointment) {
      setAppointments((current) =>
        (current || []).map(apt =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                petName: pet.name,
                petId: pet.id,
                customerFirstName: customer.firstName,
                customerLastName: customer.lastName,
                customerId: customer.id,
                service: service.name,
                serviceId: service.id,
                staffId: formStaff === 'unassigned' ? undefined : formStaff || undefined,
                date: formDate,
                time: formTime,
                endTime,
                duration: service.duration,
                price: service.price,
                notes: formNotes,
                reminderSent: formSendReminder,
                confirmationSent: formSendConfirmation
              }
            : apt
        )
      )
      toast.success('Appointment updated successfully!')
    } else {
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        petName: pet.name,
        petId: pet.id,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerId: customer.id,
        service: service.name,
        serviceId: service.id,
        staffId: formStaff === 'unassigned' ? undefined : formStaff || undefined,
        date: formDate,
        time: formTime,
        endTime,
        duration: service.duration,
        price: service.price,
        status: 'scheduled',
        notes: formNotes,
        reminderSent: formSendReminder,
        confirmationSent: formSendConfirmation,
        createdAt: new Date().toISOString()
      }

      setAppointments((current) => [...(current || []), newAppointment])
      toast.success('Appointment scheduled successfully!')
    }
    
    resetForm()
    setIsNewAppointmentOpen(false)
  }

  const resetForm = () => {
    setFormCustomer('')
    setFormPet('')
    setFormService('')
    setFormStaff('unassigned')
    setFormDate('')
    setFormTime('')
    setFormNotes('')
    setFormSendReminder(true)
    setFormSendConfirmation(true)
    setSelectedAppointment(null)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setFormCustomer(appointment.customerId)
    setFormService(appointment.serviceId)
    setFormStaff(appointment.staffId || 'unassigned')
    setFormDate(appointment.date)
    setFormTime(appointment.time)
    setFormNotes(appointment.notes || '')
    setFormSendReminder(appointment.reminderSent || false)
    setFormSendConfirmation(appointment.confirmationSent || false)
    
    const customer = (customers || []).find(c => c.id === appointment.customerId)
    if (customer) {
      const pet = customer.pets.find(p => p.name === appointment.petName)
      if (pet) setFormPet(pet.id)
    }
    
    setIsNewAppointmentOpen(true)
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      setAppointments((current) => (current || []).filter(apt => apt.id !== appointmentId))
      toast.success('Appointment deleted')
      setIsDetailOpen(false)
    }
  }

  const handleDuplicateAppointment = (appointment: Appointment) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      checkInTime: undefined,
      checkOutTime: undefined
    }
    setAppointments((current) => [...(current || []), newAppointment])
    toast.success('Appointment duplicated')
  }

  const handleRebookAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setFormCustomer(appointment.customerId)
    setFormService(appointment.serviceId)
    setFormStaff(appointment.staffId || 'unassigned')
    setFormDate('')
    setFormTime('')
    setFormNotes(appointment.notes || '')
    setFormSendReminder(true)
    setFormSendConfirmation(true)
    
    const customer = (customers || []).find(c => c.id === appointment.customerId)
    if (customer) {
      const pet = customer.pets.find(p => p.name === appointment.petName)
      if (pet) setFormPet(pet.id)
    }
    
    setSelectedAppointment(null)
    setIsNewAppointmentOpen(true)
    toast.info('Select new date and time for rebooking')
  }

  const updateAppointmentStatus = (appointmentId: string, status: Appointment['status']) => {
    setAppointments((current) =>
      (current || []).map(apt => {
        if (apt.id === appointmentId) {
          const updates: Partial<Appointment> = { status }
          if (status === 'checked-in' && !apt.checkInTime) {
            updates.checkInTime = new Date().toISOString()
          }
          if (status === 'ready-for-pickup') {
            updates.pickupNotificationSent = true
            toast.success('Pickup notification sent to customer!')
          }
          if (status === 'completed' && !apt.checkOutTime) {
            updates.checkOutTime = new Date().toISOString()
          }
          return { ...apt, ...updates }
        }
        return apt
      })
    )
    toast.success(`Appointment ${status.replace('-', ' ')}`)
  }

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailOpen(true)
  }

  const handleCheckoutComplete = (
    appointmentId: string, 
    paymentData: {
      paymentMethod: 'cash' | 'card' | 'cashapp' | 'chime'
      amountPaid: number
      tip: number
      discount: number
    }
  ) => {
    setAppointments((current) =>
      (current || []).map(apt => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            status: 'completed' as const,
            paymentCompleted: true,
            paymentMethod: paymentData.paymentMethod,
            amountPaid: paymentData.amountPaid,
            pickedUpTime: new Date().toISOString(),
            checkOutTime: new Date().toISOString()
          }
        }
        return apt
      })
    )
    setIsCheckoutOpen(false)
    setSelectedAppointment(null)
  }

  const filteredAppointments = useMemo(() => {
    let filtered = appointments || []

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(apt =>
        apt.petName.toLowerCase().includes(query) ||
        apt.customerFirstName.toLowerCase().includes(query) ||
        apt.customerLastName.toLowerCase().includes(query) ||
        apt.service.toLowerCase().includes(query)
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus)
    }

    if (filterStaff !== 'all') {
      filtered = filtered.filter(apt => apt.staffId === filterStaff)
    }

    return filtered
  }, [appointments, searchQuery, filterStatus, filterStaff])

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return filteredAppointments.filter(apt => apt.date === dateStr).sort((a, b) => {
      const timeA = a.time || ''
      const timeB = b.time || ''
      return timeA.localeCompare(timeB)
    })
  }

  const getWeekDates = () => {
    const start = startOfWeek(currentDate)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const getMonthDates = (): Date[] => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const startDay = startOfWeek(start)
    const endDay = endOfWeek(end)
    
    const dates: Date[] = []
    let currentDay = startDay
    while (currentDay <= endDay) {
      dates.push(currentDay)
      currentDay = addDays(currentDay, 1)
    }
    return dates
  }

  const navigatePrevious = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, -1))
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, -1))
    else if (viewMode === 'month') setCurrentDate(addMonths(currentDate, -1))
  }

  const navigateNext = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1))
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1))
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  const getDateRangeLabel = () => {
    if (viewMode === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy')
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate)
      const end = endOfWeek(currentDate)
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    }
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy')
    return 'All Appointments'
  }

  const selectedCustomerData = (customers || []).find(c => c.id === formCustomer)
  const selectedServiceData = (services || []).find(s => s.id === formService)
  const selectedStaffData = (staffMembers || []).find(s => s.id === formStaff)

  const getStaffColor = (staffId?: string) => {
    if (!staffId) return 'bg-gray-200'
    const staffMember = (staffMembers || []).find(s => s.id === staffId)
    return 'bg-primary/20'
  }

  const upcomingCount = (appointments || []).filter(apt => {
    const aptDate = parseISO(apt.date)
    return (apt.status === 'scheduled' || apt.status === 'confirmed') && 
           !isBefore(aptDate, startOfDay(new Date()))
  }).length

  const todayCount = (appointments || []).filter(apt => 
    isSameDay(parseISO(apt.date), new Date()) && 
    apt.status !== 'cancelled' && 
    apt.status !== 'no-show'
  ).length

  const selectedCustomer = selectedAppointment 
    ? customers?.find(c => c.id === selectedAppointment.customerId)
    : null

  const selectedStaff = selectedAppointment?.staffId
    ? staffMembers?.find(s => s.id === selectedAppointment.staffId)
    : null

  return (
    <div className="space-y-3">
      {showFilters && (
        <div className="glass-card rounded-[1.25rem] overflow-hidden">
          <div className="pt-5 pb-4 px-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-white/70 font-semibold">Status</Label>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
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

              <div>
                <Label className="text-xs text-white/70 font-semibold">Staff Member</Label>
                <Select value={filterStaff} onValueChange={setFilterStaff}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {(staffMembers || []).map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterStatus('all')
                    setFilterStaff('all')
                    setSearchQuery('')
                  }}
                  className="w-full h-8 text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-[1.25rem] overflow-hidden">
        <div className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>

              {viewMode !== 'list' && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={navigatePrevious}>
                    <CaretLeft size={18} />
                  </Button>
                  <Button variant="outline" onClick={navigateToday} className="text-sm">
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={navigateNext}>
                    <CaretRight size={18} />
                  </Button>
                  <div className="text-sm font-medium text-white/80 ml-2">
                    {getDateRangeLabel()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && 'bg-primary/10')}
              >
                <Funnel size={18} />
              </Button>
              
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  if (onNavigateToNewAppointment) {
                    onNavigateToNewAppointment()
                  } else {
                    setIsNewAppointmentOpen(true)
                  }
                }}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Appointment</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isNewAppointmentOpen} onOpenChange={(open) => {
        setIsNewAppointmentOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
            </DialogTitle>
            <DialogDescription>
              {selectedAppointment ? 'Update appointment details' : 'Create a new grooming appointment'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select value={formCustomer} onValueChange={setFormCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(customers || []).map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName && customer.lastName 
                          ? `${customer.firstName} ${customer.lastName}` 
                          : customer.name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomerData && (
                <div className="col-span-2">
                  <Label htmlFor="pet">Pet *</Label>
                  <Select value={formPet} onValueChange={setFormPet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCustomerData.pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} ({pet.breed})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="col-span-2">
                <Label htmlFor="service">Service *</Label>
                <Select value={formService} onValueChange={setFormService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {(services || []).map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="staff">Assign Staff (Optional)</Label>
                <Select value={formStaff} onValueChange={setFormStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {(staffMembers || []).map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <Select value={formTime} onValueChange={setFormTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedServiceData && (
              <div className="p-3 bg-secondary rounded-lg space-y-1">
                <p className="text-sm font-medium">{selectedServiceData.name}</p>
                <p className="text-sm text-muted-foreground">
                  Duration: {selectedServiceData.duration} min • Price: ${selectedServiceData.price}
                </p>
                {formTime && (
                  <p className="text-sm text-muted-foreground">
                    End time: {calculateEndTime(formTime, selectedServiceData.duration)}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Special instructions or notes..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} />
                  <Label htmlFor="reminder" className="cursor-pointer">Send reminder</Label>
                </div>
                <Switch
                  id="reminder"
                  checked={formSendReminder}
                  onCheckedChange={setFormSendReminder}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Envelope size={16} />
                  <Label htmlFor="confirmation" className="cursor-pointer">Send confirmation</Label>
                </div>
                <Switch
                  id="confirmation"
                  checked={formSendConfirmation}
                  onCheckedChange={setFormSendConfirmation}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNewAppointmentOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateAppointment}>
              {selectedAppointment ? 'Update' : 'Schedule'} Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewMode === 'list' && (
        <ListView
          appointments={filteredAppointments}
          onViewAppointment={handleViewAppointment}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={(apt) => handleDeleteAppointment(apt.id)}
          onDuplicateAppointment={handleDuplicateAppointment}
          onRebookAppointment={handleRebookAppointment}
          onStatusChange={updateAppointmentStatus}
          getStaffColor={getStaffColor}
          staffMembers={staffMembers || []}
        />
      )}

      {viewMode === 'day' && (
        <DayView
          date={currentDate}
          appointments={getAppointmentsForDate(currentDate)}
          onViewAppointment={handleViewAppointment}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={(apt) => handleDeleteAppointment(apt.id)}
          onDuplicateAppointment={handleDuplicateAppointment}
          onRebookAppointment={handleRebookAppointment}
          onStatusChange={updateAppointmentStatus}
          getStaffColor={getStaffColor}
          staffMembers={staffMembers || []}
          timeSlots={TIME_SLOTS}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          weekDates={getWeekDates()}
          appointments={filteredAppointments}
          onViewAppointment={handleViewAppointment}
          getStaffColor={getStaffColor}
          staffMembers={staffMembers || []}
        />
      )}

      {viewMode === 'month' && (
        <MonthView
          monthDates={getMonthDates()}
          currentDate={currentDate}
          appointments={filteredAppointments}
          onViewAppointment={handleViewAppointment}
          getStaffColor={getStaffColor}
        />
      )}

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

function ListView({
  appointments,
  onViewAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onDuplicateAppointment,
  onRebookAppointment,
  onStatusChange,
  getStaffColor,
  staffMembers
}: {
  appointments: Appointment[]
  onViewAppointment: (apt: Appointment) => void
  onEditAppointment: (apt: Appointment) => void
  onDeleteAppointment: (apt: Appointment) => void
  onDuplicateAppointment: (apt: Appointment) => void
  onRebookAppointment: (apt: Appointment) => void
  onStatusChange: (id: string, status: Appointment['status']) => void
  getStaffColor: (staffId?: string) => string
  staffMembers: StaffMember[]
}) {
  if (appointments.length === 0) {
    return (
      <div className="glass-card rounded-[1.25rem] overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5">
            <List size={48} className="mx-auto text-white/50" weight="duotone" />
          </div>
          <p className="text-base text-white/60 font-medium">No appointments found</p>
        </div>
      </div>
    )
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time)
    const dateB = new Date(b.date + ' ' + b.time)
    return dateB.getTime() - dateA.getTime()
  })

  const groupedByDate = sortedAppointments.reduce((groups, apt) => {
    const date = apt.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(apt)
    return groups
  }, {} as Record<string, Appointment[]>)

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <div className="space-y-6 pb-8">
      {sortedDates.map((date) => {
        const dateObj = parseISO(date)
        const appointmentsForDate = groupedByDate[date]
        const isCurrentDay = isToday(dateObj)
        const isPastDay = isBefore(dateObj, startOfDay(new Date())) && !isCurrentDay
        
        return (
          <div key={date} className="space-y-3">
            <div className={cn(
              'glass-card py-2 px-4 rounded-lg overflow-hidden shadow-lg',
              isCurrentDay && 'ring-1 ring-primary/50 shadow-[0_0_16px_oklch(0.60_0.20_280/0.3)]'
            )}>
              <div className="flex items-center justify-between gap-3">
                <h3 className={cn(
                  'font-bold text-base leading-tight',
                  isCurrentDay ? 'text-primary drop-shadow-[0_0_8px_oklch(0.60_0.20_280)]' : 'text-white/90'
                )}>
                  {isCurrentDay 
                    ? 'Today' 
                    : format(dateObj, 'EEEE, MMMM d, yyyy')
                  }
                </h3>
                <Badge variant={isCurrentDay ? 'default' : 'secondary'} className="text-xs font-semibold shrink-0">
                  {appointmentsForDate.length}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              {appointmentsForDate.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onClick={() => onViewAppointment(apt)}
                  onEdit={() => onEditAppointment(apt)}
                  onDelete={() => onDeleteAppointment(apt)}
                  onDuplicate={() => onDuplicateAppointment(apt)}
                  onRebook={() => onRebookAppointment(apt)}
                  onStatusChange={(status) => onStatusChange(apt.id, status)}
                  getStaffColor={getStaffColor}
                  staffMembers={staffMembers}
                  showActions
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AppointmentCard({ 
  appointment, 
  onClick, 
  onEdit,
  onDelete,
  onDuplicate,
  onRebook,
  onStatusChange,
  getStaffColor,
  staffMembers,
  showActions = false
}: { 
  appointment: Appointment
  onClick: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onRebook?: () => void
  onStatusChange?: (status: Appointment['status']) => void
  getStaffColor: (staffId?: string) => string
  staffMembers: StaffMember[]
  showActions?: boolean
}) {
  const [tapCount, setTapCount] = useState(0)
  const staffMemberData = staffMembers?.find(s => s.id === appointment.staffId)
  const isPast = isBefore(parseISO(appointment.date), startOfDay(new Date()))

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <div
      className={cn(
        'glass-card border-2 rounded-xl p-4 cursor-pointer hover:scale-[1.01] transition-all duration-200',
        STATUS_COLORS[appointment.status],
        isPast && 'opacity-60'
      )}
      onClick={handleCardClick}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 rounded-lg bg-current/10 flex-shrink-0">
                <Dog size={20} className="opacity-80" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg leading-tight">
                  {appointment.petName}
                  {staffMemberData && (
                    <span className="text-sm text-white/60 font-normal ml-2">
                      with {staffMemberData.firstName} {staffMemberData.lastName}
                      {appointment.groomerRequested && (
                        <span className="text-red-500 font-bold ml-1">R</span>
                      )}
                    </span>
                  )}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-white/70 mb-2.5">
              <User size={16} className="flex-shrink-0" />
              <span>{appointment.customerFirstName} {appointment.customerLastName}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-white/70 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1">
                <Package size={16} className="flex-shrink-0" />
                <span>{appointment.service}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1">
                <Calendar size={16} className="flex-shrink-0" />
                <span>{format(parseISO(appointment.date), 'MMM d')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1">
                <Clock size={16} className="flex-shrink-0" />
                <span className="font-medium">{appointment.time}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge variant="outline" className="border-current/30 bg-current/10 font-semibold whitespace-nowrap">
              {appointment.status.replace('-', ' ')}
            </Badge>
            <div className="text-2xl font-bold text-white/90">${appointment.price}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DayView({
  date,
  appointments,
  onViewAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onDuplicateAppointment,
  onRebookAppointment,
  onStatusChange,
  getStaffColor,
  staffMembers,
  timeSlots
}: {
  date: Date
  appointments: Appointment[]
  onViewAppointment: (apt: Appointment) => void
  onEditAppointment: (apt: Appointment) => void
  onDeleteAppointment: (apt: Appointment) => void
  onDuplicateAppointment: (apt: Appointment) => void
  onRebookAppointment: (apt: Appointment) => void
  onStatusChange: (id: string, status: Appointment['status']) => void
  getStaffColor: (staffId?: string) => string
  staffMembers: StaffMember[]
  timeSlots: string[]
}) {
  return (
    <div className="glass-card rounded-[1.25rem] overflow-hidden p-4">
      <div className="space-y-2">
        {timeSlots.map((timeSlot) => {
          const aptsAtTime = appointments.filter(apt => apt.time === timeSlot)
          return (
            <div key={timeSlot} className="flex gap-3 min-h-[70px]">
              <div className="w-20 flex-shrink-0 text-sm font-semibold text-white/80 pt-2">
                {timeSlot}
              </div>
              <div className="flex-1 space-y-2">
                {aptsAtTime.length > 0 ? (
                  aptsAtTime.map((apt) => (
                    <div 
                      key={apt.id}
                      onClick={() => onViewAppointment(apt)}
                      className={cn(
                        'glass-card border-2 rounded-lg p-3 cursor-pointer hover:scale-[1.01] transition-all',
                        STATUS_COLORS[apt.status]
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{apt.petName}</p>
                          <p className="text-xs text-white/60 truncate">{apt.customerFirstName} {apt.customerLastName}</p>
                        </div>
                        <Badge variant="outline" className="border-current/30 bg-current/10 text-xs flex-shrink-0">
                          ${apt.price}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full min-h-[60px] border-2 border-dashed border-white/10 rounded-lg" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeekView({
  weekDates,
  appointments,
  onViewAppointment,
  getStaffColor,
  staffMembers
}: {
  weekDates: Date[]
  appointments: Appointment[]
  onViewAppointment: (apt: Appointment) => void
  getStaffColor: (staffId?: string) => string
  staffMembers: StaffMember[]
}) {
  return (
    <div className="glass-card rounded-[1.25rem] overflow-hidden p-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const dayAppts = appointments.filter(apt => apt.date === dateStr)
          const isCurrentDay = isToday(date)
          
          return (
            <div
              key={dateStr}
              className={cn(
                'glass-card border-2 rounded-xl p-3 min-h-[240px]',
                isCurrentDay ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/30' : 'border-white/10'
              )}
            >
              <div className="text-center mb-3 pb-2 border-b border-white/10">
                <div className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  {format(date, 'EEE')}
                </div>
                <div className={cn(
                  'text-2xl font-bold mt-1',
                  isCurrentDay ? 'text-primary' : 'text-white/90'
                )}>
                  {format(date, 'd')}
                </div>
              </div>
              <div className="space-y-1.5">
                {dayAppts.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => onViewAppointment(apt)}
                    className={cn(
                      'text-xs p-2 rounded-lg cursor-pointer hover:scale-105 transition-transform border-2',
                      STATUS_COLORS[apt.status]
                    )}
                  >
                    <div className="font-bold truncate">{apt.petName}</div>
                    <div className="text-xs font-medium opacity-80 mt-0.5">{apt.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthView({
  monthDates,
  currentDate,
  appointments,
  onViewAppointment,
  getStaffColor
}: {
  monthDates: Date[]
  currentDate: Date
  appointments: Appointment[]
  onViewAppointment: (apt: Appointment) => void
  getStaffColor: (staffId?: string) => string
}) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  return (
    <div className="glass-card rounded-[1.25rem] overflow-hidden p-4">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-bold text-white/80 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthDates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const dayAppts = appointments.filter(apt => apt.date === dateStr)
          const isCurrentDay = isToday(date)
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          
          return (
            <div
              key={dateStr}
              className={cn(
                'glass-card border-2 rounded-lg p-2 min-h-[100px]',
                isCurrentDay && 'bg-primary/5 border-primary/40 ring-1 ring-primary/30',
                !isCurrentDay && 'border-white/10',
                !isCurrentMonth && 'opacity-40'
              )}
            >
              <div className={cn(
                'text-sm font-bold mb-1',
                isCurrentDay ? 'text-primary' : 'text-white/90'
              )}>
                {format(date, 'd')}
              </div>
              <div className="space-y-1">
                {dayAppts.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => onViewAppointment(apt)}
                    className={cn(
                      'text-xs px-1.5 py-1 rounded cursor-pointer hover:scale-105 transition-transform truncate border-2',
                      STATUS_COLORS[apt.status]
                    )}
                  >
                    {apt.time} {apt.petName}
                  </div>
                ))}
                {dayAppts.length > 3 && (
                  <div className="text-xs text-white/60 px-1 font-medium">
                    +{dayAppts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
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
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-3 flex items-start gap-2">
            <WarningCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
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