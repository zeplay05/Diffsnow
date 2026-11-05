import React, { useState, useRef, useEffect } from 'react';

// Extract YouTube video ID
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = String(url).match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const MusicPlayer = ({ isPreview = false, previewLayout, previewUrl, previewVolume }) => {
  const [isPlaying, setIsPlaying] = useState(!isPreview);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(210);
  const [trackTitle, setTrackTitle] = useState(() => localStorage.getItem('sameweknow_music_title') || 'SAMEWEKNOW AUDIO');
  const [trackArtist, setTrackArtist] = useState(() => localStorage.getItem('sameweknow_music_artist') || 'MANNY');

  // Settings from localStorage or props
  const [musicUrl, setMusicUrl] = useState(() => previewUrl || localStorage.getItem('sameweknow_music_url') || 'https://youtu.be/1G5BtCQkPHQ?si=7ITQQTrYgJbKOl8');
  const [volume, setVolume] = useState(() => (previewVolume !== undefined ? previewVolume : Number(localStorage.getItem('sameweknow_music_volume') || 50)));
  const [layout, setLayout] = useState(() => localStorage.getItem('sameweknow_music_layout') || 'STANDARD');

  // In preview mode, always use the live previewLayout prop directly (instant update)
  const activeLayout = isPreview ? (previewLayout || layout) : layout;
  const audioRef = useRef(null);
  const iframeRef = useRef(null);

  // Listen for updates from Admin settings
  useEffect(() => {
    if (!isPreview && previewLayout) setLayout(previewLayout);
    if (previewUrl !== undefined) setMusicUrl(previewUrl || localStorage.getItem('sameweknow_music_url') || 'https://youtu.be/1G5BtCQkPHQ?si=7ITQQTrYgJbKOl8');
    if (previewVolume !== undefined) setVolume(previewVolume);
  }, [previewLayout, previewUrl, previewVolume, isPreview]);

  useEffect(() => {
    const handleStorage = () => {
      if (!previewLayout) setLayout(localStorage.getItem('sameweknow_music_layout') || 'STANDARD');
      if (!previewUrl) setMusicUrl(localStorage.getItem('sameweknow_music_url') || 'https://youtu.be/1G5BtCQkPHQ?si=7ITQQTrYgJbKOl8');
      if (previewVolume === undefined) {
        const v = Number(localStorage.getItem('sameweknow_music_volume') || 50);
        setVolume(v);
        sendYouTubeCommand('setVolume', [v]);
        if (audioRef.current) audioRef.current.volume = v / 100;
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('sameweknow_music_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sameweknow_music_updated', handleStorage);
    };
  }, [previewLayout, previewUrl, previewVolume]);

  const ytVideoId = getYouTubeVideoId(musicUrl);
  const coverImg = ytVideoId
    ? `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`
    : 'https://img.youtube.com/vi/1G5BtCQkPHQ/hqdefault.jpg';

  // Fetch YouTube Metadata (Title & Artist)
  useEffect(() => {
    if (!ytVideoId) {
      setTrackTitle('IS THERE SOMEONE ELSE?');
      setTrackArtist('THE WEEKND');
      return;
    }

    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytVideoId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          let title = data.title;
          let artist = data.author_name || 'MANNY';

          if (title.includes(' - ')) {
            const parts = title.split(' - ');
            if (parts.length >= 2) {
              artist = parts[0].trim();
              title = parts.slice(1).join(' - ').trim();
            }
          }

          setTrackTitle(title);
          setTrackArtist(artist);
          localStorage.setItem('sameweknow_music_title', title);
          localStorage.setItem('sameweknow_music_artist', artist);
        }
      })
      .catch(() => {
        setTrackTitle('SAMEWEKNOW AUDIO');
        setTrackArtist('MANNY');
      });
  }, [ytVideoId]);

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
      if (ytVideoId) {
        sendYouTubeCommand('playVideo');
        sendYouTubeCommand('setVolume', [volume]);
        setIsPlaying(true);
      } else if (audioRef.current) {
        audioRef.current.volume = volume / 100;
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
            // Video ended -> restart for loop
            sendYouTubeCommand('seekTo', [0, true]);
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
              sendYouTubeCommand('seekTo', [0, true]);
              sendYouTubeCommand('playVideo');
              sendYouTubeCommand('setVolume', [volume]);
              return 0;
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

