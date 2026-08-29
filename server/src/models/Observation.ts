import mongoose, { Schema, Document } from 'mongoose';
import type { Observation, ArgoFloat, Glider, CTDObservation, Mooring, BGCObservation } from '../../../shared/types';

export interface IObservationDocument extends Omit<Observation, 'id'>, Document {}

const ObservationSchema = new Schema<IObservationDocument>({
  type: { type: String, enum: ['argo', 'glider', 'ctd', 'mooring', 'bgc'], required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  depth: { type: Number, required: true },
  timestamp: { type: String, required: true },
  variables: { type: Schema.Types.Mixed, required: true },
  status: { type: String, required: true }
}, { discriminatorKey: 'type', timestamps: true });

ObservationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

export const ObservationModel = mongoose.model<IObservationDocument>('Observation', ObservationSchema);

// Discriminators for specific instrument types
const ArgoSchema = new Schema({
  wmoId: { type: String, required: true },
  cycleNumber: { type: Number, required: true }
});
export const ArgoModel = ObservationModel.discriminator<IObservationDocument & ArgoFloat>('argo', ArgoSchema);

const GliderTrackPointSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  depth: { type: Number, required: true },
  timestamp: { type: String, required: true },
  variables: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

const GliderSchema = new Schema({
  deploymentId: { type: String, required: true },
  track: [GliderTrackPointSchema]
});
export const GliderModel = ObservationModel.discriminator<IObservationDocument & Glider>('glider', GliderSchema);

const CTDSchema = new Schema({
  cruiseId: { type: String, required: true }
});
export const CTDModel = ObservationModel.discriminator<IObservationDocument & CTDObservation>('ctd', CTDSchema);

const MooringSchema = new Schema({
  stationId: { type: String, required: true },
  sensorDepths: [{ type: Number, required: true }]
});
export const MooringModel = ObservationModel.discriminator<IObservationDocument & Mooring>('mooring', MooringSchema);

const BGCSchema = new Schema({
  platformType: { type: String, required: true }
});
export const BGCModel = ObservationModel.discriminator<IObservationDocument & BGCObservation>('bgc', BGCSchema);
