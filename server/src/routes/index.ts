import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import roleRoutes from './role.routes.js';
import permissionRoutes from './permission.routes.js';
import courseRoutes from './course.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use(authenticate);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/courses', courseRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;