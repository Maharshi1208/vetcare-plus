import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

// Feature routers
import authRoutes from './auth/routes';
import petRoutes from './pet/routes';
import vetRoutes from './vet/routes';
// import apptRoutes from './appt/routes'; // uncomment when appointments branch merges

// -----------------------------
// Create app FIRST
// -----------------------------
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ENV
const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL as string;

// PG pool (for health check)
const pool = new Pool({ connectionString: DATABASE_URL });

// -----------------------------
// Health / root routes (public)
// -----------------------------
app.get('/', (_req, res) => {
  res.send('VetCare+ API is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/ping', (_req, res) => {
  res.json({ ok: true, msg: 'VetCare+ API up' });
});

app.get('/health/db', async (_req, res) => {
  try {
    const r = await pool.query('SELECT 1 as ok');
    res.json({ ok: true, db: r.rows[0]?.ok === 1 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'db error';
    res.status(500).json({ ok: false, error: msg });
  }
});

// -----------------------------
// Feature routes
// -----------------------------
app.use('/auth', authRoutes);
//app.use('/pets', petRoutes);
app.use('/vets', vetRoutes);
// app.use('/appointments', apptRoutes); // enable after appointments PR merges

// -----------------------------
// Start & graceful shutdown
// -----------------------------
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  try { await pool.end(); } catch {}
  process.exit(0);
});
