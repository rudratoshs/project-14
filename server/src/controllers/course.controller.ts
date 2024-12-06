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

  async createCourse(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateCourseData = req.body;

      // Validate required fields
      if (!data.title?.trim()) {
        return res.status(400).json({ message: 'Title is required' });
      }

      if (!data.description?.trim()) {
        return res.status(400).json({ message: 'Description is required' });
      }

      // Generate a unique job ID
      const jobId = uuidv4();

      // Create initial job progress
      await JobProgress.create({
        jobId,
        userId,
        status: 'pending',
        progress: 0,
        currentStep: 'Initializing'
      });

      // Add job to queue
      await courseGenerationQueue.add({
        userId,
        courseData: data,
        jobId
      });

      // Return the job ID immediately
      res.status(202).json({
        message: 'Course generation started',
        jobId
      });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to create course',
      });
    }
  }

  async getJobStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      console.log('Fetching job status for:', jobId);

      const jobProgress = await JobProgress.findOne({ jobId }).lean();

      if (!jobProgress) {
        console.log('Job not found:', jobId);
        return res.status(404).json({ message: 'Job not found' });
      }

      console.log('Found job progress:', jobProgress);
      res.json(jobProgress);
    } catch (error) {
      console.error('Error fetching job status:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch job status',
      });
    }
  }


  async previewCourse(req: Request, res: Response) {
    try {
      const data: CreateCourseData = req.body;
      const preview = await this.courseService.previewCourse(data);
      res.json(preview);
    } catch (error) {
      console.error('Preview course error:', error);
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to generate course preview',
      });
    }
  }

  async getUserCourses(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const courses = await this.courseService.getUserCourses(userId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({
        message:
          error instanceof Error ? error.message : 'Failed to fetch courses',
      });
    }
  }

  async getCourseById(req: Request, res: Response) {
    try {
      const course = await this.courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({
        message:
          error instanceof Error ? error.message : 'Failed to fetch course',
      });
    }
  }

  async updateCourse(req: Request, res: Response) {
    try {
      const data: UpdateCourseData = req.body;
      const course = await this.courseService.updateCourse(req.params.id, data);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : 'Failed to update course',
      });
    }
  }

  async deleteCourse(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      await this.courseService.deleteCourse(userId, req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        message:
          error instanceof Error ? error.message : 'Failed to delete course',
      });
    }
  }

  async generateTopicContent(req: Request, res: Response) {
    try {
      const { courseId, topicId } = req.params;

      // Generate a unique job ID
      const jobId = uuidv4();

      // Add job to queue
      await topicGenerationQueue.add({
        courseId,
        topicId,
        jobId
      });
      console.log('Topic generation started', jobId)
      // Return the job ID immediately
      res.status(202).json({
        message: 'Topic generation started',
        jobId
      });
    } catch (error) {
      console.error('Generate topic content error:', error);
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to generate topic content',
      });
    }
  }

  async generateSubtopicContent(req: Request, res: Response) {
    try {
      const { courseId, topicId, subtopicId } = req.params;

      // Generate a unique job ID
      const jobId = uuidv4();

      // Add job to queue
      const job = await subtopicGenerationQueue.add({
        courseId,
        topicId,
        subtopicId,
        jobId
      });
      console.log('Job added to the queue:', { jobId, job });
      // Return the job ID immediately
      res.status(202).json({
        message: 'Subtopic generation started',
        jobId
      });
    } catch (error) {
      console.error('Generate subtopic content error:', error);
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to generate subtopic content',
      });
    }
  }

  async getSubtopicById(req: Request, res: Response) {
    try {
      const { courseId, topicId, subtopicId } = req.params;

      // Fetch the subtopic data from the service
      const subtopic = await this.courseService.getSubtopicById(courseId, topicId, subtopicId);

      if (!subtopic) {
        return res.status(404).json({ message: 'Subtopic not found' });
      }

      res.json(subtopic);
    } catch (error) {
      console.error('Get subtopic error:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch subtopic',
      });
    }
  }
}

export default new CourseController();