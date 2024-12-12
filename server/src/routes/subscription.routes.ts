import { Router } from 'express';
import subscriptionController from '../controllers/subscription.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.js';

const router = Router();

// Protected routes
router.use(authenticate);

// Plan management (admin only)
router.get('/plans',
//   requirePermission('manage_subscriptions'),
  (req, res) => subscriptionController.getPlans(req, res)
);

router.get('/plans/:id',
  requirePermission('manage_subscriptions'),
  (req, res) => subscriptionController.getPlan(req, res)
);

router.post('/plans',
  requirePermission('manage_subscriptions'),
  (req, res) => subscriptionController.createPlan(req, res)
);

router.put('/plans/:id',
  requirePermission('manage_subscriptions'),
  (req, res) => subscriptionController.updatePlan(req, res)
);

router.delete('/plans/:id',
  requirePermission('manage_subscriptions'),
  (req, res) => subscriptionController.deletePlan(req, res)
);

// User subscription management
router.get('/users/:userId',
  (req, res) => subscriptionController.getUserSubscription(req, res)
);

router.post('/users/:userId/subscribe',
  (req, res) => subscriptionController.subscribeToPlan(req, res)
);

router.post('/users/:userId/cancel',
  (req, res) => subscriptionController.cancelSubscription(req, res)
);

export default router;