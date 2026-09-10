import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { spawn } from 'child_process';
import { DatasetModel } from '../models/Dataset';

const processDataset = async (datasetId: string, filePath: string, format: string) => {
  try {
    await DatasetModel.findByIdAndUpdate(datasetId, { status: 'PROCESSING', progress: 10, message: 'Detecting dimensions...' });

    if (format === 'netcdf') {
      const pythonProcess = spawn('python', [path.join(__dirname, '../parsers/python/parser.py'), filePath]);

      let output = '';
      pythonProcess.stdout.on('data', (data) => output += data.toString());

      pythonProcess.on('close', async (code) => {
        try {
          const parsed = JSON.parse(output);
          if (parsed.error) throw new Error(parsed.error);

          await DatasetModel.findByIdAndUpdate(datasetId, {
            status: 'READY',
            progress: 100,
            message: 'Ready',
            variables: parsed.variables,
            spatialBounds: parsed.spatialBounds,
            depthRange: parsed.depthRange
          });
        } catch (e: any) {
          await DatasetModel.findByIdAndUpdate(datasetId, { status: 'ERROR', message: `Parse Error: ${e.message}` });
        }
      });
    } else {
      // Simulate processing for CSV/JSON
      setTimeout(async () => {
        await DatasetModel.findByIdAndUpdate(datasetId, {
          status: 'READY',
          progress: 100,
          message: 'Ready',
          variables: [{ id: 'temperature', name: 'Temperature', unit: '°C', min: 0, max: 35, dimensions: ['time', 'depth', 'lat', 'lon'] }]
        });
      }, 2000);
    }
  } catch (err: any) {
    await DatasetModel.findByIdAndUpdate(datasetId, { status: 'ERROR', message: err.message });
  }
};

export const uploadDataset = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const format = ext === '.nc' ? 'netcdf' : ext === '.csv' ? 'csv' : ext === '.json' ? 'json' : 'ascii';

    const newDataset = new DatasetModel({
      name: req.file.originalname,
      source: 'upload',
      format: format,
      description: 'Uploaded via API',
      variables: [],
      spatialBounds: { latMin: 0, latMax: 0, lonMin: 0, lonMax: 0 },
      depthRange: { min: 0, max: 0 },
      timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
      status: 'UPLOADING',
      progress: 0
    });

    await newDataset.save();

    // Trigger processing asynchronously
    processDataset(newDataset.id, req.file.path, format);

    res.status(202).json({ message: 'Dataset uploaded and queued for processing', datasetId: newDataset.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const DEFAULT_INCOIS_DATASET = {
  _id: 'incois_hoofs_indian_ocean',
  id: 'incois_hoofs_indian_ocean',
  name: 'INCOIS HOOFS Indian Ocean Forecast (ROMS)',
  source: 'INCOIS THREDDS & ERDDAP',
  format: 'netcdf',
  description: 'High-Resolution Operational Ocean Forecast System (HOOFS) 1/12° for Indian Ocean basin',
  status: 'READY',
  progress: 100,
  variables: [
    { id: 'temperature', name: 'Potential Temperature', unit: '°C', min: 0, max: 32, dimensions: ['time', 'depth', 'lat', 'lon'] },
    { id: 'salinity', name: 'Practical Salinity', unit: 'PSU', min: 30, max: 40, dimensions: ['time', 'depth', 'lat', 'lon'] },
    { id: 'currentVelocity', name: 'Current Velocity', unit: 'm/s', min: 0, max: 2.5, dimensions: ['time', 'depth', 'lat', 'lon'] },
    { id: 'chlorophyll', name: 'Chlorophyll-a', unit: 'mg/m³', min: 0, max: 5, dimensions: ['time', 'depth', 'lat', 'lon'] }
  ],
  spatialBounds: { latMin: -30, latMax: 30, lonMin: 40, lonMax: 110 },
  depthRange: { min: 0, max: 5000 },
  timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
  createdAt: new Date().toISOString()
};

export const getDatasets = async (req: Request, res: Response) => {
  try {
    let datasets: any[] = [];
    try {
      datasets = await DatasetModel.find();
    } catch {
      // Database offline/empty
    }

    if (datasets.length === 0) {
      datasets = [DEFAULT_INCOIS_DATASET];
    }

    res.json({ data: datasets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getDatasetStatus = async (req: Request, res: Response) => {
  try {
    if (req.params.id === 'incois_hoofs_indian_ocean') {
      return res.json({ status: 'READY', progress: 100, message: 'Ready' });
    }
    const ds = await DatasetModel.findById(req.params.id);
    if (!ds) return res.status(404).json({ error: 'Dataset not found' });
    res.json({ status: ds.status, progress: ds.progress, message: ds.message });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getDatasetVariables = async (req: Request, res: Response) => {
  try {
    if (req.params.id === 'incois_hoofs_indian_ocean') {
      return res.json({ data: DEFAULT_INCOIS_DATASET.variables });
    }
    const ds = await DatasetModel.findById(req.params.id);
    if (!ds) return res.status(404).json({ error: 'Dataset not found' });
    res.json({ data: ds.variables });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

import { fetchRealOceanData } from '../services/oceanDataService';

export const getOceanField = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      variable: z.string(),
      depth: z.string().transform(Number),
      time: z.string(),
      minLat: z.string().optional().transform(v => v ? Number(v) : -30),
      maxLat: z.string().optional().transform(v => v ? Number(v) : 30),
      minLon: z.string().optional().transform(v => v ? Number(v) : 40),
      maxLon: z.string().optional().transform(v => v ? Number(v) : 110),
      latRes: z.string().optional().transform(v => v ? Number(v) : 2),
      lonRes: z.string().optional().transform(v => v ? Number(v) : 2)
    });

    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid parameters', details: parsed.error });
    }

    let ds: any = null;
    if (req.params.id === 'incois_hoofs_indian_ocean') {
      ds = DEFAULT_INCOIS_DATASET;
    } else {
      try {
        ds = await DatasetModel.findById(req.params.id);
      } catch {
        // fallback
      }
    }
    if (!ds) ds = DEFAULT_INCOIS_DATASET;

    // Use requested bounds or defaults
    const latResolution = parsed.data.latRes;
    const lonResolution = parsed.data.lonRes;
    const numLats = Math.max(1, Math.floor((parsed.data.maxLat - parsed.data.minLat) / latResolution) + 1);
    const numLons = Math.max(1, Math.floor((parsed.data.maxLon - parsed.data.minLon) / lonResolution) + 1);
    
    const lats = Array.from({ length: numLats }, (_, i) => parsed.data.minLat + i * latResolution);
    const lons = Array.from({ length: numLons }, (_, i) => parsed.data.minLon + i * lonResolution);
    
    // Attempt to fetch real-world data from our external API proxy
    let values = await fetchRealOceanData(lats, lons, parsed.data.variable, parsed.data.depth, parsed.data.time);

    // If the API doesn't support this variable (or fails), try specific manual ERDDAP override for chlorophyll
    if (!values && parsed.data.variable === 'chlorophyll') {
      try {
        const timeStr = new Date(parsed.data.time).toISOString().split('T')[0] + 'T12:00:00Z';
        const baseGriddap = process.env.NOAA_GRIDDAP_URL || 'https://coastwatch.pfeg.noaa.gov/erddap/griddap';
        const url = `${baseGriddap}/nesdisNPPN20S3ASCIDINEOFDaily.json?chlor_a[(${timeStr}):1:(${timeStr})][(0):1:(0.0)][(${parsed.data.maxLat}):20:(${parsed.data.minLat})][(${parsed.data.minLon}):20:(${parsed.data.maxLon})]`;
        
        const response = await fetch(url, {
          headers: { 'User-Agent': 'OCEAN-VISTA/1.0' }
        });
        
        if (response.ok) {
          const erddapData = await response.json();
          values = erddapData.table.rows.map((row: any) => ({
            lat: row[2],
            lon: row[3],
            depth: 0,
            value: row[4] !== null ? row[4] : 0
          }));
        }
      } catch (err: any) {
        console.error("ERDDAP fallback fetch error:", err.message);
      }
    }

    // If the API (and fallback) doesn't support this variable (or fails), fallback to our mathematical simulation
    if (!values) {
      values = [];
      const timeIndex = new Date(parsed.data.time).getTime() / 100000 || 0;
      
      for (let lat of lats) {
        for (let lon of lons) {
          const d = parsed.data.depth;
          const t = timeIndex;
          const n = Math.sin(lat * 0.1 + t) * Math.cos(lon * 0.1 + d * 0.05) + Math.sin(lon * 0.2 - t) * Math.cos(lat * 0.15);
          
          let val = 0;
          if (parsed.data.variable === 'temperature') {
            val = (30 - (d / 2000) * 30) + n * 2;
          } else if (parsed.data.variable === 'salinity') {
            val = 35 + n * 1.5 - d / 4000;
          } else if (parsed.data.variable === 'chlorophyll') {
            val = Math.max(0, (1 + n * 2) * (d > 200 ? 0 : 1 - d/200));
          } else if (parsed.data.variable === 'currentVelocity') {
            const u = Math.sin(lat * 0.1 + t) * Math.cos(lon * 0.1 - d*0.001);
            const v = Math.cos(lat * 0.1 - t) * Math.sin(lon * 0.1 + d*0.001);
            val = Math.sqrt(u*u + v*v);
          } else if (parsed.data.variable === 'currentDirection') {
            const u = Math.sin(lat * 0.1 + t) * Math.cos(lon * 0.1 - d*0.001);
            const v = Math.cos(lat * 0.1 - t) * Math.sin(lon * 0.1 + d*0.001);
            let dir = Math.atan2(v, u) * (180 / Math.PI);
            if (dir < 0) dir += 360;
            val = dir;
          } else {
            val = 10 + n * 5;
          }

          values.push({ lat, lon, depth: d, value: val });
        }
      }
    }

    res.json({
      datasetId: req.params.id,
      variable: parsed.data.variable,
      depth: parsed.data.depth,
      time: parsed.data.time,
      coordinates: { latitude: lats, longitude: lons },
      values: values
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

