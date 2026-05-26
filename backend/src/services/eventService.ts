import { v4 as uuid } from 'uuid';
import { Server } from 'socket.io';
import { pool } from '../config/database.js';
import { Event } from '../types/index.js';

export class EventService {
  constructor(private io: Server) {}

  async createEvent(
    restaurant_id: string,
    event_type: 'occupancy' | 'queue' | 'order' | 'prep_ready',
    data: Record<string, unknown>,
    camera_id?: string
  ): Promise<Event> {
    const id = uuid();
    const timestamp = new Date().toISOString();

    const result = await pool.query(
      `INSERT INTO events (id, restaurant_id, camera_id, event_type, data, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, restaurant_id, camera_id || null, event_type, JSON.stringify(data), timestamp]
    );

    const event = result.rows[0] as Event;

    // Broadcast to all clients in this restaurant's room
    this.io.to(`restaurant:${restaurant_id}`).emit('event', event);

    return event;
  }

  async getRecentEvents(restaurant_id: string, limit = 50): Promise<Event[]> {
    const result = await pool.query(
      `SELECT * FROM events WHERE restaurant_id = $1
       ORDER BY timestamp DESC LIMIT $2`,
      [restaurant_id, limit]
    );
    return result.rows;
  }
}
