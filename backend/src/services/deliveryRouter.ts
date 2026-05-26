import { pool } from '../config/database.js';
import type { DeliveryIntegration, Order, OrderFulfillment } from '../types/index.js';
import { v4 as uuid } from 'uuid';

export class DeliveryRouter {
  /**
   * Get enabled delivery integrations for restaurant
   */
  async getEnabledIntegrations(restaurant_id: string): Promise<DeliveryIntegration[]> {
    const result = await pool.query(
      `SELECT * FROM delivery_integrations
       WHERE restaurant_id = $1 AND status = 'connected'
       ORDER BY platform`,
      [restaurant_id]
    );
    return result.rows;
  }

  /**
   * Select best delivery platform for order
   * Priority: native (Stripe) → cheapest carrier → fastest ETA
   */
  async selectDeliveryPlatform(
    restaurant_id: string,
    order: Order,
    kitchen_load: number
  ): Promise<'native' | 'uber_direct' | 'doordash' | 'skip'> {
    const integrations = await this.getEnabledIntegrations(restaurant_id);

    // Always prefer native (Stripe) if available - no platform fee
    const hasNative = integrations.some(i => i.platform === 'stripe_native');
    if (hasNative) return 'native';

    // For MVP: round-robin through available platforms
    // In production: analyze cost, speed, density
    const thirdParty = integrations.filter(i => i.platform !== 'stripe_native');
    if (thirdParty.length === 0) return 'native'; // Fallback

    // Simple round-robin
    const idx = Math.floor(Math.random() * thirdParty.length);
    return thirdParty[idx].platform as 'uber_direct' | 'doordash' | 'skip';
  }

  /**
   * Batch orders for efficient delivery
   * Groups orders by delivery zone + prep window
   */
  async batchOrders(
    restaurant_id: string,
    pending_orders: Order[],
    max_batch_size = 3
  ): Promise<Order[][]> {
    // MVP: Simple batching by order time window
    // In production: use geo-clustering + kitchen prep time optimization

    const batches: Order[][] = [];
    let currentBatch: Order[] = [];

    for (const order of pending_orders) {
      currentBatch.push(order);

      if (currentBatch.length >= max_batch_size) {
        batches.push(currentBatch);
        currentBatch = [];
      }
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  /**
   * Create fulfillment record when order is sent to delivery platform
   */
  async createFulfillment(
    order_id: string,
    restaurant_id: string,
    delivery_platform: string
  ): Promise<OrderFulfillment> {
    const fulfillment_id = uuid();
    const estimated_pickup = new Date(new Date().getTime() + 15 * 60000); // 15 min from now
    const estimated_delivery = new Date(estimated_pickup.getTime() + 20 * 60000); // +20 min

    const result = await pool.query(
      `INSERT INTO order_fulfillment
       (id, order_id, restaurant_id, delivery_platform, estimated_pickup_time, estimated_delivery_time, fulfillment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        fulfillment_id,
        order_id,
        restaurant_id,
        delivery_platform,
        estimated_pickup.toISOString(),
        estimated_delivery.toISOString(),
        'pending',
      ]
    );

    return result.rows[0];
  }

  /**
   * STUB: Uber Direct API call
   * In production: call actual Uber Direct API
   */
  async sendToUberDirect(order: Order, restaurant_id: string): Promise<string> {
    console.log(`[STUB] Sending to Uber Direct:`, {
      order_number: order.order_number,
      restaurant_id,
    });

    // Simulate API response
    return `UBER_${uuid().substring(0, 8).toUpperCase()}`;
  }

  /**
   * STUB: DoorDash API call
   */
  async sendToDoorDash(order: Order, restaurant_id: string): Promise<string> {
    console.log(`[STUB] Sending to DoorDash:`, {
      order_number: order.order_number,
      restaurant_id,
    });

    return `DD_${uuid().substring(0, 8).toUpperCase()}`;
  }

  /**
   * STUB: Skip API call
   */
  async sendToSkip(order: Order, restaurant_id: string): Promise<string> {
    console.log(`[STUB] Sending to Skip:`, {
      order_number: order.order_number,
      restaurant_id,
    });

    return `SKIP_${uuid().substring(0, 8).toUpperCase()}`;
  }

  /**
   * Main router: send order to selected platform
   */
  async routeOrder(
    order: Order,
    restaurant_id: string,
    selected_platform?: string
  ): Promise<OrderFulfillment> {
    const platform = selected_platform || 'native';

    let external_order_id: string | undefined;

    if (platform === 'uber_direct') {
      external_order_id = await this.sendToUberDirect(order, restaurant_id);
    } else if (platform === 'doordash') {
      external_order_id = await this.sendToDoorDash(order, restaurant_id);
    } else if (platform === 'skip') {
      external_order_id = await this.sendToSkip(order, restaurant_id);
    }
    // native (Stripe) handled by webhook

    const fulfillment = await this.createFulfillment(order.id, restaurant_id, platform);

    if (external_order_id) {
      await pool.query(
        `UPDATE order_fulfillment SET external_order_id = $1 WHERE id = $2`,
        [external_order_id, fulfillment.id]
      );
      fulfillment.external_order_id = external_order_id;
    }

    return fulfillment;
  }

  /**
   * Get delivery performance metrics
   */
  async getDeliveryMetrics(
    restaurant_id: string,
    hours = 24
  ): Promise<Record<string, unknown>> {
    const sinceTime = new Date(new Date().getTime() - hours * 3600000);

    const result = await pool.query(
      `SELECT
        delivery_platform,
        COUNT(*) as total_orders,
        AVG(EXTRACT(EPOCH FROM (actual_delivery_time - estimated_delivery_time))/60)::int as avg_minutes_delayed,
        AVG(delivery_cost) as avg_delivery_cost
       FROM order_fulfillment
       WHERE restaurant_id = $1 AND created_at > $2
       GROUP BY delivery_platform`,
      [restaurant_id, sinceTime.toISOString()]
    );

    const metrics: Record<string, any> = {};

    for (const row of result.rows) {
      metrics[row.delivery_platform] = {
        total_orders: parseInt(row.total_orders),
        avg_delay_minutes: row.avg_minutes_delayed || 0,
        avg_cost: parseFloat(row.avg_delivery_cost || 0),
      };
    }

    return metrics;
  }

  /**
   * Simulate webhook from delivery platform (pickup/delivery events)
   * In production: receive real webhooks from Uber, DoorDash, etc.
   */
  async processDeliveryWebhook(
    event_type: 'picked_up' | 'delivered' | 'cancelled',
    external_order_id: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const timestamp = new Date();

    if (event_type === 'picked_up') {
      await pool.query(
        `UPDATE order_fulfillment SET actual_pickup_time = $1, fulfillment_status = 'picked_up'
         WHERE external_order_id = $2`,
        [timestamp.toISOString(), external_order_id]
      );
    } else if (event_type === 'delivered') {
      await pool.query(
        `UPDATE order_fulfillment SET actual_delivery_time = $1, fulfillment_status = 'delivered'
         WHERE external_order_id = $2`,
        [timestamp.toISOString(), external_order_id]
      );
    } else if (event_type === 'cancelled') {
      await pool.query(
        `UPDATE order_fulfillment SET fulfillment_status = 'cancelled'
         WHERE external_order_id = $1`,
        [external_order_id]
      );
    }

    console.log(`[Webhook] ${event_type}: ${external_order_id}`);
  }
}
