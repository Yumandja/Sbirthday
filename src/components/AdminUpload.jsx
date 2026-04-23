import { useEffect, useRef, useState } from 'react'
import { fetchMedia, uploadFile, deleteFile, fetchMusic, uploadMusic, deleteMusic } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'sadia2024'

const css = `
.upload-area {
  border: 2px dashed rgba(255,45,159,.4);
  border-radius: 16px; padding: 40px 24px;
  text-align: center; cursor: pointer;
  transition: all .3s; background: rgba(255,45,159,.04);
}
.upload-area:hover, .upload-area.drag {
  border-color: #ff2d9f; background: rgba(255,45,159,.1);
  box-shadow: 0 0 20px rgba(255,45,159,.2);
}
.media-thumb {
  position: relative; border-radius: 10px; overflow: hidden;
  aspect-ratio: 1; background: #1a0020;
  border: 1px solid rgba(255,45,159,.25);
}
.media-thumb img, .media-thumb video { width:100%; height:100%; object-fit:cover; }
.media-thumb .del-btn {
  position: absolute; top: 4px; right: 4px;
  background: rgba(255,0,80,.8); border: none; color: white;
  border-radius: 50%; width: 24px; height: 24px; cursor: pointer;
  font-size: 12px; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .2s;
}
.media-thumb:hover .del-btn { opacity: 1; }
.tab-btn {
  padding: 9px 22px; border-radius: 30px; cursor: pointer;
  font-family: monospace; font-size: 13px; letter-spacing: 1px;
  transition: all .25s; border: 1px solid rgba(255,45,159,.3);
  background: transparent; color: #ff9de2;
}
.tab-btn.active {
  background: linear-gradient(135deg,#ff2d9f,#8800cc);
  border-color: transparent; color: white;
  box-shadow: 0 0 18px rgba(255,45,159,.4);
}
`

const btnStyle = {
  width: '100%', padding: '12px',
  background: 'linear-gradient(135deg,#ff2d9f,#8800cc)',
  border: 'none', borderRadius: '10px', color: 'white',
  cursor: 'pointer', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '1px',
}

export default function AdminUpload({ onClose }) {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [tab, setTab] = useState('media')
  const [media, setMedia] = useState([])
  const [music, setMusic] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [drag, setDrag] = useState(false)
  const [msg, setMsg] = useState('')
  const inputRef = useRef(null)
  const musicInputRef = useRef(null)

  const loadMedia = () => fetchMedia().then(setMedia).catch(console.error)
  const loadMusic = () => fetchMusic().then(setMusic).catch(console.error)

  useEffect(() => { if (authed) { loadMedia(); loadMusic() } }, [authed])

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500) }

  // ── Media upload ────────────────────────────────────────────────────────────
  const handleFiles = async (files) => {
    if (!files?.length) return
    setUploading(true); setProgress(0)
    let done = 0
    for (const file of Array.from(files)) {
      try {
        await uploadFile(file)
        done++
        setProgress(Math.round((done / files.length) * 100))
      } catch (e) { flash(`Erreur: ${e.message}`) }
    }
    await loadMedia()
    setUploading(false)
    flash(`✅ ${done} fichier(s) uploadé(s) !`)
  }

  const handleDelete = async (name) => {
    if (!confirm(`Supprimer "${name}" ?`)) return
    await deleteFile(name); await loadMedia()
  }

  // ── Music upload ────────────────────────────────────────────────────────────
  const handleMusicFile = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      await uploadMusic(file)
      await loadMusic()
      flash('🎵 Musique uploadée ! Elle jouera dès l\'intro.')
    } catch (e) { flash(`Erreur: ${e.message}`) }
    setUploading(false)
  }

  const handleDeleteMusic = async () => {
    if (!music || !confirm('Supprimer la musique ?')) return
    await deleteMusic(music.name); await loadMusic()
    flash('🗑️ Musique supprimée.')
  }

  // ── Auth screen ─────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,.96)', display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'#0d0018',border:'1px solid rgba(255,45,159,.3)',borderRadius:'20px',padding:'40px',width:'320px',textAlign:'center' }}>
        <div style={{ fontSize:'40px',marginBottom:'16px' }}>🔒</div>
        <p style={{ color:'#ff9de2',fontFamily:'monospace',marginBottom:'20px',fontSize:'14px',letterSpacing:'1px' }}>PANNEAU ADMIN</p>
        <input type="password" placeholder="Mot de passe" value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key==='Enter' && (pwd===ADMIN_PASSWORD ? setAuthed(true) : flash('❌ Mot de passe incorrect'))}
          style={{ width:'100%',padding:'12px 16px',borderRadius:'10px',background:'rgba(255,45,159,.08)',border:'1px solid rgba(255,45,159,.3)',color:'#fce8f0',fontFamily:'monospace',fontSize:'14px',outline:'none',marginBottom:'12px' }}
        />
        {msg && <p style={{ color:'#ff6060',fontSize:'13px',marginBottom:'8px' }}>{msg}</p>}
        <button onClick={() => pwd===ADMIN_PASSWORD ? setAuthed(true) : flash('❌ Mot de passe incorrect')} style={btnStyle}>ENTRER</button>
        <button onClick={onClose} style={{ marginTop:'12px',background:'none',border:'none',color:'#804060',cursor:'pointer',fontSize:'13px' }}>Annuler</button>
      </div>
    </div>
  )

  // ── Main admin panel ─────────────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,.97)',overflowY:'auto',padding:'24px 20px' }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ maxWidth:'720px',margin:'0 auto 28px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <h2 style={{ color:'#ff2d9f',fontFamily:'monospace',fontSize:'18px',letterSpacing:'2px' }}>⚙️ PANNEAU ADMIN</h2>
        <button onClick={onClose} style={{ background:'rgba(255,45,159,.15)',border:'1px solid rgba(255,45,159,.3)',color:'#ff9de2',padding:'8px 18px',borderRadius:'20px',cursor:'pointer',fontFamily:'monospace',fontSize:'13px' }}>✕ Fermer</button>
      </div>

      <div style={{ maxWidth:'720px',margin:'0 auto' }}>

        {/* Tabs */}
        <div style={{ display:'flex',gap:'10px',marginBottom:'28px' }}>
          <button className={`tab-btn${tab==='media'?' active':''}`} onClick={() => setTab('media')}>📸 Photos & Vidéos</button>
          <button className={`tab-btn${tab==='music'?' active':''}`} onClick={() => setTab('music')}>🎵 Musique</button>
        </div>

        {msg && <p style={{ color: msg.startsWith('❌') ? '#ff6060' : '#80ff80', fontFamily:'monospace',fontSize:'13px',marginBottom:'16px',textAlign:'center' }}>{msg}</p>}

        {/* ── MEDIA TAB ── */}
        {tab === 'media' && (
          <>
            <div
              className={`upload-area${drag?' drag':''}`}
              onClick={() => inputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
            >
              <div style={{ fontSize:'48px',marginBottom:'12px' }}>{drag ? '💕' : '📁'}</div>
              <p style={{ color:'#ff9de2',fontFamily:'monospace',fontSize:'14px',letterSpacing:'1px' }}>
                {uploading ? `Upload en cours... ${progress}%` : 'Clique ou glisse tes photos/vidéos ici'}
              </p>
              <p style={{ color:'#804060',fontSize:'12px',marginTop:'8px',fontFamily:'monospace' }}>JPG · PNG · GIF · MP4 · MOV · WEBM</p>
              {uploading && (
                <div style={{ background:'rgba(255,45,159,.15)',borderRadius:'4px',marginTop:'16px',overflow:'hidden',height:'4px' }}>
                  <div style={{ background:'#ff2d9f',height:'100%',width:`${progress}%`,transition:'width .3s' }} />
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*,video/*" multiple style={{ display:'none' }} onChange={e => handleFiles(e.target.files)} />

            {media.length > 0 && (
              <>
                <p style={{ color:'#804060',fontFamily:'monospace',fontSize:'13px',margin:'24px 0 12px',letterSpacing:'1px' }}>
                  {media.length} FICHIER(S) DANS LA GALERIE
                </p>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:'10px' }}>
                  {media.map(item => (
                    <div key={item.name} className="media-thumb">
                      {item.isVideo
                        ? <video src={item.url} muted />
                        : <img src={item.url} alt={item.name} loading="lazy" />
                      }
                      <button className="del-btn" onClick={() => handleDelete(item.name)}>✕</button>
                      {item.isVideo && (
                        <div style={{ position:'absolute',bottom:'4px',left:'4px',background:'rgba(0,0,0,.7)',borderRadius:'4px',padding:'2px 5px',fontSize:'10px',color:'#ff9de2',fontFamily:'monospace' }}>VIDEO</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── MUSIC TAB ── */}
        {tab === 'music' && (
          <div>
            {music ? (
              /* Current music */
              <div style={{ background:'rgba(255,45,159,.06)',border:'1px solid rgba(255,45,159,.25)',borderRadius:'16px',padding:'28px',textAlign:'center',marginBottom:'24px' }}>
                <div style={{ fontSize:'48px',marginBottom:'12px' }}>🎵</div>
                <p style={{ color:'#ff9de2',fontFamily:'monospace',fontSize:'14px',marginBottom:'8px',letterSpacing:'1px' }}>MUSIQUE ACTUELLE</p>
                <p style={{ color:'#fce8f0',fontSize:'16px',marginBottom:'20px' }}>{music.name.replace(/^music_\d+\./, '')}</p>
                <audio controls src={music.url} style={{ width:'100%',marginBottom:'16px',accentColor:'#ff2d9f' }} />
                <button onClick={handleDeleteMusic} style={{ background:'rgba(255,0,80,.2)',border:'1px solid rgba(255,0,80,.4)',color:'#ff8080',padding:'8px 20px',borderRadius:'20px',cursor:'pointer',fontFamily:'monospace',fontSize:'13px' }}>
                  🗑️ Supprimer
                </button>
              </div>
            ) : (
              <div style={{ textAlign:'center',color:'rgba(255,157,226,.4)',fontFamily:'monospace',fontSize:'14px',marginBottom:'24px',padding:'28px' }}>
                Aucune musique uploadée pour l'instant.
              </div>
            )}

            {/* Upload new */}
            <div
              className="upload-area"
              onClick={() => musicInputRef.current.click()}
            >
              <div style={{ fontSize:'40px',marginBottom:'12px' }}>🎶</div>
              <p style={{ color:'#ff9de2',fontFamily:'monospace',fontSize:'14px',letterSpacing:'1px' }}>
                {uploading ? 'Upload en cours...' : music ? 'Remplacer la musique' : 'Uploader une musique'}
              </p>
              <p style={{ color:'#804060',fontSize:'12px',marginTop:'8px',fontFamily:'monospace' }}>MP3 · OGG · WAV · M4A · AAC</p>
            </div>
            <input ref={musicInputRef} type="file" accept="audio/*" style={{ display:'none' }} onChange={e => handleMusicFile(e.target.files?.[0])} />

            <p style={{ color:'rgba(255,157,226,.3)',fontSize:'12px',fontFamily:'monospace',marginTop:'16px',textAlign:'center',lineHeight:'1.8' }}>
              La musique se lance automatiquement dès l'intro.<br/>
              Un seul fichier à la fois — le nouveau remplace l'ancien.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
