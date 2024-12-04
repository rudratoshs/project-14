import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { JobProgress } from '@/lib/types/job';
import axios from 'axios';

console.log('VITE_API_URL',import.meta.env.VITE_SOCKET_URL)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL?.replace(/^http/, 'ws') || 'ws://localhost:3000';

export function useJobProgress(jobId: string | null) {
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!jobId) return;

    // First fetch the current progress
    const fetchProgress = async () => {
      try {
        const response = await axios.get(`/courses/job/${jobId}`);
        setProgress(response.data);
      } catch (err) {
        console.error('Error fetching initial progress:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch progress');
      }
    };

    fetchProgress();

    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      path: '/socket.io'
    });

    setSocket(socketInstance);

    // Subscribe to job progress updates
    socketInstance.emit('subscribeToJob', jobId);
    
    socketInstance.on(`jobProgress:${jobId}`, (data: JobProgress) => {
      console.log('Progress update received:', data);
      setProgress(data);
    });

    // Handle connection errors
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(`Connection error: ${err.message}`);
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