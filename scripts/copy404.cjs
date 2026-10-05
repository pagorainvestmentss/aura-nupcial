// SPA fallback para o GitHub Pages: rotas profundas (ex.: /convite/slug/token)
// são servidas com o index.html para o React Router resolver a rota.
const fs = require('fs');
fs.copyFileSync('dist/index.html', 'dist/404.html');
