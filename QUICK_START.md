# 🚀 Quick Start Guide - Voluntary Consent Detector

> **Get the project running in 5 minutes or less!**

---

## Option 1: Docker (Easiest - 2 minutes)

### Prerequisites:
- Docker & Docker Compose installed

### Steps:

```bash
# 1. Clone the repository
git clone https://github.com/subashsa1014/voluntary-consent-detector.git
cd voluntary-consent-detector

# 2. Copy environment file
cp .env.example .env

# 3. Start everything with Docker
docker-compose up --build

# 4. In another terminal, initialize database
docker exec consent-detector-backend python app/init_db.py
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Option 2: Local Development (5 minutes)

### Prerequisites:
- Python 3.11+
- Node.js 16+
- PostgreSQL 13+

### Backend Setup:

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variable (Mac/Linux)
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/consent_detector

# Or on Windows:
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/consent_detector

# 4. Initialize database
cd app
python init_db.py

# 5. Start backend server
cd ..
python -m uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

### Frontend Setup (New Terminal):

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

Frontend runs at: http://localhost:3000

---

## Option 3: Cloud Deployment (Render.com - 15 minutes)

> Best for production! Free tier available (with limitations)

### Step 1: Create PostgreSQL Database
1. Go to [render.com](https://render.com)
2. Sign up / Log in
3. Click "New +" → "PostgreSQL"
4. Name: `consent-detector-db`
5. Region: Choose closest to India (Singapore recommended)
6. Copy the `DATABASE_URL` (you'll need this)

### Step 2: Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `voluntary-consent-detector` repo
4. **Build Command:**
   ```
   pip install -r backend/requirements.txt
   ```
5. **Start Command:**
   ```
   cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
6. Add **Environment Variable:**
   - Key: `DATABASE_URL`
   - Value: (paste from Step 1)
7. Click "Deploy"

### Step 3: Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect GitHub repository
3. **Build Command:**
   ```
   cd frontend && npm install && npm run build
   ```
4. **Publish Directory:** `frontend/build`
5. Add **Environment Variable:**
   - Key: `REACT_APP_API_URL`
   - Value: (your Render backend URL from Step 2)
6. Click "Deploy"

**Result:**
- Frontend: `https://consent-detector-web.onrender.com`
- Backend: `https://consent-detector-backend.onrender.com`

---

## Test the Application

### Create a Test User:

```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "full_name": "Test User"}'
```

### Check System Stats:

```bash
curl http://localhost:8000/stats
```

### View API Documentation:

Go to: http://localhost:8000/docs

---

## Common Issues & Solutions

### "Connection refused to PostgreSQL"
**Solution:**
```bash
# Make sure PostgreSQL is running
# On Mac:
brew services start postgresql

# On Linux:
sudo service postgresql start

# Or use Docker:
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
```

### "Port 3000 already in use"
**Solution:**
```bash
# Kill the process using port 3000
# On Mac/Linux:
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or start on different port:
npm start -- --port 3001
```

### "Module not found" error
**Solution:**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
npm install --legacy-peer-deps
```

### Database initialization fails
**Solution:**
```bash
# Check database connection
psql -U postgres -h localhost -d consent_detector

# Or reset database
dropdb consent_detector
creatdb consent_detector
python init_db.py
```

---

## What's Running

✅ **Frontend** (React TypeScript)
- Emotion detection UI
- Consent form component
- User interface

✅ **Backend** (FastAPI)
- 10+ REST endpoints
- PostgreSQL integration
- Audit logging

✅ **Database** (PostgreSQL)
- 8 normalized tables
- User data
- Consent records
- Audit logs

---

## Next Steps

1. **Explore the Application**
   - Open http://localhost:3000 in browser
   - Try creating a user
   - Submit consent forms

2. **Review the Code**
   - `backend/app/main.py` - API endpoints
   - `backend/app/database.py` - Database models
   - `frontend/src/components/ConsentScreen.tsx` - UI

3. **Read Documentation**
   - `SPRINT_4_FINAL_COMPLETE.md` - Comprehensive guide
   - `SPRINT_4_IMPLEMENTATION.md` - Technical details

4. **Deploy to Production**
   - Use Render.com (easiest)
   - Or AWS, Azure, DigitalOcean
   - See `SPRINT_4_FINAL_COMPLETE.md` for details

---

## Useful Commands

```bash
# View logs (Docker)
docker logs consent-detector-backend
docker logs consent-detector-frontend

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up --build

# Connect to PostgreSQL
psql -U postgres -d consent_detector

# Run backend tests
pytest backend/

# Run frontend tests
npm test --prefix frontend
```

---

## Support & Resources

📚 **Documentation:**
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Docs](https://docs.docker.com/)

🐛 **Issues:**
- Check logs first
- Verify `.env` configuration
- Review `SPRINT_4_IMPLEMENTATION.md`

💬 **Questions:**
- See `SPRINT_4_FINAL_COMPLETE.md` FAQ section
- Check GitHub issues

---

## Status

✅ **Ready to use!**
- 90% production-ready
- Can be deployed immediately
- Fully functional with sample data

⏱️ **Deployment time:** 15 minutes max

🎉 **Enjoy!**
