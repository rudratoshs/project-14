import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import roleRoutes from './role.routes.js';
import permissionRoutes from './permission.routes.js';
import courseRoutes from './course.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
console.log('Registering subscription routes');

// Protected routes
router.use('/api', authenticate);
router.use('/api/users', userRoutes);
router.use('/api/roles', roleRoutes);
router.use('/api/permissions', permissionRoutes);
router.use('/api/courses', courseRoutes);
router.use('/api/subscriptions', subscriptionRoutes);

export default router;