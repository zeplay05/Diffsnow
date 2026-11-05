import { useState, useRef, useEffect } from 'react'
import { musicConfig } from './musicConfig'
import MusicPlayerThemes from './MusicPlayerThemes'
import './MusicPlayer.css'

export function getYoutubeId(url) {
  if (!url || typeof url !== 'string') return null
  const match = url.trim().match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)
  return match && match[2].length === 11 ? match[2] : null
}

export function getYouTubeStartTime(url) {
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
}

export default function MusicPlayer(props = {}) {
  const isPreview = !!props.isPreview

  // 1. ตรวจสอบค่าเพลงที่ตั้งค่าจากหลังบ้าน (Admin Settings) หรือจาก Props preview
  const [adminUrl, setAdminUrl] = useState(() => {
    if (props.previewUrl !== undefined) return props.previewUrl
    const saved = localStorage.getItem('triples_music_url') || localStorage.getItem('diffsnow_music_url')
    if (saved && (saved.includes('szpLnpkuKr8') || saved.includes('3pC31F2ijrM'))) {
      localStorage.removeItem('triples_music_url')
      localStorage.removeItem('diffsnow_music_url')
      return ''
    }
    return saved || ''
  })
  const [volume, setVolume] = useState(() => {
    if (props.previewVolume !== undefined) return Number(props.previewVolume) / 100
    const stored = localStorage.getItem('triples_music_volume')
    if (stored !== null && !isNaN(Number(stored))) return Number(stored) / 100
    return musicConfig?.defaultVolume ?? 0.8
  })

  const [activeLayout, setActiveLayout] = useState(() => {
    if (props.previewLayout !== undefined) return props.previewLayout
    return localStorage.getItem('triples_music_layout') || 'STANDARD'
  })

  // Props change sync (สำหรับ Live Preview ในหน้าแอดมิน)
  useEffect(() => {
    if (props.previewLayout !== undefined) {
      setActiveLayout(props.previewLayout)
    }
  }, [props.previewLayout])

  useEffect(() => {
    if (props.previewUrl !== undefined) {
      setAdminUrl(props.previewUrl)
    }
  }, [props.previewUrl])

  useEffect(() => {
    if (props.previewVolume !== undefined) {
      setVolume(Number(props.previewVolume) / 100)
    }
  }, [props.previewVolume])

  useEffect(() => {
    if (props.previewExpanded !== undefined) {
      setIsExpanded(props.previewExpanded)
    }
  }, [props.previewExpanded])

  // Sync เมื่อมีการบันทึกเพลงจากหลังบ้าน (real-time cross-tab & component update)
  useEffect(() => {
    const handleSync = () => {
      const storedUrl = localStorage.getItem('triples_music_url') || ''
      const storedVol = localStorage.getItem('triples_music_volume')
      const storedLayout = localStorage.getItem('triples_music_layout')
      setAdminUrl(storedUrl)
      if (storedVol !== null && !isNaN(Number(storedVol))) {
        setVolume(Number(storedVol) / 100)
      }
      if (storedLayout) {
        setActiveLayout(storedLayout)
      }
    }
    window.addEventListener('triples_music_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('triples_music_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // 2. หา URL เพลงที่แท้จริง
  let effectiveUrl = ''
  if (adminUrl && typeof adminUrl === 'string' && adminUrl.trim() !== '') {
    effectiveUrl = adminUrl.trim()
  } else if (musicConfig?.enabled && musicConfig?.tracks?.[0]?.src) {
    effectiveUrl = musicConfig.tracks[0].src.trim()
  }

  // มีเพลงหรือไม่
  const hasTrack = effectiveUrl !== ''
  const ytId = getYoutubeId(effectiveUrl)
  const isYoutube = !!ytId

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [ytMeta, setYtMeta] = useState({ title: '', artist: '' })

  const audioRef = useRef(null)
  const ytPlayerRef = useRef(null)
  const isYtReady = useRef(false)
  const ytWrapperRef = useRef(null)

  // 3. ดึงชื่อเพลง & ศิลปินอัตโนมัติจาก YouTube oEmbed (ถ้าเป็น YouTube)
  useEffect(() => {
    setYtMeta({ title: '', artist: '' })
    if (!ytId) {
      return
    }
    let cancelled = false
    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data && data.title) {
          setYtMeta({
            title: data.title,
            artist: data.author_name || 'YOUTUBE MUSIC',
          })
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [ytId])

  // Track Display Info (แสดง UI ตลอดเวลาแม้ไม่มีเพลงเล่น โดยใช้ปกและชื่อของ Triples เป็นค่าเริ่มต้น)
  const trackInfo = {
    title: ytMeta.title || (isYoutube ? 'YOUTUBE STREAM' : (effectiveUrl ? 'AUDIO STREAM' : 'DIFFSNOW')),
    artist: ytMeta.artist || (isYoutube ? 'NOW PLAYING' : (effectiveUrl ? 'PLAYING' : 'DIFFSNOW OFFICIAL')),
    cover: isYoutube
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : '/asset/diffsnow-logo.png',
    src: effectiveUrl,
  }

  // 4. โหลด YouTube IFrame API Script เมื่อจำเป็น
  useEffect(() => {
    if (isYoutube && !window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      } else {
        document.head.appendChild(tag)
      }
    }
  }, [isYoutube])

  // 5. จัดการ YouTube Player Instance (สลับเพลงใหม่ได้ทันที ห้ามบัคกลับไปเป็นเพลงเดิม)
  useEffect(() => {
    if (!hasTrack || !isYoutube || !ytId || isPreview) {
      if (ytPlayerRef.current) {
        try {
          if (typeof ytPlayerRef.current.destroy === 'function') {
            ytPlayerRef.current.destroy();
          }
        } catch (e) {}
        ytPlayerRef.current = null;
        isYtReady.current = false;
      }
      if (ytWrapperRef.current) {
        ytWrapperRef.current.innerHTML = '';
      }
      if (!hasTrack) {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      }
      return;
    }

    let isSubscribed = true;
    const initYT = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(initYT, 200);
        return;
      }
      if (!isSubscribed) return;

      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
          ytPlayerRef.current.destroy();
        }
      } catch (err) {}
      ytPlayerRef.current = null;
      isYtReady.current = false;

      if (!ytWrapperRef.current) return;
      ytWrapperRef.current.innerHTML = '';
      const containerDiv = document.createElement('div');
      ytWrapperRef.current.appendChild(containerDiv);

      const startTime = getYouTubeStartTime(effectiveUrl);
      ytPlayerRef.current = new window.YT.Player(containerDiv, {
        height: '200',
        width: '200',
        videoId: ytId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: ytId,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          rel: 0,
          ...(startTime > 0 ? { start: startTime } : {}),
        },
        events: {
          onReady: (e) => {
            if (!isSubscribed) return;
            isYtReady.current = true;
            try {
              e.target.setVolume(isMuted ? 0 : volume * 100);
              if (startTime > 0) {
                e.target.seekTo(startTime, true);
              }
              if (musicConfig.autoPlay) {
                e.target.playVideo();
                setIsPlaying(true);
              }
            } catch (err) {}

            setTimeout(() => {
              if (!isSubscribed) return;
              try {
                const state = e.target.getPlayerState();
                if (state !== 1 && state !== 3) {
                  e.target.mute();
                  e.target.playVideo();
                  setIsPlaying(true);
                }
              } catch (err) {}
            }, 300);
          },
          onStateChange: (e) => {
            if (!isSubscribed) return;
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              try {
                setDuration(e.target.getDuration() || 0);
              } catch (e) {}
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (e.data === window.YT.PlayerState.ENDED) {
              try {
                const sTime = getYouTubeStartTime(effectiveUrl);
                e.target.seekTo(sTime, true);
                e.target.playVideo();
              } catch (e) {}
            }
          },
        },
      });
    };

    initYT();

    return () => {
      isSubscribed = false;
    };
  }, [hasTrack, isYoutube, ytId, isPreview]);

  // 6. เล่นอัตโนมัติสำหรับ HTML5 Audio
  useEffect(() => {
    if (!hasTrack || isYoutube || !audioRef.current || !musicConfig.autoPlay || isPreview) {
      if (!isYoutube) setIsPlaying(false)
      return
    }

    const audio = audioRef.current
    audio.loop = !!musicConfig.loop
    audio.volume = isMuted ? 0 : volume

    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If browser policy prevents unmuted autoplay on direct load, start muted first so it runs
          audio.muted = true
          audio.play().then(() => setIsPlaying(true)).catch(() => {})
        })
    }
  }, [hasTrack, isYoutube, effectiveUrl, isPreview])

  // 7. จัดการ Browser Autoplay Gesture Unlock สำหรับ YouTube & Audio
  useEffect(() => {
    if (isPreview) return

    const unlockPlayback = () => {
      try {
        if (isYoutube && ytPlayerRef.current) {
          if (typeof ytPlayerRef.current.isMuted === 'function' && ytPlayerRef.current.isMuted()) {
            ytPlayerRef.current.unMute()
          }
          if (typeof ytPlayerRef.current.setVolume === 'function') {
            ytPlayerRef.current.setVolume(isMuted ? 0 : volume * 100)
          }
          if (typeof ytPlayerRef.current.playVideo === 'function') {
            ytPlayerRef.current.playVideo()
          }
          setIsPlaying(true)
        } else if (audioRef.current) {
          audioRef.current.muted = false
          audioRef.current.volume = isMuted ? 0 : volume
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
        }
      } catch (err) {}
    }

    const events = ['click', 'pointerdown', 'touchstart', 'touchend', 'keydown', 'scroll', 'wheel', 'mousemove']
    events.forEach(ev => window.addEventListener(ev, unlockPlayback, { once: true, passive: true }))

    return () => {
      events.forEach(ev => window.removeEventListener(ev, unlockPlayback))
    }
  }, [isYoutube, volume, isMuted, isPreview])

  // 8. ซิงค์ Volume (รองรับทั้ง YouTube และ HTML5 Audio แบบ Real-time)
  useEffect(() => {
    const targetVol = isMuted ? 0 : Math.round(volume * 100)
    if (isYoutube && ytPlayerRef.current) {
      try {
        if (!isMuted && typeof ytPlayerRef.current.isMuted === 'function' && ytPlayerRef.current.isMuted()) {
          ytPlayerRef.current.unMute()
        }
        if (typeof ytPlayerRef.current.setVolume === 'function') {
          ytPlayerRef.current.setVolume(targetVol)
        }
      } catch (e) {}
    } else if (audioRef.current) {
      audioRef.current.muted = isMuted
      audioRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume))
    }
  }, [volume, isMuted, isYoutube])

  // 9. ตัวนับเวลา Progress Timer
  useEffect(() => {
    let interval = null
    if (isPlaying && hasTrack) {
      interval = setInterval(() => {
        if (isYoutube && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          try {
            setCurrentTime(ytPlayerRef.current.getCurrentTime() || 0)
            const dur = ytPlayerRef.current.getDuration() || 0
            if (dur > 0) setDuration(dur)
          } catch (e) {}
        } else if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime || 0)
          setDuration(audioRef.current.duration || 0)
        }
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isPlaying, hasTrack, isYoutube])

  // Toggle Play / Pause
  const togglePlay = (e) => {
    if (e) e.stopPropagation()
    if (!hasTrack) return

    if (isYoutube) {
      if (!ytPlayerRef.current) return
      if (isPlaying) {
        try {
          ytPlayerRef.current.pauseVideo()
        } catch (e) {}
        setIsPlaying(false)
      } else {
        try {
          ytPlayerRef.current.playVideo()
        } catch (e) {}
        setIsPlaying(true)
      }
    } else {
      if (!audioRef.current) return
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false))
      }
    }
  }

  // Seek
  const handleSeek = (e) => {
    if (!hasTrack) return
    const seekTo = parseFloat(e.target.value)
    setCurrentTime(seekTo)

    if (isYoutube && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(seekTo, true)
      } catch (e) {}
    } else if (audioRef.current) {
      audioRef.current.currentTime = seekTo
    }
  }

  const handleEnded = () => {
    if (!hasTrack || !audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
  }

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  // แสดง UI เครื่องเล่นเพลงอยู่ตลอดแม้ยังไม่มีเพลงเล่น (ซ่อนเฉพาะกรณีเลือก Layout HIDDEN บนหน้าเว็บจริง)
  return (
    <div
      id="cyber-music-widget"
      className={`${isPreview ? 'is-preview-mode' : ''} ${activeLayout === 'BOTTOM BAR' ? 'layout-bottom-bar' : ''} ${activeLayout === 'HIDDEN' && !isPreview ? 'layout-hidden-site' : ''}`}
    >
      {/* Hidden YouTube Player Frame */}
      {!isPreview && (
        <div
          ref={ytWrapperRef}
          style={{
            position: 'fixed',
            bottom: '0px',
            right: '0px',
            width: '200px',
            height: '200px',
            opacity: 0.001,
            pointerEvents: 'none',
            zIndex: -9999,
          }}
        />
      )}

      {/* HTML5 Audio (สำหรับลิงก์ direct mp3) */}
      {!isYoutube && hasTrack && (
        <audio
          ref={audioRef}
          src={effectiveUrl}
          loop={!!musicConfig.loop}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime)
              setDuration(audioRef.current.duration || 0)
            }
          }}
          onEnded={handleEnded}
        />
      )}

      {/* Selected Layout Render */}
      {activeLayout !== 'STANDARD' ? (
        <MusicPlayerThemes
          layout={activeLayout}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          trackInfo={trackInfo}
          currentTime={currentTime}
          duration={duration}
          handleSeek={handleSeek}
          progressPercent={progressPercent}
          formatTime={formatTime}
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          isPreview={isPreview}
          onRestart={() => {
            setCurrentTime(0)
            if (isYoutube && ytPlayerRef.current) {
              try { ytPlayerRef.current.seekTo(0) } catch (e) {}
            } else if (audioRef.current) {
              audioRef.current.currentTime = 0
            }
          }}
          onReplay={() => {
            setCurrentTime(0)
            if (isYoutube && ytPlayerRef.current) {
              try { ytPlayerRef.current.seekTo(0) } catch (e) {}
            } else if (audioRef.current) {
              audioRef.current.currentTime = 0
            }
          }}
        />
      ) : (
        <>
          {/* =========================================================
              VIEW A: COMPACT CAPSULE (ตอนย่อ)
              ========================================================= */}
      {!isExpanded && (
        <div className="cyber-pill" onClick={() => setIsExpanded(true)}>
          <div className="pill-disc-frame">
            <img
              src={trackInfo.cover || '/asset/diffsnow-logo.png'}
              alt={trackInfo.title}
              className={`pill-vinyl ${isPlaying ? 'spin' : ''}`}
              onError={(e) => {
                e.target.src = '/asset/diffsnow-logo.png'
              }}
            />
            <div className="pill-vinyl-core" />
          </div>

          <div className="pill-meta">
            <div className="pill-status-row">
              <span className={`live-badge-dot ${isPlaying ? 'is-green' : 'is-red'}`} />
              <span className="pill-status-text">
                {isPlaying ? 'NOW PLAYING' : 'PAUSE PLAYING'}
              </span>
            </div>
            <span className="pill-song-name">{trackInfo.title}</span>
          </div>

          {/* Equalizer Wave Bars */}
          <div className={`pill-eq-bars ${isPlaying ? 'active' : ''}`}>
            <span className="eq-bar b1" />
            <span className="eq-bar b2" />
            <span className="eq-bar b3" />
            <span className="eq-bar b4" />
          </div>

          <button
            className={`pill-action-btn ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
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
        </div>
      )}

      {/* =========================================================
          VIEW B: CYBER-GLASS HOLOGRAPHIC CONSOLE (การ์ดกระจกตัวเต็ม)
          ========================================================= */}
      {isExpanded && (
        <div className="cyber-player-card">
          {/* Top Glass Header */}
          <div className="cyber-card-header">
            <div className="cyber-badge-wrapper">
              <span className={`cyber-live-indicator ${isPlaying ? 'is-green' : 'is-red'}`} />
              <span className="cyber-badge-title">
                {isPlaying ? 'NOW PLAYING' : 'PAUSE PLAYING'}
              </span>
            </div>

            {/* Minimize / Collapse Button */}
            {!isPreview && (
              <button
                className="cyber-collapse-btn"
                onClick={() => setIsExpanded(false)}
                title="Minimize"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            )}
          </div>

          {/* Central Track Presentation (Disc + Info + Visualizer) */}
          <div className="cyber-track-showcase">
            <div className="vinyl-cover-container">
              <img
                src={trackInfo.cover || '/asset/diffsnow-logo.png'}
                alt={trackInfo.title}
                className={`vinyl-art-image ${isPlaying ? 'spinning' : ''}`}
                onError={(e) => {
                  e.target.src = '/asset/diffsnow-logo.png'
                }}
              />
              <div className="vinyl-center-groove" />
              <div className={`vinyl-glow-aura ${isPlaying ? 'active' : ''}`} />
            </div>

            <div className="cyber-track-info">
              <div className="cyber-track-title-row">
                <h3 className="cyber-title-text">{trackInfo.title}</h3>
              </div>
              <p className="cyber-artist-text">{trackInfo.artist}</p>

              {/* Dynamic Equalizer Visualizer */}
              <div className={`cyber-equalizer ${isPlaying ? 'playing' : ''}`}>
                <span className="eq-col e1" />
                <span className="eq-col e2" />
                <span className="eq-col e3" />
                <span className="eq-col e4" />
                <span className="eq-col e5" />
                <span className="eq-col e6" />
                <span className="eq-col e7" />
              </div>
            </div>
          </div>

          {/* Neon Scrubber Progress Slider */}
          <div className="cyber-progress-box">
            <div className="scrubber-track-wrapper">
              <div
                className="scrubber-fill-bar"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range"
                className="cyber-scrubber-input"
                min="0"
                max={duration || 100}
                step="0.5"
                value={currentTime}
                onChange={handleSeek}
              />
            </div>
            <div className="cyber-time-display">
              <span className="time-curr">{formatTime(currentTime)}</span>
              <span className="time-dur">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Bar: Prev | Big Crimson Jewel Play/Pause | Next */}
          <div className="cyber-controls-bar">
            {/* Prev Track */}
            <button
              className="cyber-step-btn"
              onClick={() => {
                setCurrentTime(0)
                if (isYoutube && ytPlayerRef.current) {
                  try { ytPlayerRef.current.seekTo(0) } catch (e) {}
                } else if (audioRef.current) {
                  audioRef.current.currentTime = 0
                }
              }}
              title="Restart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Main Crimson Glow Play / Pause Button */}
            <button
              className={`cyber-play-jewel ${isPlaying ? 'is-playing' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next Track */}
            <button
              className="cyber-step-btn"
              onClick={() => {
                setCurrentTime(0)
                if (isYoutube && ytPlayerRef.current) {
                  try { ytPlayerRef.current.seekTo(0) } catch (e) {}
                } else if (audioRef.current) {
                  audioRef.current.currentTime = 0
                }
              }}
              title="Replay"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Volume Capsule Slider Bar (หลอดเพิ่มเสียงลดเสียงสำหรับ Standard) */}
          <div className="cyber-volume-capsule" style={{ marginTop: '16px', width: '100%', boxSizing: 'border-box' }}>
            <button
              className="cyber-vol-icon-btn"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <div className="vol-slider-wrap">
              <div
                className="vol-fill-line"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
              <input
                type="range"
                className="cyber-vol-slider"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  setVolume(val)
                  setIsMuted(val === 0)
                  localStorage.setItem('triples_music_volume', String(Math.round(val * 100)))
                  window.dispatchEvent(new Event('triples_music_updated'))
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 800, minWidth: '32px', textAlign: 'right', fontFamily: 'monospace' }}>
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
