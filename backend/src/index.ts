import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

// Feature routers
import authRoutes from './auth/routes';
import petRoutes from './pet/routes';
import vetRoutes from './vet/routes';
import apptRoutes from './appt/routes';

// ------------------------------
// Create app FIRST (before any app.use)
// ------------------------------
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ENV
const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL as string;

// PG pool (for health check)
const pool = new Pool({ connectionString: DATABASE_URL });

// --- Health (public) ---
app.get('/ping', (_req, res) => {
  res.json({ ok: true, msg: 'VetCare+ API up' });
});

app.get('/health/db', async (_req, res) => {
  try {
    const r = await pool.query('SELECT 1 as ok');
    res.json({ ok: true, db: r.rows[0]?.ok === 1 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'db error';
    res.status(500).json({ ok: false, error: msg });
  }
});

// --- Feature routes (protected inside routers) ---
app.use('/auth', authRoutes);
app.use('/pets', petRoutes);
app.use('/vets', vetRoutes);
app.use('/appointments', apptRoutes);

// Start
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try { await pool.end(); } catch {}
  process.exit(0);
});
