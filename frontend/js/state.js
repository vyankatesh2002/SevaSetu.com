// State Layer — Single source of truth for application data

export const state = {
  complaints: [],
  officers: [],
  filters: {
    status: 'all',
    severity: 'all',
    search: ''
  },
  nextId: 1001
};

export function setComplaints(data) {
  state.complaints = data;
}

export function addComplaint(c) {
  state.complaints.unshift(c);
}

export function updateComplaint(id, updater) {
  const idx = state.complaints.findIndex(c => c.id === id);
  if (idx !== -1) {
    const updated = { ...state.complaints[idx], ...updater, updatedAt: Date.now() };
    state.complaints[idx] = updated;
    return updated;
  }
  return null;
}

export function setOfficers(data) {
  state.officers = data;
}

export function updateOfficer(id, updater) {
  const idx = state.officers.findIndex(o => o.id === id);
  if (idx !== -1) {
    state.officers[idx] = { ...state.officers[idx], ...updater };
    return state.officers[idx];
  }
  return null;
}

export function setFilter(key, value) {
  state.filters[key] = value;
}

export function getNextId() {
  return 'C' + state.nextId++;
}

