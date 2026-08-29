import { Router } from 'express';
import { getComparisonProfile } from '../controllers/comparison.controller';

const router = Router();

router.get('/profile', getComparisonProfile);

export default router;
