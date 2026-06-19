# Fix: Backend Root 404 and Vercel Deployment

## Problem
`https://backend-gray-eta-82.vercel.app/` returns **"Cannot GET /"** (HTML 404) because the Express app has no handler for `GET /`.

## Root Cause
`backend/src/app.ts` only defines routes under `/api/*`. There is:
- No `GET /` route
- No catch-all middleware — Express falls through to its default HTML 404
- Non-API paths return HTML instead of JSON

## Files to Modify

### 1. `backend/src/app.ts`

**Change: Add root route + catch-all 404 middleware**

After the last route mount (`app.use("/api/contractors", contractorRoutes);` on line 57) and before `app.use(errorHandler)` on line 63:

```typescript
app.get("/", (_req, res) => {
  res.json({
    name: "FixFlow API",
    version: "1.0.0",
    status: "running",
    docs: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

export default app;
```

**Before:**
```
GET  /          → "Cannot GET /" (Express HTML 404)
GET  /api/health → {"status":"ok"}
POST /api/auth/login → works
GET  /api       → "Cannot GET /api" (Express HTML 404)
```

**After:**
```
GET  /          → {"name":"FixFlow API","version":"1.0.0","status":"running","docs":"/api/health"}
GET  /api/health → {"status":"ok"}
POST /api/auth/login → works
GET  /api       → {"error":"Route not found"} (JSON 404)
```

### 2. Verify `backend/vercel.json`

This file is correct — routes `/(.*)` → `index.ts` which exports the Express app.

```json
{
  "builds": [{ "src": "index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "index.ts" }]
}
```

### 3. Verify `vercel.json` (root)

Root config for the frontend monorepo deployment. Routes `/api/*` to the backend serverless function.

```json
{
  "framework": "nextjs",
  "buildCommand": "cd Frontend && npm run build",
  "installCommand": "cd Frontend && npm install",
  "outputDirectory": "Frontend/.next",
  "builds": [
    { "src": "backend/index.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/index.ts" }
  ]
}
```

## Verification

After deploying the updated code:

```bash
# Test the root endpoint
curl https://backend-gray-eta-82.vercel.app/
# → {"name":"FixFlow API","version":"1.0.0","status":"running","docs":"/api/health"}

# Test health endpoint
curl https://backend-gray-eta-82.vercel.app/api/health
# → {"status":"ok","timestamp":"..."}

# Test 404 for unknown paths
curl https://backend-gray-eta-82.vercel.app/api
# → {"error":"Route not found"}
```
