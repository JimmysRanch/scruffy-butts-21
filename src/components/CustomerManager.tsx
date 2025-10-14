import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, User, Phone, Envelope, Heart } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { CustomerDetail } from './CustomerDetail'

interface Pet {
  id: string
  name: string
  breed: string
  size: 'small' | 'medium' | 'large'
  notes?: string
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
  notes?: string
  name?: string
}

export function CustomerManager() {
  const [customers, setCustomers] = useKV<Customer[]>('customers', [])
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
  const [isNewPetOpen, setIsNewPetOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(null)
  
  useEffect(() => {
    if (customers && customers.length > 0) {
      const needsMigration = customers.some(c => c.name && (!c.firstName || !c.lastName))
      if (needsMigration) {
        setCustomers((current) =>
          (current || []).map(customer => {
            if (customer.name && (!customer.firstName || !customer.lastName)) {
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
  
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  
  const [petForm, setPetForm] = useState({
    name: '',
    breed: '',
    size: 'medium' as 'small' | 'medium' | 'large',
    notes: ''
  })

  const handleCreateCustomer = () => {
    if (!customerForm.firstName || !customerForm.lastName || !customerForm.email || !customerForm.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      firstName: customerForm.firstName,
      lastName: customerForm.lastName,
      email: customerForm.email,
      phone: customerForm.phone,
      pets: [],
      createdAt: new Date().toISOString(),
      address: '',
      notes: ''
    }

    setCustomers((current) => [...(current || []), newCustomer])
    toast.success('Client added successfully!')
    
    setCustomerForm({ firstName: '', lastName: '', email: '', phone: '' })
    setIsNewCustomerOpen(false)
  }

  const handleAddPet = () => {
    if (!petForm.name || !petForm.breed || !selectedCustomerId) {
      toast.error('Please fill in all required fields')
      return
    }

    const newPet: Pet = {
      id: `pet-${Date.now()}`,
      name: petForm.name,
      breed: petForm.breed,
      size: petForm.size,
      notes: petForm.notes
    }

    setCustomers((current) =>
      (current || []).map(customer =>
        customer.id === selectedCustomerId
          ? { ...customer, pets: [...customer.pets, newPet] }
          : customer
      )
    )

    toast.success('Pet added successfully!')
    setPetForm({ name: '', breed: '', size: 'medium', notes: '' })
    setSelectedCustomerId('')
    setIsNewPetOpen(false)
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

  // If viewing a specific customer, show the detail view
  if (viewingCustomerId) {
    return (
      <CustomerDetail 
        customerId={viewingCustomerId} 
        onBack={() => setViewingCustomerId(null)} 
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients & Pets</h1>
          <p className="text-muted-foreground">
            Manage client information and their pets
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isNewPetOpen} onOpenChange={setIsNewPetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Heart size={18} />
                <span>Add Pet</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Pet</DialogTitle>
                <DialogDescription>
                  Add a pet to an existing client's profile.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer-select">Client</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
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
                  <Label htmlFor="pet-notes">Special Notes</Label>
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

          <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus size={18} />
                <span>New Client</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client profile for your grooming business.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer-first-name">First Name</Label>
                    <Input
                      id="customer-first-name"
                      value={customerForm.firstName}
                      onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer-last-name">Last Name</Label>
                    <Input
                      id="customer-last-name"
                      value={customerForm.lastName}
                      onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="customer-phone">Phone</Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <Button onClick={handleCreateCustomer} className="w-full">
                  Add Client
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {(customers || []).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No clients yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first client to get started with managing your grooming business
            </p>
            <Button onClick={() => setIsNewCustomerOpen(true)}>
              Add First Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(customers || []).map((customer) => (
            <div 
              key={customer.id} 
              className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setViewingCustomerId(customer.id)}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-medium text-foreground truncate">
                      {customer.firstName && customer.lastName 
                        ? `${customer.firstName} ${customer.lastName}` 
                        : customer.name || 'Unknown Customer'}
                    </h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {customer.pets.length} pet{customer.pets.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Envelope size={14} />
                      <span className="truncate max-w-[200px]">{customer.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone size={14} />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                  
                  {customer.pets.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-muted-foreground">Pets:</span>
                      <div className="flex flex-wrap gap-1">
                        {customer.pets.map((pet) => (
                          <span key={pet.id} className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded">
                            {pet.name} ({pet.breed})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering the card click
                    setSelectedCustomerId(customer.id)
                    setIsNewPetOpen(true)
                  }}
                >
                  <Heart size={16} className="mr-2" />
                  Add Pet
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}