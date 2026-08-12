const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// o arquivo loja.db é criado automaticamente aqui dentro na primeira execução
// (usa o módulo de banco de dados que já vem embutido no Node.js, sem precisar compilar nada)
const db = new DatabaseSync(path.join(__dirname, 'loja.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// valores padrão de configuração — só entram na primeira vez que o banco é criado
const defaults = {
  store_name: 'Nome da Loja',
  tagline: 'Troque por seu slogan ou nicho',
  whatsapp_number: '5511999999999'
};
const insertDefault = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(defaults)) {
  insertDefault.run(key, value);
}

// alguns produtos de exemplo, só para a loja não abrir vazia (pode apagar pelo admin)
const count = db.prepare('SELECT COUNT(*) AS total FROM products').get().total;
if (count === 0) {
  const insertProduct = db.prepare(
    'INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)'
  );
  insertProduct.run('Produto de exemplo', 'Edite ou apague pelo painel admin.', 49.9, null);
}

module.exports = db;
