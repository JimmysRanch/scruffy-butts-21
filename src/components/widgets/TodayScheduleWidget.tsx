import { useKV } from '@/lib/useKV'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { Calendar, Dog, User, Package, Clock } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface Appointment {
  id: string
  petName: string
  petId?: string
  customerFirstName: string
  customerLastName: string
  customerId: string
  service: string
  serviceId: string
  staffId?: string
  groomerRequested?: boolean
  date: string
  time: string
  endTime?: string
  duration: number
  price: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
}

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  position: string
}

interface TodayScheduleWidgetProps {
  isCompact?: boolean
  onAppointmentClick?: (apt: Appointment) => void
}

const STATUS_COLORS: Record<Appointment['status'], string> = {
  'scheduled': 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  'confirmed': 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
  'checked-in': 'border-blue-500/40 bg-blue-500/10 text-blue-100',
  'in-progress': 'border-purple-500/40 bg-purple-500/10 text-purple-100',
  'ready-for-pickup': 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100',
  'completed': 'border-gray-500/40 bg-gray-500/10 text-gray-100',
  'cancelled': 'border-red-500/40 bg-red-500/10 text-red-100',
  'no-show': 'border-orange-500/40 bg-orange-500/10 text-orange-100'
}

export function TodayScheduleWidget({ isCompact = false, onAppointmentClick }: TodayScheduleWidgetProps) {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayAppointments = (appointments || [])
    .filter(apt => apt.date === today && apt.status !== 'cancelled')
    .sort((a, b) => {
      const timeA = a.time || ''
      const timeB = b.time || ''
      return timeA.localeCompare(timeB)
    })

  return (
    <div className="h-full flex flex-col">
      <div className="pb-4 pt-5 px-5">
        <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white/90">
          <div className="p-2 rounded-xl bg-gradient-to-br from-accent/30 via-primary/30 to-accent/30 ring-1 ring-white/15 shrink-0 shadow-[0_0_12px_oklch(0.65_0.20_290)]">
            <Calendar className="h-5 w-5 text-accent drop-shadow-[0_0_4px_oklch(0.65_0.22_310)]" weight="duotone" />
          </div>
          <span className="truncate">Today's Schedule</span>
        </h2>
        <p className="truncate text-xs font-medium text-white/50 mt-1">Appointments scheduled for today</p>
      </div>
      <div className="min-w-0 px-5 pb-5 flex-1 overflow-auto">
        {todayAppointments.length === 0 ? (
          <div className="text-center text-white/50 py-12">
            <div className="w-fit mx-auto p-5 rounded-2xl mb-4 bg-white/5 ring-1 ring-white/10">
              <Dog className="h-12 w-12 opacity-40 text-white/50" weight="duotone" />
            </div>
            <p className="text-sm font-medium">No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={cn(
              'glass-card py-2 px-4 rounded-lg overflow-hidden shadow-lg ring-1 ring-primary/50 shadow-[0_0_16px_oklch(0.60_0.20_280/0.3)]'
            )}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-base leading-tight text-primary drop-shadow-[0_0_8px_oklch(0.60_0.20_280)]">
                  Today
                </h3>
                <Badge variant="default" className="text-xs font-semibold shrink-0">
                  {todayAppointments.length}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              {todayAppointments.slice(0, 6).map((apt) => {
                const staffMember = apt.staffId ? staffMembers?.find(s => s.id === apt.staffId) : null
                return (
                  <div
                    key={apt.id}
                    className={cn(
                      'glass-card border-2 rounded-xl p-4 cursor-pointer hover:scale-[1.01] transition-all duration-200',
                      STATUS_COLORS[apt.status]
                    )}
                    onClick={() => onAppointmentClick?.(apt)}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="p-1.5 rounded-lg bg-current/10 flex-shrink-0">
                              <Dog size={20} className="opacity-80" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg leading-tight">
                                {apt.petName}
                                {staffMember && (
                                  <span className="text-sm font-medium text-white/70 ml-2">
                                    with {staffMember.firstName} {staffMember.lastName}
                                    {apt.groomerRequested && (
                                      <span className="text-red-500 font-bold ml-1">R</span>
                                    )}
                                  </span>
                                )}
                              </h3>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-white/70 mb-2.5">
                            <User size={16} className="flex-shrink-0" />
                            <span>{apt.customerFirstName} {apt.customerLastName}</span>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-white/70 flex-wrap">
                            <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1">
                              <Package size={16} className="flex-shrink-0" />
                              <span>{apt.service}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1">
                              <Calendar size={16} className="flex-shrink-0" />
                              <span>{format(parseISO(apt.date), 'MMM d')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1">
                              <Clock size={16} className="flex-shrink-0" />
                              <span className="font-medium">{apt.time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Badge variant="outline" className="border-current/30 bg-current/10 font-semibold whitespace-nowrap">
                            {apt.status.replace('-', ' ')}
                          </Badge>
                          <div className="text-2xl font-bold text-white/90">${apt.price}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
