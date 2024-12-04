export interface Course {
  id: string;
  title: string;
  description: string;
  type: 'image_theory' | 'video_theory';
  accessibility: 'free' | 'paid' | 'limited';
  thumbnail?: string;
  banner?: string;
  topics: Topic[];
  jobId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  order: number;
  status: 'incomplete' | 'complete';
  thumbnail?: string;
  banner?: string;
  subtopics?: Subtopic[];
}

export interface Subtopic {
  id: string;
  title: string;
  content: string;
  order: number;
  status: 'incomplete' | 'complete';
  thumbnail?: string;
  banner?: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  type: 'image_theory' | 'video_theory';
  accessibility: 'free' | 'paid' | 'limited';
  numTopics: number;
  subtopics?: string[];
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  type?: 'image_theory' | 'video_theory';
  accessibility?: 'free' | 'paid' | 'limited';
  topics?: Topic[];
}