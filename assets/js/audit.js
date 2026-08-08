/* ============================================================
   SevaSetu - Audit Log System (audit.js)
   ------------------------------------------------------------
   Records audit entries to localStorage (key svs_audit).
   Every important action should call SVSAUDIT.log().
   ============================================================ */

(function () {
    'use strict';

    function getAuditLogs() {
        return window.SVS ? SVS.getAuditLogs() : [];
    }

    // log(actor, userName, action, module, detail, status)
    function log(actor, userName, action, module, detail, status) {
        var arr = getAuditLogs();
        var entry = {
            id: 'A-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            date: new Date().toISOString(),
            user: actor || 'User',
            userName: userName || '',
            role: guessRole(actor || userName),
            action: action,
            module: module || 'General',
            detail: detail || '',
            ip: '127.0.0.1',
            browser: navigator.userAgent.split(' ').slice(0, 2).join(' '),
            status: status || 'Success'
        };
        arr.unshift(entry);
        if (window.SVS) SVS.saveEntities(SVS.keys.audit, arr);
        return entry;
    }

    function guessRole(actor) {
        var s = window.SVSAUTH ? SVSAUTH.getSession() : null;
        if (s && s.role) {
            var map = {
                citizen: 'Citizen', officer: 'Officer', department: 'Department Head',
                admin: 'Administrator', superadmin: 'Super Admin'
            };
            return map[s.role] || 'User';
        }
        return 'User';
    }

    window.SVSAUDIT = {
        getAuditLogs: getAuditLogs,
        log: log
    };
})();
