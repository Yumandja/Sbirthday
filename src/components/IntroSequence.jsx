import { useEffect, useRef, useState } from 'react'

const STEPS = [
  { text: 'Hi, Princess',         duration: 2500 },
  { text: 'Happy Birthday',        duration: 2500 },
  { text: 'I love you so much',    duration: 2500 },
  { text: null,                    duration: 600  },
]

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

@keyframes introFadeIn {
  0%   { opacity: 0; transform: scale(0.6); }
  40%  { opacity: 1; transform: scale(1.08); }
  70%  { transform: scale(1); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes introGlitch {
  0%,100% { text-shadow: 0 0 30px #ff2d9f, 0 0 60px #ff2d9f; }
  20% { text-shadow: -4px 0 #ff69d4, 4px 0 #b000ff, 0 0 60px #ff2d9f; }
  40% { text-shadow: 4px 0 #ff69d4, -4px 0 #b000ff, 0 0 60px #ff2d9f; }
  60% { text-shadow: 0 0 30px #ff2d9f, 0 0 80px #ff2d9f; }
}
.intro-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(52px, 14vw, 130px);
  color: #ff2d9f;
  letter-spacing: 5px;
  text-align: center;
  padding: 0 20px;
  animation: introFadeIn 0.5s ease forwards, introGlitch 2s ease-in-out infinite;
  user-select: none;
}

/* ── Glitter particles ── */
@keyframes glitterFly {
  0%   { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0); opacity: 0; }
}
.glitter-particle {
  position: fixed;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: var(--color);
  pointer-events: none;
  animation: glitterFly var(--dur) var(--delay) ease-out forwards;
  z-index: 50;
}
@keyframes glitterBurst {
  0%   { opacity: 1; transform: scale(0.2); }
  60%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.2); }
}
.glitter-ring {
  position: fixed;
  border-radius: 50%;
  border: 2px solid rgba(255,45,159,.6);
  pointer-events: none;
  animation: glitterBurst 1s ease-out forwards;
  z-index: 49;
}
`

/* ── Generate glitter particles data once ── */
const COLORS = [
  '#ff2d9f', '#ff9de2', '#ffcc00', '#fff', '#b000ff',
  '#ff69d4', '#00e5ff', '#ffe066', '#ff6fd8', '#c0f',
]
const PARTICLE_COUNT = 120
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = Math.random() * 360
  const dist = 80 + Math.random() * 260
  const rad = (angle * Math.PI) / 180
  return {
    id: i,
    left: `${40 + Math.random() * 20}vw`,
    top:  `${35 + Math.random() * 30}vh`,
    size: `${3 + Math.random() * 7}px`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    dx: `${Math.cos(rad) * dist}px`,
    dy: `${Math.sin(rad) * dist}px`,
    rot: `${Math.random() * 720 - 360}deg`,
    dur: `${0.6 + Math.random() * 0.9}s`,
    delay: `${Math.random() * 0.3}s`,
  }
})

const RINGS = [
  { size: 80,  delay: '0s',   dur: '0.9s'  },
  { size: 160, delay: '0.1s', dur: '1.0s'  },
  { size: 260, delay: '0.2s', dur: '1.1s'  },
]

export default function IntroSequence({ onDone }) {
  const [stepIdx, setStepIdx]       = useState(0)
  const [visible, setVisible]       = useState(true)
  const [showGlitter, setShowGlitter] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const advance = (idx) => {
      if (idx >= STEPS.length) {
        /* show glitter burst before calling onDone */
        setShowGlitter(true)
        timeoutRef.current = setTimeout(() => onDone(), 1200)
        return
      }
      setStepIdx(idx)
      setVisible(true)
      timeoutRef.current = setTimeout(() => {
        setVisible(false)
        timeoutRef.current = setTimeout(() => advance(idx + 1), 350)
      }, STEPS[idx].duration)
    }
    advance(0)
    return () => clearTimeout(timeoutRef.current)
  }, [onDone])

  const current = STEPS[stepIdx]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{css}</style>

      {/* ── Step text ── */}
      {current?.text && (
        <span
          className="intro-text"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
        >
          {current.text}
        </span>
      )}

      {/* ── Glitter explosion ── */}
      {showGlitter && (
        <>
          {/* Expanding rings */}
          {RINGS.map((r, i) => (
            <div
              key={i}
              className="glitter-ring"
              style={{
                width: r.size, height: r.size,
                left: `calc(50% - ${r.size / 2}px)`,
                top:  `calc(50% - ${r.size / 2}px)`,
                animationDuration: r.dur,
                animationDelay: r.delay,
              }}
            />
          ))}

          {/* Flying particles */}
          {particles.map(p => (
            <div
              key={p.id}
              className="glitter-particle"
              style={{
                left: p.left, top: p.top,
                '--size': p.size, '--color': p.color,
                '--dx': p.dx, '--dy': p.dy,
                '--rot': p.rot, '--dur': p.dur,
                '--delay': p.delay,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
