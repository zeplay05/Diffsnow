import React, { useState } from 'react';

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(56, 189, 248, 0.25)',
  background: '#131926',
  color: '#fff',
  outline: 'none',
  fontSize: '14px',
  transition: 'border-color 0.2s ease',
};

const buttonStyle = {
  border: 'none',
  borderRadius: '10px',
  padding: '12px 18px',
  fontWeight: 800,
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
  color: '#fff',
  boxShadow: '0 4px 15px rgba(56, 189, 248, 0.35)',
  transition: 'all 0.2s ease',
};

export function MemberProfileModal({ member, onClose, onSave }) {
  const [imageUrl, setImageUrl] = useState(member?.imageUrl || member?.avatar || '');
  const [facebook, setFacebook] = useState(member?.facebook || member?.socialLink || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const name = member?.name || member?.username || member?.facebookName || 'สมาชิก DIFFSNOW';
  const role = member?.role || member?.rank || 'MEMBER';

  const handleSave = async () => {
    const url = imageUrl.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      setMessage('กรุณาใส่ลิงก์รูปที่ขึ้นต้นด้วย https:// หรือ http://');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const updated = {
        ...member,
        id: member.id,
        imageUrl: url,
        avatar: url,
        facebook: facebook.trim(),
      };
      await onSave(updated);
      setMessage('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setMessage('บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'linear-gradient(165deg, #0e1726 0%, #070c16 100%)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="ปิด"
          style={{
            position: 'absolute',
            top: 16,
            right: 18,
            border: 0,
            background: 'transparent',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 26,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #38bdf8',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
              background: '#131926',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8' }}>
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                {role}
              </span>
            </div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '800' }}>{name}</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>
              จัดการโปรไฟล์สมาชิก DIFFSNOW
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Direct Link รูปโปรไฟล์ (Image URL)
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://i.postimg.cc/.../avatar.png"
              style={fieldStyle}
            />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '4px 0 0 2px' }}>
              แนะนำใช้เว็บฝากรูป เช่น Postimages, Imgur หรือ Discord
            </p>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              ลิงก์ Facebook หรือโซเชียลมีเดีย
            </label>
            <input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/..."
              style={fieldStyle}
            />
          </div>

          <button
            disabled={busy}
            onClick={handleSave}
            style={{
              ...buttonStyle,
              width: '100%',
              marginTop: '8px',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>

        {message && (
          <div
            style={{
              marginTop: '14px',
              color: message.includes('เรียบร้อย') ? '#34d399' : '#fca5a5',
              fontSize: '13px',
              lineHeight: 1.5,
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
