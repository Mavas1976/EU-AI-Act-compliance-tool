# Downloader voor de publieke AI Act Compliance-site

Deze downloader legt vast wat een normale browser tijdens publiek gebruik ontvangt:

- HTML vóór en na de workflow
- JavaScript, CSS, afbeeldingen en fonts
- Fetch/XHR/API-responses
- Een volledige HAR met response-inhoud
- Local Storage, Session Storage en zichtbare cookies
- Door de site aangeboden downloads
- Screenshots en een URL-manifest

Hij omzeilt geen login, autorisatie of andere beveiliging. Gebruik uitsluitend fictieve gegevens.

## Uitvoeren

Installeer Node.js 20 of hoger. Open daarna een terminal in deze map:

```bash
npm install
npx playwright install chromium
npm run download
```

Er opent een browser. Doorloop de hele tool, download alle rapporten en druk daarna in de terminal op Enter. De resultaten verschijnen in `downloaded-site/`.

## Belangrijk

Voer geen echte klant-, ING-, model- of persoonsgegevens in. De tool kan invoer naar externe API's sturen of server-side bewaren.
