# IdleBite Addition Summary

What was added to transform from basic monitoring → revenue optimization platform

---

## 1. ✅ Offer/Promotion Engine

### Files Added
- `backend/src/services/offerEngine.ts` - Core offer logic
- `backend/src/routes/offers.ts` - Offer API endpoints

### What It Does

**Capacity Score Calculation:**
```
Score = 75% Kitchen Signal + 25% Pickup Signal (0-100)
├─ 0-40%:  Underutilized → LAUNCH offers
├─ 40-70%: Normal operations
├─ 70-85%: Caution → REDUCE offers  
└─ 85-100%: Protection → STOP offers
```

**Automatic Offer Generation:**
- Detects low occupancy (<40%)
- Calculates optimal discount (12-20%) based on utilization
- Verifies it doesn't violate margin floor
- Enforces cooldown period (default: 30 min between offers)
- Respects restaurant's food cost % + target margin %

**Margin Protection:**
```typescript
if (discount_percentage > margin_floor) {
  return null; // Too risky - offer rejected
}
```

**API Endpoints:**
```
GET    /api/offers                    → List active offers
POST   /api/offers                    → Create manual offer
PATCH  /api/offers/:id                → Update status (pause/stop/resume)
POST   /api/offers/auto-launch        → Trigger auto-offer based on capacity
GET    /api/offers/config             → Get restaurant margin settings
PATCH  /api/offers/config             → Update settings
GET    /api/offers/metrics            → Performance metrics (24h)
```

### Key Features
- ✅ Rule-based (deterministic, not ML - per MVP PRD)
- ✅ Margin-aware (never below cost floor)
- ✅ Auto-cooldown (prevents over-discounting)
- ✅ Restaurant override always enabled
- ✅ Event tracking (launched, paused, stopped, redeemed)

---

## 2. ✅ Delivery Router / Integration Layer

### Files Added
- `backend/src/services/deliveryRouter.ts` - Delivery routing logic
- `backend/src/routes/delivery.ts` - Delivery API endpoints

### What It Does

**Platform Selection:**
```
1. Prefer native (Stripe) - no platform fee
2. Round-robin through connected platforms (Uber Direct, DoorDash, Skip)
3. Future: optimize by cost, speed, density
```

**Order Batching:**
```typescript
// Group orders by delivery zone + prep window
// MVP: Simple grouping
// Future: geo-clustering + kitchen prep time optimization
```

**Integration Stubs (Ready for Real APIs):**
- ✅ `sendToUberDirect()` - Stub with logging
- ✅ `sendToDoorDash()` - Stub with logging
- ✅ `sendToSkip()` - Stub with logging
- ✅ `routeOrder()` - Main orchestration function

**Webhook Receivers (For Delivery Status):**
```
POST /api/delivery/webhooks/pickup   → Order picked up
POST /api/delivery/webhooks/delivered → Order delivered
```

**API Endpoints:**
```
GET    /api/delivery/integrations                   → List platforms
POST   /api/delivery/integrations                   → Connect platform
DELETE /api/delivery/integrations/:platform         → Disconnect
POST   /api/delivery/route-order                    → Send order to delivery
GET    /api/delivery/metrics                        → Performance stats
POST   /api/delivery/webhooks/pickup                → Delivery webhook
POST   /api/delivery/webhooks/delivered             → Delivery webhook
```

### Key Features
- ✅ No fleet ownership (Uber, DoorDash, Skip integrated)
- ✅ API-first (stubs ready for real integration)
- ✅ Delivery cost tracking
- ✅ Fulfillment status monitoring
- ✅ Webhook support for real-time updates

---

## 3. ✅ Enhanced Merchant Dashboard

### Files Added
- `frontend/app/dashboard/merchant/page.tsx` - Revenue optimization view

### What It Shows

**Real-Time Capacity Status:**
- Color-coded capacity level (Underutilized → Normal → Caution → Protection)
- Live occupancy % + capacity score
- "Launch Offer Now" button when underutilized
- Protection warning when at capacity

**Active Offers Section:**
```
[15% Off - Next 45 Min!] [LIVE]
├─ Auto-generated
├─ Expires in 32 minutes
└─ Delivery platforms: Native, Uber, DoorDash, Skip
```

**24-Hour Metrics:**
- Offers Launched: count
- Total Redemptions: count
- Additional Revenue: $XXX
- Avg Orders per Offer: N

**Delivery Performance:**
- Per-platform metrics
  - Total orders routed
  - Avg delivery cost
  - Avg delay in minutes

**Configuration Management:**
- Food cost %
- Target margin %
- Min/max discount thresholds
- Offer cooldown period
- Auto-offers enabled/disabled

### Features
- ✅ Real-time Socket.io updates
- ✅ Auto-launch trigger button
- ✅ Responsive grid layout
- ✅ Color-coded alerts
- ✅ Revenue tracking

---

## 4. ✅ Investor Demo Flow

### Files Added
- `INVESTOR_DEMO.md` - Full 10-minute demo script + setup guide

### What It Demonstrates

**The Narrative:**
```
Problem: Restaurant idle at 2:15 PM (losing $300-500/day)
Solution: Camera detects low occupancy
Action: System auto-generates 15% offer
Result: 8 orders, $380 additional revenue, capacity protected
Timeline: 45 minutes end-to-end
```

**The Technical Story:**
1. Idle kitchen detected (<40% capacity)
2. System calculates safe discount (respects margins)
3. Offer launches on all delivery platforms
4. Customers see time-boxed urgency
5. Orders spike
6. Occupancy rises
7. Offer auto-pauses at 85% capacity (protection)
8. Revenue locked in, reputation protected

**Demo Sections:**
- Pre-demo setup (5 min)
- Problem intro (1 min)
- Auto-detection (1 min)
- Offer launch (1 min)
- Order surge (1 min)
- Capacity rising (1 min)
- Protection kicks in (1 min)
- Results summary (1 min)
- Q&A prep (answers included)

**Key Points to Emphasize:**
- Margin safety (the secret sauce)
- Fully automatic (no work for restaurant)
- Real-time capacity (live, not static)
- Delivery agnostic (no fleet ownership)
- Privacy-first (no facial recognition)

---

## 5. ✅ Database Schema Additions

### New Tables

**restaurant_config**
```sql
food_cost_percentage
target_margin_percentage
min_offer_discount / max_offer_discount
capacity_threshold_underutilized (40)
capacity_threshold_caution (70)
capacity_threshold_protection (85)
offer_cooldown_minutes (30)
auto_offers_enabled (boolean)
```

**offers**
```sql
title, description
discount_percentage
min_order_value
max_redemptions, redemptions_count
valid_from, valid_until
delivery_platforms (array)
status: draft|active|paused|expired|stopped
auto_generated (boolean)
created_by_user_id / created_by_system
```

**offer_events**
```sql
event_type: launched|paused|stopped|expired|redeemed
data: JSONB (orders, revenue, reason)
timestamp
```

**delivery_integrations**
```sql
platform: uber_direct|doordash|skip|stripe_native
api_key
status: connected|disconnected|error
config: JSONB (platform-specific)
last_sync
```

**order_fulfillment**
```sql
order_id, delivery_platform
external_order_id (from platform)
estimated_pickup_time, actual_pickup_time
estimated_delivery_time, actual_delivery_time
delivery_cost, platform_fee
fulfillment_status: pending|picked_up|delivered|cancelled
```

---

## Architecture Flow

```
Camera Feed (5s interval)
    ↓ Occupancy: 25%
    ↓
Backend (occupancy event)
    ↓
Offer Engine (OfferEngine.calculateCapacityScore)
    ├─ Score: 25% → Underutilized
    ├─ Can launch? (cooldown check)
    └─ Generate offer (15% off, 45 min)
    ↓
Launch (OfferEngine.launchOffer)
    ├─ INSERT into offers table
    ├─ Broadcast via Socket.io
    └─ Log event
    ↓
Delivery Router (DeliveryRouter.routeOrder)
    ├─ Select platform (native → Uber → DoorDash → Skip)
    ├─ Send to platform (stub API call)
    └─ Track fulfillment
    ↓
Frontend (Merchant Dashboard)
    ├─ Real-time update via Socket.io
    ├─ Show "15% Off - LIVE"
    └─ Display metrics
    ↓
Capacity Rises (occupancy: 78%)
    ↓
Offer Engine (Protection Logic)
    ├─ Score: 59% → Caution
    └─ "Reduce offers" signal
    ↓
Capacity Critical (occupancy: 89%)
    ↓
Offer Engine (Protection)
    ├─ Score: 67% → Protection
    ├─ Stop all offers
    └─ Event: "stopped" reason: "capacity protection"
    ↓
Frontend Update
    ├─ Red alert: "At Capacity"
    ├─ Offer status: PAUSED
    └─ Metrics updated
```

---

## API Quick Reference

### Offers
```bash
# Get active offers
curl -H "x-restaurant-id: uuid" -H "x-user-id: uuid" \
  http://localhost:3001/api/offers

# Trigger auto-launch
curl -X POST -H "Content-Type: application/json" \
  -H "x-restaurant-id: uuid" -H "x-user-id: uuid" \
  -d '{"kitchen_occupancy": 25, "pickup_congestion": 0}' \
  http://localhost:3001/api/offers/auto-launch

# Get metrics
curl -H "x-restaurant-id: uuid" -H "x-user-id: uuid" \
  http://localhost:3001/api/offers/metrics
```

### Delivery
```bash
# List integrations
curl -H "x-restaurant-id: uuid" -H "x-user-id: uuid" \
  http://localhost:3001/api/delivery/integrations

# Route order to delivery
curl -X POST -H "Content-Type: application/json" \
  -H "x-restaurant-id: uuid" -H "x-user-id: uuid" \
  -d '{"order_id": "uuid", "selected_platform": "uber_direct"}' \
  http://localhost:3001/api/delivery/route-order
```

---

## What's Still a Stub (Production Work)

- [ ] Real Uber Direct API integration (OAuth, order creation)
- [ ] Real DoorDash API integration
- [ ] Real Skip API integration
- [ ] Stripe webhook receiver (Stripe payment processing)
- [ ] POS system integrations (Square, Toast, etc.)
- [ ] Geo-clustering for batching optimization
- [ ] Predictive demand (Phase 2)
- [ ] ML-based pricing (Phase 2)
- [ ] Consumer app (Phase 2)

---

## Testing the System End-to-End

### 1. Start System
```bash
docker-compose up
```

### 2. Open Merchant Dashboard
```
http://localhost:3000/dashboard/merchant
```

### 3. Simulate Occupancy Change
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "event_type": "occupancy",
    "data": {"count": 25}
  }' \
  http://localhost:3001/api/events
```

### 4. Watch:
- Capacity score updates
- Offer auto-launches
- Metrics appear
- Red alert if you push > 85%

---

## Success Criteria (for Pilot)

✅ Auto-launch works (no manual configuration)  
✅ Margin floor prevents bad offers  
✅ Offers visible in delivery platforms  
✅ Capacity protection stops offers at threshold  
✅ Metrics track revenue impact  
✅ Restaurant sees ROI in first week  

---

## Next Phase (Post-MVP)

1. **Real POS Integration** - Square/Toast webhook → auto-orders
2. **Real Delivery APIs** - Uber Direct, DoorDash, Skip auth + order routing
3. **Predictive Demand** - Add weather, events, historical patterns
4. **Multi-location** - Scale from 1 to 5+ restaurants
5. **Investor Metrics** - Revenue data, CAC, LTV, unit economics
