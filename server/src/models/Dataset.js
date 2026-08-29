"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DatasetVariableSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    dimensions: [{ type: String }]
}, { _id: false });
const DatasetSchema = new mongoose_1.Schema({
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
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
exports.DatasetModel = mongoose_1.default.model('Dataset', DatasetSchema);
//# sourceMappingURL=Dataset.js.map