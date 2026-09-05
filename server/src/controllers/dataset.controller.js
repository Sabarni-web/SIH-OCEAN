"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOceanField = exports.getDatasetVariables = exports.getDatasetStatus = exports.getDatasets = exports.uploadDataset = void 0;
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const child_process_1 = require("child_process");
const Dataset_1 = require("../models/Dataset");
const processDataset = async (datasetId, filePath, format) => {
    try {
        await Dataset_1.DatasetModel.findByIdAndUpdate(datasetId, { status: 'PROCESSING', progress: 10, message: 'Detecting dimensions...' });
        if (format === 'netcdf') {
            const pythonProcess = (0, child_process_1.spawn)('python', [path_1.default.join(__dirname, '../parsers/python/parser.py'), filePath]);
            let output = '';
            pythonProcess.stdout.on('data', (data) => output += data.toString());
            pythonProcess.on('close', async (code) => {
                try {
                    const parsed = JSON.parse(output);
                    if (parsed.error)
                        throw new Error(parsed.error);
                    await Dataset_1.DatasetModel.findByIdAndUpdate(datasetId, {
                        status: 'READY',
                        progress: 100,
                        message: 'Ready',
                        variables: parsed.variables,
                        spatialBounds: parsed.spatialBounds,
                        depthRange: parsed.depthRange
                    });
                }
                catch (e) {
                    await Dataset_1.DatasetModel.findByIdAndUpdate(datasetId, { status: 'ERROR', message: `Parse Error: ${e.message}` });
                }
            });
        }
        else {
            // Simulate processing for CSV/JSON
            setTimeout(async () => {
                await Dataset_1.DatasetModel.findByIdAndUpdate(datasetId, {
                    status: 'READY',
                    progress: 100,
                    message: 'Ready',
                    variables: [{ id: 'temperature', name: 'Temperature', unit: '°C', min: 0, max: 35, dimensions: ['time', 'depth', 'lat', 'lon'] }]
                });
            }, 2000);
        }
    }
    catch (err) {
        await Dataset_1.DatasetModel.findByIdAndUpdate(datasetId, { status: 'ERROR', message: err.message });
    }
};
const uploadDataset = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
        const ext = path_1.default.extname(req.file.originalname).toLowerCase();
        const format = ext === '.nc' ? 'netcdf' : ext === '.csv' ? 'csv' : ext === '.json' ? 'json' : 'ascii';
        const newDataset = new Dataset_1.DatasetModel({
            name: req.file.originalname,
            source: 'upload',
            format: format,
            description: 'Uploaded via API',
            variables: [],
            spatialBounds: { latMin: 0, latMax: 0, lonMin: 0, lonMax: 0 },
            depthRange: { min: 0, max: 0 },
            timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
            status: 'UPLOADING',
            progress: 0
        });
        await newDataset.save();
        // Trigger processing asynchronously
        processDataset(newDataset.id, req.file.path, format);
        res.status(202).json({ message: 'Dataset uploaded and queued for processing', datasetId: newDataset.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.uploadDataset = uploadDataset;
const DEFAULT_INCOIS_DATASET = {
    _id: 'incois_hoofs_indian_ocean',
    id: 'incois_hoofs_indian_ocean',
    name: 'INCOIS HOOFS Indian Ocean Forecast (ROMS)',
    source: 'INCOIS THREDDS & ERDDAP',
    format: 'netcdf',
    description: 'High-Resolution Operational Ocean Forecast System (HOOFS) 1/12° for Indian Ocean basin',
    status: 'READY',
    progress: 100,
    variables: [
        { id: 'temperature', name: 'Potential Temperature', unit: '°C', min: 0, max: 32, dimensions: ['time', 'depth', 'lat', 'lon'] },
        { id: 'salinity', name: 'Practical Salinity', unit: 'PSU', min: 30, max: 40, dimensions: ['time', 'depth', 'lat', 'lon'] },
        { id: 'currentVelocity', name: 'Current Velocity', unit: 'm/s', min: 0, max: 2.5, dimensions: ['time', 'depth', 'lat', 'lon'] },
        { id: 'chlorophyll', name: 'Chlorophyll-a', unit: 'mg/m³', min: 0, max: 5, dimensions: ['time', 'depth', 'lat', 'lon'] }
    ],
    spatialBounds: { latMin: -30, latMax: 30, lonMin: 40, lonMax: 110 },
    depthRange: { min: 0, max: 5000 },
    timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
    createdAt: new Date().toISOString()
};
const getDatasets = async (req, res) => {
    try {
        let datasets = [];
        try {
            datasets = await Dataset_1.DatasetModel.find();
        }
        catch {
            // Database offline/empty
        }
        if (datasets.length === 0) {
            datasets = [DEFAULT_INCOIS_DATASET];
        }
        res.json({ data: datasets });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getDatasets = getDatasets;
const getDatasetStatus = async (req, res) => {
    try {
        if (req.params.id === 'incois_hoofs_indian_ocean') {
            return res.json({ status: 'READY', progress: 100, message: 'Ready' });
        }
        const ds = await Dataset_1.DatasetModel.findById(req.params.id);
        if (!ds)
            return res.status(404).json({ error: 'Dataset not found' });
        res.json({ status: ds.status, progress: ds.progress, message: ds.message });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getDatasetStatus = getDatasetStatus;
const getDatasetVariables = async (req, res) => {
    try {
        if (req.params.id === 'incois_hoofs_indian_ocean') {
            return res.json({ data: DEFAULT_INCOIS_DATASET.variables });
        }
        const ds = await Dataset_1.DatasetModel.findById(req.params.id);
        if (!ds)
            return res.status(404).json({ error: 'Dataset not found' });
        res.json({ data: ds.variables });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getDatasetVariables = getDatasetVariables;
const getOceanField = async (req, res) => {
    try {
        const schema = zod_1.z.object({
            variable: zod_1.z.string(),
            depth: zod_1.z.string().transform(Number),
            time: zod_1.z.string()
        });
        const parsed = schema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid parameters', details: parsed.error });
        }
        let ds = null;
        if (req.params.id === 'incois_hoofs_indian_ocean') {
            ds = DEFAULT_INCOIS_DATASET;
        }
        else {
            try {
                ds = await Dataset_1.DatasetModel.findById(req.params.id);
            }
            catch {
                // fallback
            }
        }
        if (!ds)
            ds = DEFAULT_INCOIS_DATASET;
        // Simulate reading a spatial subset from the file
        const latResolution = 2;
        const lonResolution = 2;
        const lats = Array.from({ length: 30 }, (_, i) => -30 + i * latResolution);
        const lons = Array.from({ length: 35 }, (_, i) => 40 + i * lonResolution);
        const values = [];
        const timeIndex = new Date(parsed.data.time).getTime() / 100000 || 0;
        for (let lat of lats) {
            for (let lon of lons) {
                const d = parsed.data.depth;
                const t = timeIndex;
                const n = Math.sin(lat * 0.1 + t) * Math.cos(lon * 0.1 + d * 0.05) + Math.sin(lon * 0.2 - t) * Math.cos(lat * 0.15);
                let val = 0;
                if (parsed.data.variable === 'temperature') {
                    val = (30 - (d / 2000) * 30) + n * 2;
                }
                else if (parsed.data.variable === 'salinity') {
                    val = 35 + n * 1.5 - d / 4000;
                }
                else if (parsed.data.variable === 'chlorophyll') {
                    val = Math.max(0, (1 + n * 2) * (d > 200 ? 0 : 1 - d / 200));
                }
                else if (parsed.data.variable === 'currentVelocity') {
                    const u = Math.sin(lat * 0.1 + t) * Math.cos(lon * 0.1 - d * 0.001);
                    const v = Math.cos(lat * 0.1 - t) * Math.sin(lon * 0.1 + d * 0.001);
                    val = Math.sqrt(u * u + v * v);
                }
                else if (parsed.data.variable === 'currentDirection') {
                    const u = Math.sin(lat * 0.1 + t) * Math.cos(lon * 0.1 - d * 0.001);
                    const v = Math.cos(lat * 0.1 - t) * Math.sin(lon * 0.1 + d * 0.001);
                    let dir = Math.atan2(v, u) * (180 / Math.PI);
                    if (dir < 0)
                        dir += 360;
                    val = dir;
                }
                else {
                    val = 10 + n * 5;
                }
                values.push({ lat, lon, depth: d, value: val });
            }
        }
        res.json({
            datasetId: req.params.id,
            variable: parsed.data.variable,
            depth: parsed.data.depth,
            time: parsed.data.time,
            coordinates: { latitude: lats, longitude: lons },
            values: values
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getOceanField = getOceanField;
//# sourceMappingURL=dataset.controller.js.map