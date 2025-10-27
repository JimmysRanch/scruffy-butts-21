import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { 
  Bell, 
  Clock, 
  CurrencyDollar, 
  MapPin, 
  Phone, 
  Envelope,
  FloppyDisk,
  PaintBrush,
  Shield,
  Users,
  Plus,
  Pencil,
  Trash,
  Scissors,
  Database,
  Warning,
  CalendarBlank,
  NotePencil
} from '@phosphor-icons/react'
import { StaffPosition } from './StaffManager'
import { seedShifts, seedTimeOffRequests } from '@/lib/seed-schedule-data'
import { seedReportsData } from '@/lib/seed-reports-data'
import { seedActivityData } from '@/lib/seed-activity-data'
import { ServiceWithPricing, PricingMethod, DEFAULT_SERVICES, WeightClass, WEIGHT_CLASSES } from '@/lib/pricing-types'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  createdAt: string
}

interface BusinessSettings {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  timezone: string
  currency: string
  taxRate: number
  defaultPricingMethod?: PricingMethod
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  appointmentReminders: boolean
  paymentConfirmations: boolean
  marketingEmails: boolean
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
  showWelcomeMessage: boolean
}

interface FormFieldConfig {
  id: string
  originalName: string
  customName: string
  isMandatory: boolean
  isVisible: boolean
  isCustom?: boolean
}

interface FormConfig {
  formName: string
  fields: FormFieldConfig[]
}

export function Settings() {
  const [businessSettings, setBusinessSettings] = useKV<BusinessSettings>('business-settings', {
    name: 'Scruffy Butts',
    email: 'contact@scruffybutts.com',
    phone: '+1 (555) 123-4567',
    address: '123 Pet Street',
    city: 'Austin',
    state: 'Texas',
    zip: '78701',
    timezone: 'America/Chicago',
    currency: 'USD',
    taxRate: 8.25,
    defaultPricingMethod: 'weight'
  })

  const [notifications, setNotifications] = useKV<NotificationSettings>('notification-settings', {
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    paymentConfirmations: true,
    marketingEmails: false
  })

  const [appearance, setAppearance] = useKV<AppearanceSettings>('appearance-settings', {
    theme: 'light',
    compactMode: false,
    showWelcomeMessage: true
  })

  const [formConfigs, setFormConfigs] = useKV<FormConfig[]>('form-configs', [
    {
      formName: 'Customer Form',
      fields: [
        { id: 'customer-name', originalName: 'Customer Name', customName: 'Customer Name', isMandatory: true, isVisible: true },
        { id: 'customer-email', originalName: 'Email', customName: 'Email', isMandatory: true, isVisible: true },
        { id: 'customer-phone', originalName: 'Phone', customName: 'Phone', isMandatory: true, isVisible: true },
        { id: 'customer-address', originalName: 'Address', customName: 'Address', isMandatory: false, isVisible: true },
      ]
    },
    {
      formName: 'Pet Form',
      fields: [
        { id: 'pet-name', originalName: 'Pet Name', customName: 'Pet Name', isMandatory: true, isVisible: true },
        { id: 'pet-breed', originalName: 'Breed', customName: 'Breed', isMandatory: true, isVisible: true },
        { id: 'pet-weight', originalName: 'Weight', customName: 'Weight', isMandatory: false, isVisible: true },
        { id: 'pet-age', originalName: 'Age', customName: 'Age', isMandatory: false, isVisible: true },
        { id: 'pet-notes', originalName: 'Special Notes', customName: 'Special Notes', isMandatory: false, isVisible: true },
      ]
    },
    {
      formName: 'Appointment Form',
      fields: [
        { id: 'appt-service', originalName: 'Service', customName: 'Service', isMandatory: true, isVisible: true },
        { id: 'appt-date', originalName: 'Date', customName: 'Date', isMandatory: true, isVisible: true },
        { id: 'appt-time', originalName: 'Time', customName: 'Time', isMandatory: true, isVisible: true },
        { id: 'appt-notes', originalName: 'Notes', customName: 'Notes', isMandatory: false, isVisible: true },
      ]
    }
  ])
  
  const [selectedFormIndex, setSelectedFormIndex] = useState(0)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  
  const [staffMembers, setStaffMembers] = useKV<any[]>('staff-members', [])
  const [shifts, setShifts] = useKV<any[]>('staff-shifts', [])
  const [timeOffRequests, setTimeOffRequests] = useKV<any[]>('time-off-requests', [])
  
  const [customers, setCustomers] = useKV<any[]>('customers', [])
  const [appointments, setAppointments] = useKV<any[]>('appointments', [])
  const [transactions, setTransactions] = useKV<any[]>('transactions', [])

  const [staffPositions, setStaffPositions] = useKV<StaffPosition[]>('staff-positions', [
    { id: 'owner', name: 'Owner', permissions: ['all'], description: 'Full access to all features' },
    { id: 'admin', name: 'Admin', permissions: ['manage_staff', 'manage_customers', 'manage_services', 'pos'], description: 'Administrative access' },
    { id: 'manager', name: 'Manager', permissions: ['manage_staff', 'manage_customers', 'pos'], description: 'Management level access' },
    { id: 'groomer', name: 'Groomer', permissions: ['view_appointments', 'manage_customers', 'pos'], description: 'Professional groomer' },
    { id: 'bather', name: 'Bather', permissions: ['view_appointments'], description: 'Bathing specialist' },
    { id: 'front_desk', name: 'Front Desk', permissions: ['manage_customers', 'view_appointments', 'pos'], description: 'Customer service representative' }
  ])

  const [services, setServices] = useKV<ServiceWithPricing[]>('services', [])

  const [activeTab, setActiveTab] = useState<'business' | 'services' | 'notifications' | 'appearance' | 'security' | 'staff-positions' | 'pricing' | 'forms'>('business')
  const [showPositionDialog, setShowPositionDialog] = useState(false)
  const [editingPosition, setEditingPosition] = useState<StaffPosition | null>(null)
  const [positionFormData, setPositionFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithPricing | null>(null)
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    category: 'Basic Grooming',
    pricingMethod: 'weight' as PricingMethod,
    basePrice: 0,
    weightPricing: {
      small: 0,
      medium: 0,
      large: 0,
      giant: 0
    }
  })

  const availablePermissions = [
    { id: 'all', label: 'All Permissions', description: 'Full access to everything' },
    { id: 'manage_staff', label: 'Manage Staff', description: 'Add, edit, and remove staff members' },
    { id: 'manage_customers', label: 'Manage Customers', description: 'Add, edit, and view customer information' },
    { id: 'manage_services', label: 'Manage Services', description: 'Add, edit, and remove services' },
    { id: 'view_appointments', label: 'View Appointments', description: 'View appointment schedules' },
    { id: 'manage_appointments', label: 'Manage Appointments', description: 'Create, edit, and cancel appointments' },
    { id: 'pos', label: 'Point of Sale', description: 'Process payments and sales' }
  ]

  const resetPositionForm = () => {
    setPositionFormData({
      name: '',
      description: '',
      permissions: []
    })
    setEditingPosition(null)
  }

  const handlePositionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!positionFormData.name || positionFormData.permissions.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    if (editingPosition) {
      setStaffPositions(currentPositions => 
        (currentPositions || []).map(p => 
          p.id === editingPosition.id
            ? {
                ...editingPosition,
                name: positionFormData.name,
                description: positionFormData.description,
                permissions: positionFormData.permissions
              }
            : p
        )
      )
      toast.success('Position updated successfully')
    } else {
      const newPosition: StaffPosition = {
        id: Date.now().toString(),
        name: positionFormData.name,
        description: positionFormData.description,
        permissions: positionFormData.permissions
      }

      setStaffPositions(currentPositions => [...(currentPositions || []), newPosition])
      toast.success('Position added successfully')
    }

    setShowPositionDialog(false)
    resetPositionForm()
  }

  const handleEditPosition = (position: StaffPosition) => {
    setEditingPosition(position)
    setPositionFormData({
      name: position.name,
      description: position.description || '',
      permissions: [...position.permissions]
    })
    setShowPositionDialog(true)
  }

  const handleDeletePosition = (id: string) => {
    setStaffPositions(currentPositions => (currentPositions || []).filter(p => p.id !== id))
    toast.success('Position deleted successfully')
  }

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (permissionId === 'all') {
      if (checked) {
        setPositionFormData(prev => ({ ...prev, permissions: ['all'] }))
      } else {
        setPositionFormData(prev => ({ ...prev, permissions: [] }))
      }
    } else {
      setPositionFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes('all')
          ? checked ? [permissionId] : []
          : checked
            ? [...prev.permissions, permissionId]
            : prev.permissions.filter(p => p !== permissionId)
      }))
    }
  }

  const resetServiceForm = () => {
    setServiceFormData({
      name: '',
      description: '',
      duration: 60,
      category: 'Basic Grooming',
      pricingMethod: 'weight',
      basePrice: 0,
      weightPricing: {
        small: 0,
        medium: 0,
        large: 0,
        giant: 0
      }
    })
    setEditingService(null)
  }

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!serviceFormData.name || !serviceFormData.description || serviceFormData.duration <= 0) {
      toast.error('Please fill in all required fields with valid values')
      return
    }

    if (editingService) {
      setServices(currentServices => 
        (currentServices || []).map(s => 
          s.id === editingService.id
            ? {
                ...editingService,
                name: serviceFormData.name,
                description: serviceFormData.description,
                duration: serviceFormData.duration,
                category: serviceFormData.category,
                pricingMethod: serviceFormData.pricingMethod,
                basePrice: serviceFormData.pricingMethod === 'service' ? serviceFormData.basePrice : undefined,
                weightPricing: serviceFormData.pricingMethod === 'weight' ? serviceFormData.weightPricing : undefined
              }
            : s
        )
      )
      toast.success('Service updated successfully')
    } else {
      const newService: ServiceWithPricing = {
        id: `service-${Date.now()}`,
        name: serviceFormData.name,
        description: serviceFormData.description,
        duration: serviceFormData.duration,
        category: serviceFormData.category,
        pricingMethod: serviceFormData.pricingMethod,
        basePrice: serviceFormData.pricingMethod === 'service' ? serviceFormData.basePrice : undefined,
        weightPricing: serviceFormData.pricingMethod === 'weight' ? serviceFormData.weightPricing : undefined,
        createdAt: new Date().toISOString()
      }

      setServices(currentServices => [...(currentServices || []), newService])
      toast.success('Service added successfully')
    }

    setShowServiceDialog(false)
    resetServiceForm()
  }

  const handleEditService = (service: ServiceWithPricing) => {
    setEditingService(service)
    setServiceFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      category: service.category,
      pricingMethod: service.pricingMethod,
      basePrice: service.basePrice || 0,
      weightPricing: service.weightPricing || {
        small: 0,
        medium: 0,
        large: 0,
        giant: 0
      }
    })
    setShowServiceDialog(true)
  }

  const handleDeleteService = (id: string) => {
    setServices(currentServices => (currentServices || []).filter(s => s.id !== id))
    toast.success('Service deleted successfully')
  }
  
  const handleSeedScheduleData = () => {
    if (!staffMembers || staffMembers.length === 0) {
      toast.error('Please add staff members first before seeding schedule data')
      return
    }
    
    const staffIds = staffMembers.map(s => s.id)
    const newShifts = seedShifts(staffIds)
    const newTimeOffRequests = seedTimeOffRequests(staffIds)
    
    setShifts(newShifts)
    setTimeOffRequests(newTimeOffRequests)
    
    toast.success(`Seeded ${newShifts.length} shifts and ${newTimeOffRequests.length} time off requests`)
  }
  
  const handleSeedReportsData = async () => {
    try {
      const data = await seedReportsData()
      
      // Transform staff data to match StaffMember interface
      const transformedStaff = data.staff.map((s: any) => {
        const nameParts = s.name.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        
        return {
          id: s.id,
          firstName,
          lastName,
          email: s.email,
          phone: s.phone,
          position: s.role,
          hireDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          address: '123 Staff Street',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
          specialties: s.specialties || [],
          notes: '',
          status: 'active' as const,
          rating: 4.5,
          canBeBooked: true,
          bookableServices: [],
          commissionEnabled: true,
          commissionPercent: s.commissionRate * 100,
          hourlyPayEnabled: true,
          hourlyRate: s.hourlyRate,
          salaryEnabled: false,
          salaryAmount: 0,
          weeklyGuaranteeEnabled: false,
          weeklyGuarantee: 0,
          guaranteePayoutMethod: 'both' as const,
          teamOverridesEnabled: false,
          teamOverrides: []
        }
      })
      
      const migratedServices = data.services.map(s => ({
        ...s,
        pricingMethod: 'service' as PricingMethod,
        basePrice: s.price,
        weightPricing: undefined,
        breedPricing: undefined
      }))
      
      // Set all the data
      setStaffMembers(transformedStaff)
      setServices(migratedServices)
      setCustomers(data.customers)
      setAppointments(data.appointments)
      setTransactions(data.transactions)
      
      // Provide detailed success message
      const totalPets = data.customers.reduce((sum: number, c: any) => sum + (c.pets?.length || 0), 0)
      const message = `Successfully seeded data!\n\n• ${transformedStaff.length} staff members\n• ${data.customers.length} customers with ${totalPets} pets\n• ${data.appointments.length} appointments\n• ${data.transactions.length} transactions\n\nNavigate to Clients, Staff, or Appointments to view the seeded data.`
      
      toast.success(message, { duration: 8000 })
    } catch (error) {
      toast.error('Failed to seed reports data. Please ensure you are running in a properly configured Spark environment.')
      console.error('Seed error:', error)
    }
  }

  const handleSeedActivityData = async () => {
    try {
      await seedActivityData()
      toast.success('Successfully seeded activity data!')
    } catch (error) {
      toast.error('Failed to seed activity data')
      console.error(error)
    }
  }

  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }

  const isCompact = appearance?.compactMode || false

  const tabs = [
    { id: 'business' as const, label: 'Business', icon: MapPin },
    { id: 'services' as const, label: 'Services', icon: Scissors },
    { id: 'staff-positions' as const, label: 'Staff Positions', icon: Users },
    { id: 'forms' as const, label: 'Forms', icon: NotePencil },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: PaintBrush },
    { id: 'security' as const, label: 'Security', icon: Shield }
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-foreground text-xl">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your grooming business preferences and configurations</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2 h-8 text-xs">
          <FloppyDisk size={16} />
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        {/* Sidebar Navigation */}
        <div className="lg:w-56">
          <Card>
            <CardContent className="p-3">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'business' && (
            <Card>
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin size={18} />
                  Business Information
                </CardTitle>
                <CardDescription className="text-xs">
                  Update your business details and operational settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="business-name" className="text-xs">Business Name</Label>
                    <Input
                      id="business-name"
                      value={businessSettings?.name || ''}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev!, name: e.target.value }))}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="business-email" className="text-xs">Email Address</Label>
                    <Input
                      id="business-email"
                      type="email"
                      value={businessSettings?.email || ''}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev!, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-phone">Phone Number</Label>
                    <Input
                      id="business-phone"
                      value={businessSettings?.phone || ''}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev!, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-address">Business Address</Label>
                    <Input
                      id="business-address"
                      value={businessSettings?.address || ''}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev!, address: e.target.value }))}
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-city">City</Label>
                    <Input
                      id="business-city"
                      value={businessSettings?.city || ''}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev!, city: e.target.value }))}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-state">State</Label>
                    <Select
                      value={businessSettings?.state || 'Texas'}
                      onValueChange={(value) => setBusinessSettings(prev => ({ ...prev!, state: value }))}
                    >
                      <SelectTrigger id="business-state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alabama">Alabama</SelectItem>
                        <SelectItem value="Alaska">Alaska</SelectItem>
                        <SelectItem value="Arizona">Arizona</SelectItem>
                        <SelectItem value="Arkansas">Arkansas</SelectItem>
                        <SelectItem value="California">California</SelectItem>
                        <SelectItem value="Colorado">Colorado</SelectItem>
                        <SelectItem value="Connecticut">Connecticut</SelectItem>
                        <SelectItem value="Delaware">Delaware</SelectItem>
                        <SelectItem value="Florida">Florida</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Hawaii">Hawaii</SelectItem>
                        <SelectItem value="Idaho">Idaho</SelectItem>
                        <SelectItem value="Illinois">Illinois</SelectItem>
                        <SelectItem value="Indiana">Indiana</SelectItem>
                        <SelectItem value="Iowa">Iowa</SelectItem>
                        <SelectItem value="Kansas">Kansas</SelectItem>
                        <SelectItem value="Kentucky">Kentucky</SelectItem>
                        <SelectItem value="Louisiana">Louisiana</SelectItem>
                        <SelectItem value="Maine">Maine</SelectItem>
                        <SelectItem value="Maryland">Maryland</SelectItem>
                        <SelectItem value="Massachusetts">Massachusetts</SelectItem>
                        <SelectItem value="Michigan">Michigan</SelectItem>
                        <SelectItem value="Minnesota">Minnesota</SelectItem>
                        <SelectItem value="Mississippi">Mississippi</SelectItem>
                        <SelectItem value="Missouri">Missouri</SelectItem>
                        <SelectItem value="Montana">Montana</SelectItem>
                        <SelectItem value="Nebraska">Nebraska</SelectItem>
                        <SelectItem value="Nevada">Nevada</SelectItem>
                        <SelectItem value="New Hampshire">New Hampshire</SelectItem>
                        <SelectItem value="New Jersey">New Jersey</SelectItem>
                        <SelectItem value="New Mexico">New Mexico</SelectItem>
                        <SelectItem value="New York">New York</SelectItem>
                        <SelectItem value="North Carolina">North Carolina</SelectItem>
                        <SelectItem value="North Dakota">North Dakota</SelectItem>
                        <SelectItem value="Ohio">Ohio</SelectItem>
                        <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                        <SelectItem value="Oregon">Oregon</SelectItem>
                        <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                        <SelectItem value="Rhode Island">Rhode Island</SelectItem>
                        <SelectItem value="South Carolina">South Carolina</SelectItem>
                        <SelectItem value="South Dakota">South Dakota</SelectItem>
                        <SelectItem value="Tennessee">Tennessee</SelectItem>
                        <SelectItem value="Texas">Texas</SelectItem>
                        <SelectItem value="Utah">Utah</SelectItem>
                        <SelectItem value="Vermont">Vermont</SelectItem>
                        <SelectItem value="Virginia">Virginia</SelectItem>
                        <SelectItem value="Washington">Washington</SelectItem>
                        <SelectItem value="West Virginia">West Virginia</SelectItem>
                        <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                        <SelectItem value="Wyoming">Wyoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-zip">Zip Code</Label>
                    <Input
                      id="business-zip"
                      value={businessSettings?.zip || ''}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev!, zip: e.target.value }))}
                      placeholder="Zip code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={businessSettings?.timezone || 'America/New_York'}
                      onValueChange={(value) => setBusinessSettings(prev => ({ ...prev!, timezone: value }))}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={businessSettings?.currency || 'USD'}
                      onValueChange={(value) => setBusinessSettings(prev => ({ ...prev!, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="CAD">Canadian Dollar (CA$)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      step="0.01"
                      value={businessSettings?.taxRate || 0}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev!, taxRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'services' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Scissors size={20} />
                      Services Management
                    </CardTitle>
                    <CardDescription>
                      Manage your grooming services, pricing, and duration
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {(services || []).length === 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const defaultServices: ServiceWithPricing[] = DEFAULT_SERVICES.map((s, i) => ({
                            ...s,
                            id: `service-default-${i}`,
                            createdAt: new Date().toISOString()
                          }))
                          setServices(defaultServices)
                          toast.success('Default Scruffy Butts services loaded!')
                        }} 
                        className="flex items-center gap-2"
                      >
                        <Database size={18} />
                        Load Default Services
                      </Button>
                    )}
                    <Button onClick={() => setShowServiceDialog(true)} className="flex items-center gap-2">
                      <Plus size={18} />
                      Add Service
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label htmlFor="default-pricing">Default Pricing Method</Label>
                  <Select
                    value={businessSettings?.defaultPricingMethod || 'weight'}
                    onValueChange={(value: PricingMethod) => setBusinessSettings(prev => ({ ...prev!, defaultPricingMethod: value }))}
                  >
                    <SelectTrigger id="default-pricing">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight-Based Pricing</SelectItem>
                      <SelectItem value="service">Flat Rate Pricing</SelectItem>
                      <SelectItem value="breed">Breed-Based Pricing</SelectItem>
                      <SelectItem value="hybrid">Hybrid Pricing</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be the default pricing method when creating new services
                  </p>
                </div>

                <Separator className="mb-6" />

                {(services || []).length === 0 ? (
                  <div className="text-center py-12">
                    <Scissors size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No services yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Load the default Scruffy Butts services or add your first grooming service
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const defaultServices: ServiceWithPricing[] = DEFAULT_SERVICES.map((s, i) => ({
                            ...s,
                            id: `service-default-${i}`,
                            createdAt: new Date().toISOString()
                          }))
                          setServices(defaultServices)
                          toast.success('Default Scruffy Butts services loaded!')
                        }}
                      >
                        <Database size={18} className="mr-2" />
                        Load Default Services
                      </Button>
                      <Button onClick={() => setShowServiceDialog(true)}>
                        <Plus size={18} className="mr-2" />
                        Add Custom Service
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(services || [])
                      .sort((a, b) => a.category.localeCompare(b.category))
                      .map((service) => (
                        <div key={service.id} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{service.name}</h4>
                              <Badge variant="outline" className="text-xs">{service.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                            <div className="flex items-center gap-4 text-sm flex-wrap">
                              <div className="flex items-center gap-1">
                                <Clock size={16} className="text-muted-foreground" />
                                <span>{service.duration} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary">{service.pricingMethod}</Badge>
                              </div>
                              {service.pricingMethod === 'service' && service.basePrice && (
                                <div className="flex items-center gap-1">
                                  <CurrencyDollar size={16} className="text-muted-foreground" />
                                  <span className="font-medium">${service.basePrice}</span>
                                </div>
                              )}
                              {service.pricingMethod === 'weight' && service.weightPricing && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span>S: ${service.weightPricing.small}</span>
                                  <span>M: ${service.weightPricing.medium}</span>
                                  <span>L: ${service.weightPricing.large}</span>
                                  <span>XL: ${service.weightPricing.giant}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditService(service)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'staff-positions' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users size={20} />
                      Staff Positions
                    </CardTitle>
                    <CardDescription>
                      Manage staff positions and their permissions
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowPositionDialog(true)} className="flex items-center gap-2">
                    <Plus size={18} />
                    Add Position
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(staffPositions || []).map((position) => (
                    <div key={position.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{position.name}</h4>
                        {position.description && (
                          <p className="text-sm text-muted-foreground mt-1">{position.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {position.permissions.includes('all') ? (
                            <Badge variant="default">All Permissions</Badge>
                          ) : (
                            position.permissions.map((permission) => {
                              const permissionInfo = availablePermissions.find(p => p.id === permission)
                              return (
                                <Badge key={permission} variant="outline">
                                  {permissionInfo?.label || permission}
                                </Badge>
                              )
                            })
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPosition(position)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePosition(position.id)}
                          disabled={position.id === 'owner'}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how and when you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Envelope size={16} />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive general notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications?.emailNotifications || false}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev!, emailNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Phone size={16} />
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive urgent notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={notifications?.smsNotifications || false}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev!, smsNotifications: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Clock size={16} />
                        Appointment Reminders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Send reminders for upcoming appointments
                      </p>
                    </div>
                    <Switch
                      checked={notifications?.appointmentReminders || false}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev!, appointmentReminders: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <CurrencyDollar size={16} />
                        Payment Confirmations
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Send confirmations for completed payments
                      </p>
                    </div>
                    <Switch
                      checked={notifications?.paymentConfirmations || false}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev!, paymentConfirmations: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive product updates and promotional content
                      </p>
                    </div>
                    <Switch
                      checked={notifications?.marketingEmails || false}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev!, marketingEmails: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PaintBrush size={20} />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={appearance?.theme || 'light'}
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        setAppearance(prev => ({ ...prev!, theme: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use smaller spacing and components for more content
                      </p>
                    </div>
                    <Switch
                      checked={appearance?.compactMode || false}
                      onCheckedChange={(checked) => setAppearance(prev => ({ ...prev!, compactMode: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Welcome Message</Label>
                      <p className="text-sm text-muted-foreground">
                        Show welcome message on dashboard
                      </p>
                    </div>
                    <Switch
                      checked={appearance?.showWelcomeMessage || false}
                      onCheckedChange={(checked) => setAppearance(prev => ({ ...prev!, showWelcomeMessage: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Password</Label>
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Update your password to keep your account secure
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Data Export</Label>
                    <Button variant="outline" className="w-full justify-start">
                      Download My Data
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Export all your data in a portable format
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label>Schedule Data</Label>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleSeedScheduleData}
                    >
                      <CalendarBlank size={16} className="mr-2" />
                      Seed Schedule Data
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Generate sample shifts and time off requests for testing
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Reports Data</Label>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleSeedReportsData}
                    >
                      <Database size={16} className="mr-2" />
                      Seed Reports Data
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Generate sample appointments and transactions for performance reports
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Activity Data</Label>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleSeedActivityData}
                    >
                      <NotePencil size={16} className="mr-2" />
                      Seed Activity Data
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Generate sample activity logs for the Recent Activity widget
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'forms' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <NotePencil size={20} />
                  Form Customization
                </CardTitle>
                <CardDescription>
                  Customize form fields for different parts of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Select Form</Label>
                    <Select 
                      value={selectedFormIndex.toString()} 
                      onValueChange={(value) => setSelectedFormIndex(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(formConfigs || []).map((form, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {form.formName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {formConfigs && formConfigs[selectedFormIndex] && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Form Fields</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!formConfigs || !formConfigs[selectedFormIndex]) return
                            const currentForm = formConfigs[selectedFormIndex]
                            const customFieldCount = currentForm.fields.filter(f => f.isCustom).length
                            if (customFieldCount >= 2) {
                              toast.error('Maximum 2 custom fields allowed per form')
                              return
                            }
                            const newField: FormFieldConfig = {
                              id: `custom-${Date.now()}`,
                              originalName: 'Custom Field',
                              customName: 'Custom Field',
                              isMandatory: false,
                              isVisible: true,
                              isCustom: true
                            }
                            const updatedConfigs = [...formConfigs]
                            updatedConfigs[selectedFormIndex].fields.push(newField)
                            setFormConfigs(updatedConfigs)
                            toast.success('Custom field added')
                          }}
                          disabled={(formConfigs[selectedFormIndex]?.fields.filter(f => f.isCustom).length || 0) >= 2}
                        >
                          <Plus size={16} className="mr-1" />
                          Add Custom Field
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {formConfigs[selectedFormIndex].fields.map((field, fieldIndex) => (
                          <div key={field.id} className="p-3 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 space-y-2">
                                {editingFieldId === field.id ? (
                                  <Input
                                    value={field.customName}
                                    onChange={(e) => {
                                      if (!formConfigs || !formConfigs[selectedFormIndex]) return
                                      const updatedConfigs = [...formConfigs]
                                      if (!updatedConfigs[selectedFormIndex].fields[fieldIndex]) return
                                      updatedConfigs[selectedFormIndex].fields[fieldIndex].customName = e.target.value
                                      setFormConfigs(updatedConfigs)
                                    }}
                                    onBlur={() => setEditingFieldId(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') setEditingFieldId(null)
                                    }}
                                    autoFocus
                                    className="font-medium"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{field.customName}</span>
                                    {field.originalName !== field.customName && (
                                      <Badge variant="secondary" className="text-xs">
                                        was: {field.originalName}
                                      </Badge>
                                    )}
                                    {field.isCustom && (
                                      <Badge variant="outline" className="text-xs">Custom</Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingFieldId(field.id)}
                                >
                                  <Pencil size={16} />
                                </Button>
                                {field.isCustom && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      if (!formConfigs || !formConfigs[selectedFormIndex]) return
                                      const updatedConfigs = [...formConfigs]
                                      updatedConfigs[selectedFormIndex].fields = updatedConfigs[selectedFormIndex].fields.filter(f => f.id !== field.id)
                                      setFormConfigs(updatedConfigs)
                                      toast.success('Field removed')
                                    }}
                                  >
                                    <Trash size={16} />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`${field.id}-mandatory`}
                                  checked={field.isMandatory}
                                  onCheckedChange={(checked) => {
                                    if (!formConfigs || !formConfigs[selectedFormIndex]) return
                                    const updatedConfigs = [...formConfigs]
                                    if (!updatedConfigs[selectedFormIndex].fields[fieldIndex]) return
                                    updatedConfigs[selectedFormIndex].fields[fieldIndex].isMandatory = !!checked
                                    setFormConfigs(updatedConfigs)
                                  }}
                                />
                                <Label htmlFor={`${field.id}-mandatory`} className="text-sm font-normal cursor-pointer">
                                  Mandatory
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`${field.id}-visible`}
                                  checked={field.isVisible}
                                  onCheckedChange={(checked) => {
                                    if (!formConfigs || !formConfigs[selectedFormIndex]) return
                                    const updatedConfigs = [...formConfigs]
                                    if (!updatedConfigs[selectedFormIndex].fields[fieldIndex]) return
                                    updatedConfigs[selectedFormIndex].fields[fieldIndex].isVisible = !!checked
                                    setFormConfigs(updatedConfigs)
                                  }}
                                />
                                <Label htmlFor={`${field.id}-visible`} className="text-sm font-normal cursor-pointer">
                                  Visible
                                </Label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Alert>
                        <AlertDescription className="text-sm">
                          You can rename fields, toggle their mandatory status, hide them, or add up to 2 custom text fields per form.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showPositionDialog} onOpenChange={setShowPositionDialog}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handlePositionSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingPosition ? 'Edit Staff Position' : 'Add New Staff Position'}
              </DialogTitle>
              <DialogDescription>
                {editingPosition 
                  ? 'Update the position details and permissions'
                  : 'Create a new staff position with specific permissions'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="position-name">Position Name *</Label>
                <Input
                  id="position-name"
                  value={positionFormData.name}
                  onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
                  placeholder="e.g., Senior Groomer, Assistant Manager"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position-description">Description</Label>
                <Textarea
                  id="position-description"
                  value={positionFormData.description}
                  onChange={(e) => setPositionFormData({ ...positionFormData, description: e.target.value })}
                  placeholder="Brief description of this position"
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>Permissions *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={positionFormData.permissions.includes(permission.id) || positionFormData.permissions.includes('all')}
                        disabled={permission.id !== 'all' && positionFormData.permissions.includes('all')}
                        onCheckedChange={(checked) => handlePermissionToggle(permission.id, !!checked)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={`permission-${permission.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowPositionDialog(false)
                  resetPositionForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingPosition ? 'Update Position' : 'Add Position'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleServiceSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
              <DialogDescription>
                {editingService 
                  ? 'Update the service details'
                  : 'Create a new grooming service for your business'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name *</Label>
                <Input
                  id="service-name"
                  value={serviceFormData.name}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  placeholder="e.g., Full Grooming Package"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-description">Description *</Label>
                <Textarea
                  id="service-description"
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  placeholder="Describe what's included in this service..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-duration">Duration (minutes) *</Label>
                  <Input
                    id="service-duration"
                    type="number"
                    value={serviceFormData.duration}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, duration: parseInt(e.target.value) || 0 })}
                    placeholder="60"
                    min="15"
                    max="300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-category">Category *</Label>
                  <Input
                    id="service-category"
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    placeholder="e.g., Basic Grooming"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing-method">Pricing Method *</Label>
                <Select
                  value={serviceFormData.pricingMethod}
                  onValueChange={(value: PricingMethod) => setServiceFormData({ ...serviceFormData, pricingMethod: value })}
                >
                  <SelectTrigger id="pricing-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Weight-Based</SelectItem>
                    <SelectItem value="service">Flat Rate</SelectItem>
                    <SelectItem value="breed">Breed-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {serviceFormData.pricingMethod === 'service' && (
                <div className="space-y-2">
                  <Label htmlFor="base-price">Base Price ($) *</Label>
                  <Input
                    id="base-price"
                    type="number"
                    value={serviceFormData.basePrice}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, basePrice: parseFloat(e.target.value) || 0 })}
                    placeholder="50.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              )}

              {serviceFormData.pricingMethod === 'weight' && (
                <div className="space-y-3">
                  <Label>Weight-Based Pricing ($) *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="price-small" className="text-xs">{WEIGHT_CLASSES.small.label}</Label>
                      <Input
                        id="price-small"
                        type="number"
                        value={serviceFormData.weightPricing.small}
                        onChange={(e) => setServiceFormData({ 
                          ...serviceFormData, 
                          weightPricing: { ...serviceFormData.weightPricing, small: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="30"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price-medium" className="text-xs">{WEIGHT_CLASSES.medium.label}</Label>
                      <Input
                        id="price-medium"
                        type="number"
                        value={serviceFormData.weightPricing.medium}
                        onChange={(e) => setServiceFormData({ 
                          ...serviceFormData, 
                          weightPricing: { ...serviceFormData.weightPricing, medium: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="35"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price-large" className="text-xs">{WEIGHT_CLASSES.large.label}</Label>
                      <Input
                        id="price-large"
                        type="number"
                        value={serviceFormData.weightPricing.large}
                        onChange={(e) => setServiceFormData({ 
                          ...serviceFormData, 
                          weightPricing: { ...serviceFormData.weightPricing, large: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="40"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price-giant" className="text-xs">{WEIGHT_CLASSES.giant.label}</Label>
                      <Input
                        id="price-giant"
                        type="number"
                        value={serviceFormData.weightPricing.giant}
                        onChange={(e) => setServiceFormData({ 
                          ...serviceFormData, 
                          weightPricing: { ...serviceFormData.weightPricing, giant: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="45"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowServiceDialog(false)
                  resetServiceForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingService ? 'Update Service' : 'Add Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}