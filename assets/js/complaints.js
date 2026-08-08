/* ============================================================
   SevaSetu - Complaint Service Layer (complaints.js)
   ------------------------------------------------------------
   Clean service functions for the complaint workflow. All pages
   call these instead of touching localStorage directly.

   ⚠️ BACKEND INTEGRATION POINT:
   Each function here can later be swapped for an API call
   (Supabase/PostgreSQL) without changing the UI code.
   ============================================================ */

(function () {
    'use strict';

    function getComplaints() {
        return window.SVS ? SVS.getComplaints() : [];
    }

    function getComplaintById(id) {
        return window.SVS ? SVS.findEntity(SVS.keys.complaints, 'complaintId', id) : null;
    }

    function saveComplaint(comp) {
        return window.SVS ? SVS.saveEntity(SVS.keys.complaints, 'complaintId', comp) : comp;
    }

    // Create a new complaint with a generated ID and initial timeline.
    function createComplaint(data) {
        var complaints = getComplaints();
        var id = window.SVS ? SVS.generateComplaintId() : 'SVS-000000';
        var nowIso = new Date().toISOString();

        var complaint = {
            complaintId: data.complaintId || id,
            citizenId: data.citizenId || 'CIT-001',
            title: data.title || data.subject || '',
            description: data.description || '',
            category: data.category || 'Other',
            department: data.department || 'Municipal',
            priority: data.priority || 'Medium',
            status: data.status || data.isEmergency === true ? 'DEPARTMENT_ASSIGNED' : 'SUBMITTED',
            location: data.location || '',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            createdAt: nowIso,
            updatedAt: nowIso,
            assignedOfficer: data.assignedOfficer || null,
            sla: data.sla || 72,
            slaDeadline: data.slaDeadline || null,
            aiSummary: data.aiSummary || '',
            aiConfidence: data.aiConfidence || 0,
            attachments: data.attachments || [],
            proof: [],
            citizenFeedback: null,
            escalatedTo: null,
            timeline: data.timeline || [
                { status: 'SUBMITTED', label: 'Complaint Submitted', date: nowIso, actor: 'Citizen' }
            ]
        };

        if (data.isEmergency) {
            complaint.status = 'FIELD_VERIFICATION';
            complaint.priority = 'Critical';
            complaint.sla = 6;
            complaint.timeline.push({ status: 'FIELD_VERIFICATION', label: 'Emergency - field verification', date: nowIso, actor: 'System' });
        }

        saveComplaint(complaint);
        return complaint;
    }

    // Update a complaint's status, append timeline, and notify.
    function updateComplaintStatus(id, newStatus, remark, actor) {
        var comp = getComplaintById(id);
        if (!comp) return null;
        var prev = comp.status;
        comp.status = newStatus;
        comp.updatedAt = new Date().toISOString();
        if (remark !== undefined && remark !== null) comp.remark = remark;
        if (!comp.timeline) comp.timeline = [];
        comp.timeline.push({
            status: newStatus,
            label: (window.SVS && SVS.STATUS_LABELS[newStatus]) || newStatus.replace(/_/g, ' '),
            date: comp.updatedAt,
            actor: actor || 'System',
            remark: remark || ''
        });
        saveComplaint(comp);

        // Audit + notification
        if (window.SVSAUDIT) {
            SVSAUDIT.log(actor || 'System', SVSAUTH.getUserName(), 'Updated complaint status', 'Complaints',
                id + ' status changed from ' + prev + ' to ' + newStatus, 'Success');
        }
        if (window.SVSNOTIFY) {
            SVSNOTIFY.create(comp.citizenId, 'status', 'Complaint status updated',
                'Your complaint ' + id + ' is now ' + ((window.SVS && SVS.STATUS_LABELS[newStatus]) || newStatus) + '.');
        }
        return comp;
    }

    // Assign an officer to a complaint.
    function assignOfficer(id, officerId) {
        var comp = getComplaintById(id);
        if (!comp) return null;
        comp.assignedOfficer = officerId;
        comp.status = 'OFFICER_ASSIGNED';
        comp.updatedAt = new Date().toISOString();
        if (!comp.timeline) comp.timeline = [];
        var officer = window.SVS ? SVS.getOfficer(officerId) : null;
        comp.timeline.push({
            status: 'OFFICER_ASSIGNED',
            label: 'Officer ' + (officer ? officer.name : '') + ' assigned',
            date: comp.updatedAt,
            actor: 'System'
        });
        saveComplaint(comp);

        // Update officer's assigned list
        if (window.SVS) {
            var officers = SVS.getOfficers();
            var oi = officers.findIndex(function (o) { return o.officerId === officerId; });
            if (oi !== -1) {
                if (!officers[oi].assignedComplaints) officers[oi].assignedComplaints = [];
                if (officers[oi].assignedComplaints.indexOf(id) === -1) officers[oi].assignedComplaints.push(id);
                SVS.saveEntity(SVS.keys.officers, 'officerId', officers[oi]);
            }
        }
        return comp;
    }

    // Get complaints for a citizen
    function getCitizenComplaints(citizenId) {
        return getComplaints().filter(function (c) { return c.citizenId === citizenId; });
    }

    // Get complaints assigned to an officer
    function getOfficerComplaints(officerId) {
        return getComplaints().filter(function (c) { return c.assignedOfficer === officerId; });
    }

    // Get complaints for a department
    function getDepartmentComplaints(deptName) {
        return getComplaints().filter(function (c) { return c.department === deptName; });
    }

    function getComplaintsByStatus(status) {
        return getComplaints().filter(function (c) { return c.status === status; });
    }

    // Count helpers
    function countsFor(list) {
        var s = list || getComplaints();
        return {
            total: s.length,
            pending: s.filter(function (c) { return c.status === 'SUBMITTED' || c.status === 'AI_ANALYSED' || c.status === 'DEPARTMENT_ASSIGNED' || c.status === 'OFFICER_ASSIGNED' || c.status === 'ACCEPTED'; }).length,
            inProgress: s.filter(function (c) { return c.status === 'IN_PROGRESS' || c.status === 'FIELD_VERIFICATION' || c.status === 'PROOF_UPLOADED'; }).length,
            resolved: s.filter(function (c) { return c.status === 'RESOLVED' || c.status === 'CLOSED'; }).length,
            escalated: s.filter(function (c) { return c.status === 'ESCALATED'; }).length,
            rejected: s.filter(function (c) { return c.status === 'REJECTED'; }).length
        };
    }

    // SLA breach check
    function isSlaBreached(comp) {
        if (!comp.slaDeadline) return false;
        return new Date(comp.slaDeadline) < new Date() &&
            ['RESOLVED', 'CLOSED', 'REJECTED'].indexOf(comp.status) === -1;
    }

    window.SVSCOMPLAINTS = {
        getComplaints: getComplaints,
        getComplaintById: getComplaintById,
        saveComplaint: saveComplaint,
        createComplaint: createComplaint,
        updateComplaintStatus: updateComplaintStatus,
        assignOfficer: assignOfficer,
        getCitizenComplaints: getCitizenComplaints,
        getOfficerComplaints: getOfficerComplaints,
        getDepartmentComplaints: getDepartmentComplaints,
        getComplaintsByStatus: getComplaintsByStatus,
        countsFor: countsFor,
        isSlaBreached: isSlaBreached
    };
})();
