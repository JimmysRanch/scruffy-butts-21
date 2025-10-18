import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Calendar, Clock, User, Dog, Package, Bell } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

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
  weight: 'under-20' | '20-40' | '40-60' | 'over-60'
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
  status: 'active' | 'inactive'
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
  createdAt: string
}

const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
]

interface NewAppointmentProps {
  onBack: () => void
}

export function NewAppointment({ onBack }: NewAppointmentProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [services] = useKV<Service[]>('services', [])
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])

  const [formCustomer, setFormCustomer] = useState('')
  const [formPet, setFormPet] = useState('')
  const [formService, setFormService] = useState('')
  const [formStaff, setFormStaff] = useState('unassigned')
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [formTime, setFormTime] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formSendReminder, setFormSendReminder] = useState(true)
  const [formSendConfirmation, setFormSendConfirmation] = useState(true)

  const selectedCustomerData = (customers || []).find(c => c.id === formCustomer)
  const selectedPetData = selectedCustomerData?.pets.find(p => p.id === formPet)
  const selectedServiceData = (services || []).find(s => s.id === formService)
  const selectedStaffData = (staffMembers || []).find(s => s.id === formStaff)

  const calculateEndTime = (startTime: string, duration: number) => {
    const [time, period] = startTime.split(' ')
    const [hours, minutes] = time.split(':').map(Number)
    let hour24 = hours
    if (period === 'PM' && hours !== 12) hour24 += 12
    if (period === 'AM' && hours === 12) hour24 = 0
    
    const startMinutes = hour24 * 60 + minutes
    const endMinutes = startMinutes + duration
    const endHour = Math.floor(endMinutes / 60) % 24
    const endMinute = endMinutes % 60
    
    const displayHour = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour
    const displayPeriod = endHour >= 12 ? 'PM' : 'AM'
    
    return `${displayHour}:${endMinute.toString().padStart(2, '0')} ${displayPeriod}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formCustomer || !formPet || !formService || !formDate || !formTime) {
      toast.error('Please fill in all required fields')
      return
    }

    const customer = selectedCustomerData
    const pet = selectedPetData
    const service = selectedServiceData

    if (!customer || !pet || !service) {
      toast.error('Invalid selection')
      return
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      petName: pet.name,
      petId: pet.id,
      customerFirstName: customer.firstName || customer.name?.split(' ')[0] || '',
      customerLastName: customer.lastName || customer.name?.split(' ')[1] || '',
      customerId: customer.id,
      service: service.name,
      serviceId: service.id,
      staffId: formStaff === 'unassigned' ? undefined : formStaff,
      groomerRequested: formStaff !== 'unassigned' && formStaff !== '',
      date: formDate,
      time: formTime,
      endTime: calculateEndTime(formTime, service.duration),
      duration: service.duration,
      price: service.price,
      status: 'scheduled',
      notes: formNotes,
      reminderSent: formSendReminder,
      confirmationSent: formSendConfirmation,
      createdAt: new Date().toISOString()
    }

    setAppointments((current) => [...(current || []), newAppointment])

    toast.success('Appointment scheduled successfully', {
      description: `${pet.name} - ${service.name} on ${format(new Date(formDate), 'MMM d, yyyy')} at ${formTime}`
    })

    onBack()
  }

  const resetForm = () => {
    setFormCustomer('')
    setFormPet('')
    setFormService('')
    setFormStaff('unassigned')
    setFormDate(format(new Date(), 'yyyy-MM-dd'))
    setFormTime('')
    setFormNotes('')
    setFormSendReminder(true)
    setFormSendConfirmation(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="glass-card"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">New Appointment</h1>
          <p className="text-white/60">Schedule a new grooming appointment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={24} className="text-primary" />
              Customer & Pet Information
            </CardTitle>
            <CardDescription>Select the customer and their pet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customer" className="text-white/90">Customer *</Label>
              <Select value={formCustomer} onValueChange={(value) => {
                setFormCustomer(value)
                setFormPet('')
              }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {(customers || []).length === 0 ? (
                    <SelectItem value="none" disabled>No customers found</SelectItem>
                  ) : (
                    (customers || []).map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName && customer.lastName 
                          ? `${customer.firstName} ${customer.lastName}` 
                          : customer.name || 'Unknown'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomerData && (
              <div>
                <Label htmlFor="pet" className="text-white/90">Pet *</Label>
                <Select value={formPet} onValueChange={setFormPet}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCustomerData.pets.length === 0 ? (
                      <SelectItem value="none" disabled>No pets found for this customer</SelectItem>
                    ) : (
                      selectedCustomerData.pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          <div className="flex items-center gap-2">
                            <Dog size={16} />
                            {pet.name} - {pet.breed}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedPetData && selectedPetData.weight && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Weight Class: {selectedPetData.weight.replace('-', ' - ').replace('under', 'Under').replace('over', 'Over')} lbs
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={24} className="text-primary" />
              Service Details
            </CardTitle>
            <CardDescription>Choose the service and groomer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="service" className="text-white/90">Service *</Label>
              <Select value={formService} onValueChange={setFormService}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {(services || []).length === 0 ? (
                    <SelectItem value="none" disabled>No services found</SelectItem>
                  ) : (
                    (services || []).map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.price.toFixed(2)} ({service.duration} min)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedServiceData && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedServiceData.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="staff" className="text-white/90">Assign Staff</Label>
              <Select value={formStaff} onValueChange={setFormStaff}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {(staffMembers || [])
                    .filter(member => member.status === 'active')
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} - {member.position}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={24} className="text-primary" />
              Date & Time
            </CardTitle>
            <CardDescription>Schedule the appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-white/90">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="time" className="text-white/90">Time *</Label>
                <Select value={formTime} onValueChange={setFormTime}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formTime && selectedServiceData && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-white/90">
                  <span className="font-semibold">Estimated Duration:</span> {selectedServiceData.duration} minutes
                </p>
                <p className="text-sm text-white/90">
                  <span className="font-semibold">End Time:</span> {calculateEndTime(formTime, selectedServiceData.duration)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={24} className="text-primary" />
              Additional Options
            </CardTitle>
            <CardDescription>Notes and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes" className="text-white/90">Special Notes</Label>
              <Textarea
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Any special instructions or notes..."
                className="mt-1.5 min-h-[100px]"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="send-reminder" className="text-white/90">Send Reminder</Label>
                  <p className="text-sm text-muted-foreground">Send appointment reminder to customer</p>
                </div>
                <Switch
                  id="send-reminder"
                  checked={formSendReminder}
                  onCheckedChange={setFormSendReminder}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="send-confirmation" className="text-white/90">Send Confirmation</Label>
                  <p className="text-sm text-muted-foreground">Send confirmation message immediately</p>
                </div>
                <Switch
                  id="send-confirmation"
                  checked={formSendConfirmation}
                  onCheckedChange={setFormSendConfirmation}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="glass-card"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="glass-card"
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            className="sm:min-w-[200px]"
            disabled={!formCustomer || !formPet || !formService || !formDate || !formTime}
          >
            Schedule Appointment
          </Button>
        </div>
      </form>
    </div>
  )
}
