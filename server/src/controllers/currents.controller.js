"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOceanCurrents = void 0;
const currents_service_1 = require("../services/currents.service");
const getOceanCurrents = async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query;
        let targetDate;
        if (date) {
            targetDate = String(date);
        }
        else if (startDate && endDate) {
            // Pass as "startDate,endDate" for custom range resolution
            targetDate = `${String(startDate)},${String(endDate)}`;
        }
        else if (startDate) {
            targetDate = String(startDate);
        }
        const data = await (0, currents_service_1.fetchLiveOceanCurrents)(targetDate);
        res.json({
            data,
            count: data.length,
            timestamp: new Date().toISOString(),
            source: 'Copernicus Marine Service (CMEMS) / Open-Meteo Gateway',
            queryDate: targetDate || 'live'
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getOceanCurrents = getOceanCurrents;
//# sourceMappingURL=currents.controller.js.map