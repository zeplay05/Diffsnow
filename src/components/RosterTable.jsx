import React, { useState } from 'react';
import { 
  getRobloxAvatarUrl, 
  getFirebaseConfig 
} from '../services/firebaseService';
import { 
  UserCheck, 
  UserX, 
  Shield, 
  Crown, 
  Copy, 
  CheckCircle, 
  Edit, 
  Trash2, 
  ExternalLink,
  Code
} from './Icons';

export const RosterTable = ({ 
  entries, 
  viewMode, 
  isAdmin, 
  onEditEntry, 
  onDeleteEntry,
  onCopyText 
}) => {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLuaUrl = (item) => {
    const config = getFirebaseConfig();
    let url = '';
    if (config.dbUrl) {
      url = `${config.dbUrl.replace(/\/$/, '')}/whitelist/${item.robloxId}.json`;
    } else {
      url = `https://your-firebase-db.firebaseio.com/whitelist/${item.robloxId}.json`;
    }
    
    onCopyText(url, `คัดลอก Firebase URL สำหรับ Roblox Lua สั่งเกต: ${item.username}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderBadge = (status) => {
    switch (status) {
      case 'whitelist':
        return (
          <span className="badge badge-whitelist">
            <UserCheck size={14} /> Whitelist
          </span>
        );
      case 'blacklist':
        return (
          <span className="badge badge-blacklist">
            <UserX size={14} /> Blacklist
          </span>
        );
      case 'reseller':
        return (
          <span className="badge badge-reseller">
            <Shield size={14} /> Reseller
          </span>
        );
      case 'vip':
        return (
          <span className="badge badge-vip">
            <Crown size={14} /> VIP
          </span>
        );
      default:
        return <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{status}</span>;
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="glass-panel" style={{ margin: '0 auto 40px auto', width: 'calc(100% - 32px)', maxWidth: '1280px', padding: '60px 20px', textAlign: 'center' }}>
        <UserX size={48} style={{ color: 'var(--text-dim)', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>ไม่พบข้อมูลรายชื่อที่ค้นหา</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '6px' }}>ลองเปลี่ยนคำค้นหา หรือ เลือกหมวดหมู่อื่นในแถบด้านบน</p>
      </div>
    );
  }

  return (
    <div style={{ margin: '0 auto 40px auto', width: 'calc(100% - 32px)', maxWidth: '1280px' }}>
      
      {viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {entries.map((item) => (
            <div 
              key={item.id} 
              className="glass-panel" 
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                {/* Header Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={getRobloxAvatarUrl(item.robloxId)}
                      alt={item.username}
                      onError={(e) => {
                        e.target.src = 'https://tr.rbxcdn.com/30day-avatar-headshot-default';
                      }}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        objectFit: 'cover',
                        border: '2px solid rgba(255, 42, 95, 0.4)',
                        backgroundColor: '#0a0e17'
                      }}
                    />
                    <a
                      href={`https://www.roblox.com/users/${item.robloxId}/profile`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="ดูโปรไฟล์ Roblox"
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        background: '#07090e',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#ffffff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.username}
                      </h4>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Roblox ID: <span style={{ color: '#00f0ff' }}>{item.robloxId}</span>
                    </div>

                    <div style={{ marginTop: '6px' }}>
                      {renderBadge(item.status)}
                    </div>
                  </div>
                </div>

                {/* Details list */}
                <div style={{
                  background: 'rgba(7, 9, 14, 0.6)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.82rem',
                  marginBottom: '16px'
                }}>
                  {item.discordId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Discord:</span>
                      <span style={{ color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>{item.discordId}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>วันเพิ่มรายชื่อ:</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.addedDate || 'ไม่ระบุ'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>วันหมดอายุ:</span>
                    <span style={{ color: item.expiryDate === 'PERMANENT' ? '#34d399' : '#fbbf24', fontWeight: '600' }}>
                      {item.expiryDate || 'ถาวร'}
                    </span>
                  </div>
                  {item.note && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', marginTop: '2px' }}>
                      <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>หมายเหตุ / เหตุผล:</span>
                      <span style={{ color: '#e2e8f0', fontStyle: 'italic', wordBreak: 'break-word' }}>"{item.note}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => handleCopyLuaUrl(item)}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                  title="ก๊อปปี้ลิงก์ Firebase JSON สำหรับ Roblox Script"
                >
                  {copiedId === item.id ? <CheckCircle size={14} style={{ color: '#34d399' }} /> : <Code size={14} />}
                  <span>{copiedId === item.id ? 'ก๊อปปี้แล้ว!' : 'Copy Firebase URL'}</span>
                </button>

                {isAdmin && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => onEditEntry(item)}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="แก้ไขรายชื่อ"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      onClick={() => onDeleteEntry(item.id)}
                      style={{
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: '#fb7185',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="ลบรายชื่อ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>ผู้ใช้งาน (User)</th>
                <th style={{ padding: '12px 16px' }}>Roblox ID</th>
                <th style={{ padding: '12px 16px' }}>สถานะ (Status)</th>
                <th style={{ padding: '12px 16px' }}>Discord</th>
                <th style={{ padding: '12px 16px' }}>วันหมดอายุ</th>
                <th style={{ padding: '12px 16px' }}>หมายเหตุ</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={getRobloxAvatarUrl(item.robloxId)}
                      alt={item.username}
                      style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#07090e' }}
                    />
                    <span style={{ fontWeight: '600', color: '#ffffff' }}>{item.username}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>
                    {item.robloxId}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {renderBadge(item.status)}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>
                    {item.discordId || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', color: item.expiryDate === 'PERMANENT' ? '#34d399' : '#fbbf24' }}>
                    {item.expiryDate || 'ถาวร'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.note || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleCopyLuaUrl(item)}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title="Copy Firebase JSON URL"
                      >
                        <Code size={14} />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onEditEntry(item)}
                            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '4px' }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteEntry(item.id)}
                            style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
