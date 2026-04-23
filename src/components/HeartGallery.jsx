import { useEffect, useState, useRef } from 'react'
import { fetchMedia } from '../lib/supabase'

// Generate heart-shape positions (parametric heart curve)
function heartPositions(count) {
  const positions = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * 2 * Math.PI
    // Heart parametric equation (normalized to -1..1)
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    positions.push({ x: x / 18, y: y / 18 }) // normalize to ~-1..1
  }
  return positions
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

@keyframes cardFloat {
  0%,100% { transform: translateY(0) rotate(var(--r)); }
  50% { transform: translateY(-8px) rotate(var(--r)); }
}
@keyframes heartGlow {
  0%,100% { filter: drop-shadow(0 0 18px rgba(255,45,159,.5)); }
  50% { filter: drop-shadow(0 0 36px rgba(255,45,159,.9)) drop-shadow(0 0 60px rgba(180,0,100,.4)); }
}
@keyframes shimmerBorder {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
.heart-card {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  background-clip: padding-box;
  box-shadow: 0 0 12px rgba(255,45,159,.4), 0 4px 20px rgba(0,0,0,.6);
  animation: cardFloat var(--dur) ease-in-out infinite var(--delay);
  cursor: pointer;
  transition: transform .3s, z-index 0s;
}
.heart-card:hover {
  transform: scale(1.25) rotate(0deg) !important;
  z-index: 100 !important;
  box-shadow: 0 0 30px rgba(255,45,159,.8), 0 0 60px rgba(255,45,159,.4);
}
.heart-card img, .heart-card video {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.heart-wrap {
  position: relative;
  animation: heartGlow 3s ease-in-out infinite;
}
`

export default function HeartGallery() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const wrapRef = useRef(null)
  const [size, setSize] = useState(500)

  useEffect(() => {
    fetchMedia()
      .then(setMedia)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const update = () => {
      setSize(Math.min(window.innerWidth * 0.9, 560))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (loading) return (
    <div style={{ color: '#ff9de2', fontFamily: 'monospace', fontSize: '18px', textAlign: 'center', padding: '60px' }}>
      Chargement des souvenirs... 💕
    </div>
  )

  if (media.length === 0) return (
    <div style={{ color: '#ff9de2', fontFamily: 'monospace', fontSize: '16px', textAlign: 'center', padding: '60px', maxWidth: '400px', lineHeight: 1.8 }}>
      💕 Aucune photo pour l'instant.<br/>
      <span style={{ color: '#b060a0', fontSize: '13px' }}>Utilise le panneau Admin pour uploader des photos.</span>
    </div>
  )

  const count = Math.min(media.length, 20)
  const positions = heartPositions(count)
  const cardSize = Math.max(Math.floor(size / 5.5), 70)

  return (
    <>
      <style>{css}</style>
      <div
        ref={wrapRef}
        className="heart-wrap"
        style={{
          width: size, height: size,
          position: 'relative',
          margin: '0 auto',
        }}
      >
        {positions.map((pos, i) => {
          const item = media[i % media.length]
          const rotation = (Math.random() * 20 - 10).toFixed(1)
          const dur = (2.5 + Math.random() * 2).toFixed(1)
          const delay = (Math.random() * 2).toFixed(1)
          const cx = size / 2 + pos.x * (size / 2.2) - cardSize / 2
          const cy = size / 2 + pos.y * (size / 2.2) - cardSize / 2

          return (
            <div
              key={i}
              className="heart-card"
              onClick={() => setLightbox(item)}
              style={{
                '--r': `${rotation}deg`,
                '--dur': `${dur}s`,
                '--delay': `-${delay}s`,
                '--size': `${cardSize}px`,
                left: cx, top: cy,
                zIndex: i,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {item.isVideo
                ? <video src={item.url} muted loop autoPlay playsInline />
                : <img src={item.url} alt={`souvenir ${i + 1}`} loading="lazy" />
              }
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {lightbox.isVideo
            ? <video
                src={lightbox.url}
                controls autoPlay
                style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px' }}
              />
            : <img
                src={lightbox.url}
                alt="souvenir"
                style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 0 60px rgba(255,45,159,.5)' }}
              />
          }
        </div>
      )}
    </>
  )
}
