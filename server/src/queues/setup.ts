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
    return await processCourseGeneration(job);
  });

  // Process topic generation jobs
  topicGenerationQueue.process(async (job) => {
    return await processTopicGeneration(job);
  });

  // Process subtopic generation jobs
  subtopicGenerationQueue.process(async (job) => {
    return await processSubtopicGeneration(job);
  });

  // Process image generation jobs
  imageGenerationQueue.process(async (job) => {
    return await processImageGeneration(job);
  });

  console.log('Queue processors initialized');
}