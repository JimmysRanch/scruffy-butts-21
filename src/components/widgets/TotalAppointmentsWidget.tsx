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
    <div className="relative z-10 h-full flex flex-col items-center justify-center py-6 px-4">
      <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-center mb-8 text-white/70" style={{
        textShadow: '0 0 20px oklch(0.65 0.20 240 / 0.6)',
        letterSpacing: '0.25em'
      }}>
        TOTAL APPOINTMENTS
      </h3>
      
      <div className="relative w-[280px] h-[280px] flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="glow-blue">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-orange">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.70 0.25 240)" stopOpacity="1"/>
              <stop offset="50%" stopColor="oklch(0.65 0.28 220)" stopOpacity="1"/>
              <stop offset="100%" stopColor="oklch(0.60 0.22 200)" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.65 0.25 40)" stopOpacity="1"/>
              <stop offset="50%" stopColor="oklch(0.60 0.28 30)" stopOpacity="1"/>
              <stop offset="100%" stopColor="oklch(0.55 0.22 20)" stopOpacity="1"/>
            </linearGradient>
          </defs>
          
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="oklch(0.20 0.10 240 / 0.3)"
            strokeWidth="12"
          />
          
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="oklch(0.25 0.10 240 / 0.4)"
            strokeWidth="12"
            strokeDasharray="440"
            strokeDashoffset="0"
            opacity="0.5"
          />
          
          {completedAngle > 0 && (
            <>
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="url(#blueGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(completedAngle / 360) * 440} 440`}
                filter="url(#glow-blue)"
                style={{
                  transition: 'stroke-dasharray 1s ease-out'
                }}
              />
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="url(#blueGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${(completedAngle / 360) * 490} 490`}
                opacity="0.4"
                style={{
                  transition: 'stroke-dasharray 1s ease-out'
                }}
              />
              <circle
                cx="100"
                cy="100"
                r="62"
                fill="none"
                stroke="url(#blueGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${(completedAngle / 360) * 390} 390`}
                opacity="0.3"
                style={{
                  transition: 'stroke-dasharray 1s ease-out'
                }}
              />
            </>
          )}
          
          {cancelledAngle > 0 && (
            <>
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="url(#orangeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(cancelledAngle / 360) * 440} 440`}
                strokeDashoffset={-((startCancelledAngle / 360) * 440)}
                filter="url(#glow-orange)"
                style={{
                  transition: 'stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out'
                }}
              />
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="url(#orangeGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${(cancelledAngle / 360) * 490} 490`}
                strokeDashoffset={-((startCancelledAngle / 360) * 490)}
                opacity="0.4"
                style={{
                  transition: 'stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out'
                }}
              />
              <circle
                cx="100"
                cy="100"
                r="62"
                fill="none"
                stroke="url(#orangeGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${(cancelledAngle / 360) * 390} 390`}
                strokeDashoffset={-((startCancelledAngle / 360) * 390)}
                opacity="0.3"
                style={{
                  transition: 'stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out'
                }}
              />
            </>
          )}
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-8xl font-bold text-white tracking-tight leading-none mb-1" style={{
            textShadow: '0 0 40px oklch(0.70 0.25 240 / 0.8), 0 0 20px oklch(0.70 0.25 240 / 0.6)',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {total}
          </div>
          <div className="text-3xl font-bold uppercase tracking-widest" style={{
            color: 'oklch(0.65 0.22 220)',
            textShadow: '0 0 20px oklch(0.65 0.22 220 / 0.8)',
            letterSpacing: '0.2em'
          }}>
            TOTAL
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full max-w-[280px] mt-8 px-4">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-red-500 mb-1" style={{
            textShadow: '0 0 20px oklch(0.60 0.25 30 / 0.8)',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {cancelled}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-red-400" style={{
            textShadow: '0 0 10px oklch(0.60 0.25 30 / 0.6)',
            letterSpacing: '0.15em'
          }}>
            CANCELED
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-red-500 mb-1" style={{
            textShadow: '0 0 20px oklch(0.60 0.25 30 / 0.8)',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {noShows}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-red-400" style={{
            textShadow: '0 0 10px oklch(0.60 0.25 30 / 0.6)',
            letterSpacing: '0.15em'
          }}>
            NO-SHOWS
          </div>
        </div>
      </div>
    </div>
  )
}
