import { useEffect, useRef } from 'react'

export default function SnowCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')

    let animationFrameId
    let canvasWidth = window.innerWidth
    let canvasHeight = window.innerHeight

    const handleResize = () => {
      if (!canvas) return
      canvasWidth = window.innerWidth
      canvasHeight = window.innerHeight
      canvas.width = canvasWidth
      canvas.height = canvasHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Number of particles (snowflakes + glowing ice crystals)
    const numberOfParticles = 55
    const particles = []

    // Palette: Ice blue, cyan, frost white, vivid sapphire
    const iceColors = [
      'rgba(186, 230, 253,', // light cyan/frost
      'rgba(125, 211, 252,', // sky blue
      'rgba(56, 189, 248,',  // cyan glow
      'rgba(14, 165, 233,',  // electric blue
      'rgba(240, 249, 255,', // pure white frost
      'rgba(96, 165, 250,',  // soft sapphire
    ]

    function getRandomInt(min, max, exept) {
      const i = Math.floor(Math.random() * (max - min + 1)) + min
      if (typeof exept === 'undefined') return i
      if (typeof exept === 'number' && i === exept) return getRandomInt(min, max, exept)
      if (typeof exept === 'object' && i >= exept[0] && i <= exept[1]) return getRandomInt(min, max, exept)
      return i
    }

    class IceParticle {
      constructor(id) {
        this.id = id
        this.reset(true)
      }

      reset(initial = false) {
        this.isSnow = Math.random() > 0.4 // 60% snow, 40% glowing floating crystals
        this.size = this.isSnow ? getRandomInt(1, 3.5) : getRandomInt(2, 5)
        this.x = Math.random() * canvas.width
        this.y = initial ? Math.random() * canvas.height : (this.isSnow ? -10 : canvas.height + 10)
        
        // Speed & drift
        this.speedY = this.isSnow ? (Math.random() * 0.8 + 0.4) : -(Math.random() * 0.5 + 0.2)
        this.speedX = (Math.random() - 0.5) * 0.6
        this.swingAmp = Math.random() * 1.5 + 0.5
        this.swingSpeed = Math.random() * 0.02 + 0.01
        this.swingStep = Math.random() * Math.PI * 2
        
        this.alpha = Math.random() * 0.6 + 0.3
        this.maxAlpha = this.alpha
        this.alphaSpeed = Math.random() * 0.005 + 0.002
        this.alphaDir = Math.random() > 0.5 ? 1 : -1
        this.color = iceColors[Math.floor(Math.random() * iceColors.length)]
        this.shadowBlur = this.isSnow ? getRandomInt(4, 10) : getRandomInt(10, 24)
      }

      update() {
        this.swingStep += this.swingSpeed
        this.x += this.speedX + Math.sin(this.swingStep) * (this.swingAmp * 0.4)
        this.y += this.speedY

        // Alpha pulsing
        this.alpha += this.alphaDir * this.alphaSpeed
        if (this.alpha >= this.maxAlpha) {
          this.alpha = this.maxAlpha
          this.alphaDir = -1
        } else if (this.alpha <= 0.15) {
          this.alpha = 0.15
          this.alphaDir = 1
        }

        // Out of bounds reset
        if (this.isSnow && this.y > canvas.height + 10) {
          this.reset(false)
        } else if (!this.isSnow && this.y < -10) {
          this.reset(false)
        }

        if (this.x < -20) this.x = canvas.width + 10
        if (this.x > canvas.width + 20) this.x = -10

        this.draw()
      }

      draw() {
        context.beginPath()
        context.fillStyle = this.color + Math.max(0, this.alpha) + ')'
        context.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false)
        context.shadowColor = this.color + Math.max(0, this.alpha) + ')'
        context.shadowBlur = this.shadowBlur
        context.shadowOffsetX = 0
        context.shadowOffsetY = 0
        context.fill()
      }
    }

    for (let i = 0; i < numberOfParticles; i++) {
      particles.push(new IceParticle(i))
    }

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="firefly-bg-canvas" />
}

