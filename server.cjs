const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const port1 = Number(process.env.PORT || 3000);
const port2 = 3000;

console.log(`[STARTUP] Built-in HTTP SPA Server starting. process.env.PORT: ${process.env.PORT}`);
console.log(`[STARTUP] DIST path: ${DIST}, exists: ${fs.existsSync(DIST)}`);

function handleRequest(req, res) {
  const urlPath = (req.url || '/').split('?')[0];
  
  if (urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'healthy', dist_exists: fs.existsSync(DIST) }));
  }

  let filePath = path.join(DIST, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

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
  const ext = path.extname(filePath).toLowerCase();
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
}

// Bind both port1 (process.env.PORT) and port2 (3000) uniquely
const portsToListen = Array.from(new Set([port1, port2])).filter(p => !isNaN(p) && p > 0);

portsToListen.forEach(p => {
  try {
    const srv = http.createServer(handleRequest);
    srv.on('error', (e) => console.log(`[PORT ${p}] Note: ${e.message}`));
    srv.listen(p, '0.0.0.0', () => {
      console.log(`[ONLINE] HTTP SPA server listening on http://0.0.0.0:${p}`);
    });
  } catch (e) {
    console.log(`[PORT ${p}] Exception: ${e.message}`);
  }
});
