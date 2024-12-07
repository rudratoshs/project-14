import { Job } from 'bull';
import { SubtopicGenerationJob } from '../../types/job';
import { CourseService } from '../../services/course.service';
import { SUBTOPIC_GENERATION_STEPS } from '../../types/job';
import { updateJobProgress } from '../../utils/progress';

const courseService = new CourseService();

/**
 * Updates the job progress for a given step.
 * @param jobId - The job ID.
 * @param step - The current step of the subtopic generation process.
 * @param details - Additional details for the job progress.
 */
async function updateProgress(jobId: string, step: any, details?: Record<string, any>) {
    await updateJobProgress(jobId, {
        progress: step.progress,
        currentStep: step.name,
        ...details,
    });
}

/**
 * Processes the subtopic content generation.
 * @param courseId - The course ID.
 * @param topicId - The topic ID.
 * @param subtopicId - The subtopic ID.
 * @returns The updated subtopic object.
 */
async function generateSubtopic(courseId: string, topicId: string, subtopicId: string,jobId: string): Promise<any> {
    return courseService.generateSubtopicContent(courseId, topicId, subtopicId,jobId);
}

/**
 * Handles the completion of the subtopic generation process.
 * @param jobId - The job ID.
 * @param subtopic - The generated subtopic object.
 */
async function finalizeSubtopicGeneration(jobId: string, subtopic: any) {
    await updateProgress(jobId, SUBTOPIC_GENERATION_STEPS.FINALIZING, {
        status: 'completed',
        result: {
            thumbnail: subtopic.thumbnail,
            banner: subtopic.banner,
            content: subtopic.content,
        },
    });
}

/**
 * Processes a subtopic generation job.
 * @param job - Bull job containing the subtopic generation data.
 * @returns The generated subtopic object.
 * @throws Will throw an error if the subtopic generation fails.
 */
export async function processSubtopicGeneration(job: Job<SubtopicGenerationJob>): Promise<any> {
    const { courseId, topicId, subtopicId, jobId } = job.data;

    try {
        // Initialize job progress
        await updateProgress(jobId, SUBTOPIC_GENERATION_STEPS.INITIALIZING);

        // Generate subtopic content
        const subtopic = await generateSubtopic(courseId, topicId, subtopicId,jobId);

        // Finalize generation
        await finalizeSubtopicGeneration(jobId, subtopic);

        return subtopic;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        await updateJobProgress(jobId, {
            status: 'failed',
            error: errorMessage,
        });
        throw error;
    }
}