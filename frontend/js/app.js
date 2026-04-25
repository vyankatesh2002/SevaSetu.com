// Main Entry — Real backend integration with JWT auth + Socket.IO live updates

import { state, setComplaints, setOfficers } from './state.js';
import { renderAll, bindComplaintClicks, updateLiveTime } from './ui.js';
import { initMap, renderMarkers } from './map.js';
import { fetchComplaints, createComplaint, updateStatus, loginUser, logoutUser, isLoggedIn } from './api.js';

const API_URL = 'http://localhost:5000/api/complaints';
let socket = null;

// ─── TOAST NOTIFICATION ───
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    background: #1e293b; color: #fff; padding: 1rem 1.5rem;
    border-radius: 8px; border-left: 4px solid #38bdf8;
    z-index: 10000; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ─── AUTH UI ───
function showLoginForm() {
  if (document.getElementById('authPanel')) return;

  const panel = document.createElement('div');
  panel.id = 'authPanel';
  panel.innerHTML = `
    <div id="loginForm" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;">
      <div style="background:#1e293b;padding:2rem;border-radius:12px;width:320px;">
        <h2 style="color:#fff;margin-bottom:1rem;">CIP Login</h2>
        <input type="email" id="loginEmail" placeholder="Email" style="width:100%;padding:0.5rem;margin-bottom:0.5rem;border-radius:6px;border:none;" />
        <input type="password" id="loginPassword" placeholder="Password" style="width:100%;padding:0.5rem;margin-bottom:1rem;border-radius:6px;border:none;" />
        <button id="doLogin" style="width:100%;padding:0.5rem;background:#38bdf8;border:none;border-radius:6px;color:#0f172a;font-weight:bold;cursor:pointer;">Login</button>
        <p id="loginError" style="color:#ef4444;margin-top:0.5rem;font-size:0.85rem;"></p>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  document.getElementById('doLogin').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');

    try {
      const data = await loginUser({ email, password });
      if (data.token) {
        panel.remove();
        initApp();
      } else {
        errEl.textContent = data.msg || 'Login failed';
      }
    } catch (e) {
      errEl.textContent = 'Network error';
    }
  });
}

// ─── SOCKET.IO ───
function initSocket() {
  socket = io('http://localhost:5000');

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('complaintCreated', (data) => {
    console.log('📨 New complaint received:', data);
    showToast(`New complaint: ${data.category || 'Unknown'} - ${data.status || 'NEW'}`);
    loadComplaints();
  });

  socket.on('complaintUpdated', (data) => {
    console.log('🔄 Complaint updated:', data);
    showToast(`Updated: ${data.category || 'Complaint'} → ${data.status}`);
    loadComplaints();
  });

  socket.on('complaintDeleted', (data) => {
    console.log('🗑️ Complaint deleted:', data);
    showToast('Complaint deleted');
    loadComplaints();
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });
}

// ─── FETCH ───
async function loadComplaints() {
  try {
    const data = await fetchComplaints();
    setComplaints(data);
    renderAll();
    renderMarkers(state.complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    if (err.message.includes('401')) {
      logoutUser();
      showLoginForm();
    }
  }
}

// ─── SUBMIT ───
async function submitComplaint() {
  const name = document.getElementById('citizenName')?.value.trim();
  const category = document.getElementById('complaintCategory')?.value;
  const location = document.getElementById('locationInput')?.value.trim();
  const description = document.getElementById('descriptionInput')?.value.trim();

  if (!name || !category || !location) {
    alert('Fill all required fields');
    return;
  }

  try {
    await createComplaint({ name, category, location, description });
    document.getElementById('citizenName').value = '';
    document.getElementById('complaintCategory').value = '';
    document.getElementById('locationInput').value = '';
    document.getElementById('descriptionInput').value = '';
    loadComplaints();
  } catch (err) {
    console.error('Error submitting complaint:', err);
    alert('Failed to submit complaint');
  }
}

// ─── CLICK HANDLER ───
async function handleComplaintClick(id) {
  const c = state.complaints.find(x => x._id === id || x.id === id);
  if (!c) return;

  const complaintId = c._id || c.id;

  if (c.status === 'ASSIGNED') {
    await updateStatus(complaintId, 'IN PROGRESS');
    loadComplaints();
  } else if (c.status === 'IN PROGRESS') {
    await updateStatus(complaintId, 'RESOLVED');
    loadComplaints();
  }
}

// ─── INIT ───
async function initApp() {
  initSocket();
  await loadComplaints();
  initMap();
  renderMarkers(state.complaints);

  // Bind submit button
  const btn = document.getElementById('submitComplaintBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      submitComplaint();
    });
  }

  // Bind complaint card clicks
  bindComplaintClicks(handleComplaintClick);

  // Live clock
  setInterval(updateLiveTime, 1000);
  updateLiveTime();

  console.log('CIP System Initialized (Auth + Real-time Mode)');
}

window.onload = () => {
  if (isLoggedIn()) {
    initApp();
  } else {
    showLoginForm();
  }
};

