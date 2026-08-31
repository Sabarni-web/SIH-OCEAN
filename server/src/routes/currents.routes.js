"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const currents_controller_1 = require("../controllers/currents.controller");
const timeline_controller_1 = require("../controllers/timeline.controller");
const router = (0, express_1.Router)();
router.get('/timeline', timeline_controller_1.getTimelineCurrents);
router.get('/', currents_controller_1.getOceanCurrents);
exports.default = router;
//# sourceMappingURL=currents.routes.js.map