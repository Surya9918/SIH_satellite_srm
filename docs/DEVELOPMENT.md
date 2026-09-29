# 🔧 Development Guide

This guide covers setting up your local environment to contribute to Satellite-SRM.

## Setup Methods

### Option 1: Native Windows Setup (Conda)
Use the bundled batch scripts:
1. Run `setup_conda.bat` to create the conda environment and install dependencies.
2. Run `start.bat` to build the frontend and serve it.
3. (Future boots) Run `start_conda.bat` to skip installation.

### Option 2: Linux / macOS Setup
Use the bash script:
1. Run `bash scripts/setup.sh`.
2. Start backend: `cd backend-main/Satellite_SRM_DL && source .venv/bin/activate && uvicorn server:app --reload`
3. Start frontend: `cd satellite-srm-frontend && npm run dev`

## Code Standards
- **Python**: We use `flake8` for linting. We aim to conform to PEP8 standards.
- **TypeScript**: We use `eslint` and `prettier`. 

To lint the entire project, run:
```bash
bash scripts/lint.sh
```

## Submitting Pull Requests
- Create feature branches off `main`.
- Ensure tests pass and the linters show no errors.
- Follow the PR template.
