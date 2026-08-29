import { Request, Response } from 'express';
import { z } from 'zod';

export const getComparisonProfile = (req: Request, res: Response) => {
  const schema = z.object({
    modelDataset: z.string(),
    observationId: z.string(),
    variable: z.string()
  });

  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid parameters', details: parsed.error });
  }

  const { variable } = parsed.data;

  // Mocking Nearest Neighbor Matching & Profile Extraction
  const depths = [0, 50, 100, 200, 500, 1000, 2000];
  const modelProfile = [];
  const observationProfile = [];
  
  let biasSum = 0;
  let maeSum = 0;
  let rmseSqSum = 0;
  let count = 0;

  for (let i = 0; i < depths.length; i++) {
    const d = depths[i];
    if (d === undefined) continue;
    
    // Simulate some realistic depth decay
    let obsVal = 0;
    if (variable === 'temperature') obsVal = 28 - (d / 2000) * 25 + Math.random();
    else if (variable === 'salinity') obsVal = 34.5 + (d / 4000);
    else obsVal = 10;

    // Simulate model being slightly off
    const modVal = obsVal + (Math.random() * 2 - 1) * (variable === 'temperature' ? 0.8 : 0.2);

    modelProfile.push(modVal);
    observationProfile.push(obsVal);
    
    const diff = modVal - obsVal;
    biasSum += diff;
    maeSum += Math.abs(diff);
    rmseSqSum += diff * diff;
    count++;
  }

  const statistics = {
    matchedPoints: count,
    bias: biasSum / count,
    mae: maeSum / count,
    rmse: Math.sqrt(rmseSqSum / count),
    correlation: 0.95 // Mock correlation
  };

  res.json({
    depths,
    modelProfile,
    observationProfile,
    statistics,
    spatialDistance: (Math.random() * 5).toFixed(1) + ' km'
  });
};
