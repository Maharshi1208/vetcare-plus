import dotenv from 'dotenv';
dotenv.config();

import './config/env';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

// Feature routers
import authRoutes from './auth/routes';
import petRoutes from './pet/routes';
import vetRoutes from './vet/routes';
import apptRoutes from './appt/routes';
import paymentRoutes from './payments/routes';   // <- consolidate here
import healthRoutes from './health/routes';
import reportsRoutes from './reports/routes';    // <- keep yours
import adminRoutes from './admin/routes';        // <- keep main
// If you still need the experimental pay routes, mount them under a different base:
// import payRoutes from './pay/routes';

const app = express();
app.use(cors());
app.use(express.json());

// If you have a typed env module, you can import constants from it instead.
// For now, keep it simple & consistent:
const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL as string;

const pool = new Pool({ connectionString: DATABASE_URL });

// Health
app.get('/', (_req, res) => res.send('VetCare+ API is running'));
app.get('/health', (_req, res) =>
  res.status(200).json({ ok: true, uptime: process.uptime(), timestamp: new Date().toISOString() })
);
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
app.use('/payments', paymentRoutes); // single source of truth
app.use('/pet-health', healthRoutes);
app.use('/reports', reportsRoutes);
app.use('/admin', adminRoutes);

// If keeping experimental pay routes temporarily:
// app.use('/pay', payRoutes);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  try {
    await pool.end();
  } catch {}
  process.exit(0);
});
