import { Button } from '@/components/ui/button'
import { Calendar, Users, ChartBar, CashRegister, Gear, UserCircle } from '@phosphor-icons/react'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'settings'

interface NavigationProps {
  currentView: View
  onNavigate: (view: View) => void
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: ChartBar },
    { id: 'appointments' as View, label: 'Appointments', icon: Calendar },
    { id: 'customers' as View, label: 'Clients & Pets', icon: Users },
    { id: 'staff' as View, label: 'Staff', icon: UserCircle },
    { id: 'pos' as View, label: 'POS', icon: CashRegister },
  ]

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">Scruffy Butts</h1>
          </div>
          
          <div className="flex items-center space-x-1">
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
            
            <div className="ml-2 pl-2 border-l border-border">
              <Button
                variant={currentView === 'settings' ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate('settings')}
                className="flex items-center space-x-2"
              >
                <Gear size={18} />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}