import { Request, Response } from 'express';
import { ObservationModel } from '../models/Observation';
import { z } from 'zod';

export const getObservations = async (req: Request, res: Response) => {
  try {
    const { type, limit = '50', page = '1' } = req.query;
    
    const query: any = {};
    if (type) query.type = type;
    
    const parsedLimit = parseInt(limit as string, 10);
    const parsedPage = parseInt(page as string, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const observations = await ObservationModel.find(query).skip(skip).limit(parsedLimit);
    res.json({ data: observations, page: parsedPage, limit: parsedLimit });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getObservationById = async (req: Request, res: Response) => {
  try {
    const obs = await ObservationModel.findById(req.params.id);
    if (!obs) return res.status(404).json({ error: 'Observation not found' });
    res.json({ data: obs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
