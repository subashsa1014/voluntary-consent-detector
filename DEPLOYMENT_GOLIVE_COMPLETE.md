# Deployment & Go-Live Guide - Voluntary Consent Detector

## 🚀 Complete Production Deployment Documentation

**Status:** ✅ READY FOR DEPLOYMENT  
**Date:** January 29, 2026  
**Environment:** Production  
**Owner:** Subash (subashsa1014)  

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Database Initialization](#database-initialization)
5. [Testing & QA](#testing--qa)
6. [Go-Live Checklist](#go-live-checklist)
7. [Monitoring & Logging](#monitoring--logging)
8. [Rollback Procedures](#rollback-procedures)
9. [Support & Maintenance](#support--maintenance)

---

## Pre-Deployment Checklist

### Code Quality ✅
- [x] All TypeScript files compiled without errors
- [x] Python code follows PEP 8 standards
- [x] No console.log or debugging statements in production code
- [x] Environment variables externalized
- [x] Secrets not committed to repository

### Security ✅
- [x] HTTPS/TLS certificates ready
- [x] Database credentials secured
- [x] API keys in environment variables
- [x] CORS configured for production domains
- [x] Rate limiting implemented
- [x] Input validation on all endpoints

### Compliance ✅
- [x] DPDPA 2023 requirements met
- [x] Privacy policy updated
- [x] Terms of service finalized
- [x] Cookie consent implemented
- [x] Data retention policies documented

### Performance ✅
- [x] Database indices optimized
- [x] Connection pooling configured
- [x] Static assets cached
- [x] Image optimization completed
- [x] Lazy loading implemented

---

## Environment Setup

### System Requirements

#### Minimum Hardware
- **CPU:** 2 cores (4 recommended)
- **RAM:** 4GB (8GB recommended)
- **Storage:** 20GB SSD
- **Network:** 100Mbps

#### Software Dependencies
- **Docker:** 20.10+
- **Docker Compose:** 1.29+
- **Node.js:** 18+ (for development)
- **Python:** 3.9+
- **PostgreSQL:** 13+

### Environment Variables

Create `.env` file in project root:

```env
# Database Configuration
DATABASE_URL=postgresql://consent_user:secure_password@localhost:5432/consent_db
DATABASE_MIN_SIZE=5
DATABASE_MAX_SIZE=20

# Application Ports
FRONTEND_PORT=3000
BACKEND_PORT=8000
DATABASE_PORT=5432

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Environment
ENVIRONMENT=production
DEBUG=false
```

---

## Docker Deployment

### Step 1: Clone Repository

```bash
git clone https://github.com/subashsa1014/voluntary-consent-detector.git
cd voluntary-consent-detector
```

### Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

### Step 3: Build Docker Images

```bash
docker-compose build --no-cache
```

### Step 4: Start Services

```bash
docker-compose up -d
```

### Step 5: Verify Services

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f

# Test frontend
curl http://localhost:3000

# Test backend API
curl http://localhost:8000/health
```

---

## Database Initialization

### Step 1: Create Database

```bash
docker-compose exec db psql -U postgres -c "CREATE DATABASE consent_db;"
```

### Step 2: Run Schema Migration

```bash
docker-compose exec db psql -U postgres -d consent_db -f /docker-entrypoint-initdb.d/schema.sql
```

### Step 3: Verify Tables

```bash
docker-compose exec db psql -U postgres -d consent_db -c "\dt"
```

Expected output: 8 tables (users, consent_records, etc.)

---

## Testing & QA

### Functional Testing

#### 1. Frontend Testing
- [ ] Homepage loads successfully
- [ ] Video capture initializes
- [ ] Emotion detection works
- [ ] Consent form submits
- [ ] All buttons functional
- [ ] Mobile responsive

#### 2. Backend API Testing
```bash
# Health check
curl http://localhost:8000/health

# Create consent record
curl -X POST http://localhost:8000/api/consent \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test_user","document_type":"Test","detected_emotion":"happy","emotion_confidence":0.85,"user_consent":true,"consent_timestamp":"2026-01-29T20:00:00Z","data_usage_purpose":"Testing","data_retention_period":"7 years","jurisdiction":"India"}'

# Get consent record
curl http://localhost:8000/api/consent/{consent_id}
```

#### 3. Database Testing
- [ ] Connections working
- [ ] CRUD operations functional
- [ ] Indices improving performance
- [ ] Triggers updating timestamps
- [ ] Audit trail working

### Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 http://localhost:3000/

# Database query performance
docker-compose exec db psql -U postgres -d consent_db -c "EXPLAIN ANALYZE SELECT * FROM consent_records WHERE user_id='test_user';"
```

### Security Testing
- [ ] SQL injection prevention tested
- [ ] XSS prevention verified
- [ ] CSRF tokens working
- [ ] Rate limiting functional
- [ ] HTTPS enforced
- [ ] Headers secured

---

## Go-Live Checklist

### 24 Hours Before
- [ ] Final code freeze
- [ ] Backup current production (if applicable)
- [ ] Test rollback procedures
- [ ] Notify stakeholders
- [ ] Prepare support team

### 6 Hours Before
- [ ] Deploy to staging
- [ ] Run full test suite
- [ ] Verify all integrations
- [ ] Check monitoring alerts
- [ ] Review logs

### 1 Hour Before
- [ ] Final security scan
- [ ] Database backup
- [ ] DNS/CDN configured
- [ ] Load balancer ready
- [ ] Team on standby

### Go-Live (8 PM IST)
- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify user flows

### Post Go-Live (First 2 Hours)
- [ ] Monitor real-time metrics
- [ ] Check error logs
- [ ] Test critical paths
- [ ] Verify database performance
- [ ] Check API response times

---

## Monitoring & Logging

### Application Monitoring

```yaml
# docker-compose.yml additions for monitoring
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Log Aggregation

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Export logs
docker-compose logs > logs.txt
```

### Metrics to Monitor
- **Response Time:** <200ms (p95)
- **Error Rate:** <1%
- **CPU Usage:** <70%
- **Memory Usage:** <80%
- **Database Connections:** <15/20
- **Disk Usage:** <80%

---

## Rollback Procedures

### Quick Rollback (< 5 minutes)

```bash
# Stop current deployment
docker-compose down

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild and restart
docker-compose build
docker-compose up -d
```

### Database Rollback

```bash
# Restore from backup
docker-compose exec db psql -U postgres -d consent_db -f /backups/pre-deployment.sql
```

---

## Support & Maintenance

### Daily Tasks
- Check error logs
- Monitor performance metrics
- Verify backups
- Review security alerts

### Weekly Tasks
- Database maintenance
- Security patches
- Performance optimization
- User feedback review

### Monthly Tasks
- Dependency updates
- Security audit
- Performance review
- Capacity planning

### Incident Response

**Severity 1 (Critical):**
- Response: Immediate
- Resolution: < 1 hour
- Examples: Site down, data breach

**Severity 2 (High):**
- Response: < 30 minutes
- Resolution: < 4 hours
- Examples: API errors, slow performance

**Severity 3 (Medium):**
- Response: < 2 hours
- Resolution: < 24 hours
- Examples: UI bugs, minor features broken

---

## Contact Information

**Project Owner:** Subash  
**Email:** [Your email]  
**GitHub:** @subashsa1014  
**Repository:** https://github.com/subashsa1014/voluntary-consent-detector  

**Support Hours:** 24/7 for Severity 1, Business hours for Severity 2/3  

---

## Success Criteria

✅ **Deployment Successful If:**
- All services running
- Health checks passing
- Error rate < 1%
- Response time < 200ms
- No critical bugs
- Users can complete consent flow
- Database operations functional
- Monitoring active

---

**🎉 PROJECT STATUS: READY FOR PRODUCTION GO-LIVE**

**Date:** January 29, 2026, 8 PM IST  
**Version:** 1.0.0  
**Environment:** Production  
**DPDPA Compliance:** ✅ Verified  

---

*End of Deployment Guide*
