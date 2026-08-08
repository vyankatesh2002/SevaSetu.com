/* ============================================================
   SevaSetu - Dashboard JS (dashboard.js)
   Shared dashboard rendering helpers for stats, charts and
   officer dashboard functionality.
   ============================================================ */

// ------------------------------------------------------------
// Officer Dashboard (SPA page-toggle version)
// ------------------------------------------------------------
function officerDashboardInit() {
    const statsEl = document.getElementById('statsRow');
    const tbodyEl = document.getElementById('dashboardTableBody');
    if (!statsEl && !tbodyEl) return; // not on officer dashboard

    const complaints = (typeof getComplaints === 'function') ? getComplaints() : [];

    function renderDashboard() {
        if (statsEl) {
            const total = complaints.length;
            const pending = complaints.filter(function (c) { return c.status === 'pending'; }).length;
            const resolved = complaints.filter(function (c) { return c.status === 'resolved'; }).length;
            const escalated = complaints.filter(function (c) { return c.status === 'escalated'; }).length;
            statsEl.innerHTML =
                '<div class="stat-card accent"><div class="num">' + total + '</div><div class="label">Total</div></div>' +
                '<div class="stat-card warning"><div class="num">' + pending + '</div><div class="label">Pending</div></div>' +
                '<div class="stat-card success"><div class="num">' + resolved + '</div><div class="label">Resolved</div></div>' +
                '<div class="stat-card danger"><div class="num">' + escalated + '</div><div class="label">Escalated</div></div>';
        }
        if (tbodyEl) {
            tbodyEl.innerHTML = '';
            complaints.forEach(function (comp) {
                const statusClass = {
                    pending: 'bg-warning text-dark', in_progress: 'bg-primary', resolved: 'bg-success', escalated: 'bg-danger'
                }[comp.status];
                let actions = '';
                if (comp.status === 'pending') {
                    actions = '<button class="btn-sm btn-success-sm" onclick="quickAccept(\'' + comp.id + '\')">Accept</button>' +
                        '<button class="btn-sm btn-danger-sm" onclick="quickReject(\'' + comp.id + '\')">Reject</button>';
                } else if (comp.status === 'in_progress') {
                    actions = '<button class="btn-sm" onclick="alert(\'View details\')">View</button>';
                } else {
                    actions = '<button class="btn-sm" onclick="alert(\'View details\')">View</button>';
                }
                const row = document.createElement('tr');
                row.innerHTML =
                    '<td><strong>#' + comp.id + '</strong></td>' +
                    '<td>' + comp.subject + '</td>' +
                    '<td><span class="badge bg-' + (comp.priority === 'High' ? 'danger' : comp.priority === 'Medium' ? 'warning' : 'success') + '">' + comp.priority + '</span></td>' +
                    '<td><span class="badge ' + statusClass + '">' + comp.status.replace('_', ' ').toUpperCase() + '</span></td>' +
                    '<td>' + comp.deadline + '</td>' +
                    '<td>' + actions + '</td>';
                tbodyEl.appendChild(row);
            });
        }
    }

    window.quickAccept = function (id) {
        const idx = complaints.findIndex(function (c) { return c.id === id; });
        if (idx !== -1 && complaints[idx].status === 'pending') {
            complaints[idx].status = 'in_progress';
            saveComplaints(complaints);
            renderDashboard();
            updateSidebarBadge();
        }
    };

    window.quickReject = function (id) {
        const reason = prompt('Reason:');
        if (!reason) return;
        const idx = complaints.findIndex(function (c) { return c.id === id; });
        if (idx !== -1) {
            complaints[idx].status = 'rejected';
            complaints[idx].remark = reason;
            saveComplaints(complaints);
            renderDashboard();
            updateSidebarBadge();
        }
    };

    function updateSidebarBadge() {
        const badge = document.getElementById('sidebarBadge');
        if (!badge) return;
        const pending = complaints.filter(function (c) { return c.status === 'pending'; }).length;
        badge.textContent = pending;
    }

    renderDashboard();
    updateSidebarBadge();
}

// Top-level page navigation for multi-page dashboards
function showPage(pageId, btn) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    const target = document.getElementById(pageId + 'Page');
    if (target) target.classList.add('active');
    document.querySelectorAll('.sidebar .nav-link').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.sidebar .nav-link').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    // Refresh page-specific content
    if (window.populateUploadSelect) window.populateUploadSelect();
    if (window.populateGpsSelect) window.populateGpsSelect();
    if (window.populateEscalateSelect) window.populateEscalateSelect();
    if (window.updateSidebarBadge) window.updateSidebarBadge();
}

// Expose for inline onclick
window.showPage = showPage;

// Init dashboard on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('dashboardTableBody') || document.getElementById('statsRow')) {
        officerDashboardInit();
    }
});
