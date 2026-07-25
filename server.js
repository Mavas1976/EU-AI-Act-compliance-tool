const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

console.log(`[STARTUP] Environment PORT: ${process.env.PORT}`);
console.log(`[STARTUP] Target DIST path: ${DIST}`);
console.log(`[STARTUP] DIST exists: ${fs.existsSync(DIST)}`);
if (fs.existsSync(DIST)) {
  console.log(`[STARTUP] DIST contents:`, fs.readdirSync(DIST));
}

const server = http.createServer((req, res) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'healthy', dist_exists: fs.existsSync(DIST) }));
  }

  let reqUrl = (req.url || '/').split('?')[0];
  let filePath = path.join(DIST, reqUrl === '/' ? 'index.html' : reqUrl);
  
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(`<html><body><h1>Frontend Server Running</h1><p>Dist directory state: ${fs.existsSync(DIST) ? 'Present' : 'Missing'}</p></body></html>`);
  }

  const ext = path.extname(filePath).toLowerCase();
  const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
  };
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error: ' + err.message);
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[ONLINE] Frontend SPA server running on http://0.0.0.0:${PORT}`);
});
