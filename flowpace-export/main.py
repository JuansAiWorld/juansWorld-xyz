"""FlowPace Standalone — FastAPI backend + static frontend export.

Run:  python main.py
      uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel
from typing import List
import uvicorn

from src.models import (
    Routine,
    RoutineItem,
    Step,
    Group,
    CompletedRoutine,
    AppSettings,
    SoundPack,
    BUILTIN_PACKS,
    StepColor,
)
from src.data_store import store

app = FastAPI(title="FlowPace")

# Ensure data directory exists
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)


# ---------- Request Models ----------

class CreateRoutineRequest(BaseModel):
    name: str
    steps: List[RoutineItem]


class UpdateRoutineRequest(BaseModel):
    id: str
    name: str
    steps: List[RoutineItem]


class CompleteRoutineRequest(BaseModel):
    routine_name: str
    total_duration: float


class ReorderRequest(BaseModel):
    ordered_ids: List[str]


class SyncDataRequest(BaseModel):
    routines: List[Routine]
    completions: List[CompletedRoutine]
    settings: AppSettings
    device_id: str = "default"


# ---------- API Routes (mounted at /api/flowpace) ----------

@app.get("/api/flowpace/routines")
def get_routines() -> List[Routine]:
    return store.get_routines()


@app.get("/api/flowpace/routines/{routine_id}")
def get_routine(routine_id: str) -> Routine:
    r = store.get_routine(routine_id)
    if not r:
        raise HTTPException(status_code=404, detail="Routine not found")
    return r


@app.post("/api/flowpace/routines")
def create_routine(req: CreateRoutineRequest) -> Routine:
    r = Routine(name=req.name, steps=req.steps)
    store.add_routine(r)
    return r


@app.put("/api/flowpace/routines/{routine_id}")
def update_routine(routine_id: str, req: UpdateRoutineRequest) -> Routine:
    if routine_id != req.id:
        raise HTTPException(status_code=400, detail="ID mismatch")
    r = Routine(id=req.id, name=req.name, steps=req.steps)
    updated = store.update_routine(r)
    if not updated:
        raise HTTPException(status_code=404, detail="Routine not found")
    return updated


@app.delete("/api/flowpace/routines/{routine_id}")
def delete_routine(routine_id: str):
    if not store.delete_routine(routine_id):
        raise HTTPException(status_code=404, detail="Routine not found")
    return {"ok": True}


@app.post("/api/flowpace/routines/reorder")
def reorder_routines(req: ReorderRequest):
    store.reorder_routines(req.ordered_ids)
    return {"ok": True}


@app.post("/api/flowpace/routines/{routine_id}/duplicate")
def duplicate_routine(routine_id: str) -> Routine:
    source = store.get_routine(routine_id)
    if not source:
        raise HTTPException(status_code=404, detail="Routine not found")
    dup = Routine(name=f"{source.name} (Copy)", steps=[s.model_copy(deep=True) for s in source.steps])
    for item in dup.steps:
        item.id = str(__import__("uuid").uuid4())
    store.add_routine(dup)
    return dup


@app.get("/api/flowpace/routines/{routine_id}/flatten")
def flatten_routine(routine_id: str) -> List[Step]:
    routine = store.get_routine(routine_id)
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    steps: List[Step] = []
    for item in routine.steps:
        if item.type == "step" and item.duration > 0:
            steps.append(Step(id=item.id, name=item.name, duration=item.duration, color=item.color))
        elif item.type == "group" and item.steps:
            for _ in range(item.loop_count or 1):
                for s in item.steps:
                    if s.duration > 0:
                        steps.append(Step(id=s.id, name=s.name, duration=s.duration, color=s.color))
    return steps


@app.get("/api/flowpace/completions")
def get_completions() -> List[CompletedRoutine]:
    return store.get_completions()


@app.post("/api/flowpace/completions")
def record_completion(req: CompleteRoutineRequest) -> CompletedRoutine:
    c = CompletedRoutine(routine_name=req.routine_name, total_duration=req.total_duration)
    store.record_completion(c)
    return c


@app.get("/api/flowpace/settings")
def get_settings() -> AppSettings:
    return store.get_settings()


@app.put("/api/flowpace/settings")
def update_settings(req: AppSettings) -> AppSettings:
    store.update_settings(req)
    return req


@app.get("/api/flowpace/soundpacks")
def get_soundpacks() -> List[SoundPack]:
    return BUILTIN_PACKS


@app.post("/api/flowpace/sync")
def sync_data(req: SyncDataRequest):
    for r in req.routines:
        existing = store.get_routine(r.id)
        if existing:
            store.update_routine(r)
        else:
            store.add_routine(r)
    client_ids = {r.id for r in req.routines}
    for r in list(store.get_routines()):
        if r.id not in client_ids:
            store.delete_routine(r.id)
    for c in req.completions:
        store.record_completion(c)
    store.update_settings(req.settings)
    return {"ok": True}


@app.get("/api/flowpace/sync")
def get_sync_data():
    return {
        "routines": [r.model_dump() for r in store.get_routines()],
        "completions": [c.model_dump() for c in store.get_completions()],
        "settings": store.get_settings().model_dump(),
    }


@app.post("/api/flowpace/seed")
def seed_data():
    if store.get_routines():
        return {"seeded": False}
    sample = [
        Routine(name="Quick HIIT", steps=[
            RoutineItem.from_step(Step(name="Jumping Jacks", duration=30, color=StepColor.red)),
            RoutineItem.from_step(Step(name="Rest", duration=15, color=StepColor.green)),
            RoutineItem.from_step(Step(name="Burpees", duration=30, color=StepColor.orange)),
            RoutineItem.from_step(Step(name="Rest", duration=15, color=StepColor.green)),
            RoutineItem.from_step(Step(name="Mountain Climbers", duration=30, color=StepColor.blue)),
            RoutineItem.from_step(Step(name="Rest", duration=15, color=StepColor.green)),
        ]),
        Routine(name="Study Pomodoro", steps=[
            RoutineItem.from_step(Step(name="Focus", duration=25*60, color=StepColor.blue)),
            RoutineItem.from_step(Step(name="Short Break", duration=5*60, color=StepColor.green)),
            RoutineItem.from_step(Step(name="Focus", duration=25*60, color=StepColor.blue)),
            RoutineItem.from_step(Step(name="Short Break", duration=5*60, color=StepColor.green)),
            RoutineItem.from_step(Step(name="Focus", duration=25*60, color=StepColor.blue)),
            RoutineItem.from_step(Step(name="Long Break", duration=15*60, color=StepColor.purple)),
        ]),
        Routine(name="Tabata Workout", steps=[
            RoutineItem.from_group(Group(name="Tabata Round", steps=[
                Step(name="Work", duration=20, color=StepColor.red),
                Step(name="Rest", duration=10, color=StepColor.green),
            ], loop_count=8, color=StepColor.purple))
        ]),
    ]
    for r in sample:
        store.add_routine(r)
    return {"seeded": True, "count": len(sample)}


# ---------- Static Files ----------

static_dir = Path(__file__).parent / "static"
app.mount("/flowpace", StaticFiles(directory=str(static_dir), html=True), name="static")


@app.get("/")
def root():
    return RedirectResponse(url="/flowpace/")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
