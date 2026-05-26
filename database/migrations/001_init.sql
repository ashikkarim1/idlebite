-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Create cameras table
CREATE TABLE IF NOT EXISTS cameras (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  rtsp_url VARCHAR NOT NULL,
  zone VARCHAR CHECK (zone IN ('kitchen', 'dining_room', 'pickup_desk')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  camera_id UUID REFERENCES cameras(id) ON DELETE SET NULL,
  event_type VARCHAR CHECK (event_type IN ('occupancy', 'queue', 'order', 'prep_ready')),
  data JSONB,
  timestamp TIMESTAMP DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_number VARCHAR NOT NULL,
  items JSONB,
  status VARCHAR CHECK (status IN ('pending', 'cooking', 'ready', 'picked_up')),
  created_at TIMESTAMP DEFAULT now(),
  ready_at TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('owner', 'manager', 'staff')),
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cameras_restaurant ON cameras(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_events_restaurant_timestamp ON events(restaurant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_camera ON events(camera_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_users_restaurant ON users(restaurant_id);

-- Insert test restaurant
INSERT INTO restaurants (id, name) VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Test Restaurant')
ON CONFLICT DO NOTHING;

-- Insert test camera
INSERT INTO cameras (id, restaurant_id, name, rtsp_url, zone, enabled)
VALUES ('a1234567-89ab-cdef-0123-456789abcdef', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Dining Room', 'rtsp://localhost:8554/stream', 'dining_room', true)
ON CONFLICT DO NOTHING;

-- Insert test user
INSERT INTO users (id, restaurant_id, email, password_hash, role)
VALUES ('b1234567-89ab-cdef-0123-456789abcdef', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin@test.com', 'hashed_password', 'owner')
ON CONFLICT DO NOTHING;

-- Create restaurant_config table (margins, capacity thresholds)
CREATE TABLE IF NOT EXISTS restaurant_config (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
  food_cost_percentage DECIMAL(5,2) DEFAULT 30, -- avg food cost %
  target_margin_percentage DECIMAL(5,2) DEFAULT 35, -- target margin %
  min_offer_discount DECIMAL(5,2) DEFAULT 10, -- minimum discount allowed
  max_offer_discount DECIMAL(5,2) DEFAULT 35, -- maximum discount allowed
  capacity_threshold_underutilized INT DEFAULT 40, -- 0-40%
  capacity_threshold_caution INT DEFAULT 70, -- 70-85%
  capacity_threshold_protection INT DEFAULT 85, -- 85-100%
  offer_cooldown_minutes INT DEFAULT 30, -- minutes between offers
  auto_offers_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2) NOT NULL,
  min_order_value DECIMAL(10,2),
  max_redemptions INT,
  redemptions_count INT DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  delivery_platforms VARCHAR[] DEFAULT ARRAY['native'], -- 'native', 'uber_direct', 'doordash', 'skip'
  status VARCHAR CHECK (status IN ('draft', 'active', 'paused', 'expired', 'stopped')),
  auto_generated BOOLEAN DEFAULT false,
  estimated_margin_impact DECIMAL(10,2), -- revenue impact estimate
  created_at TIMESTAMP DEFAULT now(),
  created_by_user_id UUID,
  created_by_system BOOLEAN DEFAULT false
);

-- Create offer_events table (performance tracking)
CREATE TABLE IF NOT EXISTS offer_events (
  id UUID PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  event_type VARCHAR CHECK (event_type IN ('launched', 'paused', 'stopped', 'expired', 'redeemed')),
  data JSONB, -- {'orders': 5, 'revenue': 120.50, 'reason': '...'}
  timestamp TIMESTAMP DEFAULT now()
);

-- Create delivery_integrations table
CREATE TABLE IF NOT EXISTS delivery_integrations (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  platform VARCHAR CHECK (platform IN ('uber_direct', 'doordash', 'skip', 'stripe_native')),
  api_key VARCHAR,
  status VARCHAR CHECK (status IN ('connected', 'disconnected', 'error')),
  config JSONB, -- platform-specific config
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Create order_fulfillment table (routing + delivery tracking)
CREATE TABLE IF NOT EXISTS order_fulfillment (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  delivery_platform VARCHAR CHECK (delivery_platform IN ('native', 'uber_direct', 'doordash', 'skip')),
  external_order_id VARCHAR, -- platform's order ID
  estimated_pickup_time TIMESTAMP,
  estimated_delivery_time TIMESTAMP,
  actual_pickup_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  delivery_cost DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  fulfillment_status VARCHAR, -- pending, picked_up, delivered, cancelled
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_offers_restaurant_status ON offers(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_offers_valid_until ON offers(valid_until);
CREATE INDEX IF NOT EXISTS idx_offer_events_offer ON offer_events(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_events_timestamp ON offer_events(restaurant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_integrations_restaurant ON delivery_integrations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_order_fulfillment_restaurant ON order_fulfillment(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_order_fulfillment_status ON order_fulfillment(delivery_platform, fulfillment_status);

-- Insert test restaurant config
INSERT INTO restaurant_config (id, restaurant_id, food_cost_percentage, target_margin_percentage)
VALUES ('c1234567-89ab-cdef-0123-456789abcdef', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 30, 35)
ON CONFLICT DO NOTHING;

-- Insert test delivery integrations (stubs)
INSERT INTO delivery_integrations (id, restaurant_id, platform, status, config)
VALUES
  ('d1234567-89ab-cdef-0123-456789abcdef', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'stripe_native', 'connected', '{"webhook_url": "http://localhost:3001/webhooks/stripe"}'),
  ('d2234567-89ab-cdef-0123-456789abcdef', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'uber_direct', 'disconnected', '{"api_key_required": true}'),
  ('d3234567-89ab-cdef-0123-456789abcdef', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'doordash', 'disconnected', '{"api_key_required": true}')
ON CONFLICT DO NOTHING;
