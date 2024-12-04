import Queue from 'bull';
import { redisClient } from '../config/redis';

// Queue for course generation
export const courseGenerationQueue = new Queue('courseGeneration', {
  redis: {
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    host: process.env.REDIS_HOST || 'localhost',
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Queue for topic generation
export const topicGenerationQueue = new Queue('topicGeneration', {
  redis: {
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    host: process.env.REDIS_HOST || 'localhost',
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Queue for subtopic generation
export const subtopicGenerationQueue = new Queue('subtopicGeneration', {
  redis: {
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    host: process.env.REDIS_HOST || 'localhost',
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Queue for image generation
export const imageGenerationQueue = new Queue('imageGeneration', {
  redis: {
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    host: process.env.REDIS_HOST || 'localhost',
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Queue event handlers
const queues = [courseGenerationQueue, topicGenerationQueue, subtopicGenerationQueue, imageGenerationQueue];

queues.forEach(queue => {
  queue.on('completed', (job) => {
    console.log(`Job ${job.id} completed in queue ${queue.name}`);
  });

  queue.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed in queue ${queue.name}:`, err);
  });

  queue.on('error', (error) => {
    console.error(`Error in queue ${queue.name}:`, error);
  });
});

export const closeQueues = async () => {
  await Promise.all(queues.map(queue => queue.close()));
};

process.on('SIGTERM', async () => {
  await closeQueues();
  process.exit(0);
});