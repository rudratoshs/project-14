import { courseGenerationQueue, topicGenerationQueue, imageGenerationQueue } from './index';
import { processCourseGeneration } from './processors/courseProcessor';
import { processTopicGeneration } from './processors/topicProcessor';
import { processImageGeneration } from './processors/imageProcessor';

export function setupQueueProcessors() {
  // Process course generation jobs
  courseGenerationQueue.process(async (job) => {
    return await processCourseGeneration(job);
  });

  // Process topic generation jobs
  topicGenerationQueue.process(async (job) => {
    return await processTopicGeneration(job);
  });

  // Process image generation jobs
  imageGenerationQueue.process(async (job) => {
    return await processImageGeneration(job);
  });

  console.log('Queue processors initialized');
}