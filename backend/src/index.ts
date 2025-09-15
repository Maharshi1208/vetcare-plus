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
import paymentRoutes from './payments/routes';
import healthRoutes from './health/routes';
import reportsRoutes from './reports/routes'; 
import payRoutes from './pay/routes';
// -----------------------------
const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString: DATABASE_URL });

// Health
app.get('/', (_req, res) => res.send('VetCare+ API is running'));
app.get('/health', (_req, res) => res.status(200).json({ ok: true, uptime: process.uptime(), timestamp: new Date().toISOString() }));
app.get('/ping', (_req, res) => res.json({ ok: true, msg: 'VetCare+ API up' }));
app.get('/health/db', async (_req, res) => {
  try {
    const r = await pool.query('SELECT 1 as ok');
    res.json({ ok: true, db: r.rows[0]?.ok === 1 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'db error';
    res.status(500).json({ ok: false, error: msg });
  }
});

// Feature routes
app.use('/auth', authRoutes);
app.use('/pets', petRoutes);
app.use('/vets', vetRoutes);
app.use('/appointments', apptRoutes);
app.use('/payments', paymentRoutes);
app.use('/pet-health', healthRoutes);
app.use('/reports', reportsRoutes); 
app.use('/payments', payRoutes);
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  try { await pool.end(); } catch {}
  process.exit(0);
});
