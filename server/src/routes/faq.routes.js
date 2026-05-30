import { Router } from 'express';
import {
  createFAQ,
  getFAQs,
  getPublishedFAQs,
  getFAQById,
  updateFAQ,
  updateFAQStatus,
  deleteFAQ,
  incrementViews
} from '../controllers/faq.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/published', getPublishedFAQs);
router.patch('/:id/view', incrementViews);
router.get('/:id', authenticate, getFAQById);
router.post('/', authenticate, requireAdmin, createFAQ);
router.get('/', authenticate, requireAdmin, getFAQs);
router.put('/:id', authenticate, requireAdmin, updateFAQ);
router.patch('/:id/status', authenticate, requireAdmin, updateFAQStatus);
router.delete('/:id', authenticate, requireAdmin, deleteFAQ);

export default router;