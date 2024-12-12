import { PrismaClient } from '@prisma/client';
import Course, { ICourse } from '../models/mongodb/Course';
import { CreateCourseData, UpdateCourseData } from '../types/course';
import prisma from '../config/prisma';
import geminiService from './gemini.service';
import ImageService from './image.service';
import { updateJobProgress } from '../utils/progress';
import { TOPIC_GENERATION_STEPS } from '../types/job';

export class CourseService {
  /**
 * Creates a new course with topics, storing it in MongoDB and referencing it in MySQL.
 * @param userId - ID of the user creating the course.
 * @param data - Data for creating the course.
 * @returns The created course document.
 */
  async createCourse(userId: string, data: CreateCourseData, jobId: string): Promise<ICourse> {
    let mongoCourse: ICourse | null = null;
    let description = '';
    let thumbnail = '';
    let banner = '';

    try {
      const topics: any[] = [];
      for (let i = 0; i < data.numTopics; i++) {
        const generatedTopic = await geminiService.generateCoursePartially(data, jobId, i);
        if (i == 0) {
          description = generatedTopic.description
          thumbnail = generatedTopic.thumbnail
          banner = generatedTopic.banner
        }

        topics.push({
          title: generatedTopic.title,
          content: generatedTopic.content,
          order: generatedTopic.order,
          status: generatedTopic.status,
          subtopics: generatedTopic.subtopics,
          thumbnail: i === 0 ? generatedTopic.thumbnail : '',
          banner: i === 0 ? generatedTopic.banner : '',
        });
      }

      mongoCourse = await Course.create({
        userId,
        title: data.title,
        description,
        type: data.type,
        accessibility: data.accessibility,
        topics,
        thumbnail,
        banner,
      });

      if (!mongoCourse._id) {
        throw new Error('MongoDB Course creation failed: Missing _id');
      }

      // Reference course in MySQL
      await prisma.course.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          accessibility: data.accessibility,
          userId: userId,
          mongoId: mongoCourse._id.toString(),
        },
      });

      return mongoCourse;
    } catch (error) {
      // Rollback in MongoDB if MySQL insertion fails
      if (mongoCourse) {
        try {
          await Course.findByIdAndDelete(mongoCourse._id);
        } catch {
          // Suppress errors during rollback
        }
      }
      throw error;
    }
  }

  /**
   * Retrieves all courses for a specific user.
   * @param userId - ID of the user.
   * @returns List of user's courses.
   */
  async getUserCourses(userId: string): Promise<ICourse[]> {
    const userCourses = await prisma.course.findMany({
      where: { userId },
      select: { mongoId: true },
    });

    const mongoIds = userCourses.map((course) => course.mongoId);
    return Course.find({ _id: { $in: mongoIds } });
  }

  /**
   * Retrieves a course by its ID.
   * @param courseId - ID of the course.
   * @returns The course document or null if not found.
   */
  async getCourseById(courseId: string): Promise<ICourse | null> {
    return Course.findById(courseId);
  }

  /**
   * Updates a course's information in MongoDB and MySQL.
   * @param courseId - ID of the course to update.
   * @param data - Updated course data.
   * @returns The updated course document or null if not found.
   */
  async updateCourse(
    courseId: string,
    data: UpdateCourseData
  ): Promise<ICourse | null> {
    const course = await Course.findByIdAndUpdate(courseId, data, {
      new: true,
    });
    console.log('course', course)

    if (course) {
      await prisma.course.update({
        where: { mongoId: courseId },
        data: {
          title: data.title,
          description: data.content,
          type: data.type,
          accessibility: data.accessibility,
        },
      });
    }

    return course;
  }

  /**
   * Deletes a course from MongoDB and removes its reference from MySQL.
   * @param userId - ID of the user deleting the course.
   * @param courseId - ID of the course to delete.
   */
  async deleteCourse(userId: string, courseId: string): Promise<void> {
    await Course.findByIdAndDelete(courseId);
    await prisma.course.delete({
      where: {
        mongoId: courseId,
        userId: userId,
      },
    });
  }

  /**
   * Generates a preview of the course content.
   * @param data - Data for previewing the course.
   * @returns Previewed course content.
   */
  async previewCourse(data: CreateCourseData) {
    return geminiService.generatePreview(data);
  }

  /**
   * Generates and updates the content for a specific topic in a course.
   * @param courseId - ID of the course containing the topic.
   * @param topicId - ID of the topic to generate content for.
   * @returns The updated topic.
   */
  /**
 * Generates and updates the content for a specific topic in a course.
 * @param courseId - ID of the course containing the topic.
 * @param topicId - ID of the topic to generate content for.
 * @param jobId - Job ID for progress tracking.
 * @returns The updated topic.
 */
  async generateTopicContent(
    courseId: string,
    topicId: string,
    jobId: string,
    topicGenerateType: string
  ): Promise<any> {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const topic = course.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error('Topic not found');

    if (topic.status === 'complete') return topic;

    try {
      const generatedContent = await geminiService.generateTopicContent(
        courseId,
        topicId,
        jobId,
        topic.title,
        course.title,
        topicGenerateType
      );

      Object.assign(topic, {
        content: generatedContent.content,
        thumbnail: generatedContent.thumbnail,
        banner: generatedContent.banner,
      });

      if (topicGenerateType === 'full' && topic.subtopics?.length) {
        const totalSubtopics = topic.subtopics.length;
        let subtopicsCompleted = 0;

        for (const subtopic of topic.subtopics) {
          if (subtopic.status === 'incomplete') {
            await updateJobProgress(jobId, {
              progress: TOPIC_GENERATION_STEPS.CONTENT_GENERATION.SUBTOPIC_CONTENT.progress,
              currentStep: 'Generating subtopic content',
              details: {
                subtopicsCompleted,
                totalSubtopics,
                currentSubtopic: subtopic.title,
              },
            });

            const generatedSubtopic = await geminiService.generateSubtopicContent(
              courseId,
              topicId,
              subtopic.id,
              jobId
            );

            Object.assign(subtopic, {
              content: generatedSubtopic.content,
              thumbnail: generatedSubtopic.thumbnail,
              banner: generatedSubtopic.banner,
              status: 'complete',
            });

            subtopicsCompleted++;
          }
        }
      }

      if (topic.subtopics?.every((s) => s.status === 'complete')) {
        topic.status = 'complete';
      }

      course.markModified('topics');
      await course.save();

      return topic;
    } catch (error) {
      console.error(`Error generating topic content for topicId ${topicId}:`, error);
      throw new Error('Failed to generate topic content');
    }
  }

  /**
 * Generates and updates the content for a specific subtopic in a topic of a course.
 * @param courseId - ID of the course containing the topic.
 * @param topicId - ID of the topic containing the subtopic.
 * @param subtopicId - ID of the subtopic to generate content for.
 * @returns The updated subtopic.
 */
  async generateSubtopicContent(courseId: string, topicId: string, subtopicId: string, jobId: string): Promise<any> {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const topic = course.topics.find((t) => String(t.id) === String(topicId));
    if (!topic) throw new Error('Topic not found');

    const subtopic = topic.subtopics?.find((s) => String(s.id) === String(subtopicId));
    if (!subtopic) throw new Error('Subtopic not found');

    let generatedContent = null;

    if (subtopic.status === 'incomplete') {
      generatedContent = await geminiService.generateSubtopicContent(courseId, topicId, subtopicId, jobId);

      if (!generatedContent || !generatedContent.content) {
        throw new Error('Failed to generate content for the subtopic');
      }

      subtopic.content = generatedContent.content || subtopic.content;
      subtopic.thumbnail = generatedContent.thumbnail || subtopic.thumbnail;
      subtopic.banner = generatedContent.banner || subtopic.banner;

      subtopic.status = 'complete';

      course.markModified('topics');
    } else {
      console.log('Subtopic status is already complete.');
    }

    await course.save();
    return subtopic;
  }

  async testImageGeneration(): Promise<void> {
    const prompt =
      'Explore AngularJS Basics: Visualize Data Binding with practical examples. Dive into dynamic web development with engaging, colorful graphics!';
    const size = 'banner';

    try {
      console.log('Starting test for generateAndUploadImage...');
      const unixTimestamp = Math.floor(Date.now() / 1000);
      const imageUrl = await ImageService.generateAndUploadImage(prompt, size, true, unixTimestamp);
      console.log('Test successful. Generated Image URL:', imageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Test failed:', errorMessage);
    }
  }
  /**
 * Retrieves a specific subtopic by its ID.
 * @param courseId - ID of the course.
 * @param topicId - ID of the topic.
 * @param subtopicId - ID of the subtopic.
 * @returns The requested subtopic.
 */
  async getSubtopicById(courseId: string, topicId: string, subtopicId: string) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const topic = course.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error('Topic not found');

    const subtopic = topic.subtopics?.find((s) => s.id === subtopicId);
    if (!subtopic) throw new Error('Subtopic not found');

    return subtopic;
  }
}

export default new CourseService();
