# AI Smart Classroom

This repository is organized to keep frontend, backend, configuration, documentation, and automation files clearly separated for easier maintenance and GitHub collaboration.

## Project Structure

```text
AI-Smart-Classroom-main/
|-- backend/                    # FastAPI backend source
|   |-- ai_service.py
|   |-- auth.py
|   |-- models.py
|   |-- requirements.txt
|   |-- server.py
|   `-- uploads/
|
|-- frontend/                   # React frontend project root
|   |-- public/
|   |-- src/                    # Main frontend source code
|   |   |-- components/         # Reusable UI components
|   |   |-- pages/              # Screen-level/page components
|   |   |-- contexts/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- App.js
|   |   `-- index.js            # Frontend entry point
|   |-- package.json
|   `-- ...
|
|-- config/                     # Project configuration assets
|   `-- design-guidelines.json
|
|-- docs/                       # Project documentation
|   |-- auth-testing.md
|   |-- prd.md
|   `-- test-results.md
|
|-- scripts/                    # Automation and helper scripts
|   `-- start-ai-classroom.ps1
|
|-- assets/                     # Shared static assets (root-level)
|-- styles/                     # Shared global styles (root-level)
|-- tests/                      # Automated tests
|   |-- __init__.py
|   `-- backend_test.py
|-- test_reports/               # Generated test report artifacts
|-- package.json                # Root convenience scripts
`-- .gitignore
```

## Notes on Conventions

- Python files use `snake_case`.
- React components/pages use `PascalCase`.
- Documentation files use `kebab-case`.
- Configuration files are grouped in `config/`.
- Runtime logs and cache artifacts should not be committed.

## Run Commands

- Start frontend from root: `npm start`
- Start backend manually: `python -m uvicorn server:app --app-dir backend --reload`
- Start both using helper script: `./scripts/start-ai-classroom.ps1`

