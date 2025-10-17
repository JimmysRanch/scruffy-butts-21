import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Dog,
  UploadSimple,
  X,
  FloppyDisk
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Pet {
  id: string
  name: string
  breed: string
  size?: 'small' | 'medium' | 'large'
  notes?: string
  avatar?: string
  visitCount?: number
  rating?: number
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
}

interface EditPetProps {
  customerId: string
  petId: string
  onBack: () => void
}

export function EditPet({ customerId, petId, onBack }: EditPetProps) {
  const [customers, setCustomers] = useKV<Customer[]>('customers', [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const customer = (customers || []).find(c => c.id === customerId)
  const pet = customer?.pets.find(p => p.id === petId)
  
  const [petForm, setPetForm] = useState({
    name: pet?.name || '',
    breed: pet?.breed || '',
    size: (pet?.size || 'medium') as 'small' | 'medium' | 'large',
    notes: pet?.notes || '',
    avatar: pet?.avatar || ''
  })

  useEffect(() => {
    if (pet) {
      setPetForm({
        name: pet.name,
        breed: pet.breed,
        size: pet.size || 'medium',
        notes: pet.notes || '',
        avatar: pet.avatar || ''
      })
    }
  }, [pet])

  if (!customer || !pet) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-3xl font-bold text-white/90">Pet Not Found</h1>
        </div>
        <div className="glass-card rounded-[1.25rem] overflow-hidden">
          <div className="text-center py-12 px-6">
            <p className="text-white/60">The requested pet could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleUpdatePet = () => {
    if (!petForm.name || !petForm.breed) {
      toast.error('Please fill in all required fields')
      return
    }

    setCustomers((current) =>
      (current || []).map(c =>
        c.id === customerId
          ? {
              ...c,
              pets: c.pets.map(p =>
                p.id === petId
                  ? {
                      ...p,
                      name: petForm.name,
                      breed: petForm.breed,
                      size: petForm.size,
                      notes: petForm.notes,
                      avatar: petForm.avatar
                    }
                  : p
              )
            }
          : c
      )
    )

    toast.success('Pet updated successfully!')
    onBack()
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
            <h1 className="text-3xl font-bold text-white/90">Edit Pet Information</h1>
            <p className="text-white/60 mt-1">
              Update {pet.name}'s details for {customer.firstName} {customer.lastName}
            </p>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-6">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold text-white/90 mb-4 flex items-center space-x-2">
              <Dog size={20} className="text-primary" weight="fill" />
              <span>Pet Photo</span>
            </h3>
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {petForm.avatar ? (
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-border shadow-xl">
                    <AvatarImage src={petForm.avatar} alt="Pet avatar" />
                    <AvatarFallback>
                      <Dog size={48} weight="fill" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                    onClick={handleRemoveAvatar}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 border-4 border-dashed border-border rounded-xl flex items-center justify-center bg-muted/30">
                  <Dog size={48} className="text-muted-foreground" weight="duotone" />
                </div>
              )}
              
              <div className="flex-1 w-full">
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
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full md:w-auto"
                >
                  <UploadSimple size={20} className="mr-2" />
                  {petForm.avatar ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a photo of {pet.name}. Max 5MB, JPG or PNG format.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold text-white/90 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-pet-name" className="text-white/80">Pet Name *</Label>
                <Input
                  id="edit-pet-name"
                  value={petForm.name}
                  onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                  placeholder="Enter pet name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="edit-pet-breed" className="text-white/80">Breed *</Label>
                <Input
                  id="edit-pet-breed"
                  value={petForm.breed}
                  onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                  placeholder="Enter breed"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="edit-pet-size" className="text-white/80">Size</Label>
                <Select 
                  value={petForm.size} 
                  onValueChange={(value: 'small' | 'medium' | 'large') => setPetForm({ ...petForm, size: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold text-white/90 mb-4">Care Notes</h3>
            
            <div>
              <Label htmlFor="edit-pet-notes" className="text-white/80">
                Special Care Instructions
              </Label>
              <Textarea
                id="edit-pet-notes"
                value={petForm.notes}
                onChange={(e) => setPetForm({ ...petForm, notes: e.target.value })}
                placeholder="Any special care instructions, behavioral notes, medical conditions, or grooming preferences..."
                rows={6}
                className="mt-1.5"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Add any important information that groomers should know about {pet.name}.
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
              onClick={handleUpdatePet}
              size="lg"
              className="sm:w-auto w-full"
            >
              <FloppyDisk size={20} className="mr-2" weight="fill" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
