import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
  Shield
} from '@phosphor-icons/react'

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

  const [activeTab, setActiveTab] = useState<'business' | 'notifications' | 'appearance' | 'security'>('business')

  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }

  const tabs = [
    { id: 'business' as const, label: 'Business', icon: MapPin },
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
    </div>
  )
}