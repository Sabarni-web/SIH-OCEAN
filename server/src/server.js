"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
// Load environment variables from workspace root or local directory
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || '';
if (mongoUri) {
    mongoose_1.default.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        family: 4 // Force IPv4 for local DNS SRV resolution
    })
        .then(() => console.log('Successfully connected to MongoDB.'))
        .catch((err) => console.error('MongoDB connection error (Operating in Demo Mode):', err.message));
}
else {
    console.warn('MONGO_URI is not defined in the environment variables.');
}
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Basic Route
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
const dataset_routes_1 = __importDefault(require("./routes/dataset.routes"));
const comparison_routes_1 = __importDefault(require("./routes/comparison.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const alert_routes_1 = __importDefault(require("./routes/alert.routes"));
const observation_routes_1 = __importDefault(require("./routes/observation.routes"));
const currents_routes_1 = __importDefault(require("./routes/currents.routes"));
// Mock routes setup (Placeholder for later)
const apiRouter = express_1.default.Router();
apiRouter.use('/datasets', dataset_routes_1.default);
apiRouter.use('/comparison', comparison_routes_1.default);
apiRouter.use('/analytics', analytics_routes_1.default);
apiRouter.use('/alerts', alert_routes_1.default);
apiRouter.use('/observations', observation_routes_1.default);
apiRouter.use('/currents', currents_routes_1.default);
// apiRouter.get('/model', (req, res) => res.json({ message: 'Model data' })); // TODO: integrate model route
app.use('/api', apiRouter);
// Centralized error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=server.js.map