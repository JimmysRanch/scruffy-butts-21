import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, Clock, User, Phone, Envelope, CheckCircle, 
  XCircle, Bell, PencilSimple, Trash, Dog, Package, WarningCircle, 
  ArrowClockwise, CreditCard, CaretLeft
} from '@phosphor-icons/react'
import { format, parseISO, isBefore, startOfDay } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AppointmentCheckout } from '@/components/AppointmentCheckout'
import { useState, useEffect } from 'react'

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

interface AppointmentDetailProps {
  appointmentId: string
  onBack: () => void
  onEdit: (appointment: Appointment) => void
}

export function AppointmentDetail({ appointmentId, onBack, onEdit }: AppointmentDetailProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [appointmentId])

  const appointment = (appointments || []).find(apt => apt.id === appointmentId)
  
  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-[1.25rem] overflow-hidden p-8">
          <div className="text-center">
            <p className="text-white/60 mb-4">Appointment not found</p>
            <Button onClick={onBack}>
              <CaretLeft size={18} className="mr-2" />
              Back to Appointments
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const customer = customers?.find(c => c.id === appointment.customerId)
  const staffMember = appointment.staffId 
    ? staffMembers?.find(s => s.id === appointment.staffId)
    : null

  const isPast = isBefore(parseISO(appointment.date), startOfDay(new Date()))

  const updateAppointmentStatus = (status: Appointment['status']) => {
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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      setAppointments((current) => (current || []).filter(apt => apt.id !== appointmentId))
      toast.success('Appointment deleted')
      onBack()
    }
  }

  const handleRebook = () => {
    toast.info('Rebook functionality - redirecting to new appointment')
    onBack()
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
    toast.success('Appointment completed successfully!')
    onBack()
  }

  const getNextAction = () => {
    switch (appointment.status) {
      case 'scheduled':
        return { label: 'Confirm Appointment', action: () => updateAppointmentStatus('confirmed'), icon: CheckCircle }
      case 'confirmed':
        return { label: 'Check In', action: () => updateAppointmentStatus('checked-in'), icon: CheckCircle }
      case 'checked-in':
        return { label: 'Start Grooming', action: () => updateAppointmentStatus('in-progress'), icon: Clock }
      case 'in-progress':
        return { label: 'Mark Ready for Pickup', action: () => updateAppointmentStatus('ready-for-pickup'), icon: Bell }
      case 'ready-for-pickup':
        return { 
          label: 'Checkout & Complete', 
          action: () => {
            console.log('Opening checkout sheet')
            setIsCheckoutOpen(true)
          }, 
          icon: CreditCard 
        }
      default:
        return null
    }
  }

  const nextAction = getNextAction()

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="glass-card rounded-[1.25rem] overflow-hidden p-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-2"
          >
            <CaretLeft size={18} className="mr-2" />
            Back to Appointments
          </Button>
        </div>

        <div className="glass-card rounded-[1.25rem] overflow-hidden p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Dog size={32} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white/90">{appointment.petName}</h1>
                  <p className="text-base text-white/60 mt-1">
                    {appointment.customerFirstName} {appointment.customerLastName}
                  </p>
                </div>
              </div>
              <Badge className={cn('text-sm px-4 py-2', STATUS_COLORS[appointment.status])}>
                {appointment.status.replace('-', ' ')}
              </Badge>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-white/50 font-medium">Date</div>
                        <div className="text-sm font-semibold text-white/90">
                          {format(parseISO(appointment.date), 'EEEE, MMMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Clock size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-white/50 font-medium">Time</div>
                        <div className="text-sm font-semibold text-white/90">
                          {appointment.time}
                          {appointment.endTime && ` - ${appointment.endTime}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Package size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-white/50 font-medium">Service</div>
                        <div className="text-sm font-semibold text-white/90">{appointment.service}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CreditCard size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-white/50 font-medium">Price</div>
                        <div className="text-xl font-bold text-primary">${appointment.price}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {customer && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <User size={18} className="text-primary" />
                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">Customer Contact</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-white/50" />
                      <span className="text-sm text-white/80">{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Envelope size={18} className="text-white/50" />
                      <span className="text-sm text-white/80 truncate">{customer.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {staffMember && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                      {staffMember.firstName[0]}{staffMember.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-white/90">
                        {staffMember.firstName} {staffMember.lastName}
                        {appointment.groomerRequested && (
                          <span className="text-red-500 font-bold ml-2">R</span>
                        )}
                      </div>
                      <div className="text-sm text-white/60">{staffMember.position}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {appointment.notes && (
              <Card className="border-dashed">
                <CardContent className="p-5">
                  <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
                    Notes
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{appointment.notes}</p>
                </CardContent>
              </Card>
            )}

            {isPast && appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no-show' && (
              <Card className="border-amber-500/50 bg-amber-500/10">
                <CardContent className="p-4 flex items-start gap-3">
                  <WarningCircle size={22} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-200">
                    <div className="font-semibold mb-1">Past appointment</div>
                    <div className="text-amber-300/80">Update status to complete or cancel</div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {nextAction && appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no-show' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  Next Step
                </div>
                <Button 
                  onClick={nextAction.action} 
                  className="w-full" 
                  size="lg"
                >
                  <nextAction.icon size={20} className="mr-2" />
                  {nextAction.label}
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-xs font-bold text-white/50 uppercase tracking-wider">
                More Actions
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => onEdit(appointment)} size="lg">
                  <PencilSimple size={18} className="mr-2" />
                  Edit Appointment
                </Button>
                <Button variant="outline" onClick={handleRebook} size="lg">
                  <ArrowClockwise size={18} className="mr-2" />
                  Rebook Appointment
                </Button>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDelete} 
                className="w-full text-destructive hover:bg-destructive/10"
                size="lg"
              >
                <Trash size={18} className="mr-2" />
                Delete Appointment
              </Button>
            </div>

            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no-show' && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="text-xs font-bold text-white/50 uppercase tracking-wider">
                    Update Status
                  </div>
                  <Select value={appointment.status} onValueChange={(value) => updateAppointmentStatus(value as Appointment['status'])}>
                    <SelectTrigger className="h-11">
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
        </div>
      </div>

      <AppointmentCheckout
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        appointment={appointment}
        customer={customer || null}
        staffMember={staffMember}
        onComplete={handleCheckoutComplete}
        onBack={() => setIsCheckoutOpen(false)}
      />
    </>
  )
}
