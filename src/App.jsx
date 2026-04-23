import { useState, useCallback, useEffect } from 'react'
import MatrixRain from './components/MatrixRain'
import IntroSequence from './components/IntroSequence'
import HeartGallery from './components/HeartGallery'
import AdminUpload from './components/AdminUpload'
import MusicPlayer from './components/MusicPlayer'
import { fetchMusic } from './lib/supabase'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Dancing+Script:wght@700&family=Cormorant+Garamond:wght@300;400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: #05000c; color: #fce8f0; overflow-x: hidden; }

@keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
@keyframes shimmerText {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes heartBeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
@keyframes glowPulse {
  0%,100%{ text-shadow: 0 0 20px #ff2d9f, 0 0 40px #ff2d9f40; }
  50%{ text-shadow: 0 0 40px #ff2d9f, 0 0 80px #ff2d9f80, 0 0 120px #ff2d9f30; }
}
.shimmer-text {
  background: linear-gradient(90deg, #ff9de2, #ffcc00, #fff, #ffcc00, #ff9de2);
  background-size: 220% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmerText 3s linear infinite;
}
.fade-in { animation: fadeInUp .8s ease forwards; }
.glow-pulse { animation: glowPulse 2.5s ease-in-out infinite; }
.heart-beat { animation: heartBeat 1.6s ease-in-out infinite; }
`

export default function App() {
  const [phase, setPhase] = useState('intro')
  const [showAdmin, setShowAdmin] = useState(false)
  const [music, setMusic] = useState(null)

  // Load music as soon as app mounts (so it's ready for intro)
  useEffect(() => {
    fetchMusic().then(m => { if (m) setMusic(m) }).catch(() => {})
  }, [])

  const handleIntroDone = useCallback(() => setPhase('main'), [])

  // Reload music after admin closes (in case they just uploaded)
  const handleAdminClose = () => {
    setShowAdmin(false)
    fetchMusic().then(m => { if (m) setMusic(m) }).catch(() => {})
  }

  return (
    <>
      <style>{css}</style>

      <MatrixRain opacity={phase === 'intro' ? 1 : 0.35} />

      {/* Music player — visible as soon as music is loaded, regardless of phase */}
      {music && <MusicPlayer src={music.url} songName={music.name.replace(/^music_\d+\./, '').replace(/_/g, ' ')} />}

      {phase === 'intro' && (
        <IntroSequence onDone={handleIntroDone} />
      )}

      {phase === 'main' && (
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>

          {/* Hero */}
          <section style={{ textAlign: 'center', padding: '60px 20px 40px', animation: 'fadeInUp .8s ease forwards' }}>
            <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '18px', color: '#ff9de2', letterSpacing: '3px', marginBottom: '10px' }}>
              ✦ 24 Avril ✦
            </p>
            <h1 className="shimmer-text" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 10vw, 84px)', fontWeight: 700, lineHeight: 1.1, marginBottom: '14px' }}>
              Happy Birthday
            </h1>
            <h2 className="glow-pulse" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 9vw, 72px)', fontWeight: 700, fontStyle: 'italic', color: '#ff2d9f', marginBottom: '32px' }}>
              Princess Sadia 👑
            </h2>
          </section>

          {/* Message */}
          <section style={{ maxWidth: '540px', margin: '0 auto 64px', padding: '0 20px', animation: 'fadeInUp .8s .2s ease both' }}>
            <div style={{
              background: 'rgba(255,45,159,.06)', border: '1px solid rgba(255,45,159,.2)',
              borderRadius: '24px', padding: '32px',
              fontFamily: "'Cormorant Garamond', serif",
              lineHeight: '2', fontSize: '16.5px', fontWeight: 300, letterSpacing: '.3px',
            }}>
              <p>Hi princess, 👑</p>
              <p style={{ marginTop: '14px' }}>
                Aujourd'hui, la Terre a fait exactement un tour de plus autour du Soleil depuis ta naissance. 🌍✨
                Et franchement, c'est l'une des meilleures choses qui soit arrivée à cette planète.
              </p>
              <p style={{ marginTop: '14px' }}>
                Tu es cette personne rare qui illumine les journées grises, qui fait sourire sans même s'en rendre compte, et qui rend la vie tellement plus belle juste par sa présence. 🌸
              </p>
              <p style={{ marginTop: '14px' }}>
                Joyeux anniversaire à toi, ma princess — merci d'exister dans ma vie, merci pour chaque moment partagé, et merci d'être exactement qui tu es. ❤️🎂
              </p>
              <p style={{ marginTop: '14px', fontStyle: 'italic', color: 'rgba(255,200,100,.9)' }}>
                This year again, I want to be there for you — and I'll smack you right now if you're being grumpy about it. kisses. 💫
              </p>
            </div>
          </section>

          {/* Gallery */}
          <section style={{ padding: '0 20px 80px', animation: 'fadeInUp .8s .4s ease both' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div className="heart-beat" style={{ fontSize: '36px', marginBottom: '12px' }}>❤️</div>
              <h3 className="shimmer-text" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 700 }}>
                Nos Souvenirs
              </h3>
            </div>
            <HeartGallery />
          </section>

          <footer style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,157,226,.28)', fontFamily: "'Dancing Script', cursive", fontSize: '14px', letterSpacing: '2px' }}>
            made with ❤️ for princess Sadia · 24 avril
          </footer>

          {/* Admin button */}
          <button
            onClick={() => setShowAdmin(true)}
            style={{
              position: 'fixed', bottom: '20px', right: '20px',
              background: 'rgba(255,45,159,.15)', border: '1px solid rgba(255,45,159,.3)',
              color: '#ff9de2', width: '44px', height: '44px',
              borderRadius: '50%', cursor: 'pointer', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100,
            }}
            title="Admin"
          >
            ⚙️
          </button>
        </div>
      )}

      {showAdmin && <AdminUpload onClose={handleAdminClose} />}
    </>
  )
}
