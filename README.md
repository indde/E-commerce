# Loja E-commerce (com banco de dados)

Sistema de loja virtual completo: vitrine, carrinho, checkout via WhatsApp,
painel administrativo para cadastrar produtos com foto, e banco de dados
SQLite (arquivo local, não precisa instalar nada externo).

## Estrutura de pastas

```
loja-ecommerce/
├── server.js              # servidor Express
├── package.json
├── db/
│   ├── database.js        # cria e configura o banco SQLite
│   └── loja.db             # criado automaticamente na 1ª execução
├── routes/
│   ├── products.js        # API de produtos
│   ├── orders.js          # API de pedidos
│   └── settings.js        # API de configurações da loja
└── public/                # tudo que roda no navegador
    ├── index.html          # loja (vitrine)
    ├── admin.html          # painel admin
    ├── css/style.css
    ├── js/store.js
    ├── js/admin.js
    └── uploads/            # fotos dos produtos enviadas pelo admin
```

## Como rodar

Pré-requisito: ter o [Node.js](https://nodejs.org) instalado (versão 18 ou superior).

```bash
cd loja-ecommerce
npm install
npm start
```

Depois é só acessar:

- **Loja:** http://localhost:3000
- **Painel admin:** http://localhost:3000/admin.html

## Como usar

1. Abra o **painel admin** e preencha o nome da loja, o slogan e o número
   de WhatsApp (com DDI+DDD, só números, ex: `5511999999999`).
2. Ainda no painel admin, cadastre seus produtos: nome, descrição, preço
   e a foto (upload direto do computador).
3. Abra a loja — os produtos aparecem automaticamente, puxados do banco
   de dados.
4. O cliente monta o carrinho e, ao finalizar, é redirecionado ao WhatsApp
   com o pedido já escrito. O pedido também fica salvo no banco (tabela
   `orders`), para você ter histórico.

## Colocando no ar (hospedagem)

Esse projeto tem um servidor (back-end), então não dá pra hospedar em
serviços que só servem arquivos estáticos (como GitHub Pages). Use um
serviço que rode Node.js, por exemplo:

- **Render** (render.com) — plano gratuito, detecta o `npm start` sozinho
- **Railway** (railway.app)
- **Fly.io**
- Uma VPS própria com Node.js instalado (ex: Hostinger, DigitalOcean)

Em todos eles, o passo é parecido: subir esta pasta (ou conectar o
repositório Git), rodar `npm install` e depois `npm start`.

**Atenção:** o banco de dados (`loja.db`) e as imagens em `public/uploads`
ficam salvos no disco do servidor. Se sua hospedagem tiver disco
"efêmero" (perde arquivos a cada deploy, como é comum em planos
gratuitos), o ideal é depois migrar para um banco externo (ex:
PostgreSQL) e um serviço de armazenamento de imagens (ex: Cloudinary).
Para começar e validar a loja, o modelo atual já funciona bem.

## Próximos passos possíveis

- Autenticação simples no painel admin (usuário/senha)
- Pagamento automático (Pix ou cartão) em vez de checkout manual pelo WhatsApp
- Editar produto existente (a API já tem a rota `PUT /api/products/:id` pronta)
