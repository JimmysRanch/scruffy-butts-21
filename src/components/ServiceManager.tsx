import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Clock, CurrencyDollar, Scissors } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  createdAt: string
}

export function ServiceManager() {
  const [services, setServices] = useKV<Service[]>('services', [])
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false)
  
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 50,
    category: 'Basic Grooming'
  })

  const handleCreateService = () => {
    if (!serviceForm.name || !serviceForm.description || serviceForm.duration <= 0 || serviceForm.price <= 0) {
      toast.error('Please fill in all required fields with valid values')
      return
    }

    const newService: Service = {
      id: `service-${Date.now()}`,
      name: serviceForm.name,
      description: serviceForm.description,
      duration: serviceForm.duration,
      price: serviceForm.price,
      category: serviceForm.category,
      createdAt: new Date().toISOString()
    }

    setServices((current) => [...(current || []), newService])
    toast.success('Service added successfully!')
    
    setServiceForm({
      name: '',
      description: '',
      duration: 60,
      price: 50,
      category: 'Basic Grooming'
    })
    setIsNewServiceOpen(false)
  }

  const deleteService = (serviceId: string) => {
    setServices((current) => (current || []).filter(service => service.id !== serviceId))
    toast.success('Service deleted successfully!')
  }

  const categories = ['Basic Grooming', 'Full Service', 'Add-ons', 'Premium Services']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground">
            Manage your grooming services, pricing, and duration
          </p>
        </div>
        
        <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus size={18} />
              <span>New Service</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Create a new grooming service for your business.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <Label htmlFor="service-description">Description</Label>
                <Textarea
                  id="service-description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Describe what's included in this service..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service-duration">Duration (minutes)</Label>
                  <Input
                    id="service-duration"
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 0 })}
                    placeholder="60"
                    min="15"
                    max="300"
                  />
                </div>

                <div>
                  <Label htmlFor="service-price">Price ($)</Label>
                  <Input
                    id="service-price"
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="50"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="service-category">Category</Label>
                <Input
                  id="service-category"
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                  placeholder="Enter category"
                />
              </div>

              <Button onClick={handleCreateService} className="w-full">
                Add Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(services || []).length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Scissors size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No services yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first grooming service to start building your service catalog
              </p>
              <Button onClick={() => setIsNewServiceOpen(true)}>
                Add First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          (services || [])
            .sort((a, b) => a.category.localeCompare(b.category))
            .map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Scissors size={20} className="text-accent" />
                    <span>{service.name}</span>
                  </CardTitle>
                  <CardDescription>{service.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock size={16} className="text-muted-foreground" />
                          <span>{service.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CurrencyDollar size={16} className="text-muted-foreground" />
                          <span className="font-medium">${service.price}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => deleteService(service.id)}
                    >
                      Delete Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
      
      {(services || []).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Service Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryServices = (services || []).filter(s => s.category === category)
              if (categoryServices.length === 0) return null
              
              return (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{categoryServices.length}</p>
                      <p className="text-xs text-muted-foreground">services</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}