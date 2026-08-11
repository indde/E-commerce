const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

let PRODUCTS = [];
let SETTINGS = {};
let cart = {}; // { productId: qty }

async function loadSettings() {
  const res = await fetch('/api/settings');
  SETTINGS = await res.json();
  document.getElementById('store-name').textContent = SETTINGS.store_name || 'Minha Loja';
  document.getElementById('store-tagline').textContent = SETTINGS.tagline || '';
  document.title = SETTINGS.store_name || 'Loja';
}

async function loadProducts() {
  const res = await fetch('/api/products');
  PRODUCTS = await res.json();
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  if (PRODUCTS.length === 0) {
    grid.innerHTML = `<p class="empty-msg">Nenhum produto cadastrado ainda. Adicione pelo <a class="link-btn" href="/admin.html">painel admin</a>.</p>`;
    return;
  }

  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    const imgSrc = p.image || 'https://via.placeholder.com/500x500?text=Sem+Foto';
    card.innerHTML = `
      <div class="img-wrap"><img src="${imgSrc}" alt="${p.name}" loading="lazy"></div>
      <div class="info">
        <h3>${p.name}</h3>
        <p class="desc">${p.description || ''}</p>
        <div class="price-row">
          <span class="price">${fmt(p.price)}</span>
          <button class="add-btn" data-id="${p.id}">Adicionar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => addToCart(Number(btn.dataset.id)));
  });
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  openCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

function renderCart() {
  const itemsEl = document.getElementById('cart-items');
  const ids = Object.keys(cart);
  const totalCount = ids.reduce((sum, id) => sum + cart[id], 0);
  document.getElementById('cart-count').textContent = totalCount;

  if (ids.length === 0) {
    itemsEl.innerHTML = `<p class="empty-msg">Sua sacola está vazia.<br>Adicione produtos na vitrine.</p>`;
    document.getElementById('checkout-btn').disabled = true;
    document.getElementById('total-value').textContent = fmt(0);
    return;
  }

  itemsEl.innerHTML = '';
  let total = 0;
  ids.forEach(id => {
    const p = PRODUCTS.find(prod => prod.id === Number(id));
    if (!p) return;
    const qty = cart[id];
    total += p.price * qty;
    const line = document.createElement('div');
    line.className = 'cart-line';
    line.innerHTML = `
      <span class="name">${p.name}</span>
      <div class="qty-controls">
        <button data-id="${id}" data-d="-1">–</button>
        <span>${qty}</span>
        <button data-id="${id}" data-d="1">+</button>
      </div>
      <span>${fmt(p.price * qty)}</span>
    `;
    itemsEl.appendChild(line);
  });

  itemsEl.querySelectorAll('button[data-d]').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, Number(btn.dataset.d)));
  });

  document.getElementById('total-value').textContent = fmt(total);
  document.getElementById('checkout-btn').disabled = false;
}

function openCart() {
  document.getElementById('cart').classList.add('open');
  document.getElementById('overlay').classList.add('open');
}
function closeCart() {
  document.getElementById('cart').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

document.getElementById('cart-toggle').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
document.getElementById('overlay').addEventListener('click', closeCart);

document.getElementById('checkout-btn').addEventListener('click', async () => {
  const ids = Object.keys(cart);
  if (ids.length === 0) return;

  const items = ids.map(id => {
    const p = PRODUCTS.find(prod => prod.id === Number(id));
    return { id: p.id, name: p.name, price: p.price, qty: cart[id] };
  });
  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  // salva o pedido no banco de dados antes de mandar pro WhatsApp
  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, total })
    });
  } catch (e) {
    console.error('Não foi possível salvar o pedido:', e);
  }

  let msg = `Olá! Quero fazer o seguinte pedido:%0A%0A`;
  items.forEach(it => {
    msg += `• ${it.qty}x ${it.name} — ${fmt(it.price * it.qty)}%0A`;
  });
  msg += `%0ATotal: ${fmt(total)}`;

  const number = SETTINGS.whatsapp_number || '5511999999999';
  window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
});

loadSettings();
loadProducts();
