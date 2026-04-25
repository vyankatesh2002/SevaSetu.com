// Service Layer — API communication with JWT auth

const API_URL = 'http://localhost:5000/api/complaints';
const AUTH_URL = 'http://localhost:5000/api/auth';

// ─── TOKEN HELPERS ───
function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── AUTH ───
export async function registerUser({ name, email, password }) {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return res.json();
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export function logoutUser() {
  localStorage.removeItem('token');
}

export function isLoggedIn() {
  return !!getToken();
}

// ─── COMPLAINTS ───
export async function fetchComplaints() {
  const res = await fetch(API_URL, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch complaints');
  return res.json();
}

export async function createComplaint(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create complaint');
  return res.json();
}

export async function updateStatus(id, status) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function deleteComplaint(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete complaint');
  return res.json();
}

