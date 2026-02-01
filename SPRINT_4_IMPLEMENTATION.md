# Sprint 4: Implementation Completion Guide

## Project Status: MVP + PostgreSQL Integration (75% Complete)

### Completed in Sprint 4:
✅ Added PostgreSQL dependencies (sqlalchemy, psycopg2-binary, alembic)
✅ Created SQLAlchemy ORM models (database.py) with:
   - User model
   - ConsentRecord model with relationships
   - ConsentAuditLog, ComplianceCheck, WithdrawalRecord models
   - EncryptionKey, APILog, ConsentForm models
   - Proper indexing and foreign keys

### Remaining Tasks (Sprint 4-5):

## 1. Update Backend main.py with PostgreSQL Integration

**File:** `backend/app/main.py`

**Required changes:**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.database import Base, ConsentRecord, User, APILog
import os
from datetime import datetime

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/consent_detector")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Update endpoints to use database instead of in-memory storage
@app.post("/reports")
async def submit_report(report: ConsentReport, db: Session = Depends(get_db)):
    consent_record = ConsentRecord(
        user_id=UUID(report.session_id),
        document_type=report.consent_status,
        detected_emotion=report.emotions[0].emotion if report.emotions else None,
        emotion_confidence=float(report.emotions[0].confidence) if report.emotions else 0.0,
        user_consent=True,
        consent_timestamp=datetime.utcnow(),
        digital_signature=report.signature,
        jurisdiction="India"
    )
    db.add(consent_record)
    db.commit()
    db.refresh(consent_record)
    return {"status": "success", "consent_id": str(consent_record.id)}
```

## 2. Create Database Initialization Script

**File:** `backend/app/init_db.py`
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
import os

def init_db():
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully")

if __name__ == "__main__":
    init_db()
```

## 3. Integrate TensorFlow.js Models (Frontend)

**File:** `frontend/src/utils/emotionDetection.ts`

**Steps:**
1. Download pre-trained emotion detection model from:
   - https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd OR
   - Use: @tensorflow-models/coco-ssd for object detection
   - Use: @tensorflow-models/face-detection for face detection
   - Use: @tensorflow-models/emotion-detection (if available) OR
   - Implement custom emotion model using facial landmarks

2. Place models in `frontend/public/models/emotion/`

3. Update ConsentScreen.tsx to load and use models:
```typescript
import * as tf from '@tensorflow/tfjs';

const loadEmotionModel = async () => {
  const model = await tf.loadGraphModel(
    'models/emotion/model.json'
  );
  return model;
};

const detectEmotion = async (videoElement: HTMLVideoElement, model: tf.GraphModel) => {
  const predictions = model.predict(tf.browser.fromPixels(videoElement));
  return predictions;
};
```

## 4. Environment Configuration

**File:** `.env.example`
```
DATABASE_URL=postgresql://postgres:password@postgres:5432/consent_detector
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=consent_detector
REACT_APP_API_URL=http://localhost:8000
```

## 5. Docker Deployment Testing

**Update docker-compose.yml:**
- Ensure PostgreSQL service is configured
- Add environment variables
- Mount schema.sql for initialization
- Test with: `docker-compose up`

## 6. Production Deployment Checklist

- [ ] Set up PostgreSQL database on cloud provider (AWS RDS, Azure, DigitalOcean, etc.)
- [ ] Configure environment variables securely
- [ ] Deploy backend to cloud (Render, Railway, Heroku, AWS)
- [ ] Deploy frontend to CDN (Vercel, Netlify)
- [ ] Setup SSL/TLS certificates
- [ ] Configure CORS properly
- [ ] Setup monitoring and logging
- [ ] Create database backups
- [ ] Implement rate limiting
- [ ] Add authentication/authorization

## Implementation Priority:
1. **HIGH**: Update main.py with database integration (1-2 hours)
2. **HIGH**: Create init_db script and test locally (30 mins)
3. **MEDIUM**: TensorFlow.js integration (2-3 hours)
4. **MEDIUM**: Environment configuration (30 mins)
5. **MEDIUM**: Docker testing (1-2 hours)
6. **LOW**: Production deployment documentation (1 hour)

## Testing Steps:

1. **Local Testing:**
   ```bash
   # Install dependencies
   pip install -r backend/requirements.txt
   npm install --prefix frontend
   
   # Start PostgreSQL
   docker run -d -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=test postgres
   
   # Initialize database
   python backend/app/init_db.py
   
   # Start backend
   cd backend && python -m uvicorn app.main:app --reload
   
   # Start frontend
   npm start --prefix frontend
   ```

2. **Docker Testing:**
   ```bash
   docker-compose up --build
   # Access frontend at http://localhost:3000
   # Backend API at http://localhost:8000
   ```

## Database Connection Verification:

```python
# Test script
from sqlalchemy import create_engine, inspect
from app.database import Base

engine = create_engine("postgresql://user:password@localhost/consent_detector")
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Connected! Tables: {tables}")
```

## Next Steps:
1. Complete PostgreSQL integration in main.py
2. Test with sample data
3. Integrate TensorFlow.js models
4. Run full Docker deployment test
5. Deploy to production

## Support Resources:
- SQLAlchemy Docs: https://docs.sqlalchemy.org/
- TensorFlow.js: https://www.tensorflow.org/js
- FastAPI: https://fastapi.tiangolo.com/
- PostgreSQL: https://www.postgresql.org/docs/
