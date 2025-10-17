type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'reports' | 'settings'

interface NavigationProps {
  currentView: View
  onNavigate: (view: View) => void
  isCompact?: boolean
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard' },
    { id: 'appointments' as View, label: 'Appointments' },
    { id: 'customers' as View, label: 'Clients' },
    { id: 'staff' as View, label: 'Staff' },
    { id: 'pos' as View, label: 'POS' },
    { id: 'inventory' as View, label: 'Inventory' },
    { id: 'reports' as View, label: 'Reports' },
    { id: 'settings' as View, label: 'Settings' },
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
                const isActive = currentView === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      relative px-4 py-2 rounded-lg transition-all duration-200
                      text-sm font-medium whitespace-nowrap
                      ${isActive 
                        ? 'text-foreground bg-white/60 dark:bg-white/10 shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5'
                      }
                    `}
                  >
                    {item.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
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