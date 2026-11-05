import React, { useState } from 'react';
import { 
  getRobloxAvatarUrl 
} from '../services/firebaseService';
import { 
  Search, 
  X, 
  CheckCircle, 
  UserX, 
  ShieldAlert, 
  Sparkles, 
  Shield 
} from './Icons';

export const QuickVerifyModal = ({ isOpen, onClose, entries }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.trim().toLowerCase();
    const found = entries.find(item => 
      item.robloxId.toLowerCase() === q || 
      item.username.toLowerCase() === q ||
      (item.discordId && item.discordId.toLowerCase() === q)
    );

    setResult(found || null);
    setSearched(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '28px', borderRadius: '20px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0,240,255,0.15)', color: '#00f0ff' }}>
              <Shield size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
                ตรวจสอบสิทธิ์รายชื่อด่วน (Quick Verify)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                เช็คสถานะ Whitelist / Blacklist ในฐานข้อมูลทันที
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input
            type="text"
            className="input-cyber"
            placeholder="กรอก Roblox User ID (เช่น 156489201) หรือ Username"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearched(false);
            }}
            autoFocus
          />
          <button type="submit" className="btn-cyan" style={{ whiteSpace: 'nowrap' }}>
            <Search size={16} /> ตรวจสอบ
          </button>
        </form>

        {/* Verification Result Card */}
        {searched && (
          <div>
            {result ? (
              <div style={{
                background: result.status === 'blacklist' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${result.status === 'blacklist' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: result.status === 'blacklist' ? '0 0 30px rgba(244, 63, 94, 0.2)' : '0 0 30px rgba(16, 185, 129, 0.2)'
              }}>
                <img
                  src={getRobloxAvatarUrl(result.robloxId)}
                  alt={result.username}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    border: '3px solid rgba(255,255,255,0.2)',
                    margin: '0 auto 12px auto'
                  }}
                />

                <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
                  {result.username}
                </h4>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
                  Roblox ID: <span style={{ color: '#00f0ff' }}>{result.robloxId}</span>
                </p>

                <div style={{ marginBottom: '16px' }}>
                  {result.status === 'whitelist' && (
                    <span className="badge badge-whitelist" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                      <CheckCircle size={16} /> พบบัญชีใน Whitelist (ผ่านการรับรอง)
                    </span>
                  )}
                  {result.status === 'blacklist' && (
                    <span className="badge badge-blacklist" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                      <UserX size={16} /> บัญชีนี้ถูกติด Blacklist (ระงับสิทธิ์)
                    </span>
                  )}
                  {result.status === 'reseller' && (
                    <span className="badge badge-reseller" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                      <Shield size={16} /> ตัวแทนจำหน่ายอย่างเป็นทางการ (Reseller)
                    </span>
                  )}
                  {result.status === 'vip' && (
                    <span className="badge badge-vip" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                      <Sparkles size={16} /> สมาชิก VIP ระดับพิเศษ
                    </span>
                  )}
                </div>

                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', color: '#e2e8f0', textAlign: 'left' }}>
                  <div><strong>วันหมดอายุ:</strong> {result.expiryDate || 'ถาวร'}</div>
                  {result.note && <div style={{ marginTop: '4px' }}><strong>หมายเหตุ:</strong> {result.note}</div>}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 183, 3, 0.08)',
                border: '1px solid rgba(255, 183, 3, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <ShieldAlert size={40} style={{ color: '#fbbf24', marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '6px' }}>ไม่พบข้อมูลในระบบ</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  บัญชี "{query}" ไม่ได้ถูกลงทะเบียนในฐานข้อมูล (ไม่มีสิทธิ์ใช้งานสคริปต์หรือยังไม่ได้ซื้อรายการ)
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
