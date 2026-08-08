/* ============================================================
   SEVASETU — SHARED LAYOUT & THEME (civic.js)
   ------------------------------------------------------------
   Injects the homepage-style header + footer onto any page and
   applies dark mode / high contrast / font size / language +
   mobile nav + skip link. This guarantees every page looks and
   feels like the homepage (CIP.html).

   HOW TO USE ON ANY PAGE:
   <link rel="stylesheet" href="../assets/css/civic.css">
   <body>
     <div id="civic-root"></div>   <!-- header injected here -->
     <a href="#main-content" class="skip-link">Skip to content</a>
     <main id="main-content"> ...your page... </main>
     <div id="civic-footer"></div> <!-- footer injected here -->
     <script src="../assets/js/civic.js"></script>
   </body>

   It auto-computes relative paths based on the folder depth.
   ============================================================ */

(function () {
    'use strict';

    // ---- Compute path depth from the current file location ----
    // Files in root use "" ... files in citizen/ use "../" etc.
    var path = window.location.pathname;
    var parts = path.split('/');
    parts.pop(); // remove filename
    var depth = 0;
    // count how many folder segments exist under the project root
    var knownRoots = ['citizen','officer','department','admin','superadmin','pages','assets','database','js'];
    parts.forEach(function (p) {
        if (p && knownRoots.indexOf(p) !== -1) depth++;
    });
    var UP = '';
    for (var i = 0; i < depth; i++) UP += '../';
    // For root pages depth=0 -> UP=''
    // For citizen/track.html -> UP='../'

    var ROOT = UP; // path back to project root

    // ---- Build the shared header HTML ----
    function buildHeader() {
        return '' +
        '<div class="civic-utility" role="banner" aria-label="Platform utility bar">' +
            '<div class="cu-left"><span class="flag">🇮🇳</span><span>Research Prototype · Conceptual Platform</span><span class="tag">Not an official government website</span></div>' +
            '<div class="cu-right">' +
                '<select id="lang-select" aria-label="Select language"><option value="en">🌐 English</option><option value="mr">मराठी</option><option value="hi">हिन्दी</option></select>' +
                '<button data-afont="small" aria-label="Decrease font size">A-</button>' +
                '<button data-afont="base" aria-label="Default font size">A</button>' +
                '<button data-afont="large" aria-label="Increase font size">A+</button>' +
                '<button id="dark-btn" aria-label="Toggle dark mode">🌙</button>' +
                '<button id="contrast-btn" aria-label="Toggle high contrast">◐</button>' +
            '</div>' +
        '</div>' +
        '<header class="civic-header" role="navigation" aria-label="Main navigation">' +
            '<a href="' + ROOT + 'CIP.html" class="civic-brand">' +
                '<div class="logo-icon" aria-hidden="true">SS</div>' +
                '<div><div class="logo-text">SevaSetu</div><div class="logo-tag">Connecting Citizens. Improving Governance.</div></div>' +
            '</a>' +
            '<nav class="civic-nav" aria-label="Primary">' +
                '<a href="' + ROOT + 'CIP.html#hero">Home</a>' +
                '<a href="' + ROOT + 'CIP.html#how-it-works">How It Works</a>' +
                '<a href="' + ROOT + 'citizen/register-complaint.html">Report an Issue</a>' +
                '<a href="' + ROOT + 'citizen/track.html">Track Complaint</a>' +
                '<a href="' + ROOT + 'about.html">About</a>' +
                '<a href="' + ROOT + 'CIP.html#accessibility">Accessibility</a>' +
            '</nav>' +
            '<div class="civic-actions">' +
                '<a href="' + ROOT + 'pages/login.html" class="btn btn-outline btn-sm">Login</a>' +
                '<a href="' + ROOT + 'citizen/register-complaint.html" class="btn btn-primary btn-sm">Report an Issue</a>' +
            '</div>' +
        '</header>';
    }

    // ---- Build the shared footer ----
    function buildFooter() {
        return '' +
        '<footer class="civic-footer" role="contentinfo">' +
            '<div class="civic-footer-grid">' +
                '<div class="civic-footer-col"><div class="fbrand">SevaSetu</div><div class="ftag">Connecting Citizens. Improving Governance.</div></div>' +
                '<div class="civic-footer-col"><h4>Platform</h4>' +
                    '<a href="' + ROOT + 'citizen/register-complaint.html">Report an Issue</a>' +
                    '<a href="' + ROOT + 'citizen/track.html">Track Complaint</a>' +
                    '<a href="' + ROOT + 'CIP.html#how-it-works">How It Works</a>' +
                    '<a href="' + ROOT + 'CIP.html#accessibility">Accessibility</a></div>' +
                '<div class="civic-footer-col"><h4>Information</h4>' +
                    '<a href="' + ROOT + 'about.html">About</a>' +
                    '<a href="' + ROOT + 'CIP.html#research">Research</a>' +
                    '<a href="#">Privacy</a><a href="#">Terms</a></div>' +
                '<div class="civic-footer-col"><h4>Support</h4>' +
                    '<a href="' + ROOT + 'pages/login.html">Help Center</a>' +
                    '<a href="#">Contact</a>' +
                    '<a href="' + ROOT + 'CIP.html#accessibility">Accessibility Support</a></div>' +
            '</div>' +
            '<div class="civic-footer-bottom"><p>© 2026 SevaSetu. All rights reserved.</p><p style="margin-top:4px;">Built for citizen-centered digital governance · Research Prototype</p></div>' +
        '</footer>';
    }

    // ---- Inject header + footer ----
    var rootEl = document.getElementById('civic-root');
    var footerEl = document.getElementById('civic-footer');
    if (rootEl) rootEl.innerHTML = buildHeader();
    if (footerEl) footerEl.innerHTML = buildFooter();

    // Expose path helper for pages that need it
    window.CIVIC_BASE = ROOT;

    // ---- Theme helpers (dark, contrast, font, lang) ----
    var htmlEl = document.documentElement;
    var sr = document.getElementById('sr-announcer');
    function announce(msg) {
        if (!sr) return;
        sr.textContent = '';
        setTimeout(function () { sr.textContent = msg; }, 50);
    }

    // Dark mode
    var darkBtn = document.getElementById('dark-btn');
    function applyDark(on) {
        if (on) { htmlEl.setAttribute('data-theme','dark'); if (darkBtn) darkBtn.textContent='☀️'; localStorage.setItem('svs_dark','1'); }
        else { htmlEl.removeAttribute('data-theme'); if (darkBtn) darkBtn.textContent='🌙'; localStorage.setItem('svs_dark','0'); }
    }
    if (localStorage.getItem('svs_dark')==='1') applyDark(true);
    if (darkBtn) darkBtn.addEventListener('click', function () { applyDark(!htmlEl.hasAttribute('data-theme')); announce('Dark mode toggled'); });

    // High contrast
    var contrastBtn = document.getElementById('contrast-btn');
    if (contrastBtn) contrastBtn.addEventListener('click', function () {
        if (htmlEl.hasAttribute('data-contrast')) { htmlEl.removeAttribute('data-contrast'); announce('High contrast disabled'); }
        else { htmlEl.setAttribute('data-contrast','high'); announce('High contrast enabled'); }
    });

    // Font size
    document.querySelectorAll('[data-afont]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var size = btn.getAttribute('data-afont');
            htmlEl.removeAttribute('data-font');
            if (size !== 'base') htmlEl.setAttribute('data-font', size);
            localStorage.setItem('svs_font', size);
            announce('Font size ' + size);
        });
    });
    var savedFont = localStorage.getItem('svs_font');
    if (savedFont && savedFont !== 'base') htmlEl.setAttribute('data-font', savedFont);

    // Language selector
    var langSel = document.getElementById('lang-select');
    if (langSel) langSel.addEventListener('change', function () {
        announce('Language changed to ' + langSel.options[langSel.selectedIndex].text);
    });
})();
