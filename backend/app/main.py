from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from datetime import datetime

app = FastAPI(
    title="Voluntary Consent Detector API",
    description="Privacy-first consent detection system",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SessionRequest(BaseModel):
    user_id: str
    document_id: Optional[str] = None

class EmotionAnalysis(BaseModel):
    timestamp: str
    emotion: str
    confidence: float
    face_detected: bool

class ConsentReport(BaseModel):
    session_id: str
    emotions: list[EmotionAnalysis]
    audio_sentiment: Optional[float] = None
    consent_status: str
    signature: str

# In-memory storage (replace with DB in production)
sessions_db = {}
reports_db = {}

@app.get("/")
async def root():
    return {
        "message": "Voluntary Consent Detector API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/sessions")
async def create_session(request: SessionRequest):
    session_id = f"sess_{request.user_id}_{datetime.now().timestamp()}"
    sessions_db[session_id] = {
        "user_id": request.user_id,
        "created_at": datetime.now().isoformat(),
        "document_id": request.document_id
    }
    return {"session_id": session_id, "status": "created"}

@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    return sessions_db[session_id]

@app.post("/reports")
async def submit_report(report: ConsentReport):
    reports_db[report.session_id] = report.model_dump()
    return {
        "status": "success",
        "message": "Report submitted and signed",
        "session_id": report.session_id
    }

@app.get("/reports/{session_id}")
async def get_report(session_id: str):
    if session_id not in reports_db:
        raise HTTPException(status_code=404, detail="Report not found")
    return reports_db[session_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
