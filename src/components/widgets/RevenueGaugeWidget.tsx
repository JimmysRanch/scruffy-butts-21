import { useKV } from '@github/spark/hooks'
import { useMemo } from 'react'

interface Transaction {
  id: string
  total: number
  timestamp: Date | string
}

export function RevenueGaugeWidget() {
  const [transactions] = useKV<Transaction[]>('transactions', [])

  const { todayRevenue, expectedRevenue } = useMemo(() => {
    if (!transactions) return { todayRevenue: 150, expectedRevenue: 300 }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    const todayRevenue = transactions
      .filter(t => {
        try {
          const date = new Date(t.timestamp)
          if (isNaN(date.getTime())) return false
          return date >= todayStart && date <= todayEnd
        } catch {
          return false
        }
      })
      .reduce((sum, t) => sum + t.total, 0)

    const expectedRevenue = 300

    return { todayRevenue: todayRevenue || 150, expectedRevenue }
  }, [transactions])

  const progressPercentage = Math.min((todayRevenue / expectedRevenue) * 100, 100)
  
  const radius = 50
  const strokeWidth = 20
  const center = 70
  const startAngle = -180
  const endAngle = 0
  const arcLength = ((endAngle - startAngle) / 360) * (2 * Math.PI * radius)
  const progressLength = (progressPercentage / 100) * arcLength

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ")
  }

  const backgroundPath = describeArc(center, center, radius, startAngle, endAngle)
  const progressPath = describeArc(center, center, radius, startAngle, startAngle + (progressPercentage / 100) * (endAngle - startAngle))

  return (
    <div className="relative z-10 h-full flex flex-col">
      <div className="flex flex-col space-y-0 pb-0 pt-3 px-4">
        <h3 className="text-sm font-bold tracking-tight text-white/95">Revenue</h3>
        <p className="text-[10px] text-white/60 font-medium">Today</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-end pb-3 px-4 pt-2">
        <div className="relative w-full" style={{ maxWidth: '140px' }}>
          <svg width="140" height="80" viewBox="0 0 140 80" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="halfGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.60 0.24 220)" />
                <stop offset="50%" stopColor="oklch(0.65 0.25 230)" />
                <stop offset="100%" stopColor="oklch(0.70 0.26 240)" />
              </linearGradient>
              <filter id="gaugeGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <path
              d={backgroundPath}
              fill="none"
              stroke="oklch(0.25 0.08 240 / 0.4)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            <path
              d={progressPath}
              fill="none"
              stroke="url(#halfGaugeGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter="url(#gaugeGlow)"
              className="drop-shadow-[0_0_12px_oklch(0.65_0.25_230)]"
            />
            
            <circle
              cx={center}
              cy={center}
              r="4"
              fill="oklch(0.95 0.02 240 / 0.8)"
              className="drop-shadow-[0_0_4px_oklch(0.95_0.02_240)]"
            />
          </svg>
        </div>
        
        <div className="flex items-end justify-between w-full mt-2 px-1">
          <div className="flex flex-col items-start">
            <div className="text-3xl font-bold text-white/95 leading-none">
              ${Math.round(todayRevenue)}
            </div>
            <div className="text-[10px] text-white/60 font-medium mt-1">Actual</div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-xl font-bold text-white/70 leading-none">
              {expectedRevenue}
            </div>
            <div className="text-[10px] text-white/60 font-medium mt-1">Expected</div>
          </div>
        </div>
      </div>
    </div>
  )
}
