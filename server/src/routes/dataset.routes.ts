import { Router } from 'express';
import multer from 'multer';
import { uploadDataset, getDatasets, getDatasetStatus, getDatasetVariables, getOceanField } from '../controllers/dataset.controller';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadDataset);
router.get('/', getDatasets);
router.get('/:id/status', getDatasetStatus);
router.get('/:id/variables', getDatasetVariables);
router.get('/:id/field', getOceanField);

export default router;
