import { Job } from 'bull';
import { TopicGenerationJob } from '../../types/job';
import { CourseService } from '../../services/course.service';
import { updateJobProgress } from '../../utils/progress';
import { TOPIC_GENERATION_STEPS } from '../../types/job';

const courseService = new CourseService();

/**
 * Initializes job progress for topic generation.
 * @param jobId - The job ID.
 * @param details - Additional progress details.
 */
async function initializeProgress(jobId: string, details?: Record<string, any>) {
  await updateJobProgress(jobId, {
    status: 'processing',
    progress: TOPIC_GENERATION_STEPS.INITIALIZING.progress,
    currentStep: TOPIC_GENERATION_STEPS.INITIALIZING.name,
    ...details,
  });
}

/**
 * Finalizes the job progress upon completion.
 * @param jobId - The job ID.
 * @param topic - The generated topic object.
 */
async function finalizeProgress(jobId: string, topic: any) {
  await updateJobProgress(jobId, {
    status: 'completed',
    progress: TOPIC_GENERATION_STEPS.FINALIZING.progress,
    currentStep: TOPIC_GENERATION_STEPS.FINALIZING.name,
    result: {
      thumbnail: topic.thumbnail,
      banner: topic.banner,
      content: topic.content,
    },
  });
}

/**
 * Processes the topic generation.
 * @param courseId - The course ID.
 * @param topicId - The topic ID.
 * @param jobId - The job ID.
 * @param mode - The generation mode ('full' or 'partial').
 * @returns The updated topic object.
 */
async function processTopic(courseId: string, topicId: string, jobId: string, topicGenerateType: string) {
  const topic = await courseService.generateTopicContent(courseId, topicId, jobId,topicGenerateType);

  if (!topic) {
    throw new Error('Failed to generate topic content.');
  }
  return topic;
}

/**
 * Main handler for processing topic generation jobs.
 * @param job - The Bull job containing topic generation data.
 * @returns The generated topic object.
 */
export async function processTopicGeneration(job: Job<TopicGenerationJob>): Promise<any> {
  const { courseId, topicId, jobId, topicGenerateType = 'full' } = job.data;

  if (!courseId || !topicId || !jobId) {
    throw new Error('Missing required job data: courseId, topicId, or jobId.');
  }

  try {
    // Initialize progress
    await initializeProgress(jobId, { currentTopic: `Starting topic: ${topicId}` });

    // Process the topic
    const topic = await processTopic(courseId, topicId, jobId, topicGenerateType);

    // Finalize progress
    await finalizeProgress(jobId, topic);

    return topic;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    // Handle failure
    await updateJobProgress(jobId, {
      status: 'failed',
      error: errorMessage,
      details: {
        currentTopic: topicId,
      },
    });

    throw error;
  }
}