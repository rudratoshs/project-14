import { model } from '../config/gemini';
import { CreateCourseData } from '../types/course';
import {
  generateCoursePrompt,
  generatePreviewPrompt,
  generateSubtopicContentPrompt,
  generateTextPromptForImage,
  generatePromptForDescription,
  generatePromptForImages
} from '../utils/prompts';
import Course, { ICourse } from '../models/mongodb/Course';
import ImageService from './image.service';
import { jsonrepair } from 'jsonrepair'

export class GeminiService {
  /**
   * Generates content for a specific course topic.
   * @param data - The course data including title, description, and type.
   * @param currentTopicIndex - The index of the topic to generate content for.
   * @returns The generated topic with its subtopics.
   */
  async generateCourseContent(
    data: CreateCourseData,
    currentTopicIndex: number = 0
  ) {
    const prompt = generateCoursePrompt(data, currentTopicIndex);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const parsedContent = await this.safeJsonParse(text);
    const topic = parsedContent.topic;

    return {
      title: topic.title,
      content: currentTopicIndex === 0 ? topic.content || '' : '',
      order: currentTopicIndex + 1,
      status: currentTopicIndex === 0 ? 'complete' : 'incomplete',
      subtopics: topic.subtopics.map((subtopic: any, subIndex: number) => ({
        title: subtopic.title,
        content: currentTopicIndex === 0 ? subtopic.theory : '',
        order: subIndex + 1,
        status: currentTopicIndex === 0 ? 'complete' : 'incomplete',
      })),
    };
  }

  /**
   * Generates a preview for a course.
   * @param data - The course data including title, description, and subtopics.
   * @returns The generated preview topics.
   */
  async generatePreview(data: CreateCourseData) {
    const prompt = generatePreviewPrompt(data);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const parsedContent = await this.safeJsonParse(text); // Use safe JSON parsing

    return {
      topics: parsedContent[data.title.toLowerCase()].map((topic: any) => ({
        title: topic.title,
        content: '',
        subtopics: topic.subtopics.map((subtopic: any) => ({
          title: subtopic.title,
          content: '',
        })),
      })),
    };
  }

  /**
   * Generates content for a specific subtopic.
   * @param courseId - The ID of the course.
   * @param topicId - The ID of the topic.
   * @param subtopicId - The ID of the subtopic.
   * @returns The updated subtopic with generated content.
   */
  async generateSubtopicContent(
    courseId: string,
    topicId: string,
    subtopicId: string
  ): Promise<any> {
    // Fetch the course
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    // Find the topic
    const topic = course.topics.find((t) => String(t.id) === String(topicId));
    if (!topic) throw new Error('Topic not found');

    // Find the subtopic
    const subtopic = topic.subtopics?.find((s) => String(s.id) === String(subtopicId));
    if (!subtopic) throw new Error('Subtopic not found');

    // If subtopic is already complete, return it
    if (subtopic.status === 'complete') return subtopic;

    const unixTimestamp = Math.floor(Date.now() / 1000);

    // Generate subtopic content if missing
    if (!subtopic.content) {
      const subtopicPrompt = generateSubtopicContentPrompt(topic.title, subtopic.title).trim();
      const result = await model.generateContent(subtopicPrompt);
      const response = await result.response;
      const text = await response.text();
      const parsedContent = await this.safeJsonParse(text);

      subtopic.content = parsedContent.content || 'Content not available.';
      subtopic.status = 'complete';
    }

    // Generate subtopic thumbnail and banner if missing
    if (!subtopic.thumbnail) {
      const subtopicTextPrompt = generateTextPromptForImage(subtopic.title, course.title).trim();
      subtopic.thumbnail = await ImageService.generateAndUploadImage(
        subtopicTextPrompt,
        'thumbnail',
        true,
        unixTimestamp
      );
    }

    if (!subtopic.banner) {
      const subtopicTextPrompt = generateTextPromptForImage(subtopic.title, course.title).trim();
      subtopic.banner = await ImageService.generateAndUploadImage(
        subtopicTextPrompt,
        'banner',
        true,
        unixTimestamp
      );
    }

    // Save the course
    await course.save();

    // Return the updated subtopic
    return subtopic;
  }

  /**
   * Generates content for all incomplete subtopics of a topic.
   * @param courseId - The ID of the course.
   * @param topicId - The ID of the topic.
   * @returns The updated topic with completed subtopics.
   */
  async generateTopicContent(courseId: string, topicId: string): Promise<any> {
    const course = await Course.findById(courseId);
    console.log('course', course)
    if (!course) throw new Error('Course not found');

    const topic = course.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error('Topic not found');

    if (topic.status === 'complete') return topic;

    if (!topic.subtopics || topic.subtopics.length === 0) {
      throw new Error('Subtopics not found for this topic');
    }

    const unixTimestamp = Math.floor(Date.now() / 1000);

    // Generate topic-level content if missing
    if (!topic.content || !topic.thumbnail || !topic.banner) {
      const topicPrompt = generateSubtopicContentPrompt(topic.title, topic.title).trim();
      const result = await model.generateContent(topicPrompt);
      const response = await result.response;
      const text = await response.text();
      const parsedContent = await this.safeJsonParse(text);

      topic.content = parsedContent.content || 'Content not available.';

      if (!topic.thumbnail) {
        const topicTextPrompt = generateTextPromptForImage(topic.title, course.title).trim();
        topic.thumbnail = await ImageService.generateAndUploadImage(
          topicTextPrompt,
          'thumbnail',
          true,
          unixTimestamp
        );
      }

      if (!topic.banner) {
        const topicTextPrompt = generateTextPromptForImage(topic.title, course.title).trim();
        topic.banner = await ImageService.generateAndUploadImage(
          topicTextPrompt,
          'banner',
          true,
          unixTimestamp
        );
      }
    }

    // Process subtopics
    await Promise.allSettled(
      topic.subtopics.map(async (subtopic) => {
        if (subtopic.status === 'incomplete' || !subtopic.content) {
          const subtopicPrompt = generateSubtopicContentPrompt(topic.title, subtopic.title).trim();
          const result = await model.generateContent(subtopicPrompt);
          const response = await result.response;
          const text = await response.text();
          const parsedContent = await this.safeJsonParse(text);

          subtopic.content = parsedContent.content || 'Content not available.';
          subtopic.status = 'complete';

          if (!subtopic.thumbnail) {
            const subtopicTextPrompt = generateTextPromptForImage(subtopic.title, course.title).trim();
            subtopic.thumbnail = await ImageService.generateAndUploadImage(
              subtopicTextPrompt,
              'thumbnail',
              true,
              unixTimestamp
            );
          }

          if (!subtopic.banner) {
            const subtopicTextPrompt = generateTextPromptForImage(subtopic.title, course.title).trim();
            subtopic.banner = await ImageService.generateAndUploadImage(
              subtopicTextPrompt,
              'banner',
              true,
              unixTimestamp
            );
          }
        }
      })
    );

    // Update topic status if all subtopics are complete
    if (topic.subtopics.every((s) => s.status === 'complete')) {
      topic.status = 'complete';
    }

    // Save the updated course
    await course.save();
    return topic;
  }

  /**
   * Parses and cleans AI-generated content.
   * @param rawText - The raw text generated by the model.
   * @returns Parsed and cleaned JSON content.
   */
  async parseGeneratedContent(rawText: string): Promise<any> {
    const cleanedText = await this.safeJsonParse(rawText);
    return JSON.parse(cleanedText);
  }

  /**
   * Handles subtopics with failed content generation.
   * @param courseId - The ID of the course.
   * @param topicId - The ID of the topic.
   * @returns The updated topic with retried subtopics.
   */
  async handleFailedSubtopics(courseId: string, topicId: string): Promise<any> {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const topic = course.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error('Topic not found');

    if (!topic.subtopics || topic.subtopics.length === 0) {
      throw new Error('Subtopics not found for this topic');
    }

    const failedSubtopics = topic.subtopics.filter(
      (sub) =>
        sub.content ===
        'Content generation failed due to invalid response format.'
    );

    if (failedSubtopics.length === 0) {
      return topic; // No failed subtopics, return the topic as is
    }

    await Promise.all(
      failedSubtopics.map(async (subtopic) => {
        const prompt = generateSubtopicContentPrompt(
          topic.title,
          subtopic.title
        );
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        const parsedContent = await this.parseGeneratedContent(text);

        subtopic.content =
          parsedContent.content || 'Content generation failed.';
        subtopic.status = 'complete';
      })
    );

    await course.save();
    return topic;
  }

  async generateCourseContentWithImages(
    data: CreateCourseData,
    currentTopicIndex: number = 0
  ) {
    const prompt = generateCoursePrompt(data, currentTopicIndex);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    console.log('Raw Generated Content:', text);
    const parsedContent = await this.safeJsonParse(text);
    const topic = parsedContent.topic;

    let topicThumbnail = '';
    let topicBanner = '';
    const unixTimestamp = Math.floor(Date.now() / 1000);

    if (currentTopicIndex === 0) {
      const topicTextPrompt = generateTextPromptForImage(topic.title, data.title).trim();
      topicThumbnail = await ImageService.generateAndUploadImage(topicTextPrompt, 'thumbnail', true, unixTimestamp);
      topicBanner = await ImageService.generateAndUploadImage(topicTextPrompt, 'banner', true, unixTimestamp);
    }

    const subtopics = await Promise.all(
      topic.subtopics.map(async (subtopic: any, subIndex: number) => {
        let subtopicThumbnail = '';
        let subtopicBanner = '';

        if (currentTopicIndex === 0) {
          const subtopicTextPrompt = generateTextPromptForImage(subtopic.title, data.title).trim();
          subtopicThumbnail = await ImageService.generateAndUploadImage(subtopicTextPrompt, 'thumbnail', true, unixTimestamp);
          subtopicBanner = await ImageService.generateAndUploadImage(subtopicTextPrompt, 'banner', true, unixTimestamp);
        }

        return {
          title: subtopic.title,
          content: currentTopicIndex === 0 ? subtopic.theory : '',
          order: subIndex + 1,
          status: currentTopicIndex === 0 ? 'complete' : 'incomplete',
          thumbnail: subtopicThumbnail,
          banner: subtopicBanner,
        };
      })
    );

    return {
      title: topic.title,
      content: currentTopicIndex === 0 ? topic.theory || '' : '',
      order: currentTopicIndex + 1,
      status: currentTopicIndex === 0 ? 'complete' : 'incomplete',
      thumbnail: currentTopicIndex === 0 ? topicThumbnail : '',
      banner: currentTopicIndex === 0 ? topicBanner : '',
      subtopics,
    };
  }

  async generateMainCourseContent(description: string, courseTitle: string): Promise<{ description: string; thumbnail: string; banner: string }> {
    const descriptionPrompt = generatePromptForDescription(description);

    const result = await model.generateContent(descriptionPrompt);
    const response = await result.response;
    const text = await response.text();
    const expandedDescription = text.trim();

    const imagePrompt = generatePromptForImages(courseTitle);
    const unixTimestamp = Math.floor(Date.now() / 1000);

    const thumbnail = await ImageService.generateAndUploadImage(imagePrompt, 'thumbnail', true, unixTimestamp);
    const banner = await ImageService.generateAndUploadImage(imagePrompt, 'banner', true, unixTimestamp);

    return { description: expandedDescription, thumbnail, banner };
  }

  /**
 * Safely parses a JSON string with error handling.
 * @param rawText - The raw JSON string to parse.
 * @returns Parsed JSON object.
 */
  async safeJsonParse(rawText: string): Promise<any> {
    let cleanedText = '';
    try {

      cleanedText = rawText.replace(/```json\n?|\n?```/g, '').trim();
      let repaired = jsonrepair(cleanedText)
      return JSON.parse(repaired);

    } catch (error) {
      console.error('JSON Parse Error:', error.message);
      console.error('Raw Input:', rawText);
      console.error('Cleaned JSON:', cleanedText);

      throw new Error('Failed to parse JSON content. Ensure the format is correct.');
    }
  }
}

export default new GeminiService();
