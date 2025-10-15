import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, UserCircle, Phone, EnvelopeSimple, MapPin, Calendar, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { StaffSchedule } from './StaffSchedule'

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
}

interface StaffProfileProps {
  staff: StaffMember
  onBack: () => void
  onEdit: (staff: StaffMember) => void
}

function StaffProfile({ staff, onBack, onEdit }: StaffProfileProps) {
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

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <UserCircle size={48} className="text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">{staff.firstName} {staff.lastName}</CardTitle>
              <CardDescription className="text-lg">{staff.position}</CardDescription>
              <div className="flex items-center mt-2">
                <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                  {staff.status}
                </Badge>
                <div className="flex items-center ml-4">
                  <Star size={16} className="text-yellow-500 mr-1" weight="fill" />
                  <span className="text-sm font-medium">{staff.rating}/5</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <EnvelopeSimple size={18} className="text-muted-foreground" />
                <span>{staff.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={18} className="text-muted-foreground" />
                <span>{staff.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={18} className="text-muted-foreground" />
                <span>
                  {staff.address && <>{staff.address}, </>}
                  {staff.city}{staff.city && (staff.state || staff.zip) ? ', ' : ''}{staff.state} {staff.zip}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={18} className="text-muted-foreground" />
                <span>Hired: {new Date(staff.hireDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {staff.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {staff.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {staff.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function StaffManager() {
  const [staff, setStaff] = useKV<StaffMember[]>('staff-members', [])
  const [appearance] = useKV<{ compactMode?: boolean }>('appearance-settings', {})
  const [staffPositions] = useKV<StaffPosition[]>('staff-positions', [
    { id: 'owner', name: 'Owner', permissions: ['all'], description: 'Full access to all features' },
    { id: 'admin', name: 'Admin', permissions: ['manage_staff', 'manage_customers', 'manage_services', 'view_reports', 'pos'], description: 'Administrative access' },
    { id: 'manager', name: 'Manager', permissions: ['manage_staff', 'manage_customers', 'view_reports', 'pos'], description: 'Management level access' },
    { id: 'groomer', name: 'Groomer', permissions: ['view_appointments', 'manage_customers', 'pos'], description: 'Professional groomer' },
    { id: 'bather', name: 'Bather', permissions: ['view_appointments'], description: 'Bathing specialist' },
    { id: 'front_desk', name: 'Front Desk', permissions: ['manage_customers', 'view_appointments', 'pos'], description: 'Customer service representative' }
  ])
  const [showDialog, setShowDialog] = useState(false)
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
    rating: 5
  })

  const isCompact = appearance?.compactMode || false

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
      rating: 5
    })
    setEditingStaff(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.position) {
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
                specialties: specialtiesArray
              }
            : s
        )
      )
      toast.success('Staff member updated successfully')
    } else {
      const newStaff: StaffMember = {
        id: Date.now().toString(),
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
        specialties: specialtiesArray
      }

      setStaff(currentStaff => [...(currentStaff || []), newStaff])
      toast.success('Staff member added successfully')
    }

    setShowDialog(false)
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
      rating: staffMember.rating
    })
    setSelectedStaff(null)
    setShowDialog(true)
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

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      <div className="frosted rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className={`font-bold ${isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} text-foreground`}>
              Staff Management
            </h1>
            <p className={`text-muted-foreground ${isCompact ? 'text-xs sm:text-sm' : 'text-sm'} mt-1`}>
              Manage your team members and schedules
            </p>
          </div>
          {currentTab === 'staff' && (
            <Button onClick={() => setShowDialog(true)} className="glass-button">
              <Plus size={18} className="mr-2" />
              <span>Add Staff Member</span>
            </Button>
          )}
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-4">
          <TabsList className="glass-dark">
            <TabsTrigger value="staff">Team Members</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="mt-4">
            {!staff || staff.length === 0 ? (
              <Card className="frosted">
                <CardContent className={`flex flex-col items-center justify-center ${isCompact ? 'py-12' : 'py-16'}`}>
                  <UserCircle size={64} className="text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Staff Members Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start building your team by adding your first staff member
                  </p>
                  <Button onClick={() => setShowDialog(true)} className="glass-button">
                    Add First Staff Member
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isCompact ? 'gap-3' : 'gap-4'}`}>
                {(staff || []).map((member) => (
                  <Card 
                    key={member.id} 
                    className="frosted cursor-pointer hover:shadow-lg transition-all liquid-button" 
                    onClick={() => handleStaffClick(member)}
                  >
                    <CardHeader className={isCompact ? 'pb-3' : ''}>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCircle size={32} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {member.firstName} {member.lastName}
                          </CardTitle>
                          <CardDescription className="truncate">{member.position}</CardDescription>
                        </div>
                        <Badge 
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                          className="shrink-0"
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
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(member.id)
                          }}
                          className="glass-button"
                        >
                          Delete
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="frosted max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </DialogTitle>
              <DialogDescription>
                {editingStaff 
                  ? 'Update the staff member information below'
                  : 'Enter the details for the new team member'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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
                <Label htmlFor="position">Position *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger id="position" className="glass-dark">
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
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="glass-dark"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  className="glass-dark"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status" className="glass-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger id="state" className="glass-dark">
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
                <Label htmlFor="zip">Zip Code</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="Zip code"
                  className="glass-dark"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="specialties">Specialties</Label>
                <Input
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="e.g., Large Dogs, Show Cuts, Nail Trimming (comma separated)"
                  className="glass-dark"
                />
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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="glass-button">
                Cancel
              </Button>
              <Button type="submit" className="glass-button">
                {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}