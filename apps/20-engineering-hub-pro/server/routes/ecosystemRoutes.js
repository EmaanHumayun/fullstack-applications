import express from 'express';
import { connectDB } from '../config/db.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import {
  getEcosystemsSummary,
  getEcosystemDetail,
  getRecommendedNextAction,
  promoteProjectToPortfolio
} from '../services/ecosystemService.js';

const router = express.Router();

/**
 * GET /api/ecosystems
 * Returns summary and progress of all 5 engineering ecosystems.
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const summary = await getEcosystemsSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/ecosystems/next-action
 * Evaluates prerequisites and returns the recommended next project to build.
 */
router.get('/next-action', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const recommendation = await getRecommendedNextAction();
    res.json(recommendation);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/ecosystems/:slug
 * Deep dive into an ecosystem (Hub repo, level repos, 20 projects, skills, roadmap).
 */
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const detail = await getEcosystemDetail(req.params.slug);
    if (!detail) {
      return res.status(404).json({ message: 'Ecosystem not found' });
    }
    res.json(detail);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ecosystems/:id/promote
 * Promotes a completed project into the public portfolio.
 */
router.post('/:id/promote', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const promoted = await promoteProjectToPortfolio(req.params.id, req.body);
    res.json({
      message: 'Project successfully promoted to public portfolio.',
      project: promoted
    });
  } catch (err) {
    next(err);
  }
});

export default router;
