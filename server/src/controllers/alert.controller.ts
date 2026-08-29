import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface AlertRule {
  id: string;
  variable: string;
  operator: string;
  threshold: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId?: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  location?: { lat: number; lon: number };
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

let rules: AlertRule[] = [
  { id: '1', variable: 'temperature', operator: '>', threshold: 30, severity: 'WARNING', enabled: true },
  { id: '2', variable: 'current', operator: '>', threshold: 1.5, severity: 'CRITICAL', enabled: true }
];

let alertsHistory: Alert[] = [];

// Mock engine check
const evaluateAlerts = () => {
  // Generate random mock alerts occasionally based on rules
  if (Math.random() > 0.7) {
    const activeRules = rules.filter(r => r.enabled);
    if (activeRules.length > 0) {
      const rule = activeRules[Math.floor(Math.random() * activeRules.length)];
      if (!rule) return;
      const newAlert: Alert = {
        id: uuidv4(),
        ruleId: rule.id,
        timestamp: new Date().toISOString(),
        severity: rule.severity,
        message: `${rule.variable.toUpperCase()} anomaly detected. Threshold ${rule.operator} ${rule.threshold}`,
        location: { lat: 10 + Math.random() * 5, lon: 70 + Math.random() * 10 },
        status: 'ACTIVE'
      };
      alertsHistory.unshift(newAlert);
      if (alertsHistory.length > 50) alertsHistory.pop();
    }
  }
};

export const getRules = (req: Request, res: Response) => {
  res.json(rules);
};

export const addRule = (req: Request, res: Response) => {
  const rule = { ...req.body, id: uuidv4() };
  rules.push(rule);
  res.json(rule);
};

export const getAlerts = (req: Request, res: Response) => {
  evaluateAlerts();
  res.json(alertsHistory);
};

export const acknowledgeAlert = (req: Request, res: Response) => {
  const { id } = req.params;
  const alert = alertsHistory.find(a => a.id === id);
  if (alert) {
    alert.status = 'ACKNOWLEDGED';
    res.json(alert);
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
};

export const getStatus = (req: Request, res: Response) => {
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
