/* ============================================================
   SevaSetu - Sidebar Navigation JS (sidebar.js)
   Shared dynamic sidebar rendering for the SPA app (index.html).
   Builds role-based menus and links to the modular pages.
   Preserves the exact sidebar behaviour of the prototype.
   ============================================================ */

function updateSidebar() {
    const sc = document.getElementById('sidebarContent');
    if (!sc) return;
    if (!loggedIn || !currentRole) {
        sc.innerHTML =
            '<div class="sidebar-title">Menu</div><a class="sidebar-link active" style="cursor:pointer" onclick="showToast(\'Please login\')"><i class="fas fa-home"></i> Home</a>' +
            '<a class="sidebar-link" style="cursor:pointer" onclick="showDBDesignView()"><i class="fas fa-database"></i> Database Design</a>';
        return;
    }

    let links = '';
    const base = {
        citizen: ['Dashboard', 'Register', 'Track', 'History', 'Emergency'],
        officer: ['Dashboard', 'Assigned', 'Accept', 'Update', 'Upload', 'GPS', 'Escalate', 'Profile', 'Performance'],
        department: ['Dashboard', 'Analytics', 'Officers', 'Complaints', 'Heatmap', 'Export'],
        admin: ['Dashboard', 'Departments', 'Citizens', 'Officers', 'AI Analytics', 'Statistics', 'Audit Logs'],
        superadmin: ['Dashboard', 'States', 'Cities', 'Departments', 'Officers', 'AI Settings', 'Database', 'Security']
    }[currentRole] || [];

    const citizenPages = {
        Dashboard: null,
        Register: 'register-complaint.html',
        Track: 'track.html',
        History: 'history.html',
        Emergency: 'emergency.html'
    };
    const officerPages = {
        Dashboard: null,
        Assigned: 'assigned.html',
        Accept: 'accept.html',
        Update: 'update-status.html',
        Upload: 'upload-proof.html',
        GPS: 'gps-verification.html',
        Escalate: 'escalation.html',
        Profile: 'profile.html',
        Performance: 'performance.html'
    };
const departmentPages = {
        Dashboard: null,
        Analytics: 'analytics.html',
        Officers: 'officers.html',
        Complaints: 'complaints.html',
        Heatmap: 'heatmap.html',
        Export: 'export.html'
    };
const adminPages = {
        Dashboard: 'dashboard.html',
        Departments: 'departments.html',
        Citizens: 'citizens.html',
        Officers: 'officers.html',
        'AI Analytics': 'ai-analytics.html',
        Statistics: 'statistics.html',
        'Audit Logs': 'audit-logs.html'
    };
    const superadminPages = {
        Dashboard: 'dashboard.html',
        States: 'states.html',
        Cities: 'cities.html',
        Departments: 'departments.html',
        Officers: 'officers.html',
        'AI Settings': 'ai-settings.html',
        Database: 'database.html',
        Security: 'security.html'
    };

    links += '<div class="sidebar-title">' + getRoleLabel(currentRole) + ' Panel</div>';
    links += base.map(function (l) {
        let action;
        const pages = currentRole === 'citizen' ? citizenPages : (currentRole === 'officer' ? officerPages : (currentRole === 'department' ? departmentPages : (currentRole === 'admin' ? adminPages : (currentRole === 'superadmin' ? superadminPages : null))));
        if (pages) {
            const page = pages[l];
            action = page ? "window.location.href='" + resolveModulePath(currentRole, page) + "'" : 'showRoleView()';
        } else {
            action = "showToast('" + l + " page')";
        }
        return '<a class="sidebar-link" style="cursor:pointer" onclick="' + action + '"><i class="fas fa-circle"></i> ' + l + '</a>';
    }).join('');

    var systemLinks = '<div class="sidebar-title">System</div>';
    if (currentRole === 'admin') {
        systemLinks += '<a class="sidebar-link" style="cursor:pointer" onclick="window.location.href=\'admin/notifications.html\'"><i class="fas fa-bell"></i> Notifications</a>' +
            '<a class="sidebar-link" style="cursor:pointer" onclick="window.location.href=\'admin/reports.html\'"><i class="fas fa-file-alt"></i> Reports</a>' +
            '<a class="sidebar-link" style="cursor:pointer" onclick="window.location.href=\'admin/settings.html\'"><i class="fas fa-cog"></i> Settings</a>';
    } else if (currentRole === 'superadmin') {
        systemLinks += '<a class="sidebar-link" style="cursor:pointer" onclick="window.location.href=\'superadmin/settings.html\'"><i class="fas fa-cog"></i> Settings</a>' +
            '<a class="sidebar-link" style="cursor:pointer" onclick="window.location.href=\'superadmin/system-health.html\'"><i class="fas fa-heart-pulse"></i> System Health</a>' +
            '<a class="sidebar-link" style="cursor:pointer" onclick="window.location.href=\'superadmin/backups.html\'"><i class="fas fa-cloud-upload-alt"></i> Backups</a>' +
            '<a class="sidebar-link" style="cursor:pointer" onclick="window.location.href=\'superadmin/logs.html\'"><i class="fas fa-scroll"></i> Logs</a>';
    }
    systemLinks += '<a class="sidebar-link" style="cursor:pointer" onclick="showDBDesignView()"><i class="fas fa-database"></i> Database Design</a>';
    links += systemLinks;
    sc.innerHTML = links;
}

// Resolve relative module path based on role
function resolveModulePath(role, page) {
    if (role === 'citizen') return 'citizen/' + page;
    if (role === 'officer') return 'officer/' + page;
    if (role === 'department') return 'department/' + page;
    if (role === 'admin') return 'admin/' + page;
    if (role === 'superadmin') return 'superadmin/' + page;
    return page;
}
