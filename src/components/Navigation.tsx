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
    <nav className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <div className="border-b border-border/40 backdrop-blur-xl bg-gradient-to-r from-card/95 via-card/98 to-card/95 shadow-sm">
        <div className="max-w-[2000px] mx-auto px-6 py-4">
          <div className="flex items-center gap-6 md:gap-8 min-w-0">
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-accent via-accent to-accent/80 flex items-center justify-center shadow-md ring-1 ring-accent/20">
                <svg width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-7 md:h-7">
                  <circle cx="100" cy="80" r="35" fill="white" opacity="0.95"/>
                  <ellipse cx="100" cy="140" rx="50" ry="60" fill="white" opacity="0.95"/>
                  <circle cx="90" cy="75" r="5" fill="#1a1a1a"/>
                  <circle cx="110" cy="75" r="5" fill="#1a1a1a"/>
                  <ellipse cx="65" cy="95" rx="18" ry="25" fill="white" opacity="0.85"/>
                  <ellipse cx="135" cy="95" rx="18" ry="25" fill="white" opacity="0.85"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Scruffy Butts</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground tracking-wide uppercase font-medium">Premium Pet Grooming</p>
              </div>
            </div>
            
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent hidden sm:block shrink-0" />
            
            <div className="flex items-center gap-1.5 md:gap-2 flex-1 overflow-x-auto min-w-0 scrollbar-hide">
              {navItems.map((item) => {
                const isActive = currentView === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      relative px-4 md:px-5 py-2.5 rounded-xl transition-all duration-300
                      text-xs md:text-sm font-semibold whitespace-nowrap shrink-0
                      tracking-wide
                      ${isActive 
                        ? 'text-accent-foreground bg-gradient-to-br from-accent via-accent to-accent/90 shadow-md ring-1 ring-accent/30' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:shadow-sm'
                      }
                    `}
                  >
                    {item.label}
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