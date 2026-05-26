import { v4 as uuid } from 'uuid';
import { pool } from '../config/database.js';
import { Restaurant, Camera, Order } from '../types/index.js';

export class RestaurantService {
  async getRestaurant(restaurant_id: string): Promise<Restaurant | null> {
    const result = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [restaurant_id]
    );
    return result.rows[0] || null;
  }

  async getCameras(restaurant_id: string): Promise<Camera[]> {
    const result = await pool.query(
      'SELECT * FROM cameras WHERE restaurant_id = $1 AND enabled = true',
      [restaurant_id]
    );
    return result.rows;
  }

  async createCamera(restaurant_id: string, name: string, rtsp_url: string, zone: string): Promise<Camera> {
    const id = uuid();
    const result = await pool.query(
      `INSERT INTO cameras (id, restaurant_id, name, rtsp_url, zone, enabled)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [id, restaurant_id, name, rtsp_url, zone]
    );
    return result.rows[0];
  }

  async getOrders(restaurant_id: string, status?: string): Promise<Order[]> {
    let query = 'SELECT * FROM orders WHERE restaurant_id = $1';
    const params: (string | undefined)[] = [restaurant_id];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async updateOrderStatus(order_id: string, status: string): Promise<Order> {
    const ready_at = status === 'ready' ? new Date().toISOString() : null;
    const result = await pool.query(
      `UPDATE orders SET status = $1, ready_at = $2
       WHERE id = $3 RETURNING *`,
      [status, ready_at, order_id]
    );
    return result.rows[0];
  }
}
