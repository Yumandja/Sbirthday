import { useEffect, useRef, useState } from 'react'

const css = `
@keyframes musicPulse {
  0%,100% { transform: scale(1); box-shadow: 0 0 12px rgba(255,45,159,.4); }
  50%      { transform: scale(1.08); box-shadow: 0 0 24px rgba(255,45,159,.8), 0 0 40px rgba(255,45,159,.3); }
}
@keyframes barDance {
  0%,100% { height: 4px; }
  50%      { height: var(--h); }
}
@keyframes fadeSlide {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
.music-btn {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, #ff2d9f, #8800cc);
  border: none; cursor: pointer; color: white;
  font-size: 18px; display: flex; align-items: center; justify-content: center;
  transition: all .25s;
  flex-shrink: 0;
}
.music-btn:hover { filter: brightness(1.2); }
.music-btn.playing { animation: musicPulse 1.6s ease-in-out infinite; }
.eq-bars {
  display: flex; align-items: flex-end; gap: 3px; height: 20px;
}
.eq-bar {
  width: 3px; background: #ff2d9f; border-radius: 2px;
  animation: barDance var(--spd) ease-in-out infinite var(--delay);
}
`

export default function MusicPlayer({ src, songName }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [showVol, setShowVol] = useState(false)

  // Try autoplay as soon as src is ready
  useEffect(() => {
    if (!src || !audioRef.current) return
    const audio = audioRef.current
    audio.volume = volume
    audio.loop = true

    const tryPlay = () => {
      audio.play()
        .then(() => { setPlaying(true); setReady(true) })
        .catch(() => {
          // Autoplay blocked → wait for first user interaction
          setReady(true)
          const handler = () => {
            audio.play().then(() => setPlaying(true)).catch(() => {})
            window.removeEventListener('click', handler)
            window.removeEventListener('touchstart', handler)
          }
          window.addEventListener('click', handler, { once: true })
          window.addEventListener('touchstart', handler, { once: true })
        })
    }

    if (audio.readyState >= 2) tryPlay()
    else audio.addEventListener('canplay', tryPlay, { once: true })
  }, [src])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  if (!src) return null

  const barSpeeds = ['0.6s','0.8s','0.5s','0.9s','0.7s']
  const barHeights = ['16px','12px','20px','10px','18px']
  const barDelays = ['0s','0.15s','0.05s','0.25s','0.1s']

  return (
    <>
      <style>{css}</style>
      <audio ref={audioRef} src={src} preload="auto" />

      <div style={{
        position: 'fixed', bottom: '76px', right: '20px',
        zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
        animation: 'fadeSlide .5s ease forwards',
      }}>
        {/* Volume slider */}
        {showVol && (
          <div style={{
            background: 'rgba(10,0,20,.92)',
            border: '1px solid rgba(255,45,159,.3)',
            borderRadius: '16px', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: '10px',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{ fontSize: '14px' }}>🔈</span>
            <input
              type="range" min="0" max="1" step="0.05"
              value={volume} onChange={handleVolume}
              style={{ width: '90px', accentColor: '#ff2d9f', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>🔊</span>
          </div>
        )}

        {/* Player bar */}
        <div style={{
          background: 'rgba(10,0,20,.92)',
          border: '1px solid rgba(255,45,159,.3)',
          borderRadius: '30px', padding: '8px 14px 8px 8px',
          display: 'flex', alignItems: 'center', gap: '12px',
          backdropFilter: 'blur(10px)',
          maxWidth: '260px',
          cursor: 'default',
        }}>
          {/* Play / Pause */}
          <button className={`music-btn${playing ? ' playing' : ''}`} onClick={toggle}>
            {playing ? '⏸' : '▶️'}
          </button>

          {/* EQ bars (only when playing) */}
          {playing && (
            <div className="eq-bars">
              {barSpeeds.map((spd, i) => (
                <div key={i} className="eq-bar"
                  style={{ '--spd': spd, '--h': barHeights[i], '--delay': barDelays[i] }} />
              ))}
            </div>
          )}

          {/* Song name */}
          <span style={{
            color: '#ff9de2', fontSize: '12px', fontFamily: 'monospace',
            letterSpacing: '.5px', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', maxWidth: '110px',
          }}>
            {playing ? (songName || 'musique') : 'en pause'}
          </span>

          {/* Volume toggle */}
          <button
            onClick={() => setShowVol(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px' }}
          >
            🎚️
          </button>
        </div>
      </div>
    </>
  )
}
