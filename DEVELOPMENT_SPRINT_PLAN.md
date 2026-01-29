# DEVELOPMENT SPRINT PLAN - NEXT STEPS 🚀

**Project**: Voluntary Consent Detector
**Repository**: https://github.com/subashsa1014/voluntary-consent-detector
**Status**: Starting Phase 2 - Development Sprints
**Date**: January 29, 2026

---

## 📅 SPRINT ROADMAP (5 Sprints - 10-12 Weeks)

### SPRINT 1: Repository Setup & Core Infrastructure (Week 1-2)

**Goal**: Get local development environment running with all scaffolds

#### Tasks:
1. **Clone Repository Locally**
   ```bash
   git clone https://github.com/subashsa1014/voluntary-consent-detector.git
   cd voluntary-consent-detector
   ```
   
2. **Download Scaffold Files from Copilot**
   - Backend scaffold (Dockerfile, requirements.txt, main.py)
   - Frontend scaffold (Dockerfile, package.json, components, utils)
   - Configuration files (.gitignore, docker-compose.yml)
   
3. **Verify Project Structure**
   ```bash
   tree -L 3  # Verify directory structure
   ```

4. **Test Docker Build (No Run Yet)**
   ```bash
   docker-compose build
   ```
   
5. **Commit Infrastructure Code**
   - Add all backend files
   - Add all frontend scaffold files
   - Commit message: "Sprint 1: Add project scaffolds (backend, frontend, config)"

**Deliverables**:
- ✅ All scaffold files in repository
- ✅ Docker build successful
- ✅ Commit #3 pushed
- ✅ Environment documented in SPRINT_1.md

**Timeline**: 3-4 days

---

### SPRINT 2: TensorFlow.js Model Integration (Week 2-3)

**Goal**: Integrate on-device emotion recognition and audio analysis models

#### Tasks:
1. **Download TensorFlow.js Models**
   - Emotion detection model: FER+ or AffectNet-based model
   - Audio sentiment model: wav2vec2 or similar
   - Save to `frontend/public/models/emotion/`
   
2. **Update Frontend Utils**
   - Implement `analyzeFrameWithModel()` in frontend/src/utils/model.ts
   - Integrate TensorFlow.js model loading
   - Test model inference on sample frames
   
3. **Create Model Test Component**
   - Create test page to load and verify models
   - Display inference results
   
4. **Update Frontend Build**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

5. **Test Local Inference**
   - Run inference on sample images/audio
   - Verify accuracy and performance
   
**Deliverables**:
- ✅ TensorFlow.js models integrated
- ✅ Model inference working
- ✅ Commit #4: "Sprint 2: Integrate TensorFlow.js models for emotion & audio analysis"
- ✅ Performance metrics documented

**Timeline**: 4-5 days

---

### SPRINT 3: Backend + PostgreSQL Setup (Week 3-4)

**Goal**: Setup database and implement data persistence

#### Tasks:
1. **Setup PostgreSQL Database**
   - Create local PostgreSQL instance (Docker)
   - Create database schema for sessions, reports, media metadata
   
2. **Create Database Models**
   - Session model (user_id, session_date, consent_status)
   - Report model (session_id, emotion_scores, audio_sentiment)
   - User model (user_id, email, consent_given)
   
3. **Update Backend FastAPI**
   - Replace in-memory store with SQLAlchemy ORM
   - Implement database migration scripts
   - Add endpoints: POST /sessions, GET /sessions/:id, POST /reports
   
4. **Database Migrations**
   ```bash
   cd backend
   alembic init migrations
   alembic revision --autogenerate -m "Initial schema"
   alembic upgrade head
   ```

5. **Test Backend Endpoints**
   - Create session: POST /sessions
   - Get session: GET /sessions/:id
   - Submit report: POST /reports
   
**Deliverables**:
- ✅ PostgreSQL running
- ✅ Database schema implemented
- ✅ Backend endpoints working
- ✅ Commit #5: "Sprint 3: Implement PostgreSQL backend with SQLAlchemy ORM"

**Timeline**: 5-6 days

---

### SPRINT 4: Consent UI & Frontend Integration (Week 4-5)

**Goal**: Build user-facing consent capture UI

#### Tasks:
1. **Create Consent Screen Component**
   - Display consent text (India DPDPA compliant)
   - Get explicit user agreement
   - Explain data collection & processing
   
2. **Build Capture UI (Capture.tsx Enhancement)**
   - Show webcam preview
   - Show microphone indicator
   - Start/stop recording buttons
   - Real-time emotion indicator
   - Audio level meter
   
3. **Implement Client-Side Signing**
   - Test RSA key generation in crypto.ts
   - Sign report with private key
   - Export public key for backend
   
4. **Create Results Screen**
   - Display emotion analysis results
   - Show audio sentiment scores
   - Display final consent classification (Voluntary/Doubtful/Forced)
   - Option to retry or submit
   
5. **Frontend State Management**
   - Use React Context or Redux for state
   - Manage session lifecycle
   - Handle errors gracefully
   
**Deliverables**:
- ✅ Consent UI complete
- ✅ Capture component enhanced
- ✅ Results display working
- ✅ Commit #6: "Sprint 4: Build consent capture UI and results display"

**Timeline**: 5-6 days

---

### SPRINT 5: Testing, Security Hardening & Deployment (Week 5-6)

**Goal**: QA, security review, and production readiness

#### Tasks:
1. **Docker Deployment Testing**
   ```bash
   docker-compose build
   docker-compose up
   # Test frontend: http://localhost:3000
   # Test backend: http://localhost:8000
   ```

2. **Security Hardening**
   - Verify RSA signing/verification
   - Enable HTTPS/TLS
   - Add authentication (JWT tokens)
   - Rate limiting on endpoints
   - Input validation
   
3. **Unit & Integration Tests**
   - Backend: FastAPI tests
   - Frontend: React component tests
   - Cryptography tests
   
4. **Performance Testing**
   - Model inference speed
   - API response times
   - Database query optimization
   
5. **Documentation**
   - API documentation (Swagger)
   - Deployment guide
   - Security considerations
   
6. **Production Deployment**
   - Deploy to Render.com or similar
   - Configure environment variables
   - Setup CI/CD pipeline
   
**Deliverables**:
- ✅ All tests passing
- ✅ Security review complete
- ✅ Deployed to staging
- ✅ Commit #7: "Sprint 5: Complete testing, security hardening, and deploy"
- ✅ Production deployment instructions

**Timeline**: 5-7 days

---

## 🎯 IMMEDIATE NEXT STEPS (Next 24 Hours)

### Step 1: Clone Repository (30 min)
```bash
git clone https://github.com/subashsa1014/voluntary-consent-detector.git
cd voluntary-consent-detector
```

### Step 2: Download Scaffold Files (1 hour)
- From earlier Copilot conversation, download:
  - backend/ folder (all 3 files)
  - frontend/ folder (all 6+ files)
  - Configuration files
  
### Step 3: Organize Repository Structure (30 min)
```bash
# Ensure structure:
voluntary-consent-detector/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/main.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   ├── index.html
│   │   └── models/
│   └── src/
│       ├── App.tsx
│       ├── index.tsx
│       ├── components/Capture.tsx
│       └── utils/
├── .gitignore
├── docker-compose.yml
└── README.md
```

### Step 4: Test Docker Build (1 hour)
```bash
docker-compose build  # Should complete successfully
```

### Step 5: Commit to Git (30 min)
```bash
git add .
git commit -m "Sprint 1: Add project scaffolds (backend, frontend, config)"
git push origin main
```

---

## 📊 SPRINT TIMELINE SUMMARY

| Sprint | Focus | Duration | Status |
|--------|-------|----------|--------|
| 1 | Infrastructure Setup | Week 1-2 | ⏭️ Starting |
| 2 | ML Model Integration | Week 2-3 | ⏸️ Queued |
| 3 | Database Backend | Week 3-4 | ⏸️ Queued |
| 4 | Consent UI | Week 4-5 | ⏸️ Queued |
| 5 | Testing & Deploy | Week 5-6 | ⏸️ Queued |

**Total Duration**: 10-12 weeks
**Parallel Work**: Frontend and backend can be developed in parallel starting Sprint 2

---

## 🛠️ REQUIRED TOOLS & SETUP

### Local Development Setup:
- Git
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- npm or yarn
- PostgreSQL client (psql)
- VS Code or IDE

### Commands to Verify Setup:
```bash
git --version
docker --version
python --version
node --version
psql --version
```

---

## 📝 DOCUMENTATION TO TRACK

- [ ] SPRINT_1_PROGRESS.md - Daily standup notes
- [ ] SPRINT_2_MODELS.md - ML model details
- [ ] SPRINT_3_DATABASE.md - Schema documentation
- [ ] SPRINT_4_UI.md - Component descriptions
- [ ] SPRINT_5_DEPLOYMENT.md - Deployment guide

---

## ✅ SUCCESS CRITERIA

✅ All sprints completed on schedule
✅ All commits pushed to main branch
✅ Docker containers build and run successfully
✅ Frontend captures media and signs reports
✅ Backend verifies signatures and stores data
✅ PostgreSQL persists all data
✅ Production deployment successful
✅ Security review passed
✅ All tests passing

---

## 🚀 LET'S BUILD!

**Next Action**: Clone the repository and start Sprint 1!

```bash
git clone https://github.com/subashsa1014/voluntary-consent-detector.git
cd voluntary-consent-detector
```

**Owner**: subashsa1014
**Location**: Chennai, Tamil Nadu, India
**Started**: January 29, 2026, 7 PM IST
