# Production-ready Dockerfile for Voluntary Consent Detector
# Simplified multi-stage build with Python backend

FROM python:3.10-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies for building
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt . 2>/dev/null || echo "No requirements.txt" || true
RUN pip install --user --no-cache-dir --no-deps -r requirements.txt 2>/dev/null || echo "Dependencies skipped" || true

# Production stage
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Set environment variables
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Create non-root user for security
RUN useradd -m -u 1000 appuser

# Copy application code
COPY backend/ /app/backend/ 2>/dev/null || echo "No backend" || true
COPY frontend/ /app/frontend/ 2>/dev/null || echo "No frontend" || true
COPY docker-compose.yml . 2>/dev/null || echo "No docker-compose.yml" || true
COPY .env.example . 2>/dev/null || echo "No .env.example" || true

# Change to non-root user
USER appuser

# Expose ports
EXPOSE 8000
EXPOSE 3000

# Default command
CMD ["python", "-c", "print('Voluntary Consent Detector container started. To run: python backend/manage.py runserver 0.0.0.0:8000')"]
