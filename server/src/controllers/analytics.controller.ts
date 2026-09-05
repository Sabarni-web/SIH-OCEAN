import { Request, Response } from 'express';
import { z } from 'zod';

export const getStatistics = (req: Request, res: Response) => {
  const schema = z.object({
    dataset: z.string().optional(),
    datasetId: z.string().optional(),
    variable: z.string().optional(),
    depth: z.string().optional()
  });

  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid parameters', details: parsed.error });
  }

  const variable = parsed.data.variable || 'temperature';
  
  let min = 12.5;
  let max = 30.2;
  let mean = 26.4;
  let std = 2.8;

  if (variable === 'salinity') {
    min = 32.1;
    max = 36.8;
    mean = 35.2;
    std = 0.9;
  } else if (variable === 'current' || variable === 'currentVelocity') {
    min = 0.05;
    max = 1.85;
    mean = 0.62;
    std = 0.35;
  } else if (variable === 'chlorophyll') {
    min = 0.02;
    max = 3.4;
    mean = 0.85;
    std = 0.6;
  }

  res.json({
    min,
    max,
    mean,
    std,
    validCount: 64800,
    missingCount: 120,
    variable
  });
};

export const getHistogram = (req: Request, res: Response) => {
  const bins = Array.from({ length: 20 }, (_, i) => ({
    bucket: i,
    count: Math.floor(Math.sin(i * 0.3) * 500 + 600)
  }));
  res.json({ bins });
};

export const getCrossSection = (req: Request, res: Response) => {
  const distances = [0, 10, 20, 30, 40, 50]; // km
  const depths = [0, 50, 100, 200, 500]; // m
  
  const values: number[][] = [];
  for(let i=0; i<distances.length; i++) {
    const col = [];
    for(let j=0; j<depths.length; j++) {
      const d = depths[j];
      if (d !== undefined) {
        col.push(28 - (d / 500) * 18);
      }
    }
    values.push(col);
  }

  res.json({ distances, depths, values });
};
