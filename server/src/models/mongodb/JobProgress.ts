import mongoose, { Schema, Document } from 'mongoose';

export interface IJobProgress extends Document {
  jobId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  subStep?: string;
  details?: {
    topicsCompleted?: number;
    totalTopics?: number;
    imagesCompleted?: number;
    totalImages?: number;
    currentTopic?: string;
    currentImage?: string;
    subtopicsCompleted?: number;
    totalSubtopics?: number;
    currentSubtopic?: string;
  };
  error?: string;
  result?: {
    thumbnail?: string;
    banner?: string;
    content?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JobProgressSchema = new Schema<IJobProgress>(
  {
    jobId: { 
      type: String, 
      required: true,
      unique: true,
      index: true 
    },
    userId: { 
      type: String, 
      required: true,
      index: true 
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true
    },
    progress: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100
    },
    currentStep: { 
      type: String, 
      default: 'Initializing' 
    },
    subStep: { 
      type: String 
    },
    details: {
      topicsCompleted: { type: Number },
      totalTopics: { type: Number },
      imagesCompleted: { type: Number },
      totalImages: { type: Number },
      currentTopic: { type: String },
      currentImage: { type: String },
      subtopicsCompleted: { type: Number },
      totalSubtopics: { type: Number },
      currentSubtopic: { type: String }
    },
    error: { type: String },
    result: { type: Schema.Types.Mixed }
  },
  { 
    timestamps: true,
    storeSubdocValidationError: false
  }
);

// Add this to handle duplicate key errors gracefully
JobProgressSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      // Check if a document with this jobId already exists
      const existing = await this.constructor.findOne({ jobId: this.jobId });
      if (existing) {
        // If exists, update it instead of creating new
        Object.assign(existing, this.toObject());
        await existing.save();
        return next(new Error('Duplicate jobId - updated existing document'));
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add indexes for better query performance
JobProgressSchema.index({ jobId: 1 }, { unique: true });
JobProgressSchema.index({ userId: 1 });
JobProgressSchema.index({ status: 1 });
JobProgressSchema.index({ createdAt: 1 });
JobProgressSchema.index({ updatedAt: 1 });

const JobProgress = mongoose.model<IJobProgress>('JobProgress', JobProgressSchema);

export default JobProgress;
