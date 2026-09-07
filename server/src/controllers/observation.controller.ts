import { Request, Response } from 'express';
import { ObservationModel } from '../models/Observation';
import { fetchAllIncoisObservations, fetchFloatDepthProfile } from '../services/incois.service';

export const getObservations = async (req: Request, res: Response) => {
  try {
    const { type, limit = '1200', page = '1', startDate, endDate, minLat, maxLat, minLon, maxLon } = req.query;
    
    const query: any = {};
    if (type) query.type = type;
    
    const parsedLimit = parseInt(limit as string, 10);
    const parsedPage = parseInt(page as string, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Check MongoDB first
    let observations: any[] = [];
    try {
      observations = await ObservationModel.find(query).skip(skip).limit(parsedLimit);
    } catch {
      // Database not connected or error, proceed to live INCOIS
    }

    // If no observations in MongoDB, fetch real live in-situ observations from INCOIS
    if (observations.length === 0) {
      const bounds = (minLat && maxLat && minLon && maxLon) ? {
        minLat: Number(minLat), maxLat: Number(maxLat), minLon: Number(minLon), maxLon: Number(maxLon)
      } : undefined;

      let liveObs = await fetchAllIncoisObservations(
        startDate ? String(startDate) : undefined,
        endDate ? String(endDate) : undefined,
        bounds,
        type ? String(type) : undefined
      );
      if (type) {
        liveObs = liveObs.filter(o => o.type === type);
      }
      observations = liveObs.slice(skip, skip + parsedLimit);
    }

    res.json({ data: observations, page: parsedPage, limit: parsedLimit });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getObservationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check MongoDB
    let obs: any = null;
    try {
      obs = await ObservationModel.findById(id);
    } catch {
      // fallback
    }

    // Check INCOIS cache
    if (!obs) {
      const liveObs = await fetchAllIncoisObservations();
      obs = liveObs.find(f => f.id === id || (f as any).wmoId === id || (f as any).stationId === id || (f as any).deploymentId === id);
    }

    if (!obs) return res.status(404).json({ error: 'Observation not found' });
    res.json({ data: obs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getObservationProfile = async (req: Request, res: Response) => {
  try {
    const wmoId = Array.isArray(req.params.wmoId) ? req.params.wmoId[0] : req.params.wmoId;
    if (!wmoId) return res.status(400).json({ error: 'wmoId is required' });

    const profileData = await fetchFloatDepthProfile(String(wmoId));
    res.json({ data: profileData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
