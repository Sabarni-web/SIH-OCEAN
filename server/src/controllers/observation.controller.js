"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObservationProfile = exports.getObservationById = exports.getObservations = void 0;
const Observation_1 = require("../models/Observation");
const incois_service_1 = require("../services/incois.service");
const getObservations = async (req, res) => {
    try {
        const { type, limit = '1200', page = '1', startDate, endDate, minLat, maxLat, minLon, maxLon } = req.query;
        const query = {};
        if (type)
            query.type = type;
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);
        const skip = (parsedPage - 1) * parsedLimit;
        // Check MongoDB first
        let observations = [];
        try {
            observations = await Observation_1.ObservationModel.find(query).skip(skip).limit(parsedLimit);
        }
        catch {
            // Database not connected or error, proceed to live INCOIS
        }
        // If no observations in MongoDB, fetch real live in-situ observations from INCOIS
        if (observations.length === 0) {
            const bounds = (minLat && maxLat && minLon && maxLon) ? {
                minLat: Number(minLat), maxLat: Number(maxLat), minLon: Number(minLon), maxLon: Number(maxLon)
            } : undefined;
            let liveObs = await (0, incois_service_1.fetchAllIncoisObservations)(startDate ? String(startDate) : undefined, endDate ? String(endDate) : undefined, bounds, type ? String(type) : undefined);
            if (type) {
                liveObs = liveObs.filter(o => o.type === type);
            }
            observations = liveObs.slice(skip, skip + parsedLimit);
        }
        res.json({ data: observations, page: parsedPage, limit: parsedLimit });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getObservations = getObservations;
const getObservationById = async (req, res) => {
    try {
        const { id } = req.params;
        // Check MongoDB
        let obs = null;
        try {
            obs = await Observation_1.ObservationModel.findById(id);
        }
        catch {
            // fallback
        }
        // Check INCOIS cache
        if (!obs) {
            const liveObs = await (0, incois_service_1.fetchAllIncoisObservations)();
            obs = liveObs.find(f => f.id === id || f.wmoId === id || f.stationId === id || f.deploymentId === id);
        }
        if (!obs)
            return res.status(404).json({ error: 'Observation not found' });
        res.json({ data: obs });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getObservationById = getObservationById;
const getObservationProfile = async (req, res) => {
    try {
        const wmoId = Array.isArray(req.params.wmoId) ? req.params.wmoId[0] : req.params.wmoId;
        if (!wmoId)
            return res.status(400).json({ error: 'wmoId is required' });
        const profileData = await (0, incois_service_1.fetchFloatDepthProfile)(String(wmoId));
        res.json({ data: profileData });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getObservationProfile = getObservationProfile;
//# sourceMappingURL=observation.controller.js.map