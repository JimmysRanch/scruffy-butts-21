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
  Trash
} from '@phosphor-icons/react'
import { StaffPosition } from './StaffManager'

interface BusinessSettings {
  name: string
  email: string
  phone: string
  address: string
  timezone: string
  currency: string
  taxRate: number
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

export function Settings() {
  const [businessSettings, setBusinessSettings] = useKV<BusinessSettings>('business-settings', {
    name: 'PawGroomer Studio',
    email: 'contact@pawgroomer.com',
    phone: '+1 (555) 123-4567',
    address: '123 Pet Street, Dog City, DC 12345',
    timezone: 'America/New_York',
    currency: 'USD',
    taxRate: 8.25
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

  const [staffPositions, setStaffPositions] = useKV<StaffPosition[]>('staff-positions', [
    { id: 'owner', name: 'Owner', permissions: ['all'], description: 'Full access to all features' },
    { id: 'admin', name: 'Admin', permissions: ['manage_staff', 'manage_customers', 'manage_services', 'view_reports', 'pos'], description: 'Administrative access' },
    { id: 'manager', name: 'Manager', permissions: ['manage_staff', 'manage_customers', 'view_reports', 'pos'], description: 'Management level access' },
    { id: 'groomer', name: 'Groomer', permissions: ['view_appointments', 'manage_customers', 'pos'], description: 'Professional groomer' },
    { id: 'bather', name: 'Bather', permissions: ['view_appointments'], description: 'Bathing specialist' },
    { id: 'front_desk', name: 'Front Desk', permissions: ['manage_customers', 'view_appointments', 'pos'], description: 'Customer service representative' }
  ])

  const [activeTab, setActiveTab] = useState<'business' | 'notifications' | 'appearance' | 'security' | 'staff-positions'>('business')
  const [showPositionDialog, setShowPositionDialog] = useState(false)
  const [editingPosition, setEditingPosition] = useState<StaffPosition | null>(null)
  const [positionFormData, setPositionFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  const availablePermissions = [
    { id: 'all', label: 'All Permissions', description: 'Full access to everything' },
    { id: 'manage_staff', label: 'Manage Staff', description: 'Add, edit, and remove staff members' },
    { id: 'manage_customers', label: 'Manage Customers', description: 'Add, edit, and view customer information' },
    { id: 'manage_services', label: 'Manage Services', description: 'Add, edit, and remove services' },
    { id: 'view_appointments', label: 'View Appointments', description: 'View appointment schedules' },
    { id: 'manage_appointments', label: 'Manage Appointments', description: 'Create, edit, and cancel appointments' },
    { id: 'view_reports', label: 'View Reports', description: 'Access business reports and analytics' },
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

  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }

  const tabs = [
    { id: 'business' as const, label: 'Business', icon: MapPin },
    { id: 'staff-positions' as const, label: 'Staff Positions', icon: Users },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: PaintBrush },
    { id: 'security' as const, label: 'Security', icon: Shield }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your grooming business preferences and configurations</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <FloppyDisk size={18} />
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon size={18} />
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin size={20} />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Update your business details and operational settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      value={businessSettings?.name || ''}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev!, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-email">Email Address</Label>
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
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={businessSettings?.timezone || 'America/New_York'}
                      onValueChange={(value) => setBusinessSettings(prev => ({ ...prev!, timezone: value }))}
                    >
                      <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="business-address">Business Address</Label>
                  <Input
                    id="business-address"
                    value={businessSettings?.address || ''}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev!, address: e.target.value }))}
                  />
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
    </div>
  )
}