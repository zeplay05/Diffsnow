import React from 'react'
import './MusicPlayerLayouts.css'

// ─── Reusable Standard-Style Transport Controls Dock ─────────────────────────
function StandardTransportDock({
  isPlaying,
  togglePlay,
  onRestart,
  onReplay,
  jewelClassName = '',
  stepClassName = '',
  jewelStyle,
  stepStyle,
}) {
  return (
    <div className="mpl-controls-row">
      {/* Restart / Prev Track */}
      <button
        className={`mpl-step-btn ${stepClassName}`}
        onClick={(e) => {
          e.stopPropagation()
          if (onRestart) onRestart()
        }}
        title="Restart Track"
        style={stepStyle}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Main Standard Circular Play Jewel */}
      <button
        className={`mpl-play-jewel ${isPlaying ? 'is-playing' : ''} ${jewelClassName}`}
        onClick={(e) => {
          e.stopPropagation()
          togglePlay()
        }}
        title={isPlaying ? 'Pause' : 'Play'}
        style={jewelStyle}
      >
        {isPlaying ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Replay / Next Track */}
      <button
        className={`mpl-step-btn ${stepClassName}`}
        onClick={(e) => {
          e.stopPropagation()
          if (onReplay) onReplay()
        }}
        title="Replay Track"
        style={stepStyle}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    </div>
  )
}

// ─── Reusable Pill Action Button (Matches Standard pill-action-btn) ───────────
function StandardPillPlayBtn({ isPlaying, togglePlay, className = '', style }) {
  return (
    <button
      className={`mpl-action-btn ${isPlaying ? 'playing' : ''} ${className}`}
      onClick={(e) => {
        e.stopPropagation()
        togglePlay()
      }}
      title={isPlaying ? 'Pause' : 'Play'}
      style={style}
    >
      {isPlaying ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '1px' }}>
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  )
}

// ─── Reusable Universal Volume Slider Bar (หลอดเพิ่มเสียงลดเสียงใช้งานได้จริง) ──
function StandardVolumeBar({
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  accentColor = '#ef4444',
  style,
}) {
  const currentVolPercent = isMuted ? 0 : Math.round((volume ?? 0.8) * 100)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        marginTop: '14px',
        padding: '6px 12px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '9999px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (setIsMuted) setIsMuted(!isMuted)
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted || volume === 0 ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>

      <div style={{ position: 'relative', flex: 1, height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '9999px', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${currentVolPercent}%`,
            background: accentColor,
            borderRadius: '9999px',
            boxShadow: `0 0 6px ${accentColor}`,
            pointerEvents: 'none',
          }}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : (volume ?? 0.8)}
          onChange={(e) => {
            const val = parseFloat(e.target.value)
            if (setVolume) setVolume(val)
            if (setIsMuted) setIsMuted(val === 0)
            localStorage.setItem('triples_music_volume', String(Math.round(val * 100)))
            window.dispatchEvent(new Event('triples_music_updated'))
          }}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            margin: 0,
            zIndex: 2,
          }}
        />
      </div>

      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 800, minWidth: '30px', textAlign: 'right', fontFamily: 'monospace' }}>
        {currentVolPercent}%
      </span>
    </div>
  )
}

// ─── Main Theme Switcher Component (All 18 Non-Standard Layouts) ───────────────
export default function MusicPlayerThemes({
  layout,
  isExpanded,
  setIsExpanded,
  isPlaying,
  togglePlay,
  trackInfo,
  currentTime,
  duration,
  handleSeek,
  progressPercent,
  formatTime,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  isPreview,
  onRestart,
  onReplay,
}) {
  const normLayout = (layout || 'STANDARD').toUpperCase().trim()

  const coverImg = trackInfo?.cover || '/asset/Triples.png'
  const handleCoverError = (e) => { e.target.src = '/asset/Triples.png' }

  const defaultSeekRestart = () => {
    if (onRestart) return onRestart()
    if (handleSeek) handleSeek({ target: { value: 0 } })
  }

  const defaultSeekReplay = () => {
    if (onReplay) return onReplay()
    if (handleSeek) handleSeek({ target: { value: 0 } })
  }

  // ── 19. HIDDEN LAYOUT ────────────────────────────────────────────────────────
  if (normLayout === 'HIDDEN') {
    if (!isPreview) return null
    return (
      <div className="mpl-hidden-badge">
        <span style={{ fontSize: '18px' }}>👁️</span>
        <div>
          <div style={{ fontWeight: 800, color: '#fff' }}>HIDDEN LAYOUT (Stealth Mode)</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
            เพลงเล่นอัตโนมัติในพื้นหลังโดยไม่แสดง UI บนหน้าเว็บจริง
          </div>
        </div>
        <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ marginLeft: 'auto' }} />
      </div>
    )
  }

  // ── 11. BOTTOM BAR LAYOUT (Full-width Persistent Bottom Dock) ───────────────
  if (normLayout === 'BOTTOM BAR') {
    return (
      <div className="mpl-bottom-dock">
        {/* Left: Track Cover & Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '190px' }}>
          <img
            src={coverImg}
            alt=""
            style={{ width: '46px', height: '46px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.14)' }}
            onError={handleCoverError}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trackInfo.title}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              {trackInfo.artist}
            </span>
          </div>
        </div>

        {/* Center: Controls & Scrubber */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '540px', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button className="mpl-step-btn" onClick={defaultSeekRestart} title="Restart" style={{ width: '32px', height: '32px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
            </button>

            <button className={`mpl-play-jewel ${isPlaying ? 'is-playing' : ''}`} onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'} style={{ width: '40px', height: '40px' }}>
              {isPlaying ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '1px' }}><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            <button className="mpl-step-btn" onClick={defaultSeekReplay} title="Replay" style={{ width: '32px', height: '32px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', fontSize: '10.5px', color: 'rgba(255,255,255,0.45)' }}>
            <span>{formatTime(currentTime)}</span>
            <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ flex: 1 }} />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume Slider & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '170px', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: isPlaying ? '#22c55e' : '#ef4444', letterSpacing: '0.1em' }}>
            {isPlaying ? '● LIVE' : '○ PAUSED'}
          </span>
          <div style={{ width: '90px' }}>
            <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} style={{ marginTop: 0, padding: '4px 8px' }} />
          </div>
        </div>
      </div>
    )
  }

  // ── 2. MINIMAL LAYOUT (Luxury Dark Hi-Fi with Cover & Volume) ───────────────
  if (normLayout === 'MINIMAL') {
    if (!isExpanded) {
      return (
        <div className="mpl-minimal-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className={`mpl-pill-thumb ${isPlaying ? 'spin' : ''}`} onError={handleCoverError} />
          <div className="mpl-minimal-title">{trackInfo.title}</div>
          <div className={`mpl-wave-bars ${isPlaying ? 'active' : ''}`}>
            <span /><span /><span /><span />
          </div>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} />
        </div>
      )
    }
    return (
      <div className="mpl-minimal-card">
        <div className="mpl-minimal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isPlaying ? '#22c55e' : '#ef4444' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em' }}>MINIMAL HI-FI</span>
          </div>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', padding: '4px' }}>✕</button>
          )}
        </div>

        <img src={coverImg} alt="" className="mpl-minimal-cover" onError={handleCoverError} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#fff', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {trackInfo.title}
          </div>
          <div className={`mpl-wave-bars ${isPlaying ? 'active' : ''}`}>
            <span /><span /><span /><span />
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '12px' }}>
          {trackInfo.artist}
        </div>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#ffffff" />
      </div>
    )
  }

  // ── 3. COMPACT LAYOUT ───────────────────────────────────────────────────────
  if (normLayout === 'COMPACT') {
    if (!isExpanded) {
      return (
        <div className="mpl-compact-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className="mpl-compact-thumb" onError={handleCoverError} />
          <div className="mpl-compact-text">
            <span className="mpl-compact-title">{trackInfo.title}</span>
            <span style={{ fontSize: '9px', color: '#38bdf8' }}>{isPlaying ? '● NOW PLAYING' : '○ PAUSED'}</span>
          </div>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} />
        </div>
      )
    }
    return (
      <div className="mpl-compact-card">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <img src={coverImg} alt="" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(56,189,248,0.4)' }} onError={handleCoverError} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 800, letterSpacing: '0.1em' }}>COMPACT AUDIO</span>
              {!isPreview && (
                <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px' }}>✕</button>
              )}
            </div>
            <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</div>
            <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)' }}>{trackInfo.artist}</div>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="cyan-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#38bdf8" />
      </div>
    )
  }

  // ── 4. GLASS LAYOUT ─────────────────────────────────────────────────────────
  if (normLayout === 'GLASS') {
    if (!isExpanded) {
      return (
        <div className="mpl-glass-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className={`mpl-pill-thumb ${isPlaying ? 'spin' : ''}`} style={{ border: '1.5px solid rgba(255,255,255,0.5)' }} onError={handleCoverError} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>FROSTED GLASS</div>
          </div>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} />
        </div>
      )
    }
    return (
      <div className="mpl-glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.15em' }}>CRYSTAL GLASS</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px' }}>✕</button>
          )}
        </div>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <img
            src={coverImg}
            alt=""
            style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid rgba(255,255,255,0.5)', boxShadow: '0 12px 35px rgba(0,0,0,0.6)' }}
            className={isPlaying ? 'mpl-round-vinyl spin' : ''}
            onError={handleCoverError}
          />
          <h4 style={{ margin: '12px 0 2px', fontSize: '15px', fontWeight: 900, color: '#fff' }}>{trackInfo.title}</h4>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{trackInfo.artist}</p>
        </div>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="glass-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#ffffff" />
      </div>
    )
  }

  // ── 5. ROUND LAYOUT ─────────────────────────────────────────────────────────
  if (normLayout === 'ROUND') {
    if (!isExpanded) {
      return (
        <div className="mpl-round-pill" onClick={() => setIsExpanded(true)} title={trackInfo.title}>
          <img src={coverImg} alt="" className={`mpl-round-vinyl ${isPlaying ? 'spin' : ''}`} onError={handleCoverError} />
          <div style={{ position: 'absolute' }}>
            <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ width: '26px', height: '26px' }} />
          </div>
        </div>
      )
    }
    return (
      <div className="mpl-round-card">
        {!isPreview && (
          <button onClick={() => setIsExpanded(false)} style={{ position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 800, fontSize: '14px' }}>✕</button>
        )}
        <img
          src={coverImg}
          alt=""
          className={`mpl-round-vinyl ${isPlaying ? 'spin' : ''}`}
          style={{ width: '105px', height: '105px', border: '3px solid #ef4444', marginBottom: '8px', boxShadow: '0 0 25px rgba(239,68,68,0.5)' }}
          onError={handleCoverError}
        />
        <div style={{ fontWeight: 900, fontSize: '14px', color: '#fff', maxWidth: '210px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</div>
        <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{trackInfo.artist}</div>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ width: '85%' }} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#ef4444" style={{ width: '85%' }} />
      </div>
    )
  }

  // ── 6. NEON GLOW LAYOUT ─────────────────────────────────────────────────────
  if (normLayout === 'NEON GLOW') {
    if (!isExpanded) {
      return (
        <div className="mpl-neon-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className={`mpl-pill-thumb neon ${isPlaying ? 'spin' : ''}`} onError={handleCoverError} />
          <span className="mpl-neon-title">{trackInfo.title}</span>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ borderColor: '#00f0ff' }} />
        </div>
      )
    }
    return (
      <div className="mpl-neon-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#ff007f', letterSpacing: '0.15em', textShadow: '0 0 10px #ff007f' }}>⚡ NEON ARCADE</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#00f0ff', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          )}
        </div>

        <img src={coverImg} alt="" style={{ width: '100%', height: '135px', objectFit: 'cover', borderRadius: '14px', border: '1.5px solid #00f0ff', boxShadow: '0 0 20px rgba(0,240,255,0.3)', marginBottom: '12px' }} onError={handleCoverError} />
        <h3 style={{ margin: '0 0 2px', fontSize: '15px', color: '#00f0ff', textShadow: '0 0 10px #00f0ff' }}>{trackInfo.title}</h3>
        <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#ff007f', textShadow: '0 0 8px #ff007f' }}>{trackInfo.artist}</p>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#ff007f' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#00f0ff' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="neon-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#00f0ff" />
      </div>
    )
  }

  // ── 7. OS LAYOUT (Retro Winamp Style with Cover) ────────────────────────────
  if (normLayout === 'OS') {
    if (!isExpanded) {
      return (
        <div className="mpl-os-pill" onClick={() => setIsExpanded(true)}>
          <div className="mpl-os-titlebar">
            <span>TriplesPlayer.exe</span>
            <span>✕</span>
          </div>
          <div className="mpl-os-body">
            <img src={coverImg} alt="" style={{ width: '24px', height: '24px', borderRadius: '3px', objectFit: 'cover' }} onError={handleCoverError} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trackInfo.title}</span>
            <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
          </div>
        </div>
      )
    }
    return (
      <div className="mpl-os-card">
        <div className="mpl-os-titlebar">
          <span>TriplesAmp v2.0 - [Audio Engine]</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 800 }}>✕</button>
          )}
        </div>
        <div style={{ padding: '10px', background: '#000', margin: '4px', borderRadius: '6px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            <img src={coverImg} alt="" style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #22c55e' }} onError={handleCoverError} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'monospace', color: '#22c55e' }}>
                {isPlaying ? '▶' : '■'} {formatTime(currentTime)}
              </div>
              <div style={{ fontSize: '11px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</div>
              <div style={{ fontSize: '10px', color: '#86efac' }}>{trackInfo.artist}</div>
            </div>
          </div>
          <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#22c55e' }} />
        </div>

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="pixel-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#22c55e" />
      </div>
    )
  }

  // ── 8. RETRO VINYL LAYOUT ───────────────────────────────────────────────────
  if (normLayout === 'RETRO VINYL') {
    if (!isExpanded) {
      return (
        <div className="mpl-vinyl-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className={`mpl-pill-thumb ${isPlaying ? 'spin' : ''}`} style={{ border: '1.5px solid #d97706' }} onError={handleCoverError} />
          <span style={{ fontSize: '12px', fontWeight: 700, maxWidth: '125px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</span>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ borderColor: '#d97706' }} />
        </div>
      )
    }
    return (
      <div className="mpl-vinyl-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.15em' }}>VINTAGE VINYL</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#d97706', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          )}
        </div>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <img src={coverImg} alt="" className={`mpl-round-vinyl ${isPlaying ? 'spin' : ''}`} style={{ width: '110px', height: '110px', border: '3px solid #b45309', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }} onError={handleCoverError} />
          <h4 style={{ margin: '12px 0 2px', fontSize: '14.5px', color: '#fef3c7' }}>{trackInfo.title}</h4>
          <p style={{ margin: 0, fontSize: '11px', color: '#d97706' }}>{trackInfo.artist}</p>
        </div>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#d97706' }} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="gold-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#d97706" />
      </div>
    )
  }

  // ── 9. PIXEL ART LAYOUT (8-Bit Arcade with Cover) ───────────────────────────
  if (normLayout === 'PIXEL ART') {
    if (!isExpanded) {
      return (
        <div className="mpl-pixel-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className="mpl-pill-thumb pixel" onError={handleCoverError} />
          <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</span>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ borderRadius: '2px', borderColor: '#22c55e' }} />
        </div>
      )
    }
    return (
      <div className="mpl-pixel-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '2px dashed #22c55e', paddingBottom: '6px' }}>
          <span>GAMEBOY AUDIO</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontFamily: 'monospace' }}>[X]</button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <img src={coverImg} alt="" style={{ width: '90px', height: '90px', objectFit: 'cover', border: '3px solid #22c55e', margin: '0 auto 8px', display: 'block', boxShadow: '3px 3px 0 #15803d' }} onError={handleCoverError} />
          <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '2px' }}>{trackInfo.title}</div>
          <div style={{ fontSize: '11px', color: '#86efac' }}>{trackInfo.artist}</div>
        </div>

        <div style={{ display: 'flex', gap: '5px', height: '14px', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '12px' }}>
          {[14, 8, 16, 6, 12, 16, 10, 8].map((h, i) => (
            <span key={i} style={{ width: '8px', height: isPlaying ? `${h}px` : '4px', background: '#22c55e', transition: 'height 0.1s' }} />
          ))}
        </div>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#22c55e' }} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="pixel-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#22c55e" />
      </div>
    )
  }

  // ── 10. FUTURISTIC LAYOUT (HUD with Holographic Cover) ───────────────────────
  if (normLayout === 'FUTURISTIC') {
    if (!isExpanded) {
      return (
        <div className="mpl-futu-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className="mpl-pill-thumb futu" onError={handleCoverError} />
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#fff', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</span>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ borderColor: '#06b6d4' }} />
        </div>
      )
    }
    return (
      <div className="mpl-futu-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(6,182,212,0.3)', paddingBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: '#06b6d4' }}>SYS.AUDIO // V2.0</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          )}
        </div>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <img src={coverImg} alt="" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid #06b6d4', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }} onError={handleCoverError} />
          <div style={{ position: 'absolute', bottom: '6px', left: '8px', fontSize: '9px', fontWeight: 800, color: '#06b6d4', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px' }}>
            HOLO_SYS // {isPlaying ? 'STREAMING' : 'IDLE'}
          </div>
        </div>

        <div style={{ fontWeight: 900, fontSize: '14.5px', color: '#fff', marginBottom: '2px' }}>{trackInfo.title}</div>
        <div style={{ fontSize: '10.5px', color: '#06b6d4', marginBottom: '12px' }}>SRC: {trackInfo.artist}</div>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#06b6d4' }} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="cyan-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#06b6d4" />
      </div>
    )
  }

  // ── 12. FLOATING LAYOUT (Cosmic Orb with Cover) ──────────────────────────────
  if (normLayout === 'FLOATING') {
    if (!isExpanded) {
      return (
        <div className="mpl-float-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className={`mpl-pill-thumb ${isPlaying ? 'spin' : ''}`} style={{ border: '1.5px solid #a78bfa' }} onError={handleCoverError} />
          <span style={{ fontSize: '12px', fontWeight: 700, maxWidth: '125px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</span>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ borderColor: '#a78bfa' }} />
        </div>
      )
    }
    return (
      <div className="mpl-float-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#a78bfa', letterSpacing: '0.15em' }}>FLOATING BUBBLE</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          )}
        </div>
        <img src={coverImg} alt="" style={{ width: '105px', height: '105px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: '2.5px solid rgba(167,139,250,0.6)', boxShadow: '0 10px 30px rgba(139,92,246,0.45)' }} className={isPlaying ? 'mpl-round-vinyl spin' : ''} onError={handleCoverError} />
        <h4 style={{ textAlign: 'center', margin: '0 0 4px', fontSize: '14.5px', color: '#fff' }}>{trackInfo.title}</h4>
        <p style={{ textAlign: 'center', margin: '0 0 14px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{trackInfo.artist}</p>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#a78bfa' }} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="purple-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#a78bfa" />
      </div>
    )
  }

  // ── 13. CARBON FIBER LAYOUT (Motorsport with Cover) ─────────────────────────
  if (normLayout === 'CARBON FIBER') {
    if (!isExpanded) {
      return (
        <div className="mpl-carbon-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className="mpl-pill-thumb carbon" onError={handleCoverError} />
          <span style={{ fontSize: '12px', fontWeight: 800, maxWidth: '125px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</span>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ borderColor: '#dc2626' }} />
        </div>
      )
    }
    return (
      <div className="mpl-carbon-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(220,38,38,0.3)', paddingBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 900, color: '#dc2626', letterSpacing: '0.2em' }}>CARBON // MOTORSPORT</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          )}
        </div>

        <img src={coverImg} alt="" style={{ width: '100%', height: '135px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #dc2626', boxShadow: '0 10px 25px rgba(220,38,38,0.35)', marginBottom: '12px' }} onError={handleCoverError} />

        <div style={{ fontWeight: 900, fontSize: '15px', color: '#fff', marginBottom: '2px' }}>{trackInfo.title}</div>
        <div style={{ fontSize: '11px', color: '#dc2626', marginBottom: '12px' }}>RPM AUDIO // {trackInfo.artist}</div>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#dc2626' }} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#dc2626" />
      </div>
    )
  }

  // ── 14. GLITCH ART LAYOUT (Cyber Glitch with Cover) ─────────────────────────
  if (normLayout === 'GLITCH ART') {
    if (!isExpanded) {
      return (
        <div className="mpl-glitch-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className="mpl-pill-thumb" style={{ border: '1.5px solid #00ffff' }} onError={handleCoverError} />
          <span style={{ fontSize: '12px', fontWeight: 800, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</span>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ borderColor: '#00ffff' }} />
        </div>
      )
    }
    return (
      <div className="mpl-glitch-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#00ffff' }}>CRT_GLITCH_AUDIO</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#ff0055', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          )}
        </div>

        <img src={coverImg} alt="" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #00ffff', borderRight: '4px solid #ff0055', boxShadow: '4px 4px 0 #ff0055', marginBottom: '12px' }} onError={handleCoverError} />

        <h4 style={{ margin: '0 0 4px', fontSize: '15px', textShadow: '-2px -2px 0 #00ffff, 2px 2px 0 #ff0055' }}>{trackInfo.title}</h4>
        <p style={{ margin: '0 0 14px', fontSize: '11px', color: '#00ffff' }}>{trackInfo.artist}</p>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#00ffff' }} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="cyan-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#00ffff" />
      </div>
    )
  }

  // ── 15. STEAMPUNK LAYOUT (Victorian Apparatus with Cover) ───────────────────
  if (normLayout === 'STEAMPUNK') {
    if (!isExpanded) {
      return (
        <div className="mpl-steam-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className="mpl-pill-thumb steam" onError={handleCoverError} />
          <span style={{ fontSize: '12px', fontWeight: 800, maxWidth: '125px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</span>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ borderColor: '#d97706' }} />
        </div>
      )
    }
    return (
      <div className="mpl-steam-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.15em' }}>VICTORIAN APPARATUS</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#d97706', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <img src={coverImg} alt="" style={{ width: '105px', height: '105px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 10px', display: 'block', border: '3px solid #d97706', boxShadow: '0 0 25px rgba(217, 119, 6, 0.4)' }} className={isPlaying ? 'mpl-round-vinyl spin' : ''} onError={handleCoverError} />
          <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#fef3c7' }}>{trackInfo.title}</h4>
          <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#d97706' }}>{trackInfo.artist}</p>
        </div>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#d97706' }} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="gold-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#d97706" />
      </div>
    )
  }

  // ── 16. SYNTH WAVE LAYOUT ───────────────────────────────────────────────────
  if (normLayout === 'SYNTH WAVE') {
    if (!isExpanded) {
      return (
        <div className="mpl-synth-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className={`mpl-pill-thumb synth ${isPlaying ? 'spin' : ''}`} onError={handleCoverError} />
          <span style={{ fontSize: '12px', fontWeight: 800, maxWidth: '125px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</span>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ borderColor: '#ec4899' }} />
        </div>
      )
    }
    return (
      <div className="mpl-synth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#ec4899', letterSpacing: '0.2em' }}>OUTRUN SYNTHWAVE 80S</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          )}
        </div>
        <img src={coverImg} alt="" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '14px', border: '1.5px solid #ec4899', marginBottom: '12px' }} onError={handleCoverError} />
        <h4 style={{ margin: '0 0 2px', fontSize: '15px', color: '#fff' }}>{trackInfo.title}</h4>
        <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#ec4899' }}>{trackInfo.artist}</p>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#ec4899' }} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="synth-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#ec4899" />
      </div>
    )
  }

  // ── 17. MINIMAL STACK LAYOUT (Bento Architecture with Cover) ───────────────
  if (normLayout === 'MINIMAL STACK') {
    if (!isExpanded) {
      return (
        <div className="mpl-stack-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className={`mpl-pill-thumb ${isPlaying ? 'spin' : ''}`} onError={handleCoverError} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: isPlaying ? '#22c55e' : '#71717a' }}>{isPlaying ? '● PLAYING' : '○ PAUSED'}</span>
            <span style={{ fontSize: '11.5px', fontWeight: 700, maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</span>
          </div>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ marginLeft: 'auto' }} />
        </div>
      )
    }
    return (
      <div className="mpl-stack-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em' }}>STACKED BADGE</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          )}
        </div>

        <img src={coverImg} alt="" style={{ width: '100%', height: '145px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '12px' }} onError={handleCoverError} />

        <div style={{ fontWeight: 900, fontSize: '15px', color: '#fff', marginBottom: '2px' }}>{trackInfo.title}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '12px' }}>{trackInfo.artist}</div>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#ffffff" />
      </div>
    )
  }

  // ── 18. ECHO BASS LAYOUT ────────────────────────────────────────────────────
  if (normLayout === 'ECHO BASS') {
    if (!isExpanded) {
      return (
        <div className="mpl-bass-pill" onClick={() => setIsExpanded(true)}>
          <img src={coverImg} alt="" className={`mpl-bass-woofer ${isPlaying ? 'thumping' : ''}`} onError={handleCoverError} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#fff', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackInfo.title}</div>
            <div style={{ fontSize: '9px', color: '#a855f7', fontWeight: 700 }}>BASS ACTIVE</div>
          </div>
          <StandardPillPlayBtn isPlaying={isPlaying} togglePlay={togglePlay} style={{ borderColor: '#a855f7' }} />
        </div>
      )
    }
    return (
      <div className="mpl-bass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '10px', fontWeight: 900, color: '#a855f7', letterSpacing: '0.2em' }}>SUBWOOFER // ECHO BASS</span>
          {!isPreview && (
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          )}
        </div>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <img src={coverImg} alt="" className={`mpl-bass-woofer ${isPlaying ? 'thumping' : ''}`} style={{ width: '105px', height: '105px', margin: '0 auto 10px', display: 'block', border: '3px solid #a855f7', boxShadow: '0 0 35px rgba(168,85,247,0.5)' }} onError={handleCoverError} />
          <h4 style={{ margin: '0 0 2px', fontSize: '15px', color: '#fff' }}>{trackInfo.title}</h4>
          <p style={{ margin: 0, fontSize: '11px', color: '#a855f7' }}>{trackInfo.artist}</p>
        </div>

        <div style={{ display: 'flex', gap: '4px', height: '20px', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '12px' }}>
          {[8, 16, 22, 12, 20, 14, 22, 10, 18].map((h, i) => (
            <span key={i} style={{ width: '6px', height: isPlaying ? `${h}px` : '4px', background: '#a855f7', borderRadius: '2px', transition: 'height 0.15s' }} />
          ))}
        </div>

        <input type="range" className="mpl-scrubber-slider" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ accentColor: '#a855f7' }} />

        <StandardTransportDock isPlaying={isPlaying} togglePlay={togglePlay} onRestart={defaultSeekRestart} onReplay={defaultSeekReplay} jewelClassName="purple-jewel" />
        <StandardVolumeBar volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} accentColor="#a855f7" />
      </div>
    )
  }

  // Fallback: If unknown layout, return null so STANDARD handles it
  return null
}
