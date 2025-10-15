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
  Bell, BellSlash, Copy, Check, WarningCircle, ArrowClockwise
} from '@phosphor-icons/react'
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
  date: string
  time: string
  endTime?: string
  duration: number
  price: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  reminderSent?: boolean
  confirmationSent?: boolean
  checkInTime?: string
  checkOutTime?: string
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
type FilterStatus = 'all' | 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  'checked-in': 'bg-purple-100 text-purple-800 border-purple-300',
  'in-progress': 'bg-orange-100 text-orange-800 border-orange-300',
  completed: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-orange-100 text-orange-800 border-orange-300',
  'no-show': 'bg-red-100 text-red-800 border-red-300'
}

const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
]

export function AppointmentScheduler() {
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

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveAppointmentId(null)
    }

    if (activeAppointmentId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [activeAppointmentId])

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
          if (status === 'completed' && !apt.checkOutTime) {
            updates.checkOutTime = new Date().toISOString()
          }
          return { ...apt, ...updates }
        }
        return apt
      })
    )
    toast.success(`Appointment ${status}`)
  }

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailOpen(true)
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

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-foreground text-2xl">
            Appointments
          </h1>
          <p className="text-muted-foreground text-base">
            {upcomingCount} upcoming • {todayCount} today
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 lg:flex-initial">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full lg:w-64"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'bg-accent')}
          >
            <Funnel size={18} />
          </Button>

          <Dialog open={isNewAppointmentOpen} onOpenChange={(open) => {
            setIsNewAppointmentOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={18} />
                <span>New Appointment</span>
              </Button>
            </DialogTrigger>
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
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Status</Label>
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Staff Member</Label>
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
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
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
            <Button variant="outline" onClick={navigateToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <CaretRight size={18} />
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-lg">{getDateRangeLabel()}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">{viewMode === 'day' && (
            <DayView
              date={currentDate}
              appointments={getAppointmentsForDate(currentDate)}
              onViewAppointment={handleViewAppointment}
              getStaffColor={getStaffColor}
            />
          )}

          {viewMode === 'week' && (
            <WeekView
              dates={getWeekDates()}
              getAppointmentsForDate={getAppointmentsForDate}
              onViewAppointment={handleViewAppointment}
              getStaffColor={getStaffColor}
            />
          )}

          {viewMode === 'month' && (
            <MonthView
              dates={getMonthDates()}
              currentDate={currentDate}
              getAppointmentsForDate={getAppointmentsForDate}
              onDateClick={(date) => {
                setSelectedDate(date)
                setCurrentDate(date)
                setViewMode('day')
              }}
            />
          )}

          {viewMode === 'list' && (
            <ListView
              appointments={filteredAppointments}
              onViewAppointment={handleViewAppointment}
              onEditAppointment={handleEditAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onDuplicateAppointment={handleDuplicateAppointment}
              onRebookAppointment={handleRebookAppointment}
              onStatusChange={updateAppointmentStatus}
              getStaffColor={getStaffColor}
              staffMembers={staffMembers || []}
              activeAppointmentId={activeAppointmentId}
              setActiveAppointmentId={setActiveAppointmentId}
            />
          )}
        </CardContent>
      </Card>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6">
          {selectedAppointment && (
            <AppointmentDetail
              appointment={selectedAppointment}
              customer={(customers || []).find(c => c.id === selectedAppointment.customerId)}
              staffMember={(staffMembers || []).find(s => s.id === selectedAppointment.staffId)}
              onStatusChange={(status) => {
                updateAppointmentStatus(selectedAppointment.id, status)
                setSelectedAppointment({ ...selectedAppointment, status })
              }}
              onEdit={() => {
                setIsDetailOpen(false)
                handleEditAppointment(selectedAppointment)
              }}
              onDelete={() => handleDeleteAppointment(selectedAppointment.id)}
              onDuplicate={() => {
                handleDuplicateAppointment(selectedAppointment)
                setIsDetailOpen(false)
              }}
              onRebook={() => {
                handleRebookAppointment(selectedAppointment)
                setIsDetailOpen(false)
              }}
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DayView({ 
  date, 
  appointments, 
  onViewAppointment,
  getStaffColor 
}: { 
  date: Date
  appointments: Appointment[]
  onViewAppointment: (apt: Appointment) => void
  getStaffColor: (staffId?: string) => string
}) {
  return (
    <div className="space-y-2">
      {appointments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-base">No appointments scheduled for this day</p>
        </div>
      ) : (
        appointments.map((apt) => (
          <AppointmentCard
            key={apt.id}
            appointment={apt}
            onClick={() => onViewAppointment(apt)}
            getStaffColor={getStaffColor}
          />
        ))
      )}
    </div>
  )
}

function WeekView({ 
  dates, 
  getAppointmentsForDate, 
  onViewAppointment,
  getStaffColor 
}: { 
  dates: Date[]
  getAppointmentsForDate: (date: Date) => Appointment[]
  onViewAppointment: (apt: Appointment) => void
  getStaffColor: (staffId?: string) => string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-1.5">
      {dates.map((date) => {
        const dayAppointments = getAppointmentsForDate(date)
        const isCurrentDay = isToday(date)
        
        return (
          <div key={date.toISOString()} className={cn(
            'border rounded-lg p-1.5 min-h-[100px]',
            isCurrentDay && 'border-primary bg-primary/5'
          )}>
            <div className="font-medium text-xs mb-1.5">
              <div className={cn(isCurrentDay && 'text-primary')}>{format(date, 'EEE')}</div>
              <div className={cn('text-xl', isCurrentDay && 'text-primary')}>{format(date, 'd')}</div>
            </div>
            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => onViewAppointment(apt)}
                  className={cn(
                    'text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity border',
                    STATUS_COLORS[apt.status]
                  )}
                >
                  <div className="font-medium truncate">{apt.petName}</div>
                  <div className="text-[10px] opacity-75">{apt.time}</div>
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-[10px] text-muted-foreground text-center py-0.5">
                  +{dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthView({ 
  dates, 
  currentDate, 
  getAppointmentsForDate, 
  onDateClick 
}: { 
  dates: Date[]
  currentDate: Date
  getAppointmentsForDate: (date: Date) => Appointment[]
  onDateClick: (date: Date) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1.5">
          {day}
        </div>
      ))}
      {dates.map((date) => {
        const dayAppointments = getAppointmentsForDate(date)
        const isCurrentDay = isToday(date)
        const isCurrentMonth = date.getMonth() === currentDate.getMonth()
        
        return (
          <div
            key={date.toISOString()}
            onClick={() => onDateClick(date)}
            className={cn(
              'border rounded p-1.5 min-h-[65px] cursor-pointer hover:bg-accent transition-colors',
              !isCurrentMonth && 'opacity-40',
              isCurrentDay && 'border-primary bg-primary/5'
            )}
          >
            <div className={cn(
              'text-xs font-medium mb-1',
              isCurrentDay && 'text-primary'
            )}>
              {format(date, 'd')}
            </div>
            {dayAppointments.length > 0 && (
              <div className="space-y-0.5">
                <div className="w-full h-1 rounded bg-blue-500" />
                <div className="text-[10px] text-muted-foreground">
                  {dayAppointments.length} apt{dayAppointments.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        )
      })}
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
  staffMembers,
  activeAppointmentId,
  setActiveAppointmentId
}: { 
  appointments: Appointment[]
  onViewAppointment: (apt: Appointment) => void
  onEditAppointment: (apt: Appointment) => void
  onDeleteAppointment: (id: string) => void
  onDuplicateAppointment: (apt: Appointment) => void
  onRebookAppointment: (apt: Appointment) => void
  onStatusChange: (id: string, status: Appointment['status']) => void
  getStaffColor: (staffId?: string) => string
  staffMembers: StaffMember[]
  activeAppointmentId: string | null
  setActiveAppointmentId: (id: string | null) => void
}) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <List size={48} className="mx-auto mb-2 opacity-50" />
        <p className="text-base">No appointments found</p>
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
    <ScrollArea className="h-[520px]">
      <div className="space-y-4">
        {sortedDates.map((date) => {
          const dateObj = parseISO(date)
          const appointmentsForDate = groupedByDate[date]
          const isCurrentDay = isToday(dateObj)
          const isPastDay = isBefore(dateObj, startOfDay(new Date())) && !isCurrentDay
          
          return (
            <div key={date} className="space-y-2">
              <div className={cn(
                'sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-1.5 border-b-2',
                isCurrentDay && 'border-primary',
                !isCurrentDay && 'border-border'
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={cn(
                      'font-bold text-lg',
                      isCurrentDay && 'text-primary'
                    )}>
                      {isCurrentDay 
                        ? 'Today' 
                        : format(dateObj, 'EEEE, MMMM d, yyyy')
                      }
                    </h3>
                    {!isCurrentDay && (
                      <p className="text-base text-muted-foreground">
                        {format(dateObj, 'EEEE')}
                      </p>
                    )}
                  </div>
                  <Badge variant={isCurrentDay ? 'default' : 'secondary'} className="text-sm">
                    {appointmentsForDate.length} appointment{appointmentsForDate.length !== 1 ? 's' : ''}
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
                    onDelete={() => onDeleteAppointment(apt.id)}
                    onDuplicate={() => onDuplicateAppointment(apt)}
                    onRebook={() => onRebookAppointment(apt)}
                    onStatusChange={(status) => onStatusChange(apt.id, status)}
                    getStaffColor={getStaffColor}
                    staffMembers={staffMembers}
                    showActions
                    isActive={activeAppointmentId === apt.id}
                    setActive={() => setActiveAppointmentId(apt.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
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
  showActions = false,
  isActive = false,
  setActive
}: { 
  appointment: Appointment
  onClick: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onRebook?: () => void
  onStatusChange?: (status: Appointment['status']) => void
  getStaffColor: (staffId?: string) => string
  staffMembers?: StaffMember[]
  showActions?: boolean
  isActive?: boolean
  setActive?: () => void
}) {
  const [tapCount, setTapCount] = useState(0)
  const staffMemberData = staffMembers?.find(s => s.id === appointment.staffId)
  const isPast = isBefore(parseISO(appointment.date), startOfDay(new Date()))

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isActive && setActive) {
      setActive()
    } else if (isActive) {
      onClick()
    }
  }

  return (
    <div
      className={cn(
        'border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all liquid-ripple liquid-glow',
        STATUS_COLORS[appointment.status],
        isPast && 'opacity-60',
        isActive && 'shadow-md ring-2 ring-primary/20'
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Dog size={18} className="flex-shrink-0 text-foreground/70" />
            <h3 className="font-semibold text-base">
              {appointment.petName}
              {staffMemberData && (
                <span className="font-normal text-muted-foreground">
                  {' '}with {staffMemberData.firstName} {staffMemberData.lastName}
                </span>
              )}
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
            <User size={16} />
            <span>{appointment.customerFirstName} {appointment.customerLastName}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Package size={16} />
              <span>{appointment.service}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>{format(parseISO(appointment.date), 'MMM d')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{appointment.time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <Badge variant="outline" className="flex-shrink-0 text-sm">
            {appointment.status}
          </Badge>
          <div className="text-lg font-bold">${appointment.price}</div>
          {appointment.staffId && (
            <div className={cn('w-3 h-3 rounded-full', getStaffColor(appointment.staffId))} />
          )}
        </div>
      </div>

      {showActions && isActive && onEdit && onStatusChange && (
        <div className="mt-3 pt-3 border-t flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
          {appointment.status === 'scheduled' && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('confirmed')} className="text-sm">
              <CheckCircle size={16} className="mr-1.5" />
              Confirm
            </Button>
          )}
          {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('checked-in')} className="text-sm">
              <CheckCircle size={16} className="mr-1.5" />
              Check In
            </Button>
          )}
          {appointment.status === 'checked-in' && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('in-progress')} className="text-sm">
              <Clock size={16} className="mr-1.5" />
              Start
            </Button>
          )}
          {(appointment.status === 'in-progress' || appointment.status === 'checked-in') && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('completed')} className="text-sm">
              <Check size={16} className="mr-1.5" />
              Complete
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onEdit} className="text-sm">
            <PencilSimple size={16} className="mr-1.5" />
            Edit
          </Button>
          {onRebook && (
            <Button size="sm" variant="outline" onClick={onRebook} className="text-sm">
              <ArrowClockwise size={16} className="mr-1.5" />
              Rebook
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function AppointmentDetail({ 
  appointment, 
  customer, 
  staffMember,
  onStatusChange, 
  onEdit, 
  onDelete,
  onDuplicate,
  onRebook,
  onClose 
}: { 
  appointment: Appointment
  customer?: Customer
  staffMember?: StaffMember
  onStatusChange: (status: Appointment['status']) => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onRebook: () => void
  onClose: () => void
}) {
  const isPast = isBefore(parseISO(appointment.date), startOfDay(new Date()))

  return (
    <div className="space-y-6 py-2">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <Dog size={28} className="text-primary" weight="duotone" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{appointment.petName}</h2>
            <p className="text-muted-foreground">{appointment.customerFirstName} {appointment.customerLastName}</p>
          </div>
        </div>
        <Badge className={cn('text-sm px-3 py-1', STATUS_COLORS[appointment.status])}>
          {appointment.status.replace('-', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-2">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar size={16} weight="duotone" />
              <span className="text-xs font-medium uppercase tracking-wide">Date</span>
            </div>
            <div className="font-semibold">{format(parseISO(appointment.date), 'MMM d, yyyy')}</div>
            <div className="text-xs text-muted-foreground">{format(parseISO(appointment.date), 'EEEE')}</div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock size={16} weight="duotone" />
              <span className="text-xs font-medium uppercase tracking-wide">Time</span>
            </div>
            <div className="font-semibold">{appointment.time}</div>
            <div className="text-xs text-muted-foreground">{appointment.duration} minutes</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package size={16} weight="duotone" />
                <span className="text-xs font-medium uppercase tracking-wide">Service</span>
              </div>
              <div className="font-semibold text-lg">{appointment.service}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">${appointment.price}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {customer && (
        <Card className="border-2">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <User size={16} weight="duotone" />
              <span className="text-xs font-medium uppercase tracking-wide">Customer Info</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                <Phone size={18} className="text-muted-foreground" />
                <span className="text-sm">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                <Envelope size={18} className="text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {staffMember && (
        <Card className="border-2">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <UserCircle size={16} weight="duotone" />
              <span className="text-xs font-medium uppercase tracking-wide">Assigned Groomer</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                {staffMember.firstName[0]}{staffMember.lastName[0]}
              </div>
              <div>
                <div className="font-semibold">{staffMember.firstName} {staffMember.lastName}</div>
                <div className="text-sm text-muted-foreground">{staffMember.position}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {appointment.notes && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <span className="text-xs font-medium uppercase tracking-wide">Notes</span>
            </div>
            <p className="text-sm leading-relaxed">{appointment.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-2">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Bell size={16} weight="duotone" />
            <span className="text-xs font-medium uppercase tracking-wide">Notifications</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={cn(
              'p-3 rounded-lg border-2 transition-colors',
              appointment.reminderSent ? 'bg-green-50 border-green-200' : 'bg-muted border-border'
            )}>
              <div className="flex items-center gap-2 mb-1">
                {appointment.reminderSent ? (
                  <Check size={16} className="text-green-600" weight="bold" />
                ) : (
                  <BellSlash size={16} className="text-muted-foreground" />
                )}
                <span className="text-xs font-medium">Reminder</span>
              </div>
              <div className={cn('text-xs', appointment.reminderSent ? 'text-green-700' : 'text-muted-foreground')}>
                {appointment.reminderSent ? 'Sent' : 'Not sent'}
              </div>
            </div>
            <div className={cn(
              'p-3 rounded-lg border-2 transition-colors',
              appointment.confirmationSent ? 'bg-green-50 border-green-200' : 'bg-muted border-border'
            )}>
              <div className="flex items-center gap-2 mb-1">
                {appointment.confirmationSent ? (
                  <Check size={16} className="text-green-600" weight="bold" />
                ) : (
                  <XCircle size={16} className="text-muted-foreground" />
                )}
                <span className="text-xs font-medium">Confirmation</span>
              </div>
              <div className={cn('text-xs', appointment.confirmationSent ? 'text-green-700' : 'text-muted-foreground')}>
                {appointment.confirmationSent ? 'Sent' : 'Not sent'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(appointment.checkInTime || appointment.checkOutTime) && (
        <Card className="border-2">
          <CardContent className="p-4 space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Timeline</div>
            {appointment.checkInTime && (
              <div className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Checked In</span>
                <span className="font-semibold">{format(parseISO(appointment.checkInTime), 'h:mm a')}</span>
              </div>
            )}
            {appointment.checkOutTime && (
              <div className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Checked Out</span>
                <span className="font-semibold">{format(parseISO(appointment.checkOutTime), 'h:mm a')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isPast && appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no-show' && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <WarningCircle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" weight="duotone" />
            <div className="text-sm text-amber-900">
              <div className="font-semibold mb-1">Past Appointment</div>
              <div>Update the status to completed, cancelled, or no-show.</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      <div className="space-y-3">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Actions</div>
        <div className="space-y-2">
          {appointment.status === 'scheduled' && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('confirmed')} className="w-full">
              <CheckCircle size={16} className="mr-2" weight="duotone" />
              Confirm
            </Button>
          )}
          {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('checked-in')} className="w-full">
              <CheckCircle size={16} className="mr-2" weight="duotone" />
              Check In
            </Button>
          )}
          {appointment.status === 'checked-in' && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('in-progress')} className="w-full">
              <Clock size={16} className="mr-2" weight="duotone" />
              Start
            </Button>
          )}
          {(appointment.status === 'in-progress' || appointment.status === 'checked-in' || appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('completed')} className="w-full">
              <Check size={16} className="mr-2" weight="bold" />
              Complete
            </Button>
          )}
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('cancelled')} className="w-full">
              <XCircle size={16} className="mr-2" weight="duotone" />
              Cancel
            </Button>
          )}
          {appointment.status !== 'no-show' && appointment.status !== 'completed' && isPast && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('no-show')} className="w-full">
              <ClockCounterClockwise size={16} className="mr-2" weight="duotone" />
              Mark No Show
            </Button>
          )}
        </div>
      </div>

      <Card className="border-2">
        <CardContent className="p-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Change Status</div>
          <Select value={appointment.status} onValueChange={(value) => onStatusChange(value as Appointment['status'])}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <div className="space-y-2">
        <Button variant="outline" size="lg" onClick={onEdit} className="w-full justify-start">
          <PencilSimple size={18} className="mr-3" weight="duotone" />
          Edit Appointment
        </Button>
        <Button variant="outline" size="lg" onClick={onRebook} className="w-full justify-start">
          <ArrowClockwise size={18} className="mr-3" weight="duotone" />
          Rebook
        </Button>
        <Button variant="destructive" size="lg" onClick={onDelete} className="w-full justify-start">
          <Trash size={18} className="mr-3" weight="duotone" />
          Delete
        </Button>
      </div>
    </div>
  )
}