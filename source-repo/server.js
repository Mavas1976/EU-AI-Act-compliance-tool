const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const targetPort = Number(process.env.PORT || 3000);

console.log(`[INIT] Starting SPA server. PORT env: ${process.env.PORT}`);
console.log(`[INIT] DIST directory: ${DIST}`);
console.log(`[INIT] DIST exists: ${fs.existsSync(DIST)}`);

function handle(req, res) {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'healthy', dist: fs.existsSync(DIST) }));
  }
  let p = path.join(DIST, (req.url || '/').split('?')[0]);
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    p = path.join(DIST, 'index.html');
  }
  const ext = path.extname(p).toLowerCase();
  const mime = { 
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
  fs.readFile(p, (err, data) => {
    if (err) { 
      res.writeHead(404, { 'Content-Type': 'text/plain' }); 
      res.end('Not Found'); 
    } else { 
      res.writeHead(200, { 
        'Content-Type': mime[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
      }); 
      res.end(data); 
    }
  });
}

// Bind unprivileged ports only (>= 1024) to avoid Linux EACCES permission errors
const ports = Array.from(new Set([targetPort, 3000, 8080, 7860])).filter(p => !isNaN(p) && p >= 1024);

ports.forEach(port => {
  const s = http.createServer(handle);
  s.on('error', (e) => console.log(`[PORT ${port}] Warning: ${e.message}`));
  s.listen(port, '0.0.0.0', () => console.log(`[ONLINE] Listening on http://0.0.0.0:${port}`));
});
