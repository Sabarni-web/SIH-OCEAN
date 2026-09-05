import type { InstrumentSnapshot } from '../../../shared/types';
export interface ArgoHistoricalRecord {
    time: string;
    lat: number;
    lon: number;
    depth: number;
    temp: number;
    psal: number;
}
export declare function fetchHistoricalArgoPositions(startDate: string, endDate: string): Promise<Map<string, ArgoHistoricalRecord[]>>;
export declare function buildInstrumentSnapshots(frameTimestamps: string[], argoHistory: Map<string, ArgoHistoricalRecord[]>): InstrumentSnapshot[];
//# sourceMappingURL=timeline-instruments.service.d.ts.map