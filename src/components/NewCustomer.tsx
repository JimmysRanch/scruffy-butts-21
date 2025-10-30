import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { WeightClass, WEIGHT_CLASSES } from '@/lib/pricing-types'
import { Customer, Pet } from '@/lib/types'

interface NewCustomerProps {
  onBack: () => void
}

export function NewCustomer({ onBack }: NewCustomerProps) {
  const [customers, setCustomers] = useKV<Customer[]>('customers', [])
  
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Texas',
    zip: '',
    notes: '',
    referralSource: ''
  })

  const [pets, setPets] = useState<Omit<Pet, 'id'>[]>([{
    name: '',
    breed: '',
    customBreed: '',
    isMixedBreed: false,
    weightClass: undefined,
    age: undefined,
    birthday: '',
    gender: undefined,
    notes: ''
  }])

  const addPet = () => {
    setPets([...pets, {
      name: '',
      breed: '',
      customBreed: '',
      isMixedBreed: false,
      weightClass: undefined,
      age: undefined,
      birthday: '',
      gender: undefined,
      notes: ''
    }])
  }

  const removePet = (index: number) => {
    if (pets.length > 1) {
      setPets(pets.filter((_, i) => i !== index))
    }
  }

  const updatePet = (index: number, field: keyof Omit<Pet, 'id'>, value: string | boolean | number | undefined) => {
    const updatedPets = [...pets]
    updatedPets[index] = { ...updatedPets[index], [field]: value }
    setPets(updatedPets)
  }

  const handleCreateCustomer = () => {
    if (!customerForm.firstName || !customerForm.lastName || !customerForm.email || !customerForm.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const validPets = pets.filter(pet => pet.name && pet.breed)
    
    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      firstName: customerForm.firstName,
      lastName: customerForm.lastName,
      email: customerForm.email,
      phone: customerForm.phone,
      pets: validPets.map((pet, index) => ({
        ...pet,
        id: `pet-${Date.now()}-${index}`,
        weightClass: pet.weightClass as WeightClass | undefined
      })),
      createdAt: new Date().toISOString(),
      address: customerForm.address,
      city: customerForm.city,
      state: customerForm.state,
      zip: customerForm.zip,
      notes: customerForm.notes
    }

    setCustomers((current) => [...(current || []), newCustomer])
    toast.success('Client added successfully!')
    
    onBack()
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
          className="h-8"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="font-bold text-foreground text-xl">Add New Client</h1>
          <p className="text-muted-foreground text-sm">
            Create a new client profile for your grooming business
          </p>
        </div>
      </div>

      <div className="glass-card rounded-[1.25rem] overflow-hidden w-full">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white/90">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-first-name" className="text-white/70">First Name *</Label>
                <Input
                  id="customer-first-name"
                  value={customerForm.firstName}
                  onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                  placeholder="Enter first name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="customer-last-name" className="text-white/70">Last Name *</Label>
                <Input
                  id="customer-last-name"
                  value={customerForm.lastName}
                  onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                  placeholder="Enter last name"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-email" className="text-white/70">Email *</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="client@example.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="customer-phone" className="text-white/70">Phone *</Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer-address" className="text-white/70">Street Address</Label>
              <Input
                id="customer-address"
                value={customerForm.address}
                onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                placeholder="123 Main St"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="customer-city" className="text-white/70">City</Label>
                <Input
                  id="customer-city"
                  value={customerForm.city}
                  onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                  placeholder="Dallas"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="customer-state" className="text-white/70">State</Label>
                <Input
                  id="customer-state"
                  value={customerForm.state}
                  onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                  placeholder="TX"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="customer-zip" className="text-white/70">ZIP Code</Label>
                <Input
                  id="customer-zip"
                  value={customerForm.zip}
                  onChange={(e) => setCustomerForm({ ...customerForm, zip: e.target.value })}
                  placeholder="75001"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer-referral" className="text-white/70">How did you hear about us</Label>
              <Select
                value={customerForm.referralSource}
                onValueChange={(value) => setCustomerForm({ ...customerForm, referralSource: value })}
              >
                <SelectTrigger id="customer-referral" className="mt-1.5">
                  <SelectValue placeholder="Select source..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Nextdoor App">Nextdoor App</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </div>

      {pets.map((pet, index) => (
        <div key={index} className="glass-card rounded-[1.25rem] overflow-hidden w-full">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white/90">Pet #{index + 1} Information</CardTitle>
              {pets.length > 1 && (
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => removePet(index)}
                  className="h-8 text-destructive hover:text-destructive"
                >
                  <Trash size={16} />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 w-full">
              <div className="flex justify-between gap-4 w-full">
                <div className="flex-[2]">
                  <Label htmlFor={`pet-name-${index}`} className="text-white/70">Pet Name</Label>
                  <Input
                    id={`pet-name-${index}`}
                    value={pet.name}
                    onChange={(e) => updatePet(index, 'name', e.target.value)}
                    placeholder="Enter pet name"
                    className="mt-1.5"
                  />
                </div>

                <div className="w-20">
                  <Label htmlFor={`pet-age-${index}`} className="text-white/70">Age</Label>
                  <Input
                    id={`pet-age-${index}`}
                    type="number"
                    min="0"
                    max="30"
                    value={pet.age || ''}
                    onChange={(e) => updatePet(index, 'age', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Age"
                    className="mt-1.5"
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor={`pet-weight-${index}`} className="text-white/70">Weight Class</Label>
                  <Select
                    value={pet.weightClass || ''}
                    onValueChange={(value) => updatePet(index, 'weightClass', value)}
                  >
                    <SelectTrigger id={`pet-weight-${index}`} className="mt-1.5">
                      <SelectValue placeholder="Select weight class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">{WEIGHT_CLASSES.small.label}</SelectItem>
                      <SelectItem value="medium">{WEIGHT_CLASSES.medium.label}</SelectItem>
                      <SelectItem value="large">{WEIGHT_CLASSES.large.label}</SelectItem>
                      <SelectItem value="giant">{WEIGHT_CLASSES.giant.label}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label className="text-white/70">Gender</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Button
                      type="button"
                      variant={pet.gender === 'Male' ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => updatePet(index, 'gender', 'Male')}
                    >
                      Male
                    </Button>
                    <Button
                      type="button"
                      variant={pet.gender === 'Female' ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => updatePet(index, 'gender', 'Female')}
                    >
                      Female
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <div className="flex-1">
                  <Label htmlFor={`pet-breed-${index}`} className="text-white/70">Breed</Label>
                  <Input
                    id={`pet-breed-${index}`}
                    value={pet.breed || ''}
                    onChange={(e) => updatePet(index, 'breed', e.target.value)}
                    placeholder="Enter breed"
                    className="mt-1.5"
                  />
                </div>

                <div className="w-40">
                  <Label className="text-white/70">Mixed Breed</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Button
                      type="button"
                      variant={pet.isMixedBreed === true ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => updatePet(index, 'isMixedBreed', true)}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={pet.isMixedBreed === false ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => updatePet(index, 'isMixedBreed', false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor={`pet-notes-${index}`} className="text-white/70">Medical, Allergies, and Behavior Information</Label>
                <Textarea
                  id={`pet-notes-${index}`}
                  value={pet.notes}
                  onChange={(e) => updatePet(index, 'notes', e.target.value)}
                  placeholder="Special care instructions, temperament, etc..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </div>
      ))}

      <div className="flex items-center justify-between gap-3">
        <Button 
          size="sm"
          onClick={addPet}
        >
          <Plus size={16} />
          Add Pet
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateCustomer}>
            Add Client
          </Button>
        </div>
      </div>
    </div>
  )
}
