import { JobProgress } from '../types/job';
import JobProgressModel from '../models/mongodb/JobProgress';
import { io } from '../socket';

export async function updateJobProgress(
  jobId: string,
  update: Partial<JobProgress>
): Promise<void> {
  try {
    // Use findOneAndUpdate with upsert option to handle race conditions
    const updatedProgress = await JobProgressModel.findOneAndUpdate(
      { jobId },
      { 
        $set: {
          ...update,
          updatedAt: new Date()
        }
      },
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    ).lean();

    if (updatedProgress) {
      // Emit progress update via WebSocket
      io.emit(`jobProgress:${jobId}`, updatedProgress);
    }
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error by retrying without upsert
      try {
        const updatedProgress = await JobProgressModel.findOneAndUpdate(
          { jobId },
          { 
            $set: {
              ...update,
              updatedAt: new Date()
            }
          },
          { new: true }
        ).lean();

        if (updatedProgress) {
          io.emit(`jobProgress:${jobId}`, updatedProgress);
        }
      } catch (retryError) {
        console.error('Error updating job progress (retry):', retryError);
      }
    } else {
      console.error('Error updating job progress:', error);
    }
  }
}