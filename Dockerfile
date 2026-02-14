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

# Copy built frontend from Stage 1 into a 'static' folder inside the backend directory
COPY --from=frontend-builder /app/frontend/out ./static

# Verify the static build exists
RUN if [ ! -f ./static/index.html ]; then echo "Frontend build failed: index.html not found"; exit 1; fi
RUN ls -la ./static

# Expose port
EXPOSE 8000

# Start command using the $PORT environment variable
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
