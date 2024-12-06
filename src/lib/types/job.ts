export interface JobProgress {
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
  };
  error?: string;
  result?: {
    thumbnail?: string;
    banner?: string;
    [key: string]: any;
  };
}

export const PROGRESS_STEPS = {
  INITIALIZING: {
    name: 'Initializing',
    progress: 0,
  },
  CONTENT_GENERATION: {
    TOPIC: {
      name: 'Generating Topic Content',
      progress: 30,
      increment: 10,
    },
    SUBTOPIC: {
      name: 'Generating Subtopic Content',
      progress: 50,
      increment: 5,
    }
  },
  IMAGE_GENERATION: {
    THUMBNAILS: {
      name: 'Generating Thumbnails',
      progress: 70,
    },
    BANNERS: {
      name: 'Generating Banners',
      progress: 90,
    },
  },
  FINALIZING: {
    name: 'Finalizing',
    progress: 100,
  },
};