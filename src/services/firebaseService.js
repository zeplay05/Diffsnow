// Firebase Realtime Database & Local Storage Backend Service (REST API Native)
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  databaseURL: ''
};

export const db = null;
export const auth = null;

const LOCAL_STORAGE_KEY = 'diffsnow_roster_data';
const FIREBASE_CONFIG_KEY = 'diffsnow_firebase_config';
const ADMIN_AUTH_KEY = 'diffsnow_admin_authed';
const LOGO_URL_KEY = 'diffsnow_center_logo_url';

export const DEFAULT_MUSIC_SETTINGS = {
  url: 'https://www.youtube.com/watch?v=6MCiaKFkhfg&t=13s',
  volume: 50,
  layout: 'STANDARD',
  startTime: 13
};

export const DEFAULT_UI_SETTINGS = {
  logoUrl: '',
  bgUrl: '',
  bgOpacity: 40,
  theme: 'Apex Azure'
};

// Initial roster is completely empty per user request
const INITIAL_ROSTER = [];

export const getCenterLogoUrl = () => {
  return localStorage.getItem(LOGO_URL_KEY) || "/asset/diffsnow-logo.png";
};

export const saveCenterLogoUrl = (url) => {
  localStorage.setItem(LOGO_URL_KEY, url);
};

export const DEFAULT_FIREBASE_URL = 'https://diffsnow-database-default-rtdb.asia-southeast1.firebasedatabase.app';

export const getFirebaseConfig = () => {
  const defaults = {
    dbUrl: DEFAULT_FIREBASE_URL,
    secretToken: ''
  };

  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (!saved) return defaults;

    const parsed = JSON.parse(saved);
    return {
      dbUrl: parsed.dbUrl || DEFAULT_FIREBASE_URL,
      secretToken: parsed.secretToken || ''
    };
  } catch (e) {
    return defaults;
  }
};

export const saveFirebaseConfig = (config) => {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
};

// Music settings are shared so visitors see the admin-selected track and UI.
export const fetchSharedMusicSettings = async () => {
  const { dbUrl, secretToken } = getFirebaseConfig();
  if (!dbUrl) return DEFAULT_MUSIC_SETTINGS;

  try {
    let url = `${dbUrl.replace(/\/$/, '')}/siteSettings/music.json`;
    if (secretToken) url += `?auth=${secretToken}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const saved = await response.json();
    if (!saved) return null;
    return {
      url: saved?.url || DEFAULT_MUSIC_SETTINGS.url,
      volume: Number.isFinite(Number(saved?.volume)) ? Number(saved.volume) : DEFAULT_MUSIC_SETTINGS.volume,
      layout: saved?.layout || DEFAULT_MUSIC_SETTINGS.layout
    };
  } catch {
    return null;
  }
};

export const saveSharedMusicSettings = async (settings) => {
  const { dbUrl, secretToken } = getFirebaseConfig();
  const next = {
    url: settings.url || DEFAULT_MUSIC_SETTINGS.url,
    volume: Number(settings.volume) || DEFAULT_MUSIC_SETTINGS.volume,
    layout: settings.layout || DEFAULT_MUSIC_SETTINGS.layout
  };
  if (!dbUrl) return next;

  let url = `${dbUrl.replace(/\/$/, '')}/siteSettings/music.json`;
  if (secretToken) url += `?auth=${secretToken}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(next)
  });
  if (!response.ok) throw new Error('Unable to save shared music settings');
  return next;
};

export const fetchSharedUiSettings = async () => {
  const { dbUrl, secretToken } = getFirebaseConfig();
  if (!dbUrl) return null;
  try {
    let url = `${dbUrl.replace(/\/$/, '')}/siteSettings/ui.json`;
    if (secretToken) url += `?auth=${secretToken}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const saved = await response.json();
    return saved ? { ...DEFAULT_UI_SETTINGS, ...saved } : null;
  } catch {
    return null;
  }
};

export const saveSharedUiSettings = async (settings) => {
  const { dbUrl, secretToken } = getFirebaseConfig();
  const next = { ...DEFAULT_UI_SETTINGS, ...settings };
  if (!dbUrl) return next;
  let url = `${dbUrl.replace(/\/$/, '')}/siteSettings/ui.json`;
  if (secretToken) url += `?auth=${secretToken}`;
  const response = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
  if (!response.ok) throw new Error('Unable to save shared UI settings');
  return next;
};

export const getAdminAuth = () => {
  return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
};

export const setAdminAuth = (isAuthed) => {
  localStorage.setItem(ADMIN_AUTH_KEY, isAuthed ? 'true' : 'false');
};

// Fetch all roster items (From Firebase REST API if configured, else LocalStorage)
export const fetchRosterEntries = async () => {
  const config = getFirebaseConfig();
  
  if (config.dbUrl && config.dbUrl.trim() !== '') {
    try {
      let url = `${config.dbUrl.replace(/\/$/, '')}/roster.json`;
      if (config.secretToken) {
        url += `?auth=${config.secretToken}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data !== undefined && data !== null) {
          let list = [];
          if (Array.isArray(data)) {
            list = data.filter(Boolean);
          } else if (typeof data === 'object') {
            if (Array.isArray(data.members)) {
              list = data.members;
            } else if (Array.isArray(data.diffsnow)) {
              list = data.diffsnow;
            } else {
              list = Object.keys(data).map(key => ({ ...data[key], firebaseKey: key }));
            }
          }
          
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
          return list;
        }
      }
    } catch (err) {
      console.warn('Firebase REST sync error, falling back to LocalStorage:', err);
    }
  }

  // LocalStorage fallback (reads array or object formats, plus sub-keys)
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.members) && parsed.members.length > 0) return parsed.members;
        if (Array.isArray(parsed.diffsnow) && parsed.diffsnow.length > 0) return parsed.diffsnow;
        if (Array.isArray(parsed.data) && parsed.data.length > 0) return parsed.data;
      }
    }

    const subCached = localStorage.getItem('triples_members_members') || localStorage.getItem('triples_members_diffsnow');
    if (subCached) {
      const parsedSub = JSON.parse(subCached);
      if (Array.isArray(parsedSub) && parsedSub.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedSub));
        return parsedSub;
      }
    }
  } catch (e) {
    console.error('LocalStorage parse error:', e);
  }

  // Default seed
  return INITIAL_ROSTER;
};

// Save or Update Entry in Database & Firebase
export const saveRosterEntry = async (entry) => {
  const current = await fetchRosterEntries();
  const config = getFirebaseConfig();

  const isEdit = entry.id && current.some(item => item.id === entry.id);
  const entryId = entry.id || `mem-${Date.now()}`;
  const existing = current.find(item => item.id === entryId) || {};

  const updatedEntry = {
    ...existing,
    ...entry,
    id: entryId,
    name: entry.name || entry.username || existing.name || 'Unknown',
    username: entry.name || entry.username || existing.username || 'Unknown',
    role: entry.role || existing.role || 'Member',
    status: entry.role ? entry.role.toLowerCase() : (entry.status || existing.status || 'member'),
    rankOrder: entry.rankOrder !== undefined ? String(entry.rankOrder) : (existing.rankOrder !== undefined ? String(existing.rankOrder) : '5'),
    avatar: entry.imageUrl !== undefined ? entry.imageUrl : (entry.avatar || existing.avatar || ''),
    imageUrl: entry.imageUrl !== undefined ? entry.imageUrl : (entry.avatar || existing.imageUrl || ''),
    socialLink: entry.socialLink !== undefined ? entry.socialLink : (entry.social || existing.socialLink || ''),
    social: entry.socialLink !== undefined ? entry.socialLink : (entry.social || existing.social || ''),
    facebook: entry.facebook !== undefined ? entry.facebook : (existing.facebook || ''),
    instagram: entry.instagram !== undefined ? entry.instagram : (existing.instagram || ''),
    tiktok: entry.tiktok !== undefined ? entry.tiktok : (existing.tiktok || ''),
    kick: entry.kick !== undefined ? entry.kick : (existing.kick || ''),
    youtube: entry.youtube !== undefined ? entry.youtube : (existing.youtube || ''),
    profileEmail: entry.profileEmail !== undefined ? entry.profileEmail.trim().toLowerCase() : (existing.profileEmail || ''),
    avatarFb: entry.avatarFb !== undefined ? entry.avatarFb : (existing.avatarFb || ''),
    avatarIg: entry.avatarIg !== undefined ? entry.avatarIg : (existing.avatarIg || ''),
    avatarTt: entry.avatarTt !== undefined ? entry.avatarTt : (existing.avatarTt || '')
  };

  let newList = [];
  if (isEdit) {
    newList = current.map(item => item.id === entryId ? updatedEntry : item);
  } else {
    newList = [updatedEntry, ...current];
  }

  // Save to LocalStorage
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));

  // Sync to Firebase Realtime Database
  if (config.dbUrl && config.dbUrl.trim() !== '') {
    try {
      let url = `${config.dbUrl.replace(/\/$/, '')}/roster.json`;
      if (config.secretToken) url += `?auth=${config.secretToken}`;
      
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList)
      });
    } catch (err) {
      console.error('Firebase save failed:', err);
    }
  }

  return newList;
};

// Delete Entry
export const deleteRosterEntry = async (id) => {
  const current = await fetchRosterEntries();
  const newList = current.filter(item => String(item.id) !== String(id) && item.name !== id);
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));

  const config = getFirebaseConfig();
  if (config.dbUrl && config.dbUrl.trim() !== '') {
    try {
      let url = `${config.dbUrl.replace(/\/$/, '')}/roster.json`;
      if (config.secretToken) url += `?auth=${config.secretToken}`;
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList)
      });
    } catch (err) {
      console.error('Firebase delete error:', err);
    }
  }

  return newList;
};

// Helper: Roblox Headshot Thumbnail URL
export const getRobloxAvatarUrl = (robloxId) => {
  if (!robloxId || robloxId === '0') {
    return 'https://tr.rbxcdn.com/30day-avatar-headshot-default';
  }
  return `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxId}&width=150&height=150&format=png`;
};
