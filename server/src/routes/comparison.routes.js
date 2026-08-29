"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comparison_controller_1 = require("../controllers/comparison.controller");
const router = (0, express_1.Router)();
router.get('/profile', comparison_controller_1.getComparisonProfile);
exports.default = router;
//# sourceMappingURL=comparison.routes.js.map