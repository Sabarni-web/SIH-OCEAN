import { Request, Response } from 'express';
import { fetchTimelineCurrents } from '../services/currents.service';

export const getTimelineCurrents = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, minLat, maxLat, minLon, maxLon } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }

    const bounds = (minLat && maxLat && minLon && maxLon) ? {
      minLat: Number(minLat),
      maxLat: Number(maxLat),
      minLon: Number(minLon),
      maxLon: Number(maxLon)
    } : undefined;

    const result = await fetchTimelineCurrents(String(startDate), String(endDate), bounds);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
