import { Router } from 'express';
import subscriptionPlanController from '../controllers/plan.controller.js';
import userSubscriptionController from '../controllers/subscription/user-subscription.controller.js';
import { requirePermission } from '../middleware/auth.js';
import subscriptionController from '../controllers/subscription.controller.js';

const router = Router();

// Plan management routes
router.get('/plans', (req, res) => {
  subscriptionPlanController.getPlans(req, res);
});

router.get('/plans/:id', 
  requirePermission('manage_subscriptions'),
  (req, res) => subscriptionPlanController.getPlan(req, res)
);

router.post('/plans',
  requirePermission('manage_subscriptions'),
  (req, res) => subscriptionPlanController.createPlan(req, res)
);

router.put('/plans/:id',
  requirePermission('manage_subscriptions'),
  (req, res) => subscriptionPlanController.updatePlan(req, res)
);

router.delete('/plans/:id',
  requirePermission('manage_subscriptions'),
  (req, res) => subscriptionPlanController.deletePlan(req, res)
);

// User subscription routes
router.get('/users/:userId',
  (req, res) => userSubscriptionController.getUserSubscription(req, res)
);

router.post('/users/:userId/subscribe',
  (req, res) => userSubscriptionController.subscribeToPlan(req, res)
);

router.post('/users/:userId/cancel',
  (req, res) => userSubscriptionController.cancelSubscription(req, res)
);

router.get('/users/courseCount/:userId',
  (req, res) => subscriptionController.getUserCourseCount(req, res)
);

export default router;