// Proteção simples do painel admin com usuário e senha (HTTP Basic Auth).
// Por padrão usa admin / admin123 — troque isso definindo as variáveis de
// ambiente ADMIN_USER e ADMIN_PASSWORD na sua hospedagem (Render).

function requireAdmin(req, res, next) {
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'admin123';

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Painel Admin"');
    return res.status(401).send('Autenticação necessária para acessar o painel admin.');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [user, pass] = credentials.split(':');

  if (user === expectedUser && pass === expectedPass) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Painel Admin"');
  return res.status(401).send('Usuário ou senha incorretos.');
}

module.exports = requireAdmin;
