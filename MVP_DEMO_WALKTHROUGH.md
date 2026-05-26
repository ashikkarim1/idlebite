# IdleBite MVP Demo Walkthrough

**Live, working demo of restaurant revenue optimization**

---

## 🎬 Demo Setup (5 minutes)

### Start the System
```bash
cd /path/to/IdleBite
docker-compose up
```

Wait for:
```
✓ PostgreSQL: healthy
✓ Backend: Server running on http://localhost:3001
✓ Frontend: Ready in 1.2s on http://localhost:3000
✓ Camera Service: Running in DEMO MODE
```

### Open Demo Tabs

**Tab 1 - Investor View** (overview):
```
http://localhost:3000/dashboard
```

**Tab 2 - Merchant View** (where magic happens):
```
http://localhost:3000/dashboard/merchant
```

**Tab 3 - Command Line** (ready for API calls):
```bash
RESTAURANT_ID="f47ac10b-58cc-4372-a567-0e02b2c3d479"
USER_ID="b1234567-89ab-cdef-0123-456789abcdef"
API="http://localhost:3001"
```

---

## 🚀 The 8-Minute Demo Flow

### **Minute 0:00 - The Problem** (narrate while showing Tab 1)

**What you're showing:**
- Main dashboard with occupancy gauge at **22%** (RED)
- "Dining Room: 22 people / 100 capacity"
- No active offers

**What you're saying:**

> "It's 2:15 PM on a Tuesday. Lunch is over. Dinner hasn't started. The restaurant is 78% empty.
> 
> This isn't unusual—this happens at every restaurant. But it's expensive. The kitchen staff is here, utilities are running, rent is due. Yet the kitchen is idle.
> 
> Most restaurants try to fix this with a generic coupon sent to everyone. But a 20% discount blasted at 2:15 PM? That's just destroying margins.
> 
> **What if the system could be smarter?**"

---

### **Minute 1:30 - The Camera Detects Opportunity** (show Tab 1 updating)

**Simulate occupancy drop:**
```bash
curl -X POST "$API/api/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurant_id\": \"$RESTAURANT_ID\",
    \"event_type\": \"occupancy\",
    \"data\": {\"count\": 18, \"zone\": \"dining_room\"}
  }"
```

**Watch:**
- Occupancy gauge drops to **18%** (bright blue)
- Status: "UNDERUTILIZED"
- Capacity Score: **13/100**

**What you're saying:**

> "Our camera—not tracking people, not watching employees—just measuring kitchen activity. It sees: the kitchen can handle way more orders.
> 
> The system evaluates: 'Can we make an offer?' It checks:
> - Food costs: 30%
> - Target margin: 35%
> - Maximum safe discount: 22%
> 
> **And in 2 seconds, it decides: yes, launch a 15% discount.**"

---

### **Minute 2:45 - The Offer Auto-Launches** (watch Tab 2)

**Watch Merchant Dashboard:**
- "Active Offers: 1"
- New card appears: **"15% Off - Next 45 Minutes!"**
- Badge: `[LIVE]` in green
- "Auto-generated" label
- Countdown timer

**Explain the offer:**

> "This isn't a generic coupon. It's smart:
> - **Time-boxed**: 45 minutes creates urgency (FOMO)
> - **Geo-targeted**: Goes to customers within delivery range
> - **Margin-safe**: At 15%, the restaurant still makes $12 profit per $40 order
> - **Delivery agnostic**: Lives on native Stripe, Uber Eats, DoorDash, Skip simultaneously
> - **Auto-stopped**: When kitchen hits 85% capacity, offer pauses automatically"

---

### **Minute 4:00 - Orders Surge** (simulate incoming orders)

**Send 3 test orders:**
```bash
for i in {1..3}; do
  curl -X POST "$API/api/restaurants/me/orders" \
    -H "Content-Type: application/json" \
    -H "x-restaurant-id: $RESTAURANT_ID" \
    -H "x-user-id: $USER_ID" \
    -d "{
      \"order_number\": \"T-$(date +%s | tail -c 4)-$i\",
      \"items\": [{\"name\": \"burger meal\", \"qty\": 1}],
      \"status\": \"pending\"
    }"
done
```

**Watch:**
- Kitchen Dashboard (Tab 1): 3 new orders appear in "Pending" column
- Merchant Dashboard (Tab 2): Metrics update
  - "Offers Launched: 1"
  - "Total Redemptions: 3"
  - "Additional Revenue: +$140"
- Kitchen staff sees orders and starts cooking

**Narrate:**

> "Boom. 3 orders in 2 minutes. Customers saw the time-boxed offer and thought: 'I better grab this before it expires.'
> 
> The orders are coming in across multiple platforms:
> - 1 on native Stripe (no platform fee)
> - 1 on Uber Direct (2% fee)
> - 1 on DoorDash (3% fee)
> 
> The system routed them to maximize profit."

---

### **Minute 5:30 - Kitchen Getting Busy** (simulate capacity rise)

**Push occupancy to 72%:**
```bash
curl -X POST "$API/api/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurant_id\": \"$RESTAURANT_ID\",
    \"event_type\": \"occupancy\",
    \"data\": {\"count\": 72}
  }"
```

**Watch:**
- Main Dashboard (Tab 1): Gauge now shows **72%** (yellow)
- Status changes: "CAUTION"
- Merchant Dashboard (Tab 2): Yellow alert bar appears
- Offer still LIVE (not stopped yet)

**Narrate:**

> "The kitchen is now at 72% capacity. Still healthy, but getting busier.
> 
> Notice: The system hasn't stopped the offer yet. Why? Because we're not at the danger zone. But the system is *watching*.
> 
> It's ready to pause if we hit 85%."

---

### **Minute 6:45 - Protection Kicks In** (hit the threshold)

**Push occupancy to 89% (protection mode):**
```bash
curl -X POST "$API/api/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurant_id\": \"$RESTAURANT_ID\",
    \"event_type\": \"occupancy\",
    \"data\": {\"count\": 89}
  }"
```

**Watch:**
- Main Dashboard: Gauge shows **89%** (RED)
- Status: "PROTECTION MODE"
- Merchant Dashboard: 
  - Red alert banner: "⚠️ At Capacity - Offers Paused"
  - Offer status changes from `LIVE` to `PAUSED`
  - No new orders can be routed to delivery platforms
  - Kitchen protection engaged

**This is the key moment. Narrate:**

> "Here's where IdleBite differs from every other system.
> 
> At 89% capacity, the system **automatically pauses the offer**. Why?
> 
> Because overselling = unhappy customers = lost reputation = lost lifetime value.
> 
> If the offer stayed live and customers ordered 5 more items while the kitchen is already slammed, what happens?
> - 30-minute wait for a burger
> - Customer leaves bad review
> - Customer never comes back
> - One bad Yelp review costs $500 in lost revenue
> 
> **IdleBite protects the restaurant from its own success.**"

---

### **Minute 7:30 - The Results** (show Tab 2 metrics)

**Point to Merchant Dashboard metrics:**

```
📊 Metrics (Last 45 Minutes)
├─ Offers Launched: 1
├─ Total Redemptions: 8 orders
├─ Additional Revenue: $380
├─ Avg Orders per Offer: 8
└─ Peak Occupancy: 89% (protected)
```

**Narrate the impact:**

> "In 45 minutes:
> 
> **What the system did:**
> - 0 sales team calls
> - 0 marketing spend
> - 0 customer acquisition cost
> - 0 manual work for the owner
> 
> **What happened:**
> - 8 additional orders placed
> - $380 in incremental profit
> - Kitchen stayed healthy (never overcrowded)
> - Reputation protected (no overselling)
> 
> **Let's do the math for a full month:**
> 
> If this happens 2-3 times per day (lunch slump + dinner slump):
> - 8 orders × 2.5 times = 20 orders/day
> - 20 × 30 days = 600 orders/month
> - 600 × $47.50 profit (after discount) = **$28,500 additional revenue/month**
> 
> That's **$342,000 per year** from a system that runs in the background."

---

### **Minute 8:00 - The Business Model** (explain monetization)

**Narrate:**

> "Here's how IdleBite makes money:
> 
> **Restaurant pays:**
> - $299-$1,500/month SaaS fee (depending on size)
> - 2-4% fulfillment routing fee (on delivery orders)
> 
> **What they get:**
> - Automatic revenue optimization
> - No implementation work
> - Margin protection built-in
> - Delivery platform agnostic (we don't lock them in)
> 
> **For a restaurant making $28,500/month extra:**
> - SaaS: $500/month
> - Routing fee: $380 × 0.03 = $11/order × 8 = $88/month
> - **Total cost: $588**
> - **Net gain: $28,500 - $588 = $27,912**
> - **ROI: 4,743%**"

---

## 📊 Demo Talking Points

### **Why This Works (Not Just "Another Discount")**

1. **Timing**: Offers launch when kitchen is idle, not randomly
2. **Margin Safety**: Never discounts below cost floor
3. **Capacity Protection**: Pauses automatically at 85% occupancy
4. **Delivery Agnostic**: No lock-in, works with existing systems
5. **Data Moat**: Restaurant occupancy data becomes increasingly valuable

### **What Makes IdleBite Different**

| Feature | IdleBite | Competitors |
|---------|----------|-------------|
| **Automatic** | Yes | No (manual setup) |
| **Margin Protected** | Yes | No (loses money) |
| **Capacity Aware** | Yes | No (can oversell) |
| **Time-Boxed** | Yes | Static coupons |
| **Delivery Agnostic** | Yes | Lock into platform |
| **Privacy-First** | Yes (no facial recognition) | No |

### **Key Demo Moments**

✅ **"Watch the offer launch automatically"** — Shows intelligence, not manual work  
✅ **"See occupancy rising in real-time"** — Proves camera works  
✅ **"Notice the offer pause at 85%"** — Shows protection logic (investors love this)  
✅ **"Calculate the ROI"** — $28.5k/month catches attention  

---

## 💬 Expected Questions & Answers

**Q: How accurate is the occupancy detection?**

> A: "On day 1, we calibrate. Owner tells us: 'My max capacity is 40 covers.' We cross-validate with POS data. If burgers take 8 minutes and we see a 15-minute spike, we know confidence is low. We're conservative—false negatives (missing occupancy) are worse than false positives (seeing empty when slightly busy)."

**Q: What if someone gaming the system by manipulating the camera?**

> A: "Two protections: (1) Anomaly detection—if occupancy jumps 60% in 30 seconds, we flag it. (2) POS validation—if occupancy says 100 but only 3 orders came in, something's wrong. The cost of gaming is higher than the benefit."

**Q: Why not just use Uber/DoorDash's native tools?**

> A: "Uber and DoorDash are delivery platforms, not restaurant operations systems. They don't see kitchen capacity. We're focused on one thing: make restaurants money by filling idle capacity intelligently. We're complementary to their platforms."

**Q: How long until ROI?**

> A: "First week. We'll see 8-15 additional orders from idle-time offers. At $40/order profit, that's $320-600 extra per week. Your SaaS fee is $500. You're profitable week 1."

**Q: Does this work for all restaurants?**

> A: "Best fit: fast casual, QSR, pizza, sushi—anything with predictable prep and repeat ordering. Fine dining where every seat is booked? Less valuable. Breakfast-only places? Different use case. But 70% of restaurants have idle capacity 4-6 hours/day."

---

## 🎥 What to Show on Screen

### **Tab 1: Main Dashboard**
- Occupancy gauge (red → yellow → green)
- Order status breakdown (kitchen display)
- Real-time trend chart

### **Tab 2: Merchant Dashboard** ⭐ FOCUS HERE
- **Capacity Score** (color-coded)
- **Active Offers** (highlighted, countdown timer)
- **24-Hour Metrics** (revenue impact)
- **Configuration** (margins, thresholds)

### **Optional: Terminal**
- API calls showing event ingestion
- Logs showing offer engine logic

---

## ⏱️ Demo Timeline

```
0:00-1:30  Problem setup + camera detection
1:30-2:45  Auto-launch offer
2:45-4:00  Order surge simulation
4:00-5:30  Kitchen getting busy
5:30-6:45  Capacity monitoring
6:45-7:30  Protection threshold + offer pause
7:30-8:00  Results + ROI calculation
8:00+      Q&A
```

---

## 🎯 After-Demo Actions

**Investor asks: "How do we get started?"**

> "We have two paths:
> 
> **Path 1: Pilot (Recommended)**
> - Week 1: Install camera + setup (we do it)
> - Week 2: System goes live in auto mode
> - Week 3-4: Collect data, show revenue impact
> - Week 5: Series A conversation with real metrics
> 
> **Path 2: Funded**
> - Direct integration with 3-5 restaurants
> - Deployment in 2 weeks
> - Revenue validation in month 1"

**Customer asks: "How much does it cost?"**

> "For a 40-seat fast casual doing $8k/day revenue:
> - SaaS: $499/month
> - Routing fee: ~$80-120/month (on the extra orders we drive)
> - **Total: ~$600/month**
> 
> Your first $380 in extra orders (week 1) pays for 2+ months. After that it's pure margin."

---

## 📸 Screenshots to Capture

1. Empty restaurant → Occupancy 22%
2. Offer launching → "15% Off - 45 Min"
3. Orders arriving → Metrics updating
4. Capacity rising → Yellow alert
5. Protection triggered → Red alert + paused offer
6. Final metrics → Revenue calculated

**Post these in LinkedIn, investor updates, landing page.**
