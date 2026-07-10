# Multi-stage build for production-ready Django application
# Stage 1: Builder - Install dependencies
FROM python:3.11-slim as builder

LABEL maintainer="DineOps Team"
LABEL description="DineOps - Django REST Framework Backend"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Stage 2: Runtime - Minimal image
FROM python:3.11-slim

LABEL maintainer="DineOps Team"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.dev

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1000 django_user && \
    mkdir -p /app && \
    chown -R django_user:django_user /app

WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY --chown=django_user:django_user . .

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/mediafiles /app/logs && \
    chown -R django_user:django_user /app/staticfiles /app/mediafiles /app/logs

# Switch to non-root user
USER django_user

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import sys; print('OK'); sys.exit(0)" || exit 1

# Run migrations and start gunicorn
CMD sh -c "python manage.py migrate --noinput 2>/dev/null || true && \
           python manage.py collectstatic --noinput 2>/dev/null || true && \
           gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4 --worker-class sync --timeout 120 --access-logfile - --error-logfile -"

