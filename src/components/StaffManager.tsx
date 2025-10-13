import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, UserCircle, Phone, EnvelopeSimple, MapPin, Calendar, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'

export interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  position: string
  hireDate: string
  address: string
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
              <CardTitle className="text-2xl">{staff.name}</CardTitle>
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
                <span>{staff.address}</span>
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
  const [showDialog, setShowDialog] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    hireDate: '',
    address: '',
    specialties: '',
    notes: '',
    status: 'active' as 'active' | 'inactive',
    rating: 5
  })

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      hireDate: '',
      address: '',
      specialties: '',
      notes: '',
      status: 'active' as 'active' | 'inactive',
      rating: 5
    })
    setEditingStaff(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.position) {
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
                ...formData,
                specialties: specialtiesArray
              }
            : s
        )
      )
      toast.success('Staff member updated successfully')
    } else {
      const newStaff: StaffMember = {
        id: Date.now().toString(),
        ...formData,
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
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      position: staffMember.position,
      hireDate: staffMember.hireDate,
      address: staffMember.address,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage your team members and their profiles</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="flex items-center space-x-2">
          <Plus size={18} />
          <span>Add Staff Member</span>
        </Button>
      </div>

      {!staff || staff.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserCircle size={64} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Staff Members Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your team by adding your first staff member
            </p>
            <Button onClick={() => setShowDialog(true)}>Add First Staff Member</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(staff || []).map((member) => (
            <Card key={member.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleStaffClick(member)}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <UserCircle size={32} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.position}</CardDescription>
                  </div>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <EnvelopeSimple size={14} className="text-muted-foreground" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={14} className="text-muted-foreground" />
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
                    className="flex-1"
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
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
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
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., Senior Groomer, Apprentice"
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="specialties">Specialties</Label>
                <Input
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="e.g., Large Dogs, Show Cuts, Nail Trimming (comma separated)"
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
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}