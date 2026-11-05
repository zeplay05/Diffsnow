import React, { useState } from 'react';
import { getRobloxAvatarUrl } from '../services/firebaseService';
import { Lock, X, Search, UserCheck, UserX, Shield, Crown } from '../components/Icons';
import logoImg from '../assets/LOGO DIFFSNOW.png';
import { SocialAvatar } from '../components/SocialAvatar';

const THEME_PALETTES = {
  'Apex Gold': '#ffd700', 'Apex Crimson': '#ef4444', 'Apex Azure': '#38bdf8',
  'Void Black': '#a855f7', 'Neon Rose': '#ec4899', 'Cyber Teal': '#14b8a6', 'Solar Amber': '#f59e0b'
};

const withAlpha = (hex, alpha) => {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const PublicRosterPage = ({ entries, onNavigateToAdmin, onNavigateToTriples, centerLogoUrl, theme = 'Apex Azure' }) => {
  const logoSrc = centerLogoUrl || logoImg;
  const accent = THEME_PALETTES[theme] || THEME_PALETTES['Apex Azure'];
  const accent25 = withAlpha(accent, 0.25);
  const accent15 = withAlpha(accent, 0.15);
  const accent45 = withAlpha(accent, 0.45);

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      zIndex: 10,
      padding: 'clamp(20px, 3vh, 32px) 16px 12px 16px',
      backgroundColor: 'transparent',
      '--theme-accent': accent,
      color: '#ffffff',
      fontFamily: 'var(--font-chakra-petch)',
      boxSizing: 'border-box'
    }}>
      <div style={{
        flex: 1,
        width: '100%',
        maxWidth: '1400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '0 auto'
      }}>

        {/* Header Section: Typewriter Title */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '10px',
          width: '100%',
          overflow: 'hidden',
          userSelect: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {/* Invisible sizing placeholder */}
              <h1 style={{
                visibility: 'hidden',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: 'clamp(0.12em, 1.8vw, 0.25em)',
                color: '#ffffff',
                lineHeight: 1.1,
                fontSize: 'clamp(1.75rem, 6.5vw, 4.4rem)',
                whiteSpace: 'nowrap',
                padding: '0 4px',
                margin: 0,
                fontFamily: 'var(--font-chakra-petch)'
              }}>
                DIFFSNOW
              </h1>
              {/* Actual animated title */}
              <h1 
                className="typewriter"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: 'clamp(0.12em, 1.8vw, 0.25em)',
                  color: '#ffffff',
                  lineHeight: 1.1,
                  fontSize: 'clamp(1.75rem, 6.5vw, 4.4rem)',
                  whiteSpace: 'nowrap',
                  padding: '0 4px',
                  margin: 0,
                  fontFamily: 'var(--font-chakra-petch)',
                  filter: `drop-shadow(0 0 30px ${withAlpha(accent, 0.65)})`
                }}
              >
                DIFFSNOW
              </h1>
            </div>
          </div>

          <p style={{
            marginTop: '8px',
            color: accent,
            textTransform: 'uppercase',
            letterSpacing: 'clamp(0.18em, 1.8vw, 0.36em)',
            fontWeight: '700',
            fontSize: 'clamp(9.5px, 1.3vw, 13.5px)',
            filter: `drop-shadow(0 0 16px ${withAlpha(accent, 0.6)})`,
            fontFamily: 'var(--font-chakra-petch)'
          }}>
            ICE & SNOW DOMINION
          </p>
        </div>

        {/* Center Display: Large Prominent LOGO DIFFSNOW */}
        <div 
          className="animate-motion-only"
          style={{
            position: 'relative',
            width: '100%',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'clamp(8px, 1.8vh, 18px) auto',
            userSelect: 'none'
          }}
        >
          <img 
            src={logoSrc} 
            alt="DIFFSNOW LOGO" 
            className="center-hero-logo"
            style={{
              width: 'clamp(170px, 38vw, 240px)',
              height: 'clamp(170px, 38vw, 240px)',
              maxWidth: 'min(240px, 75vw)',
              maxHeight: 'clamp(170px, 28vh, 240px)',
              objectFit: 'contain',
              filter: `drop-shadow(0 0 20px ${withAlpha(accent, 0.65)}) drop-shadow(0 0 45px ${withAlpha(accent, 0.4)}) drop-shadow(0 10px 25px rgba(0, 0, 0, 0.85))`,
              transition: 'transform 0.4s ease, filter 0.4s ease'
            }} 
          />
        </div>

        {/* Bottom Area: Elevated Single Center Button */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          marginTop: 'auto'
        }}>
          {/* DIFFSNOW Single Center Button with elevated positioning */}
          <div 
            onClick={onNavigateToTriples}
            className="center-main-btn"
            style={{
              margin: '0 0 clamp(48px, 8.5vh, 100px) 0',
              cursor: 'pointer'
            }}
          >
            <span>DIFFSNOW</span>
          </div>

          {/* Footer */}
          <footer style={{
            width: '100%',
            padding: '8px 16px 2px 16px',
            textAlign: 'center',
            userSelect: 'none'
          }}>
            <p style={{
              fontSize: 'clamp(9.5px, 1.05vw, 12px)',
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.26em',
              fontFamily: 'var(--font-chakra-petch)',
              margin: 0
            }}>
              System Design by <span style={{ color: accent, fontWeight: '700', textShadow: `0 0 12px ${accent}` }}>Mewie Conquers</span>
            </p>
          </footer>
        </div>

      </div>
    </div>
  );
};
