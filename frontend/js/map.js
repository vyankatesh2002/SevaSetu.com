// Map Layer — Leaflet integration (ready for backend)

let map = null;
let markers = [];

export function initMap(containerId = 'map', lat = 20, lng = 73.8, zoom = 11) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Map container #${containerId} not found`);
    return null;
  }

  // If Leaflet is available, initialize
  if (typeof L !== 'undefined') {
    map = L.map(containerId).setView([lat, lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  } else {
    container.innerHTML = '<p class="empty-text">Map library not loaded</p>';
  }

  return map;
}

export function renderMarkers(complaints) {
  if (!map || typeof L === 'undefined') return;

  // Clear existing markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  complaints.forEach(c => {
    if (c.lat != null && c.lng != null) {
      const marker = L.marker([c.lat, c.lng]).addTo(map);
      marker.bindPopup(`<strong>${c.id}</strong><br>${c.category}<br>${c.location}`);
      markers.push(marker);
    }
  });
}

export function getMap() {
  return map;
}

