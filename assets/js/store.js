/* ============================================================
   SevaSetu - Central Application Store (store.js)
   ------------------------------------------------------------
   THE single source of truth for the entire prototype.
   All pages read/write through these helpers so that a
   complaint created on one page appears everywhere else.

   ⚠️ PROTOTYPE NOTE:
   This uses localStorage so the frontend demo works without a
   server. When the real backend arrives (Supabase/PostgreSQL),
   replace the bodies of these functions with API calls while
   keeping the same signatures:
     - listEntities(key)
     - saveEntity(key, entity)
     - updateEntity(key, idField, id, patch)
   ============================================================ */

(function () {
    'use strict';

    // ----------------------------------------------------------
    // KEYS (namespaced to avoid collisions with old page data)
    // ----------------------------------------------------------
    var K = {
        citizens: 'svs_citizens',
        officers: 'svs_officers',
        departments: 'svs_departments',
        complaints: 'svs_complaints',
        notifications: 'svs_notifications',
        audit: 'svs_audit',
        states: 'svs_states',
        cities: 'svs_cities',
        session: 'svs_session',
        seedFlag: 'svs_seeded_v1'
    };
    window.SVS_KEYS = K;

    // ----------------------------------------------------------
    // CONTROLLED STATUS LIST (single definition)
    // ----------------------------------------------------------
    var STATUS_FLOW = [
        'SUBMITTED',
        'AI_ANALYSED',
        'DEPARTMENT_ASSIGNED',
        'OFFICER_ASSIGNED',
        'ACCEPTED',
        'IN_PROGRESS',
        'FIELD_VERIFICATION',
        'PROOF_UPLOADED',
        'RESOLVED',
        'CITIZEN_VERIFICATION',
        'CLOSED',
        'ESCALATED',
        'REJECTED'
    ];

    var STATUS_LABELS = {
        SUBMITTED: 'Submitted',
        AI_ANALYSED: 'AI Analysed',
        DEPARTMENT_ASSIGNED: 'Department Assigned',
        OFFICER_ASSIGNED: 'Officer Assigned',
        ACCEPTED: 'Accepted',
        IN_PROGRESS: 'In Progress',
        FIELD_VERIFICATION: 'Field Verified',
        PROOF_UPLOADED: 'Proof Uploaded',
        RESOLVED: 'Resolved',
        CITIZEN_VERIFICATION: 'Citizen Verified',
        CLOSED: 'Closed',
        ESCALATED: 'Escalated',
        REJECTED: 'Rejected'
    };

    var STATUS_BADGE_CLASS = {
        SUBMITTED: 'bg-info',
        AI_ANALYSED: 'bg-primary',
        DEPARTMENT_ASSIGNED: 'bg-primary',
        OFFICER_ASSIGNED: 'bg-primary',
        ACCEPTED: 'bg-primary',
        IN_PROGRESS: 'bg-primary',
        FIELD_VERIFICATION: 'bg-warning text-dark',
        PROOF_UPLOADED: 'bg-warning text-dark',
        RESOLVED: 'bg-success',
        CITIZEN_VERIFICATION: 'bg-success',
        CLOSED: 'bg-success',
        ESCALATED: 'bg-danger',
        REJECTED: 'bg-secondary'
    };

    // ----------------------------------------------------------
    // LOW LEVEL STORAGE HELPERS
    // ----------------------------------------------------------
    function listEntities(key) {
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return [];
            var arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            console.warn('SevaSetu: could not parse ' + key, e);
            return [];
        }
    }

    function saveEntities(key, arr) {
        try {
            localStorage.setItem(key, JSON.stringify(arr));
        } catch (e) {
            console.error('SevaSetu: failed to save ' + key, e);
        }
    }

    function findEntity(key, idField, id) {
        return listEntities(key).find(function (e) { return e[idField] === id; }) || null;
    }

    function saveEntity(key, idField, entity) {
        var arr = listEntities(key);
        var idx = arr.findIndex(function (e) { return e[idField] === entity[idField]; });
        if (idx !== -1) arr[idx] = entity;
        else arr.push(entity);
        saveEntities(key, arr);
        return entity;
    }

    function updateEntity(key, idField, id, patch) {
        var arr = listEntities(key);
        var idx = arr.findIndex(function (e) { return e[idField] === id; });
        if (idx === -1) return null;
        arr[idx] = Object.assign({}, arr[idx], patch);
        saveEntities(key, arr);
        return arr[idx];
    }

    // ----------------------------------------------------------
    // ID GENERATOR: SVS-2026-000001
    // ----------------------------------------------------------
    function generateComplaintId() {
        var arr = listEntities(K.complaints);
        var year = new Date().getFullYear();
        var max = 0;
        arr.forEach(function (c) {
            var m = String(c.complaintId || '').match(/(\d+)$/);
            if (m) {
                var n = parseInt(m[1], 10);
                if (n > max) max = n;
            }
        });
        var next = max + 1;
        var prefix = 'SVS-' + year + '-';
        return prefix + String(next).padStart(6, '0');
    }

    // ----------------------------------------------------------
    // DEMO DATA SEEDING
    // ----------------------------------------------------------
    function now(offsetMinutes) {
        var d = new Date();
        if (offsetMinutes) d.setMinutes(d.getMinutes() + offsetMinutes);
        return d.toISOString();
    }

    function seedData() {
        if (localStorage.getItem(K.seedFlag) === 'true') {
            // Ensure backwards-compatible data is present even if partial
            return;
        }

        // ----- STATES -----
        var states = [
            { stateId: 'ST-01', name: 'Maharashtra', code: 'MH', active: true },
            { stateId: 'ST-02', name: 'Gujarat', code: 'GJ', active: true },
            { stateId: 'ST-03', name: 'Karnataka', code: 'KA', active: true },
            { stateId: 'ST-04', name: 'Rajasthan', code: 'RJ', active: true }
        ];

        // ----- CITIES -----
        var cities = [
            { cityId: 'CT-01', stateId: 'ST-01', name: 'Pune', active: true },
            { cityId: 'CT-02', stateId: 'ST-01', name: 'Mumbai', active: true },
            { cityId: 'CT-03', stateId: 'ST-01', name: 'Nashik', active: true },
            { cityId: 'CT-04', stateId: 'ST-01', name: 'Nagpur', active: true },
            { cityId: 'CT-05', stateId: 'ST-01', name: 'Thane', active: true }
        ];

        // ----- DEPARTMENTS -----
        var departments = [
            { departmentId: 'D-01', name: 'Water Supply', icon: '💧', city: 'Pune', state: 'Maharashtra', sla: 48, officers: [], complaints: [] },
            { departmentId: 'D-02', name: 'Electricity', icon: '⚡', city: 'Pune', state: 'Maharashtra', sla: 72, officers: [], complaints: [] },
            { departmentId: 'D-03', name: 'Roads & PWD', icon: '🛣️', city: 'Pune', state: 'Maharashtra', sla: 96, officers: [], complaints: [] },
            { departmentId: 'D-04', name: 'Sanitation', icon: '🗑️', city: 'Pune', state: 'Maharashtra', sla: 48, officers: [], complaints: [] },
            { departmentId: 'D-05', name: 'Health', icon: '🏥', city: 'Pune', state: 'Maharashtra', sla: 24, officers: [], complaints: [] },
            { departmentId: 'D-06', name: 'Police', icon: '👮', city: 'Pune', state: 'Maharashtra', sla: 12, officers: [], complaints: [] },
            { departmentId: 'D-07', name: 'Fire', icon: '🔥', city: 'Pune', state: 'Maharashtra', sla: 6, officers: [], complaints: [] },
            { departmentId: 'D-08', name: 'Transport', icon: '🚌', city: 'Pune', state: 'Maharashtra', sla: 72, officers: [], complaints: [] },
            { departmentId: 'D-09', name: 'Street Lights', icon: '💡', city: 'Pune', state: 'Maharashtra', sla: 72, officers: [], complaints: [] },
            { departmentId: 'D-10', name: 'Municipal', icon: '🏛️', city: 'Pune', state: 'Maharashtra', sla: 96, officers: [], complaints: [] }
        ];

        // ----- CITIZENS -----
        var citizens = [
            { citizenId: 'CIT-001', name: 'Demo Citizen', mobile: '9876500001', email: 'demo@sevasetu.in', address: 'MG Road, Pune', city: 'Pune', state: 'Maharashtra', language: 'en' },
            { citizenId: 'CIT-002', name: 'Rahul Sharma', mobile: '9876500002', email: 'rahul.sharma@example.com', address: 'FC Road, Pune', city: 'Pune', state: 'Maharashtra', language: 'hi' },
            { citizenId: 'CIT-003', name: 'Priya Patil', mobile: '9876500003', email: 'priya.patil@example.com', address: 'Kothrud, Pune', city: 'Pune', state: 'Maharashtra', language: 'mr' },
            { citizenId: 'CIT-004', name: 'Amit Verma', mobile: '9876500004', email: 'amit.verma@example.com', address: 'Andheri, Mumbai', city: 'Mumbai', state: 'Maharashtra', language: 'en' },
            { citizenId: 'CIT-005', name: 'Sneha Joshi', mobile: '9876500005', email: 'sneha.joshi@example.com', address: 'Gangapur Road, Nashik', city: 'Nashik', state: 'Maharashtra', language: 'mr' }
        ];

        // ----- OFFICERS -----
        var officers = [
            { officerId: 'OF-001', name: 'Ramesh Kumar', department: 'Water Supply', designation: 'Field Officer', badge: '1234', city: 'Pune', status: 'Active', mobile: '9876543210', assignedComplaints: [], performanceScore: 92 },
            { officerId: 'OF-002', name: 'Suresh Patil', department: 'Electricity', designation: 'Field Officer', badge: '5678', city: 'Pune', status: 'Active', mobile: '9988776655', assignedComplaints: [], performanceScore: 88 },
            { officerId: 'OF-003', name: 'Anita Sharma', department: 'Sanitation', designation: 'Field Officer', badge: '9012', city: 'Pune', status: 'Active', mobile: '9123456780', assignedComplaints: [], performanceScore: 85 },
            { officerId: 'OF-004', name: 'Vikram Singh', department: 'Roads & PWD', designation: 'Field Officer', badge: '3456', city: 'Pune', status: 'Active', mobile: '9090909090', assignedComplaints: [], performanceScore: 90 },
            { officerId: 'OF-005', name: 'Priya Deshmukh', department: 'Health', designation: 'Field Officer', badge: '7890', city: 'Pune', status: 'Active', mobile: '9009009009', assignedComplaints: [], performanceScore: 87 }
        ];

        // ----- COMPLAINTS (one canonical dataset) -----
        var complaints = [
            {
                complaintId: 'SVS-2026-000001',
                citizenId: 'CIT-001',
                title: 'Water leakage on MG Road',
                description: 'Major water leakage near the central park causing wastage and road damage.',
                category: 'Water Supply',
                department: 'Water Supply',
                priority: 'High',
                status: 'IN_PROGRESS',
                location: 'Near Central Park, MG Road, Pune',
                latitude: 18.5204,
                longitude: 73.8567,
                createdAt: now(-60 * 24 * 3),
                updatedAt: now(-60 * 20),
                assignedOfficer: 'OF-001',
                sla: 48,
                slaDeadline: now(-60 * 24 * 1),
                aiSummary: 'Water supply leak detected; requires immediate plumbing repair.',
                aiConfidence: 94,
                attachments: [],
                proof: [],
                citizenFeedback: null,
                escalatedTo: null,
                timeline: [
                    { status: 'SUBMITTED', label: 'Complaint Submitted', date: now(-60 * 24 * 3), actor: 'Citizen' },
                    { status: 'AI_ANALYSED', label: 'AI Analysed', date: now(-60 * 24 * 3 + 30), actor: 'AI' },
                    { status: 'DEPARTMENT_ASSIGNED', label: 'Water Supply Department', date: now(-60 * 24 * 3 + 45), actor: 'AI' },
                    { status: 'OFFICER_ASSIGNED', label: 'Officer Ramesh Kumar assigned', date: now(-60 * 24 * 2), actor: 'System' },
                    { status: 'ACCEPTED', label: 'Officer accepted complaint', date: now(-60 * 24 * 2 + 120), actor: 'Officer' },
                    { status: 'IN_PROGRESS', label: 'Work started - inspection ongoing', date: now(-60 * 20), actor: 'Officer' }
                ]
            },
            {
                complaintId: 'SVS-2026-000002',
                citizenId: 'CIT-002',
                title: 'Street light not working near temple',
                description: 'Street light opposite Shiva temple not working for a week, safety hazard at night.',
                category: 'Street Lights',
                department: 'Street Lights',
                priority: 'Medium',
                status: 'RESOLVED',
                location: 'Shiva Temple Road, Sector 12, Pune',
                latitude: 18.5120,
                longitude: 73.8690,
                createdAt: now(-60 * 24 * 7),
                updatedAt: now(-60 * 24 * 4),
                assignedOfficer: 'OF-002',
                sla: 72,
                slaDeadline: now(-60 * 24 * 4),
                aiSummary: 'Street light malfunction detected; electrical repair recommended.',
                aiConfidence: 91,
                attachments: [],
                proof: [],
                citizenFeedback: { rating: 5, comment: 'Fixed quickly. Very satisfied.', date: now(-60 * 24 * 4) },
                escalatedTo: null,
                timeline: [
                    { status: 'SUBMITTED', label: 'Complaint Submitted', date: now(-60 * 24 * 7), actor: 'Citizen' },
                    { status: 'AI_ANALYSED', label: 'AI Analysed', date: now(-60 * 24 * 7 + 30), actor: 'AI' },
                    { status: 'DEPARTMENT_ASSIGNED', label: 'Street Lights Department', date: now(-60 * 24 * 7 + 45), actor: 'AI' },
                    { status: 'OFFICER_ASSIGNED', label: 'Officer Suresh Patil assigned', date: now(-60 * 24 * 6), actor: 'System' },
                    { status: 'ACCEPTED', label: 'Officer accepted complaint', date: now(-60 * 24 * 6 + 90), actor: 'Officer' },
                    { status: 'IN_PROGRESS', label: 'Repair work started', date: now(-60 * 24 * 5), actor: 'Officer' },
                    { status: 'FIELD_VERIFICATION', label: 'Field verification done', date: now(-60 * 24 * 5 + 120), actor: 'Officer' },
                    { status: 'PROOF_UPLOADED', label: 'Work proof uploaded', date: now(-60 * 24 * 5 + 150), actor: 'Officer' },
                    { status: 'RESOLVED', label: 'Repair completed', date: now(-60 * 24 * 4), actor: 'Officer' },
                    { status: 'CLOSED', label: 'Citizen verified & closed', date: now(-60 * 24 * 4 + 60), actor: 'Citizen' }
                ]
            },
            {
                complaintId: 'SVS-2026-000003',
                citizenId: 'CIT-003',
                title: 'Garbage not collected for 3 days',
                description: 'Garbage bins at community centre not emptied for three days, causing foul smell.',
                category: 'Sanitation',
                department: 'Sanitation',
                priority: 'Medium',
                status: 'SUBMITTED',
                location: 'Community Centre, Gandhi Nagar, Pune',
                latitude: 18.5300,
                longitude: 73.8400,
                createdAt: now(-60 * 2),
                updatedAt: now(-60 * 2),
                assignedOfficer: null,
                sla: 48,
                slaDeadline: now(60 * 46),
                aiSummary: 'Sanitation issue; waste collection overdue.',
                aiConfidence: 89,
                attachments: [],
                proof: [],
                citizenFeedback: null,
                escalatedTo: null,
                timeline: [
                    { status: 'SUBMITTED', label: 'Complaint Submitted', date: now(-60 * 2), actor: 'Citizen' },
                    { status: 'AI_ANALYSED', label: 'AI Analysed', date: now(-60 * 2 + 30), actor: 'AI' }
                ]
            },
            {
                complaintId: 'SVS-2026-000004',
                citizenId: 'CIT-004',
                title: 'Water contamination in colony',
                description: 'Water supply in our colony has a foul smell and appears muddy.',
                category: 'Water Supply',
                department: 'Water Supply',
                priority: 'Critical',
                status: 'OFFICER_ASSIGNED',
                location: 'Andheri East, Mumbai',
                latitude: 19.1136,
                longitude: 72.8697,
                createdAt: now(-60 * 8),
                updatedAt: now(-60 * 4),
                assignedOfficer: 'OF-001',
                sla: 24,
                slaDeadline: now(60 * 16),
                aiSummary: 'Potential water contamination; urgent water quality testing recommended.',
                aiConfidence: 96,
                attachments: [],
                proof: [],
                citizenFeedback: null,
                escalatedTo: null,
                timeline: [
                    { status: 'SUBMITTED', label: 'Complaint Submitted', date: now(-60 * 8), actor: 'Citizen' },
                    { status: 'AI_ANALYSED', label: 'AI Analysed - Critical priority', date: now(-60 * 8 + 30), actor: 'AI' },
                    { status: 'DEPARTMENT_ASSIGNED', label: 'Water Supply Department', date: now(-60 * 8 + 45), actor: 'AI' },
                    { status: 'OFFICER_ASSIGNED', label: 'Officer Ramesh Kumar assigned', date: now(-60 * 4), actor: 'System' }
                ]
            },
            {
                complaintId: 'SVS-2026-000005',
                citizenId: 'CIT-002',
                title: 'Sewage overflow on lane',
                description: 'Sewage overflowing from manhole near lane entrance, foul smell and flies.',
                category: 'Drainage',
                department: 'Municipal',
                priority: 'High',
                status: 'ESCALATED',
                location: 'Sadashiv Peth, Pune',
                latitude: 18.5080,
                longitude: 73.8550,
                createdAt: now(-60 * 24 * 5),
                updatedAt: now(-60 * 24 * 1),
                assignedOfficer: 'OF-004',
                sla: 48,
                slaDeadline: now(-60 * 24 * 3),
                aiSummary: 'Drainage blockage; requires jetting and cleanup.',
                aiConfidence: 88,
                attachments: [],
                proof: [],
                citizenFeedback: null,
                escalatedTo: 'Municipal Commissioner',
                timeline: [
                    { status: 'SUBMITTED', label: 'Complaint Submitted', date: now(-60 * 24 * 5), actor: 'Citizen' },
                    { status: 'AI_ANALYSED', label: 'AI Analysed', date: now(-60 * 24 * 5 + 30), actor: 'AI' },
                    { status: 'DEPARTMENT_ASSIGNED', label: 'Municipal Department', date: now(-60 * 24 * 5 + 45), actor: 'AI' },
                    { status: 'OFFICER_ASSIGNED', label: 'Officer Vikram Singh assigned', date: now(-60 * 24 * 4), actor: 'System' },
                    { status: 'ACCEPTED', label: 'Officer accepted complaint', date: now(-60 * 24 * 4 + 90), actor: 'Officer' },
                    { status: 'ESCALATED', label: 'Escalated - SLA at risk', date: now(-60 * 24 * 1), actor: 'Officer' }
                ]
            },
            {
                complaintId: 'SVS-2026-000006',
                citizenId: 'CIT-005',
                title: 'Road pothole near school',
                description: 'Large pothole on road near school entrance causing accidents, especially in rains.',
                category: 'Roads & PWD',
                department: 'Roads & PWD',
                priority: 'High',
                status: 'ACCEPTED',
                location: 'Near ZP School, Gangapur Road, Nashik',
                latitude: 19.9975,
                longitude: 73.7898,
                createdAt: now(-60 * 30),
                updatedAt: now(-60 * 10),
                assignedOfficer: 'OF-004',
                sla: 96,
                slaDeadline: now(60 * 66),
                aiSummary: 'Road infrastructure damage; pothole repair required.',
                aiConfidence: 92,
                attachments: [],
                proof: [],
                citizenFeedback: null,
                escalatedTo: null,
                timeline: [
                    { status: 'SUBMITTED', label: 'Complaint Submitted', date: now(-60 * 30), actor: 'Citizen' },
                    { status: 'AI_ANALYSED', label: 'AI Analysed', date: now(-60 * 30 + 30), actor: 'AI' },
                    { status: 'DEPARTMENT_ASSIGNED', label: 'Roads & PWD Department', date: now(-60 * 30 + 45), actor: 'AI' },
                    { status: 'OFFICER_ASSIGNED', label: 'Officer Vikram Singh assigned', date: now(-60 * 12), actor: 'System' },
                    { status: 'ACCEPTED', label: 'Officer accepted complaint', date: now(-60 * 10), actor: 'Officer' }
                ]
            }
        ];

        // ----- NOTIFICATIONS (seed a few) -----
        var notifications = [
            { id: 'N-001', userId: 'CIT-001', type: 'status', title: 'Complaint status updated', message: 'Your complaint SVS-2026-000001 is now In Progress.', date: now(-60 * 20), read: false },
            { id: 'N-002', userId: 'CIT-001', type: 'info', title: 'Welcome to SevaSetu', message: 'Track and manage your grievances here.', date: now(-60 * 24 * 3), read: true }
        ];

        // ----- AUDIT (seed a few) -----
        var audit = [
            { id: 'A-001', date: now(-60 * 20), user: 'Officer', userName: 'Ramesh Kumar', role: 'Officer', action: 'Updated complaint status', module: 'Complaints', detail: 'SVS-2026-000001 status changed to IN_PROGRESS', status: 'Success' },
            { id: 'A-002', date: now(-60 * 24 * 2), user: 'System', userName: 'AI Service', role: 'System', action: 'Auto-classified complaint', module: 'AI', detail: 'SVS-2026-000001 routed to Water Supply', status: 'Success' }
        ];

        // Persist everything
        saveEntities(K.states, states);
        saveEntities(K.cities, cities);
        saveEntities(K.departments, departments);
        saveEntities(K.citizens, citizens);
        saveEntities(K.officers, officers);
        saveEntities(K.complaints, complaints);
        saveEntities(K.notifications, notifications);
        saveEntities(K.audit, audit);

        localStorage.setItem(K.seedFlag, 'true');
    }

    // ----------------------------------------------------------
    // PUBLIC API (window.SVS)
    // ----------------------------------------------------------
    var SVS = {
        keys: K,
        listEntities: listEntities,
        saveEntities: saveEntities,
        findEntity: findEntity,
        saveEntity: saveEntity,
        updateEntity: updateEntity,
        generateComplaintId: generateComplaintId,
        seedData: seedData,
        STATUS_FLOW: STATUS_FLOW,
        STATUS_LABELS: STATUS_LABELS,
        STATUS_BADGE_CLASS: STATUS_BADGE_CLASS,

        // Domain shortcuts (kept generic so pages can use them)
        getCitizens: function () { return listEntities(K.citizens); },
        getCitizen: function (id) { return findEntity(K.citizens, 'citizenId', id); },
        getOfficers: function () { return listEntities(K.officers); },
        getOfficer: function (id) { return findEntity(K.officers, 'officerId', id); },
        getDepartments: function () { return listEntities(K.departments); },
        getDepartment: function (id) { return findEntity(K.departments, 'departmentId', id); },
        getComplaints: function () { return listEntities(K.complaints); },
        getStates: function () { return listEntities(K.states); },
        getCities: function () { return listEntities(K.cities); },
        getNotifications: function () { return listEntities(K.notifications); },
        getAuditLogs: function () { return listEntities(K.audit); }
    };

    // Seed once on first load
    seedData();

    window.SVS = SVS;
})();

