import { motion } from 'framer-motion'
import { Calendar, Users, ChartBar, CashRegister, Gear, UserCircle, Package, ChartLineUp } from '@phosphor-icons/react'
import logo from '@/assets/images/IMG_0330.png'

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
      
      <div className="flex-1 overflow-y-auto py-3 px-4 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full group relative overflow-hidden rounded-lg
                transition-all duration-300
                ${isActive ? 'frosted shadow-xl' : 'glass-button hover:glass'}
              `}
            >
              <div className="flex items-center gap-2.5 px-3 py-2 relative z-10">
                <motion.div 
                  className={`
                    relative w-8 h-8 rounded-lg flex items-center justify-center
                    bg-gradient-to-br ${item.gradient}
                    shadow-lg
                  `}
                  whileHover={{ 
                    scale: 1.1,
                    rotateY: 10,
                    rotateX: 10,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <Icon 
                    size={18} 
                    weight={isActive ? "fill" : "duotone"} 
                    className="text-white relative z-10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-lg" />
                  <motion.div 
                    className="absolute inset-0 bg-white/20 rounded-lg"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
                
                <div className="flex-1 text-left">
                  <span className={`
                    text-sm font-semibold
                    ${isActive ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'}
                    transition-colors
                  `}>
                    {item.label}
                  </span>
                </div>
                
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeBackground"
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>
            </motion.button>
          )
        })}
      </div>
      
      <div className="p-4 border-t border-white/20">
        <motion.button
          onClick={() => onNavigate('settings')}
          className={`
            w-full group relative overflow-hidden rounded-lg
            transition-all duration-300
            ${currentView === 'settings' ? 'frosted shadow-xl' : 'glass-button hover:glass'}
          `}
        >
          <div className="flex items-center gap-2.5 px-3 py-2 relative z-10">
            <motion.div 
              className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg"
              whileHover={{ 
                scale: 1.1,
                rotate: 180,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Gear 
                size={18} 
                weight={currentView === 'settings' ? "fill" : "duotone"} 
                className="text-white"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-lg" />
            </motion.div>
            
            <div className="flex-1 text-left">
              <span className={`
                text-sm font-semibold
                ${currentView === 'settings' ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'}
                transition-colors
              `}>
                Settings
              </span>
            </div>
            
            {currentView === 'settings' && (
              <motion.div
                layoutId="activeIndicator"
                className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </div>
          
          {currentView === 'settings' && (
            <motion.div
              layoutId="activeBackground"
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      </div>
    </motion.nav>
  )
}