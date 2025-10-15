import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  ChatCircleDots,
  UploadSimple,
  X
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
  size: 'small' | 'medium' | 'large'
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
}

export function CustomerDetail({ customerId, onBack }: CustomerDetailProps) {
  const [customers, setCustomers] = useKV<Customer[]>('customers', [])
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [transactions] = useKV<Transaction[]>('transactions', [])
  const [staff] = useKV<Staff[]>('staff', [])
  const [isNewPetOpen, setIsNewPetOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [isEditPetOpen, setIsEditPetOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [showGroomingHistory, setShowGroomingHistory] = useState(false)
  const [selectedPetForHistory, setSelectedPetForHistory] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (customers && customers.length > 0) {
      const needsMigration = customers.some(c => c.name && (!c.firstName || !c.lastName))
      if (needsMigration) {
        setCustomers((current) =>
          (current || []).map(customer => {
            if (customer.name && typeof customer.name === 'string' && (!customer.firstName || !customer.lastName)) {
              const nameParts = customer.name.split(' ')
              const firstName = nameParts[0] || ''
              const lastName = nameParts.slice(1).join(' ') || ''
              const { name, ...rest } = customer
              return {
                ...rest,
                firstName,
                lastName
              }
            }
            return customer
          })
        )
      }
    }
  }, [customers, setCustomers])
  
  const customer = (customers || []).find(c => c.id === customerId)
  
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
  
  const [petForm, setPetForm] = useState({
    name: '',
    breed: '',
    size: 'medium' as 'small' | 'medium' | 'large',
    notes: '',
    avatar: ''
  })

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Customer Not Found</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">The requested customer could not be found.</p>
          </CardContent>
        </Card>
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

  const handleAddPet = () => {
    if (!petForm.name || !petForm.breed) {
      toast.error('Please fill in all required fields')
      return
    }

    const newPet: Pet = {
      id: `pet-${Date.now()}`,
      name: petForm.name,
      breed: petForm.breed,
      size: petForm.size,
      notes: petForm.notes,
      avatar: petForm.avatar,
      visitCount: 0
    }

    setCustomers((current) =>
      (current || []).map(c =>
        c.id === customerId
          ? { ...c, pets: [...c.pets, newPet] }
          : c
      )
    )

    toast.success('Pet added successfully!')
    setPetForm({ name: '', breed: '', size: 'medium', notes: '', avatar: '' })
    setIsNewPetOpen(false)
  }

  const handleUpdatePet = () => {
    if (!petForm.name || !petForm.breed || !editingPet) {
      toast.error('Please fill in all required fields')
      return
    }

    setCustomers((current) =>
      (current || []).map(c =>
        c.id === customerId
          ? {
              ...c,
              pets: c.pets.map(pet =>
                pet.id === editingPet.id
                  ? {
                      ...pet,
                      name: petForm.name,
                      breed: petForm.breed,
                      size: petForm.size,
                      notes: petForm.notes,
                      avatar: petForm.avatar
                    }
                  : pet
              )
            }
          : c
      )
    )

    toast.success('Pet updated successfully!')
    setPetForm({ name: '', breed: '', size: 'medium', notes: '', avatar: '' })
    setEditingPet(null)
    setIsEditPetOpen(false)
  }

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet)
    setPetForm({
      name: pet.name,
      breed: pet.breed,
      size: pet.size,
      notes: pet.notes || '',
      avatar: pet.avatar || ''
    })
    setIsEditPetOpen(true)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setPetForm({ ...petForm, avatar: result })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setPetForm({ ...petForm, avatar: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'large':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getSizeLabel = (size: string) => {
    return size.charAt(0).toUpperCase() + size.slice(1)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const customerAppointments = (appointments || []).filter(
    apt => apt.customerId === customerId && apt.status !== 'cancelled' && apt.status !== 'no-show'
  )
  
  const appointmentCount = customerAppointments.length
  
  const customerTransactions = (transactions || []).filter(
    txn => txn.customerId === customerId && txn.status === 'completed'
  )
  
  const lifetimeValue = customerTransactions.reduce((sum, txn) => sum + txn.total, 0)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="frosted rounded-2xl p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="liquid-button -ml-2 mt-1"
            >
              <ArrowLeft size={20} />
            </Button>
            
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg liquid-glow">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-bold">
                {getInitials(customer.firstName, customer.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">
                  {customer.firstName} {customer.lastName}
                </h1>
                <Badge className="bg-accent/20 text-accent border-accent/30 liquid-pulse">
                  <Star size={12} className="mr-1" weight="fill" />
                  VIP Client
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center space-x-2 mb-4">
                <Calendar size={16} />
                <span>Client since {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </p>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart size={20} className="text-primary" weight="fill" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{customer.pets.length}</p>
                      <p className="text-xs text-muted-foreground">Furry Friends</p>
                    </div>
                  </div>
                </div>

                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Scissors size={20} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{appointmentCount}</p>
                      <p className="text-xs text-muted-foreground">Appointments</p>
                    </div>
                  </div>
                </div>

                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CreditCard size={20} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">${lifetimeValue.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Lifetime Value</p>
                    </div>
                  </div>
                </div>
              </div>
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
              <Button variant="outline" className="liquid-button">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="frosted rounded-2xl p-6 shadow-lg liquid-flow">
              <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
                <User size={20} className="text-primary" />
                <span>Contact Information</span>
              </h3>
              
              <div className="space-y-5">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Envelope size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                    <p className="text-sm font-medium text-foreground break-all">{customer.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-sm font-medium text-foreground">{customer.phone}</p>
                  </div>
                </div>

                {customer.address && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={18} className="text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Address</p>
                      <p className="text-sm font-medium text-foreground">{customer.address}</p>
                    </div>
                  </div>
                )}

                {customer.notes && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <NotePencil size={18} className="text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-sm text-foreground">{customer.notes}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="frosted rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <Clock size={20} className="text-primary" />
                <span>Quick Actions</span>
              </h3>
              
              <div className="space-y-3">
                <Button className="w-full justify-start liquid-button" variant="outline">
                  <Calendar size={18} className="mr-3" />
                  Book Appointment
                </Button>
                <Button 
                  className="w-full justify-start liquid-button bg-primary text-primary-foreground hover:bg-primary/90" 
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <CreditCard size={18} className="mr-3" />
                  Quick Checkout
                </Button>
                <Button className="w-full justify-start liquid-button" variant="outline">
                  <ChatCircleDots size={18} className="mr-3" />
                  Send Message
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="frosted rounded-2xl p-6 shadow-lg liquid-flow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <Dog size={20} className="text-accent" weight="fill" />
                <span>Furry Friends ({customer.pets.length})</span>
              </h3>
              <Dialog open={isNewPetOpen} onOpenChange={(open) => {
                if (!open && fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
                setIsNewPetOpen(open)
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="liquid-button">
                    <Plus size={16} className="mr-2" />
                    Add Pet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Pet</DialogTitle>
                    <DialogDescription>
                      Add a new furry friend to this client's profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pet-avatar">Pet Photo</Label>
                      <div className="mt-2 flex items-center gap-4">
                        {petForm.avatar ? (
                          <div className="relative">
                            <Avatar className="w-24 h-24 border-2 border-border">
                              <AvatarImage src={petForm.avatar} alt="Pet avatar" />
                              <AvatarFallback>
                                <Dog size={32} weight="fill" />
                              </AvatarFallback>
                            </Avatar>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={handleRemoveAvatar}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
                            <Dog size={32} className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            id="pet-avatar"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                          >
                            <UploadSimple size={16} className="mr-2" />
                            {petForm.avatar ? 'Change Photo' : 'Upload Photo'}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            Max 5MB, JPG or PNG
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="pet-name">Pet Name</Label>
                      <Input
                        id="pet-name"
                        value={petForm.name}
                        onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                        placeholder="Enter pet name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pet-breed">Breed</Label>
                      <Input
                        id="pet-breed"
                        value={petForm.breed}
                        onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                        placeholder="Enter breed"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pet-size">Size</Label>
                      <Select value={petForm.size} onValueChange={(value: 'small' | 'medium' | 'large') => setPetForm({ ...petForm, size: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="pet-notes">Notes</Label>
                      <Textarea
                        id="pet-notes"
                        value={petForm.notes}
                        onChange={(e) => setPetForm({ ...petForm, notes: e.target.value })}
                        placeholder="Any special care instructions or notes..."
                      />
                    </div>

                    <Button onClick={handleAddPet} className="w-full">
                      Add Pet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {customer.pets.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 0.9 }}
                  transition={{ delay: 0.3 }}
                >
                  <Dog size={64} className="mx-auto text-muted-foreground mb-4" weight="thin" />
                  <h3 className="text-xl font-medium mb-2">No pets yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add the first furry friend for {customer.firstName} {customer.lastName}
                  </p>
                  <Button onClick={() => setIsNewPetOpen(true)} className="liquid-button">
                    <Plus size={16} className="mr-2" />
                    Add Pet
                  </Button>
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
                                    {new Date(getLastVisitDate(pet.id)!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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

      <Dialog open={isEditPetOpen} onOpenChange={(open) => {
        if (!open && fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setIsEditPetOpen(open)
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pet Information</DialogTitle>
            <DialogDescription>
              Update your pet's information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-pet-avatar">Pet Photo</Label>
              <div className="mt-2 flex items-center gap-4">
                {petForm.avatar ? (
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-2 border-border">
                      <AvatarImage src={petForm.avatar} alt="Pet avatar" />
                      <AvatarFallback>
                        <Dog size={32} weight="fill" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveAvatar}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
                    <Dog size={32} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="edit-pet-avatar"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <UploadSimple size={16} className="mr-2" />
                    {petForm.avatar ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 5MB, JPG or PNG
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-pet-name">Pet Name</Label>
              <Input
                id="edit-pet-name"
                value={petForm.name}
                onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                placeholder="Enter pet name"
              />
            </div>

            <div>
              <Label htmlFor="edit-pet-breed">Breed</Label>
              <Input
                id="edit-pet-breed"
                value={petForm.breed}
                onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                placeholder="Enter breed"
              />
            </div>

            <div>
              <Label htmlFor="edit-pet-size">Size</Label>
              <Select value={petForm.size} onValueChange={(value: 'small' | 'medium' | 'large') => setPetForm({ ...petForm, size: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-pet-notes">Notes</Label>
              <Textarea
                id="edit-pet-notes"
                value={petForm.notes}
                onChange={(e) => setPetForm({ ...petForm, notes: e.target.value })}
                placeholder="Any special care instructions or notes..."
              />
            </div>

            <Button onClick={handleUpdatePet} className="w-full">
              Update Pet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                              <span>{new Date(visit.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{visit.duration} min</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">${visit.price.toFixed(2)}</p>
                          {visit.rating !== undefined && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Star size={14} weight="fill" className="text-accent" />
                              <span className="text-sm font-medium text-accent">{visit.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {visit.notes && (
                        <div className="bg-background/50 rounded-lg p-3 mt-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Visit Notes
                          </p>
                          <p className="text-sm text-foreground">{visit.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
              
              {getGroomingHistoryForPet(selectedPetForHistory).length > 0 && (
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <h4 className="font-bold text-foreground mb-3">Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{getGroomingHistoryForPet(selectedPetForHistory).length}</p>
                      <p className="text-xs text-muted-foreground">Total Visits</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ${getGroomingHistoryForPet(selectedPetForHistory).reduce((sum, v) => sum + v.price, 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                    </div>
                    {getPetAverageRating(selectedPetForHistory) !== undefined && (
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <Star size={18} weight="fill" className="text-accent" />
                          <p className="text-2xl font-bold text-accent">
                            {getPetAverageRating(selectedPetForHistory)!.toFixed(1)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">Avg Rating</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
