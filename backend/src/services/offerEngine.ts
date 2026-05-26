import { v4 as uuid } from 'uuid';
import { pool } from '../config/database.js';
import type { Offer, OfferEvent, RestaurantConfig, CapacityScore } from '../types/index.js';

export class OfferEngine {
  /**
   * Calculate capacity score from kitchen and pickup metrics
   * Score = 75% kitchen + 25% pickup
   */
  calculateCapacityScore(
    kitchen_occupancy: number,
    pickup_congestion: number = 0
  ): CapacityScore {
    const overall = kitchen_occupancy * 0.75 + pickup_congestion * 0.25;
    const score = Math.min(100, Math.max(0, overall));

    let level: 'underutilized' | 'normal' | 'caution' | 'protection';
    let should_launch_offers = false;
    let should_stop_offers = false;

    if (score < 40) {
      level = 'underutilized';
      should_launch_offers = true;
    } else if (score < 70) {
      level = 'normal';
    } else if (score < 85) {
      level = 'caution';
      should_stop_offers = true;
    } else {
      level = 'protection';
      should_stop_offers = true;
    }

    return {
      kitchen_occupancy,
      pickup_congestion,
      overall_score: Math.round(score),
      level,
      should_launch_offers,
      should_stop_offers,
    };
  }

  /**
   * Check if can launch a new offer based on cooldown period
   */
  async canLaunchOffer(restaurant_id: string, config: RestaurantConfig): Promise<boolean> {
    const result = await pool.query(
      `SELECT created_at FROM offers
       WHERE restaurant_id = $1 AND status IN ('active', 'paused')
       ORDER BY created_at DESC LIMIT 1`,
      [restaurant_id]
    );

    if (result.rows.length === 0) return true;

    const lastOfferTime = new Date(result.rows[0].created_at);
    const minutesSinceLastOffer = (new Date().getTime() - lastOfferTime.getTime()) / 1000 / 60;

    return minutesSinceLastOffer >= config.offer_cooldown_minutes;
  }

  /**
   * Generate an automatic offer based on margins and history
   */
  async generateOffer(
    restaurant_id: string,
    config: RestaurantConfig,
    capacity_score: CapacityScore
  ): Promise<Offer | null> {
    // Only generate if underutilized and can launch
    if (!capacity_score.should_launch_offers) return null;
    if (!(await this.canLaunchOffer(restaurant_id, config))) return null;

    // Calculate discount: 12-20% based on how underutilized
    const utilization_ratio = capacity_score.overall_score / 40; // 0-1 scale
    const base_discount = 12 + utilization_ratio * 8; // 12-20%
    const discount = Math.min(
      config.max_offer_discount,
      Math.max(config.min_offer_discount, Math.round(base_discount))
    );

    // Verify it doesn't violate margin floor
    const margin_floor = 100 - config.food_cost_percentage - (config.target_margin_percentage / 2); // 50% of target margin
    if (discount > margin_floor) {
      return null; // Too risky
    }

    const now = new Date();
    const valid_until = new Date(now.getTime() + 45 * 60000); // 45 minute window

    const offer: Offer = {
      id: uuid(),
      restaurant_id,
      title: `${discount}% Off - Next 45 Min!`,
      description: 'Limited time offer',
      discount_percentage: discount,
      valid_from: now.toISOString(),
      valid_until: valid_until.toISOString(),
      delivery_platforms: ['native', 'uber_direct', 'doordash', 'skip'],
      status: 'draft',
      auto_generated: true,
      estimated_margin_impact: -discount, // Negative = risk
      created_by_system: true,
      redemptions_count: 0,
    };

    return offer;
  }

  /**
   * Create and launch an offer
   */
  async launchOffer(offer: Offer): Promise<Offer> {
    offer.status = 'active';

    const result = await pool.query(
      `INSERT INTO offers
       (id, restaurant_id, title, description, discount_percentage, valid_from, valid_until,
        delivery_platforms, status, auto_generated, estimated_margin_impact, created_by_system)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        offer.id,
        offer.restaurant_id,
        offer.title,
        offer.description,
        offer.discount_percentage,
        offer.valid_from,
        offer.valid_until,
        JSON.stringify(offer.delivery_platforms),
        offer.status,
        offer.auto_generated,
        offer.estimated_margin_impact,
        offer.created_by_system,
      ]
    );

    const launched = result.rows[0];

    // Log event
    await this.recordOfferEvent(offer.restaurant_id, offer.id, 'launched', {
      auto_generated: true,
      discount: offer.discount_percentage,
    });

    return launched;
  }

  /**
   * Stop offers for a restaurant (capacity hit protection)
   */
  async stopOffers(restaurant_id: string, reason: string): Promise<number> {
    const result = await pool.query(
      `UPDATE offers SET status = $1
       WHERE restaurant_id = $2 AND status IN ('active', 'paused')
       RETURNING id`,
      ['stopped', restaurant_id]
    );

    const count = result.rows.length;

    // Log events for each
    for (const row of result.rows) {
      await this.recordOfferEvent(restaurant_id, row.id, 'stopped', { reason });
    }

    return count;
  }

  /**
   * Get active offers for restaurant
   */
  async getActiveOffers(restaurant_id: string): Promise<Offer[]> {
    const result = await pool.query(
      `SELECT * FROM offers
       WHERE restaurant_id = $1 AND status = 'active' AND valid_until > now()
       ORDER BY created_at DESC`,
      [restaurant_id]
    );

    return result.rows.map(row => this.parseOffer(row));
  }

  /**
   * Record offer event (launched, paused, stopped, redeemed)
   */
  async recordOfferEvent(
    restaurant_id: string,
    offer_id: string,
    event_type: string,
    data: Record<string, unknown>
  ): Promise<void> {
    await pool.query(
      `INSERT INTO offer_events (id, offer_id, restaurant_id, event_type, data)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuid(), offer_id, restaurant_id, event_type, JSON.stringify(data)]
    );
  }

  /**
   * Get offer performance metrics
   */
  async getOfferMetrics(restaurant_id: string, hours = 24): Promise<Record<string, unknown>> {
    const sinceTime = new Date(new Date().getTime() - hours * 3600000);

    const result = await pool.query(
      `SELECT
        event_type,
        COUNT(*) as count,
        AVG((data->>'orders')::int) as avg_orders,
        SUM((data->>'revenue')::decimal) as total_revenue
       FROM offer_events
       WHERE restaurant_id = $1 AND timestamp > $2
       GROUP BY event_type`,
      [restaurant_id, sinceTime.toISOString()]
    );

    const metrics = {
      launched: 0,
      redeemed: 0,
      total_revenue: 0,
      avg_orders_per_offer: 0,
    };

    for (const row of result.rows) {
      if (row.event_type === 'launched') {
        metrics.launched = parseInt(row.count);
      }
      if (row.event_type === 'redeemed') {
        metrics.redeemed = parseInt(row.count);
        metrics.total_revenue = parseFloat(row.total_revenue || 0);
        metrics.avg_orders_per_offer = Math.round(parseFloat(row.avg_orders) || 0);
      }
    }

    return metrics;
  }

  private parseOffer(row: any): Offer {
    return {
      ...row,
      delivery_platforms: Array.isArray(row.delivery_platforms)
        ? row.delivery_platforms
        : JSON.parse(row.delivery_platforms || '[]'),
    };
  }
}
