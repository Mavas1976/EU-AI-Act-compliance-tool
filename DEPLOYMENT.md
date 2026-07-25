# Deployment Guide

## Architecture

```
┌──────────────────────┐      ┌──────────────────────┐
│  Vercel (Frontend)   │ POST │  Railway (Backend)    │
│  React + Vite        │ ───→ │  FastAPI + Python 3.11│
│                      │      │  + Neo4j Aura (cloud) │
└──────────────────────┘      └──────────────────────┘
```

---

## Backend: Deploy to Railway.app

### 1. Create Railway project

Go to [railway.app](https://railway.app), create a new project, and connect this GitHub repo.

### 2. Set environment variables

In Railway dashboard → Variables, add:

| Variable | Value | Required |
|---|---|---|
| `NEO4J_URI` | `neo4j+s://your-instance.databases.neo4j.io` | ✅ |
| `NEO4J_USERNAME` | `neo4j` | ✅ |
| `NEO4J_PASSWORD` | Your Neo4j Aura password | ✅ |
| `PORT` | Railway auto-assigns this | Auto |

### 3. Set root directory

In Railway service settings, set:
- **Root Directory:** `source-repo/eu-ai-act-compliance-tool/backend`
- **Builder:** Dockerfile

Railway will detect the `Dockerfile` and build automatically.

### 4. Get your backend URL

After deploy, Railway gives you a URL like:
```
https://your-service-name.up.railway.app
```

---

## Frontend: Deploy to Vercel

### 1. Import repo to Vercel

Go to [vercel.com](https://vercel.com), import the GitHub repo.

### 2. Configure build settings

| Setting | Value |
|---|---|
| **Root Directory** | `source-repo` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Framework Preset** | Vite |

### 3. Set environment variable

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://your-service-name.up.railway.app` |

> **Important:** Vite bakes env vars at build time. After setting `VITE_API_BASE_URL`, redeploy.

---

## Neo4j Aura Setup (Free Tier)

1. Go to [neo4j.com/cloud/aura](https://neo4j.com/cloud/aura/) and create a free instance
2. Save the connection URI, username, and password
3. On first backend start, `knowledge_graph.py` automatically creates the full schema:
   - Compliance nodes (Articles 9, 10, 13, 15, 27)
   - Rights nodes (7 EU Charter rights)
   - Threat nodes (8 MITRE ATLAS categories)
   - 5 typed relationships with DPV v2.3 + AIRO ontology annotations

---

## Local Development

```bash
# Backend
cd source-repo/eu-ai-act-compliance-tool/backend
pip install -r requirements.txt
# Set NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD in .env
uvicorn main:app --host 0.0.0.0 --port 7860 --reload

# Frontend
cd source-repo
npm install
VITE_API_BASE_URL=http://localhost:7860 npm run dev
```

---

## Verifying the deployment

```bash
# Backend health check
curl https://your-railway-url.up.railway.app/health
# Expected: {"status": "healthy"}

# Backend root
curl https://your-railway-url.up.railway.app/
# Expected: {"message":"EU AI Act Compliance Tool API is running","version":"1.0.0",...}

# Full API docs
# Open: https://your-railway-url.up.railway.app/docs
```
