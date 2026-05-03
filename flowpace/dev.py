import sys
import os

# Mirror Vercel's behavior: add the api/ directory to path so
# `from lib.models import ...` resolves inside api/index.py
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'api'))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from api.index import app

# Mount static files from public/ at root.
# API routes in `app` (e.g. /api/routines) take precedence over static files.
app.mount("/", StaticFiles(directory="public", html=True), name="public")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
