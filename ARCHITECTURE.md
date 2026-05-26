# Kitchen Optimizer - Architecture & Design

## Overview

Kitchen Optimizer is a real-time restaurant operations monitoring platform designed as a **modular monolith** for fast MVP deployment with built-in scalability.

### Core Design Principles
- **MVP-First**: Single restaurant pilot → multi-tenant later
- **Event-Driven**: All state changes → events → real-time broadcast
- **Loosely Coupled**: Services can scale independently
- **Demo Mode**: Full functional testing without real cameras

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
│  ┌──────────────────┬──────────────────┬──────────────────┐  │
│  │   Main Dashboard │  Kitchen Display │  Dining Monitor  │  │
│  └──────────────────┴──────────────────┴──────────────────┘  │
│  Socket.io Client Hook → Real-time event subscription       │
└──────────────────────────────┬────────────────────────────────┘
                               │ HTTP + WebSocket
┌──────────────────────────────┴────────────────────────────────┐
│              BACKEND API (Node.js + Socket.io)                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Express Routes:                                         │  │
│  │  • GET  /api/restaurants/me                            │  │
│  │  • GET  /api/restaurants/me/cameras                    │  │
│  │  • POST /api/restaurants/me/cameras                    │  │
│  │  • GET  /api/restaurants/me/orders                     │  │
│  │  • PATCH /api/restaurants/me/orders/:id                │  │
│  │  • GET  /api/events                                    │  │
│  │  • POST /api/events (from camera service)              │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Socket.io:                                              │  │
│  │  • on('auth') → join restaurant:X room                 │  │
│  │  • emit('event') → broadcast occupancy + order updates  │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Services:                                               │  │
│  │  • EventService → create + broadcast events             │  │
│  │  • RestaurantService → CRUD orders, cameras             │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬────────────────────────────────┘
                               │ PostgreSQL
┌──────────────────────────────┴────────────────────────────────┐
│                     DATABASE (PostgreSQL)                      │
│  ┌─────────────┬──────────┬────────┬────────┬──────────────┐  │
│  │ restaurants │ cameras  │ events │ orders │   users      │  │
│  └─────────────┴──────────┴────────┴────────┴──────────────┘  │
└──────────────────────────────┬────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            CAMERA SERVICE (Python + OpenCV)                 │
│  ┌──────────────┬──────────────┬──────────────────────────┐  │
│  │ RTSP Capture │ YOLOv8 Nano  │ POST /api/events         │  │
│  │ or Demo Data │ Inference    │ (occupancy events)       │  │
│  └──────────────┴──────────────┴──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Real-time Occupancy

```
1. CAPTURE
   Camera Service (Python)
   • RTSP stream → frame buffer
   OR demo mode: generate occupancy 0-100

2. PROCESS
   • YOLOv8 Nano inference (every N frames)
   • Count person detections
   • Extract metadata: confidence, zone, timestamp

3. SEND
   POST /api/events {
     restaurant_id: "...",
     event_type: "occupancy",
     data: { count: 42, zone: "dining_room" },
     camera_id: "..."
   }

4. STORE & BROADCAST
   Backend Service
   • INSERT event into PostgreSQL
   • Broadcast via Socket.io to restaurant:X room

5. RECEIVE & DISPLAY
   Frontend (useSocketEvent hook)
   • Listen to 'event' on socket
   • Filter to occupancy events
   • Update real-time gauge + chart

6. HISTORY
   GET /api/events (returns last 50 by default)
   • Fetch historical data on dashboard load
   • Seed charts with past 2 hours of data
```

---

## Database Schema

### restaurants
```sql
id (UUID)          -- tenant identifier
name (VARCHAR)     -- "Test Restaurant"
created_at (TS)    -- when onboarded
```

### cameras
```sql
id (UUID)          -- unique camera ID
restaurant_id (FK) -- which restaurant
name (VARCHAR)     -- "Dining Room Cam 1"
rtsp_url (VARCHAR) -- "rtsp://camera-ip/stream"
zone (VARCHAR)     -- 'kitchen' | 'dining_room' | 'pickup_desk'
enabled (BOOL)     -- false to disable without deleting
created_at (TS)
```

### events
```sql
id (UUID)
restaurant_id (FK)
camera_id (FK)     -- NULL if manual/POS event
event_type (VARCHAR) -- 'occupancy' | 'queue' | 'order' | 'prep_ready'
data (JSONB)       -- flexible: { count: 45, zone: "dining_room", ... }
timestamp (TS)     -- when event occurred

Index: (restaurant_id, timestamp DESC) for fast lookups
```

### orders
```sql
id (UUID)
restaurant_id (FK)
order_number (VARCHAR) -- "123", "ABC-456"
items (JSONB)      -- [{ name: "burger", qty: 2 }, ...]
status (VARCHAR)   -- 'pending' | 'cooking' | 'ready' | 'picked_up'
created_at (TS)
ready_at (TS)      -- when moved to 'ready' (for wait time calc)
```

### users
```sql
id (UUID)
restaurant_id (FK)
email (VARCHAR UNIQUE)
password_hash (VARCHAR) -- placeholder
role (VARCHAR)     -- 'owner' | 'manager' | 'staff'
created_at (TS)
```

---

## Multi-tenancy Implementation

### MVP (Current)
Simple header-based tenant context:
```http
GET /api/restaurants/me HTTP/1.1
Host: localhost:3001
x-restaurant-id: f47ac10b-58cc-4372-a567-0e02b2c3d479
x-user-id: b1234567-89ab-cdef-0123-456789abcdef
x-user-role: owner
```

**Middleware**: `tenantMiddleware` extracts headers → `req.tenant` context

### Production Ready
Replace headers with JWT tokens:
```typescript
// Extract restaurant_id from JWT claim
const decoded = jwt.verify(token, secret);
const restaurant_id = decoded.sub; // subject claim
const user_id = decoded.user_id;
const user_role = decoded.role;
```

---

## Event System

### Event Types

#### occupancy
Camera → occupancy count per zone
```json
{
  "event_type": "occupancy",
  "data": {
    "count": 45,
    "zone": "dining_room",
    "confidence": 0.95,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### queue
Kitchen prep queue depth (future)
```json
{
  "event_type": "queue",
  "data": {
    "pending_orders": 8,
    "zone": "kitchen",
    "avg_prep_time_sec": 600
  }
}
```

#### order
Order state change (POS integration)
```json
{
  "event_type": "order",
  "data": {
    "order_number": "123",
    "status": "cooking",
    "items": [...]
  }
}
```

#### prep_ready
Kitchen signals order ready (integration point)
```json
{
  "event_type": "prep_ready",
  "data": {
    "order_number": "123",
    "zone": "kitchen"
  }
}
```

---

## API Endpoints

### Restaurants
```
GET  /api/restaurants/me
     Returns: { id, name, created_at }
     
GET  /api/restaurants/me/cameras
     Returns: Camera[] ordered by created_at
     
POST /api/restaurants/me/cameras
     Body: { name, rtsp_url, zone }
     Returns: Camera
```

### Orders
```
GET  /api/restaurants/me/orders
     Query: ?status=ready
     Returns: Order[] (last 100)
     
PATCH /api/restaurants/me/orders/:id
     Body: { status: "ready" }
     Returns: updated Order
```

### Events
```
GET  /api/events
     Query: ?limit=50
     Returns: Event[] (most recent first)
     
POST /api/events (internal, from camera service)
     Body: { restaurant_id, event_type, data, camera_id? }
     Returns: Event
```

### WebSocket
```
socket.emit('auth', { restaurant_id, user_id })
  → joins room `restaurant:{id}`

socket.on('event', (event) => { ... })
  → receives all events for this restaurant in real-time
```

---

## Scaling Strategy

### Phase 1: Pilot (Current)
- Single restaurant, single backend
- Demo mode camera service
- PostgreSQL local or managed (AWS RDS)

### Phase 2: Multi-tenant
- Add JWT auth → extract restaurant_id from claims
- Add RLS (row-level security) policies to Postgres
- Separate camera services per restaurant (or add restaurant_id routing)

### Phase 3: High Volume
- Add Redis for event caching + pub/sub
- Multiple backend instances behind load balancer (Session.io compatible)
- Separate read replicas for reporting queries
- Sharded camera services by restaurant

### Phase 4: Regional
- Multi-region Postgres (primary + replicas)
- Edge inference (local GPU on camera)
- Regional WebSocket gateways

---

## Security Considerations

### Current (MVP - Pilot Only)
- No auth (assume trusted internal network)
- Demo mode only (no real camera access)
- Default database credentials (change in docker-compose)

### Production Checklist
- [ ] JWT token validation (RS256 or HS256)
- [ ] Row-level security (Postgres RLS)
- [ ] CORS properly configured per domain
- [ ] HTTPS/TLS for all traffic
- [ ] Rate limiting on API endpoints
- [ ] RTSP credentials not in logs
- [ ] Database encryption at rest
- [ ] Secrets managed (environment variables, vault)
- [ ] Audit logging for sensitive operations
- [ ] OWASP top 10 review

---

## Performance Considerations

### Occupancy Detection
- YOLOv8 Nano: ~45ms per inference (on CPU)
- Process every 2nd frame: ~30 FPS → inference ~15 FPS
- Send event every 5s: low overhead
- Async Python service: doesn't block API

### Database
- Events table can grow fast (1 event/5s = ~17k/day)
- Index on (restaurant_id, timestamp) keeps lookups fast
- Archive old events monthly (move to analytics DB)
- Partition events table by date after 6 months

### Frontend
- useSocketEvent hook unsubscribes on unmount
- Chart limited to last 30 points (prevents memory bloat)
- Real-time updates via Socket.io (no polling)
- Build-time optimization: Next.js automatic code splitting

---

## Deployment

### Docker Compose (Local Development)
```bash
docker-compose up
```

### Production (Example: AWS)
1. RDS PostgreSQL (managed)
2. ECS Fargate for backend + frontend
3. EC2/GPU instance for camera service
4. S3 for model weights caching
5. CloudFront CDN for frontend
6. Application Load Balancer
7. CloudWatch for logs + metrics

### Kubernetes (Future)
```yaml
# backend-deployment.yaml
replicas: 3
resources:
  requests: { cpu: 250m, memory: 512Mi }

# camera-service-daemonset.yaml
# One per restaurant, runs on dedicated nodes

# postgres-statefulset.yaml
# Master + read replicas
```

---

## Monitoring & Observability (Future)

### Metrics
- API response time (p50, p95, p99)
- WebSocket connections active
- Detection latency (camera → event → frontend)
- Database query performance
- Camera stream health

### Logging
- Structured JSON logs
- Centralized (ELK, Datadog)
- Trace occupancy events end-to-end

### Alerting
- Camera disconnected >5 min
- API error rate >1%
- Database replication lag >10s
- Kitchen bottleneck detected (queue >10)

---

## Testing Strategy

### Backend
- Unit tests: services (EventService, RestaurantService)
- Integration tests: database + API routes
- Load test: 100 concurrent WebSocket connections
- E2E: full flow (capture → send → broadcast → receive)

### Frontend
- Component tests: OccupancyGauge, OrderList, EventChart
- Hooks tests: useSocket, useSocketEvent
- Visual regression: Chromatic or Percy
- E2E: Playwright or Cypress

### Camera Service
- Unit: occupancy_detector (mock frames)
- Integration: RTSP capture + send events
- Load: process 30 FPS for 1 hour continuously

---

## Troubleshooting Checklist

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| Frontend can't reach backend | Check NEXT_PUBLIC_API_URL | Match backend service URL |
| WebSocket disconnects | Check CORS origin | Update FRONTEND_URL in backend env |
| Camera service not sending | Check DEMO_MODE=true | Enable demo mode or verify RTSP URL |
| Database migration fails | Check SQL syntax | Manually apply migrations via psql |
| Orders not updating | Check Socket.io auth | Verify restaurant_id matches |

