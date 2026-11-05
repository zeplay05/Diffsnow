import React, { useState } from 'react';
import logoImg from '../assets/LOGO DIFFSNOW.png';
import { SocialAvatar } from '../components/SocialAvatar';
import { KickIcon } from '../components/KickIcon';
import { MemberProfileModal } from '../components/MemberProfileModal';

// Rank helper functions
export const getMemberRankNumber = (m) => {
  if (m.rankOrder !== undefined && m.rankOrder !== '' && !isNaN(Number(m.rankOrder))) {
    const n = Number(m.rankOrder);
    if (n >= 4) return 4;
    return n;
  }
  const r = (m.role || m.status || m.rank || '').toLowerCase();
  if (r.includes('founder') || r.includes('boss') || r.includes('head') || r === '1') return 1;
  if (r.includes('leader') || r === '2') return 2;
  if (r.includes('supporter') || r.includes('support') || r.includes('respect') || r === '3') return 3;
  return 4; // MEMBER
};

export const getMemberRoleName = (m) => {
  if (m.role && m.role.trim()) {
    const r = m.role.trim().toUpperCase();
    if (r === 'FOUNDER') return 'HEAD';
    if (r === 'SUPPORT' || r === 'RESPECT') return 'SUPPORTER';
    if (r === 'LASTNAME') return 'MEMBER';
    return r;
  }
  const num = getMemberRankNumber(m);
  const names = { 1: 'HEAD', 2: 'LEADER', 3: 'SUPPORTER', 4: 'MEMBER' };
  return names[num] || 'MEMBER';
};

// Rank section config with ice-blue and neon cyan styling
const RANK_CONFIG = {
  1: { label: 'HEAD',      border: 'rgba(56,189,248,0.85)', glow: 'rgba(56,189,248,0.25)', color: '#38bdf8' },
  2: { label: 'LEADER',    border: 'rgba(14,165,233,0.8)',  glow: 'rgba(14,165,233,0.2)',  color: '#0ea5e9' },
  3: { label: 'SUPPORTER', border: 'rgba(125,211,252,0.7)', glow: 'rgba(125,211,252,0.15)', color: '#7dd3fc' },
  4: { label: 'MEMBER',    border: 'rgba(255,255,255,0.45)', glow: 'rgba(255,255,255,0.08)', color: '#ffffff' },
};

function groupByRank(entries) {
  const groups = { 1: [], 2: [], 3: [], 4: [] };
  (entries || []).forEach(m => {
    let num = getMemberRankNumber(m);
    if (!groups[num]) num = 4;
    groups[num].push(m);
  });
  return groups;
}

export const TriplesMembersPage = ({ entries, onBack, onSaveProfile, centerLogoUrl }) => {
  const logoSrc = centerLogoUrl || logoImg;
  const [search, setSearch] = useState('');
  const [profileMember, setProfileMember] = useState(null);

  const grouped = groupByRank(entries);
  const rankOrder = [1, 2, 3, 4];
  const totalCount = (entries || []).length;

  const matchSearch = (m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (m.username || m.name || '').toLowerCase().includes(q) ||
           (m.robloxId || '').toLowerCase().includes(q) ||
           (m.discordId || '').toLowerCase().includes(q) ||
           (m.role || '').toLowerCase().includes(q);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'transparent',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
    }}>

      {/* Back Button (top-right) */}
      <div style={{ position: 'absolute', top: 'clamp(14px, 3vh, 32px)', right: 'clamp(14px, 3vw, 32px)', zIndex: 100 }}>
        <button
          onClick={onBack}
          style={{
            padding: 'clamp(7px, 1.2vh, 9px) clamp(14px, 2vw, 22px)',
            borderRadius: '12px',
            background: 'rgba(8,22,42,0.82)',
            border: '1px solid rgba(56,189,248,0.3)',
            color: 'rgba(186,230,253,0.85)',
            fontSize: 'clamp(10px, 1.1vw, 11px)',
            fontWeight: '800',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.25s',
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(56,189,248,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'; e.currentTarget.style.color = 'rgba(186,230,253,0.85)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          HOME
        </button>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(1.5rem,8vw,4rem) clamp(1rem,5vw,2.5rem)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {/* Invisible sizing placeholder */}
              <h1 style={{
                visibility: 'hidden',
                fontFamily: "'Chakra Petch', sans-serif",
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                color: '#ffffff',
                lineHeight: 1,
                fontSize: 'clamp(1.8rem, 5vw, 4.5rem)',
                whiteSpace: 'nowrap',
                padding: '0 4px',
                margin: 0,
              }}>
                DIFFSNOW
              </h1>
              {/* Typewriter animated title */}
              <h1
                className="typewriter"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  fontFamily: "'Chakra Petch', sans-serif",
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.25em',
                  color: '#ffffff',
                  lineHeight: 1,
                  fontSize: 'clamp(1.8rem, 5vw, 4.5rem)',
                  whiteSpace: 'nowrap',
                  padding: '0 4px',
                  margin: 0,
                  filter: 'drop-shadow(0 0 30px rgba(56, 189, 248, 0.6))',
                }}
              >
                DIFFSNOW
              </h1>
            </div>
          </div>
          <p style={{
            color: '#38bdf8',
            fontFamily: "'Chakra Petch', sans-serif",
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.35em',
            fontSize: 'clamp(10px, 1.5vw, 14px)',
            marginTop: '10px',
            filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.5))',
          }}>
            ICE & SNOW DOMINION
          </p>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: 'clamp(14px, 3vh, 24px) 0' }}>
          <img
            src={logoSrc}
            alt="DIFFSNOW Logo"
            style={{
              width: 'clamp(160px, 36vw, 240px)',
              height: 'clamp(160px, 36vw, 240px)',
              maxWidth: 'min(240px, 75vw)',
              maxHeight: 'clamp(160px, 28vh, 240px)',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 25px rgba(56,189,248,0.4))',
              transition: 'transform 0.4s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: '480px', margin: '0 auto clamp(2rem,5vw,4rem)' }}>
          <input
            type="text"
            placeholder="SEARCH MEMBERS..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '13px 24px',
              borderRadius: '9999px',
              background: 'rgba(8,22,42,0.75)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(56,189,248,0.3)',
              color: '#ffffff',
              fontFamily: "'Chakra Petch', sans-serif",
              fontSize: 'clamp(11px, 1.2vw, 13px)',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textAlign: 'center',
              textTransform: 'uppercase',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease'
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#38bdf8';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(56,189,248,0.45)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Empty State when no members exist */}
        {totalCount === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '50px 24px',
            background: 'rgba(8, 22, 42, 0.65)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            maxWidth: '560px',
            margin: '30px auto',
            boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              [ NO MEMBERS ]
            </div>
            <h3 style={{
              fontSize: 'clamp(17px, 2vw, 20px)',
              color: '#ffffff',
              margin: '0 0 8px 0',
              fontWeight: 700
            }}>
              ยังไม่มีรายชื่อสมาชิกในระบบ
            </h3>
            <p style={{
              color: 'rgba(186, 230, 253, 0.65)',
              fontSize: '12px',
              letterSpacing: '0.12em',
              lineHeight: 1.6,
              margin: 0
            }}>
              สามารถกดปุ่ม "REQUEST" ที่มุมขวาบนของหน้าหลักเพื่อส่งคำขอเข้าร่วม หรือเข้าสู่ระบบแอดมินเพื่อเพิ่มรายชื่อสมาชิก
            </p>
          </div>
        ) : (
          /* Rank Sections */
          rankOrder.map(rank => {
            const mems = (grouped[rank] || []).filter(matchSearch);
            const cfg = RANK_CONFIG[rank];
            if (!mems.length) return null;
            return (
              <div key={rank} style={{ marginBottom: 'clamp(3rem,8vw,6rem)' }}>
                {/* Section Title (Centered) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'clamp(10px, 2vw, 16px)',
                  marginBottom: '28px',
                  width: '100%',
                }}>
                  <div style={{
                    flex: 1,
                    maxWidth: '180px',
                    height: '1px',
                    background: 'linear-gradient(to left, rgba(56,189,248,0.35), transparent)'
                  }} />
                  <h2 style={{
                    fontSize: 'clamp(12px,2.5vw,16px)',
                    fontWeight: '700',
                    letterSpacing: '0.3em',
                    color: cfg.color,
                    textTransform: 'uppercase',
                    margin: 0,
                    filter: `drop-shadow(0 0 8px ${cfg.color})`,
                    textAlign: 'center',
                  }}>
                    {cfg.label}
                  </h2>
                  <span style={{
                    fontSize: 'clamp(9px,1.5vw,11px)',
                    background: 'rgba(56,189,248,0.1)',
                    border: '1px solid rgba(56,189,248,0.25)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: '#7dd3fc',
                    fontWeight: 700
                  }}>
                    [ {mems.length} ]
                  </span>
                  <div style={{
                    flex: 1,
                    maxWidth: '180px',
                    height: '1px',
                    background: 'linear-gradient(to right, rgba(56,189,248,0.35), transparent)'
                  }} />
                </div>

                {/* Member Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                  gap: 'clamp(12px, 2vw, 16px)',
                }}>
                  {mems.map(m => (
                    <MemberCard key={m.id || m.robloxId || m.username} m={m} rank={rank} cfg={cfg} onManageProfile={setProfileMember} />
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* Footer */}
        <footer style={{ width: '100%', padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginTop: '48px' }}>
          <p style={{ fontSize: 'clamp(8px,1.8vw,11px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            System Design by <span style={{ color: '#38bdf8', fontWeight: '700' }}>Mewie Conquers</span>
          </p>
        </footer>

      </div>
      {profileMember && <MemberProfileModal member={profileMember} onClose={() => setProfileMember(null)} onSave={onSaveProfile} />}
    </div>
  );
};

// Individual member card component
function MemberCard({ m, onManageProfile }) {
  const name = m.name || m.username || 'Unknown';
  const role = getMemberRoleName(m);
  const fb = m.facebook || (m.socialLink && m.socialLink.includes('facebook') ? m.socialLink : (m.social && !m.social.includes('instagram') && !m.social.includes('tiktok') ? m.social : ''));
  const ig = m.instagram || (m.socialLink && m.socialLink.includes('instagram') ? m.socialLink : '');
  const tt = m.tiktok || (m.socialLink && m.socialLink.includes('tiktok') ? m.socialLink : '');
  const kick = m.kick || (m.socialLink && m.socialLink.includes('kick.com') ? m.socialLink : '');
  const youtube = m.youtube || (m.socialLink && m.socialLink.includes('youtube') ? m.socialLink : '');

  const formatUrl = (url, prefix = 'https://') => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${prefix}${url}`;
  };

  return (
    <div
      style={{
        background: 'rgba(8, 22, 42, 0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.65), 0 0 15px rgba(56,189,248,0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(125,211,252,0.7)';
        e.currentTarget.style.boxShadow = '0 0 30px rgba(56,189,248,0.4)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.65), 0 0 15px rgba(56,189,248,0.08)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Dynamic Cycling Social Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <SocialAvatar
          member={m}
          size={48}
          borderRadius="50%"
          style={{ border: '1.5px solid rgba(56,189,248,0.4)' }}
        />
        <div style={{ position: 'absolute', bottom: '0px', right: '0px', width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid #030712' }} />
      </div>

      {/* Name + Role + Social Profile Buttons */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: '0 0 3px', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </h4>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
          {role}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {fb && (
            <a
              href={formatUrl(fb)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38bdf8',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.22)';
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(56, 189, 248, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.52-.14-2.71-.14-2.72 0-4.79 1.66-4.79 4.9v2.6H7v4h3V22h4v-8.5z"/>
              </svg>
            </a>
          )}
          {ig && (
            <a
              href={formatUrl(ig)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'rgba(232, 121, 249, 0.12)',
                border: '1px solid rgba(232, 121, 249, 0.35)',
                color: '#e879f9',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(232, 121, 249, 0.22)';
                e.currentTarget.style.borderColor = '#e879f9';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(232, 121, 249, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(232, 121, 249, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(232, 121, 249, 0.35)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          )}
          {tt && (
            <a
              href={formatUrl(tt)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok Profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'rgba(45, 212, 191, 0.12)',
                border: '1px solid rgba(45, 212, 191, 0.35)',
                color: '#2dd4bf',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(45, 212, 191, 0.22)';
                e.currentTarget.style.borderColor = '#2dd4bf';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(45, 212, 191, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(45, 212, 191, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.35)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.32 0 .62.06.9.15V9.41a6.3 6.3 0 0 0-.9-.07A6.33 6.33 0 0 0 3 15.67 6.33 6.33 0 0 0 9.33 22a6.33 6.33 0 0 0 6.34-6.33V8.84a8.18 8.18 0 0 0 4.79 1.52V6.9a4.85 4.85 0 0 1-.87-.21z"/>
              </svg>
            </a>
          )}
          {kick && (
            <a
              href={formatUrl(kick)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kick Profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'rgba(83, 252, 24, 0.12)',
                border: '1px solid rgba(83, 252, 24, 0.35)',
                color: '#53fc18',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(83, 252, 24, 0.22)';
                e.currentTarget.style.borderColor = '#53fc18';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(83, 252, 24, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(83, 252, 24, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(83, 252, 24, 0.35)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)';
              }}
            >
              <KickIcon size={16} color="#53fc18" />
            </a>
          )}
          {youtube && (
            <a
              href={formatUrl(youtube)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube Channel"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'rgba(248, 113, 113, 0.12)',
                border: '1px solid rgba(248, 113, 113, 0.35)',
                color: '#f87171',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(248, 113, 113, 0.22)';
                e.currentTarget.style.borderColor = '#f87171';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(248, 113, 113, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(248, 113, 113, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.35)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
