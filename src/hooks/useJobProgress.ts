import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { JobProgress } from '@/lib/types/job';
import { getJobProgress } from '@/lib/api/courses';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL?.replace(/^http/, 'ws') || 'ws://localhost:3001';

export function useJobProgress(jobId: string | null) {
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!jobId) return;

    // First fetch the current progress
    const fetchProgress = async () => {
      try {
        const data = await getJobProgress(jobId);
        setProgress(data);
      } catch (err) {
        console.error('Error fetching initial progress:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch progress');
      }
    };

    fetchProgress();

    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(socketInstance);

    // Subscribe to job progress updates
    socketInstance.emit('subscribeToJob', jobId);
    
    socketInstance.on(`jobProgress:${jobId}`, (data: JobProgress) => {
      setProgress(data);
    });

    // Handle connection errors
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(`Connection error: ${err.message}`);
    });

    // Handle reconnection
    socketInstance.on('reconnect', () => {
      socketInstance.emit('subscribeToJob', jobId);
    });

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.emit('unsubscribeFromJob', jobId);
        socketInstance.disconnect();
      }
    };
  }, [jobId]);

  return { progress, error };
}
