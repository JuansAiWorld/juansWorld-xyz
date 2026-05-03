# FlowPace — Standalone Python Export

FastAPI backend + PWA frontend. Self-contained, no Next.js, no Redis, no auth required.

## Run locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

Open http://localhost:8000/flowpace/

## Project layout

```
main.py           # FastAPI entry point — serves /flowpace/ static files + /api/flowpace/* API
requirements.txt  # Python dependencies
src/models.py     # Pydantic data models
src/data_store.py # JSON file persistence (data/*.json)
static/           # Frontend PWA files (HTML, CSS, JS, sounds, icons)
data/             # Runtime JSON data files (created automatically)
```

## Notes

- Data is stored in `data/routines.json`, `data/completed.json`, and `data/settings.json`.
- The frontend is the same PWA used in the Next.js version.
- No service worker issues here — the backend serves `/flowpace/` directly without redirects.
