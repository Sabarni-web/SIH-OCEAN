import { Router } from 'express';
import { getObservations, getObservationById, getObservationProfile } from '../controllers/observation.controller';

const router = Router();

router.get('/', getObservations);
router.get('/profile/:wmoId', getObservationProfile);
router.get('/:id', getObservationById);

// Specific types for convenience
router.get('/type/:type', (req, res, next) => {
  req.query.type = req.params.type;
  next();
}, getObservations);

export default router;
