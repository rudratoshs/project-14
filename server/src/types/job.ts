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
}

export interface CourseGenerationJob {
  userId: string;
  courseData: {
    title: string;
    description: string;
    type: 'image_theory' | 'video_theory';
    accessibility: 'free' | 'paid' | 'limited';
    numTopics: number;
    subtopics?: string[];
  };
  jobId: string;
}

export interface TopicGenerationJob {
  courseId: string;
  topicId: string;
  jobId: string;
}

export interface SubtopicGenerationJob {
  courseId: string;
  topicId: string;
  subtopicId: string;
  jobId: string;
}

export interface ImageGenerationJob {
  prompt: string;
  size: 'thumbnail' | 'banner';
  courseId: string;
  topicId?: string;
  subtopicId?: string;
  jobId: string;
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
      increment:1.5
    },
    SUBTOPIC: {
      name: 'Generating Subtopic Content',
      progress: 50,
      increment: 10, // For incremental progress per subtopic
    },
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

export const TOPIC_GENERATION_STEPS = {
  INITIALIZING: {
    name: 'Initializing Topic Generation',
    progress: 0,
  },
  CONTENT_GENERATION: {
    TOPIC_OVERVIEW: {
      name: 'Generating Topic Overview',
      progress: 20,
    },
    SUBTOPIC_CONTENT: {
      name: 'Generating Subtopic Content',
      progress: 50,
    },
  },
  IMAGE_GENERATION: {
    TOPIC_THUMBNAILS: {
      name: 'Generating Topic Thumbnails',
      progress: 70,
    },
    TOPIC_BANNERS: {
      name: 'Generating Topic Banners',
      progress: 80,
    },
    SUBTOPIC_IMAGES: {
      name: 'Generating Subtopic Images',
      progress: 90,
    },
  },
  FINALIZING: {
    name: 'Finalizing Topic Generation',
    progress: 100,
  },
};

export const SUBTOPIC_GENERATION_STEPS = {
  INITIALIZING: {
    name: 'Initializing Subtopic Generation',
    progress: 0,
  },
  CONTENT_GENERATION: {
    SUBTOPIC_OVERVIEW: {
      name: 'Generating Subtopic Overview',
      progress: 20,
    },
    SUBTOPIC_CONTENT: {
      name: 'Generating Subtopic Detailed Content',
      progress: 50,
    },
  },
  IMAGE_GENERATION: {
    SUBTOPIC_THUMBNAILS: {
      name: 'Generating Subtopic Thumbnails',
      progress: 70,
    },
    SUBTOPIC_BANNERS: {
      name: 'Generating Subtopic Banners',
      progress: 90,
    },
  },
  FINALIZING: {
    name: 'Finalizing Subtopic Generation',
    progress: 100,
  },
};