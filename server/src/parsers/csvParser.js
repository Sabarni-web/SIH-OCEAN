"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCSV = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => {
            // Basic normalization assuming columns might be lat, lon, depth, time, value
            // Note: For a real generic parser, we'd inspect headers and map them dynamically.
            const lat = parseFloat(data.latitude || data.lat);
            const lon = parseFloat(data.longitude || data.lon);
            const depth = parseFloat(data.depth || data.lev || '0');
            const time = data.time || data.timestamp || new Date().toISOString();
            const value = parseFloat(data.temperature || data.temp || data.value || '0'); // Placeholder variable mapping
            if (!isNaN(lat) && !isNaN(lon) && !isNaN(value)) {
                results.push({ lat, lon, depth, time, value });
            }
        })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
};
exports.parseCSV = parseCSV;
//# sourceMappingURL=csvParser.js.map