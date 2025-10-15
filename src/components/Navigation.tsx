import { Button } from '@/components/ui/button'
import { Calendar, Users, ChartBar, CashRegister, Gear, UserCircle, Package, ChartLineUp } from '@phosphor-icons/react'
import logo from '@/assets/images/IMG_0330.png'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'reports' | 'settings'

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
    { id: 'reports' as View, label: 'Reports', icon: ChartLineUp },
  ]

  return (
    <nav className="frosted sticky top-0 z-50 border-b border-white/20">
      <div className={`flex items-center justify-between ${isCompact ? 'h-9 px-3' : 'h-11 px-4'} max-w-[2000px] mx-auto`}>
        <div className="flex items-center gap-2">
          <div className="glass-dark rounded-lg p-1 liquid-shine">
            <img 
              src={logo} 
              alt="Scruffy Butts Logo" 
              className={`${isCompact ? 'h-4' : 'h-5'} w-auto object-contain`}
            />
          </div>
          <h1 className={`font-bold text-foreground ${isCompact ? 'text-sm' : 'text-base'} hidden sm:block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            Scruffy Butts
          </h1>
        </div>
        
        <div className="flex items-center space-x-0.5">
          <div className="flex space-x-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex items-center space-x-1.5
                    ${isCompact ? 'h-6 px-2 text-xs' : 'h-7 px-2.5 text-xs'} 
                    ${isActive ? 'glass shadow-lg' : 'glass-button'}
                    transition-all duration-300
                  `}
                >
                  <Icon size={isCompact ? 14 : 16} weight={isActive ? "fill" : "regular"} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              )
            })}
          </div>
          
          <div className="ml-1 pl-1 border-l border-white/20">
            <Button
              variant={currentView === 'settings' ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate('settings')}
              className={`
                flex items-center space-x-1.5
                ${isCompact ? 'h-6 px-2 text-xs' : 'h-7 px-2.5 text-xs'} 
                ${currentView === 'settings' ? 'glass shadow-lg' : 'glass-button'}
                transition-all duration-300
              `}
            >
              <Gear size={isCompact ? 14 : 16} weight={currentView === 'settings' ? "fill" : "regular"} />
              <span className="hidden lg:inline">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}