import { Button } from '@/components/ui/button'
import { Calendar, Users, Heart, ChartBar, CashRegister, Gear, UserCircle } from '@phosphor-icons/react'

type View = 'dashboard' | 'appointments' | 'customers' | 'services' | 'staff' | 'pos' | 'settings'

interface NavigationProps {
  currentView: View
  onNavigate: (view: View) => void
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: ChartBar },
    { id: 'appointments' as View, label: 'Appointments', icon: Calendar },
    { id: 'customers' as View, label: 'Clients & Pets', icon: Users },
    { id: 'services' as View, label: 'Services', icon: Heart },
    { id: 'staff' as View, label: 'Staff', icon: UserCircle },
    { id: 'pos' as View, label: 'POS', icon: CashRegister },
    { id: 'settings' as View, label: 'Settings', icon: Gear },
  ]

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Heart size={32} className="text-accent" weight="fill" />
            <span className="text-2xl font-bold text-foreground">PawGroomer</span>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}