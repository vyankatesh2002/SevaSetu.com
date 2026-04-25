import { state, setComplaints, setOfficers, getNextId } from './state.js';
import { renderAll, renderMarkers } from './ui.js';

const STORAGE_KEY = 'cip_complaints';
const OFFICERS_KEY = 'cip_officers';

export const fakeComplaints = [
  {
    name: 'Rahul Sharma',
    category: 'Theft',
    location: 'Pune Station',
    description: 'Mobile phone stolen from pocket while boarding train',
    status: 'ASSIGNED',
    severity: 'high',
    officer: 'O1',
    lat: 18.5293,
    lng: 73.8742,
    tags: ['theft']
  },
  {
    name: 'Priya Patil',
    category: 'Noise',
    location: 'Koregaon Park',
    description: 'Loud construction work after 10 PM every night',
    status: 'IN PROGRESS',
    severity: 'medium',
    officer: 'O2',
    lat: 18.5362,
    lng: 73.8939,
    tags: ['noise']
  },
  {
    name: 'Amit Kumar',
    category: 'Assault',
    location: 'Camp Area',
    description: 'Street fight reported near main market',
    status: 'NEW',
    severity: 'high',
    officer: null,
    lat: 18.5158,
    lng: 73.8762,
    tags: ['assault', 'violence']
  },
  {
    name: 'Sneha Desai',
    category: 'Fraud',
    location: 'Baner',
    description: 'Online scam via fake e-commerce website',
    status: 'RESOLVED',
    severity: 'medium',
    officer: 'O1',
    lat: 18.5590,
    lng: 73.7868,
    tags: ['fraud']
  },
  {
    name: 'Vikram Joshi',
    category: 'Traffic',
    location: 'Shivaji Nagar',
    description: 'Illegal parking blocking ambulance access',
    status: 'ASSIGNED',
    severity: 'medium',
    officer: 'O3',
    lat: 18.5314,
    lng: 73.8512,
    tags: ['traffic']
  },
  {
    name: 'Ananya Reddy',
    category: 'Other',
    location: 'Kothrud',
    description: 'Stray dog menace in residential colony',
    status: 'NEW',
    severity: 'low',
    officer: null,
    lat: 18.5043,
    lng: 73.8175,
    tags: []
  },
  {
    name: 'Nikhil Nair',
    category: 'Theft',
    location: 'Hinjewadi',
    description: 'Laptop stolen from parked car',
    status: 'IN PROGRESS',
    severity: 'high',
    officer: 'O2',
    lat: 18.5913,
    lng: 73.7389,
    tags: ['theft']
  },
  {
    name: 'Meera Iyer',
    category: 'Noise',
    location: 'Viman Nagar',
    description: 'Continuous loud music from neighboring apartment',
    status: 'RESOLVED',
    severity: 'low',
    officer: 'O1',
    lat: 18.5679,
    lng: 73.9143,
    tags: ['noise']
  }
];

export const defaultOfficers = [
  { id: 'O1', name: 'Officer Sharma', online: true, load: 3 },
  { id: 'O2', name: 'Officer Patil', online: true, load: 2 },
  { id: 'O3', name: 'Officer Gupta', online: false, load: 1 }
];

function storageLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function storageSave(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function seedFakeData() {
  const now = Date.now();
  const dayMs = 86400000;

  const complaints = fakeComplaints.map((c, i) => ({
    id: getNextId(),
    ...c,
    createdAt: now - (i * dayMs) - Math.floor(Math.random() * 3600000),
    updatedAt: now - (i * dayMs)
  }));

  const officers = [...defaultOfficers];

  storageSave(STORAGE_KEY, complaints);
  storageSave(OFFICERS_KEY, officers);

  setComplaints(complaints);
  setOfficers(officers);

  return { complaints, officers };
}

export function startSimulation() {
  // Check if we already have data in localStorage
  const storedComplaints = storageLoad(STORAGE_KEY, []);
  const storedOfficers = storageLoad(OFFICERS_KEY, []);

  if (storedComplaints.length > 0) {
    // Use existing localStorage data
    setComplaints(storedComplaints);
    setOfficers(storedOfficers.length > 0 ? storedOfficers : defaultOfficers);
    console.log('📦 Loaded', storedComplaints.length, 'complaints from localStorage');
  } else {
    // Seed fake data for first-time demo
    const data = seedFakeData();
    console.log('🎬 Simulation started with', data.complaints.length, 'fake complaints');
  }

  renderAll();
}

export function clearSimulation() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(OFFICERS_KEY);
  setComplaints([]);
  setOfficers([]);
  renderAll();
  console.log('🧹 Simulation data cleared');
}

