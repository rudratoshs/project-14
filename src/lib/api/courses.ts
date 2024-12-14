import axios from 'axios';
import axiosRetry from 'axios-retry';
import { Course, CreateCourseData, UpdateCourseData, Subtopic } from '../types/course';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

axios.defaults.baseURL = API_URL;

axiosRetry(axios, {
  retries: 3,
  retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error),
  retryDelay: (retryCount) => retryCount * 1000,
});

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await axios.get('/courses');
    if (response && response.data) {
      return response.data;
    } else {
      console.error('Unexpected API response:', response);
      throw new Error('Invalid response from API');
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getCourse = async (id: string): Promise<Course> => {
  try {
    const response = await axios.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const createCourse = async (data: CreateCourseData): Promise<Course> => {
  try {
    console.log('hit create course api')
    const response = await axios.post('/courses', data);
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (id: string, data: UpdateCourseData): Promise<Course> => {
  try {
    const response = await axios.put(`/courses/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/courses/${id}`);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

export const generateCourseContent = async (courseId: string): Promise<Course> => {
  try {
    const response = await axios.post(`/courses/${courseId}/generate`);
    return response.data;
  } catch (error) {
    console.error('Error generating course content:', error);
    throw error;
  }
};

export const previewCourseContent = async (data: CreateCourseData): Promise<Course> => {
  try {
    const response = await axios.post('/courses/preview', data);
    return response.data;
  } catch (error) {
    console.error('Error previewing course content:', error);
    throw error;
  }
};

export const generateTopicContent = async (
  courseId: string,
  topicId: string,
  topicGenerateType: string = 'full' // Default to 'full'
): Promise<{ jobId: string }> => {
  try {
    const response = await axios.post(`/courses/${courseId}/topics/${topicId}/generate`, {
      topicGenerateType,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating topic content:', error);
    throw error;
  }
};

export const generateSubtopicContent = async (courseId: string, topicId: string, subtopicId: string): Promise<{ jobId: string }> => {
  try {
    const response = await axios.post(`/courses/${courseId}/topics/${topicId}/subtopics/${subtopicId}/generate`);
    return response.data;
  } catch (error) {
    console.error('Error generating subtopic content:', error);
    throw error;
  }
};

export const getSubtopic = async (courseId: string, topicId: string, subtopicId: string): Promise<Subtopic> => {
  try {
    const response = await axios.get(`/courses/${courseId}/topics/${topicId}/subtopics/${subtopicId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subtopic:', error);
    throw error;
  }
};

export const getJobProgress = async (jobId: string) => {
  try {
    const response = await axios.get(`/courses/job/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job progress:', error);
    throw error;
  }
};

export const handleImageUpload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('/courses/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};