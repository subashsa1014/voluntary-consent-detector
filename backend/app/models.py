from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
from uuid import UUID

# Request/Response Models for API

class ConsentRecordCreate(BaseModel):
    user_id: str
    document_type: str
    document_hash: Optional[str] = None
    detected_emotion: str
    emotion_confidence: float = Field(ge=0, le=1)
    voice_sentiment: Optional[str] = None
    voice_confidence: Optional[float] = Field(None, ge=0, le=1)
    facial_landmarks: Optional[Dict] = None
    user_consent: bool
    consent_timestamp: datetime
    consent_duration_seconds: Optional[int] = None
    data_usage_purpose: str
    data_retention_period: str
    right_to_withdraw: bool = True
    jurisdiction: str = "India"
    ip_address: Optional[str] = None
    device_info: Optional[Dict] = None
    browser_user_agent: Optional[str] = None
    encrypted_data: Optional[str] = None
    encryption_key_id: Optional[str] = None
    digital_signature: Optional[str] = None
    signature_algorithm: Optional[str] = "SHA-256"
    audit_notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_abc123",
                "document_type": "Property Sale Deed",
                "detected_emotion": "happy",
                "emotion_confidence": 0.87,
                "user_consent": True,
                "consent_timestamp": "2026-01-29T20:00:00Z",
                "consent_duration_seconds": 45,
                "data_usage_purpose": "Document registration verification",
                "data_retention_period": "7 years",
                "right_to_withdraw": True,
                "jurisdiction": "India",
                "digital_signature": "SIGNATURE_abc123"
            }
        }

class ConsentRecordResponse(BaseModel):
    id: UUID
    user_id: str
    document_type: str
    detected_emotion: str
    emotion_confidence: float
    user_consent: bool
    consent_timestamp: datetime
    jurisdiction: str
    verification_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConsentVerificationResponse(BaseModel):
    consent_id: UUID
    is_valid: bool
    verification_status: str
    compliance_checks: Dict
    issues: List[str]
    verified_at: datetime

class ComplianceCheckCreate(BaseModel):
    consent_record_id: UUID
    check_type: str
    compliance_standard: str = "DPDPA 2023"
    check_result: bool
    issues_found: Optional[List[str]] = []
    remediation_steps: Optional[str] = None
    checked_by: Optional[str] = "system"

class WithdrawalRequest(BaseModel):
    consent_record_id: UUID
    withdrawal_reason: Optional[str] = None
    withdrawal_method: str = "user_request"

class WithdrawalResponse(BaseModel):
    id: UUID
    consent_record_id: UUID
    withdrawal_timestamp: datetime
    data_deletion_status: str
    verified_by: Optional[str]

class UserCreate(BaseModel):
    email: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str]
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class ConsentFormTemplate(BaseModel):
    form_name: str
    jurisdiction: str
    form_version: str
    form_template: Dict
    required_fields: List[str]
    optional_fields: Optional[List[str]] = []
    is_active: bool = True

class APILogCreate(BaseModel):
    endpoint: str
    method: str
    user_id: Optional[UUID] = None
    request_data: Optional[Dict] = None
    response_status: int
    response_time_ms: int
    ip_address: Optional[str] = None
    error_message: Optional[str] = None

# Database connection utilities

import asyncpg
from typing import Optional

class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self, dsn: str):
        """Create database connection pool"""
        self.pool = await asyncpg.create_pool(dsn, min_size=5, max_size=20)
        print("Database connection pool created")

    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            print("Database connection pool closed")

    async def execute(self, query: str, *args):
        """Execute a database query"""
        async with self.pool.acquire() as connection:
            return await connection.execute(query, *args)

    async def fetch(self, query: str, *args):
        """Fetch multiple rows"""
        async with self.pool.acquire() as connection:
            return await connection.fetch(query, *args)

    async def fetchrow(self, query: str, *args):
        """Fetch a single row"""
        async with self.pool.acquire() as connection:
            return await connection.fetchrow(query, *args)

    async def fetchval(self, query: str, *args):
        """Fetch a single value"""
        async with self.pool.acquire() as connection:
            return await connection.fetchval(query, *args)

# Global database instance
db = Database()
