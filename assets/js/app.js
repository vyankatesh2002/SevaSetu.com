/* ============================================================
   SevaSetu - Global Application JS (app.js)
   Shared utilities, toast notifications, sidebar toggle and
   common helpers used across all pages.
   ============================================================ */

// ---------- Toast Notification ----------
function showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) {
        alert(msg);
        return;
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 2600);
}

// ---------- Sidebar Toggle (mobile) ----------
function toggleSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebarOverlay');
    if (!s) return;
    if (s.classList.contains('open')) {
        closeSidebar();
    } else {
        s.classList.add('open');
        if (o) o.classList.add('show');
    }
}

function closeSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebarOverlay');
    if (s) s.classList.remove('open');
    if (o) o.classList.remove('show');
}

// ---------- Generic helpers ----------
// Get URL query parameter
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Escape HTML to prevent injection
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Format a status string to Title Case for display
function statusLabel(status) {
    const map = {
        pending: 'Pending',
        in_progress: 'In Progress',
        escalated: 'Escalated',
        resolved: 'Resolved',
        rejected: 'Rejected',
        new: 'New'
    };
    return map[status] || status;
}

// Status badge CSS class
function statusBadgeClass(status) {
    const map = {
        pending: 'bg-warning text-dark',
        in_progress: 'bg-primary',
        escalated: 'bg-danger',
        resolved: 'bg-success',
        rejected: 'bg-secondary',
        new: 'bg-info'
    };
    return map[status] || 'bg-secondary';
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    // Wire up any element with data-toggle-sidebar
    document.querySelectorAll('[data-toggle-sidebar]').forEach(function (el) {
        el.addEventListener('click', toggleSidebar);
    });

    // Inject global SevaSetu nav on protected pages (body[data-guard])
    // unless the page opts out with data-no-global-nav
    if (document.body && document.body.getAttribute('data-guard') &&
        document.body.getAttribute('data-guard') !== 'public' &&
        !document.body.hasAttribute('data-no-global-nav')) {
        if (window.SVSAUTH) {
            SVSAUTH.injectGlobalNav();
        }
    }
});
