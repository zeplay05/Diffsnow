import React, { useState, useEffect } from 'react';
import { 
  fetchRosterEntries, 
  saveRosterEntry, 
  deleteRosterEntry, 
  getFirebaseConfig,
  getCenterLogoUrl,
  saveCenterLogoUrl,
  DEFAULT_MUSIC_SETTINGS,
  fetchSharedMusicSettings,
  saveSharedMusicSettings,
  DEFAULT_UI_SETTINGS,
  fetchSharedUiSettings,
  saveSharedUiSettings
} from './services/firebaseService';
import { PublicRosterPage } from './pages/PublicRosterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TriplesMembersPage } from './pages/TriplesMembersPage';
import { MusicPlayer } from './components/MusicPlayer';
import { SnowEffect } from './components/SnowEffect';
import { CheckCircle } from './components/Icons';
import { JoinRequestModal } from './components/JoinRequestModal';
import './sameweknow.css';
import './App.css';

function App() {
  // Page Routing State ('public' | 'admin' | 'triples')
  const checkIsAdminRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return path.includes('adminlogin') || hash.includes('adminlogin') || search.includes('adminlogin') || hash.includes('admin');
  };

  const [currentPage, setCurrentPage] = useState(() => (checkIsAdminRoute() ? 'admin' : 'public'));

  // Database State - initialized to empty array per user request
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logo URL State
  const [centerLogoUrl, setCenterLogoUrl] = useState(getCenterLogoUrl());
  const [musicSettings, setMusicSettings] = useState(DEFAULT_MUSIC_SETTINGS);
  const [uiSettings, setUiSettings] = useState(() => ({
    ...DEFAULT_UI_SETTINGS,
    theme: 'Apex Azure'
  }));

  // Listen to hash / url changes for admin route
  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsAdminRoute()) {
        setCurrentPage('admin');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    const accents = {
      'Apex Gold': '#ffd700', 'Apex Crimson': '#ef4444', 'Apex Azure': '#38bdf8',
      'Void Black': '#a855f7', 'Neon Rose': '#ec4899', 'Cyber Teal': '#14b8a6', 'Solar Amber': '#f59e0b'
    };
    const accent = accents[uiSettings.theme] || '#38bdf8';
    document.documentElement.style.setProperty('--theme-accent', accent);
    document.documentElement.style.setProperty('--gold', accent);
    document.body.dataset.theme = uiSettings.theme || 'Apex Azure';
  }, [uiSettings.theme]);

  // Toast message notification
  const [toastMsg, setToastMsg] = useState(null);

  const firebaseConfig = getFirebaseConfig() || {};
  const isFirebaseActive = Boolean(firebaseConfig.dbUrl && firebaseConfig.dbUrl.trim() !== '');

  // Load roster data from Firebase / LocalStorage
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchRosterEntries();
      // Ensure roster entries start empty if none exist
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load roster:', e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchSharedMusicSettings().then(settings => {
      if (settings) setMusicSettings(settings);
    });
  }, []);

  useEffect(() => {
    fetchSharedUiSettings().then(settings => {
      if (!settings) return;
      setUiSettings(settings);
      if (settings.logoUrl) setCenterLogoUrl(settings.logoUrl);
    });
  }, []);

  // Apply saved background settings
  useEffect(() => {
    const savedUrl = uiSettings.bgUrl || '';
    const savedOpacity = Number(uiSettings.bgOpacity ?? 40);
    const darkAlpha = ((100 - savedOpacity) / 100).toFixed(2);
    const darkAlpha2 = Math.min(1, Number(darkAlpha) + 0.1).toFixed(2);
    const imgUrl = savedUrl || '/asset/diffsnow-bg.png';
    document.body.style.backgroundImage = [
      `linear-gradient(rgba(0,0,0,${darkAlpha}),rgba(0,0,0,${darkAlpha2}))`,
      'radial-gradient(circle at 50% 35%, rgba(56,189,248,0.12) 0%, transparent 65%)',
      `url('${imgUrl}')`
    ].join(',');
  }, [uiSettings]);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Save Center Logo URL
  const handleSaveLogoUrl = (url) => {
    setCenterLogoUrl(url);
    saveCenterLogoUrl(url);
    handleSaveUiSettings({ ...uiSettings, logoUrl: url });
    showToast('เปลี่ยนโลโก้ตรงกลางสำเร็จ!');
  };

  const handleSaveUiSettings = async (settings) => {
    setUiSettings(settings);
    try {
      const saved = await saveSharedUiSettings(settings);
      setUiSettings(saved);
      showToast('บันทึกการตั้งค่า UI สำเร็จ');
    } catch {
      showToast('บันทึกการตั้งค่า UI ในเครื่อง');
    }
  };

  const handleSaveMusicSettings = async (settings) => {
    setMusicSettings(settings);
    try {
      const saved = await saveSharedMusicSettings(settings);
      setMusicSettings(saved);
      showToast('บันทึกการตั้งค่าเพลงและ UI เรียบร้อยแล้ว!');
    } catch {
      showToast('บันทึกในเครื่อง (กรุณาเชื่อม Firebase Database)');
    }
  };

  // Save / Update entry
  const handleSaveEntry = async (entryData) => {
    const updated = await saveRosterEntry(entryData);
    setEntries(Array.isArray(updated) ? updated : []);
    showToast(entryData.id ? 'แก้ไขข้อมูลสมาชิกสำเร็จ!' : 'เพิ่มสมาชิกใหม่สำเร็จ!');
  };

  // Delete entry
  const handleDeleteEntry = async (id) => {
    if (window.confirm('คุณต้องการลบรายชื่อสมาชิกนี้หรือไม่?')) {
      const updated = await deleteRosterEntry(id);
      setEntries(Array.isArray(updated) ? updated : []);
      showToast('ลบสมาชิกสำเร็จ');
    }
  };

  // Import bulk JSON
  const handleImportData = async (newList) => {
    if (Array.isArray(newList)) {
      setEntries(newList);
      localStorage.setItem('diffsnow_roster_data', JSON.stringify(newList));
      showToast(`นำเข้าข้อมูลสำเร็จ ${newList.length} รายการ`);
    }
  };

  // Copy text helper
  const handleCopyText = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    showToast(label || 'คัดลอกข้อความสำเร็จ!');
  };

  const handleExitAdmin = () => {
    sessionStorage.removeItem('diffsnow_admin_authed');
    if (window.location.hash.includes('admin')) {
      window.location.hash = '';
    }
    if (window.location.pathname.toLowerCase().includes('adminlogin')) {
      window.history.pushState({}, '', '/');
    }
    setCurrentPage('public');
  };

  return (
    <div
      data-theme={uiSettings.theme || 'Apex Azure'}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'transparent', color: '#ffffff' }}
    >
      {/* Falling Snowflakes Particle Effect */}
      <SnowEffect />

      {/* Global Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          background: 'rgba(8, 22, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '14px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          fontWeight: '600',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle size={18} style={{ color: '#38bdf8' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Page Content */}
      <main style={{ flex: 1 }}>
        {currentPage === 'public' ? (
          <PublicRosterPage
            entries={entries}
            centerLogoUrl={centerLogoUrl}
            theme={uiSettings.theme}
            onNavigateToAdmin={() => {
              window.history.pushState({}, '', '/adminlogin');
              setCurrentPage('admin');
            }}
            onNavigateToTriples={() => setCurrentPage('triples')}
            isFirebaseActive={isFirebaseActive}
          />
        ) : currentPage === 'triples' ? (
          <TriplesMembersPage
            entries={entries}
            centerLogoUrl={centerLogoUrl}
            onBack={() => setCurrentPage('public')}
            onSaveProfile={handleSaveEntry}
          />
        ) : (
          <AdminDashboardPage
            entries={entries}
            centerLogoUrl={centerLogoUrl}
            onSaveLogoUrl={handleSaveLogoUrl}
            musicSettings={musicSettings}
            onSaveMusicSettings={handleSaveMusicSettings}
            uiSettings={uiSettings}
            onSaveUiSettings={handleSaveUiSettings}
            onSaveEntry={handleSaveEntry}
            onDeleteEntry={handleDeleteEntry}
            onImportData={handleImportData}
            onNavigateToPublic={handleExitAdmin}
            onCopyText={handleCopyText}
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* Floating Music Player Widget (Only on Public Pages) */}
      {currentPage !== 'admin' && <MusicPlayer settings={musicSettings} />}

      {/* Floating REQUEST button (Only on Home Page) */}
      {currentPage === 'public' && <JoinRequestModal />}
    </div>
  );
}

export default App;
