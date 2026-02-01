# Voluntary Consent Detector

**AI-based Voluntary Consent Detection System with On-Device Privacy-First Architecture**

An innovative solution for verifying voluntary consent in online document registration using facial emotion recognition and voice sentiment analysis.

## Overview

- **Frontend**: React + TypeScript with on-device emotion & audio analysis (TensorFlow.js)
- **Backend**: FastAPI with RSA signature verification and session management
- **Architecture**: Privacy-first, on-device inference (no raw media upload by default)
- **Jurisdiction**: India-compliant with explicit informed consent
- **Security**: Client-side RSA signing, end-to-end encryption

## Quick Start (Local)

```bash
git clone https://github.com/subashsa1014/voluntary-consent-detector.git
cd voluntary-consent-detector

# Build and run with Docker
docker-compose build
docker-compose up

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## Project Structure

```
voluntary-consent-detector/
├─ backend/
│  ├─ app/
│  │  ├─ main.py
│  │  └─ __init__.py
│  ├─ Dockerfile
│  └─ requirements.txt
├─ frontend/
│  ├─ public/
│  │  ├─ models/
│  │  └─ index.html
│  ├─ src/
│  │  ├─ components/
│  │  ├─ utils/
│  │  ├─ App.tsx
│  │  └─ index.tsx
│  ├─ Dockerfile
│  └─ package.json
├─ .gitignore
├─ docker-compose.yml
├─ README.md
└─ LEGAL_NOTICE.md
```

## Features

✅ On-device emotion recognition (TensorFlow.js)
✅ Voice sentiment analysis with audio processing
✅ Client-side RSA cryptographic signing
✅ Backend signature verification
✅ Privacy-first (no raw media upload default)
✅ India jurisdiction compliance
✅ Docker containerization
✅ CI/CD ready

## Technology Stack

### Backend

- FastAPI (Python 3.11)
- Uvicorn ASGI server
- Pydantic for validation
- Cryptography for RSA operations
- PostgreSQL for data persistence
- SQLAlchemy ORM

### Frontend

- React 18+ with TypeScript
- TensorFlow.js for ML inference
- WebRTC for media capture
- Web Crypto API for signing

### Infrastructure

- Docker & Docker Compose
- GitHub Actions (CI/CD)

## Development

1. **Frontend setup**:

```bash
cd frontend
npm install
npm start
```

2. **Backend setup**:

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

## Important Notes

- Add TensorFlow.js models to `frontend/public/models/emotion/`
- PostgreSQL backend fully integrated for production
- Customize legal notices and consent flows per jurisdiction
- Implement proper authentication and rate-limiting before production
- Store encryption keys securely in KMS/vault

## Compliance

- **India**: DIGITAL PERSONAL DATA PROTECTION ACT (DPDPA) 2023
- **EU**: GDPR Article 9 (Biometric Processing)
- **USA**: CCPA, BIPA (Illinois)

## License

Private repository - All rights reserved

## Status

🚀 **Project Status**: Sprint 5 - AI Model Integration Complete
- [x] Repository created
- [x] Project scaffold generated
- [x] PostgreSQL backend setup
- [x] Consent UI implementation
- [x] TensorFlow.js models integrated
- [x] Docker deployment testing
- [x] Production deployment
