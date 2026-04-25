// Complaint Card Component

export function ComplaintCard(c) {
  const statusColors = {
    'NEW': '#94a3b8',
    'ASSIGNED': '#38bdf8',
    'IN PROGRESS': '#f59e0b',
    'RESOLVED': '#22c55e',
    'ESCALATED': '#ef4444'
  };

  const severityColors = {
    'high': '#ef4444',
    'medium': '#f59e0b',
    'low': '#22c55e'
  };

  const complaintId = c._id || c.id;
  const severity = c.severity || 'low';
  const tags = c.tags || [];

  return `
    <div class="complaint-card ${c.status === 'ESCALATED' ? 'escalated' : ''}" data-id="${complaintId}">
      <div class="card-header">
        <strong>${complaintId.toString().slice(-6)}</strong>
        <div class="badges">
          <span class="severity-badge" style="background:${severityColors[severity] || '#94a3b8'}20;color:${severityColors[severity] || '#94a3b8'}">${severity}</span>
          <span class="status-badge" style="color:${statusColors[c.status] || '#94a3b8'}">${c.status}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-row">📁 ${c.category}</div>
        <div class="card-row">📍 ${c.location}</div>
        <div class="card-row">👤 ${c.name}</div>
        <div class="card-row">👨‍💼 ${c.officer || 'Unassigned'}</div>
        ${c.description ? `<div class="card-row text-secondary">${c.description}</div>` : ''}
        ${tags.length > 0 ? `<div class="card-tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
        ${c.escalationReason ? `<div class="escalation-banner">🚨 ${c.escalationReason}</div>` : ''}
      </div>
    </div>
  `;
}

