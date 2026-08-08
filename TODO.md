# SevaSetu — Full Integration & Homepage-Style Consistency Plan

## Goal
Make every page match the homepage (CIP.html) design system — same background, text, colors, header/footer, cards, badges, tables — and connect all modules to one shared data store.

## Shared system (done)
- [x] `assets/css/sevasetu.css` — shared homepage design system
- [x] `assets/js/sevasetu.js` — shared layout engine (header/footer/dark/contrast/font)
- [x] Public pages: about, services, departments, research, faq, how-it-works, ai, documentation, contact
- [x] pages/login.html, pages/register.html

## Citizen module
- [x] citizen/dashboard.html
- [x] citizen/register-complaint.html
- [x] citizen/track.html
- [x] citizen/history.html
- [x] citizen/complaint-details.html
- [x] citizen/emergency.html
- [x] citizen/profile.html
- [x] citizen/feedback.html

## Officer module
- [x] officer/dashboard.html
- [x] officer/assigned.html
- [x] officer/complaint-details.html
- [x] officer/update-status.html
- [x] officer/upload-proof.html
- [x] officer/gps-verification.html
- [x] officer/escalation.html
- [x] officer/profile.html
- [x] officer/performance.html

## Department module
- [x] department/dashboard.html
- [x] department/complaints.html
- [x] department/officers.html
- [x] department/analytics.html
- [x] department/heatmap.html
- [x] department/export.html

## Admin module
- [x] admin/dashboard.html
- [x] admin/departments.html
- [x] admin/citizens.html
- [x] admin/officers.html
- [x] admin/ai-analytics.html
- [x] admin/statistics.html
- [x] admin/audit-logs.html
- [x] admin/notifications.html
- [x] admin/reports.html
- [x] admin/settings.html

## Super Admin module
- [x] superadmin/dashboard.html
- [x] superadmin/states.html
- [x] superadmin/cities.html
- [x] superadmin/departments.html
- [x] superadmin/officers.html
- [x] superadmin/ai-settings.html
- [x] superadmin/database.html
- [x] superadmin/security.html
- [x] superadmin/settings.html
- [x] superadmin/system-health.html
- [x] superadmin/backups.html
- [x] superadmin/logs.html

## Final verification
- [x] Shared design system (assets/css/sevasetu.css + assets/js/sevasetu.js) applied to ALL pages
- [x] Every module page uses homepage-style header/footer/nav/background/cards/badges
- [x] All pages read/write through the single SVS store (store.js) for data consistency
- [x] Officer/Department/Admin/SuperAdmin modules fully built with role navigation
- [x] `.b-amber` badge alias added to shared CSS for consistency
