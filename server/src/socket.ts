import { Server } from 'socket.io';
import { createServer } from 'http';
import app from './index';

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io'
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Subscribe to job progress updates
  socket.on('subscribeToJob', (jobId: string) => {
    console.log(`Client ${socket.id} subscribed to job ${jobId}`);
    socket.join(`job:${jobId}`);
  });

  // Unsubscribe from job progress updates
  socket.on('unsubscribeFromJob', (jobId: string) => {
    console.log(`Client ${socket.id} unsubscribed from job ${jobId}`);
    socket.leave(`job:${jobId}`);
  });
});

export const initializeSocket = () => {
  const port = parseInt(process.env.SOCKET_PORT || '3001');
  httpServer.listen(port, () => {
    console.log(`WebSocket server running on port ${port}`);
  });
};
