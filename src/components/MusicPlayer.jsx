import React, { useState, useRef, useEffect } from 'react';

// Extract YouTube video ID
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = String(url).match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Extract start time in seconds (e.g. t=13s, start=13, or default 13 for 6MCiaKFkhfg)
export const getYouTubeStartTime = (url) => {
  if (!url || typeof url !== 'string') return 0;
  const matchT = url.match(/[?&#](?:t|start)=(\d+)/i);
  if (matchT && matchT[1]) return parseInt(matchT[1], 10);
  const matchTs = url.match(/[?&#]t=(\d+)s/i);
  if (matchTs && matchTs[1]) return parseInt(matchTs[1], 10);
  const matchMinSec = url.match(/[?&#]t=(?:(\d+)m)?(?:(\d+)s)?/i);
  if (matchMinSec && (matchMinSec[1] || matchMinSec[2])) {
    const min = parseInt(matchMinSec[1] || '0', 10);
    const sec = parseInt(matchMinSec[2] || '0', 10);
    if (min > 0 || sec > 0) return min * 60 + sec;
  }
  if (url.includes('6MCiaKFkhfg')) return 13;
  return 0;
};

const cleanMusicUrl = (raw) => {
  if (!raw || raw.includes('3pC31F2ijrM') || raw.includes('szpLnpkuKr8')) {
    return 'https://www.youtube.com/watch?v=6MCiaKFkhfg&t=13s';
  }
  return raw;
};

export const MusicPlayer = ({ isPreview = false, previewLayout, previewUrl, previewVolume, previewExpanded, settings }) => {
  const [isPlaying, setIsPlaying] = useState(!isPreview);
  const [isExpanded, setIsExpanded] = useState(() => {
    if (previewExpanded !== undefined) return previewExpanded;
    return false;
  });

  // Settings from localStorage or props
  const [musicUrl, setMusicUrl] = useState(() => {
    const raw = previewUrl || localStorage.getItem('diffsnow_music_url') || localStorage.getItem('triples_music_url');
    return cleanMusicUrl(raw);
  });
  const [currentTime, setCurrentTime] = useState(() => isPreview ? 61 : getYouTubeStartTime(musicUrl));
  const [duration, setDuration] = useState(210);
  const [trackTitle, setTrackTitle] = useState(() => {
    const saved = localStorage.getItem('diffsnow_music_title');
    return (saved && !saved.includes('TRUE BLOOD')) ? saved : 'bye (Altare remix)';
  });
  const [trackArtist, setTrackArtist] = useState(() => {
    const saved = localStorage.getItem('diffsnow_music_artist');
    return (saved && !saved.includes('COOKIEMONSTER')) ? saved : 'Ariana Grande';
  });

  const [volume, setVolume] = useState(() => (previewVolume !== undefined ? previewVolume : Number(localStorage.getItem('diffsnow_music_volume') || localStorage.getItem('triples_music_volume') || 80)));
  const [layout, setLayout] = useState(() => localStorage.getItem('diffsnow_music_layout') || localStorage.getItem('triples_music_layout') || 'STANDARD');

  // In preview mode, always use the live previewLayout prop directly (instant update)
  const activeLayout = isPreview ? (previewLayout || layout) : layout;
  const audioRef = useRef(null);
  const iframeRef = useRef(null);

  // Listen for updates from Admin settings
  useEffect(() => {
    if (!isPreview && previewLayout) setLayout(previewLayout);
    if (previewUrl !== undefined) {
      setMusicUrl(cleanMusicUrl(previewUrl || localStorage.getItem('diffsnow_music_url') || localStorage.getItem('triples_music_url')));
    }
    if (previewVolume !== undefined) setVolume(previewVolume);
    if (previewExpanded !== undefined) setIsExpanded(previewExpanded);
  }, [previewLayout, previewUrl, previewVolume, previewExpanded, isPreview]);

  // The public player receives its configuration from the shared Firebase
  // settings. Local storage remains only as an offline fallback.
  useEffect(() => {
    if (isPreview || !settings) return;
    setMusicUrl(cleanMusicUrl(settings.url));
    setVolume(Number(settings.volume) || 80);
    setLayout(settings.layout || 'STANDARD');
  }, [settings, isPreview]);

  useEffect(() => {
    const handleStorage = () => {
      if (!previewLayout) setLayout(localStorage.getItem('diffsnow_music_layout') || localStorage.getItem('triples_music_layout') || 'STANDARD');
      if (!previewUrl) {
        setMusicUrl(cleanMusicUrl(localStorage.getItem('diffsnow_music_url') || localStorage.getItem('triples_music_url')));
      }
      if (previewVolume === undefined) {
        const v = Number(localStorage.getItem('diffsnow_music_volume') || localStorage.getItem('triples_music_volume') || 80);
        setVolume(v);
        sendYouTubeCommand('setVolume', [v]);
        if (audioRef.current) audioRef.current.volume = v / 100;
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('sameweknow_music_updated', handleStorage);
    window.addEventListener('diffsnow_music_updated', handleStorage);
    window.addEventListener('triples_music_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sameweknow_music_updated', handleStorage);
      window.removeEventListener('diffsnow_music_updated', handleStorage);
      window.removeEventListener('triples_music_updated', handleStorage);
    };
  }, [previewLayout, previewUrl, previewVolume]);

  const ytVideoId = getYouTubeVideoId(musicUrl);
  const coverImg = ytVideoId
    ? `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`
    : 'https://img.youtube.com/vi/6MCiaKFkhfg/hqdefault.jpg';

  // Fetch YouTube Metadata (Title & Artist)
  useEffect(() => {
    if (!ytVideoId) {
      setTrackTitle('bye (Altare remix)');
      setTrackArtist('Ariana Grande');
      return;
    }

    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytVideoId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          let title = data.title;
          let artist = data.author_name || 'Ariana Grande';

          if (title.includes(' - ')) {
            const parts = title.split(' - ');
            if (parts.length >= 2) {
              artist = parts[0].trim();
              title = parts.slice(1).join(' - ').trim();
            }
          }

          setTrackTitle(title);
          setTrackArtist(artist);
          localStorage.setItem('diffsnow_music_title', title);
          localStorage.setItem('diffsnow_music_artist', artist);
        }
      })
      .catch(() => {
        setTrackTitle('bye (Altare remix)');
        setTrackArtist('Ariana Grande');
      });
  }, [ytVideoId]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (isPreview) return;
    const target = Math.max(0, currentTime - 10);
    setCurrentTime(target);
    if (ytVideoId) sendYouTubeCommand('seekTo', [target, true]);
    if (audioRef.current) audioRef.current.currentTime = target;
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (isPreview) return;
    const target = Math.min(duration - 1, currentTime + 10);
    setCurrentTime(target);
    if (ytVideoId) sendYouTubeCommand('seekTo', [target, true]);
    if (audioRef.current) audioRef.current.currentTime = target;
  };

  const sendYouTubeCommand = (func, args = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  // Autoplay and loop handling
  useEffect(() => {
    if (isPreview) return;

    const startPlayback = () => {
      const sTime = getYouTubeStartTime(musicUrl);
      if (ytVideoId) {
        if (sTime > 0) {
          sendYouTubeCommand('seekTo', [sTime, true]);
        }
        sendYouTubeCommand('playVideo');
        sendYouTubeCommand('setVolume', [volume]);
        setIsPlaying(true);
      } else if (audioRef.current) {
        audioRef.current.volume = volume / 100;
        if (sTime > 0) audioRef.current.currentTime = sTime;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    // Attempt autoplay shortly after mount
    const timer = setTimeout(startPlayback, 600);

    // First user gesture unlock for strict browser policies
    const handleFirstGesture = () => {
      startPlayback();
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    // Handle YouTube loop on video end message
    const handleMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && (data.event === 'onStateChange' || data.info === 0)) {
          if (data.info === 0) {
            // Video ended -> restart for loop at start time
            const sTime = getYouTubeStartTime(musicUrl);
            sendYouTubeCommand('seekTo', [sTime, true]);
            sendYouTubeCommand('playVideo');
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('message', handleMessage);
    };
  }, [ytVideoId, isPreview, volume]);

  // Live timer interval with smooth audio fade-out and seamless loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (audioRef.current && !ytVideoId) {
          const curr = audioRef.current.currentTime || 0;
          const dur = audioRef.current.duration || 210;
          if (!isNaN(dur) && dur > 0) setDuration(dur);

          // Smooth fade-out in the last 3 seconds
          if (dur - curr <= 3 && dur - curr > 0) {
            const fadeRatio = (dur - curr) / 3;
            audioRef.current.volume = Math.max(0, (volume / 100) * fadeRatio);
          }

          if (curr >= dur || audioRef.current.ended) {
            audioRef.current.currentTime = 0;
            audioRef.current.volume = volume / 100;
            audioRef.current.play().catch(() => {});
            setCurrentTime(0);
          } else {
            setCurrentTime(curr);
          }
        } else {
          setCurrentTime(prev => {
            const nextTime = Number((prev + 0.5).toFixed(1));

            // Smooth fade out in the last 4 seconds for YouTube
            if (duration - nextTime <= 4 && duration - nextTime > 0) {
              const fadeRatio = (duration - nextTime) / 4;
              sendYouTubeCommand('setVolume', [Math.max(0, Math.round(volume * fadeRatio))]);
            }

            // Loop reset when song ends
            if (nextTime >= duration) {
              const sTime = getYouTubeStartTime(musicUrl);
              sendYouTubeCommand('seekTo', [sTime, true]);
              sendYouTubeCommand('playVideo');
              sendYouTubeCommand('setVolume', [volume]);
              return sTime;
            }
            return nextTime;
          });
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, ytVideoId, duration, volume]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (isPreview) return; // Locked in Live Preview: stays paused at all times
    if (ytVideoId) {
      if (isPlaying) {
        sendYouTubeCommand('pauseVideo');
      } else {
        sendYouTubeCommand('playVideo');
        sendYouTubeCommand('setVolume', [volume]);
      }
      setIsPlaying(!isPlaying);
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = volume / 100;
        audioRef.current.play().catch(err => console.log('Autoplay prevented:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (ytVideoId) {
      sendYouTubeCommand('setVolume', [val]);
    }
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
    if (!isPreview) {
      localStorage.setItem('sameweknow_music_volume', String(val));
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60) || 0;
    const s = Math.floor(secs % 60) || 0;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (activeLayout === 'HIDDEN' && !isPreview) {
    return null;
  }

  // Common Play Icon
  const PlayIcon = ({ size = 16 }) => (
    isPlaying ? (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
    ) : (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    )
  );

  // Equalizer animation bars
  const Equalizer = ({ color = '#ffd700' }) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '14px' }}>
      <span style={{ width: '3px', height: isPlaying ? '14px' : '4px', background: color, borderRadius: '2px', transition: 'height 0.2s ease', animation: isPlaying ? 'bounceBar 0.6s ease infinite alternate' : 'none' }} />
      <span style={{ width: '3px', height: isPlaying ? '10px' : '6px', background: color, borderRadius: '2px', transition: 'height 0.2s ease', animation: isPlaying ? 'bounceBar 0.8s ease infinite 0.2s alternate' : 'none' }} />
      <span style={{ width: '3px', height: isPlaying ? '14px' : '3px', background: color, borderRadius: '2px', transition: 'height 0.2s ease', animation: isPlaying ? 'bounceBar 0.5s ease infinite 0.4s alternate' : 'none' }} />
      <span style={{ width: '3px', height: isPlaying ? '8px' : '5px', background: color, borderRadius: '2px', transition: 'height 0.2s ease', animation: isPlaying ? 'bounceBar 0.7s ease infinite 0.1s alternate' : 'none' }} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL EXPANDED CARD VIEW — DEDICATED CUSTOM UI FOR EVERY LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════
  const renderExpandedCard = () => {
    // ── 1. MINIMAL ─────────────────────────────────────────────────────────────
    if (activeLayout === 'MINIMAL') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '310px', background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2em', color: '#ffd700', textTransform: 'uppercase' }}>● MINIMAL AUDIO</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>✕</button>
          </div>
          <div style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <img src={coverImg} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: '0.1em' }}>{trackArtist}</p>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '2px', accentColor: '#ffd700', cursor: 'pointer', marginBottom: '6px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
            <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '70px', height: '2px', accentColor: '#ffd700' }} />
            <button onClick={togglePlay} style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ffd700', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 2. COMPACT ────────────────────────────────────────────────────────────
    if (activeLayout === 'COMPACT') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '360px', background: 'rgba(15,15,15,0.96)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '16px', padding: '16px', boxShadow: '0 15px 40px rgba(0,0,0,0.8), 0 0 20px rgba(255,215,0,0.1)', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,215,0,0.4)' }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '8px', color: '#ffd700', fontWeight: '900', letterSpacing: '0.15em' }}>COMPACT AUDIO</span>
                <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕</button>
              </div>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{trackArtist}</p>
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#ffd700', cursor: 'pointer', marginBottom: '10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Equalizer color="#ffd700" />
              <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '60px', height: '2px', accentColor: '#ffd700' }} />
            </div>
            <button onClick={togglePlay} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700, #b8860b)', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlayIcon size={14} /></button>
          </div>
        </div>
      );
    }

    // ── 3. GLASS ──────────────────────────────────────────────────────────────
    if (activeLayout === 'GLASS') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '330px', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '28px', padding: '22px', boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 0 30px rgba(255,255,255,0.05)', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>✦ FROSTED GLASS</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 10px 30px rgba(255,255,255,0.2)' }}>
            <img src={coverImg} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{trackArtist}</p>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#ffffff', cursor: 'pointer', marginBottom: '6px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
            <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '70px', height: '2px', accentColor: '#ffffff' }} />
            <button onClick={togglePlay} style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(255,255,255,0.5)' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 4. ROUND ──────────────────────────────────────────────────────────────
    if (activeLayout === 'ROUND') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '320px', background: 'rgba(18,18,20,0.97)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: '30px', padding: '22px', boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(255,215,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'var(--font-inter)' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#ffd700', letterSpacing: '0.2em' }}>VINYL DISC MODE</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, #333 10%, #111 60%, #000 100%)', border: '3px solid #ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(255,215,0,0.3)', animation: isPlaying ? 'spin 10s linear infinite' : 'none' }}>
            <img src={coverImg} alt="Cover" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffd700' }} />
          </div>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', margin: '0 0 2px', textAlign: 'center', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
          <p style={{ fontSize: '10px', color: '#ffd700', margin: '0 0 14px', letterSpacing: '0.1em' }}>{trackArtist}</p>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#ffd700', cursor: 'pointer', marginBottom: '14px' }} />
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '70px', height: '2px', accentColor: '#ffd700' }} />
            <button onClick={togglePlay} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ffd700', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,215,0,0.4)' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 5. NEON GLOW ──────────────────────────────────────────────────────────
    if (activeLayout === 'NEON GLOW') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '340px', background: 'rgba(5,10,18,0.97)', border: '1px solid #00f0ff', borderRadius: '20px', padding: '22px', boxShadow: '0 0 35px rgba(0,240,255,0.35), inset 0 0 20px rgba(0,240,255,0.1)', fontFamily: 'var(--font-orbitron)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: '#00f0ff', borderRadius: '50%', boxShadow: '0 0 10px #00f0ff' }} />
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#00f0ff', letterSpacing: '0.2em' }}>NEON CYBER AUDIO</span>
            </div>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#00f0ff', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '74px', height: '74px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #00f0ff', boxShadow: '0 0 20px rgba(0,240,255,0.4)' }} />
            <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#ffffff', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '10px', color: '#00f0ff', margin: 0 }}>{trackArtist}</p>
              <div style={{ marginTop: '8px' }}><Equalizer color="#00f0ff" /></div>
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#00f0ff', cursor: 'pointer', marginBottom: '6px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#00f0ff', marginBottom: '16px', fontFamily: 'monospace' }}>
            <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '80px', height: '2px', accentColor: '#00f0ff' }} />
            <button onClick={togglePlay} style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#00f0ff', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px #00f0ff' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 6. OS ─────────────────────────────────────────────────────────────────
    if (activeLayout === 'OS') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '340px', background: '#000000', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '32px', padding: '22px', boxShadow: '0 30px 70px rgba(0,0,0,0.98)', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>Now Playing</span>
            </div>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '70px', height: '70px', borderRadius: '16px', objectFit: 'cover' }} />
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{trackArtist}</p>
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '4px', accentColor: '#22c55e', cursor: 'pointer', marginBottom: '6px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
            <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '80px', height: '3px', accentColor: '#ffffff' }} />
            <button onClick={togglePlay} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(255,255,255,0.25)' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 7. RETRO VINYL ────────────────────────────────────────────────────────
    if (activeLayout === 'RETRO VINYL') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '340px', background: 'linear-gradient(135deg, #1c1510, #0d0a08)', border: '2px solid #d4af37', borderRadius: '16px', padding: '22px', boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(212,175,55,0.2)', fontFamily: 'serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#d4af37', textTransform: 'uppercase', fontWeight: 'bold' }}>◈ HI-FI STEREO TURNTABLE</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#111', border: '2px dashed #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: isPlaying ? 'spin 8s linear infinite' : 'none' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#d4af37' }} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '14px', color: '#d4af37', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', margin: 0, fontStyle: 'italic' }}>{trackArtist}</p>
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#d4af37', cursor: 'pointer', marginBottom: '16px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '80px', height: '2px', accentColor: '#d4af37' }} />
            <button onClick={togglePlay} style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#d4af37', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(212,175,55,0.3)' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 8. PIXEL ART ──────────────────────────────────────────────────────────
    if (activeLayout === 'PIXEL ART') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '320px', background: '#000000', border: '3px solid #ffd700', borderRadius: '0px', padding: '18px', boxShadow: '6px 6px 0px #ffd700', fontFamily: 'monospace' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '2px dashed #ffd700', paddingBottom: '6px' }}>
            <span style={{ fontSize: '10px', color: '#ffd700', fontWeight: '900' }}>[8-BIT ARCADE AUDIO]</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#ffd700', cursor: 'pointer', fontWeight: 'bold' }}>[X]</button>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '60px', height: '60px', border: '2px solid #ffd700', objectFit: 'cover' }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: '900', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</div>
              <div style={{ fontSize: '9px', color: '#ffd700' }}>{trackArtist}</div>
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '6px', accentColor: '#ffd700', cursor: 'pointer', marginBottom: '14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '9px', color: '#ffd700' }}>VOL:{volume}%</span>
            <button onClick={togglePlay} style={{ padding: '6px 14px', background: '#ffd700', color: '#000', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '11px' }}>{isPlaying ? 'PAUSE' : 'PLAY'}</button>
          </div>
        </div>
      );
    }

    // ── 9. FUTURISTIC ─────────────────────────────────────────────────────────
    if (activeLayout === 'FUTURISTIC') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '340px', background: 'rgba(8,14,24,0.96)', border: '1px solid #38bdf8', borderLeft: '4px solid #38bdf8', borderRight: '4px solid #38bdf8', borderRadius: '4px', padding: '20px', boxShadow: '0 0 30px rgba(56,189,248,0.25)', fontFamily: 'var(--font-orbitron)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '9px', color: '#38bdf8', letterSpacing: '0.2em', fontWeight: '900' }}>// AUDIO_CORE_v4.2</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '68px', height: '68px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #38bdf8' }} />
            <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '10px', color: '#38bdf8', margin: '0 0 6px' }}>{trackArtist}</p>
              <Equalizer color="#38bdf8" />
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#38bdf8', cursor: 'pointer', marginBottom: '14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '80px', height: '2px', accentColor: '#38bdf8' }} />
            <button onClick={togglePlay} style={{ width: '42px', height: '42px', borderRadius: '4px', background: '#38bdf8', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px #38bdf8' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 10. BOTTOM BAR ────────────────────────────────────────────────────────
    if (activeLayout === 'BOTTOM BAR') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '380px', background: 'rgba(12,12,12,0.97)', border: '1px solid rgba(255,215,0,0.5)', borderRadius: '40px', padding: '16px 24px', boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 25px rgba(255,215,0,0.2)', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '8px', color: '#ffd700', fontWeight: '900', letterSpacing: '0.2em' }}>PANORAMIC STUDIO DOCK</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffd700' }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '10px', color: '#ffd700', margin: 0 }}>{trackArtist}</p>
            </div>
            <button onClick={togglePlay} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffd700', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlayIcon size={14} /></button>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#ffd700', cursor: 'pointer' }} />
        </div>
      );
    }

    // ── 11. FLOATING ──────────────────────────────────────────────────────────
    if (activeLayout === 'FLOATING') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '320px', background: 'rgba(22,22,30,0.92)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '36px', padding: '22px', boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(255,215,0,0.2)', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#ffd700', letterSpacing: '0.2em' }}>ZERO-G FLOATING</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 14px', overflow: 'hidden', border: '2px solid #ffd700', boxShadow: '0 0 25px rgba(255,215,0,0.3)' }}>
            <img src={coverImg} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{trackArtist}</p>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#ffd700', cursor: 'pointer', marginBottom: '14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '70px', height: '2px', accentColor: '#ffd700' }} />
            <button onClick={togglePlay} style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ffd700', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,215,0,0.4)' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 12. CARBON FIBER ──────────────────────────────────────────────────────
    if (activeLayout === 'CARBON FIBER') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '340px', background: 'radial-gradient(circle, #242424 10%, #111111 90%)', border: '1px solid rgba(255,215,0,0.6)', borderRadius: '18px', padding: '22px', boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 25px rgba(255,215,0,0.2)', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#ef4444', letterSpacing: '0.15em' }}>● CORSA CARBON EDITION</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #ffd700' }} />
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#fff', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '10px', color: '#ef4444', margin: 0, fontWeight: '800' }}>{trackArtist}</p>
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#ffd700', cursor: 'pointer', marginBottom: '14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '70px', height: '2px', accentColor: '#ffd700' }} />
            <button onClick={togglePlay} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ffd700', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,215,0,0.4)' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 13. GLITCH ART ────────────────────────────────────────────────────────
    if (activeLayout === 'GLITCH ART') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '330px', background: '#050505', border: '2px solid #22c55e', borderRadius: '8px', padding: '20px', boxShadow: '0 0 25px rgba(34,197,94,0.3)', fontFamily: 'monospace' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed #22c55e', paddingBottom: '6px' }}>
            <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '900' }}>[SAM_AUDIO_DAEMON://play]</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '64px', height: '64px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #22c55e' }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '900', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</div>
              <div style={{ fontSize: '9px', color: 'rgba(34,197,94,0.7)' }}>{trackArtist}</div>
              <div style={{ marginTop: '6px' }}><Equalizer color="#22c55e" /></div>
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#22c55e', cursor: 'pointer', marginBottom: '14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', color: '#22c55e' }}>VOL:{volume}%</span>
            <button onClick={togglePlay} style={{ width: '38px', height: '38px', borderRadius: '4px', background: '#22c55e', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}><PlayIcon size={14} /></button>
          </div>
        </div>
      );
    }

    // ── 14. STEAMPUNK ─────────────────────────────────────────────────────────
    if (activeLayout === 'STEAMPUNK') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '340px', background: 'linear-gradient(135deg, #2a1810, #140c08)', border: '2px solid #b45309', borderRadius: '16px', padding: '22px', boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(180,83,9,0.3)', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(245,158,11,0.3)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#f59e0b', letterSpacing: '0.2em' }}>⚙ BRASS STEAM ENGINE AUDIO</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '68px', height: '68px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #b45309' }} />
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#f59e0b', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '10px', color: '#b45309', margin: 0 }}>{trackArtist}</p>
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#f59e0b', cursor: 'pointer', marginBottom: '14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '70px', height: '2px', accentColor: '#f59e0b' }} />
            <button onClick={togglePlay} style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#b45309', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(180,83,9,0.4)' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 15. SYNTH WAVE ────────────────────────────────────────────────────────
    if (activeLayout === 'SYNTH WAVE') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '340px', background: 'linear-gradient(135deg, rgba(20,10,35,0.97), rgba(45,10,55,0.97))', border: '1px solid #f43f5e', borderRadius: '22px', padding: '22px', boxShadow: '0 0 35px rgba(244,63,94,0.35)', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(244,63,94,0.3)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#f43f5e', letterSpacing: '0.2em' }}>SYNTHWAVE 80s OUTRUN</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #f43f5e', boxShadow: '0 0 20px rgba(244,63,94,0.4)' }} />
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#fbbf24', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '10px', color: '#f43f5e', margin: '0 0 6px' }}>{trackArtist}</p>
              <Equalizer color="#ec4899" />
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#f43f5e', cursor: 'pointer', marginBottom: '14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '80px', height: '2px', accentColor: '#f43f5e' }} />
            <button onClick={togglePlay} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #fbbf24)', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(244,63,94,0.5)' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── 16. MINIMAL STACK ─────────────────────────────────────────────────────
    if (activeLayout === 'MINIMAL STACK') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '310px', background: 'rgba(14,14,14,0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 5px 0px rgba(255,215,0,0.3)', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '9px', fontWeight: '800', color: '#ffd700', letterSpacing: '0.15em' }}>STACKED CARD</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,215,0,0.3)' }} />
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{trackArtist}</p>
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#ffd700', cursor: 'pointer', marginBottom: '14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Equalizer color="#ffd700" />
            <button onClick={togglePlay} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffd700', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlayIcon size={14} /></button>
          </div>
        </div>
      );
    }

    // ── 17. ECHO BASS ─────────────────────────────────────────────────────────
    if (activeLayout === 'ECHO BASS') {
      return (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '340px', background: 'rgba(12,8,22,0.97)', border: '1px solid #a855f7', borderRadius: '24px', padding: '22px', boxShadow: '0 0 35px rgba(168,85,247,0.35)', fontFamily: 'var(--font-inter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(168,85,247,0.25)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#a855f7', letterSpacing: '0.2em' }}>SUB-WOOFER BASS SYSTEM</span>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
            <img src={coverImg} alt="Cover" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #a855f7', boxShadow: '0 0 20px rgba(168,85,247,0.4)' }} />
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackTitle}</h4>
              <p style={{ fontSize: '10px', color: '#a855f7', margin: '0 0 6px' }}>{trackArtist}</p>
              <Equalizer color="#a855f7" />
            </div>
          </div>
          <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(e) => { const v = parseFloat(e.target.value); setCurrentTime(v); if (ytVideoId) sendYouTubeCommand('seekTo', [v, true]); if (audioRef.current) audioRef.current.currentTime = v; }} style={{ width: '100%', height: '3px', accentColor: '#a855f7', cursor: 'pointer', marginBottom: '14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} style={{ width: '80px', height: '2px', accentColor: '#a855f7' }} />
            <button onClick={togglePlay} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#a855f7', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(168,85,247,0.5)' }}><PlayIcon size={16} /></button>
          </div>
        </div>
      );
    }

    // ── DEFAULT / STANDARD (Diffsnow Cyber Ice-Blue Card as in screenshot) ──
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const volumePercent = Math.max(0, Math.min(100, volume));

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '320px',
          maxWidth: 'calc(100vw - 36px)',
          background: 'linear-gradient(155deg, rgba(8, 16, 28, 0.94) 0%, rgba(4, 9, 18, 0.96) 100%)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '26px',
          padding: '20px 22px 18px 22px',
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Chakra Petch', 'Inter', sans-serif",
          animation: 'fadeIn 0.25s ease',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Subtle top-right ambient glow matching the image highlight */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* ── Top Header Row: Green Dot + NOW PLAYING + Collapse (v) ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '0.14em',
            color: '#ffffff',
            textTransform: 'uppercase'
          }}>
            <div style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isPlaying ? '#22c55e' : '#38bdf8',
              boxShadow: isPlaying ? '0 0 10px #22c55e, 0 0 4px #22c55e' : '0 0 10px #38bdf8, 0 0 4px #38bdf8',
              animation: isPlaying ? 'pulseDot 2s infinite ease-in-out' : 'none'
            }} />
            <span style={{ color: '#38bdf8' }}>{isPlaying ? 'NOW PLAYING' : 'PAUSE PLAYING'}</span>
          </div>

          <button
            onClick={() => setIsExpanded(false)}
            title="ย่อขนาด"
            aria-label="ย่อขนาดเครื่องเล่นเพลง"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* ── Middle Row: Vinyl Disc + Track Title/Artist + Equalizer Bars ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
          zIndex: 1
        }}>
          {/* Vinyl Record */}
          <div style={{
            position: 'relative',
            width: '74px',
            height: '74px',
            minWidth: '74px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid rgba(56, 189, 248, 0.55)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.3), 0 8px 24px rgba(0, 0, 0, 0.7)',
            background: '#040812'
          }}>
            <img
              src={coverImg}
              alt="Cover Art"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                animation: isPlaying ? 'spinDisc 9s linear infinite' : 'none'
              }}
            />
            {/* Center vinyl spindle ring */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#070d18',
              border: '2.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 0 6px rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffffff' }} />
            </div>
          </div>

          {/* Track Info & Visualizer */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{
              fontSize: '13.5px',
              fontWeight: '800',
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: '0 0 4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {trackTitle}
            </h3>
            <p style={{
              fontSize: '11px',
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.45)',
              margin: '0 0 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {trackArtist}
            </p>

            {/* Equalizer Wave Bars (themed cyan #38bdf8) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '18px' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <span
                  key={num}
                  style={{
                    width: '3.5px',
                    borderRadius: '2px',
                    background: '#38bdf8',
                    boxShadow: '0 0 6px rgba(56, 189, 248, 0.65)',
                    animation: isPlaying ? `barBounce${num} ${0.8 + num * 0.12}s ease-in-out infinite` : 'none',
                    height: isPlaying ? '12px' : '4px',
                    transition: 'height 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Progress Bar & Time Stamps ── */}
        <div style={{ marginBottom: '14px', zIndex: 1 }}>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentTime(val);
              if (ytVideoId) sendYouTubeCommand('seekTo', [val, true]);
              if (audioRef.current) audioRef.current.currentTime = val;
            }}
            className="diffsnow-slider-thumb"
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${progressPercent}%, rgba(255, 255, 255, 0.12) ${progressPercent}%, rgba(255, 255, 255, 0.12) 100%)`,
              marginBottom: '7px'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.45)',
            fontFamily: "'Chakra Petch', monospace"
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* ── Controls Row: Prev (42px) | Play/Pause (56px) | Next (42px) ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          marginBottom: '16px',
          zIndex: 1
        }}>
          {/* Previous Track Button */}
          <button
            onClick={handlePrev}
            title="ย้อนหลัง 10 วินาที"
            aria-label="ย้อนหลัง"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: 0
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Main Play / Pause Button */}
          <button
            onClick={togglePlay}
            title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นเพลง'}
            aria-label={isPlaying ? 'หยุดชั่วคราว' : 'เล่นเพลง'}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1.5px solid rgba(56, 189, 248, 0.45)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 24px rgba(56, 189, 248, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
              transition: 'all 0.2s ease',
              padding: 0
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.boxShadow = '0 0 32px rgba(56, 189, 248, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.35)';
              e.currentTarget.style.borderColor = '#38bdf8';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(56, 189, 248, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.45)';
            }}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                <polygon points="7,5 19,12 7,19" />
              </svg>
            )}
          </button>

          {/* Next Track Button */}
          <button
            onClick={handleNext}
            title="ข้ามไปข้างหน้า 10 วินาที"
            aria-label="ข้ามไปข้างหน้า"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: 0
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* ── Bottom Volume Pill Row ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '100px',
          padding: '9px 16px',
          zIndex: 1
        }}>
          {/* Speaker Icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>

          {/* Volume Slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="diffsnow-slider-thumb"
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${volumePercent}%, rgba(255, 255, 255, 0.15) ${volumePercent}%, rgba(255, 255, 255, 0.15) 100%)`
            }}
          />

          {/* Percentage */}
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            color: 'rgba(255, 255, 255, 0.85)',
            fontFamily: "'Chakra Petch', monospace",
            minWidth: '32px',
            textAlign: 'right'
          }}>
            {volume}%
          </span>
        </div>
      </div>
    );
  };

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
              background: 'rgba(8, 16, 28, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: isPlaying ? '1.5px solid rgba(56, 189, 248, 0.55)' : '1px solid rgba(56, 189, 248, 0.25)',
              padding: '6px 20px 6px 6px',
              borderRadius: '100px',
              cursor: 'pointer',
              boxShadow: isPlaying ? '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(56, 189, 248, 0.25)' : '0 10px 30px rgba(0, 0, 0, 0.6)',
              transition: 'all 0.3s ease'
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(56, 189, 248, 0.55)',
                backgroundColor: '#040812'
              }}
            >
              <img
                src={coverImg}
                alt="Cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  animation: isPlaying ? 'spinDisc 9s linear infinite' : 'none'
                }}
              />
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
              <span style={{
                fontSize: '9px',
                fontWeight: '900',
                color: '#38bdf8',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {isPlaying ? (
                  <>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 4px #38bdf8)' }}>
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <span>NOW PLAYING</span>
                  </>
                ) : (
                  <>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 4px #38bdf8)' }}>
                      <rect x="5" y="3" width="4.5" height="18" rx="1.5"/>
                      <rect x="14.5" y="3" width="4.5" height="18" rx="1.5"/>
                    </svg>
                    <span>PAUSE PLAYING</span>
                  </>
                )}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {trackTitle}
              </span>
            </div>

            {/* Mini Equalizer Wave in Pill */}
            {isPlaying && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px', marginLeft: '6px' }}>
                {[1, 2, 3, 4].map(n => (
                  <span
                    key={n}
                    style={{
                      width: '2.5px',
                      borderRadius: '1px',
                      background: '#38bdf8',
                      boxShadow: '0 0 4px #38bdf8',
                      animation: `barBounce${n} ${0.6 + n * 0.15}s ease-in-out infinite`,
                      height: '10px'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  // Preview container vs Fixed Corner container
  return (
    <div style={isPreview ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {
      position: 'fixed',
      bottom: 'clamp(16px, 2.5vh, 30px)',
      right: 'clamp(12px, 2.5vw, 30px)',
      maxWidth: 'calc(100vw - 24px)',
      zIndex: 1000,
      fontFamily: 'var(--font-inter)'
    }}>
      {/* Hidden YouTube IFrame Player (Only on Live Public Site) */}
      {ytVideoId && !isPreview && (
        <iframe
          ref={iframeRef}
          title="YouTube Audio Player"
          width="1"
          height="1"
          src={`https://www.youtube.com/embed/${ytVideoId}?enablejsapi=1&autoplay=0&loop=1&playlist=${ytVideoId}&controls=0${getYouTubeStartTime(musicUrl) > 0 ? `&start=${getYouTubeStartTime(musicUrl)}` : ''}`}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }}
          allow="autoplay"
        />
      )}

      {/* Fallback Audio Element (Only on Live Public Site) */}
      {!ytVideoId && !isPreview && (
        <audio
          ref={audioRef}
          src="https://pub-7827a1beaea74d1bb210e941351e7a23.r2.dev/the-weeknd-is-there-someone-else.mp3"
          loop
        />
      )}

      {/* Render Expanded Card vs Minimized Pill */}
      {isExpanded ? renderExpandedCard() : renderLayoutContent()}
    </div>
  );
};

export default MusicPlayer;

