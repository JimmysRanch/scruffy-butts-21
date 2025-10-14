import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Calendar, Clock, User } from '@phosphor-icons/react'
import { format, addDays } from 'date-fns'
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

interface Service {
  id: string
  name: string
  duration: number
  price: number
  description: string
}

export function AppointmentScheduler() {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [customers] = useKV<Customer[]>('customers', [])
  const [services] = useKV<Service[]>('services', [])
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedPet, setSelectedPet] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ]

  const handleCreateAppointment = () => {
    if (!selectedCustomer || !selectedPet || !selectedService || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields')
      return
    }

    const customer = (customers || []).find(c => c.id === selectedCustomer)
    const pet = customer?.pets.find(p => p.id === selectedPet)
    const service = (services || []).find(s => s.id === selectedService)

    if (!customer || !pet || !service) {
      toast.error('Invalid selection')
      return
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      petName: pet.name,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      customerId: customer.id,
      service: service.name,
      date: selectedDate,
      time: selectedTime,
      duration: service.duration,
      price: service.price,
      status: 'scheduled',
      notes
    }

    setAppointments((current) => [...(current || []), newAppointment])
    toast.success('Appointment scheduled successfully!')
    
    setSelectedCustomer('')
    setSelectedPet('')
    setSelectedService('')
    setSelectedDate('')
    setSelectedTime('')
    setNotes('')
    setIsNewAppointmentOpen(false)
  }

  const updateAppointmentStatus = (appointmentId: string, status: 'completed' | 'cancelled') => {
    setAppointments((current) =>
      (current || []).map(apt =>
        apt.id === appointmentId ? { ...apt, status } : apt
      )
    )
    toast.success(`Appointment ${status}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const selectedCustomerData = (customers || []).find(c => c.id === selectedCustomer)
  const selectedServiceData = (services || []).find(s => s.id === selectedService)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your grooming appointments and schedule
          </p>
        </div>
        
        <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus size={18} />
              <span>New Appointment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Create a new grooming appointment for a customer's pet.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(customers || []).map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomerData && (
                <div>
                  <Label htmlFor="pet">Pet</Label>
                  <Select value={selectedPet} onValueChange={setSelectedPet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pet" />
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

              <div>
                <Label htmlFor="service">Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
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

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div>
                <Label htmlFor="time">Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedServiceData && (
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm font-medium">Service Details</p>
                  <p className="text-sm text-muted-foreground">Duration: {selectedServiceData.duration} minutes</p>
                  <p className="text-sm text-muted-foreground">Price: ${selectedServiceData.price}</p>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button onClick={handleCreateAppointment} className="w-full">
                Schedule Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {(appointments || []).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
              <p className="text-muted-foreground mb-4">
                Create your first appointment to get started
              </p>
              <Button onClick={() => setIsNewAppointmentOpen(true)}>
                Schedule First Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          (appointments || [])
            .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
            .map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{appointment.petName}</span>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {appointment.customerFirstName} {appointment.customerLastName} • {appointment.service}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{format(new Date(appointment.date), 'MMM dd, yyyy')}</p>
                      <p className="text-sm text-muted-foreground">{appointment.time}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>{appointment.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>${appointment.price}</span>
                      </div>
                      {appointment.notes && (
                        <div className="max-w-xs">
                          <span className="truncate">{appointment.notes}</span>
                        </div>
                      )}
                    </div>
                    
                    {appointment.status === 'scheduled' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}