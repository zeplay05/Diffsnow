
  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER MINIMIZED PILL BASED ON SELECTED LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════
  const renderLayoutContent = () => {
    switch (activeLayout) {
      case 'MINIMAL':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 18px', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
            <div onClick={togglePlay} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffd700', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={12} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#fff', letterSpacing: '0.05em' }}>AUDIO</div>
            <Equalizer color="#ffd700" />
          </div>
        );

      case 'COMPACT':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15,15,15,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,215,0,0.3)', padding: '8px 14px', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(255,215,0,0.15)' }}>
            <img src={coverImg} alt="Cover" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '8px', color: '#ffd700', fontWeight: '900', letterSpacing: '0.1em' }}>PLAYING</span>
              <span style={{ fontSize: '11px', color: '#fff', fontWeight: '700' }}>SAMEWEKNOW</span>
            </div>
            <div onClick={togglePlay} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,215,0,0.15)', color: '#ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={12} />
            </div>
          </div>
        );

      case 'GLASS':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
              <img src={coverImg} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.2em' }}>FROSTED GLASS</span>
              <span style={{ fontSize: '11px', color: '#fff', fontWeight: '700' }}>AUDIO STREAM</span>
            </div>
            <div onClick={togglePlay} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={12} />
            </div>
          </div>
        );

      case 'ROUND':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '50%', padding: '3px', background: 'linear-gradient(135deg, #ffd700, #b8860b)', cursor: 'pointer', boxShadow: '0 0 25px rgba(255,215,0,0.4)', animation: isPlaying ? 'spin 12s linear infinite' : 'none' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
              <img src={coverImg} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div onClick={togglePlay} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffd700' }}>
                <PlayIcon size={18} />
              </div>
            </div>
          </div>
        );

      case 'NEON GLOW':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(10,10,15,0.95)', border: '1px solid #00f0ff', padding: '8px 20px', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 0 20px rgba(0,240,255,0.4), inset 0 0 10px rgba(0,240,255,0.1)' }}>
            <Equalizer color="#00f0ff" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '8px', color: '#00f0ff', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '900' }}>NEON STREAM</span>
              <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: '800' }}>CYBER AUDIO</span>
            </div>
            <div onClick={togglePlay} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#00f0ff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px #00f0ff' }}>
              <PlayIcon size={14} />
            </div>
          </div>
        );

      case 'OS':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#000000', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 18px', borderRadius: '100px', cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.9)' }}>
            <img src={coverImg} alt="Cover" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>Now Playing</span>
            <Equalizer color="#22c55e" />
            <div onClick={togglePlay} style={{ color: '#fff', marginLeft: '4px' }}><PlayIcon size={14} /></div>
          </div>
        );

      case 'RETRO VINYL':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '12px', padding: '6px 14px 6px 6px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: '2px dashed #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', animation: isPlaying ? 'spin 8s linear infinite' : 'none' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#d4af37' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '14px' }}>
              <span style={{ fontSize: '8px', color: '#d4af37', letterSpacing: '0.15em', fontWeight: '800' }}>VINYL RECORD</span>
              <span style={{ fontSize: '11px', color: '#fff', fontWeight: '700' }}>SAMEWEKNOW</span>
            </div>
            <div onClick={togglePlay} style={{ color: '#d4af37' }}><PlayIcon size={16} /></div>
          </div>
        );

      case 'PIXEL ART':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#000', border: '2px solid #ffd700', borderRadius: '0px', padding: '6px 16px', cursor: 'pointer', boxShadow: '4px 4px 0px #ffd700', fontFamily: 'monospace' }}>
            <span onClick={togglePlay} style={{ fontSize: '12px', color: '#ffd700', fontWeight: '900' }}>{isPlaying ? '■ PLAY' : '▶ BGM'}</span>
            <span style={{ fontSize: '10px', color: '#fff' }}>[8-BIT AUDIO]</span>
          </div>
        );

      case 'FUTURISTIC':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(10,15,25,0.92)', borderLeft: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderTop: '1px solid rgba(56,189,248,0.2)', borderBottom: '1px solid rgba(56,189,248,0.2)', padding: '8px 20px', cursor: 'pointer', boxShadow: '0 0 20px rgba(56,189,248,0.2)' }}>
            <div style={{ fontSize: '9px', color: '#38bdf8', letterSpacing: '0.2em', fontWeight: '900' }}>// AUDIO_CORE</div>
            <Equalizer color="#38bdf8" />
            <div onClick={togglePlay} style={{ color: '#38bdf8' }}><PlayIcon size={14} /></div>
          </div>
        );

      case 'CARBON FIBER':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'radial-gradient(circle, #222 10%, #111 90%)', border: '1px solid rgba(255,215,0,0.5)', padding: '8px 18px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.8)' }}>
            <img src={coverImg} alt="Cover" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #ffd700' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '8px', color: '#ef4444', fontWeight: '900', letterSpacing: '0.15em' }}>● CARBON EDITION</span>
              <span style={{ fontSize: '11px', color: '#fff', fontWeight: '800' }}>SAMEWEKNOW</span>
            </div>
            <div onClick={togglePlay} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffd700', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={12} />
            </div>
          </div>
        );

      case 'SYNTH WAVE':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'linear-gradient(135deg, rgba(20,10,35,0.95), rgba(40,10,50,0.95))', border: '1px solid #f43f5e', padding: '8px 20px', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 0 25px rgba(244,63,94,0.35)' }}>
            <Equalizer color="#ec4899" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '8px', color: '#f43f5e', letterSpacing: '0.2em', fontWeight: '900' }}>SYNTHWAVE 80s</span>
              <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '800' }}>NIGHT CITY</span>
            </div>
            <div onClick={togglePlay} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #fbbf24)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={12} />
            </div>
          </div>
        );

      case 'BOTTOM BAR':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '18px', background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,215,0,0.4)', padding: '10px 24px', borderRadius: '100px', cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            <img src={coverImg} alt="Cover" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffd700' }}>SAMEWEKNOW AUDIO</span>
            <Equalizer color="#ffd700" />
            <div onClick={togglePlay} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffd700', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={12} />
            </div>
          </div>
        );

      case 'ECHO BASS':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(15,15,20,0.95)', border: '1px solid #a855f7', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 0 25px rgba(168,85,247,0.3)' }}>
            <div onClick={togglePlay} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <PlayIcon size={14} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '8px', color: '#a855f7', fontWeight: '900', letterSpacing: '0.15em' }}>BASS BOOST</span>
              <span style={{ fontSize: '11px', color: '#fff', fontWeight: '700' }}>ECHO AUDIO</span>
            </div>
            <Equalizer color="#a855f7" />
          </div>
        );

      case 'STEAMPUNK':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(30,20,15,0.95)', border: '2px solid #b45309', padding: '8px 20px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 20px rgba(180,83,9,0.4)' }}>
            <div onClick={togglePlay} style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#b45309', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={12} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '8px', color: '#f59e0b', fontWeight: '900', letterSpacing: '0.15em' }}>BRASS SYSTEM</span>
              <span style={{ fontSize: '11px', color: '#fff', fontWeight: '800' }}>STEAM AUDIO</span>
            </div>
          </div>
        );

      case 'MINIMAL STACK':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(10,10,10,0.92)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 18px', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '10px', color: '#ffd700', fontWeight: '800' }}>SAMEWEKNOW</span>
              <div onClick={togglePlay}><PlayIcon size={12} /></div>
            </div>
            <Equalizer color="#ffd700" />
          </div>
        );

      case 'GLITCH ART':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#050505', border: '1px solid #22c55e', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}>
            <span style={{ fontSize: '9px', color: '#22c55e', fontFamily: 'monospace', fontWeight: '900' }}>[GLITCH_BGM]</span>
            <Equalizer color="#22c55e" />
            <div onClick={togglePlay} style={{ color: '#22c55e' }}><PlayIcon size={14} /></div>
          </div>
        );

      case 'FLOATING':
        return (
          <div onClick={() => !isPreview && setIsExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(20,20,25,0.9)', backdropFilter: 'blur(25px)', border: '1px solid rgba(255,215,0,0.3)', padding: '10px 22px', borderRadius: '100px', cursor: 'pointer', boxShadow: '0 15px 40px rgba(0,0,0,0.7), 0 0 20px rgba(255,215,0,0.2)' }}>
            <img src={coverImg} alt="Cover" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: '800' }}>AUDIO</span>
            <div onClick={togglePlay} style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ffd700', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayIcon size={12} />
            </div>
          </div>
        );

      case 'STANDARD':
      default:
        return (
          <div
            onClick={() => !isPreview && setIsExpanded(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(10, 10, 10, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: isPlaying ? '1px solid rgba(255, 215, 0, 0.6)' : '1px solid rgba(255, 215, 0, 0.25)',
              padding: '6px 20px 6px 6px',
              borderRadius: '100px',
              cursor: 'pointer',
              boxShadow: isPlaying ? '0 10px 30px rgba(255, 215, 0, 0.25)' : '0 10px 30px rgba(0, 0, 0, 0.6)',
              transition: 'all 0.3s ease'
            }}
          >
            <div
              onClick={togglePlay}
              style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(255, 215, 0, 0.4)',
                backgroundColor: '#000'
              }}
            >
              <img src={coverImg} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <PlayIcon size={14} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '8px', fontWeight: '900', color: '#ffd700', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {isPlaying ? '▶ NOW PLAYING' : 'MUSIC'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {trackTitle}
              </span>
            </div>
          </div>
        );
    }
  };

  // Preview container vs Fixed Corner container
  return (
    <div style={isPreview ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 1000,
      fontFamily: 'var(--font-inter)'
    }}>
      {/* Hidden YouTube IFrame Player */}
      {ytVideoId && (
        <iframe
          ref={iframeRef}
          title="YouTube Audio Player"
          width="1"
          height="1"
          src={`https://www.youtube.com/embed/${ytVideoId}?enablejsapi=1&autoplay=0&loop=1&playlist=${ytVideoId}&controls=0`}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }}
          allow="autoplay"
        />
      )}

      {/* Fallback Audio Element */}
      {!ytVideoId && (
        <audio
          ref={audioRef}
          src="https://pub-7827a1beaea74d1bb210e941351e7a23.r2.dev/the-weeknd-is-there-someone-else.mp3"
          loop
        />
      )}

      {/* Render Expanded Card vs Minimized Pill */}
      {isExpanded && !isPreview ? renderExpandedCard() : renderLayoutContent()}
    </div>
  );
};
