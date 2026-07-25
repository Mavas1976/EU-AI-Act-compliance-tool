# Downloader for the public AI Act Compliance site

This downloader captures what a normal browser receives during public usage:

- HTML before and after the workflow
- JavaScript, CSS, images and fonts
- Fetch/XHR/API responses
- A complete HAR with response content
- Local Storage, Session Storage and visible cookies
- Downloads offered by the site
- Screenshots and a URL manifest

It does not bypass any login, authorisation or other security measures. Use only fictitious data.

## Running

Install Node.js 20 or higher. Then open a terminal in this directory:

```bash
npm install
npx playwright install chromium
npm run download
```

A browser will open. Walk through the entire tool, download all reports, then press Enter in the terminal. The results will appear in `downloaded-site/`.

## Important

Do not enter any real customer, bank, model or personal data. The tool may send input to external APIs or store it server-side.
