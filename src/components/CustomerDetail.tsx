import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Envelope, 
  Heart, 
  Plus, 
  Pencil, 
  Calendar,
  MapPin,
  NotePencil,
  Dog,
  Scissors,
  Star,
  Clock,
  CreditCard,
  ChatCircleDots
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { QuickCheckout } from './QuickCheckout'

interface GroomingVisit {
  id: string
  appointmentId: string
  date: string
  service: string
  groomer: string
  price: number
  duration: number
  notes?: string
  rating?: number
}

interface Pet {
  id: string
  name: string
  breed: string
  size?: 'small' | 'medium' | 'large'
  notes?: string
  avatar?: string
  visitCount?: number
  rating?: number
  groomingHistory?: GroomingVisit[]
  petId?: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  pets: Pet[]
  createdAt: string
  address?: string
  city?: string
  state?: string
  zip?: string
  notes?: string
  name?: string
}

interface Appointment {
  id: string
  customerId: string
  petName: string
  service: string
  staffId?: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  price: number
  notes?: string
  rating?: number
  petId?: string
}

interface Transaction {
  id: string
  customerId: string
  total: number
  status: 'completed' | 'pending' | 'refunded'
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  position: string
}

interface CustomerDetailProps {
  customerId: string
  onBack: () => void
  onEditPet?: (petId: string) => void
  onAddPet?: () => void
}

export function CustomerDetail({ customerId, onBack, onEditPet, onAddPet }: CustomerDetailProps) {
  const [customers, setCustomers] = useKV<Customer[]>('customers', [])
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [transactions] = useKV<Transaction[]>('transactions', [])
  const [staff] = useKV<Staff[]>('staff', [])
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [selectedPetForHistory, setSelectedPetForHistory] = useState<string | null>(null)
  const [showGroomingHistory, setShowGroomingHistory] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  
  const customer = (customers || []).find(c => c.id === customerId)
  
  const [customerForm, setCustomerForm] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    city: customer?.city || '',
    state: customer?.state || 'Texas',
    zip: customer?.zip || '',
    notes: customer?.notes || ''
  })
  
  useEffect(() => {
    if (customers && customers.length > 0) {
      const needsNameMigration = customers.some(c => c.name && (!c.firstName || !c.lastName))
      const needsPetSizeMigration = customers.some(c => c.pets && c.pets.some(p => !p.size))
      
      if (needsNameMigration || needsPetSizeMigration) {
        setCustomers((current) =>
          (current || []).map(customer => {
            let updatedCustomer = { ...customer }
            
            if (customer.name && typeof customer.name === 'string' && (!customer.firstName || !customer.lastName)) {
              const nameParts = customer.name.split(' ')
              const firstName = nameParts[0] || ''
              const lastName = nameParts.slice(1).join(' ') || ''
              const { name, ...rest } = customer
              updatedCustomer = {
                ...rest,
                firstName,
                lastName
              }
            }
            
            if (customer.pets && customer.pets.some(p => !p.size)) {
              updatedCustomer.pets = customer.pets.map(pet => ({
                ...pet,
                size: pet.size || 'medium'
              }))
            }
            
            return updatedCustomer
          })
        )
      }
    }
  }, [customers, setCustomers])
  
  const getGroomingHistoryForPet = (petId: string): GroomingVisit[] => {
    const petAppointments = (appointments || []).filter(
      apt => apt.customerId === customerId && 
             (apt.petId === petId || apt.petName === customer?.pets.find(p => p.id === petId)?.name) &&
             apt.status === 'completed'
    )
    
    return petAppointments
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
      .map(apt => {
        const groomer = (staff || []).find(s => s.id === apt.staffId)
        return {
          id: apt.id,
          appointmentId: apt.id,
          date: apt.date,
          service: apt.service,
          groomer: groomer ? `${groomer.firstName} ${groomer.lastName}` : 'Unknown',
          price: apt.price,
          duration: apt.duration,
          notes: apt.notes,
          rating: apt.rating
        }
      })
  }
  
  const getPetVisitCount = (petId: string): number => {
    return getGroomingHistoryForPet(petId).length
  }
  
  const getPetAverageRating = (petId: string): number | undefined => {
    const history = getGroomingHistoryForPet(petId)
    const ratingsOnly = history.filter(v => v.rating !== undefined).map(v => v.rating!)
    if (ratingsOnly.length === 0) return undefined
    return ratingsOnly.reduce((sum, r) => sum + r, 0) / ratingsOnly.length
  }
  
  const getLastVisitDate = (petId: string): string | null => {
    const history = getGroomingHistoryForPet(petId)
    if (history.length === 0) return null
    return history[0].date
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-3xl font-bold text-white/90">Customer Not Found</h1>
        </div>
        <div className="glass-card rounded-[1.25rem] overflow-hidden">
          <div className="text-center py-12 px-6">
            <p className="text-white/60">The requested customer could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleUpdateCustomer = () => {
    if (!customerForm.firstName || !customerForm.lastName || !customerForm.email || !customerForm.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    setCustomers((current) =>
      (current || []).map(c =>
        c.id === customerId
          ? {
              ...c,
              firstName: customerForm.firstName,
              lastName: customerForm.lastName,
              email: customerForm.email,
              phone: customerForm.phone,
              address: customerForm.address,
              notes: customerForm.notes
            }
          : c
      )
    )

    toast.success('Customer updated successfully!')
    setIsEditCustomerOpen(false)
  }

  const handleEditPet = (pet: Pet) => {
    if (onEditPet) {
      onEditPet(pet.id)
    }
  }

  const getSizeColor = (size?: 'small' | 'medium' | 'large'): 'default' | 'secondary' | 'outline' => {
    switch (size) {
      case 'small':
        return 'secondary'
      case 'medium':
        return 'default'
      case 'large':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getSizeLabel = (size?: 'small' | 'medium' | 'large'): string => {
    switch (size) {
      case 'small':
        return 'Small'
      case 'medium':
        return 'Medium'
      case 'large':
        return 'Large'
      default:
        return 'Medium'
    }
  }

  const customerAppointments = (appointments || []).filter(apt => apt.customerId === customerId)
  
  const appointmentCount = customerAppointments.length
  
  const customerTransactions = (transactions || []).filter(
    txn => txn.customerId === customerId && txn.status === 'completed'
  )
  
  const lifetimeValue = customerTransactions.reduce((sum, txn) => sum + txn.total, 0)
  
  const completedAppointments = customerAppointments.filter(apt => apt.status === 'completed')
  const totalSpendFromAppointments = completedAppointments.reduce((sum, apt) => sum + apt.price, 0)
  const averagePerVisit = completedAppointments.length > 0 ? totalSpendFromAppointments / completedAppointments.length : 0
  
  const lastVisit = completedAppointments.length > 0
    ? completedAppointments.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())[0]
    : null
  
  const sortedVisits = completedAppointments.sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
  let averageWeeksBetweenVisits: number | null = null
  if (sortedVisits.length >= 2) {
    const intervals: number[] = []
    for (let i = 1; i < sortedVisits.length; i++) {
      const prevDate = new Date(sortedVisits[i - 1].date)
      const currDate = new Date(sortedVisits[i].date)
      const diffMs = currDate.getTime() - prevDate.getTime()
      const diffWeeks = diffMs / (1000 * 60 * 60 * 24 * 7)
      intervals.push(diffWeeks)
    }
    averageWeeksBetweenVisits = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
  }
  
  const recommendedCadence = averageWeeksBetweenVisits ? Math.round(averageWeeksBetweenVisits) : 6
  
  const upcomingAppointments = customerAppointments.filter(
    apt => apt.status === 'scheduled' || apt.status === 'confirmed'
  ).sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
  
  const nextAppointment = upcomingAppointments[0]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="glass-card rounded-[1.25rem] p-4 md:p-6 shadow-lg @container overflow-hidden">
        <div className="flex flex-col @[800px]:flex-row items-start justify-between gap-4">
          <div className="flex items-start space-x-3 @[600px]:space-x-6 flex-1 min-w-0 w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="-ml-2 mt-1 shrink-0"
            >
              <ArrowLeft size={20} />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col @[600px]:flex-row @[600px]:items-start justify-between gap-4 @[600px]:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col @[400px]:flex-row @[400px]:items-center space-y-2 @[400px]:space-y-0 @[400px]:space-x-3 mb-2">
                    <h1 className="text-2xl @[600px]:text-4xl font-bold text-white/90 truncate">
                      {customer.firstName} {customer.lastName}
                    </h1>
                    <Badge className="bg-accent/25 text-accent-foreground border-accent/40 ring-1 ring-accent/30 shadow-[0_0_12px_oklch(0.65_0.22_310/0.3)] self-start @[400px]:self-center whitespace-nowrap">
                      <Star size={12} className="mr-1" weight="fill" />
                      VIP Client
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-white/60">
                    <span className="flex items-center space-x-1 min-w-0 overflow-hidden">
                      <Calendar size={14} className="shrink-0" weight="duotone" />
                      <span className="truncate font-medium">Client since {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 text-sm text-white/60 min-w-0 @[600px]:min-w-[200px]">
                  <span className="flex items-center space-x-2 min-w-0">
                    <Phone size={14} className="shrink-0" weight="duotone" />
                    <span className="truncate font-medium">{customer.phone}</span>
                  </span>
                  <span className="flex items-center space-x-2 min-w-0">
                    <Envelope size={14} className="shrink-0" weight="duotone" />
                    <span className="truncate font-medium">{customer.email}</span>
                  </span>
                  {customer.address && (
                    <span className="flex items-center space-x-2 min-w-0">
                      <MapPin size={14} className="shrink-0" weight="duotone" />
                      <span className="truncate font-medium">{customer.address}</span>
                    </span>
                  )}
                </div>
              </div>

              {customer.notes && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 text-sm text-white/60 min-w-0">
                    <NotePencil size={14} className="shrink-0" weight="duotone" />
                    <span className="truncate font-medium">{customer.notes}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <Dialog open={isEditCustomerOpen} onOpenChange={(open) => {
            if (open) {
              setCustomerForm({
                firstName: customer.firstName || '',
                lastName: customer.lastName || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || '',
                city: customer.city || '',
                state: customer.state || 'Texas',
                zip: customer.zip || '',
                notes: customer.notes || ''
              })
            }
            setIsEditCustomerOpen(open)
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="shrink-0 self-start @[800px]:self-auto">
                <Pencil size={16} className="mr-2" />
                Edit Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Client Information</DialogTitle>
                <DialogDescription>
                  Update the client's contact information and details.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-customer-first-name">First Name</Label>
                    <Input
                      id="edit-customer-first-name"
                      value={customerForm.firstName}
                      onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-customer-last-name">Last Name</Label>
                    <Input
                      id="edit-customer-last-name"
                      value={customerForm.lastName}
                      onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-customer-email">Email</Label>
                  <Input
                    id="edit-customer-email"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-customer-phone">Phone</Label>
                  <Input
                    id="edit-customer-phone"
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-customer-address">Address</Label>
                  <Input
                    id="edit-customer-address"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    placeholder="Enter address (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-customer-notes">Notes</Label>
                  <Textarea
                    id="edit-customer-notes"
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                    placeholder="Any special notes about this client..."
                  />
                </div>

                <Button onClick={handleUpdateCustomer} className="w-full">
                  Update Client
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 [grid-auto-rows:minmax(8rem,auto)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-widget glass-widget-lavender rounded-[1.25rem] p-5 shadow-lg @container min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]"
        >
          <div className="mb-3">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Lifetime Spend</p>
          </div>
          <div className="flex items-end justify-between min-w-0">
            <div className="min-w-0 overflow-hidden">
              <div className="flex items-baseline space-x-2 mb-1">
                <CreditCard size={20} className="text-accent shrink-0 drop-shadow-[0_0_8px_oklch(0.65_0.22_310)]" weight="fill" />
                <p className="text-3xl font-bold text-white/95 truncate">${lifetimeValue.toFixed(2)}</p>
              </div>
              <p className="text-xs text-white/60 truncate font-medium">
                Total revenue from client
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-widget glass-widget-turquoise rounded-[1.25rem] p-5 shadow-lg @container min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]"
        >
          <div className="mb-3">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Total Visits</p>
          </div>
          <div className="flex items-end justify-between min-w-0">
            <div className="min-w-0 overflow-hidden">
              <div className="flex items-baseline space-x-2 mb-1">
                <Scissors size={20} className="text-primary shrink-0 drop-shadow-[0_0_8px_oklch(0.60_0.20_280)]" weight="fill" />
                <p className="text-3xl font-bold text-white/95">{completedAppointments.length}</p>
              </div>
              <p className="text-xs text-white/60 truncate font-medium">
                Completed appointments
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-widget glass-widget-rose rounded-[1.25rem] p-5 shadow-lg @container min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]"
        >
          <div className="mb-3">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Average Per Visit</p>
          </div>
          <div className="flex items-end justify-between min-w-0">
            <div className="min-w-0 overflow-hidden">
              <div className="flex items-baseline space-x-2 mb-1">
                <CreditCard size={20} className="text-accent shrink-0 drop-shadow-[0_0_8px_oklch(0.65_0.22_310)]" weight="fill" />
                <p className="text-3xl font-bold text-white/95 truncate">${averagePerVisit.toFixed(2)}</p>
              </div>
              <p className="text-xs text-white/60 truncate font-medium">
                Average transaction value
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-widget glass-widget-gold rounded-[1.25rem] p-5 shadow-lg @container min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.02]"
        >
          <div className="mb-3">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Recommended Cadence</p>
          </div>
          <div className="flex items-end justify-between min-w-0">
            <div className="min-w-0 overflow-hidden">
              <div className="flex items-baseline space-x-2 mb-1">
                <Calendar size={20} className="text-primary shrink-0 drop-shadow-[0_0_8px_oklch(0.60_0.20_280)]" weight="fill" />
                <p className="text-3xl font-bold text-white/95">{recommendedCadence}</p>
                <p className="text-base font-medium text-white/60 whitespace-nowrap">week{recommendedCadence !== 1 ? 's' : ''}</p>
              </div>
              <p className="text-xs text-white/60 truncate font-medium">
                {averageWeeksBetweenVisits 
                  ? `Actual avg: ${averageWeeksBetweenVisits.toFixed(1)} weeks`
                  : 'Based on industry standards'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {lastVisit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-[1.25rem] p-6 shadow-lg @container min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.01]"
        >
          <div className="flex flex-col @[600px]:flex-row @[600px]:items-center justify-between gap-4 min-w-0">
            <div className="min-w-0 overflow-hidden">
              <h3 className="text-lg font-bold text-white/90 mb-2">Last Visit</h3>
              <div className="flex flex-col @[400px]:flex-row @[400px]:items-center @[400px]:space-x-4 gap-2 @[400px]:gap-0 text-sm">
                <span className="flex items-center space-x-2">
                  <Calendar size={16} className="text-white/60 shrink-0" weight="duotone" />
                  <span className="text-white/90 truncate font-medium">
                    {new Date(lastVisit.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </span>
                <span className="flex items-center space-x-2">
                  <Scissors size={16} className="text-white/60 shrink-0" weight="duotone" />
                  <span className="text-white/90 truncate font-medium">{lastVisit.service}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <CreditCard size={16} className="text-white/60 shrink-0" weight="duotone" />
                  <span className="text-white/90 font-medium">${lastVisit.price?.toFixed(2) || '0.00'}</span>
                </span>
              </div>
            </div>
            {nextAppointment && (
              <div className="text-left @[600px]:text-right shrink-0">
                <p className="text-xs text-white/60 mb-1 font-medium">Next Appointment</p>
                <p className="text-lg font-bold text-primary">
                  {new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-white/60 truncate font-medium">
                  {nextAppointment.time} - {nextAppointment.service}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        <div className="lg:col-span-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="min-w-0"
          >
            <div className="glass-card rounded-[1.25rem] p-6 shadow-lg h-full min-w-0 overflow-hidden transition-all duration-500 hover:scale-[1.01]">
              <div className="flex items-center justify-between mb-6 min-w-0">
                <h2 className="text-2xl font-bold text-white/90 flex items-center space-x-2 min-w-0">
                  <Dog size={24} className="text-primary shrink-0 drop-shadow-[0_0_8px_oklch(0.60_0.20_280)]" weight="fill" />
                  <span className="truncate">Pets</span>
                </h2>
                {onAddPet && (
                  <Button size="sm" onClick={onAddPet}>
                    <Plus size={16} className="mr-2" />
                    Add Pet
                  </Button>
                )}
              </div>

              {customer.pets.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Dog size={64} className="mx-auto text-muted-foreground mb-4" weight="thin" />
                  <h3 className="text-xl font-medium mb-2">No pets yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add the first furry friend for {customer.firstName} {customer.lastName}
                  </p>
                  {onAddPet && (
                    <Button onClick={onAddPet} className="liquid-button">
                      <Plus size={16} className="mr-2" />
                      Add Pet
                    </Button>
                  )}
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {customer.pets.map((pet, index) => (
                    <motion.div
                      key={pet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`glass-dark rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                        selectedPetId === pet.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPetId(selectedPetId === pet.id ? null : pet.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                            {pet.avatar ? (
                              <AvatarImage src={pet.avatar} alt={pet.name} />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-accent to-primary">
                              <Dog size={24} className="text-white" weight="fill" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-foreground text-lg">{pet.name}</h4>
                            <p className="text-sm text-muted-foreground">{pet.breed}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSizeColor(pet.size)}>
                            {getSizeLabel(pet.size)}
                          </Badge>
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditPet(pet)
                            }}
                            className="liquid-ripple"
                          >
                            <Pencil size={16} />
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedPetId === pet.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <Separator className="mb-4" />
                            
                            {pet.notes && (
                              <div className="bg-background/50 rounded-lg p-3 mb-3">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Special Care Notes
                                </p>
                                <p className="text-sm text-foreground">{pet.notes}</p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div className="bg-background/50 rounded-lg p-3">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Total Visits
                                </p>
                                <p className="text-2xl font-bold text-foreground">{getPetVisitCount(pet.id)}</p>
                              </div>
                              {getPetAverageRating(pet.id) !== undefined && (
                                <div className="bg-background/50 rounded-lg p-3">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Avg Rating
                                  </p>
                                  <div className="flex items-center space-x-1">
                                    <Star size={18} weight="fill" className="text-accent" />
                                    <span className="text-2xl font-bold text-foreground">{getPetAverageRating(pet.id)!.toFixed(1)}</span>
                                  </div>
                                </div>
                              )}
                              {getLastVisitDate(pet.id) && (
                                <div className="bg-background/50 rounded-lg p-3">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Last Visit
                                  </p>
                                  <p className="text-xs font-bold text-foreground">
                                    {(() => {
                                      try {
                                        const lastVisit = getLastVisitDate(pet.id)!
                                        const dateObj = new Date(lastVisit)
                                        if (isNaN(dateObj.getTime())) {
                                          return lastVisit
                                        }
                                        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                      } catch {
                                        return getLastVisitDate(pet.id)
                                      }
                                    })()}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditPet(pet)
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Pencil size={14} className="mr-2" />
                                Edit Info
                              </Button>
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedPetForHistory(pet.id)
                                  setShowGroomingHistory(true)
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Clock size={14} className="mr-2" />
                                History ({getPetVisitCount(pet.id)})
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      </div>

      <QuickCheckout
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        customerId={customer.id}
        customerName={`${customer.firstName} ${customer.lastName}`}
      />

      <Sheet open={showGroomingHistory} onOpenChange={setShowGroomingHistory}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto frosted">
          <SheetHeader>
            <SheetTitle className="flex items-center space-x-2">
              <Clock size={24} className="text-primary" />
              <span>Grooming History</span>
            </SheetTitle>
            <SheetDescription>
              {selectedPetForHistory && customer.pets.find(p => p.id === selectedPetForHistory)?.name}'s complete grooming history
            </SheetDescription>
          </SheetHeader>

          {selectedPetForHistory && (
            <div className="mt-6 space-y-4">
              {getGroomingHistoryForPet(selectedPetForHistory).length === 0 ? (
                <div className="text-center py-12">
                  <Clock size={64} className="mx-auto text-muted-foreground mb-4" weight="thin" />
                  <h3 className="text-xl font-medium mb-2">No grooming history yet</h3>
                  <p className="text-muted-foreground">
                    Completed appointments will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getGroomingHistoryForPet(selectedPetForHistory).map((visit, index) => (
                    <motion.div
                      key={visit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-dark rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Scissors size={18} className="text-primary" />
                            <h4 className="text-foreground"><span className="font-bold">{visit.service}</span> with {visit.groomer}</h4>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>
                                {(() => {
                                  try {
                                    const dateObj = new Date(visit.date)
                                    if (isNaN(dateObj.getTime())) {
                                      return visit.date
                                    }
                                    return dateObj.toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })
                                  } catch {
                                    return visit.date
                                  }
                                })()}
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{visit.duration} min</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <CreditCard size={14} />
                              <span>${(visit.price || 0).toFixed(2)}</span>
                            </span>
                          </div>
                        </div>
                        {visit.rating && (
                          <div className="flex items-center space-x-1">
                            <Star size={18} weight="fill" className="text-accent" />
                            <span className="text-foreground font-bold">{visit.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      {visit.notes && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Service Notes
                          </p>
                          <p className="text-sm text-foreground">{visit.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
