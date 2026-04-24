import { useEffect, useRef, useState } from 'react'

const css = `
@keyframes barDance {
  0%,100% { height: 4px; }
  50%      { height: var(--h); }
}
@keyframes fadeSlide {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
.eq-bars { display:flex; align-items:flex-end; gap:3px; height:20px; }
.eq-bar  { width:3px; background:#ff2d9f; border-radius:2px; animation:barDance var(--spd) ease-in-out infinite var(--delay); }
`

const BAR_SPEEDS  = ['0.6s','0.8s','0.5s','0.9s','0.7s']
const BAR_HEIGHTS = ['16px','12px','20px','10px','18px']
const BAR_DELAYS  = ['0s','0.15s','0.05s','0.25s','0.1s']

export default function MusicPlayer({ src, songName }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!src) return

    /* Create audio element programmatically for max reliability */
    const audio = new Audio(src)
    audio.volume = 0.5
    audio.loop = true
    audio.autoplay = true
    audioRef.current = audio

    /* Enable audio context on first user gesture (iOS requirement) */
    const enableAudio = () => {
      if (audio.paused) {
        audio.play().then(() => setPlaying(true)).catch(() => {})
      }
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('touchstart', enableAudio)
    }
    document.addEventListener('click', enableAudio, { once: true })
    document.addEventListener('touchstart', enableAudio, { once: true })

    /* Try to play immediately */
    setTimeout(() => {
      audio.play()
        .then(() => setPlaying(true))
        .catch(err => {
          console.log('Autoplay blocked, waiting for user interaction:', err.message)
        })
    }, 100)

    /* Also try when audio is ready */
    const onCanPlay = () => {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
    audio.addEventListener('canplay', onCanPlay, { once: true })

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('touchstart', enableAudio)
      audio.removeEventListener('canplay', onCanPlay)
    }
  }, [src])

  if (!src) return null

  return (
    <>
      <style>{css}</style>

      {playing && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px',
          zIndex: 200,
          background: 'rgba(10,0,20,.88)',
          border: '1px solid rgba(255,45,159,.25)',
          borderRadius: '24px',
          padding: '8px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          backdropFilter: 'blur(10px)',
          animation: 'fadeSlide .5s ease forwards',
          maxWidth: '220px',
        }}>
          <div className="eq-bars">
            {BAR_SPEEDS.map((spd, i) => (
              <div key={i} className="eq-bar"
                style={{ '--spd': spd, '--h': BAR_HEIGHTS[i], '--delay': BAR_DELAYS[i] }} />
            ))}
          </div>
          <span style={{
            color: '#ff9de2', fontSize: '11px', fontFamily: 'monospace',
            letterSpacing: '.5px', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px',
          }}>
            {songName || 'music'}
          </span>
        </div>
      )}
    </>
  )
}