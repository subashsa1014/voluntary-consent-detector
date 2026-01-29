-- PostgreSQL Schema for Voluntary Consent Detector
-- DPDPA 2023 Compliant Consent Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create consent_records table
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_hash VARCHAR(64),
    detected_emotion VARCHAR(50),
    emotion_confidence DECIMAL(3, 2),
    voice_sentiment VARCHAR(50),
    voice_confidence DECIMAL(3, 2),
    facial_landmarks JSON,
    user_consent BOOLEAN NOT NULL,
    consent_timestamp TIMESTAMP NOT NULL,
    consent_duration_seconds INTEGER,
    data_usage_purpose TEXT,
    data_retention_period VARCHAR(100),
    right_to_withdraw BOOLEAN DEFAULT TRUE,
    jurisdiction VARCHAR(50),
    ip_address INET,
    device_info JSON,
    browser_user_agent TEXT,
    encrypted_data TEXT,
    encryption_key_id VARCHAR(36),
    digital_signature VARCHAR(256),
    signature_algorithm VARCHAR(50),
    verification_status VARCHAR(50) DEFAULT 'pending',
    audit_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create consent_audit_log table for tracking changes
CREATE TABLE IF NOT EXISTS consent_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consent_record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    changed_fields JSON,
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(255),
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consent_record_id) REFERENCES consent_records(id) ON DELETE CASCADE
);

-- Create compliance_checks table
CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consent_record_id UUID NOT NULL,
    check_type VARCHAR(100) NOT NULL,
    compliance_standard VARCHAR(100),
    check_result BOOLEAN,
    issues_found JSON,
    remediation_steps TEXT,
    check_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_by VARCHAR(255),
    FOREIGN KEY (consent_record_id) REFERENCES consent_records(id) ON DELETE CASCADE
);

-- Create withdrawal_records table for tracking consent withdrawals
CREATE TABLE IF NOT EXISTS withdrawal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consent_record_id UUID NOT NULL,
    withdrawal_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    withdrawal_reason TEXT,
    withdrawal_method VARCHAR(50),
    data_deletion_status VARCHAR(50) DEFAULT 'pending',
    data_deletion_timestamp TIMESTAMP,
    verified_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consent_record_id) REFERENCES consent_records(id) ON DELETE CASCADE
);

-- Create encryption_keys table
CREATE TABLE IF NOT EXISTS encryption_keys (
    id VARCHAR(36) PRIMARY KEY,
    key_type VARCHAR(50) NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    key_data TEXT NOT NULL,
    key_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rotated_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by VARCHAR(255)
);

-- Create api_logs table for audit trail
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    user_id UUID,
    request_data JSON,
    response_status INTEGER,
    response_time_ms INTEGER,
    ip_address INET,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create consent_forms table for jurisdiction-specific forms
CREATE TABLE IF NOT EXISTS consent_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_name VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(50) NOT NULL,
    form_version VARCHAR(20) NOT NULL,
    form_template JSON NOT NULL,
    required_fields JSON,
    optional_fields JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(form_name, jurisdiction, form_version)
);

-- Create indices for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX idx_consent_records_created_at ON consent_records(created_at);
CREATE INDEX idx_consent_records_verification_status ON consent_records(verification_status);
CREATE INDEX idx_consent_records_jurisdiction ON consent_records(jurisdiction);
CREATE INDEX idx_consent_audit_log_consent_record_id ON consent_audit_log(consent_record_id);
CREATE INDEX idx_compliance_checks_consent_record_id ON compliance_checks(consent_record_id);
CREATE INDEX idx_withdrawal_records_consent_record_id ON withdrawal_records(consent_record_id);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX idx_consent_forms_jurisdiction ON consent_forms(jurisdiction);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_records_updated_at BEFORE UPDATE ON consent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_forms_updated_at BEFORE UPDATE ON consent_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your deployment)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres;
