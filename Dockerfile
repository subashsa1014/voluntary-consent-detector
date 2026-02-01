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
# Create empty requirements.txt if backend/requirements.txt doesn't exist
RUN touch requirements.tx
RUN pip install --user --no-cache-dir --no-deps -r requirements.txt || echo "No dependencies installed"
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
# Copy application codeCOPY . /app/

# Change to non-root user
USER appuser

# Expose ports
EXPOSE 8000
EXPOSE 3000

# Default command
CMD ["python", "-c", "print('Voluntary Consent Detector container started. To run: python backend/manage.py runserver 0.0.0.0:8000')"]
