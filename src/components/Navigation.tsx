import { Calendar, Users, ChartBar, CashRegister, Gear, UserCircle, Package, ChartLineUp } from '@phosphor-icons/react'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'reports' | 'settings'

interface NavigationProps {
  currentView: View
  onNavigate: (view: View) => void
  isCompact?: boolean
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: ChartBar, gradient: 'from-blue-400 to-blue-600' },
    { id: 'appointments' as View, label: 'Appointments', icon: Calendar, gradient: 'from-purple-400 to-purple-600' },
    { id: 'customers' as View, label: 'Clients', icon: Users, gradient: 'from-pink-400 to-pink-600' },
    { id: 'staff' as View, label: 'Staff', icon: UserCircle, gradient: 'from-green-400 to-green-600' },
    { id: 'pos' as View, label: 'POS', icon: CashRegister, gradient: 'from-yellow-400 to-yellow-600' },
    { id: 'inventory' as View, label: 'Inventory', icon: Package, gradient: 'from-orange-400 to-orange-600' },
    { id: 'reports' as View, label: 'Reports', icon: ChartLineUp, gradient: 'from-teal-400 to-teal-600' },
    { id: 'settings' as View, label: 'Settings', icon: Gear, gradient: 'from-gray-400 to-gray-600' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="frosted border-t border-white/20 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
        <div className="max-w-[2000px] mx-auto px-4 py-3">
          <div className="flex items-end justify-around gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex flex-col items-center gap-1.5 min-w-0 flex-1 max-w-[100px] group"
                >
                  <div 
                    className={`
                      relative w-14 h-14 rounded-2xl transition-all duration-300
                      bg-gradient-to-br ${item.gradient}
                      shadow-lg hover:shadow-xl
                      flex items-center justify-center
                      ${isActive ? 'scale-95' : 'hover:scale-110 active:scale-95'}
                    `}
                    style={{
                      boxShadow: isActive 
                        ? '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                        : '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <Icon 
                      size={28} 
                      weight={isActive ? "fill" : "regular"} 
                      className="text-white drop-shadow-sm"
                    />
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80" />
                    )}
                  </div>
                  <span 
                    className={`
                      text-[10px] font-medium text-center leading-tight truncate w-full
                      transition-colors duration-200
                      ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                    `}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}