// Stats Bar Component

export function StatsBar(complaints) {
  const total = complaints.length;
  const newCount = complaints.filter(c => c.status === 'NEW').length;
  const assigned = complaints.filter(c => c.status === 'ASSIGNED').length;
  const inProgress = complaints.filter(c => c.status === 'IN PROGRESS').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;

  return `
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:#94a3b8">${newCount}</div>
        <div class="stat-label">New</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:#38bdf8">${assigned}</div>
        <div class="stat-label">Assigned</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:#f59e0b">${inProgress}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:#22c55e">${resolved}</div>
        <div class="stat-label">Resolved</div>
      </div>
    </div>
  `;
}

