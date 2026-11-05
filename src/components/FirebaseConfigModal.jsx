import React, { useState } from 'react';
import { 
  getFirebaseConfig, 
  saveFirebaseConfig 
} from '../services/firebaseService';
import { 
  Database, 
  X, 
  CheckCircle, 
  Settings, 
  Lock, 
  RefreshCw,
  Sparkles
} from './Icons';

export const FirebaseConfigModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const currentConfig = getFirebaseConfig();
  const [dbUrl, setDbUrl] = useState(currentConfig.dbUrl || '');
  // Never prefill a sensitive token into the form. It must be entered manually.
  const [secretToken, setSecretToken] = useState('');
  const [testStatus, setTestStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!dbUrl.trim()) {
      setTestStatus({ success: false, msg: 'กรุณากรอก Firebase Realtime Database URL' });
      return;
    }

    setLoading(true);
    setTestStatus(null);

    try {
      let testUrl = `${dbUrl.replace(/\/$/, '')}/.json`;
      if (secretToken) testUrl += `?auth=${secretToken}`;

      const res = await fetch(testUrl);
      if (res.ok) {
        setTestStatus({ success: true, msg: 'เชื่อมต่อกับ Firebase Realtime Database สำเร็จ! 🟢' });
      } else {
        setTestStatus({ success: false, msg: `เชื่อมต่อไม่สำเร็จ (HTTP Status: ${res.status}). ตรวจสอบ Realtime Database Rules ว่าเป็น ".read": true, ".write": true` });
      }
    } catch (e) {
      setTestStatus({ success: false, msg: 'เกิดข้อผิดพลาดในการเชื่อมต่อ ตรวจสอบ URL อีกครั้ง' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveFirebaseConfig({
      dbUrl: dbUrl.trim(),
      secretToken: secretToken.trim()
    });
    onSaveSuccess();
    onClose();
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
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff' }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                ตั้งค่าฐานข้อมูล Firebase Database
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                เชื่อมต่อเว็บไซต์กับ Firebase Realtime Database เพื่อ Sync ข้อมูลกับ Roblox Script
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px' }}>
              Firebase Realtime Database URL <span style={{ color: '#ff2a5f' }}>*</span>
            </label>
            <input
              type="text"
              className="input-cyber"
              placeholder="https://your-project-name-default-rtdb.firebaseio.com"
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
              ตัวอย่าง: <code style={{ color: '#00f0ff' }}>https://sameweknow-db-default-rtdb.firebaseio.com</code>
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px' }}>
              Database Secret Token (ถ้ามี/Optional)
            </label>
            <input
              type="password"
              name="firebase-secret-token"
              autoComplete="new-password"
              className="input-cyber"
              placeholder="กรอก Secret Token สำหรับแอดมิน (ถ้าปิด Public Write)"
              value={secretToken}
              onChange={(e) => setSecretToken(e.target.value)}
            />
          </div>

          {/* Test connection status message */}
          {testStatus && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              background: testStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${testStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              color: testStatus.success ? '#34d399' : '#fb7185'
            }}>
              {testStatus.msg}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleTestConnection}
              className="btn-secondary"
              disabled={loading}
            >
              {loading ? <RefreshCw size={16} className="pulse-glow" /> : <Settings size={16} />}
              <span>ทดสอบการเชื่อมต่อ</span>
            </button>

            <button type="submit" className="btn-primary">
              <CheckCircle size={16} /> บันทึกการตั้งค่า
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
