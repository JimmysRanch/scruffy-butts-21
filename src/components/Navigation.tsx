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
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="frosted border-b border-white/20 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
        <div className="max-w-[2000px] mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <svg width="28" height="28" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="80" r="35" fill="white" opacity="0.9"/>
                  <ellipse cx="100" cy="140" rx="50" ry="60" fill="white" opacity="0.9"/>
                  <circle cx="90" cy="75" r="5" fill="#333"/>
                  <circle cx="110" cy="75" r="5" fill="#333"/>
                  <ellipse cx="65" cy="95" rx="18" ry="25" fill="white" opacity="0.8"/>
                  <ellipse cx="135" cy="95" rx="18" ry="25" fill="white" opacity="0.8"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-foreground hidden sm:block">Scruffy Butts</h1>
            </div>
            
            <div className="w-px h-8 bg-border opacity-50 hidden sm:block" />
            
            <div className="flex items-center gap-2 flex-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="flex items-center gap-2 group relative px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    <div 
                      className={`
                        w-10 h-10 rounded-xl transition-all duration-300
                        bg-gradient-to-br ${item.gradient}
                        shadow-md hover:shadow-lg
                        flex items-center justify-center
                        ${isActive ? 'scale-95' : 'hover:scale-105 active:scale-95'}
                      `}
                      style={{
                        boxShadow: isActive 
                          ? '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                          : '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <Icon 
                        size={22} 
                        weight={isActive ? "fill" : "regular"} 
                        className="text-white drop-shadow-sm"
                      />
                    </div>
                    <span 
                      className={`
                        text-sm font-medium whitespace-nowrap hidden md:block
                        transition-colors duration-200
                        ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                      `}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-primary/80" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}