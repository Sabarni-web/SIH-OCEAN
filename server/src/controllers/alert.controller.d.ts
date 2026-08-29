import { Request, Response } from 'express';
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
    location?: {
        lat: number;
        lon: number;
    };
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}
export declare const getRules: (req: Request, res: Response) => void;
export declare const addRule: (req: Request, res: Response) => void;
export declare const getAlerts: (req: Request, res: Response) => void;
export declare const acknowledgeAlert: (req: Request, res: Response) => void;
export declare const getStatus: (req: Request, res: Response) => void;
//# sourceMappingURL=alert.controller.d.ts.map