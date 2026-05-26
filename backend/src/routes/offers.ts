import { Router, Request, Response } from 'express';
import { OfferEngine } from '../services/offerEngine.js';
import { tenantMiddleware } from '../middleware/tenant.js';
import { pool } from '../config/database.js';

const router = Router();
const offerEngine = new OfferEngine();

router.use(tenantMiddleware);

// GET /api/offers/config - Get restaurant config
router.get('/config', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;

  try {
    const result = await pool.query(
      'SELECT * FROM restaurant_config WHERE restaurant_id = $1',
      [restaurant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// PATCH /api/offers/config - Update restaurant config
router.patch('/config', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { food_cost_percentage, target_margin_percentage, auto_offers_enabled, offer_cooldown_minutes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE restaurant_config
       SET food_cost_percentage = COALESCE($1, food_cost_percentage),
           target_margin_percentage = COALESCE($2, target_margin_percentage),
           auto_offers_enabled = COALESCE($3, auto_offers_enabled),
           offer_cooldown_minutes = COALESCE($4, offer_cooldown_minutes),
           updated_at = now()
       WHERE restaurant_id = $5
       RETURNING *`,
      [food_cost_percentage, target_margin_percentage, auto_offers_enabled, offer_cooldown_minutes, restaurant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// GET /api/offers - List active offers
router.get('/', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;

  try {
    const offers = await offerEngine.getActiveOffers(restaurant_id);
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// POST /api/offers - Create offer (manual)
router.post('/', async (req: Request, res: Response) => {
  const { restaurant_id, user_id } = req.tenant!;
  const { title, description, discount_percentage, delivery_platforms } = req.body;

  if (!title || discount_percentage === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const now = new Date();
    const valid_until = new Date(now.getTime() + 60 * 60000); // 1 hour

    const result = await pool.query(
      `INSERT INTO offers
       (id, restaurant_id, title, description, discount_percentage, valid_from, valid_until,
        delivery_platforms, status, auto_generated, created_by_user_id, created_by_system)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'draft', false, $8, false)
       RETURNING *`,
      [
        restaurant_id,
        title,
        description || null,
        discount_percentage,
        now.toISOString(),
        valid_until.toISOString(),
        JSON.stringify(delivery_platforms || ['native']),
        user_id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// PATCH /api/offers/:offer_id - Update offer status
router.patch('/:offer_id', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { offer_id } = req.params;
  const { status } = req.body;

  if (!['draft', 'active', 'paused', 'expired', 'stopped'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `UPDATE offers SET status = $1 WHERE id = $2 AND restaurant_id = $3 RETURNING *`,
      [status, offer_id, restaurant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Record event
    await offerEngine.recordOfferEvent(restaurant_id, offer_id, status, {});

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// GET /api/offers/metrics - Get offer performance
router.get('/metrics', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { hours = 24 } = req.query;

  try {
    const metrics = await offerEngine.getOfferMetrics(restaurant_id, parseInt(hours as string));
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// POST /api/offers/auto-launch - Trigger auto-launch based on capacity
router.post('/auto-launch', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { kitchen_occupancy, pickup_congestion } = req.body;

  if (kitchen_occupancy === undefined) {
    return res.status(400).json({ error: 'Missing kitchen_occupancy' });
  }

  try {
    // Get config
    const configResult = await pool.query(
      'SELECT * FROM restaurant_config WHERE restaurant_id = $1',
      [restaurant_id]
    );

    if (configResult.rows.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }

    const config = configResult.rows[0];

    // Calculate capacity
    const capacityScore = offerEngine.calculateCapacityScore(kitchen_occupancy, pickup_congestion || 0);

    // Stop offers if protection threshold hit
    if (capacityScore.should_stop_offers) {
      const stoppedCount = await offerEngine.stopOffers(restaurant_id, 'Capacity protection threshold');
      return res.json({
        action: 'stopped_offers',
        stopped_count: stoppedCount,
        capacity_score: capacityScore,
      });
    }

    // Generate and launch offer if underutilized
    if (capacityScore.should_launch_offers && config.auto_offers_enabled) {
      const offer = await offerEngine.generateOffer(restaurant_id, config, capacityScore);

      if (offer) {
        const launched = await offerEngine.launchOffer(offer);
        return res.json({
          action: 'launched_offer',
          offer: launched,
          capacity_score: capacityScore,
        });
      }
    }

    res.json({
      action: 'none',
      capacity_score: capacityScore,
      reason: 'Not in underutilization zone or cooldown active',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process auto-launch' });
  }
});

export default router;
