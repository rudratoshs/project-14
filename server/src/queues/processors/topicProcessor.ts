import { Job } from 'bull';
import { TopicGenerationJob } from '../../types/job';
import { CourseService } from '../../services/course.service';
import { TOPIC_GENERATION_STEPS } from '../../types/job';
import { updateJobProgress } from '../../utils/progress';

const courseService = new CourseService();

export async function processTopicGeneration(job: Job<TopicGenerationJob>) {
    const { courseId, topicId, jobId } = job.data;
    console.log('jobId processTopicGeneration', jobId)
    try {
        // Initialize job progress
        await updateJobProgress(jobId, {
            jobId,
            userId: courseId,
            status: 'processing',
            progress: TOPIC_GENERATION_STEPS.INITIALIZING.progress,
            currentStep: TOPIC_GENERATION_STEPS.INITIALIZING.name,
        });

        // Generate topic-level content
        await updateJobProgress(jobId, {
            progress: TOPIC_GENERATION_STEPS.CONTENT_GENERATION.TOPIC_OVERVIEW.progress,
            currentStep: TOPIC_GENERATION_STEPS.CONTENT_GENERATION.TOPIC_OVERVIEW.name,
        });

        const topic = await courseService.generateTopicContent(courseId, topicId);

        // Generate subtopic content
        await updateJobProgress(jobId, {
            progress: TOPIC_GENERATION_STEPS.CONTENT_GENERATION.SUBTOPIC_CONTENT.progress,
            currentStep: TOPIC_GENERATION_STEPS.CONTENT_GENERATION.SUBTOPIC_CONTENT.name,
        });

        if (topic.subtopics) {
            for (let i = 0; i < topic.subtopics.length; i++) {
                const subtopic = topic.subtopics[i];
                if (subtopic.status === 'incomplete') {
                    await courseService.generateSubtopicContent(courseId, topicId, subtopic.id);
                    await updateJobProgress(jobId, {
                        progress:
                            TOPIC_GENERATION_STEPS.CONTENT_GENERATION.SUBTOPIC_CONTENT.progress +
                            ((i + 1) / topic.subtopics.length) * 10,
                        currentStep: `Generating content for subtopic: ${subtopic.title}`,
                        details: {
                            subtopicsCompleted: i + 1,
                            totalSubtopics: topic.subtopics.length,
                        },
                    });
                }
            }
        }

        // Generate images for topic
        await updateJobProgress(jobId, {
            progress: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_THUMBNAILS.progress,
            currentStep: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_THUMBNAILS.name,
        });

        await updateJobProgress(jobId, {
            progress: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_BANNERS.progress,
            currentStep: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_BANNERS.name,
        });

        // Finalize topic generation
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
    } catch (error) {
        console.error('Error processing topic generation:', error);
        await updateJobProgress(jobId, {
            status: 'failed',
            error: error.message,
        });
        throw error;
    }
}