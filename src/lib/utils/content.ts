import { Course, Topic, Subtopic } from '@/lib/types/course';
import { CopyBlock, dracula } from 'react-code-blocks';

/**
 * Updates a topic in the course.
 * @param course - The course object containing topics.
 * @param topicId - The ID of the topic to update.
 * @param updates - Partial updates to apply to the topic.
 * @returns Updated list of topics.
 */
export const updateTopicInCourse = (course: Course, topicId: string, updates: Partial<Topic>): Topic[] => {
  return course.topics.map((topic) =>
    topic.id === topicId
      ? { ...topic, ...updates }
      : topic
  );
};

/**
 * Updates a subtopic in the course.
 * @param course - The course object containing topics and subtopics.
 * @param topicId - The ID of the parent topic.
 * @param subtopicId - The ID of the subtopic to update.
 * @param updates - Partial updates to apply to the subtopic.
 * @returns Updated list of topics with nested subtopics.
 */
export const updateSubtopicInCourse = (
  course: Course,
  topicId: string,
  subtopicId: string,
  updates: Partial<Subtopic>
): Topic[] => {
  return course.topics.map((topic) =>
    topic.id === topicId
      ? {
          ...topic,
          subtopics: topic.subtopics?.map((subtopic) =>
            subtopic.id === subtopicId
              ? { ...subtopic, ...updates }
              : subtopic
          ),
        }
      : topic
  );
};