import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import path from 'path';

// Load environment variables from workspace root or local directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection removed - using API instead
// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Basic Route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import datasetRoutes from './routes/dataset.routes';
import comparisonRoutes from './routes/comparison.routes';
import analyticsRoutes from './routes/analytics.routes';
import alertRoutes from './routes/alert.routes';
import observationRoutes from './routes/observation.routes';
import currentsRoutes from './routes/currents.routes';

// Mock routes setup (Placeholder for later)
const apiRouter = express.Router();

apiRouter.use('/datasets', datasetRoutes);
apiRouter.use('/comparison', comparisonRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('/observations', observationRoutes);
apiRouter.use('/currents', currentsRoutes);
// apiRouter.get('/model', (req, res) => res.json({ message: 'Model data' })); // TODO: integrate model route


app.use('/api', apiRouter);

// Centralized error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
