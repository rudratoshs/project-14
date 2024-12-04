import axios from 'axios';
import { Course, CreateCourseData, UpdateCourseData } from '../types/course';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Add JWT token to requests if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await axios.get('/courses');
    return response.data;
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

export const generateTopicContent = async (courseId: string, topicId: string): Promise<{ jobId: string }> => {
  try {
    const response = await axios.post(`/courses/${courseId}/topics/${topicId}/generate`);
    return response.data;
  } catch (error) {
    console.error('Error generating topic content:', error);
    throw error;
  }
};