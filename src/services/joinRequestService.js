// Join Request Service — stores pending member join requests
// Uses localStorage as primary store; Firebase sync if configured.

import { getFirebaseConfig } from './firebaseService';

const JOIN_REQUESTS_KEY = 'diffsnow_join_requests';
const DELETED_REQUESTS_KEY = 'diffsnow_deleted_requests';

// Get list of request IDs deleted by the admin so they never reappear
const getDeletedRequestIds = () => {
  try {
    const saved = localStorage.getItem(DELETED_REQUESTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const markRequestDeleted = (id) => {
  try {
    const list = getDeletedRequestIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_REQUESTS_KEY, JSON.stringify(list.slice(-200)));
    }
  } catch {}
};

// Get all join requests
export const getJoinRequests = () => {
  try {
    const deletedIds = getDeletedRequestIds();
    const saved = localStorage.getItem(JOIN_REQUESTS_KEY);
    const list = saved ? JSON.parse(saved) : [];
    return Array.isArray(list) ? list.filter(r => r && r.id && !deletedIds.includes(r.id)) : [];
  } catch {
    return [];
  }
};

// Shared source of truth for administrators. Requests must never rely on the
// submitter's browser storage, because that storage is private to their device.
export const fetchJoinRequests = async () => {
  const config = getFirebaseConfig();
  const deletedIds = getDeletedRequestIds();
  const localRequests = getJoinRequests();

  if (!config?.dbUrl?.trim()) return localRequests;

  try {
    let url = `${config.dbUrl.replace(/\/$/, '')}/joinRequests.json`;
    if (config.secretToken) url += `?auth=${config.secretToken}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Unable to load join requests');
    const data = await response.json();
    const rawList = data ? Object.values(data) : [];
    const requests = rawList.filter(r => r && r.id && !deletedIds.includes(r.id));
    requests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    _saveAll(requests);
    return requests;
  } catch {
    return localRequests;
  }
};

// Save all requests (internal)
const _saveAll = (requests) => {
  const deletedIds = getDeletedRequestIds();
  const cleaned = (Array.isArray(requests) ? requests : []).filter(r => r && r.id && !deletedIds.includes(r.id));
  localStorage.setItem(JOIN_REQUESTS_KEY, JSON.stringify(cleaned));
  // Dispatch event so Admin tab can react in real-time
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('diffsnow_requests_updated'));
    window.dispatchEvent(new Event('sameweknow_requests_updated'));
  }
};

// Submit a new join request from public page
export const submitJoinRequest = async (data) => {
  const avatarUrl = data.imageUrl || data.avatar || '';
  const newRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending',         // 'pending' | 'accepted' | 'rejected'
    submittedAt: new Date().toISOString(),
    // Facebook name is the single source of the public display name.
    name: data.facebookName || '',
    facebookName: data.facebookName || '',
    facebookUrl: data.facebookUrl || '',
    imageUrl: avatarUrl,
    avatar: avatarUrl,
    note: data.note || '',
    rejectedReason: ''
  };

  // Always save locally first so request is never lost
  const requests = getJoinRequests();
  _saveAll([newRequest, ...requests.filter(request => request.id !== newRequest.id)]);

  // Sync to Firebase (required so administrators on other devices can see it)
  await _syncToFirebase(newRequest);

  return newRequest;
};

// Admin: Accept a request — returns the created member object
export const acceptJoinRequest = async (requestId, rankOrder = '4', customRole = '') => {
  const requests = getJoinRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) return null;

  const updated = requests.map(r =>
    r.id === requestId ? { ...r, status: 'accepted', resolvedAt: new Date().toISOString() } : r
  );
  _saveAll(updated);
  const resolvedRequest = updated.find(r => r.id === requestId);
  try {
    await _syncToFirebase(resolvedRequest);
  } catch (e) {
    console.warn('Firebase accept sync notice (saved locally):', e);
  }

  const rankNumber = String(rankOrder || '4');
  const roleNames = {
    '1': 'Head',
    '2': 'Leader',
    '3': 'Supporter',
    '4': 'Member'
  };
  const role = customRole?.trim() || roleNames[rankNumber] || 'Member';

  // Build a roster entry from the request data
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

// Admin: Reject a request with reason
export const rejectJoinRequest = async (requestId, reason) => {
  const requests = getJoinRequests();
  const updated = requests.map(r =>
    r.id === requestId
      ? { ...r, status: 'rejected', rejectedReason: reason || '', resolvedAt: new Date().toISOString() }
      : r
  );
  _saveAll(updated);
  try {
    await _syncToFirebase(updated.find(r => r.id === requestId));
  } catch (e) {
    console.warn('Firebase reject sync notice (saved locally):', e);
  }
  return updated;
};

// Delete a request (clean up)
export const deleteJoinRequest = async (requestId) => {
  markRequestDeleted(requestId);
  const updated = getJoinRequests().filter(r => r.id !== requestId);
  _saveAll(updated);
  try {
    await _deleteFromFirebase(requestId);
  } catch (err) {
    console.warn('Firebase delete notice (removed locally):', err?.message || err);
  }
  return updated;
};

// Sync a single request to Firebase (best-effort)
const _syncToFirebase = async (request) => {
  const config = getFirebaseConfig();
  if (!config?.dbUrl?.trim()) return;
  let url = `${config.dbUrl.replace(/\/$/, '')}/joinRequests/${request.id}.json`;
  if (config.secretToken) url += `?auth=${config.secretToken}`;
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
    throw new Error('Unable to submit join request');
  }
};

const _deleteFromFirebase = async (requestId) => {
  const config = getFirebaseConfig();
  if (!config?.dbUrl?.trim()) return;
  let url = `${config.dbUrl.replace(/\/$/, '')}/joinRequests/${requestId}.json`;
  if (config.secretToken) url += `?auth=${config.secretToken}`;
  try {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      console.warn(`Could not delete request ${requestId} on Firebase (${response.status})`);
    }
  } catch (e) {
    console.warn('Firebase delete network error:', e);
  }
};

