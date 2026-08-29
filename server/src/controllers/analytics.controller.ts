import { Request, Response } from 'express';
import { z } from 'zod';

export const getStatistics = (req: Request, res: Response) => {
  const schema = z.object({
    dataset: z.string().optional(),
    variable: z.string().optional()
  });

  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid parameters', details: parsed.error });
  }

  // Mock calculation of field statistics
  // In a real scenario, this would aggregate data from the actual grid
  const statistics = {
    min: (Math.random() * 5 + 10).toFixed(1),
    max: (Math.random() * 5 + 25).toFixed(1),
    mean: (Math.random() * 5 + 15).toFixed(1),
    std: (Math.random() * 2 + 1).toFixed(1),
    validCount: Math.floor(Math.random() * 10000) + 50000,
    missingCount: Math.floor(Math.random() * 1000)
  };

  res.json(statistics);
};

export const getHistogram = (req: Request, res: Response) => {
  // Mock histogram buckets
  const bins = Array.from({ length: 20 }, (_, i) => ({
    bucket: i,
    count: Math.floor(Math.random() * 1000) + 100
  }));
  res.json({ bins });
};

export const getCrossSection = (req: Request, res: Response) => {
  // Mock cross section data
  const distances = [0, 10, 20, 30, 40, 50]; // km
  const depths = [0, 50, 100, 200, 500]; // m
  
  const values: number[][] = [];
  for(let i=0; i<distances.length; i++) {
    const col = [];
    for(let j=0; j<depths.length; j++) {
      const d = depths[j];
      if (d !== undefined) {
        col.push(25 - (d / 500) * 15 + Math.random());
      }
    }
    values.push(col);
  }

  res.json({ distances, depths, values });
};
