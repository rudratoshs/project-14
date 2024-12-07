import { Job } from 'bull';
import { TopicGenerationJob } from '../../types/job';
import { CourseService } from '../../services/course.service';
import { TOPIC_GENERATION_STEPS } from '../../types/job';
import { updateJobProgress } from '../../utils/progress';

const courseService = new CourseService();

/**
 * Processes a topic generation job.
 * @param job - The Bull job containing data for topic generation.
 * @returns The generated topic with content and images.
 * @throws Throws an error if any step in the topic generation process fails.
 */
export async function processTopicGeneration(job: Job<TopicGenerationJob>) {
    console.log('topic processor hit')
    const { courseId, topicId, jobId } = job.data;

    if (!courseId || !topicId || !jobId) {
        throw new Error('Missing required job data: courseId, topicId, or jobId.');
    }

    try {
        // Step 1: Initialize job progress
        await updateJobProgress(jobId, {
            jobId,
            userId: courseId,
            status: 'processing',
            progress: TOPIC_GENERATION_STEPS.INITIALIZING.progress,
            currentStep: TOPIC_GENERATION_STEPS.INITIALIZING.name,
        });

        // Step 2: Generate topic-level content
        await updateJobProgress(jobId, {
            progress: TOPIC_GENERATION_STEPS.CONTENT_GENERATION.TOPIC_OVERVIEW.progress,
            currentStep: TOPIC_GENERATION_STEPS.CONTENT_GENERATION.TOPIC_OVERVIEW.name,
        });

        const topic = await courseService.generateTopicContent(courseId, topicId, jobId);

        if (!topic) {
            throw new Error('Failed to generate topic content.');
        }

        // Step 3: Generate subtopic content (if applicable)
        if (Array.isArray(topic.subtopics) && topic.subtopics.length > 0) {
            for (let i = 0; i < topic.subtopics.length; i++) {
                const subtopic = topic.subtopics[i];

                if (subtopic.status === 'incomplete') {
                    await courseService.generateSubtopicContent(courseId, topicId, subtopic.id);

                    await updateJobProgress(jobId, {
                        progress:
                            TOPIC_GENERATION_STEPS.CONTENT_GENERATION.SUBTOPIC_CONTENT.progress +
                            ((i + 1) / topic.subtopics.length) * 10, // Incremental progress calculation
                        currentStep: `Generating content for subtopic: ${subtopic.title}`,
                        details: {
                            subtopicsCompleted: i + 1,
                            totalSubtopics: topic.subtopics.length,
                        },
                    });
                }
            }
        }

        // Step 4: Generate topic images (thumbnails and banners)
        await updateJobProgress(jobId, {
            progress: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_THUMBNAILS.progress,
            currentStep: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_THUMBNAILS.name,
        });

        await updateJobProgress(jobId, {
            progress: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_BANNERS.progress,
            currentStep: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_BANNERS.name,
        });

        // Step 5: Finalize topic generation
        await updateJobProgress(jobId, {
            progress: TOPIC_GENERATION_STEPS.FINALIZING.progress,
            currentStep: TOPIC_GENERATION_STEPS.FINALIZING.name,
            status: 'completed',
            result: {
                thumbnail: topic.thumbnail,
                banner: topic.banner,
                content: topic.content,
            },
        });

        return topic;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

        await updateJobProgress(jobId, {
            status: 'failed',
            error: errorMessage,
        });

        throw err;
    }
}