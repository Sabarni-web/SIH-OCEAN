import { Request, Response } from 'express';
import { fetchLiveOceanCurrents } from '../services/currents.service';

export const getOceanCurrents = async (req: Request, res: Response) => {
  try {
    const { date, startDate, endDate } = req.query;

    let targetDate: string | undefined;
    if (date) {
      targetDate = String(date);
    } else if (startDate && endDate) {
      // Pass as "startDate,endDate" for custom range resolution
      targetDate = `${String(startDate)},${String(endDate)}`;
    } else if (startDate) {
      targetDate = String(startDate);
    }

    const data = await fetchLiveOceanCurrents(targetDate);
    res.json({
      data,
      count: data.length,
      timestamp: new Date().toISOString(),
      source: 'Copernicus Marine Service (CMEMS) / Open-Meteo Gateway',
      queryDate: targetDate || 'live'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
