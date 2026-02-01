# SQLAlchemy ORM Models for PostgreSQL Database
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, JSON, Text, ForeignKey, Index, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Session
from datetime import datetime
import uuid
from typing import Optional

# Database configuration
Base = declarative_base()

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    phone_number = Column(String(20), nullable=True)
    date_of_birth = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    consent_records = relationship("ConsentRecord", back_populates="user", cascade="all, delete-orphan")


class ConsentRecord(Base):
    __tablename__ = "consent_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    document_type = Column(String(100), nullable=False)
    document_hash = Column(String(64), nullable=True)
    detected_emotion = Column(String(50), nullable=True)
    emotion_confidence = Column(DECIMAL(3, 2), nullable=True)
    voice_sentiment = Column(String(50), nullable=True)
    voice_confidence = Column(DECIMAL(3, 2), nullable=True)
    facial_landmarks = Column(JSON, nullable=True)
    user_consent = Column(Boolean, nullable=False)
    consent_timestamp = Column(DateTime, nullable=False)
    consent_duration_seconds = Column(Integer, nullable=True)
    data_usage_purpose = Column(Text, nullable=True)
    data_retention_period = Column(String(100), nullable=True)
    right_to_withdraw = Column(Boolean, default=True)
    jurisdiction = Column(String(50), nullable=True)
    ip_address = Column(INET, nullable=True)
    device_info = Column(JSON, nullable=True)
    browser_user_agent = Column(Text, nullable=True)
    encrypted_data = Column(Text, nullable=True)
    encryption_key_id = Column(String(36), nullable=True)
    digital_signature = Column(String(256), nullable=True)
    signature_algorithm = Column(String(50), nullable=True)
    verification_status = Column(String(50), default="pending")
    audit_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="consent_records")
    audit_logs = relationship("ConsentAuditLog", back_populates="consent_record", cascade="all, delete-orphan")
    compliance_checks = relationship("ComplianceCheck", back_populates="consent_record", cascade="all, delete-orphan")
    withdrawal_records = relationship("WithdrawalRecord", back_populates="consent_record", cascade="all, delete-orphan")
    
    # Indices
    __table_args__ = (
        Index("idx_consent_records_user_id", "user_id"),
        Index("idx_consent_records_created_at", "created_at"),
        Index("idx_consent_records_verification_status", "verification_status"),
        Index("idx_consent_records_jurisdiction", "jurisdiction"),
    )


class ConsentAuditLog(Base):
    __tablename__ = "consent_audit_log"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consent_record_id = Column(UUID(as_uuid=True), ForeignKey("consent_records.id"), nullable=False)
    action = Column(String(50), nullable=False)
    changed_fields = Column(JSON, nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    changed_by = Column(String(255), nullable=True)
    change_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    consent_record = relationship("ConsentRecord", back_populates="audit_logs")
    
    # Indices
    __table_args__ = (
        Index("idx_consent_audit_log_consent_record_id", "consent_record_id"),
    )


class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consent_record_id = Column(UUID(as_uuid=True), ForeignKey("consent_records.id"), nullable=False)
    check_type = Column(String(100), nullable=False)
    compliance_standard = Column(String(100), nullable=True)
    check_result = Column(Boolean, nullable=True)
    issues_found = Column(JSON, nullable=True)
    remediation_steps = Column(Text, nullable=True)
    check_timestamp = Column(DateTime, default=datetime.utcnow)
    checked_by = Column(String(255), nullable=True)
    
    # Relationships
    consent_record = relationship("ConsentRecord", back_populates="compliance_checks")
    
    # Indices
    __table_args__ = (
        Index("idx_compliance_checks_consent_record_id", "consent_record_id"),
    )


class WithdrawalRecord(Base):
    __tablename__ = "withdrawal_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consent_record_id = Column(UUID(as_uuid=True), ForeignKey("consent_records.id"), nullable=False)
    withdrawal_timestamp = Column(DateTime, default=datetime.utcnow)
    withdrawal_reason = Column(Text, nullable=True)
    withdrawal_method = Column(String(50), nullable=True)
    data_deletion_status = Column(String(50), default="pending")
    data_deletion_timestamp = Column(DateTime, nullable=True)
    verified_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    consent_record = relationship("ConsentRecord", back_populates="withdrawal_records")
    
    # Indices
    __table_args__ = (
        Index("idx_withdrawal_records_consent_record_id", "consent_record_id"),
    )


class EncryptionKey(Base):
    __tablename__ = "encryption_keys"
    
    id = Column(String(36), primary_key=True)
    key_type = Column(String(50), nullable=False)
    algorithm = Column(String(50), nullable=False)
    key_data = Column(Text, nullable=False)
    key_version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    rotated_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_by = Column(String(255), nullable=True)


class APILog(Base):
    __tablename__ = "api_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    endpoint = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    request_data = Column(JSON, nullable=True)
    response_status = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    ip_address = Column(INET, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Indices
    __table_args__ = (
        Index("idx_api_logs_created_at", "created_at"),
        Index("idx_api_logs_endpoint", "endpoint"),
    )


class ConsentForm(Base):
    __tablename__ = "consent_forms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    form_name = Column(String(255), nullable=False)
    jurisdiction = Column(String(50), nullable=False)
    form_version = Column(String(20), nullable=False)
    form_template = Column(JSON, nullable=False)
    required_fields = Column(JSON, nullable=True)
    optional_fields = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indices
    __table_args__ = (
        Index("idx_consent_forms_jurisdiction", "jurisdiction"),
    )
