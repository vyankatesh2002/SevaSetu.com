/* ============================================================
   SevaSetu - Authentication & Authorization (auth.js)
   ------------------------------------------------------------
   Role-based demo login + session management + auth guard.

   ⚠️ PROTOTYPE NOTE:
   This is a FRONTEND ONLY simulation. It is NOT secure. Real
   authentication must be handled by the backend (Supabase Auth
   / JWT). The session is stored in localStorage purely so the
   prototype can demonstrate role-based navigation and guards.
   ============================================================ */

(function () {
    'use strict';

    var ROLES = ['citizen', 'officer', 'department', 'admin', 'superadmin'];

    var ROLE_META = {
        citizen: { label: 'Citizen', icon: '👤', dashboard: 'citizen/dashboard.html', home: '../index.html' },
        officer: { label: 'Officer', icon: '👮', dashboard: 'officer/dashboard.html', home: '../index.html' },
        department: { label: 'Department', icon: '🏢', dashboard: 'department/dashboard.html', home: '../index.html' },
        admin: { label: 'Admin', icon: '🛡️', dashboard: 'admin/dashboard.html', home: '../index.html' },
        superadmin: { label: 'Super Admin', icon: '👑', dashboard: 'superadmin/dashboard.html', home: '../index.html' }
    };

    // Demo credentials (any email/password works, but these map to a role)
    // For the prototype, the role is chosen explicitly on the login page.
    var DEMO_USERS = {
        citizen: { name: 'Demo Citizen', email: 'citizen@sevasetu.in', id: 'CIT-001' },
        officer: { name: 'Ramesh Kumar', email: 'officer@sevasetu.in', id: 'OF-001' },
        department: { name: 'Water Dept Head', email: 'department@sevasetu.in', id: 'D-01' },
        admin: { name: 'System Admin', email: 'admin@sevasetu.in', id: 'AD-01' },
        superadmin: { name: 'Super Admin', email: 'superadmin@sevasetu.in', id: 'SA-01' }
    };

    // ---------- Session helpers ----------
    function getSession() {
        try {
            var raw = localStorage.getItem('svs_session');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function setSession(role, user) {
        var session = {
            role: role,
            loggedIn: true,
            user: user || DEMO_USERS[role] || null,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('svs_session', JSON.stringify(session));
        return session;
    }

    function clearSession() {
        localStorage.removeItem('svs_session');
    }

    function isLoggedIn() {
        var s = getSession();
        return !!(s && s.loggedIn && s.role);
    }

    function getRole() {
        var s = getSession();
        return s ? s.role : null;
    }

    function getRoleLabel(role) {
        var r = role || getRole();
        return ROLE_META[r] ? ROLE_META[r].label : 'Guest';
    }

    function getUserName() {
        var s = getSession();
        return s && s.user ? s.user.name : 'User';
    }

    // ---------- Login ----------
    function login(email, password, role) {
        if (!email || !email.trim()) return { ok: false, message: 'Please enter your email.' };
        if (!password || !password.trim()) return { ok: false, message: 'Please enter your password.' };
        if (!role || ROLES.indexOf(role) === -1) return { ok: false, message: 'Please select a role.' };

        // Prototype: accept any credentials. Map to the demo user for the role.
        var user = DEMO_USERS[role] || { name: 'User', email: email, id: 'U-' + Date.now() };
        setSession(role, user);

        // Record audit log
        if (window.SVSAUDIT) {
            SVSAUDIT.log('Citizen', getUserName(), 'Log in', 'Auth', 'Logged in as ' + role, 'Success');
        }
        return { ok: true, role: role, redirect: ROLE_META[role].dashboard };
    }

    // ---------- Logout ----------
    function logout() {
        clearSession();
        // Redirect to login (relative from wherever called)
        var path = window.location.pathname.split('/');
        var base = '';
        // Determine depth from root
        var depth = 0;
        var lower = path[path.length - 1];
        if (lower) {
            // e.g. citizen/dashboard.html => depth 1
            var segs = path.filter(function (s) { return s && s.indexOf('.') === -1; });
            depth = segs.length - 1; // subtract 1 for the project folder itself
        }
        // Simpler: go to pages/login.html relative to current folder
        var rel = '';
        for (var i = 0; i < depth; i++) rel += '../';
        window.location.href = base + rel + 'pages/login.html';
    }

    // ---------- Auth Guard ----------
    // Call requireAuth(allowedRoles) on protected pages.
    // allowedRoles: array of roles allowed, or null to mean "any logged-in user".
    function requireAuth(allowedRoles) {
        if (!isLoggedIn()) {
            // Redirect to login with a return path
            var rel = relativeToRoot();
            window.location.href = rel + 'pages/login.html';
            return false;
        }
        if (allowedRoles && allowedRoles.indexOf(getRole()) === -1) {
            // Logged in but wrong role -> redirect to their own dashboard
            var r = getRole();
            var rel2 = relativeToRoot();
            window.location.href = rel2 + ROLE_META[r].dashboard;
            return false;
        }
        return true;
    }

    // Compute the relative path from the current page to the project root.
    function relativeToRoot() {
        var path = window.location.pathname;
        var parts = path.split('/').filter(function (s) { return s.length > 0; });
        // parts[last] is the file. Remaining parts before the file give depth.
        var depth = Math.max(0, parts.length - 1);
        var rel = '';
        for (var i = 0; i < depth; i++) rel += '../';
        return rel;
    }

    // ---------- Global nav injection ----------
    // Adds a topbar with logo, notifications, logout, and returns the root-relative path.
    function injectGlobalNav() {
        var rel = relativeToRoot();
        var s = getSession();
        var role = s ? s.role : null;
        var meta = ROLE_META[role];

        // Skip if already injected
        if (document.getElementById('svs-global-nav')) return rel;

        var nav = document.createElement('div');
        nav.id = 'svs-global-nav';
        nav.style.cssText = 'position:fixed;top:0;left:0;right:0;height:44px;background:#0f1a2e;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 16px;z-index:9999;font-family:Segoe UI,system-ui,sans-serif;font-size:13px;box-shadow:0 2px 10px rgba(0,0,0,.3);';

        // Left: logo + home
        var left = document.createElement('div');
        left.style.cssText = 'display:flex;align-items:center;gap:10px;';
        left.innerHTML = '<a href="' + rel + 'index.html" style="color:#fff;text-decoration:none;font-weight:700;display:flex;align-items:center;gap:6px;"><span>🚀</span> SevaSetu</a>' +
            ' <span style="opacity:.6;font-size:11px;">' + (meta ? meta.label : 'Guest') + '</span>';

        // Right: dashboard link + logout
        var right = document.createElement('div');
        right.style.cssText = 'display:flex;align-items:center;gap:10px;';
        if (meta) {
            right.innerHTML += '<a href="' + rel + meta.dashboard + '" style="color:#fff;text-decoration:none;opacity:.9;">🏠 Dashboard</a>';
        }
        right.innerHTML += '<span style="opacity:.8;">👤 ' + getUserName() + '</span>';
        var logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.cssText = 'background:#dc3545;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:600;';
        logoutBtn.addEventListener('click', function () { logout(); });
        right.appendChild(logoutBtn);

        nav.appendChild(left);
        nav.appendChild(right);
        document.body.prepend(nav);

        // Add top padding to body so content isn't hidden under nav
        document.body.style.paddingTop = '44px';

        return rel;
    }

    // Auto-guard: if a page has data-guard="role1,role2" on <body>, enforce it.
    function autoGuard() {
        var body = document.body;
        var guard = body.getAttribute('data-guard');
        if (guard && guard !== 'public') {
            var allowed = guard.split(',').map(function (s) { return s.trim(); });
            requireAuth(allowed);
        }
    }

    // Init
    document.addEventListener('DOMContentLoaded', function () {
        autoGuard();
    });

    // Public API
    window.SVSAUTH = {
        ROLES: ROLES,
        ROLE_META: ROLE_META,
        getSession: getSession,
        setSession: setSession,
        clearSession: clearSession,
        isLoggedIn: isLoggedIn,
        getRole: getRole,
        getRoleLabel: getRoleLabel,
        getUserName: getUserName,
        login: login,
        logout: logout,
        requireAuth: requireAuth,
        relativeToRoot: relativeToRoot,
        injectGlobalNav: injectGlobalNav
    };
})();
