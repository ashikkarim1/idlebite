# Deployment Guide

## Quick Start (Development)

### Prerequisites
- Docker & Docker Compose
- OR Node.js 20+, Python 3.11+, PostgreSQL 16

---

## Option A: Docker Compose (Recommended for MVP)

### 1. Clone & Setup
```bash
cd KitchenOptimizer
cp .env.example .env
```

### 2. Start Everything
```bash
docker-compose up
```

Wait for all services to be healthy (postgres health check, backend ready, frontend compiled).

### 3. Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: postgres://postgres:postgres@localhost:5432/kitchen_optimizer

### 4. Login
Click "Enter Dashboard" on login page (uses test credentials from database).

---

## Option B: Local Development (No Docker)

### 1. PostgreSQL Setup
```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Linux (Ubuntu)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Manually create database
psql -U postgres
CREATE DATABASE kitchen_optimizer;
CREATE USER postgres PASSWORD 'postgres';
\c kitchen_optimizer
psql -U postgres -d kitchen_optimizer < database/migrations/001_init.sql
```

### 2. Backend (Terminal 1)
```bash
cd backend
npm install
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kitchen_optimizer" npm run dev
# ✓ Server running on http://localhost:3001
```

### 3. Camera Service (Terminal 2)
```bash
cd camera-service
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate (Windows)
pip install -r requirements.txt
DEMO_MODE=true python src/main.py
# Running in DEMO MODE
# Occupancy: 45
```

### 4. Frontend (Terminal 3)
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
# ▲ Next.js 14.0.3
# ✓ Ready in 2.5s on http://localhost:3000
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kitchen_optimizer

# Backend
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Camera Service
API_URL=http://localhost:3001
CAMERA_RTSP_URL=rtsp://localhost:8554/stream
CAMERA_NAME=dining_room_cam
CAMERA_ZONE=dining_room
RESTAURANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479
DEMO_MODE=true          # Set to false for real camera
DETECTION_INTERVAL=2    # Process every 2nd frame

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## With Real Camera (RTSP)

### 1. Configure Camera URL
```bash
# Update .env or docker-compose.yml
CAMERA_RTSP_URL=rtsp://192.168.1.100:554/stream
DEMO_MODE=false
```

### 2. Test Connection
```bash
# Install ffmpeg to test RTSP
brew install ffmpeg
ffplay rtsp://192.168.1.100:554/stream
```

### 3. Check Logs
```bash
# Docker
docker-compose logs -f camera-service

# Local
python src/main.py  # See debug output
```

---

## Production Deployment (AWS Example)

### Architecture
```
CloudFront (CDN)
    ↓
ALB (Application Load Balancer)
    ├─ ECS Fargate (3× backend)
    ├─ CloudFront (frontend S3)
    └─ RDS PostgreSQL
    
EC2 GPU (camera service, auto-scaling by restaurant)
```

### 1. Backend Deployment

#### Build & Push Docker Image
```bash
# Build for production
docker build -t my-registry/kitchen-backend:latest backend/

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin my-registry
docker push my-registry/kitchen-backend:latest
```

#### Deploy to ECS
```bash
# Use AWS Console or ECS CLI
# • Task Definition: 512 CPU, 1024 MB memory
# • Service: 3 tasks, load balanced
# • Env: DATABASE_URL from Secrets Manager
```

### 2. Frontend Deployment

#### Build Static Site
```bash
cd frontend
npm run build
# Creates .next/static output

# Deploy to S3 + CloudFront
aws s3 sync .next/static s3://my-bucket/static/ --cache-control "public, immutable, max-age=31536000"
```

#### Or Deploy Full SSR
```bash
# Same as backend ECS deployment
# Set NODE_ENV=production
```

### 3. Database Setup

#### AWS RDS
```bash
# Create PostgreSQL 16 instance
# • Multi-AZ: enabled
# • Backup retention: 30 days
# • Automated minor version upgrade

# Apply migrations
psql -h kitchen-prod-db.xxxx.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d kitchen_optimizer \
     < database/migrations/001_init.sql
```

#### Enable RLS (Row-Level Security)
```sql
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their restaurant
CREATE POLICY tenant_isolation ON events
  FOR ALL
  USING (restaurant_id = current_user_id()::uuid);
```

### 4. Camera Service Scaling

#### Per-Restaurant Deployment
```bash
# Deploy one camera service per restaurant
# Environment:
#   RESTAURANT_ID=<specific-uuid>
#   CAMERA_RTSP_URL=<camera-ip>
#   API_URL=<backend-alb-dns>
```

#### Auto-scaling (Future)
```yaml
# Kubernetes DaemonSet per restaurant
# - Restarts if camera disconnects
# - Health checks on /metrics
# - Prometheus scraping
```

### 5. CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build backend
        run: |
          docker build -t my-registry/kitchen-backend:${{ github.sha }} backend/
          docker push my-registry/kitchen-backend:${{ github.sha }}
      
      - name: Build frontend
        run: |
          cd frontend
          npm install && npm run build
          aws s3 sync .next s3://my-bucket/
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster kitchen-prod \
            --service kitchen-backend \
            --force-new-deployment
```

---

## Health Checks & Monitoring

### API Health
```bash
curl http://localhost:3001/health
# {"status":"ok"}
```

### Database Health
```bash
psql -h localhost -U postgres -d kitchen_optimizer -c "SELECT 1"
```

### WebSocket Health
```bash
# Test via browser console
io('http://localhost:3001')
socket.on('connect', () => console.log('Connected'))
socket.emit('auth', { restaurant_id: '...', user_id: '...' })
socket.on('event', (e) => console.log('Event:', e))
```

### Logs
```bash
# Docker compose
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f camera-service

# Production (CloudWatch)
aws logs tail /ecs/kitchen-backend --follow
```

---

## Troubleshooting

### "cannot connect to database"
```bash
# Check PostgreSQL is running
psql -h localhost -U postgres -c "SELECT 1"

# Or via Docker
docker-compose exec postgres psql -U postgres -d kitchen_optimizer -c "SELECT 1"
```

### "WebSocket connection failed"
```bash
# Check CORS: FRONTEND_URL must match origin
# Update docker-compose.yml FRONTEND_URL=http://your-domain:3000
```

### "Camera service not sending events"
```bash
# Check API_URL
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"restaurant_id":"f47ac10b...","event_type":"occupancy","data":{"count":50}}'

# Check logs
docker-compose logs camera-service
```

### "Frontend can't reach backend"
```bash
# Check NEXT_PUBLIC_API_URL
# Must be accessible from browser (not localhost if deploying)
# Update to: NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Performance Tuning

### Database
```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM events 
WHERE restaurant_id = '...' 
ORDER BY timestamp DESC 
LIMIT 50;

-- Vacuum regularly
VACUUM ANALYZE;
```

### Backend
```javascript
// Monitor memory
setInterval(() => {
  const mem = process.memoryUsage();
  console.log(`Memory: ${Math.round(mem.heapUsed / 1024 / 1024)}MB`);
}, 10000);
```

### Frontend
```bash
# Build analysis
npm run build -- --analyze
# Check bundle size
```

---

## Backup & Disaster Recovery

### Database Backup
```bash
# Manual
pg_dump -h localhost -U postgres kitchen_optimizer > backup.sql

# Restore
psql -h localhost -U postgres -d kitchen_optimizer < backup.sql

# Automated (AWS RDS)
# Enabled by default, retention = 30 days
```

### Point-in-Time Recovery
```bash
# AWS RDS
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier kitchen-restored \
  --db-snapshot-identifier kitchen-prod-2024-01-15
```

---

## Rollback Procedure

```bash
# Backend
docker image ls | grep kitchen-backend
docker run -d my-registry/kitchen-backend:previous-sha

# Frontend
aws s3 sync s3://my-bucket-backup/2024-01-14 s3://my-bucket/

# Database
psql < backup-2024-01-14.sql
```

