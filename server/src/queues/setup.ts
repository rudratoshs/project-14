import {
  courseGenerationQueue,
  topicGenerationQueue,
  subtopicGenerationQueue,
  imageGenerationQueue
} from './index';

import { processCourseGeneration } from './processors/courseProcessor';
import { processTopicGeneration } from './processors/topicProcessor';
import { processSubtopicGeneration } from './processors/subtopicProcessor';
import { processImageGeneration } from './processors/imageProcessor';

export function setupQueueProcessors(): void {
  // Queue processors map
  const queueProcessors = [
    { queue: topicGenerationQueue, processor: processTopicGeneration },
    { queue: subtopicGenerationQueue, processor: processSubtopicGeneration },
    { queue: imageGenerationQueue, processor: processImageGeneration },
  ];

  // Assign processors to queues
  queueProcessors.forEach(({ queue, processor }) => {
    queue.process(async (job) => {
      console.log(`Processing job in ${queue.name}:`, { bullJobId: job.id, jobId: job.data.jobId });
      return await processor(job);
    });
  });

  // Custom concurrent processing for course generation
  courseGenerationQueue.process(5, async (job) => {
    console.log(`Processing course generation job:`, { bullJobId: job.id, jobId: job.data.jobId });
    return await processCourseGeneration(job);
  });

  // Common queue event handlers
  [courseGenerationQueue, topicGenerationQueue, subtopicGenerationQueue, imageGenerationQueue].forEach((queue) => {
    queue.on('completed', (job) => {
      console.log(`Job completed in ${queue.name}:`, { bullJobId: job.id, jobId: job.data.jobId });
    });

    queue.on('failed', (job, err) => {
      console.error(`Job failed in ${queue.name}:`, { bullJobId: job?.id, jobId: job?.data?.jobId, error: err.message });
    });

    queue.on('error', (error) => {
      console.error(`Queue error in ${queue.name}:`, error.message);
    });
  });

  console.log('Queue processors initialized successfully');
}