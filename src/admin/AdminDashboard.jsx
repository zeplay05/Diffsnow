import React, { useState, useEffect } from 'react';
import MusicPlayer from '../components/MusicPlayer';
import {
  getAllMembers,
  saveRosterMembers,
  saveAllMembers,
  subscribeToRosterChanges,
  fetchAllMembers,
  FIXED_HEAD_NAMES,
} from '../services/memberService';
import {
  getJoinRequests,
  fetchJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  deleteJoinRequest
} from '../services/joinRequestService';
import { getFirebaseConfig, fetchRosterEntries } from '../services/firebaseService';
import './admin.css';

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = {
  dashboard: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>,
  members:   <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  requests: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 3L3 20l9-3.5 9 3.5L12 3z" />
      <path d="M12 16.5V7" />
    </svg>
  ),
  paperPlane: (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 3L3 20l9-3.5 9 3.5L12 3z" />
      <path d="M12 16.5V7" />
    </svg>
  ),
  appearance:<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
  settings:  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  firebase:  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
  logout:    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  plus:      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  edit:      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  trash:     <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  back:      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  lock:      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  import:    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  export:    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  alliance: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="9" y="3" width="6" height="5" rx="1" strokeWidth="2" stroke="currentColor" />
      <rect x="3" y="16" width="6" height="5" rx="1" strokeWidth="2" stroke="currentColor" />
      <rect x="15" y="16" width="6" height="5" rx="1" strokeWidth="2" stroke="currentColor" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 0H6v4m6-4h6v4" stroke="currentColor" />
    </svg>
  ),
  link: (
    <svg width="20" height="20" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  externalLink: (
    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  eye: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  crown: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 16l3-8 4 5 4-5 3 8H5z" /></svg>,
};

// ─── Shared Input Style ───────────────────────────────────────────────────────
const INPUT = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '10px 14px',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  fontFamily: "'Inter', sans-serif",
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

// ─── Partners Display Layout Options ──────────────────────────────────────────
const PARTNER_LAYOUTS = [
  'GRID CLASSIC', 'LIST HORIZONTAL', 'CARDS ELEGANT', 'MINIMAL LOGOS', 'NEON BADGES',
  'PREMIUM STRIPS', 'GLASS CARDS', 'FLOATING BUBBLES', 'BENTO GRID', 'LUXURY GOLD',
  'HEX HIVE', 'CIRCLE ROTATOR', 'TERMINAL CODE', 'STACKED LIST', 'INFINITE MARQUEE',
  'POLAROID SCATTER', 'CYBER GRID', 'RETRO PIXEL', 'MAGAZINE COLUMNS', 'SPOTLIGHT FOCUS',
  'SOCIAL PILLS', 'COMPACT GRID', 'MASONRY WALL', 'TICKET STUBS', 'VINYL RECORDS',
  'MODERN SLATE', 'GLOWING ORBS', '3D CUBES', 'HOLOGRAM PROJECTOR', 'VERTICAL TIMELINE',
  'SKEWED PANELS'
];

// ─── Member Roster Groups (มีเฉพาะ Main Triples ตามคำขอของผู้ใช้) ──────────────────
export const SUB_ROSTERS = [];

export const MAIN_ROSTER = {
  id: 'members',
  label: 'รายชื่อสมาชิก',
  title: 'รายชื่อสมาชิก',
  groupName: 'รายชื่อสมาชิก',
  storageKey: 'diffsnow_admin_members'
};

export const ALL_ROSTERS = [MAIN_ROSTER];

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function NavItem({ icon, label, badge, badgeStyle, active, activeColor, onClick }) {
  const [hov, setHov] = useState(false);
  const color = active ? (activeColor || '#ffffff') : hov ? '#ffffff' : 'rgba(255,255,255,0.5)';
  const border = active
    ? (activeColor ? `1px solid ${activeColor}` : '1px solid rgba(255,255,255,0.22)')
    : '1px solid transparent';
  const bg = active
    ? (activeColor ? `${activeColor}15` : 'rgba(255,255,255,0.06)')
    : hov ? 'rgba(255,255,255,0.03)' : 'transparent';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '12px',
        border: border,
        cursor: 'pointer',
        background: bg,
        color: color,
        fontWeight: '600',
        fontSize: '13px',
        letterSpacing: '0.05em',
        transition: 'all 0.2s',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon}
        <span>{label}</span>
      </div>
      {badge != null && (
        <span style={{
          background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.8)',
          borderRadius: '6px',
          padding: '2px 8px',
          fontSize: '10px',
          fontWeight: '700',
          ...badgeStyle
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GlassCard({ children, style, className = '' }) {
  return (
    <div className={`admin-glass-card ${className}`} style={{
      background: 'rgba(15,15,15,0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '24px',
      padding: '28px',
      ...style
    }}>
      {children}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, iconColor, iconBg }) {
  const ic = iconColor || '#e2e8f0';
  const bg = iconBg || 'rgba(226, 232, 240, 0.1)';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      paddingBottom: '16px',
      marginBottom: '24px'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: ic
      }}>{icon}</div>
      <h2 style={{
        fontSize: '18px',
        fontWeight: '800',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        margin: 0
      }}>{title}</h2>
    </div>
  );
}

// ─── Main Triples Admin Component ─────────────────────────────────────────────
export default function AdminDashboard({ onLogout, onGoToLiveSite, onRefreshData }) {
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 900;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectTab = (t) => {
    setTab(t);
    setSidebarOpen(false);
  };

  // Logo & Branding
  const logoImg = '/asset/LOGO DIFFSNOW.png';

  // Members state (โหลดข้อมูลสมาชิก)
  const [rosterData, setRosterData] = useState(() => getAllMembers());

  useEffect(() => {
    fetchAllMembers().then((data) => {
      if (data) setRosterData(data);
    });

    fetchRosterEntries().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setRosterData(prev => ({ ...prev, members: list }));
        saveRosterMembers('members', list);
      }
    });

    const unsubscribe = subscribeToRosterChanges((data) => {
      setRosterData(data);
    });
    return () => unsubscribe();
  }, []);

  const currentRoster = ALL_ROSTERS.find(r => r.id === tab);
  const isRosterTab = !!currentRoster;
  const entries = isRosterTab ? (rosterData[currentRoster.id] || []) : [];

  const [memberSearch, setMemberSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    name: '',
    role: 'Founder',
    rankOrder: '1',
    imageUrl: '',
    socialLink: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    kick: '',
    youtube: '',
    profileEmail: ''
  });

  // Settings State
  const [gangName, setGangName] = useState(() => localStorage.getItem('triples_gang_name') || 'DIFFSNOW');
  const [gangSlug, setGangSlug] = useState(() => localStorage.getItem('triples_gang_slug') || 'Diffsnow');
  const [showLandingPage, setShowLandingPage] = useState(() => localStorage.getItem('triples_show_landing') !== 'false');

  // Firebase Realtime Database State
  const [fbUrl, setFbUrl] = useState(() => {
    const saved = localStorage.getItem('triples_fb_url') || localStorage.getItem('diffsnow_fb_url') || '';
    if (saved.includes('sameweknow-db-20260821') || !saved.trim()) {
      return 'https://diffsnow-database-default-rtdb.asia-southeast1.firebasedatabase.app';
    }
    return saved;
  });
  const [fbSecretToken, setFbSecretToken] = useState(() => {
    return localStorage.getItem('triples_fb_secret') || localStorage.getItem('diffsnow_fb_secret') || '';
  });
  const [fbStatus, setFbStatus] = useState(null);
  const [fbMessage, setFbMessage] = useState('');
  const [fbLoading, setFbLoading] = useState(false);

  // Join Requests State (เมนูคำขอ)
  const [joinRequests, setJoinRequests] = useState(() => getJoinRequests());
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [acceptRank, setAcceptRank] = useState('4');
  const [acceptCustomRole, setAcceptCustomRole] = useState('Member');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const refreshRequests = async () => {
      const data = await fetchJoinRequests();
      if (data) setJoinRequests(data);
    };
    refreshRequests();

    window.addEventListener('diffsnow_requests_updated', refreshRequests);
    window.addEventListener('sameweknow_requests_updated', refreshRequests);
    const poll = setInterval(refreshRequests, 10000);
    return () => {
      window.removeEventListener('diffsnow_requests_updated', refreshRequests);
      window.removeEventListener('sameweknow_requests_updated', refreshRequests);
      clearInterval(poll);
    };
  }, []);

  const pendingRequestCount = joinRequests.filter(r => r.status === 'pending').length;

  const handleOpenAcceptModal = (req) => {
    setAcceptTarget(req);
    setAcceptRank('4');
    setAcceptCustomRole('Member');
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = async () => {
    if (!acceptTarget) return;
    const newMember = await acceptJoinRequest(acceptTarget.id, acceptRank, acceptCustomRole);
    if (newMember) {
      const currentList = rosterData['members'] || [];
      const updatedList = [newMember, ...currentList];
      saveEntries(updatedList);
      setJoinRequests(await fetchJoinRequests());
    }
    setShowAcceptModal(false);
    setAcceptTarget(null);
  };

  const handleOpenRejectModal = (req) => {
    setRejectTarget(req);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    await rejectJoinRequest(rejectTarget.id, rejectReason.trim());
    setJoinRequests(await fetchJoinRequests());
    setShowRejectModal(false);
    setRejectTarget(null);
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('ต้องการลบคำขอนี้หรือไม่?')) {
      await deleteJoinRequest(id);
      setJoinRequests(await fetchJoinRequests());
    }
  };

  const handleSaveFirebase = () => {
    const cleanUrl = fbUrl.trim();
    const cleanToken = fbSecretToken.trim();
    localStorage.setItem('triples_fb_url', cleanUrl);
    localStorage.setItem('triples_fb_secret', cleanToken);
    localStorage.setItem('diffsnow_fb_url', cleanUrl);
    localStorage.setItem('diffsnow_fb_secret', cleanToken);
    localStorage.setItem('diffsnow_firebase_config', JSON.stringify({ dbUrl: cleanUrl, secretToken: cleanToken }));
    setFbStatus('success');
    setFbMessage('บันทึกการตั้งค่า Firebase Realtime Database เรียบร้อยแล้ว!');
    fetchAllMembers();
    setTimeout(() => setFbMessage(''), 3500);
  };

  const handleSyncToFirebase = async () => {
    if (!fbUrl.trim()) {
      setFbStatus('error');
      setFbMessage('กรุณากรอก Firebase Database URL ให้ถูกต้อง');
      return;
    }
    setFbLoading(true);
    setFbStatus(null);
    setFbMessage('กำลังเชื่อมต่อและซิงค์ข้อมูลขึ้น Firebase Realtime Database...');

    const cleanUrl = fbUrl.trim().replace(/\/$/, '');
    const cleanToken = fbSecretToken.trim();
    localStorage.setItem('triples_fb_url', cleanUrl);
    localStorage.setItem('triples_fb_secret', cleanToken);
    localStorage.setItem('diffsnow_fb_url', cleanUrl);
    localStorage.setItem('diffsnow_fb_secret', cleanToken);
    localStorage.setItem('diffsnow_firebase_config', JSON.stringify({ dbUrl: cleanUrl, secretToken: cleanToken }));

    try {
      let targetUrl = `${cleanUrl}/roster.json`;
      if (cleanToken) targetUrl += `?auth=${cleanToken}`;

      const allData = getAllMembers();
      const membersList = allData['members'] || allData['diffsnow'] || [];

      const res = await fetch(targetUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(membersList)
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      setFbStatus('success');
      setFbMessage('✓ เชื่อมต่อและซิงค์รายชื่อทั้งหมดขึ้น Firebase สำเร็จเรียบร้อย! ข้อมูลตรงกันทันทีแบบ Real-time');
    } catch (err) {
      console.error(err);
      setFbStatus('error');
      setFbMessage(`การเชื่อมต่อ Firebase ล้มเหลว: ${err.message || 'โปรดตรวจสอบ Database URL และ Database Rules'}`);
    } finally {
      setFbLoading(false);
    }
  };

  const handleTestAndSyncFirebase = handleSyncToFirebase;

  // Appearance State
  const [logoInput, setLogoInput] = useState(() => localStorage.getItem('triples_logo_url') || '/asset/LOGO DIFFSNOW.png');
  const [bgInput, setBgInput] = useState(() => localStorage.getItem('triples_bg_url') || '/asset/diffsnow-bg.png');
  const [bgOpacity, setBgOpacity] = useState(() => Number(localStorage.getItem('triples_bg_opacity') || 40));
  const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('triples_theme') || 'Apex Azure');
  const [themeSaved, setThemeSaved] = useState(false);

  // Music State
  const [musicUrl, setMusicUrl] = useState(() => {
    const saved = localStorage.getItem('triples_music_url') || localStorage.getItem('diffsnow_music_url');
    if (saved === null || saved.trim() === '' || saved.includes('szpLnpkuKr8') || saved.includes('3pC31F2ijrM')) {
      return 'https://www.youtube.com/watch?v=6MCiaKFkhfg&t=13s';
    }
    return saved;
  });
  const [musicVolume, setMusicVolume] = useState(() => Number(localStorage.getItem('triples_music_volume') || 50));
  const [musicLayout, setMusicLayout] = useState(() => localStorage.getItem('triples_music_layout') || 'STANDARD');
  const [previewMode, setPreviewMode] = useState('pill'); // 'pill' | 'card'
  const [musicSaved, setMusicSaved] = useState(false);
  const [previewSaved, setPreviewSaved] = useState(false);

  // Token / Passcode
  const [currentToken, setCurrentToken] = useState(() => {
    const saved = localStorage.getItem('triples_admin_passcode') || localStorage.getItem('diffsnow_admin_passcode');
    if (!saved || saved === '1234') {
      localStorage.setItem('triples_admin_passcode', 'Diffsnow482024');
      localStorage.setItem('diffsnow_admin_passcode', 'Diffsnow482024');
      return 'Diffsnow482024';
    }
    return saved;
  });
  const [showToken, setShowToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [tokenResetMessage, setTokenResetMessage] = useState('');

  // ฟังก์ชันรีเซ็ต Token ใหม่สำหรับ Login Admin
  const handleResetToken = () => {
    const confirmReset = window.confirm(
      'คุณต้องการรีเซ็ตสร้างรหัส Token ใหม่หรือไม่?\n\n(ระบบจะสร้าง Token ใหม่ทันที และใช้สำหรับเข้าสู่ระบบหลังบ้านแทนรหัสเดิม)'
    );
    if (!confirmReset) return;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
      p1 += chars.charAt(Math.floor(Math.random() * chars.length));
      p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newToken = `DIFFSNOW-${p1}-${p2}`;

    localStorage.setItem('triples_admin_passcode', newToken);
    localStorage.setItem('diffsnow_admin_passcode', newToken);
    setCurrentToken(newToken);
    setShowToken(true);

    try {
      navigator.clipboard?.writeText(newToken);
      setTokenCopied(true);
      setTokenResetMessage(`สร้างรหัส Token ใหม่สำเร็จ: ${newToken} (คัดลอกให้อัตโนมัติแล้ว)`);
      setTimeout(() => {
        setTokenCopied(false);
        setTokenResetMessage('');
      }, 5000);
    } catch {
      setTokenResetMessage(`สร้างรหัส Token ใหม่สำเร็จ: ${newToken}`);
      setTimeout(() => setTokenResetMessage(''), 5000);
    }
  };

  // Alliance State
  const [subGangs, setSubGangs] = useState(() => {
    try {
      const saved = localStorage.getItem('triples_subgangs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [partnerLinks, setPartnerLinks] = useState(() => {
    try {
      const saved = localStorage.getItem('triples_partner_links');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [partnerLayout, setPartnerLayout] = useState(() => localStorage.getItem('triples_partner_layout') || 'GRID CLASSIC');
  const [showSubGangModal, setShowSubGangModal] = useState(false);
  const [subGangForm, setSubGangForm] = useState({ name: '', slug: '' });
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ name: '', url: '' });

  // Persist members when updated
  const saveEntries = async (newEntries) => {
    if (!currentRoster) return;
    setRosterData(prev => ({ ...prev, [currentRoster.id]: newEntries }));
    await saveRosterMembers(currentRoster.id, newEntries);

    // Save directly into diffsnow_roster_data & triples_members_members for public pages
    try {
      localStorage.setItem('diffsnow_roster_data', JSON.stringify(newEntries));
      localStorage.setItem('triples_members_members', JSON.stringify(newEntries));
      localStorage.setItem(`triples_members_${currentRoster.id}`, JSON.stringify(newEntries));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Auto-sync to Firebase Realtime Database with await so cloud is 100% committed
    try {
      const config = getFirebaseConfig();
      const targetDbUrl = (fbUrl && fbUrl.trim()) || config?.dbUrl;
      const targetToken = (fbSecretToken && fbSecretToken.trim()) || config?.secretToken;
      if (targetDbUrl) {
        let endpoint = `${targetDbUrl.replace(/\/$/, '')}/roster.json`;
        if (targetToken) endpoint += `?auth=${targetToken}`;
        await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntries)
        });
      }
    } catch (e) {
      console.warn('Firebase auto-push error:', e);
    }

    // Broadcast update event and trigger parent refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('diffsnow_roster_updated', { detail: newEntries }));
      window.dispatchEvent(new CustomEvent('triples_roster_updated', { detail: newEntries }));
    }
    if (typeof onRefreshData === 'function') {
      onRefreshData();
    }
  };

  // Rank helper: HEAD (1), LEADER (2), SUPPORTER (3), MEMBER (4)
  const getRankNumber = (item) => {
    const nameLower = (item.name || item.username || '').toLowerCase().trim();
    if (FIXED_HEAD_NAMES.includes(nameLower)) return 1;
    if (item.rankOrder !== undefined && item.rankOrder !== '' && !isNaN(Number(item.rankOrder))) {
      const n = Number(item.rankOrder);
      if (n >= 4) return 4;
      return n;
    }
    const r = (item.role || item.status || item.rank || '').toLowerCase();
    if (r.includes('head') || r.includes('founder') || r.includes('boss') || r === '1') return 1;
    if (r.includes('leader') || r === '2') return 2;
    if (r.includes('supporter') || r.includes('support') || r.includes('respect') || r === '3') return 3;
    return 4; // Member
  };

  const getRoleName = (item) => {
    const nameLower = (item.name || item.username || '').toLowerCase().trim();
    if (FIXED_HEAD_NAMES.includes(nameLower)) return 'Head';
    const num = getRankNumber(item);
    const names = { 1: 'Head', 2: 'Leader', 3: 'Supporter', 4: 'Member' };
    const r = item?.role?.trim();
    if (r && !['whitelist', 'blacklist', 'reseller', 'vip', 'member', 'lastname', 'respect', 'support'].includes(r.toLowerCase())) {
      return r;
    }
    return names[num] || 'Member';
  };

  // Sorted and filtered members
  const sortedEntries = [...(entries || [])].sort((a, b) => getRankNumber(a) - getRankNumber(b));
  const filteredEntries = sortedEntries.filter(e => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (e.name || e.username || '').toLowerCase().includes(q) ||
           (e.role || e.status || '').toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      role: 'Head',
      rankOrder: '1',
      imageUrl: '',
      socialLink: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      kick: '',
      youtube: '',
      profileEmail: ''
    });
    setShowAddModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const ro = String(item.rankOrder !== undefined ? (Number(item.rankOrder) >= 4 ? '4' : item.rankOrder) : getRankNumber(item));
    setForm({
      name: item.name || item.username || '',
      role: item.role || item.status || getRoleName(item),
      rankOrder: ro || '4',
      imageUrl: item.imageUrl || item.avatar || '',
      socialLink: item.socialLink || item.social || '',
      facebook: item.facebook || '',
      instagram: item.instagram || '',
      tiktok: item.tiktok || '',
      kick: item.kick || '',
      youtube: item.youtube || '',
      profileEmail: item.profileEmail || ''
    });
    setShowAddModal(true);
  };

  const handleSaveMember = async () => {
    const memberName = form.name.trim();
    if (!memberName) return;
    const fb = form.facebook.trim();
    const ig = form.instagram.trim();
    const tt = form.tiktok.trim();
    const kick = form.kick.trim();
    const yt = form.youtube.trim();
    const primarySocial = fb || ig || tt || kick || yt || form.socialLink.trim();

    const rankNum = String(form.rankOrder || '4');
    const roleMap = { '1': 'Head', '2': 'Leader', '3': 'Supporter', '4': 'Member' };
    const roleName = form.role?.trim() || roleMap[rankNum] || 'Member';

    const payload = {
      id: editingItem ? editingItem.id : Date.now(),
      name: memberName,
      username: memberName,
      role: roleName,
      rankOrder: rankNum,
      avatar: form.imageUrl.trim() || logoImg,
      imageUrl: form.imageUrl.trim() || logoImg,
      socialLink: primarySocial,
      facebook: fb,
      instagram: ig,
      tiktok: tt,
      kick,
      youtube: yt,
      profileEmail: form.profileEmail.trim().toLowerCase()
    };

    let updated;
    if (editingItem) {
      updated = entries.map(e => String(e.id) === String(editingItem.id) ? payload : e);
    } else {
      updated = [...entries, payload];
    }
    await saveEntries(updated);
    setShowAddModal(false);
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('ต้องการลบรายชื่อนี้หรือไม่?')) {
      const updated = entries.filter(e => String(e.id) !== String(id) && e.name !== id);
      await saveEntries(updated);
    }
  };

  const handleMoveEntry = async (id, direction) => {
    const idx = entries.findIndex(e => String(e.id) === String(id));
    if (idx === -1) return;
    const newList = [...entries];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newList.length) return;
    [newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]];
    await saveEntries(newList);
  };

  const handleExport = () => {
    if (!currentRoster) return;
    const currentList = rosterData[currentRoster.id] || [];
    const blob = new Blob([JSON.stringify(currentList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRoster.id}_members_backup.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (Array.isArray(parsed)) {
          saveEntries(parsed);
          alert(`นำเข้าข้อมูลสมาชิก ${currentRoster?.label || ''} สำเร็จ! (${parsed.length} คน)`);
        } else if (parsed && typeof parsed === 'object') {
          if (parsed[currentRoster?.id] && Array.isArray(parsed[currentRoster.id])) {
            saveEntries(parsed[currentRoster.id]);
            alert(`นำเข้าข้อมูลสมาชิก ${currentRoster?.label || ''} จากไฟล์รวมสำเร็จ!`);
          } else {
            await saveAllMembers(parsed);
            setRosterData(parsed);
            alert('นำเข้าฐานข้อมูลสมาชิก JSON ทั้งหมดสำเร็จ!');
          }
        } else {
          alert('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาด: ไฟล์ JSON เสียหายหรือไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Music Save
  const handleSaveMusic = () => {
    const cleanUrl = (musicUrl || '').trim();
    localStorage.setItem('triples_music_url', cleanUrl);
    localStorage.setItem('diffsnow_music_url', cleanUrl);
    localStorage.setItem('triples_music_volume', String(musicVolume));
    localStorage.setItem('diffsnow_music_volume', String(musicVolume));
    localStorage.setItem('triples_music_layout', musicLayout);
    localStorage.setItem('diffsnow_music_layout', musicLayout);
    window.dispatchEvent(new Event('triples_music_updated'));
    window.dispatchEvent(new Event('diffsnow_music_updated'));
    setMusicSaved(true);
    setTimeout(() => setMusicSaved(false), 3000);
  };

  const handleSavePreview = () => {
    handleSaveMusic();
    setPreviewSaved(true);
    setTimeout(() => setPreviewSaved(false), 3000);
  };

  // Appearance Save
  const handleSaveLogo = () => {
    localStorage.setItem('triples_logo_url', logoInput);
    alert('บันทึก LOGO สำเร็จ!');
  };

  const handleSaveBackground = () => {
    localStorage.setItem('triples_bg_url', bgInput);
    localStorage.setItem('triples_bg_opacity', String(bgOpacity));
    alert('บันทึก BACKGROUND สำเร็จ!');
  };

  // Alliance SubGangs
  const handleSaveSubGang = () => {
    if (!subGangForm.name.trim()) return;
    const cleanSlug = subGangForm.slug.trim()
      ? (subGangForm.slug.trim().startsWith('/') ? subGangForm.slug.trim() : `/${subGangForm.slug.trim()}`)
      : `/${subGangForm.name.trim().toLowerCase()}`;
    const updated = [...subGangs, { id: Date.now().toString(), name: subGangForm.name.trim(), slug: cleanSlug }];
    setSubGangs(updated);
    localStorage.setItem('triples_subgangs', JSON.stringify(updated));
    setShowSubGangModal(false);
  };

  const handleDeleteSubGang = (id) => {
    if (window.confirm('ต้องการลบแก๊งย่อยนี้หรือไม่?')) {
      const updated = subGangs.filter(g => g.id !== id);
      setSubGangs(updated);
      localStorage.setItem('triples_subgangs', JSON.stringify(updated));
    }
  };

  // Alliance Partner
  const handleSavePartner = () => {
    const inputUrl = partnerForm.url.trim();
    if (!inputUrl) return;
    const name = partnerForm.name.trim() || inputUrl.replace(/^https?:\/\//i, '').split('/')[0];
    const updated = [...partnerLinks, { id: Date.now().toString(), name, url: inputUrl }];
    setPartnerLinks(updated);
    localStorage.setItem('triples_partner_links', JSON.stringify(updated));
    setShowPartnerModal(false);
    setPartnerForm({ name: '', url: '' });
  };

  const handleDeletePartner = (id) => {
    if (window.confirm('ต้องการลบลิงก์พันธมิตรนี้หรือไม่?')) {
      const updated = partnerLinks.filter(p => p.id !== id);
      setPartnerLinks(updated);
      localStorage.setItem('triples_partner_links', JSON.stringify(updated));
    }
  };

  const handleSelectLayout = (layout) => {
    setPartnerLayout(layout);
    localStorage.setItem('triples_partner_layout', layout);
  };

  return (
    <div className="admin-shell" style={{
      height: '100vh',
      maxHeight: '100vh',
      width: '100%',
      display: 'flex',
      overflow: 'hidden',
      background: 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(15px)',
      WebkitBackdropFilter: 'blur(15px)',
      fontFamily: "'Inter', sans-serif",
      color: '#fff'
    }}>

      {/* ── MOBILE BACKDROP ────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE HEADER (Top Bar with ☰ Hamburger Icon) ─────────────────── */}
      <header
        className="admin-mobile-header"
        style={{
          position: isMobile ? 'fixed' : undefined,
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: '#09090b',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: isMobile ? 'flex' : undefined,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 1000,
          boxSizing: 'border-box',
        }}
      >
        <button 
          type="button"
          onClick={() => setSidebarOpen(true)} 
          aria-label="เปิดเมนู"
          className="admin-hamburger-btn"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '10px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            padding: 0,
            flexShrink: 0
          }}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
            <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
            <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logoImg} alt={gangName} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.12em', color: '#ffffff', textTransform: 'uppercase' }}>
            {gangName}
          </span>
        </div>
        <div style={{ width: '38px' }} />
      </header>

      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`} style={{
        width: '260px',
        flexShrink: 0,
        height: '100vh',
        background: 'rgba(10,10,10,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxSizing: 'border-box',
        zIndex: 20
      }}>
        <div className="admin-sidebar-top" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', scrollbarWidth: 'thin' }}>
          {/* Brand Profile */}
          <div className="admin-brand-profile" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img src={logoImg} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                </div>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '13px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {gangName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ width: '7px', height: '7px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
                    <span style={{ fontSize: '10px', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>ONLINE</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="admin-sidebar-close-btn"
                onClick={() => setSidebarOpen(false)}
                title="ปิดเมนู"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Nav Label */}
          <div style={{
            fontSize: '9px',
            fontWeight: '900',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            paddingLeft: '14px',
            marginBottom: '10px'
          }}>
            เมนูหลัก (MAIN MENU)
          </div>

          {/* Nav Items (มีเฉพาะ Main Triples และ คำขอ (Requests) ตามคำขอของผู้ใช้) */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <NavItem icon={Icon.dashboard} label="หน้าหลัก (Dashboard)" active={tab === 'dashboard'} onClick={() => selectTab('dashboard')} />
            <NavItem icon={Icon.members} label="รายชื่อสมาชิก" badge={rosterData['members']?.length || 0} active={tab === 'members'} onClick={() => selectTab('members')} />
            <NavItem
              icon={Icon.requests}
              label="คำขอ (Requests)"
              badge={pendingRequestCount > 0 ? pendingRequestCount : 0}
              badgeStyle={pendingRequestCount > 0 ? { background: '#ef4444', color: '#fff' } : undefined}
              active={tab === 'requests'}
              onClick={() => selectTab('requests')}
            />

            <div style={{ height: '4px', margin: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />

            <NavItem icon={Icon.alliance} label="พันธมิตร (Alliance)" badge={`${subGangs.length}/4`} active={tab === 'alliance'} onClick={() => selectTab('alliance')} />
            <NavItem icon={Icon.appearance} label="ตกเเต่ง (Appearance)" active={tab === 'appearance'} onClick={() => selectTab('appearance')} />
            <NavItem icon={Icon.firebase} label="ฐานข้อมูล (Firebase)" active={tab === 'firebase'} onClick={() => selectTab('firebase')} />
            <NavItem icon={Icon.settings} label="ตั้งค่า (Settings)" active={tab === 'settings'} onClick={() => selectTab('settings')} />
          </nav>
        </div>

        {/* Bottom Actions: View Live Site & Logout */}
        <div className="admin-sidebar-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={onGoToLiveSite}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            ดูหน้าเว็บจริง
          </button>

          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {Icon.logout} ออกจากระบบ (Logout)
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="admin-main" style={{
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
        padding: isMobile ? '70px 14px 44px' : '32px 28px',
        boxSizing: 'border-box'
      }}>

        {/* ── TAB: DASHBOARD ──────────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div style={{ maxWidth: '1200px' }}>
            {/* Welcome Banner */}
            <div className="admin-hero-banner" style={{
              background: 'rgba(15,15,15,0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '24px',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '24px',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at top left, rgba(226, 232, 240,0.06), transparent 70%)',
                pointerEvents: 'none'
              }} />
              <div style={{ position: 'relative', zIndex: 10 }}>
                <h1 style={{
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                  fontWeight: '900',
                  color: '#ffffff',
                  margin: '0 0 6px',
                  fontFamily: "'Chakra Petch', sans-serif"
                }}>
                  Welcome back, Leader
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: '500' }}>
                  Manage your gang profile and members from this control center.
                </p>
              </div>
            </div>

            {/* 4 Stats Grid */}
            <div className="admin-stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '28px'
            }}>
              <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>TOTAL MEMBERS</span>
                <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#ffffff', lineHeight: 1 }}>
                  {Object.values(rosterData).reduce((sum, list) => sum + (list?.length || 0), 0)}
                </span>
              </GlassCard>
              <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>GANG STATUS</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#22c55e', lineHeight: 1 }}>Active</span>
              </GlassCard>
              <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>PLAN TYPE</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#e2e8f0', lineHeight: 1 }}>PREMIUM</span>
              </GlassCard>
              <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>THEME</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#38bdf8', lineHeight: 1, whiteSpace: 'nowrap' }}>{selectedTheme || 'Apex Azure'}</span>
              </GlassCard>
            </div>

            {/* Quick Guide Card Container */}
            <GlassCard className="admin-quickguide-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '24px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(226, 232, 240,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0', fontWeight: '900', fontSize: '16px' }}>
                  #
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>
                    📖 คู่มือการใช้งาน (QUICK GUIDE)
                  </h2>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    กดที่แต่ละกล่องเพื่อไปยังฟังก์ชันนั้นๆ
                  </p>
                </div>
              </div>

              {/* Action Shortcut Cards */}
              <div className="admin-shortcuts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {/* 1. Members */}
                <div
                  onClick={() => selectTab('members')}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                >
                  <div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(226, 232, 240,0.1)', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      {Icon.members}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#ffffff', marginBottom: '2px' }}>จัดการสมาชิก</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#e2e8f0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>MEMBERS</div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
                      เพิ่ม แก้ไข หรือลบสมาชิก กำหนดตำแหน่ง ยศ และรายชื่อ
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#e2e8f0', marginTop: '16px', letterSpacing: '0.05em' }}>
                    ไปยังหน้าสมาชิก &rarr;
                  </div>
                </div>

                {/* 1.1 Requests Shortcut */}
                <div
                  onClick={() => selectTab('requests')}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                >
                  <div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      {Icon.requests}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#ffffff', marginBottom: '2px' }}>คำขอเข้าร่วม</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      REQUESTS ({pendingRequestCount} รอดำเนินการ)
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
                      ตรวจสอบและอนุมัติคำขอเข้าร่วมแก๊ง พร้อมเลือกยศและบทบาท
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#60a5fa', marginTop: '16px', letterSpacing: '0.05em' }}>
                    ไปยังหน้าคำขอ &rarr;
                  </div>
                </div>

                {/* 2. Appearance */}
                <div
                  onClick={() => selectTab('appearance')}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                >
                  <div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(244,114,182,0.1)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      {Icon.appearance}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#ffffff', marginBottom: '2px' }}>ตกแต่งหน้าเว็บ</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#f472b6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>APPEARANCE</div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
                      เลือกธีม, อัปโหลดโลโก้ตรงกลาง และปรับแต่งหน้าเว็บ
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#f472b6', marginTop: '16px', letterSpacing: '0.05em' }}>
                    ไปที่ตกแต่ง &rarr;
                  </div>
                </div>

                {/* 3. Settings */}
                <div
                  onClick={() => selectTab('settings')}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                >
                  <div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      {Icon.settings}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#ffffff', marginBottom: '2px' }}>ตั้งค่าทั่วไป</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#fbbf24', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>SETTINGS</div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
                      ดูข้อมูลระบบ, รหัสผ่าน Admin Password และรีเฟรชข้อมูล
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#fbbf24', marginTop: '16px', letterSpacing: '0.05em' }}>
                    ไปที่ตั้งค่า &rarr;
                  </div>
                </div>

                {/* 4. Alliance */}
                <div
                  onClick={() => selectTab('alliance')}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                >
                  <div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168,85,247,0.12)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      {Icon.alliance}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#ffffff', marginBottom: '2px' }}>พันธมิตร & แก๊งย่อย</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#a855f7', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>ALLIANCE</div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
                      สร้างแก๊งลูก (Sub Gang) ได้สูงสุด 4 แก๊ง เเละเพิ่มลิงก์เว็บพันธมิตรได้
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#a855f7', marginTop: '16px', letterSpacing: '0.05em' }}>
                    ไปที่พันธมิตร &rarr;
                  </div>
                </div>

                {/* 5. Preview Site */}
                <div
                  onClick={onGoToLiveSite}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                >
                  <div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      {Icon.eye}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#ffffff', marginBottom: '2px' }}>ดูหน้าเว็บจริง</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>PREVIEW</div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
                      เปิดดูหน้าเว็บ {gangName} สำหรับผู้ใช้งานทั่วไป
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', marginTop: '16px', letterSpacing: '0.05em' }}>
                    เปิดหน้าเว็บ &rarr;
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── TAB: ROSTER (MAIN TRIPLES) ──────────────────────────────────── */}
        {isRosterTab && currentRoster && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(226, 232, 240,0.12)',
                  color: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {Icon.members}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h1 style={{
                    fontSize: '22px',
                    fontWeight: '900',
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    margin: 0,
                    lineHeight: 1.1,
                    fontFamily: "'Chakra Petch', sans-serif"
                  }}>
                    {currentRoster.title}
                  </h1>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.4)',
                    margin: '4px 0 0',
                    lineHeight: 1.2
                  }}>
                    จัดการฐานข้อมูลสมาชิก {currentRoster.label}
                  </p>
                </div>
              </div>

              <div className="admin-member-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.1em' }}>
                  {Icon.import} Import
                  <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />
                </label>

                <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.1em' }}>
                  {Icon.export} Export
                </button>

                <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', background: '#e2e8f0', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '12px', letterSpacing: '0.1em', cursor: 'pointer' }}>
                  {Icon.plus} ADD MEMBER
                </button>
              </div>
            </div>

            <GlassCard style={{ padding: '20px' }}>
              <input
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                placeholder={`ค้นหาชื่อใน ${currentRoster.label}...`}
                style={{ ...INPUT, marginBottom: '16px', maxWidth: '380px' }}
              />

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Avatar', 'Member Info (Name / Role / Rank)', 'Social Link', 'Order', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map(item => {
                      const name = item.name || item.username || 'Unknown';
                      const role = getRoleName(item);
                      const rankNum = getRankNumber(item);
                      const avatarSrc = item.imageUrl || item.avatar || logoImg;

                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img src={avatarSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => e.target.src = logoImg} />
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ fontWeight: '800', color: '#fff', fontSize: '15px' }}>{name}</div>
                              <div style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{role}</div>
                              <div>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: 'rgba(56,189,248,0.12)',
                                  border: '1px solid rgba(56,189,248,0.35)',
                                  color: '#38bdf8',
                                  borderRadius: '6px',
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  letterSpacing: '0.05em'
                                }}>
                                  Rank {rankNum} • {role}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            {item.socialLink || item.facebook ? (
                              <a
                                href={item.facebook || item.socialLink}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: '11px',
                                  color: '#38bdf8',
                                  textDecoration: 'none',
                                  background: 'rgba(24,119,242,0.1)',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(24,119,242,0.35)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  fontWeight: '700'
                                }}
                              >
                                <span style={{ fontWeight: '900' }}>f</span> Profile
                              </a>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>—</span>
                            )}
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button onClick={() => handleMoveEntry(item.id, 'up')} style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px' }}>▲</button>
                              <button onClick={() => handleMoveEntry(item.id, 'down')} style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px' }}>▼</button>
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => openEdit(item)} title="แก้ไข" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {Icon.edit}
                              </button>
                              <button onClick={() => handleDeleteMember(item.id)} title="ลบ" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {Icon.trash}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredEntries.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
                          ยังไม่มีรายชื่อสมาชิกในกลุ่ม {currentRoster.label} (กดปุ่ม + ADD MEMBER ด้านบนเพื่อเพิ่มสมาชิก)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── TAB: REQUESTS (คำขอเข้าร่วม) ─────────────────────────────────── */}
        {tab === 'requests' && (
          <div style={{ maxWidth: '1200px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.75)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {Icon.paperPlane}
                </div>
                <div>
                  <h1 style={{
                    fontSize: '22px',
                    fontWeight: '900',
                    color: '#ffffff',
                    margin: 0,
                    letterSpacing: '0.04em',
                    lineHeight: 1.2
                  }}>
                    คำขอเข้าร่วม
                  </h1>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.45)',
                    margin: '4px 0 0',
                    lineHeight: 1.2
                  }}>
                    ตรวจสอบและจัดการคำขอจากผู้ที่ต้องการเข้าร่วม {gangName}
                  </p>
                </div>
              </div>

              {/* Status Badges on the right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.28)',
                  color: '#ef4444'
                }}>
                  รอดำเนินการ: {pendingRequestCount}
                </span>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.65)'
                }}>
                  ทั้งหมด: {joinRequests.length}
                </span>
              </div>
            </div>

            {/* Request Content / Empty state */}
            {joinRequests.length === 0 ? (
              <div style={{
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '56px', marginBottom: '14px', filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.1))' }}>
                  📬
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.45)',
                  letterSpacing: '0.04em'
                }}>
                  ยังไม่มีคำขอเข้าร่วม
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {joinRequests.map(req => {
                  const isPending = req.status === 'pending';
                  const isAccepted = req.status === 'accepted';
                  const isRejected = req.status === 'rejected';

                  return (
                    <GlassCard key={req.id} style={{
                      padding: '20px 24px',
                      border: isPending ? '1px solid rgba(234, 179, 8, 0.25)' : '1px solid rgba(255, 255, 255, 0.07)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                              {req.facebookName || req.name || 'ไม่ระบุชื่อ'}
                            </span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: '700',
                              background: isPending ? 'rgba(234, 179, 8, 0.15)' : isAccepted ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: isPending ? '#facc15' : isAccepted ? '#4ade80' : '#f87171',
                              border: isPending ? '1px solid rgba(234, 179, 8, 0.3)' : isAccepted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                            }}>
                              {isPending ? 'รอดำเนินการ' : isAccepted ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                            ส่งเมื่อ: {req.submittedAt ? new Date(req.submittedAt).toLocaleString('th-TH') : '-'}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenAcceptModal(req)}
                                style={{
                                  padding: '7px 14px',
                                  borderRadius: '9px',
                                  background: '#10b981',
                                  border: 'none',
                                  color: '#ffffff',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                ✓ รับเข้าแก๊ง
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(req)}
                                style={{
                                  padding: '7px 14px',
                                  borderRadius: '9px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#ef4444',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                ✕ ปฏิเสธ
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(req.id)}
                            style={{
                              padding: '7px 10px',
                              borderRadius: '9px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.4)',
                              cursor: 'pointer'
                            }}
                            title="ลบคำขอ"
                          >
                            {Icon.trash}
                          </button>
                        </div>
                      </div>

                      {/* Facebook Link & Note */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', marginTop: '4px' }}>
                        {req.facebookUrl && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Facebook:</span>
                            <a
                              href={req.facebookUrl.startsWith('http') ? req.facebookUrl : `https://${req.facebookUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              {req.facebookUrl} ↗
                            </a>
                          </div>
                        )}
                        {req.note && (
                          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' }}>
                            <span style={{ color: 'rgba(255,255,255,0.45)', marginRight: '6px' }}>ข้อความ:</span>
                            {req.note}
                          </div>
                        )}
                        {isRejected && req.rejectedReason && (
                          <div style={{ color: '#f87171', fontSize: '11.5px', marginTop: '2px' }}>
                            เหตุผลที่ปฏิเสธ: {req.rejectedReason}
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: FIREBASE (ฐานข้อมูล) ────────────────────────────────────── */}
        {tab === 'firebase' && (
          <div style={{ maxWidth: '1000px' }}>
            <div className="admin-setting-card" style={{
              background: 'rgba(15,15,15,0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(245,158,11,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f59e0b'
                  }}>
                    {Icon.firebase}
                  </span>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                      Firebase Realtime Database (ระบบฐานข้อมูลคลาวด์กลาง)
                    </h2>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>
                      เชื่อมต่อ Firebase Realtime Database เพื่อให้เมื่อแอดมินเพิ่ม/แก้ไขรายชื่อ ทุกคนที่เข้าชมเว็บทั่วโลกจะมองเห็นข้อมูลตรงกันทันทีแบบ Real-time
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '800',
                    background: fbUrl ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: fbUrl ? '#4ade80' : '#f87171',
                    border: fbUrl ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)'
                  }}>
                    {fbUrl ? '● กำหนดค่าแล้ว' : '○ ยังไม่ได้เชื่อมต่อ'}
                  </span>
                </div>
              </div>

              {/* Inputs Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                    1. FIREBASE REALTIME DATABASE URL
                  </label>
                  <input
                    value={fbUrl}
                    onChange={e => setFbUrl(e.target.value)}
                    placeholder="https://your-project-default-rtdb.firebaseio.com"
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(245,158,11,0.25)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                    ใส่ URL ฐานข้อมูล Firebase Realtime Database ที่ต้องการเชื่อมต่อ
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                    2. DATABASE SECRET / AUTH TOKEN (อุปกรณ์เสริม / OPTIONAL)
                  </label>
                  <input
                    type="password"
                    value={fbSecretToken}
                    onChange={e => setFbSecretToken(e.target.value)}
                    placeholder="ใส่ Database Secret หากเปิด Rules เป็นแบบจำกัดสิทธิ์..."
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(245,158,11,0.25)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleTestAndSyncFirebase}
                    disabled={fbLoading}
                    style={{
                      padding: '12px 20px',
                      background: '#f59e0b',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: fbLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: fbLoading ? 0.7 : 1
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    {fbLoading ? 'กำลังทดสอบและซิงค์ข้อมูล...' : 'ทดสอบการเชื่อมต่อ & ซิงค์ข้อมูลทั้งหมดขึ้น Firebase'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveFirebase}
                    style={{
                      padding: '12px 18px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    บันทึก Firebase Config
                  </button>
                </div>

                {/* Status Message */}
                {fbMessage && (
                  <div style={{
                    marginTop: '8px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    lineHeight: 1.4,
                    background: fbStatus === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                    border: fbStatus === 'error' ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(34,197,94,0.4)',
                    color: fbStatus === 'error' ? '#fca5a5' : '#86efac'
                  }}>
                    {fbMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: APPEARANCE ─────────────────────────────────────────────── */}
        {tab === 'appearance' && (
          <div style={{ maxWidth: '1100px' }}>
            <GlassCard style={{ marginBottom: '28px' }}>
              <SectionHeader icon={Icon.appearance} title="Brand Assets" iconColor="#ec4899" iconBg="rgba(236,72,153,0.12)" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '12px' }}>Logo URL</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={logoInput || logoImg} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} onError={e => e.target.src = logoImg} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input value={logoInput} onChange={e => setLogoInput(e.target.value)} placeholder="asset/LOGO DIFFSNOW.png" style={{ ...INPUT, marginBottom: '6px' }} />
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Recommended: Square PNG/JPG (512x512)</div>
                    </div>
                  </div>
                  <button onClick={handleSaveLogo} style={{ padding: '9px 20px', background: '#e2e8f0', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    SAVE LOGO
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '12px' }}>Background URL</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={bgInput || '/asset/diffsnow-bg.png'} alt="BG" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: bgOpacity / 100 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input value={bgInput} onChange={e => setBgInput(e.target.value)} placeholder="asset/diffsnow-bg.png" style={{ ...INPUT, marginBottom: '6px' }} />
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Recommended: 1920x1080 (Darkened)</div>
                    </div>
                  </div>

                  <label style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Background Opacity</span>
                    <span style={{ color: '#e2e8f0' }}>{bgOpacity}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={bgOpacity} onChange={e => setBgOpacity(Number(e.target.value))} style={{ width: '100%', accentColor: '#e2e8f0', cursor: 'pointer', height: '4px' }} />

                  <button onClick={handleSaveBackground} style={{ marginTop: '12px', padding: '9px 20px', background: '#e2e8f0', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    SAVE BACKGROUND
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Select Theme */}
            <GlassCard>
              <SectionHeader icon={Icon.appearance} title="Select Theme" iconColor="#ec4899" iconBg="rgba(236,72,153,0.12)" />
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(226, 232, 240,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '14px' }}>PREMIUM</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {[
                    { name: 'Apex Azure', accent: '#38bdf8', bg: 'linear-gradient(135deg,#001018,#001828)' },
                    { name: 'Apex Crimson', accent: '#ef4444', bg: 'linear-gradient(135deg,#1a0000,#2a0000)' },
                    { name: 'Triples', accent: '#e2e8f0', bg: 'linear-gradient(135deg,#0a0c10,#1e2430)' },
                    { name: 'Apex Gold', accent: '#f59e0b', bg: 'linear-gradient(135deg,#1a1200,#2a1f00)' },
                  ].map(theme => (
                    <div key={theme.name} onClick={() => { setSelectedTheme(theme.name); setThemeSaved(false); }} style={{
                      width: '150px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedTheme === theme.name ? `2px solid ${theme.accent}` : '2px solid rgba(255,255,255,0.06)',
                      boxShadow: selectedTheme === theme.name ? `0 0 18px ${theme.accent}55` : 'none',
                    }}>
                      <div style={{ height: '90px', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '28px', fontWeight: '900', color: theme.accent, fontFamily: "'Chakra Petch', sans-serif" }}>Aa</span>
                      </div>
                      <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.5)' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff' }}>{theme.name}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>apex-cards</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(226, 232, 240,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '14px' }}>EXCLUSIVE</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {[
                    { name: 'Void Black', accent: '#a855f7', bg: 'linear-gradient(135deg,#0a001a,#12002a)' },
                    { name: 'Neon Rose', accent: '#ec4899', bg: 'linear-gradient(135deg,#1a001a,#2a0018)' },
                    { name: 'Cyber Teal', accent: '#14b8a6', bg: 'linear-gradient(135deg,#001a18,#002820)' },
                    { name: 'Solar Amber', accent: '#f59e0b', bg: 'linear-gradient(135deg,#1a0e00,#281800)' },
                  ].map(theme => (
                    <div key={theme.name} onClick={() => { setSelectedTheme(theme.name); setThemeSaved(false); }} style={{
                      width: '150px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedTheme === theme.name ? `2px solid ${theme.accent}` : '2px solid rgba(255,255,255,0.06)',
                      boxShadow: selectedTheme === theme.name ? `0 0 18px ${theme.accent}55` : 'none',
                    }}>
                      <div style={{ height: '90px', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '28px', fontWeight: '900', color: theme.accent, fontFamily: "'Chakra Petch', sans-serif" }}>Aa</span>
                      </div>
                      <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.5)' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff' }}>{theme.name}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>apex-exclusive</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => {
                    localStorage.setItem('triples_theme', selectedTheme);
                    localStorage.setItem('sameweknow_theme', selectedTheme);
                    setThemeSaved(true);
                    setTimeout(() => setThemeSaved(false), 3000);
                  }}
                  style={{ padding: '11px 22px', background: themeSaved ? '#22c55e' : '#ec4899', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}
                >
                  {themeSaved ? '✓ บันทึกธีมแล้ว' : `บันทึกธีม: ${selectedTheme}`}
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── TAB: SETTINGS ───────────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div style={{ maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Setting Info Card */}
            <div className="admin-setting-card" style={{
              background: 'rgba(15,15,15,0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '24px',
              padding: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '0.05em' }}>Setting Info</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '8px' }}>GANG NAME</label>
                  <input
                    type="text"
                    value={gangName}
                    onChange={e => { setGangName(e.target.value); localStorage.setItem('triples_gang_name', e.target.value); }}
                    style={{ ...INPUT, padding: '12px 16px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '8px' }}>GANG ID / URL (SLUG)</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                    <span style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', fontSize: '13px', borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
                      diffsnow.com/
                    </span>
                    <input
                      type="text"
                      value={gangSlug}
                      onChange={e => { setGangSlug(e.target.value); localStorage.setItem('triples_gang_slug', e.target.value); }}
                      style={{ flex: 1, padding: '12px 16px', background: 'transparent', border: 'none', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Show Landing Page Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>Show Landing Page</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>Enable/Disable the grand entrance page before the member list.</div>
                  </div>
                  <div
                    onClick={() => {
                      const next = !showLandingPage;
                      setShowLandingPage(next);
                      localStorage.setItem('triples_show_landing', String(next));
                    }}
                    style={{
                      width: '46px',
                      height: '24px',
                      borderRadius: '20px',
                      background: showLandingPage ? '#22c55e' : 'rgba(255,255,255,0.15)',
                      padding: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      transform: showLandingPage ? 'translateX(22px)' : 'translateX(0px)',
                      transition: 'transform 0.25s ease',
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Background Music Card */}
            <div className="admin-setting-card" style={{
              background: 'rgba(15,15,15,0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '24px',
              padding: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Chakra Petch', sans-serif" }}>BACKGROUND MUSIC</h2>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.12em' }}>DIFFSNOW AUDIO SYSTEM (SUPPORTS YOUTUBE)</p>
                </div>
              </div>

              {/* YOUTUBE SOURCE URL */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '8px' }}>
                  YOUTUBE SOURCE URL
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0 14px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '10px' }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </span>
                  <input
                    type="text"
                    value={musicUrl}
                    onChange={e => setMusicUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Master Volume & Player Layout */}
              <div className="admin-music-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '28px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>MASTER VOLUME</label>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8' }}>{musicVolume}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={musicVolume}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMusicVolume(v);
                      localStorage.setItem('triples_music_volume', String(v));
                      window.dispatchEvent(new Event('triples_music_updated'));
                    }}
                    style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer', height: '6px' }}
                  />

                  <div style={{ marginTop: '16px' }}>
                    <button
                      onClick={handleSaveMusic}
                      style={{
                        padding: '10px 20px',
                        background: musicSaved ? '#22c55e' : '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>🎵</span>
                      {musicSaved ? '✓ บันทึกเพลงสำเร็จ!' : 'บันทึกเพลง'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>PLAYER LAYOUT</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      'STANDARD', 'MINIMAL', 'COMPACT', 'GLASS', 'ROUND', 'NEON GLOW',
                      'OS', 'RETRO VINYL', 'PIXEL ART', 'FUTURISTIC', 'BOTTOM BAR', 'FLOATING',
                      'CARBON FIBER', 'GLITCH ART', 'STEAMPUNK', 'SYNTH WAVE', 'MINIMAL STACK', 'ECHO BASS',
                      'HIDDEN'
                    ].map(layout => {
                      const isSel = musicLayout === layout;
                      return (
                        <button
                          key={layout}
                          onClick={() => setMusicLayout(layout)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            border: isSel ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                            background: isSel ? '#3b82f6' : 'rgba(255,255,255,0.02)',
                            color: isSel ? '#ffffff' : 'rgba(255,255,255,0.4)',
                            boxShadow: isSel ? '0 0 12px rgba(59,130,246,0.4)' : 'none'
                          }}
                        >
                          {layout}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Live Preview Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>LIVE PREVIEW</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setPreviewMode('pill')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '10px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      background: previewMode === 'pill' ? '#3b82f6' : 'transparent',
                      color: previewMode === 'pill' ? '#fff' : 'rgba(255,255,255,0.4)'
                    }}
                  >
                    ⚡ PILL VIEW (หน้าปกติ)
                  </button>
                  <button
                    onClick={() => setPreviewMode('card')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '10px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      background: previewMode === 'card' ? '#8b5cf6' : 'transparent',
                      color: previewMode === 'card' ? '#fff' : 'rgba(255,255,255,0.4)'
                    }}
                  >
                    🎴 CARD VIEW (UI ตอนกางออก)
                  </button>
                </div>
              </div>

              {/* Live Preview Display Box */}
              <div style={{
                marginTop: '16px',
                minHeight: '140px',
                borderRadius: '16px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px dashed rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '24px',
                overflow: 'hidden'
              }}>
                <MusicPlayer
                  isPreview={true}
                  previewLayout={musicLayout}
                  previewUrl={musicUrl}
                  previewVolume={musicVolume}
                  previewExpanded={previewMode === 'card'}
                />
              </div>

              {/* Save Live Preview Button */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSavePreview}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: previewSaved ? '#22c55e' : '#8b5cf6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: previewSaved ? '0 0 20px rgba(34,197,94,0.45)' : '0 4px 15px rgba(139,92,246,0.3)'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {previewSaved ? '✓ บันทึก LIVE PREVIEW สำเร็จ!' : 'บันทึก LIVE PREVIEW'}
                </button>
              </div>
            </div>

            {/* Security Zone Card */}
            <div className="admin-setting-card" style={{
              background: 'rgba(15,15,15,0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: '24px',
              padding: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ color: '#ef4444' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0 }}>Security Zone</h2>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
                หากคุณทำโทเค็นสูญหายหรือเชื่อว่าข้อมูลโทเค็นอาจรั่วไหล คุณสามารถตรวจสอบ คัดลอก หรือรีเซ็ตโทเค็นได้ที่นี่
              </p>

              <div className="admin-token-box" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '12px 18px',
                maxWidth: '620px',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>TOKEN:</span>
                <span style={{
                  fontSize: '15px',
                  fontWeight: '800',
                  color: '#e2e8f0',
                  letterSpacing: showToken ? '0.08em' : '0.22em',
                  fontFamily: showToken ? "'Inter', sans-serif" : 'monospace',
                  wordBreak: 'break-all',
                }}>
                  {showToken ? currentToken : '•'.repeat(currentToken ? currentToken.length : 9)}
                </span>

                <div className="admin-token-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowToken(!showToken)}
                    style={{
                      padding: '7px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '700',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  >
                    {showToken ? 'ซ่อน' : 'แสดง'}
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(currentToken);
                      setTokenCopied(true);
                      setTimeout(() => setTokenCopied(false), 2500);
                    }}
                    style={{
                      padding: '7px 14px',
                      background: tokenCopied ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.15)',
                      border: `1px solid ${tokenCopied ? '#4ade80' : '#3b82f6'}`,
                      color: tokenCopied ? '#4ade80' : '#60a5fa',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '800',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tokenCopied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                  </button>

                  <button
                    onClick={handleResetToken}
                    title="รีเซ็ตสร้าง Token ใหม่สำหรับใช้เข้าสู่ระบบ"
                    style={{
                      padding: '7px 14px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '800',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                      e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                    รีเซ็ต
                  </button>
                </div>
              </div>

              {/* ข้อความแจ้งเตือนเมื่อรีเซ็ต Token สำเร็จ */}
              {tokenResetMessage && (
                <div style={{
                  marginTop: '12px',
                  padding: '9px 16px',
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.35)',
                  borderRadius: '12px',
                  color: '#4ade80',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'fadeIn 0.25s ease'
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{tokenResetMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: ALLIANCE ───────────────────────────────────────────────── */}
        {tab === 'alliance' && (
          <div style={{ maxWidth: '1200px' }}>
            {/* Section 1: Sub-Gangs */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {Icon.alliance}
                  </div>
                  <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '0.05em' }}>Alliance System (Sub-Gangs)</h1>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>Create up to 4 sub gangs sharing this admin token.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSubGangModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  {Icon.plus} Create Sub-Gang
                </button>
              </div>

              {subGangs.length === 0 ? (
                <div style={{ padding: '32px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', maxWidth: '560px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
                  ยังไม่มีข้อมูลแก๊งย่อย (กดปุ่ม + Create Sub-Gang ด้านบนเพื่อสร้าง)
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {subGangs.map(gang => (
                    <div key={gang.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '560px' }}>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: '#fff' }}>{gang.name} ({gang.slug})</div>
                      <button onClick={() => handleDeleteSubGang(gang.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>{Icon.trash}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Website Partners */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {Icon.link}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '0.05em' }}>Website Partners</h2>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>Add links to friendly gangs or credits on your homepage.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPartnerModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  {Icon.plus} Add Link
                </button>
              </div>

              {partnerLinks.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                  {partnerLinks.map(partner => (
                    <div key={partner.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '8px 14px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#fff' }}>{partner.name}</span>
                      <button onClick={() => handleDeletePartner(partner.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Layout Selector */}
              <div style={{ marginTop: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
                  PARTNERS DISPLAY LAYOUT
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
                  {PARTNER_LAYOUTS.map(layout => {
                    const isSelected = partnerLayout === layout;
                    return (
                      <button
                        key={layout}
                        onClick={() => handleSelectLayout(layout)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: '800',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          textAlign: 'center',
                          cursor: 'pointer',
                          border: isSelected ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.06)',
                          background: isSelected ? '#10b981' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)',
                          boxShadow: isSelected ? '0 0 15px rgba(16,185,129,0.3)' : 'none',
                        }}
                      >
                        {layout}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── ADD / EDIT MEMBER MODAL ────────────────────────────────────────── */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              maxHeight: 'calc(100vh - 36px)',
              overflowY: 'auto',
              background: '#0e0e12',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '24px 22px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(99,102,241,0.15)',
              fontFamily: "'Inter', sans-serif",
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            {/* Header: Title + Close Icon '✕' */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '0.02em', fontFamily: "'Chakra Petch', sans-serif" }}>
                {editingItem ? 'Edit Member' : 'Add New Member'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px',
                  lineHeight: 1,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 1. NAME */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
                  NAME
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Member Name"
                  style={{ ...INPUT, border: '1px solid rgba(139,92,246,0.35)' }}
                />
              </div>

              {/* 2. RANK / ROLE ORDER */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
                  RANK / ROLE ORDER
                </label>
                <select
                  value={form.rankOrder}
                  onChange={e => {
                    const val = e.target.value;
                    const map = { '1': 'Head', '2': 'Leader', '3': 'Supporter', '4': 'Member' };
                    setForm({ ...form, rankOrder: val, role: map[val] || 'Member' });
                  }}
                  style={{
                    ...INPUT,
                    border: '1px solid rgba(139,92,246,0.35)',
                    cursor: 'pointer',
                    background: '#13131a',
                    color: '#ffffff',
                    fontWeight: '700',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23a855f7' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center'
                  }}
                >
                  <option value="1" style={{ background: '#13131a', color: '#fff' }}>1 = Head</option>
                  <option value="2" style={{ background: '#13131a', color: '#fff' }}>2 = Leader</option>
                  <option value="3" style={{ background: '#13131a', color: '#fff' }}>3 = Supporter</option>
                  <option value="4" style={{ background: '#13131a', color: '#fff' }}>4 = Member</option>
                </select>
              </div>

              {/* 3. FACEBOOK PROFILE / URL */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
                  FACEBOOK PROFILE / URL
                </label>
                <input
                  value={form.facebook}
                  onChange={e => setForm({ ...form, facebook: e.target.value })}
                  placeholder="https://facebook.com/username หรือ ชื่อโปรไฟล์"
                  style={{ ...INPUT, border: '1px solid rgba(59,130,246,0.35)' }}
                />
              </div>

              {/* 4 & 5. INSTAGRAM URL & TIKTOK URL (2 Columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
                    INSTAGRAM URL / USER
                  </label>
                  <input
                    value={form.instagram}
                    onChange={e => setForm({ ...form, instagram: e.target.value })}
                    placeholder="ig username หรือ ลิงก์"
                    style={{ ...INPUT, border: '1px solid rgba(236,72,153,0.35)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
                    TIKTOK URL / USER
                  </label>
                  <input
                    value={form.tiktok}
                    onChange={e => setForm({ ...form, tiktok: e.target.value })}
                    placeholder="tiktok username หรือ ลิ"
                    style={{ ...INPUT, border: '1px solid rgba(20,184,166,0.35)' }}
                  />
                </div>
              </div>

              {/* 6. KICK URL / USER */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
                  KICK URL / USER
                </label>
                <input
                  value={form.kick}
                  onChange={e => setForm({ ...form, kick: e.target.value })}
                  placeholder="kick.com/username หรือ username"
                  style={{ ...INPUT, border: '1px solid rgba(34,197,94,0.35)' }}
                />
              </div>

              {/* 7. YOUTUBE CHANNEL URL / USER */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
                  YOUTUBE CHANNEL URL / USER
                </label>
                <input
                  value={form.youtube}
                  onChange={e => setForm({ ...form, youtube: e.target.value })}
                  placeholder="youtube.com/@channel หรือ ลิงก์ช่อง"
                  style={{ ...INPUT, border: '1px solid rgba(239,68,68,0.35)' }}
                />
              </div>

              {/* 8. อีเมลเจ้าของโปรไฟล์ */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
                  อีเมลเจ้าของโปรไฟล์ (สำหรับสมาชิกแก้รูปเอง)
                </label>
                <input
                  value={form.profileEmail}
                  onChange={e => setForm({ ...form, profileEmail: e.target.value })}
                  placeholder="member@email.com"
                  style={{ ...INPUT, border: '1px solid rgba(234,179,8,0.3)' }}
                />
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', lineHeight: 1.3 }}>
                  สมาชิกต้องสมัคร/เข้าสู่ระบบด้วยอีเมลนี้ จึงจะแก้รูปของตัวเองได้
                </div>
              </div>

              {/* 9. DIRECT IMAGE URL */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
                  DIRECT IMAGE URL (ไม่ใส่ก็ได้ ระบบจะดึงรูปจาก FB/IG/TIKTOK ให้อัตโนมัติ)
                </label>
                <input
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://... (Direct Image URL)"
                  style={INPUT}
                />
              </div>

              {/* 10. ลำดับยศคำแนะนำ */}
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.45)', margin: '2px 0 4px', lineHeight: 1.4 }}>
                * ลำดับยศ: <span style={{ color: '#a855f7' }}>1 = Head</span>, <span style={{ color: '#38bdf8' }}>2 = Leader</span>, <span style={{ color: '#10b981' }}>3 = Supporter</span>, <span style={{ color: '#94a3b8' }}>4 = Member</span>
              </div>

              {/* 11. ปุ่ม Save Member */}
              <button
                type="button"
                onClick={handleSaveMember}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '13px',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Inter', sans-serif",
                  marginTop: '4px'
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                {editingItem ? 'Save Changes' : 'Save Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE SUB-GANG MODAL ─────────────────────────────────────────── */}
      {showSubGangModal && (
        <div onClick={() => setShowSubGangModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '380px', background: '#0e0e12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Create Sub-Gang</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input value={subGangForm.name} onChange={e => setSubGangForm({ ...subGangForm, name: e.target.value })} placeholder="ชื่อแก๊งย่อย..." style={INPUT} />
              <input value={subGangForm.slug} onChange={e => setSubGangForm({ ...subGangForm, slug: e.target.value })} placeholder="/slug..." style={INPUT} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => setShowSubGangModal(false)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>ยกเลิก</button>
                <button onClick={handleSaveSubGang} style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>สร้าง</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD PARTNER LINK MODAL ─────────────────────────────────────────── */}
      {showPartnerModal && (
        <div onClick={() => setShowPartnerModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '380px', background: '#0e0e12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Add Website Partner</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input value={partnerForm.name} onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })} placeholder="ชื่อเว็บพันธมิตร..." style={INPUT} />
              <input value={partnerForm.url} onChange={e => setPartnerForm({ ...partnerForm, url: e.target.value })} placeholder="https://..." style={INPUT} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => setShowPartnerModal(false)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>ยกเลิก</button>
                <button onClick={handleSavePartner} style={{ padding: '8px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>เพิ่ม</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── ACCEPT REQUEST MODAL ─────────────────────────────────────────── */}
      {showAcceptModal && acceptTarget && (
        <div onClick={() => setShowAcceptModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: '#0e0e12', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '28px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: '#fff' }}>
              รับเข้าตระกูล {gangName}
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 18px 0' }}>
              ผู้ขอเข้าร่วม: <strong style={{ color: '#fff' }}>{acceptTarget.facebookName || acceptTarget.name}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                  เลือกลำดับยศ (Rank Order)
                </label>
                <select
                  value={acceptRank}
                  onChange={e => {
                    setAcceptRank(e.target.value);
                    const roles = { '1': 'Head', '2': 'Leader', '3': 'Supporter', '4': 'Member' };
                    setAcceptCustomRole(roles[e.target.value] || 'Member');
                  }}
                  style={{ ...INPUT, cursor: 'pointer' }}
                >
                  <option value="1" style={{ background: '#121216', color: '#a855f7' }}>1 = Head</option>
                  <option value="2" style={{ background: '#121216', color: '#38bdf8' }}>2 = Leader</option>
                  <option value="3" style={{ background: '#121216', color: '#10b981' }}>3 = Supporter</option>
                  <option value="4" style={{ background: '#121216', color: '#94a3b8' }}>4 = Member</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                  ชื่อตำแหน่ง / Role
                </label>
                <input
                  value={acceptCustomRole}
                  onChange={e => setAcceptCustomRole(e.target.value)}
                  placeholder="เช่น Member, Supporter..."
                  style={INPUT}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(false)}
                  style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAccept}
                  style={{ padding: '9px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                >
                  ยืนยันการรับเข้า
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT REQUEST MODAL ─────────────────────────────────────────── */}
      {showRejectModal && rejectTarget && (
        <div onClick={() => setShowRejectModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', background: '#0e0e12', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '28px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: '#ef4444' }}>
              ปฏิเสธคำขอเข้าร่วม
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px 0' }}>
              ผู้ขอเข้าร่วม: <strong style={{ color: '#fff' }}>{rejectTarget.facebookName || rejectTarget.name}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                  ระบุเหตุผล (Optional)
                </label>
                <input
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="เช่น ไม่ผ่านเกณฑ์, คุณสมบัติไม่ครบ..."
                  style={INPUT}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  style={{ padding: '9px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                >
                  ยืนยันปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
