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
    <motion.nav 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-[280px] frosted border-r border-white/20 z-50 flex flex-col"
    >
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <motion.div 
            className="glass-dark rounded-xl p-3 liquid-shine relative"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <img 
              src={logo} 
              alt="Scruffy Butts Logo" 
              className="h-8 w-auto object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl pointer-events-none" />
          </motion.div>
          <div>
            <h1 className="font-bold text-lg text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Scruffy Butts
            </h1>
            <p className="text-xs text-muted-foreground">Grooming Management</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
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
                w-full group relative overflow-hidden rounded-xl
                transition-all duration-300
                ${isActive ? 'frosted shadow-xl' : 'glass-button hover:glass'}
              `}
            >
              <div className="flex items-center gap-3 px-4 py-3 relative z-10">
                <motion.div 
                  className={`
                    relative w-10 h-10 rounded-lg flex items-center justify-center
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
                    size={20} 
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
                    text-base font-semibold
                    ${isActive ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'}
                    transition-colors
                  `}>
                    {item.label}
                  </span>
                </div>
                
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"
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
            w-full group relative overflow-hidden rounded-xl
            transition-all duration-300
            ${currentView === 'settings' ? 'frosted shadow-xl' : 'glass-button hover:glass'}
          `}
        >
          <div className="flex items-center gap-3 px-4 py-3 relative z-10">
            <motion.div 
              className="relative w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg"
              whileHover={{ 
                scale: 1.1,
                rotate: 180,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Gear 
                size={20} 
                weight={currentView === 'settings' ? "fill" : "duotone"} 
                className="text-white"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-lg" />
            </motion.div>
            
            <div className="flex-1 text-left">
              <span className={`
                text-base font-semibold
                ${currentView === 'settings' ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'}
                transition-colors
              `}>
                Settings
              </span>
            </div>
            
            {currentView === 'settings' && (
              <motion.div
                layoutId="activeIndicator"
                className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"
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