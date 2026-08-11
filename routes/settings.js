const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/settings — devolve nome da loja, slogan e número de whatsapp
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

// POST /api/settings — atualiza uma ou mais configurações
router.post('/', (req, res) => {
  const stmt = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  Object.entries(req.body).forEach(([key, value]) => stmt.run(key, value));
  res.json({ ok: true });
});

module.exports = router;
