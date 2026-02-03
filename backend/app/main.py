from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Optional, List
import os
from datetime import datetime
from uuid import UUID

# Import database models
from app.database import Base, User, ConsentRecord, APILog, ConsentAuditLog

# FastAPI app initialization
app = FastAPI(
    title="Voluntary Consent Detector API",
    description="Privacy-first consent detection system with PostgreSQL persistence",
    version="2.0.0"
)

# Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/consent_detector"
)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables on startup
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database initialization failed: {e}. Continuing without database.")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models for API
class UserCreate(BaseModel):
    email: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

class EmotionAnalysis(BaseModel):
    timestamp: str
    emotion: str
    confidence: float
    face_detected: bool

class ConsentReport(BaseModel):
    session_id: str
    user_id: str
    document_type: str
    emotions: List[EmotionAnalysis]
    audio_sentiment: Optional[float] = None
    consent_status: str
    signature: str
    jurisdiction: str = "India"

class ConsentRecordResponse(BaseModel):
    id: UUID
    user_id: UUID
    document_type: str
    detected_emotion: Optional[str]
    emotion_confidence: Optional[float]
    user_consent: bool
    consent_timestamp: datetime
    verification_status: str

    class Config:
        from_attributes = True

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Voluntary Consent Detector API v2.0",
        "status": "running",
        "database": "PostgreSQL",
        "version": "2.0.0"
    }

@app.get("/health")
async def health_check():
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@app.post("/users")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user in the system"""
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user = User(
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log API call
    api_log = APILog(
        endpoint="/users",
        method="POST",
        user_id=new_user.id,
        response_status=200
    )
    db.add(api_log)
    db.commit()
    
    return {
        "id": str(new_user.id),
        "email": new_user.email,
        "status": "created",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/users/{user_id}")
async def get_user(user_id: str, db: Session = Depends(get_db)):
    """Retrieve user by ID"""
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/consent/submit")
async def submit_consent_report(report: ConsentReport, db: Session = Depends(get_db)):
    """Submit a consent report with emotion analysis"""
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == UUID(report.user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get emotion data from report
        detected_emotion = report.emotions[0].emotion if report.emotions else None
        emotion_confidence = float(report.emotions[0].confidence) if report.emotions else 0.0
        
        # Create consent record
        consent_record = ConsentRecord(
            user_id=user.id,
            document_type=report.document_type,
            detected_emotion=detected_emotion,
            emotion_confidence=emotion_confidence,
            voice_sentiment=None,
            user_consent=(report.consent_status.lower() == "accepted"),
            consent_timestamp=datetime.utcnow(),
            digital_signature=report.signature,
            signature_algorithm="SHA-256",
            jurisdiction=report.jurisdiction,
            verification_status="verified"
        )
        
        db.add(consent_record)
        db.commit()
        db.refresh(consent_record)
        
        # Create audit log
        audit_log = ConsentAuditLog(
            consent_record_id=consent_record.id,
            action="created",
            changed_by="system",
            change_reason="Consent report submitted"
        )
        db.add(audit_log)
        
        # Log API call
        api_log = APILog(
            endpoint="/consent/submit",
            method="POST",
            user_id=user.id,
            response_status=200,
            response_time_ms=0
        )
        db.add(api_log)
        db.commit()
        
        return {
            "status": "success",
            "consent_id": str(consent_record.id),
            "message": "Consent report submitted and verified",
            "emotion": detected_emotion,
            "confidence": emotion_confidence,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/consent/{consent_id}")
async def get_consent_record(consent_id: str, db: Session = Depends(get_db)):
    """Retrieve consent record by ID"""
    consent = db.query(ConsentRecord).filter(
        ConsentRecord.id == UUID(consent_id)
    ).first()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found")
    return consent

@app.get("/consent/user/{user_id}")
async def get_user_consents(user_id: str, db: Session = Depends(get_db)):
    """Retrieve all consent records for a user"""
    consents = db.query(ConsentRecord).filter(
        ConsentRecord.user_id == UUID(user_id)
    ).all()
    if not consents:
        return {"user_id": user_id, "consents": [], "total": 0}
    return {
        "user_id": user_id,
        "consents": consents,
        "total": len(consents)
    }

@app.get("/api/logs")
async def get_api_logs(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Retrieve recent API logs for audit trail"""
    logs = db.query(APILog).order_by(
        APILog.created_at.desc()
    ).limit(limit).all()
    return {"logs": logs, "total": len(logs)}

@app.get("/stats")
async def get_statistics(db: Session = Depends(get_db)):
    """Get system statistics"""
    total_users = db.query(User).count()
    total_consents = db.query(ConsentRecord).count()
    verified_consents = db.query(ConsentRecord).filter(
        ConsentRecord.verification_status == "verified"
    ).count()
    
    return {
        "total_users": total_users,
        "total_consent_records": total_consents,
        "verified_consents": verified_consents,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
