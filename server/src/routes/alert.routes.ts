import { Router } from 'express';
import { getRules, addRule, getAlerts, acknowledgeAlert, getStatus } from '../controllers/alert.controller';

const router = Router();

router.get('/rules', getRules);
router.post('/rules', addRule);
router.get('/', getAlerts);
router.post('/:id/acknowledge', acknowledgeAlert);
router.get('/status', getStatus);

export default router;
