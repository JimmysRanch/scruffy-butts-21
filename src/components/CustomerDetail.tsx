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
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  CaretDown,
  CaretRight
} from '@phosphor-icons/react'
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

interface CustomerDetailProps {
  customerId: string
  onBack: () => void
}

export function CustomerDetail({ customerId, onBack }: CustomerDetailProps) {
  const [customers, setCustomers] = useKV<Customer[]>('customers', [])
  const [isNewPetOpen, setIsNewPetOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [isEditPetOpen, setIsEditPetOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [expandedPets, setExpandedPets] = useState<Set<string>>(new Set())
  
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
  
  const [petForm, setPetForm] = useState({
    name: '',
    breed: '',
    size: 'medium' as 'small' | 'medium' | 'large',
    notes: ''
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
      notes: petForm.notes
    }

    setCustomers((current) =>
      (current || []).map(c =>
        c.id === customerId
          ? { ...c, pets: [...c.pets, newPet] }
          : c
      )
    )

    toast.success('Pet added successfully!')
    setPetForm({ name: '', breed: '', size: 'medium', notes: '' })
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
                      notes: petForm.notes
                    }
                  : pet
              )
            }
          : c
      )
    )

    toast.success('Pet updated successfully!')
    setPetForm({ name: '', breed: '', size: 'medium', notes: '' })
    setEditingPet(null)
    setIsEditPetOpen(false)
  }

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet)
    setPetForm({
      name: pet.name,
      breed: pet.breed,
      size: pet.size,
      notes: pet.notes || ''
    })
    setIsEditPetOpen(true)
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

  const togglePetExpanded = (petId: string) => {
    setExpandedPets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(petId)) {
        newSet.delete(petId)
      } else {
        newSet.add(petId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {customer.firstName && customer.lastName 
              ? `${customer.firstName} ${customer.lastName}` 
              : customer.name || 'Unknown Customer'}
          </h1>
          <p className="text-muted-foreground">
            Client since {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User size={20} />
                <span>Client Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Envelope size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </div>

              {customer.address && (
                <div className="flex items-center space-x-3">
                  <MapPin size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{customer.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Client Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {customer.notes && (
                <>
                  <Separator />
                  <div className="flex items-start space-x-3">
                    <NotePencil size={16} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Notes</p>
                      <p className="text-sm text-muted-foreground">{customer.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pets Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart size={20} />
                  <CardTitle>Pets ({customer.pets.length})</CardTitle>
                </div>
                <Dialog open={isNewPetOpen} onOpenChange={setIsNewPetOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Add Pet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Pet</DialogTitle>
                      <DialogDescription>
                        Add a new pet to {customer.firstName && customer.lastName 
                          ? `${customer.firstName} ${customer.lastName}` 
                          : customer.name || 'this customer'}'s profile.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
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
              </div>
            </CardHeader>
            <CardContent>
              {customer.pets.length === 0 ? (
                <div className="text-center py-12">
                  <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add the first pet for {customer.firstName && customer.lastName 
                      ? `${customer.firstName} ${customer.lastName}` 
                      : customer.name || 'this customer'}
                  </p>
                  <Button onClick={() => setIsNewPetOpen(true)}>
                    Add First Pet
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {customer.pets.map((pet) => {
                    const isExpanded = expandedPets.has(pet.id)
                    return (
                      <Collapsible key={pet.id} open={isExpanded} onOpenChange={() => togglePetExpanded(pet.id)}>
                        <div className="border rounded-lg overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between w-full">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                                  <Heart size={16} className="text-accent" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-foreground">{pet.name}</h3>
                                  <p className="text-sm text-muted-foreground">{pet.breed}</p>
                                </div>
                                <Badge variant={getSizeColor(pet.size)}>
                                  {getSizeLabel(pet.size)}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditPet(pet)
                                  }}
                                >
                                  <Pencil size={16} />
                                </Button>
                                {isExpanded ? (
                                  <CaretDown size={20} className="text-muted-foreground" />
                                ) : (
                                  <CaretRight size={20} className="text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="px-4 pb-4 border-t bg-muted/20">
                              <div className="pt-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pet Name</p>
                                    <p className="text-sm font-medium">{pet.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Size</p>
                                    <p className="text-sm">{getSizeLabel(pet.size)}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Breed</p>
                                    <p className="text-sm">{pet.breed}</p>
                                  </div>
                                </div>
                                
                                {pet.notes && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Special Notes</p>
                                    <p className="text-sm text-muted-foreground bg-background p-2 rounded border">
                                      {pet.notes}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="pt-2 border-t">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditPet(pet)}
                                    className="w-full"
                                  >
                                    <Pencil size={16} className="mr-2" />
                                    Edit Pet Information
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Pet Dialog */}
      <Dialog open={isEditPetOpen} onOpenChange={setIsEditPetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pet Information</DialogTitle>
            <DialogDescription>
              Update {editingPet?.name}'s information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
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
              <Label htmlFor="edit-pet-notes">Special Notes</Label>
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
    </div>
  )
}