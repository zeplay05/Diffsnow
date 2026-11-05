import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  X, 
  Plus, 
  Edit, 
  CheckCircle, 
  Database, 
  Sparkles, 
  ShieldAlert 
} from './Icons';

export const AdminModal = ({ 
  isOpen, 
  onClose, 
  isAdmin, 
  onLogin, 
  onSaveEntry, 
  editingEntry, 
  onClearEditing,
  allEntries,
  onImportData
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [robloxId, setRobloxId] = useState('');
  const [username, setUsername] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [status, setStatus] = useState('whitelist');
  const [expiryDate, setExpiryDate] = useState('PERMANENT');
  const [note, setNote] = useState('');
  const [hwid, setHwid] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setRobloxId(editingEntry.robloxId || '');
      setUsername(editingEntry.username || '');
      setDiscordId(editingEntry.discordId || '');
      setStatus(editingEntry.status || 'whitelist');
      setExpiryDate(editingEntry.expiryDate || 'PERMANENT');
      setNote(editingEntry.note || '');
      setHwid(editingEntry.hwid || '');
    } else {
      setRobloxId('');
      setUsername('');
      setDiscordId('');
      setStatus('whitelist');
      setExpiryDate('PERMANENT');
      setNote('');
      setHwid('');
    }
  }, [editingEntry, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (passcode === '1234' || passcode === 'admin' || passcode === 'triplespf') {
      onLogin(true);
      setErrorMsg('');
    } else {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง (ลองใส่ 1234)');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!robloxId.trim() || !username.trim()) {
      alert('กรุณากรอก Roblox ID และ Username');
      return;
    }

    onSaveEntry({
      id: editingEntry ? editingEntry.id : null,
      robloxId: robloxId.trim(),
      username: username.trim(),
      discordId: discordId.trim(),
      status,
      expiryDate,
      note: note.trim(),
      hwid: hwid.trim()
    });

    onClose();
  };

  // Backup Export
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allEntries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `triplespf_roster_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Backup Import
  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            onImportData(parsed);
            alert(`นำเข้าข้อมูลสำเร็จ ${parsed.length} รายการ`);
          }
        } catch (err) {
          alert('ไฟล์ JSON ไม่ถูกต้อง');
        }
      };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: '28px', borderRadius: '20px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'linear-gradient(135deg, #ff2a5f 0%, #c70039 100%)', color: '#ffffff' }}>
              <Lock size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                ระบบจัดการแอดมิน (Admin Panel)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isAdmin ? 'จัดการเพิ่ม/แก้ไข/ลบ รายชื่อในฐานข้อมูล' : 'เข้าสู่ระบบแอดมินเพื่อแก้ไขข้อมูล'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {!isAdmin ? (
          /* LOGIN PASSCODE FORM */
          <form onSubmit={handleLoginSubmit} style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: '16px' }}>
              <Lock size={48} style={{ color: '#ff2a5f', marginBottom: '12px' }} />
              <h4 style={{ color: '#ffffff', fontSize: '1.1rem' }}>กรุณากรอกรหัสผ่านแอดมิน</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                รหัสผ่านเริ่มต้นคือ: <code style={{ color: '#00f0ff' }}>1234</code>
              </p>
            </div>

            <div style={{ maxWidth: '320px', margin: '0 auto 16px auto' }}>
              <input
                type="password"
                name="legacy-admin-passcode"
                autoComplete="new-password"
                className="input-cyber"
                placeholder="รหัสผ่านแอดมิน (Admin Passcode)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '4px' }}
                autoFocus
              />
            </div>

            {errorMsg && (
              <p style={{ color: '#fb7185', fontSize: '0.85rem', marginBottom: '14px' }}>
                {errorMsg}
              </p>
            )}

            <button type="submit" className="btn-primary" style={{ padding: '10px 28px' }}>
              ปลดล็อกระบบแอดมิน
            </button>
          </form>
        ) : (
          /* ADMIN MANAGE FORM */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <h4 style={{ color: '#00f0ff', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {editingEntry ? <Edit size={18} /> : <Plus size={18} />}
                {editingEntry ? `แก้ไขรายชื่อ: ${editingEntry.username}` : 'เพิ่มรายชื่อใหม่ลงในระบบ'}
              </h4>

              {editingEntry && (
                <button
                  onClick={onClearEditing}
                  style={{ background: 'none', border: 'none', color: '#fbbf24', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  ยกเลิกการแก้ไข (สลับเป็นเพิ่มใหม่)
                </button>
              )}
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                  Roblox User ID <span style={{ color: '#ff2a5f' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-cyber"
                  placeholder="เช่น 156489201"
                  value={robloxId}
                  onChange={(e) => setRobloxId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                  Roblox Username <span style={{ color: '#ff2a5f' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-cyber"
                  placeholder="เช่น MewieConquers"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                  Discord Username / Tag
                </label>
                <input
                  type="text"
                  className="input-cyber"
                  placeholder="เช่น mewie#0001"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                  สถานะสิทธิ์ (Status)
                </label>
                <select
                  className="input-cyber"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ backgroundColor: '#07090e' }}
                >
                  <option value="whitelist">🟢 Whitelist (อนุมัติสิทธิ์)</option>
                  <option value="blacklist">🔴 Blacklist (ติดดำ/ระงับ)</option>
                  <option value="reseller">🔵 Reseller (ตัวแทนจำหน่าย)</option>
                  <option value="vip">🟡 VIP (สมาชิกระดับสูง)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                  วันหมดอายุ (Expiry Date)
                </label>
                <input
                  type="text"
                  className="input-cyber"
                  placeholder="PERMANENT หรือ 2026-12-31"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                  HWID / Key (ถ้ามี)
                </label>
                <input
                  type="text"
                  className="input-cyber"
                  placeholder="HWID-xxxx-xxxx"
                  value={hwid}
                  onChange={(e) => setHwid(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                  หมายเหตุ / เหตุผลการลงรายการ (Reason / Notes)
                </label>
                <textarea
                  className="input-cyber"
                  rows="2"
                  placeholder="ระบุรายละเอียดเพิ่มเติม เช่น ซื้อสคริปต์รายเดือน หรือ โกงเงิน..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
                  <CheckCircle size={16} /> {editingEntry ? 'บันทึกการแก้ไข' : 'เพิ่มรายชื่อลงระบบ'}
                </button>
              </div>
            </form>

            {/* Backup & Import Tools */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                สำรองข้อมูลรายชื่อ (Backup JSON):
              </span>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  Export JSON
                </button>

                <label className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  Import JSON
                  <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
