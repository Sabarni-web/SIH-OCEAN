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
exports.BGCModel = exports.MooringModel = exports.CTDModel = exports.GliderModel = exports.ArgoModel = exports.ObservationModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ObservationSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['argo', 'glider', 'ctd', 'mooring', 'bgc'], required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    depth: { type: Number, required: true },
    timestamp: { type: String, required: true },
    variables: { type: mongoose_1.Schema.Types.Mixed, required: true },
    status: { type: String, required: true }
}, { discriminatorKey: 'type', timestamps: true });
ObservationSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
exports.ObservationModel = mongoose_1.default.model('Observation', ObservationSchema);
// Discriminators for specific instrument types
const ArgoSchema = new mongoose_1.Schema({
    wmoId: { type: String, required: true },
    cycleNumber: { type: Number, required: true }
});
exports.ArgoModel = exports.ObservationModel.discriminator('argo', ArgoSchema);
const GliderTrackPointSchema = new mongoose_1.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    depth: { type: Number, required: true },
    timestamp: { type: String, required: true },
    variables: { type: mongoose_1.Schema.Types.Mixed, required: true }
}, { _id: false });
const GliderSchema = new mongoose_1.Schema({
    deploymentId: { type: String, required: true },
    track: [GliderTrackPointSchema]
});
exports.GliderModel = exports.ObservationModel.discriminator('glider', GliderSchema);
const CTDSchema = new mongoose_1.Schema({
    cruiseId: { type: String, required: true }
});
exports.CTDModel = exports.ObservationModel.discriminator('ctd', CTDSchema);
const MooringSchema = new mongoose_1.Schema({
    stationId: { type: String, required: true },
    sensorDepths: [{ type: Number, required: true }]
});
exports.MooringModel = exports.ObservationModel.discriminator('mooring', MooringSchema);
const BGCSchema = new mongoose_1.Schema({
    platformType: { type: String, required: true }
});
exports.BGCModel = exports.ObservationModel.discriminator('bgc', BGCSchema);
//# sourceMappingURL=Observation.js.map