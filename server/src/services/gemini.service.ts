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
import { TOPIC_GENERATION_STEPS, SUBTOPIC_GENERATION_STEPS, COURSE_GENERATION_STEPS } from '../types/job';
import { TopicGenerationResult, SubtopicGenerationResult, GenerationProgress } from '../types/generation';
import { updateJobProgress } from '../utils/progress';

export class GeminiService {
  async generateCoursePartially(
    data: CreateCourseData,
    jobId: string,
    currentTopicIndex: number = 0
  ): Promise<{
    description: string;
    thumbnail: string;
    banner: string;
    title: string;
    content: string;
    order: number;
    status: string;
    subtopics: any[];
  }> {
    try {
      const unixTimestamp = Math.floor(Date.now() / 1000);

      // Generate course description and main images if this is the first topic
      let courseDescription = '';
      let courseThumbnail = '';
      let courseBanner = '';

      if (currentTopicIndex === 0) {
        await updateJobProgress(jobId, {
          progress: COURSE_GENERATION_STEPS.DESCRIPTION_GENERATION.START.progress,
          currentStep: COURSE_GENERATION_STEPS.DESCRIPTION_GENERATION.START.name,
          details: {
            courseName: `Generating description for course: ${data.title}`,
          },
        });

        const descriptionPrompt = generatePromptForDescription(data.description);
        const descriptionResult = await model.generateContent(descriptionPrompt);
        const descriptionResponse = await descriptionResult.response;
        const descriptionText = await descriptionResponse.text();
        courseDescription = descriptionText.trim();

        await updateJobProgress(jobId, {
          progress: COURSE_GENERATION_STEPS.DESCRIPTION_GENERATION.COMPLETE.progress,
          currentStep: COURSE_GENERATION_STEPS.DESCRIPTION_GENERATION.COMPLETE.name,
          details: {
            courseName: `Description generated for course: ${data.title}`,
          },
        });

        // Generate main images
        const imagePrompt = generatePromptForImages(data.title);

        await updateJobProgress(jobId, {
          progress: COURSE_GENERATION_STEPS.IMAGE_GENERATION.COURSE.THUMBNAIL.progress,
          currentStep: COURSE_GENERATION_STEPS.IMAGE_GENERATION.COURSE.THUMBNAIL.name,
          details: {
            currentImage: `Generating course thumbnail for: ${data.title}`,
          },
        });

        courseThumbnail = await ImageService.generateAndUploadImage(imagePrompt, 'thumbnail', true, unixTimestamp);

        await updateJobProgress(jobId, {
          progress: COURSE_GENERATION_STEPS.IMAGE_GENERATION.COURSE.BANNER.progress,
          currentStep: COURSE_GENERATION_STEPS.IMAGE_GENERATION.COURSE.BANNER.name,
          details: {
            currentImage: `Generating course banner for: ${data.title}`,
          },
        });

        courseBanner = await ImageService.generateAndUploadImage(imagePrompt, 'banner', true, unixTimestamp);

        await updateJobProgress(jobId, {
          progress: COURSE_GENERATION_STEPS.IMAGE_GENERATION.COURSE.COMPLETE.progress,
          currentStep: COURSE_GENERATION_STEPS.IMAGE_GENERATION.COURSE.COMPLETE.name,
          details: {
            courseName: `Images generated for course: ${data.title}`,
          },
        });
      }

      // Generate topic content
      await updateJobProgress(jobId, {
        progress: COURSE_GENERATION_STEPS.TOPIC_GENERATION.CONTENT.START.progress,
        currentStep: COURSE_GENERATION_STEPS.TOPIC_GENERATION.CONTENT.START.name,
        details: {
          currentTopic: `Generating content for topic in course: ${data.title}`,
        },
      });

      const topicPrompt = generateCoursePrompt(data, currentTopicIndex);
      const topicResult = await model.generateContent(topicPrompt);
      const topicResponse = await topicResult.response;
      const topicText = await topicResponse.text();
      const parsedContent = await this.safeJsonParse(topicText);
      const topic = parsedContent.topic;

      let topicThumbnail = '';
      let topicBanner = '';

      if (currentTopicIndex === 0) {
        const topicImagePrompt = generateTextPromptForImage(topic.title, data.title).trim();

        await updateJobProgress(jobId, {
          progress: COURSE_GENERATION_STEPS.TOPIC_GENERATION.IMAGE_GENERATION.THUMBNAIL.progress,
          currentStep: COURSE_GENERATION_STEPS.TOPIC_GENERATION.IMAGE_GENERATION.THUMBNAIL.name,
          details: {
            currentImage: `Generating topic thumbnail for: ${topic.title}`,
          },
        });

        topicThumbnail = await ImageService.generateAndUploadImage(topicImagePrompt, 'thumbnail', true, unixTimestamp);

        await updateJobProgress(jobId, {
          progress: COURSE_GENERATION_STEPS.TOPIC_GENERATION.IMAGE_GENERATION.BANNER.progress,
          currentStep: COURSE_GENERATION_STEPS.TOPIC_GENERATION.IMAGE_GENERATION.BANNER.name,
          details: {
            currentImage: `Generating topic banner for: ${topic.title}`,
          },
        });

        topicBanner = await ImageService.generateAndUploadImage(topicImagePrompt, 'banner', true, unixTimestamp);

        await updateJobProgress(jobId, {
          progress: COURSE_GENERATION_STEPS.TOPIC_GENERATION.IMAGE_GENERATION.COMPLETE.progress,
          currentStep: COURSE_GENERATION_STEPS.TOPIC_GENERATION.IMAGE_GENERATION.COMPLETE.name,
          details: {
            currentTopic: `Images generated for topic: ${topic.title}`,
          },
        });
      }

      // Generate subtopics with images
      const subtopics = await Promise.all(
        topic.subtopics.map(async (subtopic: any, subIndex: number) => {
          let subtopicThumbnail = '';
          let subtopicBanner = '';

          if (currentTopicIndex === 0) {
            const subtopicImagePrompt = generateTextPromptForImage(subtopic.title, data.title).trim();

            await updateJobProgress(jobId, {
              progress: COURSE_GENERATION_STEPS.SUBTOPIC_GENERATION.IMAGE_GENERATION.THUMBNAIL.progress,
              currentStep: COURSE_GENERATION_STEPS.SUBTOPIC_GENERATION.IMAGE_GENERATION.THUMBNAIL.name,
              details: {
                currentImage: `Generating subtopic thumbnail for: ${subtopic.title}`,
              },
            });

            subtopicThumbnail = await ImageService.generateAndUploadImage(subtopicImagePrompt, 'thumbnail', true, unixTimestamp);

            await updateJobProgress(jobId, {
              progress: COURSE_GENERATION_STEPS.SUBTOPIC_GENERATION.IMAGE_GENERATION.BANNER.progress,
              currentStep: COURSE_GENERATION_STEPS.SUBTOPIC_GENERATION.IMAGE_GENERATION.BANNER.name,
              details: {
                currentImage: `Generating subtopic banner for: ${subtopic.title}`,
              },
            });

            subtopicBanner = await ImageService.generateAndUploadImage(subtopicImagePrompt, 'banner', true, unixTimestamp);

            await updateJobProgress(jobId, {
              progress: COURSE_GENERATION_STEPS.SUBTOPIC_GENERATION.IMAGE_GENERATION.COMPLETE.progress,
              currentStep: COURSE_GENERATION_STEPS.SUBTOPIC_GENERATION.IMAGE_GENERATION.COMPLETE.name,
              details: {
                currentSubtopic: `Images generated for subtopic: ${subtopic.title}`,
              },
            });
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

      await updateJobProgress(jobId, {
        progress: COURSE_GENERATION_STEPS.TOPIC_GENERATION.CONTENT.COMPLETE.progress,
        currentStep: COURSE_GENERATION_STEPS.TOPIC_GENERATION.CONTENT.COMPLETE.name,
        details: {
          currentTopic: `Topic content generation complete for: ${topic.title}`,
        },
      });

      await updateJobProgress(jobId, {
        progress: COURSE_GENERATION_STEPS.FINALIZATION.COMPLETE.progress,
        currentStep: COURSE_GENERATION_STEPS.FINALIZATION.COMPLETE.name,
        details: {
          courseName: `Course generation complete for: ${data.title}`,
        },
      });

      return {
        description: courseDescription,
        thumbnail: courseThumbnail,
        banner: courseBanner,
        title: topic.title,
        content: currentTopicIndex === 0 ? topic.theory || '' : '',
        order: currentTopicIndex + 1,
        status: currentTopicIndex === 0 ? 'complete' : 'incomplete',
        subtopics,
      };
    } catch (error) {
      console.error('Error in generateCourseWithContentAndImages:', error);
      await updateJobProgress(jobId, {
        progress: 0,
        currentStep: 'Error',
        error: `Failed to generate course content: ${error.message}`,
      });
      throw error;
    }
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
    subtopicId: string,
    jobId: string
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

    // Initialize progress
    await updateJobProgress(jobId, {
      progress: SUBTOPIC_GENERATION_STEPS.INITIALIZING.progress,
      currentStep: SUBTOPIC_GENERATION_STEPS.INITIALIZING.name,
      details: { currentSubtopic: `Initializing generation for: ${subtopic.title}` },
    });

    // Generate subtopic content if missing
    if (!subtopic.content) {
      await updateJobProgress(jobId, {
        progress: SUBTOPIC_GENERATION_STEPS.CONTENT_GENERATION.START.progress,
        currentStep: SUBTOPIC_GENERATION_STEPS.CONTENT_GENERATION.START.name,
        details: { currentSubtopic: `Generating content for: ${subtopic.title}` },
      });

      const subtopicPrompt = generateSubtopicContentPrompt(topic.title, subtopic.title).trim();
      const result = await model.generateContent(subtopicPrompt);
      const response = await result.response;
      const text = await response.text();
      const parsedContent = await this.safeJsonParse(text);

      subtopic.content = parsedContent.content || 'Content not available.';
      subtopic.status = 'complete';

      await updateJobProgress(jobId, {
        progress: SUBTOPIC_GENERATION_STEPS.CONTENT_GENERATION.COMPLETED.progress,
        currentStep: SUBTOPIC_GENERATION_STEPS.CONTENT_GENERATION.COMPLETED.name,
        details: { currentSubtopic: `Content generated for: ${subtopic.title}` },
      });
    }

    // Generate subtopic thumbnail if missing
    if (!subtopic.thumbnail) {
      await updateJobProgress(jobId, {
        progress: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.START_THUMBNAIL.progress,
        currentStep: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.START_THUMBNAIL.name,
        details: { currentImage: `Generating thumbnail for: ${subtopic.title}` },
      });

      const subtopicTextPrompt = generateTextPromptForImage(subtopic.title, course.title).trim();
      subtopic.thumbnail = await ImageService.generateAndUploadImage(
        subtopicTextPrompt,
        'thumbnail',
        true,
        unixTimestamp
      );

      await updateJobProgress(jobId, {
        progress: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.THUMBNAIL_COMPLETED.progress,
        currentStep: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.THUMBNAIL_COMPLETED.name,
        details: { currentImage: `Thumbnail generated for: ${subtopic.title}` },
      });
    }

    // Generate subtopic banner if missing
    if (!subtopic.banner) {
      await updateJobProgress(jobId, {
        progress: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.START_BANNER.progress,
        currentStep: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.START_BANNER.name,
        details: { currentImage: `Generating banner for: ${subtopic.title}` },
      });

      const subtopicTextPrompt = generateTextPromptForImage(subtopic.title, course.title).trim();
      subtopic.banner = await ImageService.generateAndUploadImage(
        subtopicTextPrompt,
        'banner',
        true,
        unixTimestamp
      );

      await updateJobProgress(jobId, {
        progress: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.BANNER_COMPLETED.progress,
        currentStep: SUBTOPIC_GENERATION_STEPS.IMAGE_GENERATION.BANNER_COMPLETED.name,
        details: { currentImage: `Banner generated for: ${subtopic.title}` },
      });
    }

    // Finalize progress
    await updateJobProgress(jobId, {
      progress: SUBTOPIC_GENERATION_STEPS.FINALIZING.progress,
      currentStep: SUBTOPIC_GENERATION_STEPS.FINALIZING.name,
      details: { currentSubtopic: `Subtopic generation completed for: ${subtopic.title}` },
    });

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
  async generateTopicContent(
    courseId: string,
    topicId: string,
    jobId: string,
    topicTitle: string,
    courseTitle: string
  ): Promise<TopicGenerationResult> {
    try {
      // Generate main content
      await updateJobProgress(jobId, {
        progress: TOPIC_GENERATION_STEPS.CONTENT_GENERATION.TOPIC_OVERVIEW.progress,
        currentStep: TOPIC_GENERATION_STEPS.CONTENT_GENERATION.TOPIC_OVERVIEW.name,
        details: {
          currentTopic: `Generating content for: ${topicTitle}`
        }
      });

      const topicPrompt = generateSubtopicContentPrompt(topicTitle, topicTitle).trim();
      const result = await model.generateContent(topicPrompt);
      const response = await result.response;
      const text = await response.text();
      const parsedContent = await this.safeJsonParse(text);

      const content = parsedContent.content || 'Content not available.';

      // Generate thumbnail
      await updateJobProgress(jobId, {
        progress: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_THUMBNAILS.progress,
        currentStep: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_THUMBNAILS.name,
        details: {
          currentImage: 'Generating thumbnail...'
        }
      });

      const unixTimestamp = Math.floor(Date.now() / 1000);
      const thumbnailPrompt = generateTextPromptForImage(topicTitle, courseTitle).trim();
      const thumbnail = await ImageService.generateAndUploadImage(
        thumbnailPrompt,
        'thumbnail',
        true,
        unixTimestamp
      );

      // Generate banner
      await updateJobProgress(jobId, {
        progress: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_BANNERS.progress,
        currentStep: TOPIC_GENERATION_STEPS.IMAGE_GENERATION.TOPIC_BANNERS.name,
        details: {
          currentImage: 'Generating banner...'
        }
      });

      const bannerPrompt = generateTextPromptForImage(topicTitle, courseTitle).trim();
      const banner = await ImageService.generateAndUploadImage(
        bannerPrompt,
        'banner',
        true,
        unixTimestamp
      );

      return {
        content,
        thumbnail,
        banner
      };
    } catch (error) {
      console.error('Error generating topic content:', error);
      throw error;
    }
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