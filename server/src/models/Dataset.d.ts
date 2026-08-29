import mongoose, { Document } from 'mongoose';
import type { Dataset } from '../../../shared/types';
export interface IDatasetDocument extends Omit<Dataset, 'id'>, Document {
}
export declare const DatasetModel: mongoose.Model<IDatasetDocument, {}, {}, {}, Document<unknown, {}, IDatasetDocument, {}, mongoose.DefaultSchemaOptions> & IDatasetDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDatasetDocument>;
//# sourceMappingURL=Dataset.d.ts.map