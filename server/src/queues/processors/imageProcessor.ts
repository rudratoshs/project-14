import { Job } from 'bull';
import { ImageGenerationJob } from '../../types/job';
import ImageService from '../../services/image.service';
import { PROGRESS_STEPS } from '../../types/job';
import { updateJobProgress } from '../../utils/progress';

/**
 * Processes an image generation job.
 * @param job - Bull Job object containing the data for image generation.
 * @returns A promise that resolves to the generated image URL.
 */
export async function processImageGeneration(job: Job<ImageGenerationJob>): Promise<string> {
  const { prompt, size, courseId, jobId } = job.data;

  try {
    // Initialize job progress
    await updateJobProgress(jobId, {
      jobId,
      userId: courseId,
      status: 'processing',
      progress: PROGRESS_STEPS.IMAGE_GENERATION[size === 'thumbnail' ? 'THUMBNAILS' : 'BANNERS'].progress,
      currentStep: `Generating ${size} image`,
      details: {
        currentImage: prompt
      }
    });

    // Generate and upload the image
    const imageUrl = await ImageService.generateAndUploadImage(
      prompt,
      size,
      true,
      parseInt(courseId)
    );

    // Mark job as completed with the result
    await updateJobProgress(jobId, {
      progress: 100,
      currentStep: 'Image generation completed',
      status: 'completed',
      result: { imageUrl }
    });

    return imageUrl;
  } catch (error) {
    // Handle errors and update job status
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    await updateJobProgress(jobId, {
      status: 'failed',
      error: errorMessage
    });
    throw error;
  }
}