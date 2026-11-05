import React from 'react';
import { Search, X, Sparkles } from './Icons';

export const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  activeFilter, 
  onFilterChange,
  viewMode,
  onViewModeChange
}) => {
  const tabs = [
    { id: 'all', label: 'ทั้งหมด (All)' },
    { id: 'whitelist', label: 'Whitelist' },
    { id: 'blacklist', label: 'Blacklist' },
    { id: 'reseller', label: 'Reseller' },
    { id: 'vip', label: 'VIP' }
  ];

  return (
    <div className="glass-panel" style={{
      margin: '0 auto 24px auto',
      width: 'calc(100% - 32px)',
      maxWidth: '1280px',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>

        {/* Search Input Box */}
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="input-cyber"
            style={{ paddingLeft: '44px', paddingRight: searchTerm ? '40px' : '16px' }}
            placeholder="ค้นหาชื่อ Roblox Username, User ID, Discord Tag หรือ เหตุผล..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(255,42,95,0.2) 0%, rgba(0,240,255,0.1) 100%)' : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? '1px solid rgba(255, 42, 95, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 16px rgba(255, 42, 95, 0.2)' : 'none'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Layout Toggle (Grid vs Table) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => onViewModeChange('grid')}
            style={{
              background: viewMode === 'grid' ? 'rgba(255,42,95,0.25)' : 'transparent',
              border: 'none',
              color: viewMode === 'grid' ? '#ffffff' : 'var(--text-dim)',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            แบบการ์ด (Grid)
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            style={{
              background: viewMode === 'table' ? 'rgba(255,42,95,0.25)' : 'transparent',
              border: 'none',
              color: viewMode === 'table' ? '#ffffff' : 'var(--text-dim)',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            แบบตาราง (Table)
          </button>
        </div>

      </div>
    </div>
  );
};
