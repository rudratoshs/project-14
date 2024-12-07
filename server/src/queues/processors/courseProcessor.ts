import { Job } from 'bull';
import { CourseGenerationJob } from '../../types/job';
import { CourseService } from '../../services/course.service';
import { PROGRESS_STEPS } from '../../types/job';
import { updateJobProgress } from '../../utils/progress';

const courseService = new CourseService();

async function initializeProgress(jobId: string, userId: string, numTopics: number, totalImages: number) {
  await updateJobProgress(jobId, {
    jobId,
    userId,
    status: 'processing',
    progress: PROGRESS_STEPS.INITIALIZING.progress,
    currentStep: 'Starting course generation',
    details: {
      topicsCompleted: 0,
      totalTopics: numTopics,
      imagesCompleted: 0,
      totalImages,
      currentTopic: 'Initializing course structure...',
    },
  });
}

async function finalizeProgress(jobId: string, course: any, numTopics: number, totalImages: number) {
  await updateJobProgress(jobId, {
    progress: PROGRESS_STEPS.FINALIZING.progress,
    currentStep: 'Finalizing course',
    status: 'completed',
    details: {
      topicsCompleted: numTopics,
      totalTopics: numTopics,
      imagesCompleted: totalImages,
      totalImages,
      currentTopic: 'Course generation completed!',
    },
    result: course,
  });
}

async function processTopics(
  courseId: string,
  topics: any[],
  jobId: string,
  numTopics: number
) {
  let topicsCompleted = 0;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    if (!topic || !topic.id) continue;

    await updateJobProgress(jobId, {
      progress:
        PROGRESS_STEPS.CONTENT_GENERATION.TOPIC.progress +
        ((i + 1) / numTopics) * PROGRESS_STEPS.CONTENT_GENERATION.TOPIC.increment,
      currentStep: `Main Topic (${i + 1}/${numTopics})`,
      details: {
        topicsCompleted: i,
        totalTopics: numTopics,
        currentTopic: topic.title,
      },
    });

    await courseService.generateTopicContent(courseId, topic.id, jobId);
    topicsCompleted++;

    if (topic.subtopics?.length) {
      await processSubtopics(courseId, topic, jobId, topicsCompleted, numTopics);
    }
  }
}

async function processSubtopics(
  courseId: string,
  topic: any,
  jobId: string,
  topicsCompleted: number,
  numTopics: number
) {
  for (let j = 0; j < topic.subtopics.length; j++) {
    const subtopic = topic.subtopics[j];

    await updateJobProgress(jobId, {
      currentStep: `Generating subtopic content (${j + 1}/${topic.subtopics.length})`,
      details: {
        topicsCompleted,
        totalTopics: numTopics,
        currentTopic: topic.title,
        currentSubtopic: subtopic.title,
        subtopicsCompleted: j,
        totalSubtopics: topic.subtopics.length,
      },
    });

    await courseService.generateSubtopicContent(courseId, topic.id, subtopic.id,jobId);
  }
}

export async function processCourseGeneration(
  job: Job<CourseGenerationJob>
): Promise<any> {
  const { userId, courseData, jobId } = job.data;
  const { numTopics, courseGenertionType } = courseData;

  if (!userId) throw new Error('Missing userId in job data');

  const totalImages = numTopics * 2;

  try {
    await initializeProgress(jobId, userId, numTopics, totalImages);

    const course = await courseService.createCourse(userId, courseData, jobId);

    if (courseGenertionType === 'partial') {
      await finalizeProgress(jobId, course, numTopics, totalImages);
      return course;
    }

    if (!course || !course._id) throw new Error('Failed to create course');

    const courseId = course._id.toString();
    const topics = course.topics || [];

    await processTopics(courseId, topics, jobId, numTopics);

    await finalizeProgress(jobId, course, numTopics, totalImages);

    return course;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    await updateJobProgress(jobId, {
      status: 'failed',
      error: errorMessage,
      details: {
        topicsCompleted: 0,
        totalTopics: numTopics,
        imagesCompleted: 0,
        totalImages,
        currentTopic: 'Generation failed',
      },
    });
    throw err;
  }
}