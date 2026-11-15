// Join Request Service — stores pending member join requests
// Powered by Firebase Realtime Database with local cache fallback.

import { getFirebaseConfig, DEFAULT_FIREBASE_URL, DEFAULT_FIREBASE_SECRET } from './firebaseService';

const JOIN_REQUESTS_KEY = 'diffsnow_join_requests';

// Get all cached join requests
export const getJoinRequests = () => {
  try {
    const saved = localStorage.getItem(JOIN_REQUESTS_KEY);
    const list = saved ? JSON.parse(saved) : [];
    return Array.isArray(list) ? list.filter(r => r && r.id) : [];
  } catch {
    return [];
  }
};

// Fetch join requests directly from Firebase Realtime Database
export const fetchJoinRequests = async () => {
  const config = getFirebaseConfig();
  const localRequests = getJoinRequests();

  const dbUrl = config?.dbUrl || DEFAULT_FIREBASE_URL;
  const token = config?.secretToken || DEFAULT_FIREBASE_SECRET;

  if (!dbUrl?.trim()) return localRequests;

  try {
    let url = `${dbUrl.replace(/\/$/, '')}/joinRequests.json?auth=${token}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Firebase joinRequests fetch warning (${response.status})`);
      return localRequests;
    }
    const data = await response.json();
    const rawList = data ? Object.values(data) : [];
    // Only return active pending requests
    const requests = rawList.filter(r => r && r.id && r.status === 'pending');
    requests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    // Save to local cache silently (without triggering event loop)
    try {
      localStorage.setItem(JOIN_REQUESTS_KEY, JSON.stringify(requests));
      // Clean up legacy deleted ids key if present
      localStorage.removeItem('diffsnow_deleted_requests');
    } catch {}

    return requests;
  } catch (err) {
    console.warn('fetchJoinRequests fallback to local:', err);
    return localRequests;
  }
};

// Submit a new join request from public page
export const submitJoinRequest = async (data) => {
  const avatarUrl = data.imageUrl || data.avatar || '';
  const newRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending', // 'pending' | 'accepted' | 'rejected'
    submittedAt: new Date().toISOString(),
    name: data.facebookName || '',
    facebookName: data.facebookName || '',
    facebookUrl: data.facebookUrl || '',
    imageUrl: avatarUrl,
    avatar: avatarUrl,
    note: data.note || '',
    rejectedReason: ''
  };

  // Save locally first
  const requests = getJoinRequests();
  const nextList = [newRequest, ...requests.filter(r => r.id !== newRequest.id)];
  try {
    localStorage.setItem(JOIN_REQUESTS_KEY, JSON.stringify(nextList));
  } catch {}

  // Sync to Firebase
  await _syncToFirebase(newRequest);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('diffsnow_requests_updated'));
  }

  return newRequest;
};

// Admin: Accept a request — returns the created member object
export const acceptJoinRequest = async (requestId, rankOrder = '4', customRole = '') => {
  let requests = getJoinRequests();
  let req = requests.find(r => r.id === requestId);
  
  if (!req) {
    const fresh = await fetchJoinRequests();
    req = fresh.find(r => r.id === requestId);
    requests = fresh;
  }
  if (!req) return null;

  const resolvedRequest = {
    ...req,
    status: 'accepted',
    resolvedAt: new Date().toISOString()
  };

  const updated = requests.map(r => r.id === requestId ? resolvedRequest : r);
  try {
    localStorage.setItem(JOIN_REQUESTS_KEY, JSON.stringify(updated));
  } catch {}

  try {
    await _syncToFirebase(resolvedRequest);
  } catch (e) {
    console.warn('Firebase accept sync notice:', e);
  }

  const rankNumber = String(rankOrder || '4');
  const roleNames = {
    '1': 'Head',
    '2': 'Leader',
    '3': 'Supporter',
    '4': 'Member'
  };
  const role = customRole?.trim() || roleNames[rankNumber] || 'Member';

  const memberEntry = {
    id: `mem-${Date.now()}`,
    name: req.facebookName || req.name || 'Unknown',
    username: req.facebookName || req.name || 'Unknown',
    role: role,
    status: role.toLowerCase(),
    rankOrder: rankNumber,
    facebook: req.facebookUrl || '',
    socialLink: req.facebookUrl || '',
    social: req.facebookUrl || '',
    avatar: req.imageUrl || req.avatar || '/asset/LOGO DIFFSNOW.png',
    imageUrl: req.imageUrl || req.avatar || '/asset/LOGO DIFFSNOW.png',
    facebookName: req.facebookName || req.name || '',
    fromRequest: requestId,
    joinedAt: new Date().toISOString()
  };

  return memberEntry;
};

// Admin: Reject a request (deletes it locally and from Firebase)
export const rejectJoinRequest = async (requestId, reason) => {
  return deleteJoinRequest(requestId);
};

// Admin: Delete a request (removes locally and from Firebase)
export const deleteJoinRequest = async (requestId) => {
  const requests = getJoinRequests();
  const updated = requests.filter(r => r.id !== requestId);
  try {
    localStorage.setItem(JOIN_REQUESTS_KEY, JSON.stringify(updated));
  } catch {}

  try {
    await _deleteFromFirebase(requestId);
  } catch (err) {
    console.warn('Firebase delete notice:', err);
  }
  return updated;
};

// Sync a single request to Firebase
const _syncToFirebase = async (request) => {
  const config = getFirebaseConfig();
  const dbUrl = config?.dbUrl || DEFAULT_FIREBASE_URL;
  const token = config?.secretToken || DEFAULT_FIREBASE_SECRET;
  if (!dbUrl?.trim()) return;

  let url = `${dbUrl.replace(/\/$/, '')}/joinRequests/${request.id}.json?auth=${token}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403 || data?.error?.toLowerCase?.().includes('permission denied')) {
      throw new Error('FIREBASE_PERMISSION_DENIED');
    }
    throw new Error(`Unable to sync join request: ${response.status}`);
  }
};

// Delete a single request from Firebase
const _deleteFromFirebase = async (requestId) => {
  const config = getFirebaseConfig();
  const dbUrl = config?.dbUrl || DEFAULT_FIREBASE_URL;
  const token = config?.secretToken || DEFAULT_FIREBASE_SECRET;
  if (!dbUrl?.trim()) return;

  let url = `${dbUrl.replace(/\/$/, '')}/joinRequests/${requestId}.json?auth=${token}`;
  try {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      console.warn(`Could not delete request ${requestId} on Firebase (${response.status})`);
    }
  } catch (e) {
    console.warn('Firebase delete network error:', e);
  }
};
