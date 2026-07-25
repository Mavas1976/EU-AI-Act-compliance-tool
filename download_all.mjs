import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const TARGET = 'https://ai-act-credit-compliance.vercel.app/';
const OUT = path.resolve('downloaded-site');
await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(path.join(OUT, 'responses'), { recursive: true });

const safeName = (url, contentType='') => {
  const h = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16);
  let ext = '';
  if (contentType.includes('json')) ext = '.json';
  else if (contentType.includes('javascript')) ext = '.js';
  else if (contentType.includes('html')) ext = '.html';
  else if (contentType.includes('css')) ext = '.css';
  else if (contentType.includes('svg')) ext = '.svg';
  else if (contentType.includes('png')) ext = '.png';
  else if (contentType.includes('jpeg')) ext = '.jpg';
  else if (contentType.includes('webp')) ext = '.webp';
  else if (contentType.includes('pdf')) ext = '.pdf';
  return `${h}${ext}`;
};

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  recordHar: { path: path.join(OUT, 'network.har'), content: 'embed', mode: 'full' },
  acceptDownloads: true,
});
const page = await context.newPage();
const manifest = [];

page.on('response', async (response) => {
  const req = response.request();
  const url = response.url();
  const headers = await response.allHeaders().catch(() => ({}));
  const contentType = headers['content-type'] || '';
  const entry = { url, method: req.method(), status: response.status(), resourceType: req.resourceType(), contentType };
  try {
    const body = await response.body();
    const filename = safeName(url, contentType);
    await fs.writeFile(path.join(OUT, 'responses', filename), body);
    entry.file = `responses/${filename}`;
  } catch (e) {
    entry.error = String(e);
  }
  manifest.push(entry);
});

page.on('download', async (download) => {
  const suggested = download.suggestedFilename();
  const dest = path.join(OUT, 'downloads', suggested);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await download.saveAs(dest);
});

await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 120000 });
await fs.writeFile(path.join(OUT, 'initial-page.html'), await page.content(), 'utf8');
await page.screenshot({ path: path.join(OUT, 'initial-page.png'), fullPage: true });

console.log('\nDoorloop nu handmatig de volledige tool in het geopende browservenster.');
console.log('Gebruik uitsluitend fictieve gegevens. Download elk gegenereerd rapport.');
console.log('Wanneer je klaar bent, keer terug naar deze terminal en druk op Enter.\n');

process.stdin.resume();
await new Promise(resolve => process.stdin.once('data', resolve));

await fs.writeFile(path.join(OUT, 'final-page.html'), await page.content(), 'utf8');
await page.screenshot({ path: path.join(OUT, 'final-page.png'), fullPage: true });

const storage = await page.evaluate(async () => {
  const local = { ...localStorage };
  const session = { ...sessionStorage };
  const cookies = document.cookie;
  const indexedDBs = indexedDB.databases ? await indexedDB.databases() : [];
  return { localStorage: local, sessionStorage: session, cookies, indexedDBs };
});
await fs.writeFile(path.join(OUT, 'browser-storage.json'), JSON.stringify(storage, null, 2));
await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

await context.close();
await browser.close();
console.log(`Klaar. Alles staat in: ${OUT}`);
