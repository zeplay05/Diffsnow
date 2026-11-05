import React from 'react';
import { 
  Shield, 
  Database, 
  Code, 
  Lock, 
  Search, 
  Sparkles, 
  Settings, 
  RefreshCw 
} from './Icons';

export const Navbar = ({ 
  stats, 
  isFirebaseActive, 
  onOpenQuickVerify, 
  onOpenRobloxTutorial, 
  onOpenAdmin, 
  onOpenFirebaseConfig,
  onRefresh
}) => {
  return (
    <header className="glass-panel" style={{ margin: '16px auto', width: 'calc(100% - 32px)', maxWidth: '1280px', padding: '16px 24px', position: 'sticky', top: '16px', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ff2a5f 0%, #00f0ff 100%)',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 42, 95, 0.4)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: '#07090e',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff2a5f'
            }}>
              <Shield size={24} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #ff2a5f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                TRIPLESPF <span style={{ color: '#00f0ff', WebkitTextFillColor: '#00f0ff' }}>ROSTER</span>
              </h1>
              <span className="badge badge-whitelist" style={{ fontSize: '0.65rem' }}>
                <Sparkles size={12} /> v2.0 Live
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ระบบจัดการรายชื่อ & Whitelist / Blacklist (Firebase Sync)
            </p>
          </div>
        </div>

        {/* Database Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={onOpenFirebaseConfig}
            title="ตั้งค่าเชื่อมต่อ Firebase Realtime Database"
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px' }}
          >
            <Database size={14} className={isFirebaseActive ? 'glow-cyan' : ''} />
            <span>DB Status:</span>
            <span style={{ 
              display: 'inline-block', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: isFirebaseActive ? '#10b981' : '#f59e0b',
              boxShadow: isFirebaseActive ? '0 0 10px #10b981' : '0 0 10px #f59e0b'
            }}></span>
            <span style={{ fontWeight: '600', color: isFirebaseActive ? '#34d399' : '#fbbf24' }}>
              {isFirebaseActive ? 'Firebase Sync' : 'Local Mode'}
            </span>
            <Settings size={12} style={{ marginLeft: '4px', opacity: 0.7 }} />
          </button>

          <button 
            onClick={onRefresh}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '10px' }}
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={onOpenQuickVerify}
            className="btn-secondary"
            style={{ borderColor: 'rgba(0, 240, 255, 0.3)', color: '#38bdf8' }}
          >
            <Search size={16} />
            <span>เช็คสิทธิ์ด่วน</span>
          </button>

          <button 
            onClick={onOpenRobloxTutorial}
            className="btn-cyan"
          >
            <Code size={16} />
            <span>ต่อกับ Roblox (TikTok)</span>
          </button>

          <button 
            onClick={onOpenAdmin}
            className="btn-primary"
          >
            <Lock size={16} />
            <span>ระบบแอดมิน</span>
          </button>
        </div>

      </div>
    </header>
  );
};
