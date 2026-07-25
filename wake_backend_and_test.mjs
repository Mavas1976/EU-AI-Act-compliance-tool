import https from 'node:https';
import fs from 'node:fs/promises';
import path from 'node:path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = "https://suhanasayyad-ai-act-compliance-backend.hf.space";
const endpoints = ["fria", "cybersecurity", "xai", "risk", "bias"];

const payload = {
  system_name: "ING CreditScore Decision Engine v2.4",
  organisation_name: "ING Bank N.V.",
  intended_purpose: "Automated credit scoring for personal loan applications",
  affected_population: "Personal loan applicants in EU",
  estimated_users_per_year: 50000,
  model_version: "2.4.0",
  uses_personal_data: true,
  model_type: "Gradient Boosted Trees",
  automated_decision_making: true,
  human_oversight_available: true,
  uses_special_category_data: false,
  data_sources: "Credit bureau records, transaction history",
  data_retention_period: "36 months",
  third_party_data_sharing: false,
  external_api_access: true,
  access_controls_implemented: true,
  audit_logging_enabled: true,
  previously_audited: true,
  known_bias_issues: false,
  deployment_sector: "Banking and Financial Services",
  explainability_method: "SHAP",
  model_api_endpoint: null
};

async function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = JSON.stringify(data);
    const req = https.request(u, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      },
      timeout: 30000
    }, (res) => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => resolve({ status: res.statusCode, data: chunks }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(bodyStr);
    req.end();
  });
}

const OUT = path.resolve('downloaded-site/backend-api-responses');
await fs.mkdir(OUT, { recursive: true });

for (let attempt = 1; attempt <= 6; attempt++) {
  console.log(`\n--- Attempt ${attempt} ---`);
  let allOk = true;
  for (const ep of endpoints) {
    const urlNoSlash = `${BASE_URL}/api/${ep}/assess`;
    const urlSlash = `${BASE_URL}/api/${ep}/assess/`;
    
    let res = await postJson(urlSlash, payload).catch(e => ({ status: 500, data: e.message }));
    if (res.status !== 200) {
      res = await postJson(urlNoSlash, payload).catch(e => ({ status: 500, data: e.message }));
    }
    console.log(`  -> ${ep}: HTTP ${res.status} (${res.data.length} bytes)`);
    if (res.status === 200) {
      await fs.writeFile(path.join(OUT, `${ep}-assessment.json`), res.data, 'utf8');
    } else {
      allOk = false;
    }
  }
  if (allOk) {
    console.log("\n[SUCCESS] All 5 backend microservices responded with HTTP 200 OK!");
    break;
  }
  console.log("Waiting 15s for Hugging Face space container to finish cold-start spin up...");
  await new Promise(r => setTimeout(r, 15000));
}
