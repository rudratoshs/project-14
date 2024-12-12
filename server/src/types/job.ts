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
    courseName?: string;
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
    courseGenertionType?:'partial' | 'full';
  };
  jobId: string;
}

export interface TopicGenerationJob {
  courseId: string;
  topicId: string;
  jobId: string;
  topicGenerateType:string;
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
    }
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
    START: {
      name: 'Starting Subtopic Content Generation',
      progress: 10,
    },
    COMPLETED: {
      name: 'Subtopic Content Generated',
      progress: 40,
    },
  },
  IMAGE_GENERATION: {
    START_THUMBNAIL: {
      name: 'Generating Subtopic Thumbnail',
      progress: 50,
    },
    THUMBNAIL_COMPLETED: {
      name: 'Subtopic Thumbnail Generated',
      progress: 60,
    },
    START_BANNER: {
      name: 'Generating Subtopic Banner',
      progress: 70,
    },
    BANNER_COMPLETED: {
      name: 'Subtopic Banner Generated',
      progress: 80,
    },
  },
  FINALIZING: {
    name: 'Finalizing Subtopic Generation',
    progress: 100,
  },
};

export const COURSE_GENERATION_STEPS = {
  DESCRIPTION_GENERATION: {
    START: {
      name: 'Starting Course Description Generation',
      progress: 5,
      details: 'Initializing the process to generate the course description.',
    },
    GENERATING: {
      name: 'Generating Course Description',
      progress: 10,
      details: 'Processing the input to generate the course description.',
    },
    COMPLETE: {
      name: 'Course Description Generation Completed',
      progress: 15,
      details: 'Course description has been successfully generated.',
    },
  },
  IMAGE_GENERATION: {
    COURSE: {
      THUMBNAIL: {
        name: 'Generating Course Thumbnail',
        progress: 20,
        details: 'Creating a visually appealing thumbnail for the course.',
      },
      BANNER: {
        name: 'Generating Course Banner',
        progress: 25,
        details: 'Creating a banner image for the course.',
      },
      COMPLETE: {
        name: 'Course Image Generation Completed',
        progress: 30,
        details: 'Thumbnail and banner images for the course have been generated.',
      },
    },
  },
  TOPIC_GENERATION: {
    CONTENT: {
      START: {
        name: 'Starting Topic Content Generation',
        progress: 35,
        details: 'Initializing topic content generation.',
      },
      GENERATING: {
        name: 'Generating Topic Content',
        progress: 40,
        details: 'Generating detailed content for the topic.',
      },
      COMPLETE: {
        name: 'Topic Content Generation Completed',
        progress: 45,
        details: 'Content for the topic has been successfully generated.',
      },
    },
    IMAGE_GENERATION: {
      THUMBNAIL: {
        name: 'Generating Topic Thumbnail',
        progress: 50,
        details: 'Creating a thumbnail image for the topic.',
      },
      BANNER: {
        name: 'Generating Topic Banner',
        progress: 55,
        details: 'Creating a banner image for the topic.',
      },
      COMPLETE: {
        name: 'Topic Image Generation Completed',
        progress: 60,
        details: 'Thumbnail and banner images for the topic have been generated.',
      },
    },
  },
  SUBTOPIC_GENERATION: {
    CONTENT: {
      START: {
        name: 'Starting Subtopic Content Generation',
        progress: 65,
        details: 'Initializing content generation for subtopics.',
      },
      GENERATING: {
        name: 'Generating Subtopic Content',
        progress: 70,
        details: 'Generating detailed content for each subtopic.',
      },
      COMPLETE: {
        name: 'Subtopic Content Generation Completed',
        progress: 75,
        details: 'Content for all subtopics has been successfully generated.',
      },
    },
    IMAGE_GENERATION: {
      THUMBNAIL: {
        name: 'Generating Subtopic Thumbnails',
        progress: 80,
        details: 'Creating thumbnail images for each subtopic.',
      },
      BANNER: {
        name: 'Generating Subtopic Banners',
        progress: 85,
        details: 'Creating banner images for each subtopic.',
      },
      COMPLETE: {
        name: 'Subtopic Image Generation Completed',
        progress: 90,
        details: 'Thumbnails and banners for all subtopics have been generated.',
      },
    },
  },
  FINALIZATION: {
    COMPLETE: {
      name: 'Course Generation Completed',
      progress: 100,
      details: 'The course content, images, and subtopics have been successfully generated.',
    },
  },
};