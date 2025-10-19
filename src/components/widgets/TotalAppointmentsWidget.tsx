import { useKV } from '@github/spark/hooks'
import { format } from 'date-fns'

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

export function TotalAppointmentsWidget() {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  
  const today = new Date()
  const todayDateString = format(today, 'yyyy-MM-dd')
  
  const todayAppointments = (appointments || []).filter(apt => apt.date === todayDateString)
  const total = todayAppointments.length
  const cancelled = todayAppointments.filter(apt => apt.status === 'cancelled').length
  const noShows = todayAppointments.filter(apt => apt.status === 'no-show').length
  
  const completedRatio = total > 0 ? ((total - cancelled - noShows) / total) : 0
  const cancelledRatio = total > 0 ? (cancelled / total) : 0
  
  const completedAngle = completedRatio * 360
  const cancelledAngle = cancelledRatio * 360
  const startCancelledAngle = completedAngle

  return (
    <div className="relative z-10">
      <div className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
        <h3 className="text-xs font-semibold tracking-wide truncate text-foreground/85">Today</h3>
      </div>
      <div className="pb-3 pt-1 px-4 min-w-0">
        <div className="text-2xl font-bold text-white/95">
          {total}
        </div>
        <p className="text-[10px] text-white/60 mt-0.5 truncate font-medium">
          {total === 1 ? 'appointment' : 'appointments'} today
        </p>
      </div>
      <div className="absolute bottom-2 right-3 opacity-40">
        <svg width="50" height="32" viewBox="0 0 50 32">
          <defs>
            <filter id="glow-mini">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle 
            cx="10" 
            cy="22" 
            r="4" 
            fill="oklch(0.70 0.20 210)" 
            filter="url(#glow-mini)"
            className="drop-shadow-[0_0_6px_oklch(0.70_0.20_210)]"
          />
          <circle 
            cx="25" 
            cy="14" 
            r="5" 
            fill="oklch(0.70 0.20 210)" 
            filter="url(#glow-mini)"
            className="drop-shadow-[0_0_6px_oklch(0.70_0.20_210)]"
          />
          <circle 
            cx="40" 
            cy="18" 
            r="4.5" 
            fill="oklch(0.70 0.20 210)" 
            filter="url(#glow-mini)"
            className="drop-shadow-[0_0_6px_oklch(0.70_0.20_210)]"
          />
          {cancelled > 0 && (
            <circle 
              cx="17" 
              cy="26" 
              r="2.5" 
              fill="oklch(0.60 0.25 30)" 
              filter="url(#glow-mini)"
              className="drop-shadow-[0_0_4px_oklch(0.60_0.25_30)]"
            />
          )}
          {noShows > 0 && (
            <circle 
              cx="33" 
              cy="24" 
              r="2.5" 
              fill="oklch(0.60 0.25 30)" 
              filter="url(#glow-mini)"
              className="drop-shadow-[0_0_4px_oklch(0.60_0.25_30)]"
            />
          )}
        </svg>
      </div>
    </div>
  )
}
