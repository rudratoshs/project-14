import { Job } from 'bull';
import { CourseGenerationJob } from '../../types/job';
import { CourseService } from '../../services/course.service';
import { PROGRESS_STEPS } from '../../types/job';
import { updateJobProgress } from '../../utils/progress';
import { imageGenerationQueue } from '../index';
import { v4 as uuidv4 } from 'uuid';

const courseService = new CourseService();

export async function processCourseGeneration(job: Job<CourseGenerationJob>) {
  const { userId, courseData, jobId } = job.data;
  const { numTopics } = courseData;

  if (!userId) {
    throw new Error('Missing userId in job data');
  }

  let topicsCompleted = 0;
  let imagesCompleted = 0;
  const totalImages = numTopics * 2; // Thumbnail and banner for each topic

  try {
    console.time('Total Course Generation Time');

    // Initialize job progress
    console.time('Initialize Job Progress');
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
    console.timeEnd('Initialize Job Progress');

    // Create course structure
    console.time('Create Course Structure');
    const course = await courseService.createCourse(userId, courseData);
    console.timeEnd('Create Course Structure');

    if (!course || !course._id) {
      throw new Error('Failed to create course');
    }

    const courseId = course._id.toString();
    const topics = course.topics || [];
    console.log('Topics in course:', topics);

    // Generate topics and content
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      if (!topic || !topic.id) continue;

      console.time(`Generate Content for Topic ${i + 1}`);
      console.log('Started working for topic:', topic);

      // Update progress for current topic
      console.time(`Update Progress for Topic ${i + 1}`);
      await updateJobProgress(jobId, {
        progress:
          PROGRESS_STEPS.CONTENT_GENERATION.TOPIC.progress +
          ((i + 1) / numTopics) * PROGRESS_STEPS.CONTENT_GENERATION.TOPIC.increment,
        currentStep: 'Generating topic content',
        details: {
          topicsCompleted: i,
          totalTopics: numTopics,
          currentTopic: `Generating content for: ${topic.title}`,
        },
      });
      console.timeEnd(`Update Progress for Topic ${i + 1}`);

      // Generate topic content
      console.time(`Topic Content Generation ${i + 1}`);
      await courseService.generateTopicContent(courseId, topic.id);
      console.timeEnd(`Topic Content Generation ${i + 1}`);

      console.timeEnd(`Generate Content for Topic ${i + 1}`);
      topicsCompleted++;
    }

    // Finalize course
    console.time('Finalize Course');
    await updateJobProgress(jobId, {
      progress: PROGRESS_STEPS.FINALIZING.progress,
      currentStep: 'Finalizing course',
      status: 'completed',
      details: {
        topicsCompleted,
        totalTopics: numTopics,
        imagesCompleted,
        totalImages,
        currentTopic: 'Course generation completed!',
      },
      result: course,
    });
    console.timeEnd('Finalize Course');

    console.timeEnd('Total Course Generation Time');
    return course;
  } catch (error) {
    console.error('Error processing course generation:', error);

    console.time('Update Progress for Failure');
    await updateJobProgress(jobId, {
      status: 'failed',
      error: error.message,
      details: {
        topicsCompleted,
        totalTopics: numTopics,
        imagesCompleted,
        totalImages,
        currentTopic: 'Generation failed',
      },
    });
    console.timeEnd('Update Progress for Failure');

    throw error;
  }
}