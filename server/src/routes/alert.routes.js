"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alert_controller_1 = require("../controllers/alert.controller");
const router = (0, express_1.Router)();
router.get('/rules', alert_controller_1.getRules);
router.post('/rules', alert_controller_1.addRule);
router.get('/', alert_controller_1.getAlerts);
router.post('/:id/acknowledge', alert_controller_1.acknowledgeAlert);
router.get('/status', alert_controller_1.getStatus);
exports.default = router;
//# sourceMappingURL=alert.routes.js.map