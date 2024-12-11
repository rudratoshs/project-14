import { useState } from 'react';
import { Course, Topic, Subtopic } from '@/lib/types/course';
import { updateCourse, generateTopicContent, generateSubtopicContent } from '@/lib/api/courses';
import { updateTopicInCourse, updateSubtopicInCourse } from '@/lib/utils/content';

interface UseCourseActionsProps {
  course: Course | null;
  setCourse: (course: Course | null) => void;
  setGeneratingTopicId: (id: string | null) => void;
  setGeneratingSubtopicId: (id: string | null) => void;
  setGeneratingSubtopicJobId: (id: string | null) => void;
  setSelectedTopic: (topic: Topic | null) => void;
  toast: any;
}

export function useCourseActions({
  course,
  setCourse,
  setGeneratingTopicId,
  setGeneratingSubtopicId,
  setGeneratingSubtopicJobId,
  setSelectedTopic,
  toast,
}: UseCourseActionsProps) {
  const handleUpdateCourse = async (data: Partial<Course>) => {
    try {
      if (!course?.id) return;
      await updateCourse(course.id, data);
      setCourse(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: 'Success',
        description: 'Course updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update course',
      });
    }
  };

  const handleUpdateTopic = async (topicId: string, data: Partial<Topic>) => {
    try {
      if (!course?.id) return;
      const updatedTopics = updateTopicInCourse(course, topicId, data);
      await updateCourse(course.id, { topics: updatedTopics });
      setCourse(prev => prev ? { ...prev, topics: updatedTopics } : null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update topic',
      });
    }
  };

  const handleUpdateSubtopic = async (topicId: string, subtopicId: string, data: Partial<Subtopic>) => {
    try {
      if (!course?.id) return;
      const updatedTopics = updateSubtopicInCourse(course, topicId, subtopicId, data);
      await updateCourse(course.id, { topics: updatedTopics });
      setCourse(prev => prev ? { ...prev, topics: updatedTopics } : null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update subtopic',
      });
    }
  };

  const handleGenerateContent = async (topic: Topic) => {
    try {
      if (!course?.id) return;
      setGeneratingTopicId(topic.id);
      const response = await generateTopicContent(course.id, topic.id);
      if (response.jobId) {
        const updatedTopics = updateTopicInCourse(course, topic.id, { jobId: response.jobId });
        setCourse(prev => prev ? { ...prev, topics: updatedTopics } : null);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate topic content'
      });
      setGeneratingTopicId(null);
    }
  };

  const handleGenerateSubtopicContent = async (course: Course, topic: Topic, subtopic: Subtopic) => {
    try {
      if (!course.id) return;
      setGeneratingSubtopicId(subtopic.id);
      setSelectedTopic(topic);
      const response = await generateSubtopicContent(course.id, topic.id, subtopic.id);
      setGeneratingSubtopicJobId(response.jobId);

      if (response.jobId) {
        const updatedTopics = updateSubtopicInCourse(course, topic.id, subtopic.id, { jobId: response.jobId });
        setCourse(prev => prev ? { ...prev, topics: updatedTopics } : null);
      }
    } catch (error) {
      console.error('Error generating subtopic content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate subtopic content',
      });
      setGeneratingSubtopicJobId(null);
    }
  };

  return {
    handleUpdateCourse,
    handleUpdateTopic,
    handleUpdateSubtopic,
    handleGenerateContent,
    handleGenerateSubtopicContent,
  };
}