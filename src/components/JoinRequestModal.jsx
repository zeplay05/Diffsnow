import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { submitJoinRequest } from '../services/joinRequestService';

/* ──────────────────────────────────────────────────────────────
   JoinRequestModal
   - Floating REQUEST button in top-right corner
   - Step 1: passcode gate  (sameweknow)
   - Step 2: fill the form  (facebook name, facebook url)
   - Step 3: success screen
────────────────────────────────────────────────────────────── */
export const JoinRequestModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  // step: 'passcode' | 'form' | 'success'
  const [step, setStep] = useState('passcode');

  // Passcode state
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [passcodeShake, setPasscodeShake] = useState(false);

  // Form state
  const [facebookName, setFacebookName] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Button hover
  const [btnHover, setBtnHover] = useState(false);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Esc to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleOpen = () => {
    setStep('passcode');
    setPasscode('');
    setPasscodeError('');
    setFacebookName('');
    setFacebookUrl('');
    setNote('');
    setFormError('');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handlePasscodeSubmit = () => {
    if (['diffsnow482024', 'Diffsnow482024'].includes(passcode.trim())) {
      setPasscodeError('');
      setStep('form');
    } else {
      setPasscodeError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setPasscodeShake(true);
      setTimeout(() => setPasscodeShake(false), 500);
    }
  };

  const handleFormSubmit = async () => {
    if (!facebookName.trim()) {
      setFormError('กรุณากรอกชื่อ Facebook ของคุณ');
      return;
    }
    if (!facebookUrl.trim()) {
      setFormError('กรุณากรอกลิงก์ Facebook ของคุณ');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      await submitJoinRequest({ facebookName: facebookName.trim(), facebookUrl: facebookUrl.trim(), note: note.trim() });
      setSubmitting(false);
      setStep('success');
    } catch {
      setSubmitting(false);
      setFormError('ส่งคำขอไม่สำเร็จ โปรดตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px'
  };

  const modal = isOpen ? (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '20px'
      }}
    >
      {/* Modal card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 'min(460px, 94vw)',
          maxHeight: 'calc(100vh - 30px)',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, rgba(15,15,20,0.98) 0%, rgba(10,10,15,0.98) 100%)',
          border: '1px solid rgba(100, 160, 255, 0.25)',
          borderRadius: 'clamp(18px, 3.5vw, 24px)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 60px rgba(100,160,255,0.08)',
          padding: 'clamp(20px, 4.5vw, 32px)',
          position: 'relative',
          animation: 'fadeInUp 0.25s ease'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            lineHeight: 1
          }}
        >✕</button>

        {/* ── STEP 1: PASSCODE ── */}
        {step === 'passcode' && (
          <div style={{ animation: passcodeShake ? 'shake 0.4s ease' : 'none' }}>
            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(100,160,255,0.2), rgba(60,100,200,0.15))',
                border: '1px solid rgba(100,160,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px'
              }}>🔑</div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px', fontFamily: "'Inter', sans-serif" }}>
                ส่งคำขอเข้าร่วม
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                กรอกรหัสผ่านเพื่อเข้าสู่แบบฟอร์ม
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>รหัสผ่าน</label>
              <input
                type="password"
                name="join-request-passcode"
                autoComplete="new-password"
                placeholder="กรอกรหัสผ่าน..."
                value={passcode}
                onChange={e => { setPasscode(e.target.value); setPasscodeError(''); }}
                onKeyDown={e => e.key === 'Enter' && handlePasscodeSubmit()}
                autoFocus
                style={{
                  ...inputStyle,
                  borderColor: passcodeError ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.15)'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(100,160,255,0.6)'}
                onBlur={e => e.target.style.borderColor = passcodeError ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.15)'}
              />
              {passcodeError && (
                <p style={{ fontSize: '12px', color: '#ef4444', margin: '8px 0 0', fontFamily: "'Inter', sans-serif" }}>
                  ⚠ {passcodeError}
                </p>
              )}
            </div>

            <button
              onClick={handlePasscodeSubmit}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                fontFamily: "'Inter', sans-serif",
                transition: 'opacity 0.2s'
              }}
            >
              ยืนยันรหัสผ่าน →
            </button>
          </div>
        )}

        {/* ── STEP 2: FORM ── */}
        {step === 'form' && (
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(200,150,0,0.15))',
                border: '1px solid rgba(255,215,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px'
              }}>📋</div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px', fontFamily: "'Inter', sans-serif" }}>
                กรอกข้อมูลของคุณ
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                แอดมินจะตรวจสอบและยืนยันคำขอของคุณ
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {/* Facebook Name */}
              <div>
                <label style={labelStyle}>ชื่อ Facebook <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  placeholder="ชื่อที่แสดงบน Facebook..."
                  value={facebookName}
                  onChange={e => setFacebookName(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
              </div>

              {/* Facebook URL */}
              <div>
                <label style={labelStyle}>ลิงก์ Facebook <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={facebookUrl}
                  onChange={e => setFacebookUrl(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
              </div>

              <div>
                <label style={labelStyle}>หมายเหตุ (ไม่บังคับ)</label>
                <textarea
                  placeholder="ข้อมูลเพิ่มเติมที่ต้องการแจ้ง..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '96px' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
              </div>

            </div>

            {formError && (
              <p style={{ fontSize: '13px', color: '#ef4444', margin: '0 0 16px', fontFamily: "'Inter', sans-serif", background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
                ⚠ {formError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep('passcode')}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >← ย้อนกลับ</button>

              <button
                onClick={handleFormSubmit}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: submitting
                    ? 'rgba(255,215,0,0.3)'
                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000000',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.05em',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {submitting ? (
                  <>
                    <div style={{
                      width: '14px', height: '14px',
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderTop: '2px solid #000',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>กำลังส่ง...</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>ส่งคำขอเข้าร่วม</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.15))',
              border: '2px solid rgba(34,197,94,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '32px'
            }}>✓</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#4ade80', margin: '0 0 10px', fontFamily: "'Inter', sans-serif" }}>
              ส่งคำขอสำเร็จ!
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontFamily: "'Inter', sans-serif", margin: '0 0 28px' }}>
              แอดมินจะตรวจสอบข้อมูลของคุณและยืนยันคำขอในเร็วๆ นี้<br />
              ขอบคุณที่สนใจเข้าร่วม <strong style={{ color: '#ffd700' }}>SAMEWEKNOW</strong>!
            </p>
            <button
              onClick={handleClose}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                border: 'none',
                borderRadius: '12px',
                color: '#000000',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif"
              }}
            >ปิด</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  ) : null;

  return (
    <>
      {/* Floating REQUEST button — top-right corner */}
      <button
        onClick={handleOpen}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          position: 'fixed',
          top: 'clamp(14px, 2.5vh, 24px)',
          right: 'clamp(14px, 2.5vw, 24px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: 'clamp(7px, 1.2vh, 10px) clamp(13px, 2vw, 20px)',
          background: btnHover
            ? 'linear-gradient(135deg, rgba(60,90,180,0.95), rgba(40,60,150,0.95))'
            : 'linear-gradient(135deg, rgba(30,50,140,0.85), rgba(20,40,120,0.85))',
          border: `1px solid ${btnHover ? 'rgba(100,160,255,0.6)' : 'rgba(100,160,255,0.35)'}`,
          borderRadius: '50px',
          color: '#ffffff',
          fontSize: 'clamp(10.5px, 1.1vw, 12px)',
          fontWeight: '800',
          letterSpacing: '0.12em',
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: btnHover
            ? '0 0 30px rgba(80,130,255,0.4), 0 8px 25px rgba(0,0,0,0.6)'
            : '0 0 16px rgba(60,100,220,0.25), 0 4px 16px rgba(0,0,0,0.5)',
          transform: btnHover ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          textTransform: 'uppercase',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Paper-plane icon */}
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.9 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        REQUEST
      </button>

      {/* Portal modal */}
      {createPortal(modal, document.body)}
    </>
  );
};

