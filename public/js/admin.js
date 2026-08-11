const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

async function loadSettingsForm() {
  const res = await fetch('/api/settings');
  const settings = await res.json();
  document.getElementById('store_name').value = settings.store_name || '';
  document.getElementById('tagline').value = settings.tagline || '';
  document.getElementById('whatsapp_number').value = settings.whatsapp_number || '';
}

document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    store_name: document.getElementById('store_name').value,
    tagline: document.getElementById('tagline').value,
    whatsapp_number: document.getElementById('whatsapp_number').value
  };
  await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  alert('Configurações salvas!');
});

async function loadProductsList() {
  const res = await fetch('/api/products');
  const products = await res.json();
  const list = document.getElementById('admin-list');

  if (products.length === 0) {
    list.innerHTML = `<p class="empty-msg">Nenhum produto cadastrado ainda.</p>`;
    return;
  }

  list.innerHTML = '';
  products.forEach(p => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    const imgSrc = p.image || 'https://via.placeholder.com/100?text=Sem+Foto';
    row.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}">
      <div class="meta">
        <strong>${p.name}</strong>
        <span>${fmt(p.price)}</span>
      </div>
      <button class="delete-btn" data-id="${p.id}">Excluir</button>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Excluir este produto?')) return;
      await fetch(`/api/products/${btn.dataset.id}`, { method: 'DELETE' });
      loadProductsList();
    });
  });
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  await fetch('/api/products', {
    method: 'POST',
    body: formData
  });

  form.reset();
  loadProductsList();
});

loadSettingsForm();
loadProductsList();
