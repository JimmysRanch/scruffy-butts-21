import { useState } from 'react'
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

interface Pet {
  id: string
  name: string
  breed: string
  size: 'small' | 'medium' | 'large'
  notes?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  pets: Pet[]
  createdAt: string
}

export function CustomerManager() {
  const [customers, setCustomers] = useKV<Customer[]>('customers', [])
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
  const [isNewPetOpen, setIsNewPetOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
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
    if (!customerForm.name || !customerForm.email || !customerForm.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      name: customerForm.name,
      email: customerForm.email,
      phone: customerForm.phone,
      pets: [],
      createdAt: new Date().toISOString()
    }

    setCustomers((current) => [...(current || []), newCustomer])
    toast.success('Customer added successfully!')
    
    setCustomerForm({ name: '', email: '', phone: '' })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer information and their pets
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
                  Add a pet to an existing customer's profile.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer-select">Customer</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {(customers || []).map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
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
                <span>New Customer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer profile for your grooming business.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer-name">Customer Name</Label>
                  <Input
                    id="customer-name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="Enter customer name"
                  />
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
                  Add Customer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(customers || []).length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <User size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No customers yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first customer to get started with managing your grooming business
              </p>
              <Button onClick={() => setIsNewCustomerOpen(true)}>
                Add First Customer
              </Button>
            </CardContent>
          </Card>
        ) : (
          (customers || []).map((customer) => (
            <Card key={customer.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User size={20} />
                  <span>{customer.name}</span>
                </CardTitle>
                <CardDescription>
                  {customer.pets.length} pet{customer.pets.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Envelope size={16} className="text-muted-foreground" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone size={16} className="text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                  
                  {customer.pets.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Pets:</p>
                      <div className="space-y-2">
                        {customer.pets.map((pet) => (
                          <div key={pet.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                            <div>
                              <p className="font-medium text-sm">{pet.name}</p>
                              <p className="text-xs text-muted-foreground">{pet.breed}</p>
                            </div>
                            <Badge variant={getSizeColor(pet.size)} className="text-xs">
                              {pet.size}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => {
                      setSelectedCustomerId(customer.id)
                      setIsNewPetOpen(true)
                    }}
                  >
                    <Heart size={16} className="mr-2" />
                    Add Pet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}