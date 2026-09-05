import { Router } from 'express';
import { getOceanCurrents } from '../controllers/currents.controller';
import { getTimelineCurrents } from '../controllers/timeline.controller';

const router = Router();

router.get('/timeline', getTimelineCurrents);
router.get('/', getOceanCurrents);

export default router;
