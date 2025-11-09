import { useKV } from '@/lib/useKV'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, TrendUp, TrendDown, CurrencyDollar, Calendar, Star, Clock } from '@phosphor-icons/react'
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  hireDate: string
  address: string
  city: string
  state: string
  zip: string
  specialties: string[]
  notes: string
  status: 'active' | 'inactive'
  rating: number
  avatar?: string
}

interface Appointment {
  id: string
  customerId: string
  petId: string
  serviceIds: string[]
  staffId: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
}

interface Transaction {
  id: string
  appointmentId: string
  customerId: string
  items: Array<{
    type: 'service' | 'product'
    name: string
    price: number
    quantity: number
    staffId?: string
  }>
  subtotal: number
  tax: number
  tip: number
  total: number
  paymentMethod: string
  status: string
  date: string
}

interface AppearanceSettings {
  compactMode?: boolean
}

interface StaffPerformance {
  staffId: string
  staffName: string
  avatar?: string
  position: string
  appointmentsCompleted: number
  revenue: number
  tips: number
  averageRating: number
  hoursWorked: number
  revenuePerHour: number
  tipsPerHour: number
  status: 'active' | 'inactive'
}

export function StaffPerformanceCard() {
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [transactions] = useKV<Transaction[]>('transactions', [])
  const [appearance] = useKV<AppearanceSettings>('appearance-settings', {})

  const isCompact = appearance?.compactMode || false

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 })

  const calculateStaffPerformance = (): StaffPerformance[] => {
    const activeStaff = (staffMembers || []).filter(s => s.status === 'active')
    
    return activeStaff.map(staff => {
      const weekAppointments = (appointments || []).filter(apt =>
        apt.staffId === staff.id &&
        isWithinInterval(new Date(apt.date), { start: weekStart, end: weekEnd }) &&
        apt.status === 'completed'
      )

      const appointmentIds = weekAppointments.map(apt => apt.id)
      const staffTransactions = (transactions || []).filter(txn =>
        appointmentIds.includes(txn.appointmentId)
      )

      const revenue = staffTransactions.reduce((sum, txn) => sum + txn.subtotal, 0)
      const tips = staffTransactions.reduce((sum, txn) => sum + txn.tip, 0)
      
      const hoursWorked = weekAppointments.reduce((sum, apt) => sum + (apt.duration / 60), 0)
      const revenuePerHour = hoursWorked > 0 ? revenue / hoursWorked : 0
      const tipsPerHour = hoursWorked > 0 ? tips / hoursWorked : 0

      return {
        staffId: staff.id,
        staffName: `${staff.firstName} ${staff.lastName}`,
        avatar: staff.avatar,
        position: staff.position,
        appointmentsCompleted: weekAppointments.length,
        revenue,
        tips,
        averageRating: staff.rating || 0,
        hoursWorked,
        revenuePerHour,
        tipsPerHour,
        status: staff.status
      }
    }).sort((a, b) => b.revenue - a.revenue)
  }

  const performanceData = calculateStaffPerformance()
  const topPerformer = performanceData[0]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    return parts.map(p => p[0]).join('').toUpperCase()
  }

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value >= threshold * 1.2) return 'text-emerald-600 dark:text-emerald-400'
    if (value >= threshold) return 'text-blue-600 dark:text-blue-400'
    return 'text-muted-foreground'
  }

  const avgRevenue = performanceData.reduce((sum, p) => sum + p.revenue, 0) / Math.max(performanceData.length, 1)

  return (
    <Card className="frosted border-white/20 liquid-shine">
      <CardHeader className={isCompact ? 'pb-2' : ''}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-base' : ''}`}>
              <div className="glass-dark p-1.5 rounded-lg liquid-pulse">
                <User className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} weight="fill" />
              </div>
              Staff Performance
            </CardTitle>
            <CardDescription className={isCompact ? 'text-xs' : ''}>This week's performance summary</CardDescription>
          </div>
          <Badge className="glass-dark border-white/20">
            {performanceData.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={isCompact ? 'pt-2' : ''}>
        {performanceData.length === 0 ? (
          <div className={`text-center text-muted-foreground ${isCompact ? 'py-4' : 'py-8'}`}>
            <div className="glass-dark w-fit mx-auto p-4 rounded-2xl mb-3">
              <User className={`opacity-50 ${isCompact ? 'h-8 w-8' : 'h-12 w-12'}`} weight="fill" />
            </div>
            <p className={isCompact ? 'text-sm' : ''}>No active staff members</p>
          </div>
        ) : (
          <div className={isCompact ? 'space-y-3' : 'space-y-4'}>
            {topPerformer && (
              <div className="glass p-4 rounded-xl border border-accent/30 liquid-glow">
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-4 w-4 text-accent" weight="fill" />
                  <span className="text-xs font-medium text-accent">Top Performer</span>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-accent/50">
                    <AvatarImage src={topPerformer.avatar} />
                    <AvatarFallback className="bg-accent/20 text-accent font-semibold">
                      {getInitials(topPerformer.staffName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{topPerformer.staffName}</div>
                    <div className="text-xs text-muted-foreground">{topPerformer.position}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-accent">{formatCurrency(topPerformer.revenue)}</div>
                    <div className="text-xs text-muted-foreground">{topPerformer.appointmentsCompleted} appointments</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">$/Hour</div>
                    <div className="text-sm font-semibold">{formatCurrency(topPerformer.revenuePerHour)}</div>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <div className="text-xs text-muted-foreground">Tips</div>
                    <div className="text-sm font-semibold">{formatCurrency(topPerformer.tips)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Rating</div>
                    <div className="text-sm font-semibold flex items-center justify-center gap-1">
                      {topPerformer.averageRating.toFixed(1)}
                      <Star className="h-3 w-3" weight="fill" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={isCompact ? 'space-y-2' : 'space-y-2.5'}>
              {performanceData.slice(0, 5).map((staff) => (
                <div
                  key={staff.staffId}
                  className="glass-dark rounded-xl border border-white/20 hover:glass transition-all duration-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/20">
                      <AvatarImage src={staff.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {getInitials(staff.staffName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{staff.staffName}</div>
                      <div className="text-xs text-muted-foreground">{staff.position}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold text-sm ${getPerformanceColor(staff.revenue, avgRevenue)}`}>
                        {formatCurrency(staff.revenue)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} weight="fill" />
                        {staff.appointmentsCompleted}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-xs">
                        <CurrencyDollar size={12} weight="fill" />
                        <span className="font-medium">{formatCurrency(staff.revenuePerHour)}/hr</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} weight="fill" />
                        {staff.hoursWorked.toFixed(1)}h
                      </div>
                    </div>
                  </div>

                  {staff.tips > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Tips collected</span>
                      <span className="text-xs font-medium text-accent">{formatCurrency(staff.tips)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {performanceData.length > 5 && (
              <Button
                variant="outline"
                className="w-full glass-button border-white/20"
                size={isCompact ? "sm" : "default"}
              >
                View All Staff ({performanceData.length})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
