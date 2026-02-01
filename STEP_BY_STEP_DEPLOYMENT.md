# Production Deployment: Step-by-Step Guide

## 🎯 Overview

This guide walks you through deploying the Voluntary Consent Detector to production using Render.com (recommended for beginners) or other platforms.

**Estimated Time:** 20-30 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** GitHub account, email

---

## STEP 1: Choose Your Deployment Platform

### Option A: Render.com (Recommended ✅)
**Best for:** Quick setup, free tier, includes database

```
✅ Pros:
- Free tier available
- PostgreSQL database included
- Auto-deploy from GitHub
- Easy environment setup
- Good documentation

⏱️ Setup Time: 10 minutes
```

### Option B: Fly.io
**Best for:** Global deployment, edge computing

```
✅ Pros:
- Global edge deployment
- Generous free tier
- PostgreSQL add-on
```

### Option C: Railway
**Best for:** Simple deployments

```
✅ Pros:
- One-click deployment
- Usage-based pricing
- PostgreSQL included
```

**→ CHOOSE: Render.com for this guide**

---

## STEP 2: Sign Up on Render.com

### 2.1 Visit Render.com
```
1. Go to https://render.com
2. Click "Sign Up" button
3. Choose "Sign up with GitHub"
4. Authorize Render to access your GitHub account
5. Accept permissions
```

### 2.2 Authorize GitHub Access
```
✓ Grant access to:
  - Read your repositories
  - Create webhooks for automatic deploys
```

**⏱️ Time: 2 minutes**

---

## STEP 3: Configure GitHub Secrets

These are encrypted credentials that the deployment workflow will use.

### 3.1 Create Secrets in GitHub

**Location:**  
`GitHub Repository > Settings > Secrets and variables > Actions`

### 3.2 Add These Secrets

#### Secret 1: RENDER_DEPLOY_HOOK
```
Name: RENDER_DEPLOY_HOOK
Value: https://api.render.com/deploy/srv-xxxxx?key=xxxxx

How to get:
1. In Render dashboard
2. Select your service
3. Settings > Deploy hooks
4. Copy the webhook URL
```

#### Secret 2: DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://user:password@host:5432/dbname

How to get:
1. Go to Render > PostgreSQL Database
2. Copy the connection string
3. Use the External URL
```

#### Secret 3: SLACK_WEBHOOK (Optional)
```
Name: SLACK_WEBHOOK
Value: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX

How to get:
1. Go to Slack workspace
2. Manage Apps > Custom Integrations > Incoming Webhooks
3. Create new webhook
4. Select channel
5. Copy webhook URL
```

**⏱️ Time: 5 minutes**

---

## STEP 4: Set Up PostgreSQL Database on Render

### 4.1 Create Database
```
1. Log in to Render.com dashboard
2. Click "New" button
3. Select "PostgreSQL"
4. Configure:
   - Name: voluntary-consent-db
   - Database: voluntary_consent
   - User: postgres
   - Region: Singapore (or nearest to you)
5. Click "Create Database"
```

### 4.2 Get Connection String
```
1. Wait for database to be ready (2-3 minutes)
2. Copy the External Database URL
3. Save as DATABASE_URL secret (Step 3)
```

**⏱️ Time: 5 minutes + 2-3 minutes wait**

---

## STEP 5: Create Web Service on Render

### 5.1 Connect Repository
```
1. In Render dashboard, click "New"
2. Select "Web Service"
3. Click "Connect" next to your repo
4. Select "voluntary-consent-detector"
5. Click "Connect"
```

### 5.2 Configure Web Service
```
Settings:
- Name: voluntary-consent-detector
- Environment: Docker
- Region: Singapore
- Branch: main
```

### 5.3 Environment Variables
```
Add these in Render dashboard:

Key: DATABASE_URL
Value: postgresql://user:password@host:5432/dbname

Key: ENVIRONMENT
Value: production

Key: PYTHONUNBUFFERED
Value: 1
```

### 5.4 Deploy
```
1. Review configuration
2. Click "Create Web Service"
3. Render will:
   - Build Docker image
   - Deploy to production
   - Show logs in real-time
```

**⏱️ Time: 5 minutes + 5-10 minutes deployment**

---

## STEP 6: Monitor Deployment

### 6.1 Watch Deployment Progress
```
In Render Dashboard:
1. Go to your Web Service
2. Click "Logs" tab
3. Watch the build and deployment process
4. Look for "Build completed successfully"
```

### 6.2 Check Application Status
```
On success, you'll see:
✓ Service URL: https://voluntary-consent-detector-xxx.onrender.com
✓ Status: Live
✓ Logs show no errors
```

**⏱️ Time: 10 minutes (watch the logs)**

---

## STEP 7: Set Up Custom Domain (Optional)

### 7.1 Add Domain
```
1. In Render dashboard
2. Web Service > Settings
3. Scroll to "Custom Domains"
4. Add your domain (e.g., consent-detector.yourdomain.com)
5. Follow DNS configuration instructions
```

### 7.2 Configure DNS
```
1. Go to your domain registrar
2. Add CNAME record pointing to Render URL
3. Wait 15-30 minutes for DNS propagation
```

**⏱️ Time: 5 minutes + 30 minutes DNS propagation**

---

## STEP 8: Verify Application is Working

### 8.1 Test API
```bash
# Test if API is responding
curl https://your-app.onrender.com/health

# Expected response:
{"status": "ok"}
```

### 8.2 Test Web Interface
```
1. Open https://your-app.onrender.com in browser
2. Check if frontend loads
3. Test emotion recognition feature
4. Test voice analysis
```

### 8.3 Check Database Connection
```
1. In Render dashboard, check logs
2. Look for "Database connected"
3. No "Connection refused" errors
```

**⏱️ Time: 5 minutes**

---

## STEP 9: Set Up Automatic Deployments

### 9.1 Enable GitHub Integration
```
1. Render dashboard > Web Service
2. Settings > Deploy Hooks
3. Copy webhook URL
4. Save as RENDER_DEPLOY_HOOK secret on GitHub
```

### 9.2 Create Release to Trigger Deployment
```
1. Go to GitHub > Releases
2. Click "Draft a new release"
3. Tag: v1.0.1
4. Title: "Production Release v1.0.1"
5. Description: "Deploying to production"
6. Click "Publish release"

✓ This triggers the GitHub Actions workflow
✓ Which automatically deploys to Render
```

**⏱️ Time: 2 minutes**

---

## STEP 10: Monitor Production

### 10.1 Set Up Monitoring
```
1. Render dashboard > Web Service
2. Metrics tab - watch:
   - CPU usage
   - Memory usage
   - Request count
   - Error rate
```

### 10.2 Check Logs Daily
```
1. Render dashboard > Logs
2. Filter by ERROR
3. Check for any issues
4. Fix and redeploy if needed
```

### 10.3 Enable Slack Notifications (Optional)
```
1. If SLACK_WEBHOOK is configured
2. Deployment status sent to Slack
3. Error alerts sent to Slack
```

**⏱️ Time: Ongoing maintenance**

---

## STEP 11: Setup Rollback Plan

### 11.1 Rollback Procedure
```
If deployment fails:

1. Go to Render Dashboard
2. Web Service > Deployments
3. Find previous successful deployment
4. Click "Activate"
5. Service reverts to previous version
6. Check logs to find issue
7. Fix on GitHub
8. Redeploy
```

### 11.2 Keep Backup Database
```
1. Render > PostgreSQL > Backups
2. Automatic backups: Every 7 days
3. Manual backup before major updates
4. Download backup for safe storage
```

**⏱️ Time: 5 minutes (if needed)**

---

## STEP 12: Post-Deployment Tasks

### 12.1 Update Documentation
```
1. Update README.md with production URL
2. Document any configuration done
3. Create runbook for team
4. Document emergency procedures
```

### 12.2 Announce Launch
```
1. Send email to stakeholders
2. Update project status
3. Social media announcement (if public)
4. Team notification
```

### 12.3 Create Status Monitoring
```
1. Set up uptime monitoring (UptimeRobot, etc.)
2. Alert thresholds for errors
3. Daily health check
4. Weekly performance review
```

**⏱️ Time: 10 minutes**

---

## 📊 Complete Checklist

```
□ Step 1: Choose platform (Render.com)
□ Step 2: Sign up on Render
□ Step 3: Configure GitHub Secrets
□ Step 4: Create PostgreSQL database
□ Step 5: Create Web Service
□ Step 6: Monitor deployment
□ Step 7: Set up custom domain (optional)
□ Step 8: Verify application works
□ Step 9: Set up automatic deployments
□ Step 10: Monitor production
□ Step 11: Setup rollback plan
□ Step 12: Post-deployment tasks
```

---

## 🆘 Troubleshooting

### Problem: Deployment fails
```
Solution:
1. Check Render logs for error message
2. Common causes:
   - Docker build failed → Check Dockerfile syntax
   - Database connection failed → Verify DATABASE_URL
   - Missing environment variable → Add to Render dashboard
3. Fix issue on GitHub
4. Create new release to redeploy
```

### Problem: Application loads but gives errors
```
Solution:
1. Check application logs: Render > Logs
2. Search for ERROR messages
3. Common issues:
   - Port mismatch → App expects port 8000, expose it
   - Missing dependencies → Check requirements.txt
   - Database migration → Run manually if needed
```

### Problem: Application times out
```
Solution:
1. Check if Free tier is being used (limited resources)
2. Upgrade to Starter plan if needed
3. Optimize database queries
4. Add caching for slow endpoints
```

---

## 🎓 Next Steps

After successful deployment:

1. **Monitor Daily**: Check logs and metrics
2. **Update Documentation**: Keep README current
3. **Plan Updates**: Use GitHub releases for new features
4. **Gather Feedback**: From users
5. **Optimize Performance**: Based on metrics
6. **Scale Infrastructure**: If traffic increases

---

## ✅ Success Criteria

You've successfully deployed when:

- ✅ Application is live at production URL
- ✅ Frontend loads without errors
- ✅ API endpoints responding
- ✅ Database connected and working
- ✅ Automatic deployments working from GitHub
- ✅ Monitoring is active
- ✅ Team is notified

---

## 📞 Support

**Need Help?**

- Render Documentation: https://render.com/docs
- GitHub Actions: https://docs.github.com/actions
- Docker: https://docs.docker.com/
- PostgreSQL: https://www.postgresql.org/docs/

**Common Questions:**
- Q: How much does it cost?
  A: Render free tier has limits. Starter plan is $7/month for web service.
  
- Q: Can I change the deployment region?
  A: Yes, in Render dashboard under Settings.
  
- Q: How do I see deployment logs?
  A: Render dashboard > Web Service > Logs tab.
  
- Q: How do I add more team members?
  A: Render dashboard > Team settings > Invite members.

---

**Total Estimated Time:** 30-45 minutes (end-to-end)

🚀 **Good luck with your deployment!**
