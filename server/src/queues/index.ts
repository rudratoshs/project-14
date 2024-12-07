import Queue from 'bull';

const redisConfig = {
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  host: process.env.REDIS_HOST || 'localhost',
};

const defaultJobOptions = {
  attempts: 2,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

// Queue for course generation
export const courseGenerationQueue = new Queue('courseGeneration', {
  redis: redisConfig,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 3, // Custom attempts for this queue
    backoff: { type: 'exponential', delay: 1000 },
  },
});

// Queue for topic generation
export const topicGenerationQueue = new Queue('topicGeneration', {
  redis: redisConfig,
  defaultJobOptions,
});

// Queue for subtopic generation
export const subtopicGenerationQueue = new Queue('subtopicGeneration', {
  redis: redisConfig,
  defaultJobOptions,
});

// Queue for image generation
export const imageGenerationQueue = new Queue('imageGeneration', {
  redis: redisConfig,
  defaultJobOptions,
});

// Common event handlers
const queues = [courseGenerationQueue, topicGenerationQueue, subtopicGenerationQueue, imageGenerationQueue];

queues.forEach((queue) => {
  queue.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully in queue: ${queue.name}`);
  });

  queue.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed in queue: ${queue.name} - Error: ${err.message}`);
  });

  queue.on('error', (error) => {
    console.error(`Error in queue: ${queue.name} - ${error.message}`);
  });

  queue.on('ready', () => {
    console.log(`Queue ${queue.name} is ready and connected to Redis`);
  });
});

// Graceful shutdown
export const closeQueues = async () => {
  await Promise.all(queues.map((queue) => queue.close()));
};

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await closeQueues();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Interrupt received, closing queues...');
  await closeQueues();
  process.exit(0);
});