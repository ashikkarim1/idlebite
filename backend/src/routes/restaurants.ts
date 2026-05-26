import { Router, Request, Response } from 'express';
import { RestaurantService } from '../services/restaurantService.js';
import { tenantMiddleware } from '../middleware/tenant.js';

const router = Router();
const restaurantService = new RestaurantService();

router.use(tenantMiddleware);

// GET /api/restaurants/me
router.get('/me', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const restaurant = await restaurantService.getRestaurant(restaurant_id);
  if (!restaurant) return res.status(404).json({ error: 'Not found' });
  res.json(restaurant);
});

// GET /api/restaurants/me/cameras
router.get('/me/cameras', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const cameras = await restaurantService.getCameras(restaurant_id);
  res.json(cameras);
});

// POST /api/restaurants/me/cameras
router.post('/me/cameras', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { name, rtsp_url, zone } = req.body;
  const camera = await restaurantService.createCamera(restaurant_id, name, rtsp_url, zone);
  res.status(201).json(camera);
});

// GET /api/restaurants/me/orders
router.get('/me/orders', async (req: Request, res: Response) => {
  const { restaurant_id } = req.tenant!;
  const { status } = req.query;
  const orders = await restaurantService.getOrders(restaurant_id, status as string);
  res.json(orders);
});

export default router;
