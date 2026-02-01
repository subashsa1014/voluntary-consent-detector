# Production Deployment Guide

## Quick Start

To deploy to production:

1. **Create a GitHub Release**
   - Go to Releases > Draft a new release
   - Tag version: `v1.0.0` (increment according to semver)
   - Title: `Production Release - Voluntary Consent Detector v1.0.0`
   - Description: Include deployment notes and changes
   - Click "Publish release"

2. **Automatic Deployment Starts**
   - GitHub Actions `Deploy to Production` workflow triggers automatically
   - Docker image builds and pushed to GitHub Container Registry (GHCR)
   - Application deployed to production environment
   - Slack notification sent with deployment status

3. **Verify Deployment**
   - Check application at production URL
   - Verify database connectivity
   - Monitor logs and metrics

---

## Prerequisites

### Required Before First Deployment

#### 1. GitHub Repository Secrets

Set these in: **Settings > Secrets and variables > Actions**

```
DEPLOY_KEY
  Description: API key for deployment platform
  Platform: Render.com / Fly.io / Railway
  Steps: Get from platform dashboard > API tokens

RENDER_DEPLOY_HOOK
  Description: Render.com deployment webhook URL
  Steps: Render dashboard > Deploy hooks > Copy URL
  Example: https://api.render.com/deploy/srv-xxxxx?key=xxxxx

SLACK_WEBHOOK
  Description: Slack channel webhook for notifications
  Steps: Slack workspace > App integrations > Incoming webhooks
  Example: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX

DATABASE_URL
  Description: Production PostgreSQL connection string
  Format: postgresql://user:password@host:5432/dbname
  Steps: Create database on cloud provider (AWS RDS, Railway, etc.)

POSTGRES_PASSWORD
  Description: PostgreSQL database password
  Keep this secret and secure

DOCKER_REGISTRY_TOKEN
  Description: GitHub Container Registry token
  Steps: GitHub settings > Developer settings > Personal access tokens
  Scopes: write:packages, read:packages, delete:packages
```

#### 2. Production Environment Setup

**Choose Deployment Platform:**

- **Render.com** (Recommended for beginners)
  - Free tier available
  - PostgreSQL database included
  - Easy GitHub integration
  - Auto-deploy from GitHub
  - [Setup Guide](https://render.com/docs)

- **Fly.io**
  - Global edge deployment
  - PostgreSQL add-on
  - Generous free tier
  - [Setup Guide](https://fly.io/docs/)

- **Railway**
  - Simple one-click deployments
  - PostgreSQL included
  - Usage-based pricing
  - [Setup Guide](https://railway.app/)

- **AWS / DigitalOcean / Azure**
  - More complex but more scalable
  - Full control
  - Higher cost

#### 3. Database Setup

```sql
-- Connect to production database
psql postgresql://user:password@host:5432/dbname

-- Run migrations (if applicable)
py manage.py migrate          # Django
flywaydb migrate             # Flyway
knex migrate:latest          # Knex
```

#### 4. Domain & SSL

- [ ] Register domain name
- [ ] Point DNS to production server
- [ ] Enable HTTPS (automatic with Let's Encrypt on most platforms)
- [ ] Verify SSL certificate

---

## Deployment Process

### Step 1: Pre-Deployment Testing

```bash
# Ensure all tests pass
npm test
pytest

# Build Docker image locally
docker build -t voluntary-consent-detector .

# Test Docker image
docker run -p 8000:8000 -p 3000:3000 voluntary-consent-detector

# Verify application loads
curl http://localhost:8000/health
```

### Step 2: Create Release on GitHub

```bash
# Push final code
git push origin main

# Go to GitHub repository
# Releases > Draft new release
# Tag: v1.0.0
# Title: Production Release - Voluntary Consent Detector v1.0.0
# Description:
#   - Features: [list features]
#   - Fixes: [list fixes]
#   - Breaking changes: [if any]
# Publish release
```

### Step 3: Monitor Deployment

**Watch GitHub Actions:**

```
Repository > Actions > Deploy to Production
├── Build Docker image ✓
├── Push to GHCR ✓
├── Deploy to production ✓
├── Health checks ✓
└── Slack notification ✓
```

**Expected workflow output:**
```
[Build] Building Docker image...
[Build] Image built successfully
[Push] Pushing to ghcr.io/...
[Deploy] Deploying to production...
[Health] Checking application health...
[Success] Deployment completed!
[Notify] Slack notification sent
```

### Step 4: Verify Deployment

**Check Application:**

```bash
# Visit production URL
https://your-app.com

# Verify API endpoints
curl https://your-app.com/api/health

# Check logs
Rendered dashboard > your-service > Logs
Or: fly logs
Or: railway logs

# Database connectivity
# If using pgAdmin, connect and verify data
```

**Health Checks:**

- [ ] Frontend loads (no console errors)
- [ ] API responding (status 200)
- [ ] Database connected
- [ ] SSL certificate valid
- [ ] Performance acceptable

---

## Rollback Instructions

If deployment fails or production issues occur:

### Option 1: Revert to Previous Release

```bash
# In GitHub Actions
Repository > Actions > Deploy to Production
Find previous successful run > Re-run all jobs
```

### Option 2: Manual Rollback

```bash
# For Render.com
Render dashboard > Deployments > Select previous version > Activate

# For Fly.io  
fly releases
fly releases rollback [release-id]

# For Railway
Railway dashboard > Deployments > Previous version > Redeploy

# For Docker manual
docker pull ghcr.io/subashsa1014/voluntary-consent-detector:previous-tag
docker stop voluntary-consent-detector
docker run -d --name voluntary-consent-detector \
  -e DATABASE_URL="$DATABASE_URL" \
  ghcr.io/subashsa1014/voluntary-consent-detector:previous-tag
```

---

## Monitoring & Maintenance

### Real-Time Monitoring

**Logs:**
- Render: Dashboard > Logs
- Fly: `fly logs -a app-name`
- Railway: Railway dashboard > Logs
- GitHub: Actions > Workflow logs

**Metrics:**
- CPU, Memory, Disk usage
- Request count and latency
- Error rates
- Database connections

**Alerts:**
- Configure in monitoring platform
- Slack notifications for errors
- Email alerts for critical issues

### Maintenance Tasks

**Daily:**
- Monitor error logs
- Check uptime
- Verify backups

**Weekly:**
- Review performance metrics
- Check for security alerts
- Update dependencies (if needed)

**Monthly:**
- Security audit
- Performance review
- Capacity planning

---

## Troubleshooting

### Deployment Fails

**Error: Docker build fails**
```
Solution: Check Dockerfile syntax, ensure all files exist
Debug: docker build --no-cache -t test .
```

**Error: Cannot connect to database**
```
Solution: Verify DATABASE_URL secret is set correctly
Debug: psql $DATABASE_URL -c "SELECT 1"
```

**Error: Application won't start**
```
Solution: Check logs, verify environment variables
Debug: Check GitHub Actions logs for detailed error
```

### Performance Issues

**Slow API responses**
- Check database query performance
- Verify database indexes
- Review application logs
- Consider caching (Redis)

**High memory usage**
- Check for memory leaks
- Review resource limits
- Optimize images and assets

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] Database encrypted
- [ ] Secrets not in code
- [ ] API rate limiting enabled
- [ ] CORS configured
- [ ] Regular backups scheduled
- [ ] Security headers set
- [ ] DPDPA/GDPR/CCPA compliance verified

---

## Support & Escalation

**For Issues:**
1. Check GitHub Actions logs
2. Check application logs  
3. Check database connectivity
4. Consult troubleshooting section
5. Contact DevOps team if needed

**Emergency Contacts:**
- DevOps Lead: [contact]
- Database Admin: [contact]
- Security Team: [contact]

---

## Next Steps

1. ✅ Complete PRODUCTION_DEPLOYMENT_CHECKLIST.md
2. ✅ Configure GitHub Secrets
3. ✅ Set up production database
4. ✅ Configure domain and SSL
5. ✅ Create first release
6. ✅ Monitor deployment
7. ✅ Verify application
8. ✅ Update README with production URL
9. ✅ Announce launch
10. ✅ Start monitoring and maintenance
