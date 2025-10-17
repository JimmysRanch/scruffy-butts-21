import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from '@phosphor-icons/react'
import { toast } from 'sonner'

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
}

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
    <div className="space-y-4">
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

      <div className="glass-card rounded-[1.25rem] overflow-hidden">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white/90">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
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
              <Label htmlFor="customer-notes" className="text-white/70">Notes</Label>
              <Textarea
                id="customer-notes"
                value={customerForm.notes}
                onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                placeholder="Any additional notes about this client..."
                className="mt-1.5"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
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
        </CardContent>
      </div>
    </div>
  )
}
