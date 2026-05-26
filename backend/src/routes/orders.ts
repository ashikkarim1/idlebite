import { Router, Request, Response } from 'express';
import { RestaurantService } from '../services/restaurantService.js';
import { tenantMiddleware } from '../middleware/tenant.js';

const router = Router();
const restaurantService = new RestaurantService();

router.use(tenantMiddleware);

// PATCH /api/restaurants/me/orders/:order_id
router.patch('/me/orders/:order_id', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { order_id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Missing status' });
  }

  try {
    const order = await restaurantService.updateOrderStatus(order_id, status);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
