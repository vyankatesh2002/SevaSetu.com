// Officer Card Component

export function OfficerCard(o) {
  const statusColor = o.online ? '#22c55e' : '#94a3b8';
  const statusText = o.online ? 'Online' : 'Offline';

  return `
    <div class="officer-row" data-id="${o.id}">
      <div class="officer-info">
        <span class="officer-name">${o.name}</span>
        <span class="officer-load">Load: ${o.load}</span>
      </div>
      <span class="officer-status" style="color:${statusColor}">${statusText}</span>
    </div>
  `;
}

