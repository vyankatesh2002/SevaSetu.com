/* ============================================================
   SevaSetu - Complaint JS (complaint.js)
   Shared complaint data handling, localStorage helpers and
   status utilities used across citizen & officer modules.
   ============================================================ */

const COMPLAINTS_KEY = 'officer_complaints';

// Get complaints from localStorage, seeding with demo data if empty
function getComplaints() {
    let data = localStorage.getItem(COMPLAINTS_KEY);
    if (data) {
        try { return JSON.parse(data); } catch (e) { /* fallthrough */ }
    }
    const initial = [
        { id: 'CMP-20101', subject: 'Water leakage in main street', category: 'Water Supply', priority: 'High', status: 'pending', deadline: '12 Aug 2026' },
        { id: 'CMP-20090', subject: 'Sewage overflow in colony', category: 'Sewage', priority: 'Medium', status: 'in_progress', deadline: '15 Aug 2026' },
        { id: 'CMP-20200', subject: 'No water supply in colony', category: 'Water Supply', priority: 'High', status: 'pending', deadline: '11 Aug 2026' },
        { id: 'CMP-20085', subject: 'Leaking pipe near temple', category: 'Water Supply', priority: 'Low', status: 'resolved', deadline: '5 Aug 2026' }
    ];
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(initial));
    return initial;
}

function saveComplaints(arr) {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(arr));
}

function saveComplaint(comp) {
    const arr = getComplaints();
    const idx = arr.findIndex(function (c) { return c.id === comp.id; });
    if (idx !== -1) arr[idx] = comp;
    else arr.push(comp);
    saveComplaints(arr);
}

function findComplaint(id) {
    return getComplaints().find(function (c) { return c.id === id; }) || null;
}

// Set a complaint status and optionally remark
function setComplaintStatus(id, status, remark) {
    const arr = getComplaints();
    const idx = arr.findIndex(function (c) { return c.id === id; });
    if (idx !== -1) {
        arr[idx].status = status;
        if (remark !== undefined) arr[idx].remark = remark;
        saveComplaints(arr);
        return true;
    }
    return false;
}

// Get complaints filtered by status
function getComplaintsByStatus(status) {
    return getComplaints().filter(function (c) { return c.status === status; });
}

// Complaint status badge HTML (bootstrap)
function statusBadge(status) {
    const map = {
        pending: 'bg-warning text-dark',
        in_progress: 'bg-primary',
        escalated: 'bg-danger',
        resolved: 'bg-success',
        rejected: 'bg-secondary',
        new: 'bg-info'
    };
    const labels = {
        pending: 'Pending', in_progress: 'In Progress', escalated: 'Escalated',
        resolved: 'Resolved', rejected: 'Rejected', new: 'New'
    };
    return '<span class="badge ' + (map[status] || 'bg-secondary') + '">' + (labels[status] || status) + '</span>';
}
