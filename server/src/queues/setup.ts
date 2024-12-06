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

export function setupQueueProcessors() {
  // Process course generation jobs
  courseGenerationQueue.process(async (job) => {
    console.log('Processing course generation job:', {
      bullJobId: job.id,
      customJobId: job.data.jobId,
      data: job.data
    });
    return await processCourseGeneration(job);
  });

  // Process topic generation jobs
  topicGenerationQueue.process(async (job) => {
    console.log('Processing topic generation job:', {
      bullJobId: job.id,
      customJobId: job.data.jobId,
      data: job.data
    });
    return await processTopicGeneration(job);
  });

  // Process subtopic generation jobs
  subtopicGenerationQueue.process(async (job) => {
    console.log('Processing subtopic generation job:', {
      bullJobId: job.id,
      customJobId: job.data.jobId,
      data: job.data
    });
    return await processSubtopicGeneration(job);
  });

  // Process image generation jobs
  imageGenerationQueue.process(async (job) => {
    console.log('Processing image generation job:', {
      bullJobId: job.id,
      customJobId: job.data.jobId,
      data: job.data
    });
    return await processImageGeneration(job);
  });

  // Add queue event handlers
  [courseGenerationQueue, topicGenerationQueue, subtopicGenerationQueue, imageGenerationQueue].forEach(queue => {
    queue.on('completed', (job) => {
      console.log(`Job completed:`, {
        queueName: queue.name,
        bullJobId: job.id,
        customJobId: job.data.jobId
      });
    });

    queue.on('failed', (job, err) => {
      console.error(`Job failed:`, {
        queueName: queue.name,
        bullJobId: job?.id,
        customJobId: job?.data?.jobId,
        error: err
      });
    });

    queue.on('error', (error) => {
      console.error(`Queue error in ${queue.name}:`, error);
    });
  });

  console.log('Queue processors initialized');
}
