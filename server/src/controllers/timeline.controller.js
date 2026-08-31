"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimelineCurrents = void 0;
const currents_service_1 = require("../services/currents.service");
const getTimelineCurrents = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
        }
        const result = await (0, currents_service_1.fetchTimelineCurrents)(String(startDate), String(endDate));
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getTimelineCurrents = getTimelineCurrents;
//# sourceMappingURL=timeline.controller.js.map