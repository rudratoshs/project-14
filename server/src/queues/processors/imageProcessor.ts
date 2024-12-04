import { Job } from 'bull';
import { ImageGenerationJob } from '../../types/job';
import ImageService from '../../services/image.service';
import { PROGRESS_STEPS } from '../../types/job';
import { updateJobProgress } from '../../utils/progress';

export async function processImageGeneration(job: Job<ImageGenerationJob>) {
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

    // Generate and upload image
    const imageUrl = await ImageService.generateAndUploadImage(
      prompt,
      size,
      true,
      parseInt(courseId)
    );

    // Update progress
    await updateJobProgress(jobId, {
      progress: 100,
      currentStep: 'Image generation completed',
      status: 'completed',
      result: { imageUrl }
    });

    return imageUrl;
  } catch (error) {
    await updateJobProgress(jobId, {
      status: 'failed',
      error: error.message
    });
    throw error;
  }
}