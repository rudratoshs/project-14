import { PrismaClient } from '@prisma/client';
import Course, { ICourse } from '../models/mongodb/Course';
import { CreateCourseData, UpdateCourseData } from '../types/course';
import prisma from '../config/prisma';
import geminiService from './gemini.service';
import ImageService from './image.service';


export class CourseService {
  /**
   * Creates a new course with topics, storing it in MongoDB and referencing it in MySQL.
   * @param userId - ID of the user creating the course.
   * @param data - Data for creating the course.
   * @returns The created course document.
   */
  async createCourse(userId: string, data: CreateCourseData): Promise<ICourse> {
    let mongoCourse: ICourse | null = null;

    try {
      const { description, thumbnail, banner } = await geminiService.generateMainCourseContent(data.description, data.title);

      const topics: any[] = [];
      for (let i = 0; i < data.numTopics; i++) {
        const generatedTopic = await geminiService.generateCourseContentWithImages(
          data,
          i
        );
        topics.push(generatedTopic);
      }
      mongoCourse = await Course.create({
        userId,
        title: data.title,
        description: description,
        type: data.type,
        accessibility: data.accessibility,
        topics,
        thumbnail: thumbnail,
        banner: banner
      });

      if (!mongoCourse._id) {
        throw new Error('MongoDB Course creation failed: Missing _id');
      }

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
      if (mongoCourse) {
        try {
          await Course.findByIdAndDelete(mongoCourse._id);
        } catch { }
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

    if (course) {
      await prisma.course.update({
        where: { mongoId: courseId },
        data: {
          title: data.title,
          description: data.description,
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
  async generateTopicContent(courseId: string, topicId: string): Promise<any> {
    console.log('Passed courseId:', courseId);
    console.log('Passed topicId:', topicId);

    // Fetch the course
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    console.log('Course topics:', course.topics.map(t => t.id));

    // Find the topic by ID
    const topic = course.topics.find((t) => String(t.id) === String(topicId));
    if (!topic) throw new Error('Topic not found');

    let generatedContent = null;

    // Check if topic status is incomplete
    if (topic.status === 'incomplete') {
      console.log('Topic status is incomplete. Generating content for the topic...');
      generatedContent = await geminiService.generateTopicContent(courseId, topicId);

      if (!generatedContent || !generatedContent.subtopics) {
        throw new Error('Failed to generate content for topic or subtopics');
      }

      // Update topic-level content
      topic.content = generatedContent.content || topic.content;
      topic.thumbnail = generatedContent.thumbnail || topic.thumbnail;
      topic.banner = generatedContent.banner || topic.banner;

      // Update subtopics content
      const subtopics = topic.subtopics ?? [];
      generatedContent.subtopics.forEach((generatedSubtopic: any) => {
        const subtopic = subtopics.find((s) => String(s.id) === String(generatedSubtopic.id));
        if (subtopic) {
          subtopic.status = generatedSubtopic.status;
          subtopic.content = generatedSubtopic.content;
        }
      });

      // Mark topics as modified
      course.markModified('topics');
    } else {
      console.log('Topic status is already complete. Checking subtopics...');
    }

    // Check for incomplete subtopics
    const incompleteSubtopics = topic.subtopics?.filter((s) => s.status === 'incomplete') || [];
    if (incompleteSubtopics.length === 0) {
      console.log('No incomplete subtopics found. Marking topic as complete.');
      topic.status = 'complete';
    }

    // Save the course
    await course.save();

    // Return the updated topic
    return topic;
  }

  /**
 * Generates and updates the content for a specific subtopic in a topic of a course.
 * @param courseId - ID of the course containing the topic.
 * @param topicId - ID of the topic containing the subtopic.
 * @param subtopicId - ID of the subtopic to generate content for.
 * @returns The updated subtopic.
 */
  async generateSubtopicContent(courseId: string, topicId: string, subtopicId: string): Promise<any> {
    console.log('Passed courseId:', courseId);
    console.log('Passed topicId:', topicId);
    console.log('Passed subtopicId:', subtopicId);

    // Fetch the course
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    console.log('Course topics:', course.topics.map(t => t.id));

    // Find the topic by ID
    const topic = course.topics.find((t) => String(t.id) === String(topicId));
    if (!topic) throw new Error('Topic not found');

    // Find the subtopic by ID
    const subtopic = topic.subtopics?.find((s) => String(s.id) === String(subtopicId));
    if (!subtopic) throw new Error('Subtopic not found');

    let generatedContent = null;

    // Check if subtopic status is incomplete
    if (subtopic.status === 'incomplete') {
      console.log('Subtopic status is incomplete. Generating content for the subtopic...');
      generatedContent = await geminiService.generateSubtopicContent(courseId, topicId, subtopicId);

      if (!generatedContent || !generatedContent.content) {
        throw new Error('Failed to generate content for the subtopic');
      }

      // Update subtopic-level content
      subtopic.content = generatedContent.content || subtopic.content;
      subtopic.thumbnail = generatedContent.thumbnail || subtopic.thumbnail;
      subtopic.banner = generatedContent.banner || subtopic.banner;

      // Mark subtopic as complete
      subtopic.status = 'complete';

      // Mark topics as modified
      course.markModified('topics');
    } else {
      console.log('Subtopic status is already complete.');
    }

    // Save the course
    await course.save();

    // Return the updated subtopic
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
    } catch (error) {
      console.error('Test failed:', error.message);
    }
  }
  async getSubtopicById(courseId: string, topicId: string, subtopicId: string) {
    try {
      const course = await Course.findById(courseId);

      if (!course) {
        throw new Error('Course not found');
      }

      const topic = course.topics.find((t) => t.id === topicId);
      if (!topic) {
        throw new Error('Topic not found');
      }

      const subtopic = topic.subtopics?.find((s) => s.id === subtopicId);
      if (!subtopic) {
        throw new Error('Subtopic not found');
      }

      return subtopic;
    } catch (error) {
      console.error('Error fetching subtopic:', error);
      throw error;
    }
  }
}

export default new CourseService();
