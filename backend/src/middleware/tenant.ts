import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // MVP: Extract from headers (in production, use JWT tokens)
  const restaurant_id = req.headers['x-restaurant-id'] as string;
  const user_id = req.headers['x-user-id'] as string;
  const user_role = req.headers['x-user-role'] as string || 'staff';

  if (!restaurant_id || !user_id) {
    return res.status(401).json({ error: 'Missing tenant context' });
  }

  req.tenant = { restaurant_id, user_id, user_role };
  next();
}
