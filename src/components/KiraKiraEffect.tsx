import { useEffect, useRef } from 'react'

interface Glitter {
  baseX: number
  baseY: number
  x: number
  y: number
  size: number
  opacity: number
  baseOpacity: number
  rotation: number
  rotationSpeed: number
  color: { r: number; g: number; b: number }
  shimmerPhase: number
  shimmerSpeed: number
  sparkleIntensity: number
  shape: 'diamond' | 'hexagon' | 'square' | 'star'
}

export function KiraKiraEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const glitters: Glitter[] = []
    let animationFrameId: number
    let scrollVelocity = 0
    let lastScrollY = window.scrollY
    let tiltX = 0
    let tiltY = 0

    const glitterColors = [
      { r: 255, g: 255, b: 255 },
      { r: 220, g: 200, b: 255 },
      { r: 200, g: 220, b: 255 },
      { r: 255, g: 220, b: 240 },
      { r: 240, g: 240, b: 255 },
      { r: 200, g: 180, b: 255 },
      { r: 180, g: 200, b: 255 },
    ]

    const resizeCanvas = () => {
      const oldWidth = canvas.width
      const oldHeight = canvas.height
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
      
      if (oldWidth > 0) {
        glitters.forEach(glitter => {
          glitter.baseX = (glitter.baseX / oldWidth) * canvas.width
          glitter.baseY = (glitter.baseY / oldHeight) * canvas.height
          glitter.x = glitter.baseX
          glitter.y = glitter.baseY
        })
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const createGlitter = (): Glitter => {
      const shapes: Array<'diamond' | 'hexagon' | 'square' | 'star'> = ['diamond', 'hexagon', 'square', 'star']
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      return {
        baseX: x,
        baseY: y,
        x,
        y,
        size: Math.random() * 3 + 1,
        opacity: 0,
        baseOpacity: Math.random() * 0.3 + 0.15,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        color: glitterColors[Math.floor(Math.random() * glitterColors.length)],
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: Math.random() * 0.12 + 0.08,
        sparkleIntensity: 0,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      }
    }

    for (let i = 0; i < 150; i++) {
      glitters.push(createGlitter())
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      scrollVelocity = Math.abs(currentScrollY - lastScrollY)
      lastScrollY = currentScrollY
      
      glitters.forEach(glitter => {
        if (Math.random() < 0.3) {
          glitter.sparkleIntensity = Math.min(1, scrollVelocity / 10)
        }
      })
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null && event.beta !== null) {
        tiltX = event.gamma / 90
        tiltY = event.beta / 90
        
        glitters.forEach(glitter => {
          if (Math.random() < 0.2) {
            glitter.sparkleIntensity = Math.max(glitter.sparkleIntensity, 0.7)
          }
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('deviceorientation', handleOrientation)

    const drawDiamond = (size: number) => {
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.lineTo(size * 0.6, 0)
      ctx.lineTo(0, size)
      ctx.lineTo(-size * 0.6, 0)
      ctx.closePath()
    }

    const drawHexagon = (size: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const x = size * Math.cos(angle)
        const y = size * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
    }

    const drawSquare = (size: number) => {
      ctx.beginPath()
      ctx.rect(-size * 0.7, -size * 0.7, size * 1.4, size * 1.4)
      ctx.closePath()
    }

    const drawStar = (size: number) => {
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i
        const radius = i % 2 === 0 ? size : size * 0.4
        const x = radius * Math.cos(angle - Math.PI / 2)
        const y = radius * Math.sin(angle - Math.PI / 2)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
    }

    const drawGlitter = (glitter: Glitter) => {
      ctx.save()
      ctx.translate(glitter.x, glitter.y)
      ctx.rotate(glitter.rotation)

      const shimmer = Math.sin(glitter.shimmerPhase) * 0.3 + 0.7
      const finalOpacity = glitter.opacity * shimmer

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glitter.size * 1.5)
      gradient.addColorStop(0, `rgba(${glitter.color.r}, ${glitter.color.g}, ${glitter.color.b}, ${finalOpacity})`)
      gradient.addColorStop(0.5, `rgba(${glitter.color.r}, ${glitter.color.g}, ${glitter.color.b}, ${finalOpacity * 0.6})`)
      gradient.addColorStop(1, `rgba(${glitter.color.r}, ${glitter.color.g}, ${glitter.color.b}, 0)`)

      ctx.fillStyle = gradient

      switch (glitter.shape) {
        case 'diamond':
          drawDiamond(glitter.size)
          break
        case 'hexagon':
          drawHexagon(glitter.size)
          break
        case 'square':
          drawSquare(glitter.size)
          break
        case 'star':
          drawStar(glitter.size)
          break
      }

      ctx.fill()

      ctx.shadowBlur = glitter.size * 2
      ctx.shadowColor = `rgba(${glitter.color.r}, ${glitter.color.g}, ${glitter.color.b}, ${finalOpacity * 0.8})`
      ctx.fill()

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.save()
      ctx.translate(0, -window.scrollY)

      scrollVelocity *= 0.9

      glitters.forEach((glitter) => {
        glitter.rotation += glitter.rotationSpeed
        glitter.shimmerPhase += glitter.shimmerSpeed
        
        glitter.x = glitter.baseX + (tiltX * 15)
        glitter.y = glitter.baseY + (tiltY * 15)
        
        glitter.sparkleIntensity *= 0.92
        
        const shimmer = Math.sin(glitter.shimmerPhase) * 0.5 + 0.5
        const sparkle = Math.pow(glitter.sparkleIntensity, 1.5)
        
        glitter.opacity = glitter.baseOpacity + (shimmer * 0.3) + (sparkle * 0.8)

        drawGlitter(glitter)
      })
      
      ctx.restore()

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('deviceorientation', handleOrientation)
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
