# SevaSetu Database Module

This folder contains the database design and schema for the SevaSetu
AI-Assisted Digital Grievance Management System (Research Prototype).

## Contents

- `schema.sql` — PostgreSQL 15+ / Supabase compatible DDL (27 tables, indexes, triggers, seed data)
- Full ER diagram, relationship maps and roadmap to be viewed in the prototype page (`../index.html` → Database Design view, or `../prototype.html`)

## Key Modules

| Module | Tables |
|--------|--------|
| Auth & RBAC | `users`, `roles` |
| Geography | `zones`, `wards` |
| Department | `departments`, `dept_hierarchy` |
| Officer | `officers`, `officer_assign`, `officer_performance` |
| Complaints | `complaints`, `complaint_status`, `complaint_media`, `complaint_videos` |
| AI Engine | `ai_analysis`, `ai_confidence_log`, `media_metadata` |
| Notifications | `notifications`, `notif_templates` |
| Feedback & SLA | `feedback`, `sla_policies` |
| Escalation | `escalation_matrix`, `escalation_history` |
| Analytics & Audit | `dept_performance`, `analytics_cache`, `audit_logs`, `system_config`, `citizen_profiles` |

## Next Phase

FastAPI Backend (60–100 APIs) → AI Engine Integration → React Frontend Integration →
Notification System → Security Hardening → Pilot Deployment

