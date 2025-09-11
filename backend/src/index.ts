import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL as string;

// Create a small, pooled Postgres client (for /health/db)
const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Routes
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
    const result = await pool.query('select 1 as ok');
    res.json({ ok: true, db: result.rows[0] });
  } catch (err: any) {
    console.error('DB health error:', err); // helpful for debugging
    res.status(500).json({ ok: false, error: err?.message || 'db error' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});