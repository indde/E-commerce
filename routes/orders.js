const express = require('express');
const db = require('../db/database');

const router = express.Router();

// POST /api/orders — salva o pedido no banco antes de redirecionar pro WhatsApp
router.post('/', (req, res) => {
  const { items, total } = req.body;
  if (!items || total == null) {
    return res.status(400).json({ error: 'Pedido inválido.' });
  }
  const stmt = db.prepare('INSERT INTO orders (items, total) VALUES (?, ?)');
  const result = stmt.run(JSON.stringify(items), total);
  res.status(201).json({ id: result.lastInsertRowid });
});

// GET /api/orders — histórico de pedidos (usado na tela de admin)
router.get('/', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
});

module.exports = router;
