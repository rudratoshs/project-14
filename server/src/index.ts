import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import connectDB from './config/mongodb.js';
import { setupQueueProcessors } from './queues/setup.js';
import { initializeSocket } from './socket.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Set up CORS with specific options
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Set up static files directory
const imagesDirectory = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDirectory)) {
  fs.mkdirSync(imagesDirectory, { recursive: true });
}

app.use('/images', express.static(imagesDirectory));

// Connect to MongoDB
connectDB();

// Initialize queue processors
setupQueueProcessors();

app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Mount all routes under /api
app.use('/api', routes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
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