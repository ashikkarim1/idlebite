import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './config/database.js';
import restaurantsRouter from './routes/restaurants.js';
import ordersRouter from './routes/orders.js';
import offersRouter from './routes/offers.js';
import deliveryRouter from './routes/delivery.js';
import { createEventsRouter } from './routes/events.js';
import { tenantMiddleware } from './middleware/tenant.js';
import type { SocketAuthPayload } from './types/index.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/restaurants', ordersRouter);
app.use('/api/offers', offersRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/events', createEventsRouter(io));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Expect first message to be auth
  socket.on('auth', (payload: SocketAuthPayload) => {
    const { restaurant_id, user_id } = payload;
    // Join room for this restaurant (real-time broadcasts go here)
    socket.join(`restaurant:${restaurant_id}`);
    socket.data.restaurant_id = restaurant_id;
    socket.data.user_id = user_id;
    console.log(`Socket ${socket.id} authenticated for restaurant ${restaurant_id}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

async function start() {
  try {
    await initializeDatabase();
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
