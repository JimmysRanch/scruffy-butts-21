import { useKV } from '@github/spark/hooks'
import { format } from 'date-fns'
import { User, Clock } from '@phosphor-icons/react'

interface Appointment {
  id: string
  petName: string
  staffId?: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'ready-for-pickup' | 'completed' | 'cancelled' | 'no-show'
}

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  position: string
  status: 'active' | 'inactive'
}

interface GroomerWorkload {
  groomer: StaffMember
  appointmentCount: number
  totalMinutes: number
  capacityPercentage: number
}

const WORK_DAY_MINUTES = 480

export function GroomerWorkloadWidget() {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [staffMembers] = useKV<StaffMember[]>('staff-members', [])

  const today = new Date()
  const todayDateString = format(today, 'yyyy-MM-dd')

  const todayAppointments = (appointments || []).filter(apt => 
    apt.date === todayDateString && 
    apt.status !== 'cancelled' && 
    apt.status !== 'no-show'
  )

  const groomers = (staffMembers || []).filter(s => 
    s.status === 'active' && 
    (s.position.toLowerCase().includes('groomer') || s.position.toLowerCase().includes('stylist'))
  )

  const workloadData: GroomerWorkload[] = groomers.map(groomer => {
    const groomerAppointments = todayAppointments.filter(apt => apt.staffId === groomer.id)
    const totalMinutes = groomerAppointments.reduce((sum, apt) => sum + (apt.duration || 0), 0)
    const capacityPercentage = Math.min((totalMinutes / WORK_DAY_MINUTES) * 100, 100)

    return {
      groomer,
      appointmentCount: groomerAppointments.length,
      totalMinutes,
      capacityPercentage: Math.round(capacityPercentage)
    }
  }).sort((a, b) => b.capacityPercentage - a.capacityPercentage)

  return (
    <div className="relative z-10">
      <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
        <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">Groomer Workload</h3>
      </div>
      <div className="pb-3 pt-1 px-4 min-w-0">
        {workloadData.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-[10px] text-white/50 font-medium">No active groomers</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workloadData.map((data) => {
              const isNearCapacity = data.capacityPercentage >= 80
              const isOverCapacity = data.capacityPercentage >= 100
              
              return (
                <div key={data.groomer.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <User size={14} className="text-white/70 flex-shrink-0" weight="fill" />
                      <span className="text-xs font-semibold text-white/90 truncate">
                        {data.groomer.firstName} {data.groomer.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold ${
                        isOverCapacity 
                          ? 'text-red-400' 
                          : isNearCapacity 
                          ? 'text-amber-400' 
                          : 'text-white/70'
                      }`}>
                        {data.capacityPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                    isOverCapacity 
                      ? 'bg-red-950/30' 
                      : isNearCapacity 
                      ? 'bg-amber-950/30' 
                      : 'bg-white/10'
                  }`}>
                    <div 
                      className={`h-full transition-all ${
                        isOverCapacity 
                          ? 'bg-red-500' 
                          : isNearCapacity 
                          ? 'bg-amber-500' 
                          : 'bg-primary'
                      }`}
                      style={{ width: `${data.capacityPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-white/50">
                    <span>{data.appointmentCount} {data.appointmentCount === 1 ? 'appointment' : 'appointments'}</span>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="flex-shrink-0" />
                      <span>{data.totalMinutes} / {WORK_DAY_MINUTES} min</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
