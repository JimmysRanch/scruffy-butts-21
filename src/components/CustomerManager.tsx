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
import { Plus, User, Phone, Heart } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { CustomerDetail } from './CustomerDetail'
import { NewCustomer } from './NewCustomer'

interface Pet {
  id: string
  name: string
  breed: string
  size?: 'small' | 'medium' | 'large'
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

export function CustomerManager() {
  const [customers, setCustomers] = useKV<Customer[]>('customers', [])
  const [appearance] = useKV<{ compactMode?: boolean }>('appearance-settings', {})
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [isNewPetOpen, setIsNewPetOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(null)
  
  const isCompact = appearance?.compactMode || false
  
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
  
  const [petForm, setPetForm] = useState({
    name: '',
    breed: '',
    size: 'medium' as 'small' | 'medium' | 'large',
    notes: ''
  })

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

  const getSizeColor = (size: string | undefined) => {
    if (!size) return 'secondary'
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

  // If creating a new customer, show the creation page
  if (isCreatingCustomer) {
    return <NewCustomer onBack={() => setIsCreatingCustomer(false)} />
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
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-bold text-foreground text-xl truncate">Clients & Pets</h1>
          <p className="text-muted-foreground text-sm">
            Manage client information and their pets
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0 self-stretch sm:self-auto">
          <Dialog open={isNewPetOpen} onOpenChange={setIsNewPetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 h-8 text-xs">
                <Heart size={16} />
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

          <Button 
            className="flex items-center space-x-2 h-8 text-xs"
            onClick={() => setIsCreatingCustomer(true)}
          >
            <Plus size={16} />
            <span>New Client</span>
          </Button>
        </div>
      </div>

      {(customers || []).length === 0 ? (
        <div className="glass-card rounded-[1.25rem] overflow-hidden">
          <div className="text-center py-12 px-6">
            <div className="w-fit mx-auto p-5 rounded-2xl mb-4 bg-white/5 ring-1 ring-white/10">
              <User size={48} className="mx-auto text-white/50" weight="duotone" />
            </div>
            <h3 className="font-semibold mb-2 text-lg text-white/90">No clients yet</h3>
            <p className="text-white/50 mb-6 text-sm">
              Add your first client to get started with managing your grooming business
            </p>
            <Button onClick={() => setIsCreatingCustomer(true)}>
              Add First Client
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {(customers || []).map((customer) => (
            <div 
              key={customer.id} 
              className="glass-card rounded-[1.25rem] flex flex-col @[600px]:flex-row items-start @[600px]:items-center justify-between hover:scale-[1.01] transition-all duration-300 cursor-pointer p-4 gap-3 @container min-w-0"
              onClick={() => setViewingCustomerId(customer.id)}
            >
              <div className="flex items-center flex-1 min-w-0 space-x-3 w-full @[600px]:w-auto">
                <div className="flex-shrink-0">
                  <div className="bg-accent/25 rounded-full flex items-center justify-center w-11 h-11 ring-1 ring-accent/40 shadow-[0_0_12px_oklch(0.65_0.22_310/0.3)]">
                    <User size={22} className="text-accent" weight="duotone" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center space-x-2 mb-0.5 min-w-0">
                    <h3 className="font-semibold text-white/90 truncate text-base">
                      {customer.firstName && customer.lastName 
                        ? `${customer.firstName} ${customer.lastName}` 
                        : customer.name || 'Unknown Customer'}
                    </h3>
                    <span className="text-white/60 bg-white/10 rounded-full text-xs px-2.5 py-0.5 whitespace-nowrap shrink-0 font-medium">
                      {customer.pets.length} pet{customer.pets.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-white/50 space-x-3 text-sm min-w-0">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <Phone size={14} className="shrink-0" weight="duotone" />
                      <span className="truncate font-medium">{customer.phone}</span>
                    </div>
                  </div>
                  
                  {customer.pets.length > 0 && (
                    <div className="flex items-start @[400px]:items-center space-x-2 mt-1.5 min-w-0">
                      <span className="text-white/50 text-xs shrink-0 font-medium">Pets:</span>
                      <div className="flex flex-wrap gap-1.5 min-w-0">
                        {customer.pets.map((pet) => (
                          <span key={pet.id} className="bg-primary/25 text-primary-foreground rounded-lg text-xs px-2.5 py-1 whitespace-nowrap ring-1 ring-primary/30 shadow-sm">
                            {pet.name} ({pet.breed})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0 self-end @[600px]:self-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCustomerId(customer.id)
                    setIsNewPetOpen(true)
                  }}
                  className="h-8 text-sm px-3"
                >
                  <Heart size={16} className="mr-1.5" />
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