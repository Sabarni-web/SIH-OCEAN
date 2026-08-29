import { Request, Response } from 'express';
export declare const uploadDataset: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDatasets: (req: Request, res: Response) => Promise<void>;
export declare const getDatasetStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDatasetVariables: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getOceanField: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=dataset.controller.d.ts.map