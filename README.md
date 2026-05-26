# Kitchen Optimizer - Restaurant Operations Dashboard

A production-ready MVP for real-time restaurant monitoring with computer vision-based occupancy detection, order management, and kitchen operations visibility.

## 🏗️ Architecture

**Modular Monolith Stack:**
- **Backend**: Node.js + TypeScript (Express + Socket.io)
- **Frontend**: Next.js (React) + Tailwind CSS
- **Database**: PostgreSQL with simple normalized schema
- **Vision Service**: Python (OpenCV + YOLOv8 Nano)
- **Real-time**: Socket.io for WebSocket events

## 🚀 Quick Start (1 Command)

```bash
docker-compose up
```

Then visit:
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3001
- **Database**: postgres://postgres:postgres@localhost:5432/kitchen_optimizer

## 📁 Project Structure

```
kitchen-optimizer/
├── backend/                 # Node.js/Express API + WebSocket server
│   ├── src/
│   │   ├── server.ts       # Main Express + Socket.io setup
│   │   ├── routes/         # API endpoints (restaurants, events, orders)
│   │   ├── services/       # Business logic (EventService, RestaurantService)
│   │   ├── middleware/     # Tenant context, auth
│   │   └── types/          # TypeScript interfaces
│   └── Dockerfile
│
├── frontend/                # Next.js dashboard
│   ├── app/
│   │   ├── page.tsx        # Login screen
│   │   ├── dashboard/      # Main dashboard & sub-pages
│   │   └── api/            # Next.js API routes (future auth)
│   ├── components/         # Reusable UI (OccupancyGauge, OrderList, etc)
│   ├── hooks/              # useSocket hook for real-time
│   └── Dockerfile
│
├── camera-service/         # Python CV processing
│   ├── src/
│   │   ├── main.py        # Entry point (real or demo mode)
│   │   ├── camera_capture.py   # RTSP stream handling
│   │   ├── occupancy_detector.py # YOLOv8 inference
│   │   └── config.py       # Environment config
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/
│   └── migrations/
│       └── 001_init.sql    # Schema (auto-created on startup)
│
└── docker-compose.yml      # Full local stack
```

## 🎯 Key Features

### Dashboard Views
1. **Main Dashboard** (`/dashboard`)
   - Real-time occupancy gauge (dining room, kitchen, pickup desk)
   - Live occupancy trend chart
   - Recent orders status

2. **Kitchen Display** (`/dashboard/kitchen`)
   - 3-column view: Pending → Cooking → Ready
   - Staff can mark orders as cooking/ready
   - Large order numbers for visibility

3. **Dining Room Monitor** (`/dashboard/dining-room`)
   - Live occupancy count with capacity %
   - Historical occupancy trend

4. **Pickup Desk** (`/dashboard/pickupdesk`)
   - Ready orders with large display
   - Wait time tracking (red if >5 min)
   - Instant "Picked Up" button

### Real-time Architecture
```
Camera Feed → Python Service (Demo: fake data every 5s)
              ↓
              POST /api/events
              ↓
              Backend (stores in Postgres + broadcasts via Socket.io)
              ↓
              Frontend receives via useSocket hook → updates charts/gauges
```

### Multi-tenancy
- Simple implementation: headers `x-restaurant-id`, `x-user-id` extracted by middleware
- Ready to extend to JWT tokens
- Database tables scoped by `restaurant_id`

## 🛠️ Development

### Local Setup (Without Docker)

```bash
# Backend
cd backend
npm install
npm run dev  # Starts on :3001

# Camera Service (separate terminal)
cd camera-service
pip install -r requirements.txt
DEMO_MODE=true python src/main.py

# Frontend (separate terminal)
cd frontend
npm install
npm run dev  # Starts on :3000
```

### Environment Variables
Copy `.env.example` to `.env` and customize:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kitchen_optimizer
DEMO_MODE=true  # Set false for real camera processing
CAMERA_RTSP_URL=rtsp://your-camera/stream
```

## 🗄️ Database Schema

**Core Tables:**
- `restaurants` - Tenant isolation
- `cameras` - RTSP sources
- `events` - Occupancy/order/queue events (JSONB flexible payload)
- `orders` - POS orders or manual entry
- `users` - Staff login (placeholder)

All events indexed by `(restaurant_id, timestamp DESC)` for fast queries.

## 🎬 Demo Mode

The camera service runs in **demo mode by default** (`DEMO_MODE=true`):
- Generates fake occupancy data every 5 seconds
- Simulates occupancy trending between 0-100
- Perfect for testing without real cameras

### Switch to Real Camera Processing
```bash
DEMO_MODE=false CAMERA_RTSP_URL=rtsp://camera-ip:port/stream docker-compose up
```

The Python service will:
1. Connect to RTSP stream
2. Run YOLOv8 Nano inference on every Nth frame
3. Count person detections
4. Send occupancy events to backend every 5 seconds

## 📊 Testing the System

1. **Verify Backend**: `curl http://localhost:3001/health`
2. **Check Database**: `psql -h localhost -U postgres -d kitchen_optimizer`
3. **View Logs**: `docker-compose logs -f backend`
4. **Test Events**: POST fake event:
   ```bash
   curl -X POST http://localhost:3001/api/events \
     -H "Content-Type: application/json" \
     -d '{
       "restaurant_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
       "event_type": "occupancy",
       "data": {"count": 42, "zone": "dining_room"}
     }'
   ```

## 🚢 Production Readiness

### MVP for Pilot Restaurant ✓
- Single restaurant deployment
- No complex auth (use headers in pilot)
- Demo mode for testing
- Simple one-command deployment

### What's NOT Included (For MVP)
- JWT authentication (use reverse proxy auth in production)
- POS system integration (API ready, needs integration)
- Failover/redundancy (add later)
- Detailed logging/monitoring (add Prometheus + Grafana later)
- SSL/TLS (add nginx reverse proxy)

### Scale to Multi-tenant
1. Move auth to JWT tokens with `restaurant_id` claim
2. Add RLS (row-level security) policies to Postgres
3. Separate camera services per restaurant (or add routing)
4. Add Redis for event queueing/caching
5. Horizontal scale backend + frontend behind load balancer

## 🔧 Common Tasks

### Add a New Camera
```bash
curl -X POST http://localhost:3001/api/restaurants/me/cameras \
  -H "x-restaurant-id: f47ac10b-58cc-4372-a567-0e02b2c3d479" \
  -H "x-user-id: b1234567-89ab-cdef-0123-456789abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kitchen Camera",
    "rtsp_url": "rtsp://kitchen-cam/stream",
    "zone": "kitchen"
  }'
```

### Manually Create an Order
```bash
psql -h localhost -U postgres -d kitchen_optimizer
INSERT INTO orders (id, restaurant_id, order_number, items, status)
VALUES (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '123', '[]', 'pending');
```

### View Events
```bash
curl http://localhost:3001/api/events \
  -H "x-restaurant-id: f47ac10b-58cc-4372-a567-0e02b2c3d479" \
  -H "x-user-id: b1234567-89ab-cdef-0123-456789abcdef" \
  -H "x-user-role: owner" | jq
```

## 📝 API Endpoints

### Restaurants
- `GET /api/restaurants/me` - Get current restaurant
- `GET /api/restaurants/me/cameras` - List active cameras
- `POST /api/restaurants/me/cameras` - Register camera

### Orders
- `GET /api/restaurants/me/orders` - List orders (optional `?status=ready`)
- `PATCH /api/restaurants/me/orders/{id}` - Update status

### Events (Real-time)
- `GET /api/events` - List recent events (returns last 50 by default)
- `POST /api/events` - Create event (from camera service)
- Socket.io: Listen to `event` for real-time updates

## 🐛 Troubleshooting

**Container won't start:**
```bash
docker-compose logs backend
docker-compose logs camera-service
```

**Database connection failing:**
```bash
docker-compose exec postgres psql -U postgres -d kitchen_optimizer
```

**Frontend can't reach backend:**
- Check `NEXT_PUBLIC_API_URL` in `.env`
- Verify backend is running: `curl http://localhost:3001/health`

**Camera service not sending data:**
- Check `DEMO_MODE=true` is set
- Verify `API_URL` points to backend
- Check logs: `docker-compose logs camera-service`

## 📚 Next Steps for Production

1. **Auth**: Implement JWT tokens + session management
2. **POS Integration**: Connect to Square, Toast, or custom POS via webhooks
3. **Monitoring**: Add Prometheus metrics + Grafana dashboards
4. **Alerting**: Send SMS/Slack when kitchen bottleneck detected
5. **Mobile**: Add React Native app for kitchen staff
6. **Admin Panel**: Manage restaurants, cameras, users
7. **Analytics**: Historical queries, occupancy forecasting

## 📄 License

MIT
