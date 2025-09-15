"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
// Feature routers
const routes_1 = __importDefault(require("./auth/routes"));
const routes_2 = __importDefault(require("./pet/routes"));
const routes_3 = __importDefault(require("./vet/routes"));
const routes_4 = __importDefault(require("./appt/routes"));
const routes_5 = __importDefault(require("./payments/routes"));
const routes_6 = __importDefault(require("./health/routes"));
const routes_7 = __importDefault(require("./reports/routes"));
const routes_8 = __importDefault(require("./pay/routes"));
const notify_routes_1 = __importDefault(require("./routes/notify.routes"));
// -----------------------------
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString: DATABASE_URL });
// Health
app.get('/', (_req, res) => res.send('VetCare+ API is running'));
app.get('/health', (_req, res) => res.status(200).json({ ok: true, uptime: process.uptime(), timestamp: new Date().toISOString() }));
app.get('/ping', (_req, res) => res.json({ ok: true, msg: 'VetCare+ API up' }));
app.get('/health/db', async (_req, res) => {
    try {
        const r = await pool.query('SELECT 1 as ok');
        res.json({ ok: true, db: r.rows[0]?.ok === 1 });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'db error';
        res.status(500).json({ ok: false, error: msg });
    }
});
// Feature routes
app.use('/auth', routes_1.default);
app.use('/pets', routes_2.default);
app.use('/vets', routes_3.default);
app.use('/appointments', routes_4.default);
app.use('/payments', routes_5.default);
app.use('/pet-health', routes_6.default);
app.use('/reports', routes_7.default);
app.use('/payments', routes_8.default);
app.use("/notify", notify_routes_1.default);
app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
process.on('SIGINT', async () => {
    try {
        await pool.end();
    }
    catch { }
    process.exit(0);
});
