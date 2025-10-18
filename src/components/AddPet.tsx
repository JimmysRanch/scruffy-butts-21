import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Plus
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { WeightClass, WEIGHT_CLASSES } from '@/lib/pricing-types'
import { Customer, Pet } from '@/lib/types'

interface AddPetProps {
  customerId?: string
  onBack: () => void
}

export function AddPet({ customerId, onBack }: AddPetProps) {
  const [customers, setCustomers] = useKV<Customer[]>('customers', [])
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '')
  const [petForm, setPetForm] = useState({
    name: '',
    breed: '',
    weightClass: undefined as WeightClass | undefined,
    notes: ''
  })

  const selectedCustomer = (customers || []).find(c => c.id === selectedCustomerId)

  const handleAddPet = () => {
    if (!selectedCustomerId) {
      toast.error('Please select a client')
      return
    }

    if (!petForm.name || !petForm.breed) {
      toast.error('Please fill in all required fields')
      return
    }

    const newPet: Pet = {
      id: `pet-${Date.now()}`,
      name: petForm.name,
      breed: petForm.breed,
      weightClass: petForm.weightClass,
      notes: petForm.notes
    }

    setCustomers((current) =>
      (current || []).map(c =>
        c.id === selectedCustomerId
          ? { ...c, pets: [...c.pets, newPet] }
          : c
      )
    )

    toast.success('Pet added successfully!')
    onBack()
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="glass-card rounded-[1.25rem] p-4 md:p-6 shadow-lg overflow-hidden">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="-ml-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white/90">Add New Pet</h1>
            <p className="text-white/60 mt-1">
              {selectedCustomer 
                ? `Add a pet for ${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                : 'Add a pet to a client profile'
              }
            </p>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-6">
          {!customerId && (
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white/90 mb-4">Select Client</h3>
              
              <div>
                <Label htmlFor="customer-select" className="text-white/80">Client *</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="mt-1.5">
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
            </div>
          )}

          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold text-white/90 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pet-name" className="text-white/80">Pet Name *</Label>
                <Input
                  id="pet-name"
                  value={petForm.name}
                  onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                  placeholder="Enter pet name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="pet-breed" className="text-white/80">Breed *</Label>
                <Input
                  id="pet-breed"
                  value={petForm.breed}
                  onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                  placeholder="Enter breed"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="pet-weightClass" className="text-white/80">Weight Class</Label>
                <Select 
                  value={petForm.weightClass || ''} 
                  onValueChange={(value: WeightClass) => setPetForm({ ...petForm, weightClass: value })}
                >
                  <SelectTrigger className="mt-1.5">
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
            </div>
          </div>

          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold text-white/90 mb-4">Care Notes</h3>
            
            <div>
              <Label htmlFor="pet-notes" className="text-white/80">
                Special Care Instructions
              </Label>
              <Textarea
                id="pet-notes"
                value={petForm.notes}
                onChange={(e) => setPetForm({ ...petForm, notes: e.target.value })}
                placeholder="Any special care instructions, behavioral notes, medical conditions, or grooming preferences..."
                rows={6}
                className="mt-1.5"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Add any important information that groomers should know about the pet.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              size="lg"
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPet}
              size="lg"
              className="sm:w-auto w-full"
            >
              <Plus size={20} className="mr-2" weight="bold" />
              Add Pet
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
