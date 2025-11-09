import { useState } from 'react'
import { useKV } from '@/lib/useKV'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus, UserCircle, Phone, EnvelopeSimple, MapPin, Calendar, Star, Scissors, ArrowLeft, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { StaffSchedule } from './StaffSchedule'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  createdAt: string
}

export interface StaffPosition {
  id: string
  name: string
  permissions: string[]
  description?: string
}

export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  hireDate: string
  address: string
  city: string
  state: string
  zip: string
  specialties: string[]
  notes: string
  status: 'active' | 'inactive'
  rating: number
  canBeBooked: boolean
  bookableServices: string[]
  // Compensation fields
  commissionEnabled: boolean
  commissionPercent: number
  hourlyPayEnabled: boolean
  hourlyRate: number
  salaryEnabled: boolean
  salaryAmount: number
  weeklyGuaranteeEnabled: boolean
  weeklyGuarantee: number
  guaranteePayoutMethod: 'both' | 'higher'
  teamOverridesEnabled: boolean
  teamOverrides: Array<{ staffId: string; overridePercent: number }>
}

interface StaffProfileProps {
  staff: StaffMember
  onBack: () => void
  onEdit: (staff: StaffMember) => void
}

function StaffProfile({ staff, onBack, onEdit }: StaffProfileProps) {
  const [services] = useKV<Service[]>('services', [])
  
  const bookableServiceNames = (services || [])
    .filter(s => staff.bookableServices?.includes(s.id))
    .map(s => s.name)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Staff List
        </Button>
        <Button onClick={() => onEdit(staff)}>
          Edit Profile
        </Button>
      </div>

      <div className="glass-card rounded-[1.25rem] overflow-hidden transition-all duration-500 hover:scale-[1.005]">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-accent/25 flex items-center justify-center ring-1 ring-accent/40 shadow-[0_0_12px_oklch(0.65_0.22_310/0.3)]">
              <UserCircle size={48} className="text-accent" weight="duotone" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white/90">{staff.firstName} {staff.lastName}</h2>
              <p className="text-lg text-white/60 font-medium">{staff.position}</p>
              <div className="flex items-center mt-2 gap-3">
                <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                  {staff.status}
                </Badge>
                {staff.canBeBooked !== false && (
                  <Badge variant="outline" className="bg-primary/25 text-primary-foreground border-primary/30 ring-1 ring-primary/20">
                    Bookable
                  </Badge>
                )}
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-400 mr-1 drop-shadow-[0_0_8px_oklch(0.80_0.15_80)]" weight="fill" />
                  <span className="text-sm font-semibold text-white/90">{staff.rating}/5</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white/80">
                <EnvelopeSimple size={18} className="text-white/60" weight="duotone" />
                <span className="font-medium">{staff.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <Phone size={18} className="text-white/60" weight="duotone" />
                <span className="font-medium">{staff.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <MapPin size={18} className="text-white/60" weight="duotone" />
                <span className="font-medium">
                  {staff.address && <>{staff.address}, </>}
                  {staff.city}{staff.city && (staff.state || staff.zip) ? ', ' : ''}{staff.state} {staff.zip}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <Calendar size={18} className="text-white/60" weight="duotone" />
                <span className="font-medium">Hired: {new Date(staff.hireDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-white/90">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {staff.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="bg-white/10 border-white/20">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {staff.canBeBooked !== false && bookableServiceNames.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-white/90">
                    <Scissors size={16} weight="duotone" />
                    Bookable Services
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {bookableServiceNames.map((serviceName, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/25 text-primary-foreground ring-1 ring-primary/20">
                        {serviceName}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-white/60 mt-2 font-medium">
                    This staff member can be booked for {bookableServiceNames.length} service{bookableServiceNames.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              {staff.canBeBooked === false && (
                <div>
                  <h4 className="font-semibold mb-2 text-white/90">Booking Status</h4>
                  <Badge variant="outline" className="bg-white/10 border-white/20">
                    Not available for booking
                  </Badge>
                  <p className="text-xs text-white/60 mt-2 font-medium">
                    This staff member is only scheduled for office work
                  </p>
                </div>
              )}
              
              {staff.notes && (
                <div>
                  <h4 className="font-semibold mb-2 text-white/90">Notes</h4>
                  <p className="text-sm text-white/70 bg-white/5 p-3 rounded-lg border border-white/10 font-medium">
                    {staff.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export function StaffManager() {
  const [staff, setStaff] = useKV<StaffMember[]>('staff-members', [])
  const [services] = useKV<Service[]>('services', [])
  const [appearance] = useKV<{ compactMode?: boolean }>('appearance-settings', {})
  const [staffPositions] = useKV<StaffPosition[]>('staff-positions', [
    { id: 'owner', name: 'Owner', permissions: ['all'], description: 'Full access to all features' },
    { id: 'admin', name: 'Admin', permissions: ['manage_staff', 'manage_customers', 'manage_services', 'view_reports', 'pos'], description: 'Administrative access' },
    { id: 'manager', name: 'Manager', permissions: ['manage_staff', 'manage_customers', 'view_reports', 'pos'], description: 'Management level access' },
    { id: 'groomer', name: 'Groomer', permissions: ['view_appointments', 'manage_customers', 'pos'], description: 'Professional groomer' },
    { id: 'bather', name: 'Bather', permissions: ['view_appointments'], description: 'Bathing specialist' },
    { id: 'front_desk', name: 'Front Desk', permissions: ['manage_customers', 'view_appointments', 'pos'], description: 'Customer service representative' }
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [currentTab, setCurrentTab] = useState('staff')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    hireDate: '',
    address: '',
    city: '',
    state: 'Texas',
    zip: '',
    specialties: '',
    notes: '',
    status: 'active' as 'active' | 'inactive',
    rating: 5,
    canBeBooked: true,
    bookableServices: [] as string[],
    // Compensation fields
    commissionEnabled: false,
    commissionPercent: 50,
    hourlyPayEnabled: false,
    hourlyRate: 0,
    salaryEnabled: false,
    salaryAmount: 0,
    weeklyGuaranteeEnabled: false,
    weeklyGuarantee: 0,
    guaranteePayoutMethod: 'higher' as 'both' | 'higher',
    teamOverridesEnabled: false,
    teamOverrides: [] as Array<{ staffId: string; overridePercent: number }>
  })

  const isCompact = appearance?.compactMode || false

  const getDefaultBookableServices = (position: string): string[] => {
    const allServiceIds = (services || []).map(s => s.id)
    
    switch(position.toLowerCase()) {
      case 'groomer':
        return allServiceIds
      case 'bather':
        const bathServices = (services || [])
          .filter(s => 
            s.name.toLowerCase().includes('bath') || 
            s.name.toLowerCase().includes('nail') ||
            s.name.toLowerCase().includes('teeth')
          )
          .map(s => s.id)
        return bathServices
      case 'owner':
      case 'admin':
        return allServiceIds
      default:
        return []
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      hireDate: '',
      address: '',
      city: '',
      state: 'Texas',
      zip: '',
      specialties: '',
      notes: '',
      status: 'active' as 'active' | 'inactive',
      rating: 5,
      canBeBooked: true,
      bookableServices: [],
      // Compensation fields
      commissionEnabled: false,
      commissionPercent: 50,
      hourlyPayEnabled: false,
      hourlyRate: 0,
      salaryEnabled: false,
      salaryAmount: 0,
      weeklyGuaranteeEnabled: false,
      weeklyGuarantee: 0,
      guaranteePayoutMethod: 'higher' as 'both' | 'higher',
      teamOverridesEnabled: false,
      teamOverrides: []
    })
    setEditingStaff(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.position) {
      toast.error('Please fill in all required fields')
      return
    }

    const specialtiesArray = formData.specialties
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    if (editingStaff) {
      setStaff(currentStaff => 
        (currentStaff || []).map(s => 
          s.id === editingStaff.id
            ? {
                ...editingStaff,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                position: formData.position,
                hireDate: formData.hireDate,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                notes: formData.notes,
                status: formData.status,
                rating: formData.rating,
                specialties: specialtiesArray,
                canBeBooked: formData.canBeBooked,
                bookableServices: formData.bookableServices,
                commissionEnabled: formData.commissionEnabled,
                commissionPercent: formData.commissionPercent,
                hourlyPayEnabled: formData.hourlyPayEnabled,
                hourlyRate: formData.hourlyRate,
                salaryEnabled: formData.salaryEnabled,
                salaryAmount: formData.salaryAmount,
                weeklyGuaranteeEnabled: formData.weeklyGuaranteeEnabled,
                weeklyGuarantee: formData.weeklyGuarantee,
                guaranteePayoutMethod: formData.guaranteePayoutMethod,
                teamOverridesEnabled: formData.teamOverridesEnabled,
                teamOverrides: formData.teamOverrides
              }
            : s
        )
      )
      toast.success('Staff member updated successfully')
    } else {
      const currentDate = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
      const newStaff: StaffMember = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        hireDate: currentDate,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        notes: formData.notes,
        status: formData.status,
        rating: formData.rating,
        specialties: specialtiesArray,
        canBeBooked: formData.canBeBooked,
        bookableServices: formData.bookableServices,
        commissionEnabled: formData.commissionEnabled,
        commissionPercent: formData.commissionPercent,
        hourlyPayEnabled: formData.hourlyPayEnabled,
        hourlyRate: formData.hourlyRate,
        salaryEnabled: formData.salaryEnabled,
        salaryAmount: formData.salaryAmount,
        weeklyGuaranteeEnabled: formData.weeklyGuaranteeEnabled,
        weeklyGuarantee: formData.weeklyGuarantee,
        guaranteePayoutMethod: formData.guaranteePayoutMethod,
        teamOverridesEnabled: formData.teamOverridesEnabled,
        teamOverrides: formData.teamOverrides
      }

      setStaff(currentStaff => [...(currentStaff || []), newStaff])
      toast.success('Staff member added successfully')
    }

    setShowForm(false)
    resetForm()
  }

  const handleEdit = (staffMember: StaffMember) => {
    setEditingStaff(staffMember)
    setFormData({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email,
      phone: staffMember.phone,
      position: staffMember.position,
      hireDate: staffMember.hireDate,
      address: staffMember.address,
      city: staffMember.city,
      state: staffMember.state,
      zip: staffMember.zip,
      specialties: staffMember.specialties.join(', '),
      notes: staffMember.notes,
      status: staffMember.status,
      rating: staffMember.rating,
      canBeBooked: staffMember.canBeBooked ?? true,
      bookableServices: staffMember.bookableServices ?? [],
      commissionEnabled: staffMember.commissionEnabled ?? false,
      commissionPercent: staffMember.commissionPercent ?? 50,
      hourlyPayEnabled: staffMember.hourlyPayEnabled ?? false,
      hourlyRate: staffMember.hourlyRate ?? 0,
      salaryEnabled: staffMember.salaryEnabled ?? false,
      salaryAmount: staffMember.salaryAmount ?? 0,
      weeklyGuaranteeEnabled: staffMember.weeklyGuaranteeEnabled ?? false,
      weeklyGuarantee: staffMember.weeklyGuarantee ?? 0,
      guaranteePayoutMethod: staffMember.guaranteePayoutMethod ?? 'higher',
      teamOverridesEnabled: staffMember.teamOverridesEnabled ?? false,
      teamOverrides: staffMember.teamOverrides ?? []
    })
    setSelectedStaff(null)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setStaff(currentStaff => (currentStaff || []).filter(s => s.id !== id))
    toast.success('Staff member removed')
  }

  const handleStaffClick = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember)
  }

  const handleBackToList = () => {
    setSelectedStaff(null)
  }

  if (selectedStaff) {
    return (
      <StaffProfile
        staff={selectedStaff}
        onBack={handleBackToList}
        onEdit={handleEdit}
      />
    )
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <Card className="frosted">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </CardTitle>
                <CardDescription className="mt-1">
                  {editingStaff 
                    ? 'Update the staff member information below'
                    : 'Enter the details for the new team member'
                  }
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="glass-button"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name *</Label>
                  <Input
                    id="first-name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="glass-dark"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name *</Label>
                  <Input
                    id="last-name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="glass-dark"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="glass-dark"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-dark"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    <div className="flex-1 min-w-0 space-y-2">
                      <Label htmlFor="position">Position *</Label>
                      <Select
                        value={formData.position}
                        onValueChange={(value) => setFormData({ ...formData, position: value })}
                      >
                        <SelectTrigger id="position" className="glass-dark w-full">
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffPositions?.map((position) => (
                            <SelectItem key={position.id} value={position.name}>
                              <div className="flex flex-col">
                                <span>{position.name}</span>
                                {position.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {position.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger id="status" className="glass-dark w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address"
                    className="glass-dark"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="glass-dark"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    <div className="flex-1 min-w-0 space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => setFormData({ ...formData, state: value })}
                      >
                        <SelectTrigger id="state" className="glass-dark w-full">
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

                    <div className="flex-1 min-w-0 space-y-2">
                      <Label htmlFor="zip">Zip Code</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        placeholder="Zip code"
                        className="glass-dark h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3 p-4 rounded-lg border border-border glass-dark">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="can-be-booked" className="text-base font-semibold">
                        Booking Availability
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow this staff member to be booked for appointments
                      </p>
                    </div>
                    <Switch
                      id="can-be-booked"
                      checked={formData.canBeBooked}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, canBeBooked: checked })
                        if (!checked) {
                          setFormData({ ...formData, canBeBooked: checked, bookableServices: [] })
                        } else if (formData.position) {
                          const defaultServices = getDefaultBookableServices(formData.position)
                          setFormData({ ...formData, canBeBooked: checked, bookableServices: defaultServices })
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about the staff member"
                    rows={3}
                    className="glass-dark"
                  />
                </div>

                {/* Compensation Section */}
                <div className="md:col-span-2 space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Compensation</h3>
                  <p className="text-sm text-muted-foreground">
                    Combine hourly pay, commission, guarantee, and team overrides to match how this team member earns.
                  </p>

                  {/* Commission on personal grooms */}
                  <div className="space-y-3 p-4 rounded-lg border border-border glass-dark">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-semibold">Commission on personal grooms</Label>
                        <p className="text-sm text-muted-foreground">
                          Pay a percentage of every dog this staff member personally grooms.
                        </p>
                      </div>
                      <Switch
                        checked={formData.commissionEnabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, commissionEnabled: checked })}
                      />
                    </div>
                    {formData.commissionEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="commission-percent">Commission %</Label>
                        <Input
                          id="commission-percent"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.commissionPercent}
                          onChange={(e) => setFormData({ ...formData, commissionPercent: parseFloat(e.target.value) || 0 })}
                          className="glass-dark"
                        />
                      </div>
                    )}
                  </div>

                  {/* Hourly pay */}
                  <div className="space-y-3 p-4 rounded-lg border border-border glass-dark">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-semibold">Hourly pay</Label>
                        <p className="text-sm text-muted-foreground">
                          Guarantee an hourly base rate in addition to any other earnings.
                        </p>
                      </div>
                      <Switch
                        checked={formData.hourlyPayEnabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, hourlyPayEnabled: checked })}
                      />
                    </div>
                    {formData.hourlyPayEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="hourly-rate">Hourly rate ($)</Label>
                        <Input
                          id="hourly-rate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                          className="glass-dark"
                        />
                      </div>
                    )}
                  </div>

                  {/* Salary */}
                  <div className="space-y-3 p-4 rounded-lg border border-border glass-dark">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-semibold">Salary</Label>
                        <p className="text-sm text-muted-foreground">
                          Track an annual salary amount for reporting and payroll exports.
                        </p>
                      </div>
                      <Switch
                        checked={formData.salaryEnabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, salaryEnabled: checked })}
                      />
                    </div>
                    {formData.salaryEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="salary-amount">Salary (annual $)</Label>
                        <Input
                          id="salary-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.salaryAmount}
                          onChange={(e) => setFormData({ ...formData, salaryAmount: parseFloat(e.target.value) || 0 })}
                          className="glass-dark"
                        />
                      </div>
                    )}
                  </div>

                  {/* Weekly guarantee vs. commission */}
                  <div className="space-y-3 p-4 rounded-lg border border-border glass-dark">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-semibold">Weekly guarantee vs. commission</Label>
                        <p className="text-sm text-muted-foreground">
                          Guarantee pay per week and choose whether it's paid alongside their commission or whichever amount is higher.
                        </p>
                      </div>
                      <Switch
                        checked={formData.weeklyGuaranteeEnabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, weeklyGuaranteeEnabled: checked })}
                      />
                    </div>
                    {formData.weeklyGuaranteeEnabled && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="weekly-guarantee">Weekly guarantee ($)</Label>
                          <Input
                            id="weekly-guarantee"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.weeklyGuarantee}
                            onChange={(e) => setFormData({ ...formData, weeklyGuarantee: parseFloat(e.target.value) || 0 })}
                            className="glass-dark"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label>How should the guarantee pay out?</Label>
                          <RadioGroup
                            value={formData.guaranteePayoutMethod}
                            onValueChange={(value: 'both' | 'higher') => setFormData({ ...formData, guaranteePayoutMethod: value })}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="both" id="payout-both" />
                              <Label htmlFor="payout-both" className="font-normal cursor-pointer">
                                Pay the weekly guarantee and their commission
                                <p className="text-xs text-muted-foreground">
                                  They receive both the guaranteed amount and whatever commission they earn.
                                </p>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="higher" id="payout-higher" />
                              <Label htmlFor="payout-higher" className="font-normal cursor-pointer">
                                Pay whichever amount is higher
                                <p className="text-xs text-muted-foreground">
                                  Compare their commission earnings to the guarantee and pay the larger amount.
                                </p>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team overrides */}
                  <div className="space-y-3 p-4 rounded-lg border border-border glass-dark">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-semibold">Team overrides</Label>
                        <p className="text-sm text-muted-foreground">
                          Pay them an extra share of the appointments completed by groomers they manage. This amount comes out of the business share—the groomers below them keep their full commission.
                        </p>
                      </div>
                      <Switch
                        checked={formData.teamOverridesEnabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, teamOverridesEnabled: checked })}
                      />
                    </div>
                    {formData.teamOverridesEnabled && (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Add additional staff members first to set up override relationships.
                        </p>
                        {formData.teamOverrides.map((override, index) => (
                          <div key={index} className="flex gap-2 items-end">
                            <div className="flex-1 space-y-2">
                              <Label>Team member</Label>
                              <Select
                                value={override.staffId}
                                onValueChange={(value) => {
                                  const newOverrides = [...formData.teamOverrides]
                                  newOverrides[index] = { ...override, staffId: value }
                                  setFormData({ ...formData, teamOverrides: newOverrides })
                                }}
                              >
                                <SelectTrigger className="glass-dark">
                                  <SelectValue placeholder="Select a groomer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(staff || [])
                                    .filter(s => s.id !== editingStaff?.id)
                                    .map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        {s.firstName} {s.lastName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1 space-y-2">
                              <Label>Override % of appointment revenue</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={override.overridePercent}
                                onChange={(e) => {
                                  const newOverrides = [...formData.teamOverrides]
                                  newOverrides[index] = { ...override, overridePercent: parseFloat(e.target.value) || 0 }
                                  setFormData({ ...formData, teamOverrides: newOverrides })
                                }}
                                className="glass-dark"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOverrides = formData.teamOverrides.filter((_, i) => i !== index)
                                setFormData({ ...formData, teamOverrides: newOverrides })
                              }}
                              className="glass-button"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              teamOverrides: [...formData.teamOverrides, { staffId: '', overridePercent: 20 }]
                            })
                          }}
                          className="glass-button"
                        >
                          Add override
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pay Summary */}
                {(formData.commissionEnabled || formData.hourlyPayEnabled || formData.salaryEnabled || formData.weeklyGuaranteeEnabled) && (
                  <div className="md:col-span-2 space-y-3 p-4 rounded-lg border border-border glass-dark bg-primary/5">
                    <h4 className="font-semibold text-base">Pay summary</h4>
                    <ul className="space-y-1.5 text-sm">
                      {formData.hourlyPayEnabled && formData.hourlyRate > 0 && (
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>${formData.hourlyRate.toFixed(2)} per hour base pay.</span>
                        </li>
                      )}
                      {formData.salaryEnabled && formData.salaryAmount > 0 && (
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>${formData.salaryAmount.toFixed(2)} salary per year.</span>
                        </li>
                      )}
                      {formData.weeklyGuaranteeEnabled && formData.weeklyGuarantee > 0 && formData.commissionEnabled && (
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>
                            ${formData.weeklyGuarantee.toFixed(2)} per week guaranteed or {formData.commissionPercent}% commission—
                            {formData.guaranteePayoutMethod === 'higher' ? 'whichever pays more' : 'plus commission'}.
                          </span>
                        </li>
                      )}
                      {formData.weeklyGuaranteeEnabled && formData.weeklyGuarantee > 0 && !formData.commissionEnabled && (
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>${formData.weeklyGuarantee.toFixed(2)} per week guaranteed.</span>
                        </li>
                      )}
                      {formData.commissionEnabled && (!formData.weeklyGuaranteeEnabled || formData.weeklyGuarantee === 0) && (
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{formData.commissionPercent}% commission on personal grooms.</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }} 
                  className="glass-button"
                >
                  Cancel
                </Button>
                <Button type="submit" className="glass-button">
                  {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="frosted rounded-xl p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-bold text-xl text-foreground">
              Staff Management
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage your team members and schedules
            </p>
          </div>
          {currentTab === 'staff' && (
            <Button onClick={() => setShowForm(true)} className="glass-button h-8 text-xs">
              <Plus size={16} className="mr-1.5" />
              <span>Add Staff Member</span>
            </Button>
          )}
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-3">
          <TabsList className="glass-dark h-8">
            <TabsTrigger value="staff" className="text-xs">Team Members</TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="mt-3">
            {!staff || staff.length === 0 ? (
              <Card className="frosted">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <UserCircle size={56} className="text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-1.5">No Staff Members Yet</h3>
                  <p className="text-muted-foreground text-center mb-3 text-sm">
                    Start building your team by adding your first staff member
                  </p>
                  <Button onClick={() => setShowForm(true)} className="glass-button h-8 text-xs">
                    Add First Staff Member
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(staff || []).map((member) => (
                  <Card 
                    key={member.id} 
                    className="frosted cursor-pointer hover:shadow-lg transition-all liquid-button" 
                    onClick={() => handleStaffClick(member)}
                  >
                    <CardHeader className="pb-3 pt-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCircle size={28} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            {member.firstName} {member.lastName}
                          </CardTitle>
                          <CardDescription className="truncate text-xs">{member.position}</CardDescription>
                        </div>
                        <Badge 
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                          className="shrink-0 text-xs"
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className={isCompact ? 'pt-0 pb-3' : 'pt-0'}>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <EnvelopeSimple size={14} className="text-muted-foreground shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone size={14} className="text-muted-foreground shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star size={14} className="text-yellow-500" weight="fill" />
                            <span>{member.rating}/5</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {member.specialties.length} specialties
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(member)
                          }}
                          className="flex-1 glass-button"
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="mt-0">
            <StaffSchedule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}