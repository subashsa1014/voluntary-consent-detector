# Production Deployment Checklist

## Pre-Deployment Requirements

### Environment Setup
- [ ] Choose deployment platform (Render.com, Fly.io, Railway, AWS, DigitalOcean)
- [ ] Create production database (PostgreSQL)
- [ ] Configure environment variables and secrets
- [ ] Set up domain and SSL certificate
- [ ] Configure CDN if needed (CloudFlare, AWS CloudFront)

### GitHub Secrets Configuration

Add these secrets to GitHub Settings > Secrets and Variables > Actions:

```
DEPLOY_KEY              - Deployment platform API key
RENDER_DEPLOY_HOOK      - Render.com deployment webhook (if using)
SLACK_WEBHOOK           - Slack webhook for notifications
DATABASE_URL            - Production database connection string
POSTGRES_PASSWORD       - PostgreSQL password
DOCKER_REGISTRY_TOKEN   - GitHub Container Registry token
```

## Pre-Deployment Checks

### Code Quality
- [ ] All tests passing locally
- [ ] Code review completed
- [ ] No console errors or warnings
- [ ] Linting passed (Super Linter)
- [ ] Security scan completed (CodeQL)
- [ ] Dependency vulnerabilities checked

### Infrastructure
- [ ] Docker image builds successfully locally
- [ ] Docker image passes security scan (trivy)
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Backup strategy in place
- [ ] Monitoring configured (Datadog, New Relic, etc.)

### Security & Compliance
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Authentication working
- [ ] DPDPA 2023 compliance verified (India)
- [ ] GDPR compliance (if EU users) - Article 9 biometric data
- [ ] CCPA/BIPA compliance (if US users)
- [ ] Data encryption at rest
- [ ] Data encryption in transit
- [ ] API keys securely stored

### Testing
- [ ] Load testing completed
- [ ] Database query optimization verified
- [ ] API response times acceptable
- [ ] Frontend performance acceptable
- [ ] Mobile responsiveness tested
- [ ] Browser compatibility tested

## Deployment Steps

### 1. Create Release
```bash
# Create a new release on GitHub
# Go to Releases > Draft a new release
# Tag: v1.0.0 (follow semantic versioning)
# Title: Production Release - Voluntary Consent Detector v1.0.0
# Description: [Include deployment notes]
# Publish release
```

### 2. Automatic Deployment Triggered
- [ ] Deploy to Production workflow starts automatically
- [ ] Docker image builds from latest code
- [ ] Image pushed to GitHub Container Registry
- [ ] Deployment initiated on selected platform
- [ ] Health checks pass
- [ ] Slack notification received

### 3. Post-Deployment Verification
- [ ] Application accessible at production URL
- [ ] Database connected and working
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] SSL certificate valid
- [ ] Monitoring metrics flowing
- [ ] Logs captured correctly

## Rollback Procedure

If deployment fails or issues arise:

```bash
# Option 1: Revert to previous release
# Go to Actions > Deploy to Production
# Click "Re-run all jobs" on previous successful run

# Option 2: Manual rollback
# SSH into production server
# docker pull ghcr.io/subashsa1014/voluntary-consent-detector:previous_tag
# docker stop voluntary-consent-detector
# docker run -d --name voluntary-consent-detector ghcr.io/...
# Verify health
```

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error rates and logs
- [ ] Check database performance
- [ ] Verify API response times
- [ ] Monitor resource usage (CPU, Memory, Disk)
- [ ] Check for security alerts
- [ ] Review user reports and feedback

### First Week
- [ ] Monitor uptime and availability
- [ ] Track performance metrics
- [ ] Monitor error trends
- [ ] Verify backup jobs running
- [ ] Check compliance logs

### Ongoing
- [ ] Weekly backup verification
- [ ] Monthly security audits
- [ ] Quarterly performance reviews
- [ ] Document any incidents
- [ ] Keep dependencies updated

## Deployment Runbook

### Quick Reference

| Component | Platform | Command | Status |
|-----------|----------|---------|--------|
| Application | Render.com | `npm deploy` | [ ] |
| Database | PostgreSQL | `psql -U postgres -h prod.db.com` | [ ] |
| Monitoring | Datadog | Dashboard: [link] | [ ] |
| Logs | GitHub Actions | [Workflow Logs](../actions) | [ ] |
| SSL | Let's Encrypt | Auto-renewed | [ ] |

### Emergency Contacts

- On-Call Engineer: [Contact info]
- DevOps Lead: [Contact info]
- Database Admin: [Contact info]
- Security Team: [Contact info]

## Known Issues & Workarounds

### Issue: Docker build times too long
**Workaround:** Ensure GitHub Actions cache is enabled

### Issue: Database connection timeout
**Workaround:** Check PostgreSQL service is running and firewall rules

### Issue: Deployment stuck
**Workaround:** Check GitHub Actions logs, try manual rerun

## Success Criteria

✅ Production Deployment Complete When:
- [ ] Application is live and accessible
- [ ] All health checks passing
- [ ] Zero critical errors in logs
- [ ] Database responsive and healthy
- [ ] Performance metrics within SLA
- [ ] Team notified and acknowledged
- [ ] Documentation updated

## Post-Launch

- [ ] Update README with production URL
- [ ] Update status in project checklist to ✅ Production deployment
- [ ] Send announcement to stakeholders
- [ ] Create incident response plan
- [ ] Schedule post-deployment review meeting
