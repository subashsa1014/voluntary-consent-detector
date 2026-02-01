# Docker Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Voluntary Consent Detector system using Docker and Docker Compose. The containerized deployment ensures consistency across development, testing, and production environments.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB minimum RAM (8GB recommended)
- 10GB available disk space
- Linux/macOS/Windows with Docker Desktop

## Quick Start - Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/subashsa1014/voluntary-consent-detector.git
cd voluntary-consent-detector
```

### 2. Build and Run with Docker Compose

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Or run in background
docker-compose up -d
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Environment Configuration

### Setup Environment Variables

Create a `.env` file in the project root (template provided in `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# PostgreSQL Configuration
POSTGRES_DB=consent_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Backend Configuration
BACKEND_PORT=8000
BACKEND_HOST=0.0.0.0

# Frontend Configuration
FRONTEND_PORT=3000
REACT_APP_API_URL=http://localhost:8000

# Security
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
```

## Docker Compose Services

### Backend Service

- **Image**: `voluntary-consent-detector-backend:latest`
- **Port**: 8000
- **Dependencies**: PostgreSQL
- **Volumes**: Backend source code for hot-reload in development

### Frontend Service

- **Image**: `voluntary-consent-detector-frontend:latest`
- **Port**: 3000
- **Dependencies**: None
- **Volumes**: Frontend source code for hot-reload in development

### PostgreSQL Database

- **Image**: `postgres:15-alpine`
- **Port**: 5432
- **Data Persistence**: Named volume `postgres_data`
- **Initialization**: Automatic via init script

## Deployment Scenarios

### Development Deployment

For local development with hot-reload:

```bash
# Start services in development mode
docker-compose -f docker-compose.yml up

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

For production-grade deployment:

```bash
# Build optimized images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## Common Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Execute Commands in Container

```bash
# Backend shell
docker-compose exec backend bash

# Run database migrations
docker-compose exec backend python -m alembic upgrade head

# Frontend shell
docker-compose exec frontend sh
```

### Database Management

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d consent_db

# Backup database
docker-compose exec postgres pg_dump -U postgres consent_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres consent_db < backup.sql
```

## Health Checks

### Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### Database Connection

```bash
curl http://localhost:8000/api/health/db
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Rebuild database
docker-compose down -v
docker-compose up
```

### Memory Issues

Increase Docker memory allocation:
- **Docker Desktop**: Settings → Resources → Memory (set to 8GB)
- **Linux**: Use `--memory` flag in docker-compose.yml

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache

# Clean up and restart
docker-compose down -v
docker-compose up --build
```

## Testing the Deployment

### Backend API Testing

```bash
# Test health endpoint
curl -X GET http://localhost:8000/health

# Test API documentation
open http://localhost:8000/docs

# Test with sample data
curl -X GET http://localhost:8000/api/consents
```

### Frontend Testing

```bash
# Frontend loads at
open http://localhost:3000

# Test browser console for errors
# Check Network tab for API calls
```

### Database Testing

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d consent_db

# List tables
\dt

# Query data
SELECT * FROM consents LIMIT 5;
```

## Performance Optimization

### Resource Limits

Edit `docker-compose.yml` to set resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Database Optimization

```bash
# Vacuum and analyze
docker-compose exec postgres psql -U postgres -d consent_db -c "VACUUM ANALYZE;"

# Check index usage
docker-compose exec postgres psql -U postgres -d consent_db -c "SELECT * FROM pg_stat_user_indexes;"
```

## Production Considerations

### Security

- [ ] Set strong PostgreSQL passwords
- [ ] Enable HTTPS/TLS
- [ ] Use secrets manager for sensitive data
- [ ] Set up firewall rules
- [ ] Enable logging and monitoring
- [ ] Regular security updates

### Backup Strategy

```bash
# Automated daily backup
0 2 * * * docker-compose exec -T postgres pg_dump -U postgres consent_db > /backups/consent_db_$(date +\%Y\%m\%d).sql
```

### Monitoring

- Implement logging (ELK, Splunk)
- Set up performance monitoring (Prometheus, Grafana)
- Configure alerting
- Monitor disk space
- Track API response times

## Cleanup

### Remove Services

```bash
# Stop all services
docker-compose down

# Remove all data (careful!)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [React Deployment](https://create-react-app.dev/deployment/)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Docker logs
3. Check GitHub Issues
4. Contact the development team
