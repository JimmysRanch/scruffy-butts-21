import React from 'react'

interface RevenueTodayGaugeProps {
  actual: number
  expected: number
  currency?: string
  title?: string
  subtitle?: string
}

export function RevenueTodayGauge({
  actual,
  expected,
  currency = '$',
  title = 'Revenue',
  subtitle = 'Today'
}: RevenueTodayGaugeProps) {
  const progress = Math.max(0, Math.min(1, expected > 0 ? actual / expected : 0))
  const percentage = Math.round(progress * 100)

  const radius = 160
  const centerX = 200
  const centerY = 200
  const strokeWidth = 28
  const innerRadius = radius - strokeWidth

  const startAngle = Math.PI
  const endAngle = Math.PI * (1 - progress)

  const polarToCartesian = (angle: number, r: number) => {
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY - r * Math.sin(angle)
    }
  }

  const trackStart = polarToCartesian(startAngle, radius)
  const trackEnd = polarToCartesian(0, radius)
  const trackInnerStart = polarToCartesian(0, innerRadius)
  const trackInnerEnd = polarToCartesian(startAngle, innerRadius)

  const trackPath = `
    M ${trackStart.x} ${trackStart.y}
    A ${radius} ${radius} 0 0 1 ${trackEnd.x} ${trackEnd.y}
    L ${trackInnerStart.x} ${trackInnerStart.y}
    A ${innerRadius} ${innerRadius} 0 0 0 ${trackInnerEnd.x} ${trackInnerEnd.y}
    Z
  `

  const progressStart = polarToCartesian(startAngle, radius)
  const progressEnd = polarToCartesian(endAngle, radius)
  const progressInnerStart = polarToCartesian(endAngle, innerRadius)
  const progressInnerEnd = polarToCartesian(startAngle, innerRadius)

  const largeArcFlag = progress > 0.5 ? 1 : 0

  const progressPath = progress > 0 ? `
    M ${progressStart.x} ${progressStart.y}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${progressEnd.x} ${progressEnd.y}
    L ${progressInnerStart.x} ${progressInnerStart.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${progressInnerEnd.x} ${progressInnerEnd.y}
    Z
  ` : ''

  const needleEnd = polarToCartesian(endAngle, innerRadius - 4)
  const needleBob = polarToCartesian(endAngle, innerRadius - 8)

  const formatCurrency = (value: number) => {
    if (currency === '$') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return `${currency}${value}`
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 225"
        className="w-full h-full"
        role="img"
        aria-label={`${title} ${subtitle}: ${formatCurrency(actual)} actual out of ${formatCurrency(expected)} expected (${percentage}%)`}
      >
        <title>{`${title} ${subtitle}: ${percentage}% of target`}</title>
        
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.60 0.22 210)" />
            <stop offset="100%" stopColor="oklch(0.75 0.20 200)" />
          </linearGradient>
        </defs>

        <text x="20" y="30" fontSize="20" fontWeight="400" fill="#222" fontFamily="system-ui, -apple-system, sans-serif">
          {title}
        </text>
        <text x="20" y="52" fontSize="16" fontWeight="400" fill="#666" fontFamily="system-ui, -apple-system, sans-serif">
          {subtitle}
        </text>

        <path
          d={trackPath}
          fill="#E9EEF5"
        />

        {progress > 0 && (
          <path
            d={progressPath}
            fill="url(#progressGradient)"
          />
        )}

        <line
          x1={centerX}
          y1={centerY}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="#222"
          strokeWidth="1.5"
        />

        <circle
          cx={needleBob.x}
          cy={needleBob.y}
          r="4"
          fill="#222"
        />

        <text x="20" y="215" fontSize="14" fontWeight="400" fill="#888" fontFamily="system-ui, -apple-system, sans-serif">
          0
        </text>

        <g transform="translate(200, 185)">
          <text x="0" y="0" fontSize="48" fontWeight="600" fill="#111" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">
            {formatCurrency(actual)}
          </text>
          <text x="0" y="18" fontSize="13" fontWeight="400" fill="#666" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">
            Actual
          </text>
        </g>

        <g transform="translate(380, 210)">
          <text x="0" y="0" fontSize="18" fontWeight="500" fill="#222" textAnchor="end" fontFamily="system-ui, -apple-system, sans-serif">
            {expected}
          </text>
          <text x="0" y="15" fontSize="12" fontWeight="400" fill="#666" textAnchor="end" fontFamily="system-ui, -apple-system, sans-serif">
            Expected
          </text>
        </g>
      </svg>
    </div>
  )
}
