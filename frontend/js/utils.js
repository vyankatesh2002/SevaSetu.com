// Utility Helpers

export function generateId(prefix, counter) {
  return prefix + counter;
}

export function formatTime(ts) {
  if (!ts) return '--:--:--';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour12: false });
}

export function formatDate(ts) {
  if (!ts) return '--';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN');
}

export function getAvailableOfficer(officers) {
  const available = officers.filter(o => o.online);
  if (available.length === 0) return null;
  available.sort((a, b) => a.load - b.load);
  return available[0];
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

