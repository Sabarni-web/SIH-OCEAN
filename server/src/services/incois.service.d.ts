import type { ArgoFloat, Glider, CTDObservation, Mooring, BGCObservation, Observation } from '../../../shared/types';
export declare function fetchJson(url: string, redirectCount?: number): Promise<any>;
export declare const getErddapBaseUrl: () => string;
export declare const getArgoDatasetId: () => string;
export declare const INCOIS_MOORED_BUOYS: Mooring[];
export declare const INCOIS_GLIDERS: Glider[];
export declare const INCOIS_CTD_STATIONS: CTDObservation[];
export declare const INCOIS_BGC_FLOATS: BGCObservation[];
export declare const fetchLiveIncoisArgoFloats: (startDate?: string, endDate?: string, bounds?: any) => Promise<ArgoFloat[]>;
export declare const fetchAllIncoisObservations: (startDate?: string, endDate?: string, bounds?: any, typeFilter?: string) => Promise<Observation[]>;
export declare const fetchFloatDepthProfile: (wmoId: string) => Promise<{
    depths: number[];
    temperatures: number[];
    salinities: number[];
}>;
//# sourceMappingURL=incois.service.d.ts.map