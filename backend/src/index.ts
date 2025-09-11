import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import authRoutes from './auth/routes'; // ⬅️ NEW: auth router

const app = express();

// Basic middleware
app.use(cors());              // you can restrict origin later if needed
app.use(express.json());

// ENV
const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL as string;

// Small pooled Postgres client (used for /health/db)
const pool = new Pool({
  connectionString: DATABASE_URL,
});

// --- Health routes ---
app.get('/ping', (_req, res) => {
  res.json({ ok: true, msg: 'VetCare+ API up' });
});

app.get('/health/db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT 1 as ok');
    // Return a simple boolean instead of the whole row
    res.json({ ok: true, db: result.rows[0]?.ok === 1 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'db error';
    res.status(500).json({ ok: false, error: msg });
  }
});

// --- Feature routes ---
app.use('/auth', authRoutes); // ⬅️ NEW: /auth/register, /auth/login, /auth/me

// Start server
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// Graceful shutdown (optional, helps when nodemon/ts-node-dev restarts)
process.on('SIGINT', async () => {
  try { await pool.end(); } catch {}
  process.exit(0);
});
