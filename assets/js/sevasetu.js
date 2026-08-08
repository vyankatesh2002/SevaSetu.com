/* ============================================================
   SEVASETU — GLOBAL LAYOUT & THEME (sevasetu.js)
   ============================================================
   Injects shared header + footer onto every page and wires up
   the global controls (dark mode, high contrast, font size,
   language, skip link).

   TWO MODES:
   1) PUBLIC pages (about, services, CIP, login, etc.)
      -> Full homepage header (utility bar + nav + Login/Register/
         Track buttons) + full homepage footer.

   2) MODULE pages (citizen/, officer/, department/, admin/,
      superadmin/ — these have a `.module-side` sidebar).
      -> A COMPACT single-line module header (brand + user +
         logout) so the page aligns cleanly beside the sidebar
         and does NOT show public Login/Register buttons.

   Relative paths are auto-computed from folder depth.
   ============================================================ */

(function () {
    'use strict';

    // ---- Compute path depth to project root ----
    var path = window.location.pathname;
    var folders = path.split('/');
    folders.pop(); // remove the filename
    var known = ['citizen','officer','department','admin','superadmin','pages','assets','database','js'];
    var depth = folders.filter(function (f) { return f && known.indexOf(f) !== -1; }).length;
    var UP = '';
    for (var i = 0; i < depth; i++) UP += '../';
    window.SEVASETU_BASE = UP;

    // Root home page convention: CIP.html is the Home page
    var homeUrl = UP + 'CIP.html';
    var reportUrl = UP + 'citizen/register-complaint.html';
    var trackUrl = UP + 'citizen/track.html';
    var loginUrl = UP + 'pages/login.html';

    // Detect module pages: they contain a .module-side sidebar
    var isModule = !!document.querySelector('.module-side');

    // ----------------------------------------------------------
    // Header builders
    // ----------------------------------------------------------
    function buildPublicHeader() {
        return '' +
        '<div class="sevasetu-utility" role="banner" aria-label="Government utility bar">' +
            '<div class="su-left"><span class="flag">🇮🇳</span><span>Research Prototype for Smart Governance</span><span class="tag">Not an Official Government Website</span></div>' +
            '<div class="su-right">' +
                '<select id="svs-lang" aria-label="Select language"><option value="en">🌐 English</option><option value="mr">मराठी</option><option value="hi">हिन्दी</option></select>' +
                '<button data-sfont="small" aria-label="Decrease font size">A-</button>' +
                '<button data-sfont="base" aria-label="Default font size">A</button>' +
                '<button data-sfont="large" aria-label="Increase font size">A+</button>' +
                '<button id="svs-dark" aria-label="Toggle dark mode">🌙</button>' +
                '<button id="svs-contrast" aria-label="Toggle high contrast">◐</button>' +
            '</div>' +
        '</div>' +
        '<header class="sevasetu-header" role="banner" aria-label="Main navigation">' +
            '<a href="' + homeUrl + '" class="sevasetu-brand">' +
                '<div class="logo-icon" aria-hidden="true">SS</div>' +
                '<div><div class="logo-text">SevaSetu</div><div class="logo-tag">AI Powered Smart Governance Platform</div></div>' +
            '</a>' +
            '<nav class="sevasetu-nav" aria-label="Primary">' +
                '<a href="' + homeUrl + '">Home</a>' +
                '<a href="' + UP + 'about.html">About</a>' +
                '<a href="' + homeUrl + '#services">Services</a>' +
                '<a href="' + homeUrl + '#departments">Departments</a>' +
                '<a href="' + homeUrl + '#research">Research</a>' +
                '<a href="' + homeUrl + '#docs">Documentation</a>' +
                '<a href="' + homeUrl + '#contact">Contact</a>' +
            '</nav>' +
            '<div class="sevasetu-actions">' +
                '<a href="' + loginUrl + '" class="sevasetu-button btn-outline btn-sm">Login</a>' +
                '<a href="' + reportUrl + '" class="sevasetu-button btn-primary btn-sm">Register Complaint</a>' +
                '<a href="' + trackUrl + '" class="sevasetu-button btn-outline btn-sm">Track</a>' +
            '</div>' +
        '</header>';
    }

    // Compact header for module pages (aligned beside sidebar)
    function buildModuleHeader() {
        var session = null;
        try { session = JSON.parse(localStorage.getItem('svs_session') || 'null'); } catch (e) {}
        var role = (session && session.role) ? session.role : '';
        var roleLabels = { citizen: 'Citizen', officer: 'Officer', department: 'Department', admin: 'Admin', superadmin: 'Super Admin' };
        var roleLabel = roleLabels[role] || 'Module';
        var name = (session && session.name) ? session.name : 'User';

        var logout = '<button id="svs-logout" class="sevasetu-button btn-outline btn-sm" aria-label="Log out">Logout</button>';

        return '' +
        '<header class="sevasetu-module-header" role="banner" aria-label="Module header">' +
            '<a href="' + homeUrl + '" class="sevasetu-brand">' +
                '<div class="logo-icon" aria-hidden="true">SS</div>' +
                '<div><div class="logo-text">SevaSetu</div><div class="logo-tag">' + roleLabel + ' Portal</div></div>' +
            '</a>' +
            '<div class="sevasetu-module-meta">' +
                '<span class="mh-controls">' +
                    '<select id="svs-lang" aria-label="Select language"><option value="en">🌐 English</option><option value="mr">मराठी</option><option value="hi">हिन्दी</option></select>' +
                    '<button data-sfont="small" aria-label="Decrease font size">A-</button>' +
                    '<button data-sfont="base" aria-label="Default font size">A</button>' +
                    '<button data-sfont="large" aria-label="Increase font size">A+</button>' +
                    '<button id="svs-dark" aria-label="Toggle dark mode">🌙</button>' +
                    '<button id="svs-contrast" aria-label="Toggle high contrast">◐</button>' +
                '</span>' +
                '<span class="mh-user"><i class="bi bi-person-circle"></i> ' + mh(name) + ' <small>(' + roleLabel + ')</small></span>' +
                logout +
            '</div>' +
        '</header>';
    }

    // Simple HTML-escape helper for names
    function mh(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    // ---- Footer (same for both modes) ----
    function buildFooter() {
        return '' +
        '<footer class="sevasetu-footer" role="contentinfo">' +
            '<div class="sevasetu-footer-grid">' +
                '<div class="sevasetu-footer-col"><div class="fbrand">🏛️ SevaSetu</div><div class="ftag">AI Assisted Digital Grievance Management · Research Prototype</div></div>' +
                '<div class="sevasetu-footer-col"><h4>⚖️ Platform</h4>' +
                    '<a href="' + homeUrl + '">Home</a>' +
                    '<a href="' + reportUrl + '">Register Complaint</a>' +
                    '<a href="' + trackUrl + '">Track Complaint</a>' +
                    '<a href="' + homeUrl + '#how-it-works">How It Works</a></div>' +
                '<div class="sevasetu-footer-col"><h4>🔬 Information</h4>' +
                    '<a href="' + UP + 'about.html">About</a>' +
                    '<a href="' + homeUrl + '#services">Services</a>' +
                    '<a href="' + homeUrl + '#departments">Departments</a>' +
                    '<a href="' + homeUrl + '#research">Research</a></div>' +
                '<div class="sevasetu-footer-col"><h4>📚 Resources</h4>' +
                    '<a href="' + homeUrl + '#docs">Documentation</a>' +
                    '<a href="' + UP + 'pages/forgot-password.html">FAQ</a>' +
                    '<a href="' + homeUrl + '#accessibility">Accessibility</a></div>' +
                '<div class="sevasetu-footer-col"><h4>📧 Contact</h4>' +
                    '<a href="mailto:research@sevasetu.org">📧 research@sevasetu.org</a>' +
                    '<a href="tel:+910000000000">📞 +91-00000-00000</a></div>' +
            '</div>' +
            '<div class="sevasetu-footer-bottom">' +
                '<p>© 2026 SevaSetu · Research Prototype for Smart Governance · Not an Official Government Website</p>' +
                '<p style="margin-top:4px;">Built with ❤️ for Citizen-First Governance · 🇮🇳 Made in India</p>' +
            '</div>' +
        '</footer>';
    }

    // ---- Inject header + footer ----
    var rootEl = document.getElementById('sevasetu-root');
    var footEl = document.getElementById('sevasetu-footer');
    if (rootEl) rootEl.innerHTML = isModule ? buildModuleHeader() : buildPublicHeader();
    if (footEl) footEl.innerHTML = buildFooter();

    // ---- Global controls ----
    var htmlEl = document.documentElement;
    var srEl = document.getElementById('sr-announcer');
    function announce(msg) { if (!srEl) return; srEl.textContent=''; setTimeout(function(){srEl.textContent=msg;},50); }

    var darkBtn = document.getElementById('svs-dark');
    function applyDark(on) {
        if (on) { htmlEl.setAttribute('data-theme','dark'); if(darkBtn) darkBtn.textContent='☀️'; localStorage.setItem('svs_dark','1'); }
        else { htmlEl.removeAttribute('data-theme'); if(darkBtn) darkBtn.textContent='🌙'; localStorage.setItem('svs_dark','0'); }
    }
    if (localStorage.getItem('svs_dark')==='1') applyDark(true);
    if (darkBtn) darkBtn.addEventListener('click', function(){ applyDark(!htmlEl.hasAttribute('data-theme')); announce('Dark mode toggled'); });

    var contrastBtn = document.getElementById('svs-contrast');
    if (contrastBtn) contrastBtn.addEventListener('click', function(){
        if (htmlEl.hasAttribute('data-contrast')) { htmlEl.removeAttribute('data-contrast'); announce('High contrast disabled'); }
        else { htmlEl.setAttribute('data-contrast','high'); announce('High contrast enabled'); }
    });

    document.querySelectorAll('[data-sfont]').forEach(function(btn){
        btn.addEventListener('click', function(){
            var size = btn.getAttribute('data-sfont');
            htmlEl.removeAttribute('data-font');
            if (size !== 'base') htmlEl.setAttribute('data-font', size);
            localStorage.setItem('svs_font', size);
            announce('Font size ' + size);
        });
    });
    var savedFont = localStorage.getItem('svs_font');
    if (savedFont && savedFont !== 'base') htmlEl.setAttribute('data-font', savedFont);

    var langSel = document.getElementById('svs-lang');
    if (langSel) langSel.addEventListener('change', function(){ announce('Language changed to ' + langSel.options[langSel.selectedIndex].text); });

    // Logout for module pages
    var logoutBtn = document.getElementById('svs-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', function(){
        localStorage.removeItem('svs_session');
        window.location.href = loginUrl;
    });
})();
