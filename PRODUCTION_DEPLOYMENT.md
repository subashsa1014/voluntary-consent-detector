# Production Deployment Guide

## Executive Summary

This guide covers everything needed to deploy the Voluntary Consent Detector system to a production environment. It encompasses infrastructure setup, security hardening, monitoring, and go-live procedures.

## Pre-Deployment Checklist

### Infrastructure & Environment

- [ ] Domain name configured with DNS
- [ ] SSL/TLS certificates obtained and validated
- [ ] Production server(s) provisioned with adequate resources
- [ ] Database backup system implemented
- [ ] CDN configured for static assets
- [ ] Load balancer configured (if multi-instance)
- [ ] Network security groups/firewall rules configured
- [ ] VPN/SSH access restricted to authorized IPs

### Security Configuration

- [ ] Environment variables set securely (.env configured)
- [ ] Database credentials in secrets manager (AWS Secrets Manager/Azure Key Vault)
- [ ] API keys and tokens secured
- [ ] CORS settings configured for specific domains
- [ ] Rate limiting configured
- [ ] API authentication implemented
- [ ] Session management configured
- [ ] HTTPS enforced on all endpoints

### Application Setup

- [ ] PostgreSQL database initialized with production configuration
- [ ] Database backups scheduled (daily)
- [ ] Migrations run successfully
- [ ] Test data cleared from database
- [ ] Application logs configured
- [ ] Error tracking (Sentry/similar) configured
- [ ] Performance monitoring (New Relic/Datadog) enabled
- [ ] Health check endpoints verified

### Compliance & Legal

- [ ] Legal notices updated for jurisdiction
- [ ] Privacy policy reviewed and approved
- [ ] Terms of service finalized
- [ ] Consent flow matches compliance requirements
- [ ] Data retention policies documented
- [ ] GDPR/DPDPA compliance verified
- [ ] Audit logging enabled

## Deployment Steps

### 1. Pre-Deployment Validation

```bash
# Run full test suite
npm test  # Frontend
pytest    # Backend

# Security audit
# Frontend
npm audit

# Backend
safety check
bandit -r backend/

# Linting
npm run lint    # Frontend
flake8 backend/ # Backend

# Build verification
npm run build   # Frontend
```

### 2. Database Preparation

```bash
# Create production database
createdb consent_detector_prod

# Run migrations
alembic upgrade head

# Initialize required schemas
psql -f schema/init.sql consent_detector_prod

# Verify database integrity
psql consent_detector_prod -c "\\dt"
```

### 3. Environment Configuration

Create `.env.production` with these essential settings:

```env
# Application
ENV=production
DEBUG=false
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@prod-db.example.com:5432/consent_detector_prod
DB_POOL_SIZE=20
DB_POOL_PRE_PING=true

# Security
SECRET_KEY=<generate-strong-random-key>
SECURE_SSL_REDIRECT=true
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=Lax

# CORS
CORS_ORIGINS=["https://yourdomain.com"]

# API
API_RATE_LIMIT=100/hour
API_TIMEOUT=30

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
DATA_DOG_API_KEY=<your-datadog-key>

# Email (if needed)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<email>
SMTP_PASSWORD=<password>
```

### 4. Backend Deployment

```bash
# Build optimized Docker image
docker build -t consent-detector-backend:latest -f Dockerfile .

# Tag for registry
docker tag consent-detector-backend:latest registry.example.com/consent-detector-backend:latest

# Push to registry
docker push registry.example.com/consent-detector-backend:latest

# Deploy on production server
ssh prod-server "cd /opt/consent-detector && docker pull registry.example.com/consent-detector-backend:latest"

# Start service
ssh prod-server "docker-compose -f docker-compose.prod.yml up -d"

# Verify deployment
ssh prod-server "curl http://localhost:8000/health"
```

### 5. Frontend Deployment

```bash
# Build optimized production bundle
cd frontend
npm run build

# Test production build locally
npm run serve

# Upload to CDN/hosting
aws s3 sync build/ s3://consent-detector-prod --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"

# Verify frontend is accessible
curl https://yourdomain.com
```

### 6. SSL/TLS Setup

```bash
# If using Let's Encrypt with Nginx/Apache
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Configure auto-renewal
sudo systemctl enable certbot.timer

# Verify certificate
sudo certbot certificates
```

### 7. Load Balancer Configuration (if applicable)

```bash
# Example with AWS Load Balancer
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:... \
  --targets Id=i-1234567890abcdef0 Id=i-0987654321fedcba1

# Set health check
aws elbv2 modify-target-group \
  --target-group-arn arn:aws:elasticloadbalancing:... \
  --health-check-path /health
```

## Verification & Testing

### Health Checks

```bash
# API Health
curl -k https://yourdomain.com/health

# Database Connection
curl -k https://yourdomain.com/api/health/db

# Load Testing (using Apache Bench)
ab -n 1000 -c 100 https://yourdomain.com/

# Full test suite
postman newman run production-tests.json --environment prod.json
```

### Smoke Tests

1. **Frontend Tests**
   - [ ] Homepage loads
   - [ ] UI responsive on mobile
   - [ ] API calls successful
   - [ ] Form submission works

2. **Backend Tests**
   - [ ] Health endpoint responds
   - [ ] Database queries work
   - [ ] Authentication functional
   - [ ] Rate limiting active

3. **Integration Tests**
   - [ ] End-to-end user flow
   - [ ] Consent capture functional
   - [ ] Data persistence verified
   - [ ] Email notifications working

## Monitoring & Observability

### Logging

```bash
# Configure centralized logging
# Example: ELK Stack setup
docker-compose -f monitoring/docker-compose.elk.yml up -d

# Configure log forwarding
# App should log to stdout for Docker to handle
```

### Metrics

```bash
# Prometheus metrics endpoint
curl https://yourdomain.com/metrics

# Setup Grafana dashboards for:
# - Request latency
# - Error rates
# - Database performance
# - Resource utilization
```

### Alerting

```bash
# Configure alerts for:
# - High error rates (> 1%)
# - Database connection failures
# - Memory usage > 80%
# - Disk usage > 90%
# - Response time > 2s
```

## Performance Optimization

### Backend

```bash
# Enable query caching
# Configure Redis cache layer
# Use database connection pooling
# Implement API response compression
```

### Frontend

```bash
# Enable gzip compression
# Minify CSS/JS
# Lazy load images
# Use service workers for caching
# Optimize bundle size
```

## Backup & Disaster Recovery

### Automated Backups

```bash
# Daily database backup to S3
0 2 * * * /scripts/backup-db.sh

# Weekly full system backup
0 3 * * 0 /scripts/backup-system.sh

# Backup verification
0 4 * * * /scripts/verify-backups.sh
```

### Restore Procedures

```bash
# Database restore
psql consent_detector_prod < backups/backup_$(date +%Y%m%d).sql

# Application restore
# From latest backup snapshot
```

## Scaling & High Availability

### Horizontal Scaling

```bash
# Add more backend instances
# Update load balancer target group
# Ensure database can handle connections
```

### Database Replication

```bash
# Setup read replicas for reporting
# Configure failover mechanisms
# Test recovery procedures
```

## Security Hardening

### Network Security

- [ ] WAF (Web Application Firewall) configured
- [ ] DDoS protection enabled
- [ ] API rate limiting active
- [ ] IP whitelisting for admin access

### Application Security

- [ ] OWASP Top 10 mitigations implemented
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens validated
- [ ] Dependency vulnerabilities patched

### Data Security

- [ ] Encryption at rest enabled
- [ ] Encryption in transit (TLS 1.2+)
- [ ] Sensitive data masking in logs
- [ ] PII data handling compliant

## Go-Live Procedures

### 1. Pre-Launch (24 hours before)

- [ ] Notify support team
- [ ] Final backup created
- [ ] Load tests completed
- [ ] Incident response plan reviewed
- [ ] Team on standby

### 2. Launch Window

- [ ] Monitor error rates
- [ ] Watch resource utilization
- [ ] Check user feedback channels
- [ ] Verify data accuracy
- [ ] Monitor API latency

### 3. Post-Launch (24-48 hours)

- [ ] Continue monitoring metrics
- [ ] Gather user feedback
- [ ] Optimize based on usage patterns
- [ ] Verify compliance requirements
- [ ] Update status page

## Rollback Plan

If issues occur:

```bash
# Immediate rollback
docker-compose -f docker-compose.prod.yml down

# Restore from previous version
docker pull registry.example.com/consent-detector-backend:previous
docker-compose -f docker-compose.prod.yml up -d

# Restore database from backup
psql consent_detector_prod < backups/pre_deployment.sql
```

## Post-Deployment Documentation

- [ ] Update runbooks with production details
- [ ] Document incident response procedures
- [ ] Create operational dashboards
- [ ] Schedule post-launch review meeting
- [ ] Collect lessons learned

## Support & Maintenance

### On-Call Support

- Establish on-call rotation
- Configure PagerDuty/OpsGenie alerts
- Document incident response procedures
- Regular on-call training

### Regular Maintenance

```bash
# Weekly tasks
- Review error logs
- Check disk space
- Verify backups

# Monthly tasks  
- Security patching
- Performance review
- Capacity planning

# Quarterly tasks
- Disaster recovery drill
- Security audit
- Architecture review
```

## Emergency Contacts

- **Technical Lead**: [Contact]
- **DevOps Team**: [Contact]
- **Security Team**: [Contact]
- **Management**: [Contact]

## References

- [OWASP Deployment Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheatsheet.html)
- [12-Factor App](https://12factor.net/)
- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-security.html)

## Version History

| Version | Date | Changes |
|---------|------|----------|
| 1.0 | 2024 | Initial production deployment guide |
