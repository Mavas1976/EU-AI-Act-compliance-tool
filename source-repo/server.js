import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const targetPort = Number(process.env.PORT || 3000);
const DIST = path.join(__dirname, 'dist');

console.log(`[EXPRESS STARTUP] PORT env: ${process.env.PORT}`);
console.log(`[EXPRESS STARTUP] Target DIST: ${DIST}`);
console.log(`[EXPRESS STARTUP] DIST exists: ${fs.existsSync(DIST)}`);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', dist_exists: fs.existsSync(DIST) });
});

app.use(express.static(DIST));

app.get('*', (req, res) => {
  const indexPath = path.join(DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Frontend build dist/index.html not found.');
  }
});

// Bind to targetPort, 80, 3000, 8080, 7860 simultaneously
const portsToBind = Array.from(new Set([targetPort, 80, 3000, 8080, 7860])).filter(p => !isNaN(p) && p > 0);

portsToBind.forEach(port => {
  try {
    const srv = http.createServer(app);
    srv.on('error', (err) => {
      console.log(`[PORT ${port}] Warning: ${err.message}`);
    });
    srv.listen(port, '0.0.0.0', () => {
      console.log(`[ONLINE] Express listening on http://0.0.0.0:${port}`);
    });
  } catch (err) {
    console.log(`[PORT ${port}] Exception: ${err.message}`);
  }
});
