/* ============================================================
   SevaSetu - Global Search (search.js)
   ------------------------------------------------------------
   Searches across complaints, departments, officers, citizens,
   and statuses from the ONE central dataset.
   Returns clickable results (with a destination URL).
   ============================================================ */

(function () {
    'use strict';

    function search(query) {
        var q = (query || '').toLowerCase().trim();
        if (!q) return { complaints: [], officers: [], citizens: [], departments: [] };

        var complaints = [];
        var officers = [];
        var citizens = [];
        var departments = [];

        if (window.SVS) {
            // Complaints
            SVS.getComplaints().forEach(function (c) {
                var o = window.SVSAUTH ? SVSAUTH.relativeToRoot() : '../';
                var hay = [
                    c.complaintId, c.title, c.description, c.category, c.department,
                    c.priority, c.status
                ].join(' ').toLowerCase();
                if (hay.indexOf(q) !== -1) {
                    complaints.push({
                        type: 'complaint',
                        id: c.complaintId,
                        title: c.title,
                        detail: c.department + ' · ' + (window.SVS.STATUS_LABELS[c.status] || c.status),
                        url: o + 'citizen/complaint-details.html?id=' + c.complaintId
                    });
                }
            });

            // Officers
            SVS.getOfficers().forEach(function (o) {
                var hay = [o.officerId, o.name, o.department, o.designation, o.city].join(' ').toLowerCase();
                if (hay.indexOf(q) !== -1) {
                    officers.push({ type: 'officer', id: o.officerId, title: o.name, detail: o.department, url: '' });
                }
            });

            // Citizens
            SVS.getCitizens().forEach(function (c) {
                var hay = [c.citizenId, c.name, c.mobile, c.email, c.city].join(' ').toLowerCase();
                if (hay.indexOf(q) !== -1) {
                    citizens.push({ type: 'citizen', id: c.citizenId, title: c.name, detail: c.city, url: '' });
                }
            });

            // Departments
            SVS.getDepartments().forEach(function (d) {
                var hay = [d.departmentId, d.name, d.city].join(' ').toLowerCase();
                if (hay.indexOf(q) !== -1) {
                    departments.push({ type: 'department', id: d.departmentId, title: d.name, detail: d.city, url: '' });
                }
            });
        }

        return { complaints: complaints, officers: officers, citizens: citizens, departments: departments };
    }

    window.SVSSEARCH = {
        search: search
    };
})();
