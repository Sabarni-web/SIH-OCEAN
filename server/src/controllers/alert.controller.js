"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = exports.acknowledgeAlert = exports.getAlerts = exports.addRule = exports.getRules = void 0;
const uuid_1 = require("uuid");
let rules = [
    { id: '1', variable: 'temperature', operator: '>', threshold: 30, severity: 'WARNING', enabled: true },
    { id: '2', variable: 'current', operator: '>', threshold: 1.5, severity: 'CRITICAL', enabled: true }
];
let alertsHistory = [
    {
        id: (0, uuid_1.v4)(),
        ruleId: '1',
        timestamp: new Date().toISOString(),
        severity: 'WARNING',
        message: 'TEMPERATURE anomaly detected. Threshold > 30',
        location: { lat: 14.5, lon: 74.2 },
        status: 'ACTIVE'
    },
    {
        id: (0, uuid_1.v4)(),
        ruleId: '2',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        message: 'CURRENT anomaly detected. Threshold > 1.5',
        location: { lat: 12.1, lon: 76.8 },
        status: 'ACTIVE'
    }
];
// Mock engine check
const evaluateAlerts = () => {
    // Generate random mock alerts occasionally based on rules
    if (Math.random() > 0.7) {
        const activeRules = rules.filter(r => r.enabled);
        if (activeRules.length > 0) {
            const rule = activeRules[Math.floor(Math.random() * activeRules.length)];
            if (!rule)
                return;
            const newAlert = {
                id: (0, uuid_1.v4)(),
                ruleId: rule.id,
                timestamp: new Date().toISOString(),
                severity: rule.severity,
                message: `${rule.variable.toUpperCase()} anomaly detected. Threshold ${rule.operator} ${rule.threshold}`,
                location: { lat: 10 + Math.random() * 5, lon: 70 + Math.random() * 10 },
                status: 'ACTIVE'
            };
            alertsHistory.unshift(newAlert);
            if (alertsHistory.length > 50)
                alertsHistory.pop();
        }
    }
};
const getRules = (req, res) => {
    res.json(rules);
};
exports.getRules = getRules;
const addRule = (req, res) => {
    const rule = { ...req.body, id: (0, uuid_1.v4)() };
    rules.push(rule);
    res.json(rule);
};
exports.addRule = addRule;
const getAlerts = (req, res) => {
    evaluateAlerts();
    res.json(alertsHistory);
};
exports.getAlerts = getAlerts;
const acknowledgeAlert = (req, res) => {
    const { id } = req.params;
    const alert = alertsHistory.find(a => a.id === id);
    if (alert) {
        alert.status = 'ACKNOWLEDGED';
        res.json(alert);
    }
    else {
        res.status(404).json({ error: 'Alert not found' });
    }
};
exports.acknowledgeAlert = acknowledgeAlert;
const getStatus = (req, res) => {
    res.json({
        status: 'LIVE',
        lastUpdated: new Date().toISOString(),
        dataHealth: {
            model: 'READY',
            argo: 'LIVE',
            latency: '2 min'
        }
    });
};
exports.getStatus = getStatus;
//# sourceMappingURL=alert.controller.js.map