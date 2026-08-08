/* ============================================================
   SevaSetu - Notification System (notifications.js)
   ------------------------------------------------------------
   Stores notifications in localStorage (key svs_notifications)
   so they persist across pages.
   ============================================================ */

(function () {
    'use strict';

    function getNotifications() {
        return window.SVS ? SVS.getNotifications() : [];
    }

    function createForUserId(userId, type, title, message) {
        var arr = getNotifications();
        var notif = {
            id: 'N-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            userId: userId,
            type: type || 'info',
            title: title,
            message: message,
            date: new Date().toISOString(),
            read: false
        };
        arr.unshift(notif);
        if (window.SVS) SVS.saveEntities(SVS.keys.notifications, arr);
        return notif;
    }

    // Generic create - if userId unknown, use citizenId of the complaint
    function createForComplaint(complaintId, type, title, message) {
        var comp = window.SVSCOMPLAINTS ? SVSCOMPLAINTS.getComplaintById(complaintId) : null;
        var uid = comp ? comp.citizenId : 'ALL';
        return createForUserId(uid, type, title, message);
    }

    // Alias matching the plan's createNotification()
    function createNotification(userId, type, title, message) {
        return createForUserId(userId, type, title, message);
    }

    function markRead(notifId) {
        if (!window.SVS) return;
        var arr = getNotifications();
        arr.forEach(function (n) { if (n.id === notifId) n.read = true; });
        SVS.saveEntities(SVS.keys.notifications, arr);
    }

    function markAllRead(userId) {
        if (!window.SVS) return;
        var arr = getNotifications();
        arr.forEach(function (n) { if (!userId || n.userId === userId) n.read = true; });
        SVS.saveEntities(SVS.keys.notifications, arr);
    }

    function unreadCount(userId) {
        return getNotifications().filter(function (n) { return !n.read && (!userId || n.userId === userId); }).length;
    }

    window.SVSNOTIFY = {
        getNotifications: getNotifications,
        create: createNotification,
        createForComplaint: createForComplaint,
        markRead: markRead,
        markAllRead: markAllRead,
        unreadCount: unreadCount
    };
})();
