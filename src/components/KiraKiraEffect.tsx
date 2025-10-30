import { useEffect, useRef } from 'react'

interface Sparkle {
  x: number
  y: number
  size: number
  opacity: number
  life: number
  maxLife: number
  vx: number
  vy: number
}

export function KiraKiraEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sparkles: Sparkle[] = []
    let animationFrameId: number

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const createSparkle = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        opacity: 0,
        life: 0,
        maxLife: Math.random() * 120 + 80,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }
    }

    for (let i = 0; i < 40; i++) {
      sparkles.push(createSparkle())
    }

    const drawSparkle = (sparkle: Sparkle) => {
      ctx.save()
      ctx.translate(sparkle.x, sparkle.y)
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sparkle.size)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${sparkle.opacity})`)
      gradient.addColorStop(0.4, `rgba(200, 180, 255, ${sparkle.opacity * 0.6})`)
      gradient.addColorStop(1, `rgba(180, 200, 255, 0)`)
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, sparkle.size, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(255, 255, 255, ${sparkle.opacity * 0.8})`
      ctx.beginPath()
      ctx.moveTo(-sparkle.size * 1.2, 0)
      ctx.lineTo(sparkle.size * 1.2, 0)
      ctx.moveTo(0, -sparkle.size * 1.2)
      ctx.lineTo(0, sparkle.size * 1.2)
      ctx.lineWidth = 0.5
      ctx.strokeStyle = `rgba(255, 255, 255, ${sparkle.opacity * 0.8})`
      ctx.stroke()

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      sparkles.forEach((sparkle, index) => {
        sparkle.life++
        sparkle.x += sparkle.vx
        sparkle.y += sparkle.vy

        const lifeProgress = sparkle.life / sparkle.maxLife
        
        if (lifeProgress < 0.2) {
          sparkle.opacity = lifeProgress * 5
        } else if (lifeProgress > 0.8) {
          sparkle.opacity = (1 - lifeProgress) * 5
        } else {
          sparkle.opacity = 1
        }

        sparkle.opacity *= 0.4

        if (sparkle.x < -10 || sparkle.x > canvas.width + 10 || 
            sparkle.y < -10 || sparkle.y > canvas.height + 10 || 
            sparkle.life >= sparkle.maxLife) {
          sparkles[index] = createSparkle()
        }

        drawSparkle(sparkle)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
