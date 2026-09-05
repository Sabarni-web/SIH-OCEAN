"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const observation_controller_1 = require("../controllers/observation.controller");
const router = (0, express_1.Router)();
router.get('/', observation_controller_1.getObservations);
router.get('/profile/:wmoId', observation_controller_1.getObservationProfile);
router.get('/:id', observation_controller_1.getObservationById);
// Specific types for convenience
router.get('/type/:type', (req, res, next) => {
    req.query.type = req.params.type;
    next();
}, observation_controller_1.getObservations);
exports.default = router;
//# sourceMappingURL=observation.routes.js.map