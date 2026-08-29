"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObservationById = exports.getObservations = void 0;
const Observation_1 = require("../models/Observation");
const getObservations = async (req, res) => {
    try {
        const { type, limit = '50', page = '1' } = req.query;
        const query = {};
        if (type)
            query.type = type;
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);
        const skip = (parsedPage - 1) * parsedLimit;
        const observations = await Observation_1.ObservationModel.find(query).skip(skip).limit(parsedLimit);
        res.json({ data: observations, page: parsedPage, limit: parsedLimit });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getObservations = getObservations;
const getObservationById = async (req, res) => {
    try {
        const obs = await Observation_1.ObservationModel.findById(req.params.id);
        if (!obs)
            return res.status(404).json({ error: 'Observation not found' });
        res.json({ data: obs });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getObservationById = getObservationById;
//# sourceMappingURL=observation.controller.js.map