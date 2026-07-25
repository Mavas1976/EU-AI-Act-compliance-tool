const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

console.log(`[STARTUP] Express server starting. PORT=${PORT}`);
console.log(`[STARTUP] Static DIST path=${DIST}, exists=${fs.existsSync(DIST)}`);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', dist_exists: fs.existsSync(DIST) });
});

app.use(express.static(DIST));

app.get('*', (req, res) => {
  const indexPath = path.join(DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('dist/index.html not found');
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[ONLINE] Express SPA listening on http://0.0.0.0:${PORT}`);
});
