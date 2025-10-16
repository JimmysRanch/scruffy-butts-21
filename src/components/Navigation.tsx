import { Calendar, Users, ChartBar, CashRegister, Gear, UserCircle, Package, ChartLineUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import logo from '@/assets/images/IMG_0330.png'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'reports' | 'settings'

interface NavigationProps {
  currentView: View
  onNavigate: (view: View) => void
  isCompact?: boolean
}

export function Navigation({ currentView, onNavigate, isCompact }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: ChartBar, gradient: 'from-blue-400 to-blue-600' },
    { id: 'appointments' as View, label: 'Appointments', icon: Calendar, gradient: 'from-purple-400 to-purple-600' },
    { id: 'customers' as View, label: 'Clients & Pets', icon: Users, gradient: 'from-pink-400 to-pink-600' },
    { id: 'staff' as View, label: 'Staff', icon: UserCircle, gradient: 'from-green-400 to-green-600' },
    { id: 'pos' as View, label: 'POS', icon: CashRegister, gradient: 'from-yellow-400 to-yellow-600' },
    { id: 'inventory' as View, label: 'Inventory', icon: Package, gradient: 'from-orange-400 to-orange-600' },
    { id: 'reports' as View, label: 'Reports', icon: ChartLineUp, gradient: 'from-teal-400 to-teal-600' },
  ]

  return (
    <nav className="frosted sticky top-0 z-50 border-b border-white/20">
      <div className={`flex items-center justify-between ${isCompact ? 'h-12 px-4' : 'h-14 px-6'} max-w-[2000px] mx-auto`}>
        <div className="flex items-center gap-3">
          <div className="glass-dark rounded-lg p-1.5 liquid-shine">
            <img 
              src={logo} 
              alt="Scruffy Butts Logo" 
              className={`${isCompact ? 'h-5' : 'h-6'} w-auto object-contain`}
            />
          </div>
          <h1 className={`font-bold text-foreground ${isCompact ? 'text-base' : 'text-lg'} hidden sm:block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            Scruffy Butts
          </h1>
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
                  className={`
                    flex items-center space-x-1.5
                    ${isCompact ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-sm'} 
                    ${isActive ? 'glass shadow-lg' : 'glass-button'}
                    transition-all duration-300
                  `}
                >
                  <Icon size={isCompact ? 16 : 18} weight={isActive ? "fill" : "regular"} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              )
            })}
          </div>
          
          <div className="ml-2 pl-2 border-l border-white/20">
            <Button
              variant={currentView === 'settings' ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate('settings')}
              className={`
                flex items-center space-x-1.5
                ${isCompact ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-sm'} 
                ${currentView === 'settings' ? 'glass shadow-lg' : 'glass-button'}
                transition-all duration-300
              `}
            >
              <Gear size={isCompact ? 16 : 18} weight={currentView === 'settings' ? "fill" : "regular"} />
              <span className="hidden lg:inline">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}