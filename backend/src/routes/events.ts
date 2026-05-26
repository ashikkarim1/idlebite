import { Router, Request, Response } from 'express';
import { EventService } from '../services/eventService.js';
import { tenantMiddleware } from '../middleware/tenant.js';
import type { Server } from 'socket.io';

export function createEventsRouter(io: Server) {
  const router = Router();
  const eventService = new EventService(io);

  // POST /api/events (from camera service)
  // Camera service posts with x-api-key or uses same tenant headers
  router.post('/', async (req: Request, res: Response) => {
    const { restaurant_id, event_type, data, camera_id } = req.body;

    if (!restaurant_id || !event_type || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const event = await eventService.createEvent(
      restaurant_id,
      event_type,
      data,
      camera_id
    );
    res.status(201).json(event);
  });

  router.use(tenantMiddleware);

  // GET /api/events (recent events for dashboard)
  router.get('/', async (req: Request, res: Response) => {
    const { restaurant_id } = req.tenant!;
    const { limit } = req.query;
    const events = await eventService.getRecentEvents(
      restaurant_id,
      parseInt(limit as string) || 50
    );
    res.json(events);
  });

  return router;
}
