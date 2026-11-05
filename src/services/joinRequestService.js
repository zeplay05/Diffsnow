// Join Request Service — stores pending member join requests
// Uses localStorage as primary store; Firebase sync if configured.

import { getFirebaseConfig } from './firebaseService';

const JOIN_REQUESTS_KEY = 'diffsnow_join_requests';

// Get all join requests
export const getJoinRequests = () => {
  try {
    const saved = localStorage.getItem(JOIN_REQUESTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Shared source of truth for administrators.  Requests must never rely on the
// submitter's browser storage, because that storage is private to their device.
export const fetchJoinRequests = async () => {
  const config = getFirebaseConfig();
  if (!config?.dbUrl?.trim()) return getJoinRequests();

  try {
    let url = `${config.dbUrl.replace(/\/$/, '')}/joinRequests.json`;
    if (config.secretToken) url += `?auth=${config.secretToken}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Unable to load join requests');
    const data = await response.json();
    const requests = data ? Object.values(data) : [];
    requests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    _saveAll(requests);
    return requests;
  } catch {
    return getJoinRequests();
  }
};

// Save all requests (internal)
const _saveAll = (requests) => {
  localStorage.setItem(JOIN_REQUESTS_KEY, JSON.stringify(requests));
  // Dispatch event so Admin tab can react in real-time
  window.dispatchEvent(new Event('diffsnow_requests_updated'));
  window.dispatchEvent(new Event('sameweknow_requests_updated'));
};

// Submit a new join request from public page
export const submitJoinRequest = async (data) => {
  const newRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending',         // 'pending' | 'accepted' | 'rejected'
    submittedAt: new Date().toISOString(),
    // Facebook name is the single source of the public display name.
    name: data.facebookName || '',
    facebookName: data.facebookName || '',
    facebookUrl: data.facebookUrl || '',
    note: data.note || '',
    rejectedReason: ''
  };
  // Do not report success until the shared database accepts the request.
  await _syncToFirebase(newRequest);
  const requests = getJoinRequests();
  _saveAll([newRequest, ...requests.filter(request => request.id !== newRequest.id)]);
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
  await _syncToFirebase(resolvedRequest);

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
    name: req.facebookName || 'Unknown',
    username: req.facebookName || 'Unknown',
    role: role,
    status: role.toLowerCase(),
    rankOrder: rankNumber,
    facebook: req.facebookUrl || '',
    socialLink: req.facebookUrl || '',
    social: req.facebookUrl || '',
    avatar: '',
    imageUrl: '',
    facebookName: req.facebookName || '',
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
  await _syncToFirebase(updated.find(r => r.id === requestId));
  return updated;
};

// Delete a request (clean up)
export const deleteJoinRequest = async (requestId) => {
  const updated = getJoinRequests().filter(r => r.id !== requestId);
  await _deleteFromFirebase(requestId);
  _saveAll(updated);
  return updated;
};

// Sync a single request to Firebase (best-effort)
const _syncToFirebase = async (request) => {
  const config = getFirebaseConfig();
  if (!config?.dbUrl?.trim()) throw new Error('Firebase is not configured');
  let url = `${config.dbUrl.replace(/\/$/, '')}/joinRequests/${request.id}.json`;
  if (config.secretToken) url += `?auth=${config.secretToken}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!response.ok) throw new Error('Unable to submit join request');
};

const _deleteFromFirebase = async (requestId) => {
  const config = getFirebaseConfig();
  if (!config?.dbUrl?.trim()) throw new Error('Firebase is not configured');
  let url = `${config.dbUrl.replace(/\/$/, '')}/joinRequests/${requestId}.json`;
  if (config.secretToken) url += `?auth=${config.secretToken}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) throw new Error('Unable to delete join request');
};

