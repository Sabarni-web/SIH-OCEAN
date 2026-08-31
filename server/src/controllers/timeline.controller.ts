import { Request, Response } from 'express';
import { fetchTimelineCurrents } from '../services/currents.service';

export const getTimelineCurrents = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }

    const result = await fetchTimelineCurrents(String(startDate), String(endDate));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
