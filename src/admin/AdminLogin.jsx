import React, { useState } from 'react';
import './admin.css';

export default function AdminLogin({ onLoginSuccess, onBackToHome }) {
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputVal = tokenInput.trim();
    const storedPasscode = localStorage.getItem('triples_admin_passcode');
    const validCodes = ['Diffsnow482024', 'diffsnow482024'];
    if (storedPasscode) validCodes.push(storedPasscode.trim());

    if (validCodes.includes(inputVal)) {
      setError('');
      sessionStorage.setItem('triples_admin_auth', 'true');
      onLoginSuccess();
    } else {
      setError('รหัส Token ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div 
      className="admin-login-wrapper"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 40%, rgba(56, 189, 248, 0.12) 0%, rgba(6, 16, 32, 0.95) 100%), url(/asset/diffsnow-bg.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="admin-login-card">
        {/* Emblem Logo on Login */}
        <div className="admin-login-header">
          <img 
            src="/asset/diffsnow-logo.png" 
            alt="Diffsnow Emblem" 
            className="admin-login-crest"
            onError={(e) => { e.currentTarget.src = '/asset/diffsnow-logo.png'; }}
          />
          <h1 className="admin-login-title">ADMIN LOGIN</h1>
          <p className="admin-login-sub">กรุณาใส่รหัสผ่าน เพื่อเข้าจัดการเว็บไซต์</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-input-group">
          <label className="admin-input-label">PASSWORD / รหัสผ่าน</label>
          <div className="admin-password-wrap">
            <input
              type={showToken ? 'text' : 'password'}
              className="admin-input-field token-centered-field"
              placeholder="กรุณาใส่รหัสผ่าน"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowToken(!showToken)}
              title={showToken ? 'ซ่อนรหัส' : 'แสดงรหัส'}
            >
              {showToken ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p className="admin-error-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </p>
          )}

          <button type="submit" className="admin-submit-btn">
            เข้าสู่ระบบ
          </button>

          <button type="button" className="admin-back-btn" onClick={onBackToHome}>
            กลับไปหน้าเว็บไซต์
          </button>
        </form>
      </div>
    </div>
  );
}
