import { useState, useCallback, useEffect, useRef } from 'react'
import MatrixRain from './components/MatrixRain'
import IntroSequence from './components/IntroSequence'
import HeartGallery from './components/HeartGallery'
import AdminUpload from './components/AdminUpload'
import { fetchMusic } from './lib/supabase'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Dancing+Script:wght@700&family=Cormorant+Garamond:wght@300;400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: #05000c; color: #fce8f0; overflow-x: hidden; }

@keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeOut  { from { opacity:1; } to { opacity:0; pointer-events:none; } }
@keyframes shimmerText {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes heartBeat  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
@keyframes glowPulse  {
  0%,100%{ text-shadow: 0 0 20px #ff2d9f, 0 0 40px #ff2d9f40; }
  50%    { text-shadow: 0 0 40px #ff2d9f, 0 0 80px #ff2d9f80, 0 0 120px #ff2d9f30; }
}
@keyframes floatIcon  { 0%,100%{ transform:translateY(0px) rotate(-2deg); } 50%{ transform:translateY(-6px) rotate(2deg); } }
@keyframes sparkle    { 0%,100%{ opacity:1; transform:scale(1) rotate(0deg); } 50%{ opacity:.7; transform:scale(1.15) rotate(15deg); } }
@keyframes tapPulse   { 0%,100%{ transform:scale(1); opacity:.7; } 50%{ transform:scale(1.06); opacity:1; } }
@keyframes ripple     { 0%{ transform:scale(0.8); opacity:.6; } 100%{ transform:scale(2.4); opacity:0; } }

.shimmer-text {
  background: linear-gradient(90deg, #ff9de2, #ffcc00, #fff, #ffcc00, #ff9de2);
  background-size: 220% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: shimmerText 3s linear infinite;
}
.glow-pulse  { animation: glowPulse  2.5s ease-in-out infinite; }
.heart-beat  { animation: heartBeat  1.6s ease-in-out infinite; }
.float-icon  { animation: floatIcon  3s   ease-in-out infinite; }
.sparkle     { animation: sparkle    2s   ease-in-out infinite; }
.tap-pulse   { animation: tapPulse   2s   ease-in-out infinite; }

/* EQ bars */
@keyframes barDance { 0%,100%{ height:4px; } 50%{ height:var(--h); } }
.eq-bars { display:flex; align-items:flex-end; gap:3px; height:20px; }
.eq-bar  { width:3px; background:#ff2d9f; border-radius:2px; animation:barDance var(--spd) ease-in-out infinite var(--delay); }
@keyframes fadeSlide { from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:translateY(0); } }
`

/* ── SVG Icons ── */
const IconCrown   = ({ size=28, color='#ffcc00' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 19h20M3 19l2-9 4 4 3-8 3 8 4-4 2 9"/>
    <circle cx="12" cy="6"  r="1.5" fill={color} stroke="none"/>
    <circle cx="5"  cy="10" r="1"   fill={color} stroke="none"/>
    <circle cx="19" cy="10" r="1"   fill={color} stroke="none"/>
  </svg>
)
const IconGlobe   = ({ size=20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const IconSparkle = ({ size=20, color='#ffcc00' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z"/>
  </svg>
)
const IconBlossom = ({ size=20, color='#ff9de2' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="2.5" fill={color} fillOpacity=".4"/>
    <ellipse cx="12" cy="6.5"  rx="2" ry="3.5" fill={color} fillOpacity=".6"/>
    <ellipse cx="12" cy="17.5" rx="2" ry="3.5" fill={color} fillOpacity=".6"/>
    <ellipse cx="6.5"  cy="12" rx="3.5" ry="2" fill={color} fillOpacity=".6"/>
    <ellipse cx="17.5" cy="12" rx="3.5" ry="2" fill={color} fillOpacity=".6"/>
  </svg>
)
const IconHeart   = ({ size=36, color='#ff2d9f' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IconCake    = ({ size=20, color='#ffcc00' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/>
    <path d="M4 21h16M2 21h20M7 8v2M12 8v2M17 8v2"/>
    <path d="M7 4a1 1 0 0 0 1-1 1 1 0 0 1 1 1 1 1 0 0 0 1-1"/>
    <path d="M12 4a1 1 0 0 0 1-1 1 1 0 0 1 1 1 1 1 0 0 0 1-1"/>
    <path d="M17 4a1 1 0 0 0 1-1 1 1 0 0 1 1 1 1 1 0 0 0 1-1"/>
  </svg>
)
const IconStar    = ({ size=16, color='rgba(255,200,100,.9)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

/* ── EQ bar indicator ── */
const BAR_SPEEDS  = ['0.6s','0.8s','0.5s','0.9s','0.7s']
const BAR_HEIGHTS = ['16px','12px','20px','10px','18px']
const BAR_DELAYS  = ['0s','0.15s','0.05s','0.25s','0.1s']

const MusicIndicator = ({ songName }) => (
  <div style={{
    position:'fixed', bottom:'20px', right:'20px', zIndex:200,
    background:'rgba(10,0,20,.88)', border:'1px solid rgba(255,45,159,.25)',
    borderRadius:'24px', padding:'8px 16px',
    display:'flex', alignItems:'center', gap:'10px',
    backdropFilter:'blur(10px)',
    animation:'fadeSlide .5s ease forwards', maxWidth:'220px',
  }}>
    <div className="eq-bars">
      {BAR_SPEEDS.map((spd,i) => (
        <div key={i} className="eq-bar"
          style={{'--spd':spd,'--h':BAR_HEIGHTS[i],'--delay':BAR_DELAYS[i]}}/>
      ))}
    </div>
    <span style={{
      color:'#ff9de2', fontSize:'11px', fontFamily:'monospace',
      letterSpacing:'.5px', overflow:'hidden',
      textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'140px',
    }}>
      {songName || 'music'}
    </span>
  </div>
)

/* ── /admin detection ── */
const isAdminRoute = () => window.location.pathname.toLowerCase() === '/admin'

export default function App() {
  const [phase, setPhase]     = useState('tap')   // 'tap' → 'intro' → 'main'
  const [music, setMusic]     = useState(null)
  const [playing, setPlaying] = useState(false)
  const audioRef              = useRef(null)
  const isAdmin               = isAdminRoute()

  /* Preload music immediately */
  useEffect(() => {
    fetchMusic().then(m => { if (m) setMusic(m) }).catch(() => {})
  }, [])

  /* Build audio element as soon as we have a URL */
  useEffect(() => {
    if (!music?.url) return
    const audio     = new Audio(music.url)
    audio.volume    = 0.5
    audio.loop      = true
    audioRef.current = audio
    return () => { audio.pause(); audio.src = ''; audioRef.current = null }
  }, [music])

  /* Called when user taps the opening screen */
  const handleTap = useCallback(() => {
    /* This tap IS the user gesture — play is now guaranteed to work */
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
    setPhase('intro')
  }, [])

  const handleIntroDone = useCallback(() => setPhase('main'), [])

  const handleAdminClose = () => {
    window.history.pushState({}, '', '/')
    window.location.reload()
  }

  if (isAdmin) {
    return (
      <>
        <style>{css}</style>
        <AdminUpload onClose={handleAdminClose} />
      </>
    )
  }

  return (
    <>
      <style>{css}</style>
      <MatrixRain opacity={phase === 'intro' ? 1 : phase === 'tap' ? 1 : 0.35} />

      {playing && music && (
        <MusicIndicator
          songName={music.name.replace(/^music_\d+\./, '').replace(/_/g, ' ')}
        />
      )}

      {/* ── TAP TO BEGIN screen ── */}
      {phase === 'tap' && (
        <div
          onClick={handleTap}
          style={{
            position:'fixed', inset:0, zIndex:20,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            cursor:'pointer', userSelect:'none',
          }}
        >
          {/* Ripple rings */}
          <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'32px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                position:'absolute',
                width: 80 + i*50, height: 80 + i*50,
                borderRadius:'50%',
                border:'1px solid rgba(255,45,159,.35)',
                animation:`ripple ${1.6 + i*0.4}s ease-out infinite`,
                animationDelay:`${i*0.3}s`,
              }}/>
            ))}
            <div className="tap-pulse" style={{
              width:72, height:72, borderRadius:'50%',
              background:'linear-gradient(135deg,#ff2d9f,#8800cc)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 40px rgba(255,45,159,.5)',
            }}>
              <IconHeart size={32} color="#fff"/>
            </div>
          </div>

          <p style={{
            fontFamily:"'Dancing Script', cursive",
            fontSize:'22px', color:'#ff9de2',
            letterSpacing:'3px', marginBottom:'10px',
          }}>
            tap anywhere to begin
          </p>
          <p style={{
            fontFamily:"'Cormorant Garamond', serif",
            fontSize:'13px', color:'rgba(255,157,226,.4)',
            letterSpacing:'4px', textTransform:'uppercase',
          }}>
            April 24th ✦ Princess Sadia
          </p>
        </div>
      )}

      {phase === 'intro' && <IntroSequence onDone={handleIntroDone} />}

      {phase === 'main' && (
        <div style={{ position:'relative', zIndex:1, minHeight:'100vh' }}>

          <section style={{ textAlign:'center', padding:'60px 20px 40px', animation:'fadeInUp .8s ease forwards' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'10px' }}>
              <span className="sparkle"><IconSparkle size={16}/></span>
              <p style={{ fontFamily:"'Dancing Script', cursive", fontSize:'18px', color:'#ff9de2', letterSpacing:'3px' }}>April 24th</p>
              <span className="sparkle"><IconSparkle size={16}/></span>
            </div>
            <h1 className="shimmer-text" style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(40px,10vw,84px)', fontWeight:700, lineHeight:1.1, marginBottom:'14px' }}>
              Happy Birthday
            </h1>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'14px', marginBottom:'32px' }}>
              <span className="float-icon"><IconCrown size={32}/></span>
              <h2 className="glow-pulse" style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(36px,9vw,72px)', fontWeight:700, fontStyle:'italic', color:'#ff2d9f' }}>
                Princess Sadia
              </h2>
              <span className="float-icon" style={{ animationDelay:'.4s' }}><IconCrown size={32}/></span>
            </div>
          </section>

          <section style={{ maxWidth:'540px', margin:'0 auto 64px', padding:'0 20px', animation:'fadeInUp .8s .2s ease both' }}>
            <div style={{
              background:'rgba(255,45,159,.06)', border:'1px solid rgba(255,45,159,.2)',
              borderRadius:'24px', padding:'32px',
              fontFamily:"'Cormorant Garamond', serif",
              lineHeight:'2', fontSize:'16.5px', fontWeight:300, letterSpacing:'.3px',
            }}>
              <p style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                Hi princess,{' '}<span style={{ display:'inline-flex' }}><IconCrown size={20}/></span>
              </p>
              <p style={{ marginTop:'14px' }}>
                Today, the Earth has completed exactly one more orbit around the Sun since the day you were born.{' '}
                <span style={{ display:'inline-flex', verticalAlign:'middle', margin:'0 2px' }}><IconGlobe size={18}/></span>{' '}
                <span style={{ display:'inline-flex', verticalAlign:'middle', margin:'0 2px' }}><IconSparkle size={16}/></span>{' '}
                And honestly, that's one of the best things that ever happened to this planet.
              </p>
              <p style={{ marginTop:'14px' }}>
                You are that rare person who lights up grey days, who makes everyone smile without even trying, and who makes life so much more beautiful just by being in it.{' '}
                <span style={{ display:'inline-flex', verticalAlign:'middle', margin:'0 2px' }}><IconBlossom size={18}/></span>
              </p>
              <p style={{ marginTop:'14px' }}>
                Happy birthday to you, my princess — thank you for existing in my life, thank you for every shared moment, and thank you for being exactly who you are.{' '}
                <span style={{ display:'inline-flex', verticalAlign:'middle', margin:'0 2px' }}><IconHeart size={18}/></span>{' '}
                <span style={{ display:'inline-flex', verticalAlign:'middle', margin:'0 2px' }}><IconCake size={18}/></span>
              </p>
              <p style={{ marginTop:'14px', fontStyle:'italic', color:'rgba(255,200,100,.9)', display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                <span style={{ display:'inline-flex' }}><IconStar size={14}/></span>
                This year again, I want to be there for you — and I'll smack you right now if you're being grumpy about it. kisses.
                <span style={{ display:'inline-flex' }}><IconStar size={14}/></span>
              </p>
            </div>
          </section>

          <section style={{ padding:'0 20px 80px', animation:'fadeInUp .8s .4s ease both' }}>
            <div style={{ textAlign:'center', marginBottom:'36px' }}>
              <div className="heart-beat" style={{ display:'flex', justifyContent:'center', marginBottom:'12px' }}>
                <IconHeart size={40}/>
              </div>
              <h3 className="shimmer-text" style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(24px,5vw,38px)', fontWeight:700 }}>
                Our Memories
              </h3>
            </div>
            <HeartGallery />
          </section>

          <footer style={{ textAlign:'center', padding:'24px', color:'rgba(255,157,226,.28)', fontFamily:"'Dancing Script', cursive", fontSize:'14px', letterSpacing:'2px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <span>made with</span>
            <IconHeart size={14} color="rgba(255,45,159,.4)"/>
            <span>for princess Sadia · april 24th</span>
          </footer>
        </div>
      )}
    </>
  )
}