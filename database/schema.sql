-- ============================================
-- SevaSetu Database Schema v2.0
-- PostgreSQL 15+ / Supabase Compatible
-- 27 Tables · Production-Ready
-- Developed by: Vyankatesh Vivekanand Jaware
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. ROLES TABLE
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS TABLE
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    role_id UUID REFERENCES roles(role_id) ON DELETE SET NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DEPARTMENTS TABLE
CREATE TABLE departments (
    dept_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dept_name VARCHAR(100) NOT NULL,
    dept_code VARCHAR(20) UNIQUE NOT NULL,
    parent_dept UUID REFERENCES departments(dept_id) ON DELETE SET NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEPARTMENT HIERARCHY
CREATE TABLE dept_hierarchy (
    hierarchy_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dept_id UUID REFERENCES departments(dept_id) ON DELETE CASCADE,
    parent_dept_id UUID REFERENCES departments(dept_id) ON DELETE CASCADE,
    hierarchy_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ZONES TABLE
CREATE TABLE zones (
    zone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    boundary GEOMETRY(POLYGON, 4326),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WARDS TABLE
CREATE TABLE wards (
    ward_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_name VARCHAR(100) NOT NULL,
    zone_id UUID REFERENCES zones(zone_id) ON DELETE SET NULL,
    ward_number VARCHAR(10),
    population INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. OFFICERS TABLE
CREATE TABLE officers (
    officer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    dept_id UUID REFERENCES departments(dept_id) ON DELETE SET NULL,
    zone_id UUID REFERENCES zones(zone_id) ON DELETE SET NULL,
    badge_no VARCHAR(50) UNIQUE,
    rank VARCHAR(50) DEFAULT 'Field Officer',
    is_available BOOLEAN DEFAULT TRUE,
    current_load INTEGER DEFAULT 0,
    max_load INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMPLAINTS TABLE (Core)
CREATE TABLE complaints (
    complaint_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_number VARCHAR(20) UNIQUE NOT NULL,
    citizen_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50),
    description TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'mr',
    status VARCHAR(30) DEFAULT 'new',
    priority VARCHAR(20) DEFAULT 'medium',
    dept_id UUID REFERENCES departments(dept_id) ON DELETE SET NULL,
    officer_id UUID REFERENCES officers(officer_id) ON DELETE SET NULL,
    zone_id UUID REFERENCES zones(zone_id) ON DELETE SET NULL,
    ward_id UUID REFERENCES wards(ward_id) ON DELETE SET NULL,
    location_gps GEOMETRY(POINT, 4326),
    location_address TEXT,
    sla_deadline TIMESTAMPTZ,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 9. COMPLAINT STATUS HISTORY
CREATE TABLE complaint_status (
    status_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    remarks TEXT,
    gps_location GEOMETRY(POINT, 4326),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. COMPLAINT MEDIA
CREATE TABLE complaint_media (
    media_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    uploaded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    gps_location GEOMETRY(POINT, 4326),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. COMPLAINT VIDEOS
CREATE TABLE complaint_videos (
    video_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    duration_seconds INTEGER,
    uploaded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    gps_location GEOMETRY(POINT, 4326),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI ANALYSIS TABLE
CREATE TABLE ai_analysis (
    analysis_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    language_detected VARCHAR(10),
    translated_text TEXT,
    ocr_text TEXT,
    image_labels JSONB,
    classification VARCHAR(50),
    confidence_score DECIMAL(5,2),
    duplicate_flag BOOLEAN DEFAULT FALSE,
    duplicate_complaint_id UUID,
    priority_pred VARCHAR(20),
    dept_recommend VARCHAR(50),
    sla_minutes INTEGER,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AI CONFIDENCE LOG
CREATE TABLE ai_confidence_log (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    module_name VARCHAR(50),
    input_data JSONB,
    output_data JSONB,
    confidence DECIMAL(5,2),
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. NOTIFICATIONS
CREATE TABLE notifications (
    notif_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    type VARCHAR(30),
    channel VARCHAR(20) DEFAULT 'push',
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NOTIF TEMPLATES
CREATE TABLE notif_templates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(50) UNIQUE NOT NULL,
    subject_template TEXT,
    body_template TEXT NOT NULL,
    channels JSONB,
    is_active BOOLEAN DEFAULT TRUE
);

-- 16. FEEDBACK
CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ESCALATION MATRIX
CREATE TABLE escalation_matrix (
    escalation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dept_id UUID REFERENCES departments(dept_id) ON DELETE CASCADE,
    level_1_officer UUID REFERENCES officers(officer_id),
    level_2_officer UUID REFERENCES officers(officer_id),
    level_3_officer UUID REFERENCES officers(officer_id),
    auto_escalate_hours INTEGER DEFAULT 48,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. ESCALATION HISTORY
CREATE TABLE escalation_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    from_level VARCHAR(50),
    to_level VARCHAR(50),
    reason TEXT,
    escalated_by UUID REFERENCES users(user_id),
    escalated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 19. SLA POLICIES
CREATE TABLE sla_policies (
    sla_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    max_resolution_hours INTEGER NOT NULL,
    auto_escalate BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(category, priority)
);

-- 20. AUDIT LOGS
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 21. CITIZEN PROFILES
CREATE TABLE citizen_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    aadhaar_hash VARCHAR(255),
    address TEXT,
    preferred_language VARCHAR(10) DEFAULT 'mr',
    notification_pref JSONB,
    total_complaints INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. DEPT PERFORMANCE
CREATE TABLE dept_performance (
    perf_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dept_id UUID REFERENCES departments(dept_id) ON DELETE CASCADE,
    total_complaints INTEGER DEFAULT 0,
    resolved INTEGER DEFAULT 0,
    pending INTEGER DEFAULT 0,
    avg_resolution_hrs DECIMAL(7,2),
    sla_compliance DECIMAL(5,2),
    satisfaction_avg DECIMAL(3,2),
    period_start DATE,
    period_end DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. OFFICER PERFORMANCE
CREATE TABLE officer_performance (
    perf_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    officer_id UUID REFERENCES officers(officer_id) ON DELETE CASCADE,
    total_assigned INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    escalated INTEGER DEFAULT 0,
    avg_resolution_hrs DECIMAL(7,2),
    satisfaction_avg DECIMAL(3,2),
    period_start DATE,
    period_end DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. ANALYTICS CACHE
CREATE TABLE analytics_cache (
    cache_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value JSONB NOT NULL,
    filters JSONB,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(metric_name)
);

-- 25. SYSTEM CONFIG
CREATE TABLE system_config (
    config_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(user_id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. OFFICER ASSIGN
CREATE TABLE officer_assign (
    assign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    officer_id UUID REFERENCES officers(officer_id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(user_id),
    is_auto BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ
);

-- 27. MEDIA METADATA
CREATE TABLE media_metadata (
    metadata_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID REFERENCES complaint_media(media_id) ON DELETE CASCADE,
    exif_data JSONB,
    ai_labels JSONB,
    ocr_text TEXT,
    blur_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_dept ON complaints(dept_id);
CREATE INDEX idx_complaints_officer ON complaints(officer_id);
CREATE INDEX idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX idx_complaints_zone ON complaints(zone_id);
CREATE INDEX idx_complaints_created ON complaints(created_at);
CREATE INDEX idx_complaints_number ON complaints(complaint_number);
CREATE INDEX idx_ai_analysis_complaint ON ai_analysis(complaint_id);
CREATE INDEX idx_ai_confidence_complaint ON ai_confidence_log(complaint_id);
CREATE INDEX idx_status_complaint ON complaint_status(complaint_id);
CREATE INDEX idx_media_complaint ON complaint_media(complaint_id);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_feedback_complaint ON feedback(complaint_id);
CREATE INDEX idx_escalation_dept ON escalation_matrix(dept_id);
CREATE INDEX idx_officers_dept ON officers(dept_id);
CREATE INDEX idx_officers_zone ON officers(zone_id);
CREATE INDEX idx_officers_available ON officers(is_available, current_load);
CREATE INDEX idx_wards_zone ON wards(zone_id);
CREATE INDEX idx_dept_perf_dept ON dept_performance(dept_id);
CREATE INDEX idx_officer_perf_officer ON officer_performance(officer_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_complaints_updated
BEFORE UPDATE ON complaints
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO roles (role_name, permissions) VALUES
('citizen', '{"can_register_complaint": true, "can_track": true}'),
('officer', '{"can_accept": true, "can_update_status": true}'),
('department_head', '{"can_assign": true, "can_view_analytics": true}'),
('admin', '{"can_manage_all": true}'),
('super_admin', '{"can_configure_system": true}');

INSERT INTO sla_policies (category, priority, max_resolution_hours) VALUES
('Water Supply', 'high', 12),
('Road Damage', 'high', 24),
('Garbage', 'medium', 8),
('Street Light', 'medium', 48),
('Emergency', 'high', 4);

-- ============================================
-- END OF SCHEMA
-- Total: 27 Tables, 25+ Indexes, 2 Triggers
-- ============================================
