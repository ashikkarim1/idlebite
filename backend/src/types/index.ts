export interface Restaurant {
  id: string;
  name: string;
  created_at: string;
}

export interface Camera {
  id: string;
  restaurant_id: string;
  name: string;
  rtsp_url: string;
  zone: 'kitchen' | 'dining_room' | 'pickup_desk';
  enabled: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  restaurant_id: string;
  camera_id: string | null;
  event_type: 'occupancy' | 'queue' | 'order' | 'prep_ready';
  data: Record<string, unknown>;
  timestamp: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  order_number: string;
  items: Record<string, unknown>[];
  status: 'pending' | 'cooking' | 'ready' | 'picked_up';
  created_at: string;
  ready_at: string | null;
}

export interface User {
  id: string;
  restaurant_id: string;
  email: string;
  role: 'owner' | 'manager' | 'staff';
  created_at: string;
}

export interface TenantContext {
  restaurant_id: string;
  user_id: string;
  user_role: string;
}

export interface SocketAuthPayload {
  restaurant_id: string;
  user_id: string;
}

export interface RestaurantConfig {
  id: string;
  restaurant_id: string;
  food_cost_percentage: number;
  target_margin_percentage: number;
  min_offer_discount: number;
  max_offer_discount: number;
  capacity_threshold_underutilized: number;
  capacity_threshold_caution: number;
  capacity_threshold_protection: number;
  offer_cooldown_minutes: number;
  auto_offers_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string;
  discount_percentage: number;
  min_order_value?: number;
  max_redemptions?: number;
  redemptions_count: number;
  valid_from: string;
  valid_until: string;
  delivery_platforms: ('native' | 'uber_direct' | 'doordash' | 'skip')[];
  status: 'draft' | 'active' | 'paused' | 'expired' | 'stopped';
  auto_generated: boolean;
  estimated_margin_impact?: number;
  created_at: string;
  created_by_user_id?: string;
  created_by_system: boolean;
}

export interface OfferEvent {
  id: string;
  offer_id: string;
  restaurant_id: string;
  event_type: 'launched' | 'paused' | 'stopped' | 'expired' | 'redeemed';
  data: Record<string, unknown>;
  timestamp: string;
}

export interface DeliveryIntegration {
  id: string;
  restaurant_id: string;
  platform: 'uber_direct' | 'doordash' | 'skip' | 'stripe_native';
  api_key?: string;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, unknown>;
  last_sync?: string;
  created_at: string;
}

export interface OrderFulfillment {
  id: string;
  order_id: string;
  restaurant_id: string;
  delivery_platform: 'native' | 'uber_direct' | 'doordash' | 'skip';
  external_order_id?: string;
  estimated_pickup_time?: string;
  estimated_delivery_time?: string;
  actual_pickup_time?: string;
  actual_delivery_time?: string;
  delivery_cost?: number;
  platform_fee?: number;
  fulfillment_status: string;
  created_at: string;
}

export interface CapacityScore {
  kitchen_occupancy: number;
  pickup_congestion: number;
  overall_score: number; // 0-100
  level: 'underutilized' | 'normal' | 'caution' | 'protection';
  should_launch_offers: boolean;
  should_stop_offers: boolean;
}
