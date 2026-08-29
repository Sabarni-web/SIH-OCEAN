import mongoose, { Schema, Document } from 'mongoose';
import type { Dataset, DatasetVariable, DatasetStatus } from '../../../shared/types';

export interface IDatasetDocument extends Omit<Dataset, 'id'>, Document {}

const DatasetVariableSchema = new Schema<DatasetVariable>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  unit: { type: String, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  dimensions: [{ type: String }]
}, { _id: false });

const DatasetSchema = new Schema<IDatasetDocument>({
  name: { type: String, required: true },
  source: { type: String, required: true },
  format: { type: String, enum: ['netcdf', 'csv', 'json', 'ascii'], required: true },
  description: { type: String },
  variables: [DatasetVariableSchema],
  spatialBounds: {
    latMin: { type: Number, required: true },
    latMax: { type: Number, required: true },
    lonMin: { type: Number, required: true },
    lonMax: { type: Number, required: true }
  },
  depthRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  timeRange: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() },
  status: { type: String, enum: ['UPLOADING', 'PROCESSING', 'READY', 'ERROR'], required: true },
  progress: { type: Number },
  message: { type: String }
}, { timestamps: true });

DatasetSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

export const DatasetModel = mongoose.model<IDatasetDocument>('Dataset', DatasetSchema);
