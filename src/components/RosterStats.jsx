import React from 'react';
import { 
  Shield, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Crown, 
  Database 
} from './Icons';

export const RosterStats = ({ stats, activeFilter, onSelectFilter }) => {
  const cards = [
    {
      key: 'all',
      title: 'รายชื่อทั้งหมด',
      count: stats.total,
      sub: 'Total Entries in Database',
      icon: Database,
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.2)',
      border: 'rgba(0, 240, 255, 0.3)'
    },
    {
      key: 'whitelist',
      title: 'Whitelist (อนุญาต)',
      count: stats.whitelist,
      sub: 'Active Authorized Users',
      icon: UserCheck,
      color: '#34d399',
      glow: 'rgba(16, 185, 129, 0.2)',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    {
      key: 'blacklist',
      title: 'Blacklist (ติดดำ/ระงับ)',
      count: stats.blacklist,
      sub: 'Banned / Scammers',
      icon: UserX,
      color: '#fb7185',
      glow: 'rgba(244, 63, 94, 0.2)',
      border: 'rgba(244, 63, 94, 0.3)'
    },
    {
      key: 'reseller',
      title: 'Reseller (ตัวแทน)',
      count: stats.reseller,
      sub: 'Authorized Distributors',
      icon: Shield,
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.2)',
      border: 'rgba(56, 189, 248, 0.3)'
    },
    {
      key: 'vip',
      title: 'VIP / Special',
      count: stats.vip,
      sub: 'Special Access Tier',
      icon: Crown,
      color: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.2)',
      border: 'rgba(251, 191, 36, 0.3)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      margin: '0 auto 24px auto',
      width: 'calc(100% - 32px)',
      maxWidth: '1280px'
    }}>
      {cards.map((c) => {
        const IconComponent = c.icon;
        const isActive = activeFilter === c.key;

        return (
          <div
            key={c.key}
            onClick={() => onSelectFilter(c.key)}
            className="glass-panel"
            style={{
              padding: '20px',
              cursor: 'pointer',
              borderColor: isActive ? c.color : 'rgba(255, 255, 255, 0.08)',
              boxShadow: isActive ? `0 0 24px ${c.glow}` : 'none',
              transform: isActive ? 'translateY(-2px)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                {c.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: c.glow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: c.color
              }}>
                <IconComponent size={20} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: c.color }}>
                {c.count}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                รายการ
              </span>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              {c.sub}
            </p>

            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: c.color,
                boxShadow: `0 0 10px ${c.color}`
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};
