import { Gear } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

type View = 'dashboard' | 'appointments' | 'customers' | 'staff' | 'pos' | 'inventory' | 'finances' | 'reports' | 'settings' | 'new-appointment' | 'add-pet' | 'edit-pet' | 'customize-dashboard' | 'appointment-detail' | 'appointment-checkout'

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
    { id: 'finances' as View, label: 'Finances' },
    { id: 'reports' as View, label: 'Reports' },
    { id: 'settings' as View, label: 'Settings' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <div className="glass-nav">
        <div className="max-w-[2000px] mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-6 md:gap-8 min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto min-w-0 scrollbar-hide">
              {navItems.map((item) => {
                const isActive = currentView === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      relative px-4 md:px-5 py-2.5 rounded-xl transition-all duration-300
                      text-xs md:text-sm font-semibold whitespace-nowrap shrink-0
                      tracking-wide backdrop-blur-sm
                      ${isActive 
                        ? 'text-white bg-gradient-to-br from-primary via-accent to-primary shadow-lg ring-1 ring-white/20' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/10 hover:shadow-md'
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