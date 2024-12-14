import { JobProgress } from '../types/job';
import JobProgressModel from '../models/mongodb/JobProgress';
import { io } from '../socket';

export async function updateJobProgress(
  jobId: string,
  update: Partial<JobProgress>
): Promise<void> {
  try {
    // Use findOneAndUpdate with upsert option
    const updatedProgress = await JobProgressModel.findOneAndUpdate(
      { jobId },
      { 
        $set: {
          ...update,
          updatedAt: new Date()
        }
      },
      { 
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true,
        runValidators: true // Run schema validators on update
      }
    ).lean();

    if (updatedProgress) {
      // Emit progress update via WebSocket
      console.log('Emitting progress update:', {
        jobId,
        progress: updatedProgress
      });
      
      // Emit to specific room for this job
      io.to(`job:${jobId}`).emit(`jobProgress:${jobId}`, updatedProgress);
    }
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error by retrying without upsert
      console.log('Handling duplicate key error for job:', jobId);
      try {
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
            runValidators: true
          }
        ).lean();

        if (updatedProgress) {
          console.log('Emitting progress update after retry:', {
            jobId,
            progress: updatedProgress
          });
          io.to(`job:${jobId}`).emit(`jobProgress:${jobId}`, updatedProgress);
        }
      } catch (retryError) {
        console.error('Error updating job progress (retry):', retryError);
      }
    } else {
      console.error('Error updating job progress:', error);
    }
  }
}

export async function getJobProgress(jobId: string): Promise<JobProgress | null> {
  try {
    const progress = await JobProgressModel.findOne({ jobId }).lean();
    return progress;
  } catch (error) {
    console.error('Error fetching job progress:', error);
    return null;
  }
}
