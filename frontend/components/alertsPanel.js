// Alerts Panel Component

export function AlertsPanel(complaints) {
  const highPriority = complaints.filter(c => c.severity === 'high' && c.status !== 'RESOLVED');
  const unassigned = complaints.filter(c => !c.officer && c.status === 'NEW');

  let alerts = [];

  if (highPriority.length > 0) {
    alerts.push(`<div class="alert-item alert-high">🔴 ${highPriority.length} high priority complaint(s) pending</div>`);
  }

  if (unassigned.length > 0) {
    alerts.push(`<div class="alert-item alert-warn">⚠️ ${unassigned.length} complaint(s) unassigned</div>`);
  }

  if (alerts.length === 0) {
    alerts.push(`<div class="alert-item alert-ok">✅ All clear</div>`);
  }

  return alerts.join('');
}

