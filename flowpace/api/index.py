from __future__ import annotations

from datetime import datetime, timedelta
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from lib.models import (
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
from lib import store

app = FastAPI(title="FlowPace")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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


# ---------- Routines ----------
@app.get("/api/routines")
def get_routines() -> List[Routine]:
    return store.get_routines()


@app.get("/api/routines/{routine_id}")
def get_routine(routine_id: str) -> Routine:
    r = store.get_routine(routine_id)
    if not r:
        raise HTTPException(status_code=404, detail="Routine not found")
    return r


@app.post("/api/routines")
def create_routine(req: CreateRoutineRequest) -> Routine:
    r = Routine(name=req.name, steps=req.steps)
    store.add_routine(r)
    return r


@app.put("/api/routines/{routine_id}")
def update_routine(routine_id: str, req: UpdateRoutineRequest) -> Routine:
    if routine_id != req.id:
        raise HTTPException(status_code=400, detail="ID mismatch")
    r = Routine(id=req.id, name=req.name, steps=req.steps)
    updated = store.update_routine(r)
    if not updated:
        raise HTTPException(status_code=404, detail="Routine not found")
    return updated


@app.delete("/api/routines/{routine_id}")
def delete_routine(routine_id: str):
    if not store.delete_routine(routine_id):
        raise HTTPException(status_code=404, detail="Routine not found")
    return {"ok": True}


@app.post("/api/routines/reorder")
def reorder_routines(req: ReorderRequest):
    store.reorder_routines(req.ordered_ids)
    return {"ok": True}


@app.post("/api/routines/{routine_id}/duplicate")
def duplicate_routine(routine_id: str) -> Routine:
    source = store.get_routine(routine_id)
    if not source:
        raise HTTPException(status_code=404, detail="Routine not found")
    dup = Routine(name=f"{source.name} (Copy)", steps=[s.model_copy(deep=True) for s in source.steps])
    for item in dup.steps:
        item.id = str(__import__("uuid").uuid4())
    store.add_routine(dup)
    return dup


# ---------- Completions ----------
@app.get("/api/completions")
def get_completions() -> List[CompletedRoutine]:
    return store.get_completions()


@app.post("/api/completions")
def record_completion(req: CompleteRoutineRequest) -> CompletedRoutine:
    c = CompletedRoutine(routine_name=req.routine_name, total_duration=req.total_duration)
    store.record_completion(c)
    return c


# ---------- Settings ----------
@app.get("/api/settings")
def get_settings() -> AppSettings:
    return store.get_settings()


@app.put("/api/settings")
def update_settings(req: AppSettings) -> AppSettings:
    store.update_settings(req)
    return req


# ---------- Analytics ----------
@app.get("/api/analytics")
def get_analytics(time_range: str = "week"):
    completions = store.get_completions()
    now = datetime.utcnow()

    if time_range == "week":
        start = now - timedelta(days=now.weekday())
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
    elif time_range == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif time_range == "year":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start = now - timedelta(days=7)

    filtered = [c for c in completions if c.completed_at >= start]
    total_sessions = len(filtered)
    total_time = sum(c.total_duration for c in filtered)
    avg_duration = total_time / total_sessions if total_sessions else 0

    # streak
    sorted_c = sorted(completions, key=lambda x: x.completed_at, reverse=True)
    streak = 0
    check_date = now.date()
    seen = set()
    for c in sorted_c:
        d = c.completed_at.date()
        if d == check_date or (d == check_date - timedelta(days=1) and d not in seen):
            if d not in seen:
                streak += 1
                seen.add(d)
                check_date = d
        else:
            break

    # breakdown
    bd = {}
    for c in filtered:
        if c.routine_name not in bd:
            bd[c.routine_name] = {"count": 0, "total_time": 0.0}
        bd[c.routine_name]["count"] += 1
        bd[c.routine_name]["total_time"] += c.total_duration

    bd_list = [{"name": k, "count": v["count"], "total_time": v["total_time"]} for k, v in sorted(bd.items(), key=lambda x: x[1]["count"], reverse=True)]

    return {
        "total_sessions": total_sessions,
        "total_time": total_time,
        "avg_duration": avg_duration,
        "streak": streak,
        "breakdown": bd_list,
        "completions": [{"routine_name": c.routine_name, "total_duration": c.total_duration, "completed_at": c.completed_at.isoformat()} for c in filtered],
    }


# ---------- Sound Packs ----------
@app.get("/api/soundpacks")
def get_soundpacks() -> List[SoundPack]:
    return BUILTIN_PACKS


# ---------- Bulk Sync ----------
@app.post("/api/sync")
def sync_data(req: SyncDataRequest):
    # For MVP: overwrite server data with client data
    # In production this should merge properly
    for r in req.routines:
        existing = store.get_routine(r.id)
        if existing:
            store.update_routine(r)
        else:
            store.add_routine(r)
    # Remove routines not in client payload
    client_ids = {r.id for r in req.routines}
    for r in list(store.get_routines()):
        if r.id not in client_ids:
            store.delete_routine(r.id)
    for c in req.completions:
        store.record_completion(c)
    store.update_settings(req.settings)
    return {"ok": True}


@app.get("/api/sync")
def get_sync_data():
    return {
        "routines": [r.model_dump() for r in store.get_routines()],
        "completions": [c.model_dump() for c in store.get_completions()],
        "settings": store.get_settings().model_dump(),
    }


# ---------- Seed ----------
@app.post("/api/seed")
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
