"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.getCrossSection = exports.getHistogram = exports.getStatistics = void 0;
const zod_1 = require("zod");
const getStatistics = (req, res) => {
    const schema = zod_1.z.object({
        dataset: zod_1.z.string().optional(),
        datasetId: zod_1.z.string().optional(),
        variable: zod_1.z.string().optional(),
        depth: zod_1.z.string().optional()
    });
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid parameters', details: parsed.error });
    }
    const variable = parsed.data.variable || 'temperature';
    let min = 12.5;
    let max = 30.2;
    let mean = 26.4;
    let std = 2.8;
    if (variable === 'salinity') {
        min = 32.1;
        max = 36.8;
        mean = 35.2;
        std = 0.9;
    }
    else if (variable === 'current' || variable === 'currentVelocity') {
        min = 0.05;
        max = 1.85;
        mean = 0.62;
        std = 0.35;
    }
    else if (variable === 'chlorophyll') {
        min = 0.02;
        max = 3.4;
        mean = 0.85;
        std = 0.6;
    }
    res.json({
        min,
        max,
        mean,
        std,
        validCount: 64800,
        missingCount: 120,
        variable
    });
};
exports.getStatistics = getStatistics;
const getHistogram = (req, res) => {
    const bins = Array.from({ length: 20 }, (_, i) => ({
        bucket: i,
        count: Math.floor(Math.sin(i * 0.3) * 500 + 600)
    }));
    res.json({ bins });
};
exports.getHistogram = getHistogram;
const getCrossSection = (req, res) => {
    const distances = [0, 10, 20, 30, 40, 50]; // km
    const depths = [0, 50, 100, 200, 500]; // m
    const values = [];
    for (let i = 0; i < distances.length; i++) {
        const col = [];
        for (let j = 0; j < depths.length; j++) {
            const d = depths[j];
            if (d !== undefined) {
                col.push(28 - (d / 500) * 18);
            }
        }
        values.push(col);
    }
    res.json({ distances, depths, values });
};
exports.getCrossSection = getCrossSection;
const getProfile = (req, res) => {
    const schema = zod_1.z.object({
        variable: zod_1.z.string().optional(),
        time: zod_1.z.string().optional(),
        datasetId: zod_1.z.string().optional()
    });
    const parsed = schema.safeParse(req.query);
    const variable = parsed.success && parsed.data.variable ? parsed.data.variable : 'temperature';
    const time = parsed.success && parsed.data.time ? parsed.data.time : new Date().toISOString();
    // Use time to create a "real-time" fluctuation effect
    const timeIndex = new Date(time).getTime() / 100000 || 0;
    const fluctuation = Math.sin(timeIndex) * 0.5;
    const depths = [0, 10, 50, 100, 200, 500, 1000, 2000, 3000, 4000, 5000];
    const values = depths.map(d => {
        // Apply a baseline exponential decay towards deep ocean values, plus a time-based fluctuation that affects all depths
        if (variable === 'temperature') {
            const baseTemp = 2 + 26 * Math.exp(-d / 800);
            const tempFluctuation = fluctuation * (Math.exp(-d / 1000) + 0.2); // Fluctuate even at deep levels
            return Math.max(0, baseTemp + tempFluctuation);
        }
        if (variable === 'salinity') {
            const baseSal = 34 + (1.5 * Math.exp(-d / 1000));
            return baseSal + (fluctuation * 0.2);
        }
        if (variable === 'current' || variable === 'currentVelocity') {
            const baseVel = 1.5 * Math.exp(-d / 400);
            return Math.max(0, baseVel + (fluctuation * 0.3 * (Math.exp(-d / 500) + 0.1)));
        }
        if (variable === 'chlorophyll') {
            const baseChl = 2.0 * Math.exp(-d / 100);
            return Math.max(0, baseChl + (fluctuation * 0.5 * (Math.exp(-d / 150) + 0.05)));
        }
        return 0;
    });
    res.json({ depths, values, variable, time });
};
exports.getProfile = getProfile;
//# sourceMappingURL=analytics.controller.js.map