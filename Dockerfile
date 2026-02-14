# Multi-stage Docker build for OSINT Platform
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Use empty API URL for same-origin requests
ENV NEXT_PUBLIC_API_URL=""
RUN npm run build

# Stage 2: Backend & Runner
FROM python:3.11
WORKDIR /app

# Install system dependencies (full image already has many, but adding specific OSINT ones)
RUN apt-get update && apt-get install -y \
    whois \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/out ./static

# Expose port (Render ignores this but good practice)
EXPOSE 8000

# Start command using the $PORT environment variable provided by Render
# We use sh -c to ensure the environment variable is expanded
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
