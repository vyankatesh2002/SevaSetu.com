/* ============================================================
   SevaSetu - UI Helpers (ui.js)
   ------------------------------------------------------------
   Reusable rendering helpers: status badges, timelines,
   empty states, formatting, and report builders.
   Keeps the existing SevaSetu visual identity (Bootstrap badges,
   timeline dots, etc.).
   ============================================================ */

(function () {
    'use strict';

    // ---------- Status badge ----------
    // status: one of the controlled statuses
    function statusBadge(status) {
        var label = (window.SVS && SVS.STATUS_LABELS[status]) || String(status || '').replace(/_/g, ' ');
        var cls = (window.SVS && SVS.STATUS_BADGE_CLASS[status]) || 'bg-secondary';
        return '<span class="badge ' + cls + '">' + label + '</span>';
    }

    // ---------- Priority badge ----------
    function priorityBadge(priority) {
        var p = (priority || 'Medium').toLowerCase();
        var cls = p === 'critical' || p === 'high' ? 'bg-danger' : (p === 'medium' ? 'bg-warning text-dark' : 'bg-success');
        return '<span class="badge ' + cls + '">' + (priority || 'Medium') + '</span>';
    }

    // ---------- Timeline renderer ----------
    // comp: complaint object with .timeline array
    function renderTimeline(comp, container) {
        if (!container) return;
        if (!comp.timeline || comp.timeline.length === 0) {
            container.innerHTML = '<p class="text-muted">No timeline yet.</p>';
            return;
        }
        var html = '';
        comp.timeline.forEach(function (step) {
            var completed = true;
            html += '<div class="timeline-step"><div class="timeline-dot completed"></div>' +
                '<strong>' + (step.label || step.status) + '</strong>' +
                '<div style="font-size:0.8rem;color:#64748b">' + formatDate(step.date) + ' · ' + (step.actor || '') +
                (step.remark ? ' <em>' + step.remark + '</em>' : '') + '</div></div>';
        });
        container.innerHTML = html;
    }

    // ---------- Empty state ----------
    function emptyState(message) {
        return '<div class="empty-state" style="text-align:center;padding:40px;color:#64748b;">' +
            '<i class="bi bi-inbox" style="font-size:3rem;opacity:.3;display:block;margin-bottom:10px;"></i>' +
            '<p>' + (message || 'No data available.') + '</p></div>';
    }

    // ---------- Date formatting ----------
    function formatDate(iso) {
        if (!iso) return '--';
        var d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        var opts = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return d.toLocaleString('en-IN', opts);
    }

    function formatDateOnly(iso) {
        if (!iso) return '--';
        var d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // ---------- SLA deadline display + status ----------
    function slaInfo(comp) {
        if (!comp || !comp.slaDeadline) return { text: '--', cls: 'text-muted' };
        if (window.SVSCOMPLAINTS && SVSCOMPLAINTS.isSlaBreached(comp)) {
            return { text: '⚠️ Breached · ' + formatDate(comp.slaDeadline), cls: 'text-danger fw-bold' };
        }
        return { text: formatDate(comp.slaDeadline), cls: 'text-muted' };
    }

    // ---------- CSV export helper ----------
    function exportToCSV(filename, headers, rows) {
        var csv = [headers.join(',')].concat(rows.map(function (r) {
            return r.map(function (cell) {
                var s = String(cell == null ? '' : cell);
                if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
                    return '"' + s.replace(/"/g, '""') + '"';
                }
                return s;
            }).join(',');
        })).join('\n');
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename || 'sevasetu-export.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    // ---------- Simple toast fallback (uses existing showToast if present) ----------
    function toast(msg) {
        if (typeof showToast === 'function') { showToast(msg); return; }
        alert(msg);
    }

    window.SVSUI = {
        statusBadge: statusBadge,
        priorityBadge: priorityBadge,
        renderTimeline: renderTimeline,
        emptyState: emptyState,
        formatDate: formatDate,
        formatDateOnly: formatDateOnly,
        slaInfo: slaInfo,
        exportToCSV: exportToCSV,
        toast: toast
    };
})();
