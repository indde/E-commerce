const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db/database'); // inicializa o banco e cria as tabelas, se preciso

const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const settingsRouter = require('./routes/settings');
const requireAdmin = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// o painel admin exige usuário e senha — essa rota precisa vir ANTES do
// express.static, senão o arquivo seria servido livremente pra qualquer um
app.get('/admin.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/settings', settingsRouter);

app.listen(PORT, () => {
  console.log(`Loja rodando em http://localhost:${PORT}`);
  console.log(`Painel admin em http://localhost:${PORT}/admin.html`);
});
