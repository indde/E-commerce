const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db/database');

const router = express.Router();

// onde as fotos enviadas pelo admin são salvas
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `produto-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// GET /api/products — lista todos os produtos
router.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(products);
});

// POST /api/products — cria um novo produto (aceita upload de imagem no campo "image")
router.post('/', upload.single('image'), (req, res) => {
  const { name, description, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const stmt = db.prepare('INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)');
  const result = stmt.run(name, description || '', Number(price), image);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(product);
});

// PUT /api/products/:id — edita um produto existente
router.put('/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Produto não encontrado.' });

  const name = req.body.name || existing.name;
  const description = req.body.description ?? existing.description;
  const price = req.body.price ? Number(req.body.price) : existing.price;
  const image = req.file ? `/uploads/${req.file.filename}` : existing.image;

  db.prepare('UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?')
    .run(name, description, price, image, id);

  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
});

// DELETE /api/products/:id — remove um produto
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
