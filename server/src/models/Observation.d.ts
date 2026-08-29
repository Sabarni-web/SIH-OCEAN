import mongoose, { Document } from 'mongoose';
import type { Observation, ArgoFloat, Glider, CTDObservation, Mooring, BGCObservation } from '../../../shared/types';
export interface IObservationDocument extends Omit<Observation, 'id'>, Document {
}
export declare const ObservationModel: mongoose.Model<IObservationDocument, {}, {}, {}, Document<unknown, {}, IObservationDocument, {}, mongoose.DefaultSchemaOptions> & IObservationDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IObservationDocument>;
export declare const ArgoModel: mongoose.Model<IObservationDocument & ArgoFloat, {}, {}, {}, Document<unknown, {}, IObservationDocument & ArgoFloat, {}, mongoose.DefaultSchemaOptions> & IObservationDocument & ArgoFloat & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IObservationDocument & ArgoFloat>;
export declare const GliderModel: mongoose.Model<IObservationDocument & Glider, {}, {}, {}, Document<unknown, {}, IObservationDocument & Glider, {}, mongoose.DefaultSchemaOptions> & IObservationDocument & Glider & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IObservationDocument & Glider>;
export declare const CTDModel: mongoose.Model<IObservationDocument & CTDObservation, {}, {}, {}, Document<unknown, {}, IObservationDocument & CTDObservation, {}, mongoose.DefaultSchemaOptions> & IObservationDocument & CTDObservation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IObservationDocument & CTDObservation>;
export declare const MooringModel: mongoose.Model<IObservationDocument & Mooring, {}, {}, {}, Document<unknown, {}, IObservationDocument & Mooring, {}, mongoose.DefaultSchemaOptions> & IObservationDocument & Mooring & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IObservationDocument & Mooring>;
export declare const BGCModel: mongoose.Model<IObservationDocument & BGCObservation, {}, {}, {}, Document<unknown, {}, IObservationDocument & BGCObservation, {}, mongoose.DefaultSchemaOptions> & IObservationDocument & BGCObservation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IObservationDocument & BGCObservation>;
//# sourceMappingURL=Observation.d.ts.map