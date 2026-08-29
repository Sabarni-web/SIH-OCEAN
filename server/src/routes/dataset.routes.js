"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const dataset_controller_1 = require("../controllers/dataset.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/upload', upload.single('file'), dataset_controller_1.uploadDataset);
router.get('/', dataset_controller_1.getDatasets);
router.get('/:id/status', dataset_controller_1.getDatasetStatus);
router.get('/:id/variables', dataset_controller_1.getDatasetVariables);
router.get('/:id/field', dataset_controller_1.getOceanField);
exports.default = router;
//# sourceMappingURL=dataset.routes.js.map