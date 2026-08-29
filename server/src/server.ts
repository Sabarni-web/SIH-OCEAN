import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || '';
if (mongoUri) {
  mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    family: 4 // Force IPv4 for local DNS SRV resolution
  })
    .then(() => console.log('Successfully connected to MongoDB.'))
    .catch((err) => console.error('MongoDB connection error (Operating in Demo Mode):', err.message));
} else {
  console.warn('MONGO_URI is not defined in the environment variables.');
}

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

// Mock routes setup (Placeholder for later)
const apiRouter = express.Router();

apiRouter.use('/datasets', datasetRoutes);
apiRouter.use('/comparison', comparisonRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('/observations', observationRoutes);
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
