import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';
import { CreateCourseData, UpdateCourseData } from '../types/course';
import { courseGenerationQueue, topicGenerationQueue, subtopicGenerationQueue } from '../queues';
import { v4 as uuidv4 } from 'uuid';
import JobProgress from '../models/mongodb/JobProgress';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  /**
   * Creates a new course and starts a background job for generation.
   * @param req Express Request object
   * @param res Express Response object
   */
  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreateCourseData = req.body; 

      if (!data.title?.trim()) {
        res.status(400).json({ message: 'Title is required' });
        return;
      }

      if (!data.description?.trim()) {
        res.status(400).json({ message: 'Description is required' });
        return;
      }

      const jobId = uuidv4();

      await JobProgress.create({
        jobId,
        userId,
        status: 'pending',
        progress: 0,
        currentStep: 'Initializing',
      });

      await courseGenerationQueue.add({
        userId,
        courseData: data,
        jobId,
      });

      res.status(202).json({
        message: 'Course generation started',
        jobId,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to create course',
      });
    }
  }

  /**
   * Retrieves the progress of a specific job.
   * @param req Express Request object
   * @param res Express Response object
   */
  async getJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;

      const jobProgress = await JobProgress.findOne({ jobId }).lean();

      if (!jobProgress) {
        res.status(404).json({ message: 'Job not found' });
        return;
      }

      res.json(jobProgress);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch job status',
      });
    }
  }
  /**
   * Generates a preview of a course based on the provided data.
   * @param req Express Request object
   * @param res Express Response object
   */
  async previewCourse(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateCourseData = req.body;
      const preview = await this.courseService.previewCourse(data);
      res.json(preview);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to generate course preview',
      });
    }
  }

  /**
   * Retrieves courses belonging to the current user.
   * @param req Express Request object
   * @param res Express Response object
   */
  async getUserCourses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const courses = await this.courseService.getUserCourses(userId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch courses',
      });
    }
  }

  /**
   * Retrieves a course by its ID.
   * @param req Express Request object
   * @param res Express Response object
   */
  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const course = await this.courseService.getCourseById(req.params.id);
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch course',
      });
    }
  }

  /**
   * Updates an existing course with the provided data.
   * @param req Express Request object
   * @param res Express Response object
   */
  async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const data: UpdateCourseData = req.body;
      const course = await this.courseService.updateCourse(req.params.id, data);
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      res.json(course);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to update course',
      });
    }
  }

  /**
   * Deletes a course by its ID for the current user.
   * @param req Express Request object
   * @param res Express Response object
   */
  async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      await this.courseService.deleteCourse(userId, req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to delete course',
      });
    }
  }

  /**
 * Initiates the generation of content for a specific topic.
 * @param req Express Request object
 * @param res Express Response object
 */
  async generateTopicContent(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, topicId } = req.params;
      const jobId = uuidv4();

      await topicGenerationQueue.add({
        courseId,
        topicId,
        jobId,
      });

      res.status(202).json({
        message: 'Topic generation started',
        jobId,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to generate topic content',
      });
    }
  }

  /**
   * Initiates the generation of content for a specific subtopic.
   * @param req Express Request object
   * @param res Express Response object
   */
  async generateSubtopicContent(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, topicId, subtopicId } = req.params;
      const jobId = uuidv4();

      await subtopicGenerationQueue.add({
        courseId,
        topicId,
        subtopicId,
        jobId,
      });

      res.status(202).json({
        message: 'Subtopic generation started',
        jobId,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to generate subtopic content',
      });
    }
  }

  /**
   * Retrieves details of a specific subtopic by ID.
   * @param req Express Request object
   * @param res Express Response object
   */
  async getSubtopicById(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, topicId, subtopicId } = req.params;

      const subtopic = await this.courseService.getSubtopicById(courseId, topicId, subtopicId);

      if (!subtopic) {
        res.status(404).json({ message: 'Subtopic not found' });
        return;
      }

      res.json(subtopic);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch subtopic',
      });
    }
  }
}

export default new CourseController();