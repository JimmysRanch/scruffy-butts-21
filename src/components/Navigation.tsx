import { Button } from '@/components/ui/button'
import { Calendar, Users, ChartBar, CashRegister, Gear, UserCircle, Package } from '@phosphor-icons/react'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'settings'

interface NavigationProps {
  currentView: View
  onNavigate: (view: View) => void
  isCompact?: boolean
}

export function Navigation({ currentView, onNavigate, isCompact = false }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: ChartBar },
    { id: 'appointments' as View, label: 'Appointments', icon: Calendar },
    { id: 'customers' as View, label: 'Clients & Pets', icon: Users },
    { id: 'staff' as View, label: 'Staff', icon: UserCircle },
    { id: 'pos' as View, label: 'POS', icon: CashRegister },
    { id: 'inventory' as View, label: 'Inventory', icon: Package },
  ]

  return (
    <nav className="bg-card border-b border-border">
      <div className={`flex items-center justify-between ${isCompact ? 'h-10 px-3' : 'h-14 px-4'}`}>
        <div className="flex items-center">
          <h1 className={`font-bold text-foreground ${isCompact ? 'text-base' : 'text-xl'}`}>Scruffy Butts</h1>
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
                  size={isCompact ? "sm" : "sm"}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 ${isCompact ? 'h-7 px-2 text-xs' : ''}`}
                >
                  <Icon size={isCompact ? 16 : 18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              )
            })}
          </div>
          
          <div className="ml-2 pl-2 border-l border-border">
            <Button
              variant={currentView === 'settings' ? "default" : "ghost"}
              size={isCompact ? "sm" : "sm"}
              onClick={() => onNavigate('settings')}
              className={`flex items-center space-x-2 ${isCompact ? 'h-7 px-2 text-xs' : ''}`}
            >
              <Gear size={isCompact ? 16 : 18} />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}