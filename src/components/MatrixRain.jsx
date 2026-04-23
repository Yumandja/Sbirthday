import { useEffect, useRef } from 'react'

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ♥✦★'

export default function MatrixRain({ opacity = 1 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const fontSize = 14
    let cols = Math.floor(canvas.width / fontSize)
    let drops = Array(cols).fill(1).map(() => Math.random() * -100)

    const draw = () => {
      // Dark fade trail
      ctx.fillStyle = 'rgba(5, 0, 12, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      cols = Math.floor(canvas.width / fontSize)
      if (drops.length !== cols) {
        drops = Array(cols).fill(1).map(() => Math.random() * -100)
      }

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x = i * fontSize

        // Bright head
        const isHead = drops[i] * fontSize > 0 && drops[i] * fontSize < canvas.height
        if (isHead) {
          ctx.fillStyle = '#ff9de2'
          ctx.font = `bold ${fontSize}px monospace`
        } else {
          // Vary brightness for depth
          const brightness = Math.random() * 0.6 + 0.4
          const r = Math.floor(180 * brightness)
          const g = Math.floor(0 * brightness)
          const b = Math.floor(120 * brightness)
          ctx.fillStyle = `rgba(${r},${g},${b},0.85)`
          ctx.font = `${fontSize}px monospace`
        }

        ctx.fillText(char, x, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i] += 0.5
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        opacity,
        transition: 'opacity 1s ease',
      }}
    />
  )
}
