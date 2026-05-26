import { Router, Request, Response } from 'express';
import { DeliveryRouter } from '../services/deliveryRouter.js';
import { RestaurantService } from '../services/restaurantService.js';
import { tenantMiddleware } from '../middleware/tenant.js';
import { pool } from '../config/database.js';

const router = Router();
const deliveryRouter = new DeliveryRouter();
const restaurantService = new RestaurantService();

router.use(tenantMiddleware);

// GET /api/delivery/integrations - List delivery platform integrations
router.get('/integrations', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;

  try {
    const result = await pool.query(
      `SELECT id, platform, status, last_sync FROM delivery_integrations
       WHERE restaurant_id = $1
       ORDER BY platform`,
      [restaurant_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// POST /api/delivery/integrations - Connect delivery platform
router.post('/integrations', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { platform, api_key, config } = req.body;

  const valid_platforms = ['uber_direct', 'doordash', 'skip', 'stripe_native'];
  if (!valid_platforms.includes(platform)) {
    return res.status(400).json({ error: 'Invalid platform' });
  }

  try {
    // Check if already exists
    const existingResult = await pool.query(
      `SELECT id FROM delivery_integrations WHERE restaurant_id = $1 AND platform = $2`,
      [restaurant_id, platform]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      const result = await pool.query(
        `UPDATE delivery_integrations
         SET api_key = $1, status = 'connected', config = $2, last_sync = now()
         WHERE restaurant_id = $3 AND platform = $4
         RETURNING *`,
        [api_key || null, JSON.stringify(config || {}), restaurant_id, platform]
      );
      return res.json(result.rows[0]);
    }

    // Create new
    const result = await pool.query(
      `INSERT INTO delivery_integrations
       (id, restaurant_id, platform, api_key, status, config)
       VALUES (gen_random_uuid(), $1, $2, $3, 'connected', $4)
       RETURNING *`,
      [restaurant_id, platform, api_key || null, JSON.stringify(config || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect integration' });
  }
});

// DELETE /api/delivery/integrations/:platform - Disconnect platform
router.delete('/integrations/:platform', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { platform } = req.params;

  try {
    await pool.query(
      `UPDATE delivery_integrations SET status = 'disconnected'
       WHERE restaurant_id = $1 AND platform = $2`,
      [restaurant_id, platform]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

// POST /api/delivery/route-order - Route order to delivery platform
router.post('/route-order', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { order_id, selected_platform } = req.body;

  if (!order_id) {
    return res.status(400).json({ error: 'Missing order_id' });
  }

  try {
    // Fetch order
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Route order
    const fulfillment = await deliveryRouter.routeOrder(order, restaurant_id, selected_platform);

    res.status(201).json(fulfillment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to route order' });
  }
});

// GET /api/delivery/metrics - Get delivery performance metrics
router.get('/metrics', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { hours = 24 } = req.query;

  try {
    const metrics = await deliveryRouter.getDeliveryMetrics(restaurant_id, parseInt(hours as string));
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// POST /api/delivery/webhooks/pickup - Webhook: order picked up
router.post('/webhooks/pickup', async (req: Request, res: Response) => {
  const { external_order_id, data } = req.body;

  try {
    await deliveryRouter.processDeliveryWebhook('picked_up', external_order_id, data || {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// POST /api/delivery/webhooks/delivered - Webhook: order delivered
router.post('/webhooks/delivered', async (req: Request, res: Response) => {
  const { external_order_id, data } = req.body;

  try {
    await deliveryRouter.processDeliveryWebhook('delivered', external_order_id, data || {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
