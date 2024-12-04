import { Router } from 'express';
import courseController from '../controllers/course.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/auth';

const router = Router();

// Protected routes
router.use(authenticate);

// Course management routes
router.post('/', requirePermission('create_course'), (req, res) =>
  courseController.createCourse(req, res)
);

router.post('/preview', requirePermission('create_course'), (req, res) =>
  courseController.previewCourse(req, res)
);

router.get('/job/:jobId', requirePermission('view_course'), (req, res) =>
  courseController.getJobStatus(req, res)
);

router.get('/', requirePermission('view_course'), (req, res) =>
  courseController.getUserCourses(req, res)
);

router.get('/:id', requirePermission('view_course'), (req, res) =>
  courseController.getCourseById(req, res)
);

router.put('/:id', requirePermission('edit_course'), (req, res) =>
  courseController.updateCourse(req, res)
);

router.delete('/:id', requirePermission('delete_course'), (req, res) =>
  courseController.deleteCourse(req, res)
);

router.post(
  '/:courseId/topics/:topicId/generate',
  requirePermission('edit_course'),
  (req, res) => courseController.generateTopicContent(req, res)
);

router.post(
  '/:courseId/topics/:topicId/subtopics/:subtopicId/generate',
  requirePermission('edit_course'),
  (req, res) => courseController.generateSubtopicContent(req, res)
);

export default router;