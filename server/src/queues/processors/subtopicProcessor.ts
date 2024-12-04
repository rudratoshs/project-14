import { Job } from 'bull';
import { SubtopicGenerationJob } from '../../types/job';
import { CourseService } from '../../services/course.service';
import { SUBTOPIC_GENERATION_STEPS } from '../../types/job';
import { updateJobProgress } from '../../utils/progress';

const courseService = new CourseService();

export async function processSubtopicGeneration(job: Job<SubtopicGenerationJob>) {
    const { courseId, topicId, subtopicId, jobId } = job.data;

    try {
        // Initialize job progress
        await updateJobProgress(jobId, {
            jobId,
            userId: courseId,
            status: 'processing',
            progress: SUBTOPIC_GENERATION_STEPS.INITIALIZING.progress,
            currentStep: SUBTOPIC_GENERATION_STEPS.INITIALIZING.name,
        });

        // Generate subtopic overview content
        await updateJobProgress(jobId, {
            progress: SUBTOPIC_GENERATION_STEPS.CONTENT_GENERATION.SUBTOPIC_OVERVIEW.progress,
            currentStep: SUBTOPIC_GENERATION_STEPS.CONTENT_GENERATION.SUBTOPIC_OVERVIEW.name,
        });

        const subtopic = await courseService.generateSubtopicContent(courseId, topicId, subtopicId);

        // Generate detailed subtopic content
        await updateJobProgress(jobId, {
            progress: SUBTOPIC_GENERATION_STEPS.CONTENT_GENERATION.SUBTOPIC_CONTENT.progress,
            currentStep: SUBTOPIC_GENERATION_STEPS.CONTENT_GENERATION.SUBTOPIC_CONTENT.name,
        });
        // Generate thumbnail image
        if (!subtopic.thumbnail) {
            await updateJobProgress(jobId, {
                progress: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.SUBTOPIC_THUMBNAILS.progress,
                currentStep: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.SUBTOPIC_THUMBNAILS.name,
            });
        }

        // Generate banner image
        if (!subtopic.banner) {
            await updateJobProgress(jobId, {
                progress: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.SUBTOPIC_BANNERS.progress,
                currentStep: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.SUBTOPIC_BANNERS.name,
            });
        }

        // Finalize subtopic generation
        await updateJobProgress(jobId, {
            progress: SUBTOPIC_GENERATION_STEPS.FINALIZING.progress,
            currentStep: SUBTOPIC_GENERATION_STEPS.FINALIZING.name,
            status: 'completed',
            result: {
                thumbnail: subtopic.thumbnail,
                banner: subtopic.banner,
                content: subtopic.content,
            },
        });
        console.log('Job finalized:', { jobId });

        return subtopic;
    } catch (error) {
        console.error('Error processing subtopic generation:', error);
        await updateJobProgress(jobId, {
            status: 'failed',
            error: error.message,
        });
        throw error;
    }
}