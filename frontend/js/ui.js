// UI Layer — All DOM rendering lives here

import { state } from './state.js';
import { ComplaintCard } from '../components/complaintCard.js';
import { OfficerCard } from '../components/officerCard.js';
import { StatsBar } from '../components/statsBar.js';
import { AlertsPanel } from '../components/alertsPanel.js';

export function renderComplaints() {
  const container = document.getElementById('complaintsList');
  if (!container) return;

  if (state.complaints.length === 0) {
    container.innerHTML = '<p class="empty-text">No complaints yet</p>';
    return;
  }

  container.innerHTML = state.complaints.map(c => ComplaintCard(c)).join('');
}

export function renderOfficers() {
  const container = document.getElementById('officersList');
  if (!container) return;

  container.innerHTML = state.officers.map(o => OfficerCard(o)).join('');
}

export function renderStats() {
  const container = document.querySelector('.stats-section');
  if (!container) return;

  container.innerHTML = `<div class="card">${StatsBar(state.complaints)}</div>`;
}

export function renderAlerts() {
  const container = document.querySelector('.alerts-list');
  if (!container) return;

  container.innerHTML = AlertsPanel(state.complaints);
}

export function renderAll() {
  renderStats();
  renderComplaints();
  renderOfficers();
  renderAlerts();
}

export function bindComplaintClicks(handler) {
  const container = document.getElementById('complaintsList');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const card = e.target.closest('.complaint-card');
    if (card) {
      const id = card.getAttribute('data-id');
      if (id) handler(id);
    }
  });
}

export function bindFormSubmit(handler) {
  const btn = document.getElementById('submitComplaintBtn');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    const name = document.getElementById('citizenName')?.value.trim();
    const category = document.getElementById('complaintCategory')?.value;
    const location = document.getElementById('locationInput')?.value.trim();
    const description = document.getElementById('descriptionInput')?.value.trim();

    if (!name || !category || !location) {
      alert('Fill all required fields');
      return;
    }

    handler({ name, category, location, description });

    // Reset form
    document.getElementById('citizenName').value = '';
    document.getElementById('locationInput').value = '';
    document.getElementById('descriptionInput').value = '';
    document.getElementById('complaintCategory').value = '';
  });
}

export function updateLiveTime() {
  const el = document.getElementById('liveTime');
  if (el) {
    el.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false });
  }
}
