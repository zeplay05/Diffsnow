import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import logoImg from '../assets/LOGO_NO.BK_Sameweknow.png';
import { KickIcon } from './KickIcon';

// Helper to extract social avatars and username
export function getSocialAvatarList(member) {
  if (!member) return [];
  const list = [];

  // 1. Direct Image URL
  if (member.imageUrl && member.imageUrl.trim().startsWith('http')) {
    list.push(member.imageUrl.trim());
  } else if (member.avatar && member.avatar.trim().startsWith('http')) {
    list.push(member.avatar.trim());
  }

  // 2. Facebook Avatar / URL
  const fbUrl = member.facebook || member.avatarFb || (member.socialLink && member.socialLink.includes('facebook') ? member.socialLink : '');
  if (fbUrl) {
    if (fbUrl.startsWith('http') && (fbUrl.includes('fbcdn.net') || fbUrl.includes('fbsbx.com') || fbUrl.endsWith('.jpg') || fbUrl.endsWith('.png') || fbUrl.endsWith('.webp'))) {
      list.push(fbUrl);
    } else {
      const fbUser = fbUrl.replace(/https?:\/\/(www\.)?facebook\.com\//i, '').replace(/\/.*$/, '').trim();
      if (fbUser && !fbUser.includes('?') && fbUser.length > 0) {
        list.push(`https://unavatar.io/facebook/${fbUser}`);
      }
    }
  }

  // 3. Instagram Avatar / URL
  const igUrl = member.instagram || member.avatarIg || (member.socialLink && member.socialLink.includes('instagram') ? member.socialLink : '');
  if (igUrl) {
    if (igUrl.startsWith('http') && (igUrl.includes('cdninstagram.com') || igUrl.endsWith('.jpg') || igUrl.endsWith('.png') || igUrl.endsWith('.webp'))) {
      list.push(igUrl);
    } else {
      const igUser = igUrl.replace(/https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[@/]/g, '').trim();
      if (igUser) {
        list.push(`https://unavatar.io/instagram/${igUser}`);
      }
    }
  }

  // 4. TikTok Avatar / URL
  const ttUrl = member.tiktok || member.avatarTt || (member.socialLink && member.socialLink.includes('tiktok') ? member.socialLink : '');
  if (ttUrl) {
    if (ttUrl.startsWith('http') && (ttUrl.includes('tiktokcdn') || ttUrl.endsWith('.jpg') || ttUrl.endsWith('.png') || ttUrl.endsWith('.webp'))) {
      list.push(ttUrl);
    } else {
      const ttUser = ttUrl.replace(/https?:\/\/(www\.)?tiktok\.com\/@?/i, '').replace(/[@/]/g, '').trim();
      if (ttUser) {
        list.push(`https://unavatar.io/tiktok/${ttUser}`);
      }
    }
  }
  return Array.from(new Set(list.filter(Boolean)));
}

// Kick exposes a public channel endpoint with the current profile image.
// The request is made in the browser only after the member has supplied a Kick URL.
export async function getKickAvatarUrl(kickUrl) {
  if (!kickUrl || typeof kickUrl !== 'string') return '';
  const channel = kickUrl
    .trim()
    .replace(/^https?:\/\/(www\.)?kick\.com\//i, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '');

  if (!channel) return '';

  try {
    const response = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(channel)}`, {
      credentials: 'omit'
    });
    if (!response.ok) return '';
    const payload = await response.json();
    const image = payload?.user?.profile_pic;
    return typeof image === 'string' && image.startsWith('http') ? image : '';
  } catch {
    return '';
  }
}

/**
 * SocialAvatar Component
 * Features:
 * - Collects working avatars from Facebook, Instagram, TikTok & Image URL
 * - Self-healing error handler: Automatically switches on 404 / expired CDN
 * - Dynamic cycling with smooth fade & scale animation
 * - Clean Fullscreen Circular Profile Viewer via React Portal
 */
export const SocialAvatar = ({
  member,
  size = 48,
  borderRadius = '50%',
  style = {},
  enableCycling = true,
  enablePreview = true,
  fallback = logoImg
}) => {
  const initialList = getSocialAvatarList(member);
  const [workingAvatars, setWorkingAvatars] = useState(initialList);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const list = getSocialAvatarList(member);
    setWorkingAvatars(list);
    setCurrentIndex(0);

    let cancelled = false;
    getKickAvatarUrl(member?.kick).then((kickAvatar) => {
      if (cancelled || !kickAvatar) return;
      setWorkingAvatars((current) => Array.from(new Set([...current, kickAvatar])));
    });

    return () => {
      cancelled = true;
      isMounted.current = false;
    };
  }, [member?.imageUrl, member?.avatar, member?.facebook, member?.instagram, member?.tiktok, member?.kick, member?.socialLink]);

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  // Cycle through available avatars
  useEffect(() => {
    if (!enableCycling || workingAvatars.length <= 1 || isModalOpen) return;

    const intervalTime = 3500 + Math.random() * 1500;
    const timer = setInterval(() => {
      if (!isMounted.current || workingAvatars.length <= 1 || isModalOpen) return;

      setIsTransitioning(true);
      setTimeout(() => {
        if (!isMounted.current) return;
        setCurrentIndex(prev => (prev + 1) % workingAvatars.length);
        setIsTransitioning(false);
      }, 300);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [workingAvatars, enableCycling, isModalOpen]);

  // Error handler: remove broken URL from pool and try next
  const handleImgError = (failedSrc) => {
    setWorkingAvatars(prev => prev.filter(url => url !== failedSrc));
  };

  const currentSrc = workingAvatars.length > 0 ? workingAvatars[currentIndex % workingAvatars.length] : fallback;
  const isUsingFallback = workingAvatars.length === 0;

  const [modalIndex, setModalIndex] = useState(0);

  const handleAvatarClick = (e) => {
    if (!enablePreview) return;
    e.stopPropagation();
    setModalIndex(currentIndex % (workingAvatars.length || 1));
    setIsModalOpen(true);
  };

  const modalImgSrc = workingAvatars.length > 0 ? workingAvatars[modalIndex % workingAvatars.length] : currentSrc;
  const memberName = member?.name || member?.username || 'Member Avatar';
  const memberRole = member?.role || member?.status || 'Member';

  // Clean Circular Avatar Modal rendered via React Portal
  const modalContent = isModalOpen && typeof document !== 'undefined' ? createPortal(
    <div
      onClick={() => setIsModalOpen(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 16px',
        boxSizing: 'border-box',
        userSelect: 'none',
        animation: 'fadeIn 0.2s ease',
        cursor: 'pointer'
      }}
    >
      {/* Top Bar: Member Name + Close Button */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '650px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          cursor: 'default'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {memberName}
          </h2>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '2px' }}>
            {memberRole}
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(false)}
          title="ปิด (Esc)"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ef4444';
            e.currentTarget.style.borderColor = '#ef4444';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Central Circular Avatar Stage with Floating Secondary Bubbles */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(360px, 85vw)',
          height: 'min(360px, 85vw)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto 0',
          cursor: 'default'
        }}
      >
        {/* Floating Secondary Bubbles (IG Image 3 style) */}
        {workingAvatars.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: '0px',
              left: '10px',
              display: 'flex',
              gap: '12px',
              zIndex: 30
            }}
          >
            {workingAvatars.map((url, i) => {
              if (i === modalIndex % workingAvatars.length) return null;
              return (
                <div
                  key={i}
                  onClick={() => setModalIndex(i)}
                  title="กดเพื่อสลับดูรูปนี้"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#000',
                    border: '2.5px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.8), 0 0 15px rgba(255,215,0,0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)';
                    e.currentTarget.style.borderColor = '#ffd700';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
                  }}
                >
                  <img
                    src={url}
                    alt=""
                    onError={() => handleImgError(url)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Main Big Circular Avatar */}
        <div
          style={{
            width: 'min(270px, 68vw)',
            height: 'min(270px, 68vw)',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#050505',
            border: '4px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 50px rgba(255, 215, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.3s ease',
            animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <img
            src={modalImgSrc}
            alt={memberName}
            onError={() => handleImgError(modalImgSrc)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: workingAvatars.length > 0 ? 'cover' : 'contain',
              padding: workingAvatars.length > 0 ? '0' : '20px',
            }}
          />
        </div>
      </div>

      {/* Bottom Actions Bar (Instagram Style) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(14px, 4vw, 28px)',
          padding: '14px 24px',
          backgroundColor: 'rgba(15, 15, 20, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '26px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
          zIndex: 10,
          cursor: 'default'
        }}
      >
        {/* Button 1: Facebook Profile */}
        {(member?.facebook || member?.socialLink) && (
          <a
            href={member.facebook ? (member.facebook.startsWith('http') ? member.facebook : `https://${member.facebook}`) : (member.socialLink.startsWith('http') ? member.socialLink : `https://${member.socialLink}`)}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#111115',
                border: '1.5px solid rgba(24, 119, 242, 0.4)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1877f2';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#111115';
                e.currentTarget.style.color = '#38bdf8';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span>เฟสบุ๊ค</span>
          </a>
        )}

        {/* Button 2: Instagram */}
        {member?.instagram && (
          <a
            href={member.instagram.startsWith('http') ? member.instagram : `https://instagram.com/${member.instagram.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#111115',
                border: '1.5px solid rgba(236, 72, 153, 0.4)',
                color: '#f472b6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ec4899';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#111115';
                e.currentTarget.style.color = '#f472b6';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span>ไอจี</span>
          </a>
        )}

        {/* Button 3: Kick */}
        {member?.kick && (
          <a
            href={member.kick.startsWith('http') ? member.kick : `https://kick.com/${member.kick.replace(/^@/, '')}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              color: '#ffffff', textDecoration: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#111115',
                border: '1.5px solid rgba(83,252,24,0.45)', color: '#8cff61', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#53fc18'; e.currentTarget.style.color = '#071000'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#111115'; e.currentTarget.style.color = '#8cff61'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <span style={{ width: '21px', height: '21px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KickIcon size={21} color="#8cff61" /></span>
            </div>
            <span>Kick</span>
          </a>
        )}

        {/* Button 4: Copy Profile Link */}
        <div
          onClick={() => {
            const link = member?.facebook || member?.socialLink || currentSrc || window.location.href;
            navigator.clipboard?.writeText(link);
            alert('คัดลอกลิงก์เรียบร้อยแล้ว!');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#111115',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffd700';
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#111115';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <span>คัดลอกลิงก์</span>
        </div>

        {/* Button 4: Full-size Source Image */}
        {currentSrc && currentSrc !== fallback && (
          <a
            href={currentSrc}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#111115',
                border: '1.5px solid rgba(255, 215, 0, 0.35)',
                color: '#ffd700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffd700';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#111115';
                e.currentTarget.style.color = '#ffd700';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <span>ภาพต้นฉบับ</span>
          </a>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div
        onClick={handleAvatarClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={enablePreview ? "คลิกเพื่อดูรูปโปรไฟล์ขนาดเต็ม" : undefined}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius,
          backgroundColor: '#000000',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
          cursor: enablePreview ? 'pointer' : 'default',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          transform: isHovered && enablePreview ? 'scale(1.08)' : 'scale(1)',
          boxShadow: isHovered && enablePreview ? '0 0 15px rgba(255, 215, 0, 0.45)' : 'none',
          ...style
        }}
      >
        <img
          src={currentSrc}
          alt={memberName}
          onError={() => handleImgError(currentSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: isUsingFallback ? 'contain' : 'cover',
            padding: isUsingFallback ? '6px' : '0px',
            opacity: isTransitioning ? 0 : (isUsingFallback ? 0.8 : 1),
            transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        />

        {/* Hover Zoom Hint Icon */}
        {isHovered && enablePreview && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffd700',
              pointerEvents: 'none',
              animation: 'fadeIn 0.15s ease'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
        )}
      </div>

      {modalContent}
    </>
  );
};
