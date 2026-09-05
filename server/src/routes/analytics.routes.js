"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = (0, express_1.Router)();
router.get('/statistics', analytics_controller_1.getStatistics);
router.get('/stats', analytics_controller_1.getStatistics);
router.get('/histogram', analytics_controller_1.getHistogram);
router.get('/cross-section', analytics_controller_1.getCrossSection);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map