export interface CreateCourseData {
  title: string;
  description: string;
  type: 'image_theory' | 'video_theory';
  accessibility: 'free' | 'paid' | 'limited';
  numTopics: number;
  subtopics?: string[];
  thumbnail?: string;
  banner?: string;
  courseGenertionType?:'partial' | 'full';
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  type?: 'image_theory' | 'video_theory';
  accessibility?: 'free' | 'paid' | 'limited';
  topics?: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
    status: 'incomplete' | 'complete';
    thumbnail?: string;
    banner?: string;
    subtopics?: Array<{
      id: string;
      title: string;
      content: string;
      order: number;
      status: 'incomplete' | 'complete';
      thumbnail?: string;
      banner?: string;
    }>;
  }>;
  thumbnail?: string;
  banner?: string;
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

export interface Course {
  id: string;
  title: string;
  description: string;
  type: 'image_theory' | 'video_theory';
  accessibility: 'free' | 'paid' | 'limited';
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  thumbnail?: string;
  banner?: string;
}