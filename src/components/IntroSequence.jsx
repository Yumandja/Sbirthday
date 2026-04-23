import { useEffect, useState } from 'react'

// Sequence: "HAPPY" → "24" → "BIRTHDAY" → "PRINCESS" → fade out
const STEPS = [
  { text: 'HAPPY',     duration: 1200 },
  { text: '24',        duration: 1000 },
  { text: 'BIRTHDAY',  duration: 1200 },
  { text: 'PRINCESS',  duration: 1400 },
  { text: null,        duration: 800  }, // fade out
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
  font-size: clamp(64px, 18vw, 160px);
  color: #ff2d9f;
  letter-spacing: 6px;
  animation: introFadeIn 0.4s ease forwards, introGlitch 1.5s ease-in-out infinite;
  user-select: none;
}
@keyframes skipPulse {
  0%,100% { opacity: .4 }
  50% { opacity: .8 }
}
`

export default function IntroSequence({ onDone }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let timeout
    const advance = (idx) => {
      if (idx >= STEPS.length) { onDone(); return }
      setStepIdx(idx)
      setVisible(true)
      timeout = setTimeout(() => {
        setVisible(false)
        setTimeout(() => advance(idx + 1), 300)
      }, STEPS[idx].duration)
    }
    advance(0)
    return () => clearTimeout(timeout)
  }, [onDone])

  const current = STEPS[stepIdx]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
    }}>
      <style>{css}</style>

      {current?.text && (
        <span
          className="intro-text"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        >
          {current.text}
        </span>
      )}

      {/* Skip button */}
      <button
        onClick={onDone}
        style={{
          position: 'fixed', bottom: 32, right: 24,
          background: 'rgba(255,45,159,.15)',
          border: '1px solid rgba(255,45,159,.4)',
          color: '#ff9de2',
          padding: '8px 20px', borderRadius: '30px',
          cursor: 'pointer', fontSize: '13px',
          fontFamily: 'monospace', letterSpacing: '2px',
          animation: 'skipPulse 2s ease-in-out infinite',
          zIndex: 20,
        }}
      >
        SKIP →
      </button>
    </div>
  )
}
