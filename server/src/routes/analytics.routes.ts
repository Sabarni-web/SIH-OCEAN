import { Router } from 'express';
import { getStatistics, getHistogram, getCrossSection } from '../controllers/analytics.controller';

const router = Router();

router.get('/statistics', getStatistics);
router.get('/stats', getStatistics);
router.get('/histogram', getHistogram);
router.get('/cross-section', getCrossSection);

export default router;
