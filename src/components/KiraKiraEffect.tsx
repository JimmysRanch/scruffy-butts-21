import { useEffect, useRef } from 'react'

interface Glitter {
  x: number
  y: number
  size: number
  opacity: number
  life: number
  maxLife: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: { r: number; g: number; b: number }
  shimmerPhase: number
  shimmerSpeed: number
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
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const createGlitter = (): Glitter => {
      const shapes: Array<'diamond' | 'hexagon' | 'square' | 'star'> = ['diamond', 'hexagon', 'square', 'star']
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.8,
        opacity: 0,
        life: 0,
        maxLife: Math.random() * 180 + 120,
        vx: (Math.random() - 0.5) * 0.2,
        vy: Math.random() * 0.3 + 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        color: glitterColors[Math.floor(Math.random() * glitterColors.length)],
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: Math.random() * 0.08 + 0.04,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      }
    }

    for (let i = 0; i < 60; i++) {
      glitters.push(createGlitter())
    }

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

      glitters.forEach((glitter, index) => {
        glitter.life++
        glitter.x += glitter.vx
        glitter.y += glitter.vy
        glitter.rotation += glitter.rotationSpeed
        glitter.shimmerPhase += glitter.shimmerSpeed

        const lifeProgress = glitter.life / glitter.maxLife

        if (lifeProgress < 0.15) {
          glitter.opacity = lifeProgress * 6.67
        } else if (lifeProgress > 0.85) {
          glitter.opacity = (1 - lifeProgress) * 6.67
        } else {
          glitter.opacity = 1
        }

        glitter.opacity *= 0.5

        if (glitter.x < -20 || glitter.x > canvas.width + 20 || 
            glitter.y < -20 || glitter.y > canvas.height + 20 || 
            glitter.life >= glitter.maxLife) {
          glitters[index] = createGlitter()
        }

        drawGlitter(glitter)
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
