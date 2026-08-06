# Deployment Fix Task List

## Backend (Confirmed Working)
- [x] Verify backend syntax (AST parse) — PASSED
- [x] Verify backend imports (models, auth, ai_service) — PASSED
- [x] Verify `import server` creates FastAPI app — PASSED
- [x] Verify uvicorn starts server & root endpoint returns 200 — PASSED

## Frontend Build Blocker (Root cause of `craco: not found`)
- [x] Fix root `package.json` build script: `cd frontend && npm install --legacy-peer-deps && npm run build`
- [x] Verify `npm install --legacy-peer-deps` succeeds (resolves React 19 / react-day-picker peer conflict)
- [x] Verify `npm run build` (craco build) compiles successfully

## CI / Test Fixes
- [x] Create `tests/test_backend_endpoints.py` — pytest-compatible (FastAPI TestClient, no live server)
- [x] Use correct `/auth/dev-session` endpoint in tests
- [x] No emoji in test output (portable across Windows cp1252)
- [x] Update `.github/workflows/ci.yml` backend job to `pip install pytest httpx && python -m pytest tests/ -v` with MongoDB service
- [x] Verify `pytest tests/` discovers and passes 10 tests locally

## Security
- [x] Strengthen JWT secret requirement in `auth.py` — warn & use 32+ byte fallback if too short

## Housekeeping
- [x] Add `*.log`, `backend/_call_llm`, `backend/llm_raw_response.txt` to `.gitignore`
- [x] Untrack `backend/server_stdout.log` (runtime log)

## Remaining (user action required)
- [ ] Commit changes and push to GitHub so Render picks up the fixed build script
- [ ] Redeploy on Render and confirm the build succeeds
