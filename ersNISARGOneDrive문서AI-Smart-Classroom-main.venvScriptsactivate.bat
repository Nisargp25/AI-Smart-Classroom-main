{
  "scripts": {
"backend": ".venv\\Scripts\\python -m uvicorn server:app --app-dir backend --host 0.0.0.0 --port 8000 --reload",
    "start": "npm --prefix frontend start",
    "build": "cd frontend && npm install && npm run build",
    "test": "npm --prefix frontend run test"
  }
}
