import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import roleRoutes from './routes/role.routes.js';
import permissionRoutes from './routes/permission.routes.js';
import courseRoutes from './routes/course.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import { authenticate } from './middleware/auth.js';
import connectDB from './config/mongodb.js';
import { setupQueueProcessors } from './queues/setup';
import { initializeSocket } from './socket';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const imagesDirectory = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDirectory)) {
  fs.mkdirSync(imagesDirectory, { recursive: true });
}

app.use('/images', express.static(imagesDirectory));

// Connect to MongoDB
connectDB();

// Initialize queue processors
setupQueueProcessors();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api', authenticate);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subscriptions',subscriptionRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize WebSocket server
initializeSocket();

// For testing purposes, export the app
export const createServer = () => app;

// Start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Images served at: http://localhost:${port}/images`);
  });
}

export default app;