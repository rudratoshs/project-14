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
    // Initialize job progress
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
        currentTopic: 'Initializing course structure...'
      }
    });

    // Create course structure
    await updateJobProgress(jobId, {
      progress: PROGRESS_STEPS.COURSE_STRUCTURE.progress,
      currentStep: 'Creating course structure',
      details: {
        currentTopic: 'Analyzing course requirements...'
      }
    });

    const course = await courseService.createCourse(userId, courseData);
    if (!course || !course._id) {
      throw new Error('Failed to create course');
    }

    const courseId = course._id.toString();
    const topics = course.topics || [];

    // Generate topics and content
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      if (!topic || !topic.id) continue;

      // Update progress for current topic
      await updateJobProgress(jobId, {
        progress: PROGRESS_STEPS.CONTENT_GENERATION.TOPIC.progress +
          ((i + 1) / numTopics) * PROGRESS_STEPS.CONTENT_GENERATION.TOPIC.increment,
        currentStep: 'Generating topic content',
        details: {
          topicsCompleted: i,
          totalTopics: numTopics,
          currentTopic: `Generating content for: ${topic.title}`
        }
      });

      // Generate topic content
      await courseService.generateTopicContent(courseId, topic.id);
      topicsCompleted++;

      // Generate thumbnail
      await updateJobProgress(jobId, {
        currentStep: 'Generating topic images',
        subStep: 'Creating thumbnail',
        details: {
          topicsCompleted,
          currentTopic: topic.title,
          currentImage: 'Generating thumbnail image...'
        }
      });

      const thumbnailJob = await imageGenerationQueue.add({
        courseId,
        topicId: topic.id,
        jobId: uuidv4(),
        size: 'thumbnail',
        prompt: `Course topic visualization for: ${topic.title}`
      });
      await thumbnailJob.finished();
      imagesCompleted++;

      // Generate banner
      await updateJobProgress(jobId, {
        subStep: 'Creating banner',
        details: {
          imagesCompleted,
          currentImage: 'Generating banner image...'
        }
      });

      const bannerJob = await imageGenerationQueue.add({
        courseId,
        topicId: topic.id,
        jobId: uuidv4(),
        size: 'banner',
        prompt: `Course banner visualization for: ${topic.title}`
      });
      await bannerJob.finished();
      imagesCompleted++;

      // Update overall progress
      await updateJobProgress(jobId, {
        progress: PROGRESS_STEPS.IMAGE_GENERATION.BANNERS.progress,
        details: {
          imagesCompleted,
          totalImages,
          currentTopic: `Completed: ${topic.title}`
        }
      });
    }

    // Finalize course
    await updateJobProgress(jobId, {
      progress: PROGRESS_STEPS.FINALIZING.progress,
      currentStep: 'Finalizing course',
      status: 'completed',
      details: {
        topicsCompleted,
        totalTopics: numTopics,
        imagesCompleted,
        totalImages,
        currentTopic: 'Course generation completed!'
      },
      result: course
    });

    return course;
  } catch (error) {
    console.error('Error processing course generation:', error);
    await updateJobProgress(jobId, {
      status: 'failed',
      error: error.message,
      details: {
        topicsCompleted,
        totalTopics: numTopics,
        imagesCompleted,
        totalImages,
        currentTopic: 'Generation failed'
      }
    });
    throw error;
  }
}