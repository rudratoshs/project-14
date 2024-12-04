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
  COURSE_STRUCTURE: {
    name: 'Generating Course Structure',
    progress: 10,
  },
  TOPIC_GENERATION: {
    name: 'Generating Topics',
    progress: 40,
    increment: 3,
  },
  IMAGE_GENERATION: {
    THUMBNAILS: {
      name: 'Generating Topic Thumbnails',
      progress: 60,
    },
    BANNERS: {
      name: 'Generating Topic Banners',
      progress: 80,
    },
    SUBTOPICS: {
      name: 'Generating Subtopic Images',
      progress: 90,
    },
  },
  FINALIZING: {
    name: 'Finalizing Course',
    progress: 100,
  },
};