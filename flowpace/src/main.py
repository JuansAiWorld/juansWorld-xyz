from __future__ import annotations

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn

from .models import (
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
from .data_store import store

app = FastAPI(title="FlowPace")

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/sounds", StaticFiles(directory="static/sounds"), name="sounds")


# ---------- Helpers ----------

def flatten_routine(routine: Routine) -> List[Step]:
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


class UpdateSettingsRequest(AppSettings):
    pass


# ---------- Routes ----------

@app.get("/", response_class=HTMLResponse)
async def root():
    with open("templates/index.html", "r") as f:
        return HTMLResponse(content=f.read())


# Routines
@app.get("/api/routines")
async def get_routines() -> List[Routine]:
    return store.get_routines()


@app.get("/api/routines/{routine_id}")
async def get_routine(routine_id: str) -> Routine:
    routine = store.get_routine(routine_id)
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    return routine


@app.post("/api/routines")
async def create_routine(req: CreateRoutineRequest) -> Routine:
    routine = Routine(name=req.name, steps=req.steps)
    store.add_routine(routine)
    return routine


@app.put("/api/routines/{routine_id}")
async def update_routine(routine_id: str, req: UpdateRoutineRequest) -> Routine:
    if routine_id != req.id:
        raise HTTPException(status_code=400, detail="ID mismatch")
    routine = Routine(id=req.id, name=req.name, steps=req.steps)
    updated = store.update_routine(routine)
    if not updated:
        raise HTTPException(status_code=404, detail="Routine not found")
    return updated


@app.delete("/api/routines/{routine_id}")
async def delete_routine(routine_id: str):
    if not store.delete_routine(routine_id):
        raise HTTPException(status_code=404, detail="Routine not found")
    return {"ok": True}


@app.post("/api/routines/reorder")
async def reorder_routines(req: ReorderRequest):
    store.reorder_routines(req.ordered_ids)
    return {"ok": True}


@app.post("/api/routines/{routine_id}/duplicate")
async def duplicate_routine(routine_id: str) -> Routine:
    source = store.get_routine(routine_id)
    if not source:
        raise HTTPException(status_code=404, detail="Routine not found")
    dup = Routine(name=f"{source.name} (Copy)", steps=[s.model_copy(deep=True) for s in source.steps])
    for item in dup.steps:
        item.id = str(__import__("uuid").uuid4())
    store.add_routine(dup)
    return dup


# Timer helpers
@app.get("/api/routines/{routine_id}/flatten")
async def flatten(routine_id: str) -> List[Step]:
    routine = store.get_routine(routine_id)
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    return flatten_routine(routine)


# Completions
@app.get("/api/completions")
async def get_completions() -> List[CompletedRoutine]:
    return store.get_completions()


@app.post("/api/completions")
async def record_completion(req: CompleteRoutineRequest) -> CompletedRoutine:
    completion = CompletedRoutine(routine_name=req.routine_name, total_duration=req.total_duration)
    store.record_completion(completion)
    return completion


# Analytics
@app.get("/api/analytics")
async def get_analytics(time_range: str = "week"):
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
    sorted_completions = sorted(completions, key=lambda c: c.completed_at, reverse=True)
    streak = 0
    check_date = now.date()
    seen_dates = set()
    for c in sorted_completions:
        cdate = c.completed_at.date()
        if cdate == check_date or (cdate == check_date - timedelta(days=1) and cdate not in seen_dates):
            if cdate not in seen_dates:
                streak += 1
                seen_dates.add(cdate)
                check_date = cdate
        else:
            break

    # routine breakdown
    breakdown = {}
    for c in filtered:
        if c.routine_name not in breakdown:
            breakdown[c.routine_name] = {"count": 0, "total_time": 0.0}
        breakdown[c.routine_name]["count"] += 1
        breakdown[c.routine_name]["total_time"] += c.total_duration

    breakdown_list = [
        {"name": k, "count": v["count"], "total_time": v["total_time"]}
        for k, v in sorted(breakdown.items(), key=lambda x: x[1]["count"], reverse=True)
    ]

    return {
        "total_sessions": total_sessions,
        "total_time": total_time,
        "avg_duration": avg_duration,
        "streak": streak,
        "breakdown": breakdown_list,
        "completions": [
            {
                "routine_name": c.routine_name,
                "total_duration": c.total_duration,
                "completed_at": c.completed_at.isoformat(),
            }
            for c in filtered
        ],
    }


# Settings
@app.get("/api/settings")
async def get_settings() -> AppSettings:
    return store.get_settings()


@app.put("/api/settings")
async def update_settings(req: UpdateSettingsRequest) -> AppSettings:
    store.update_settings(req)
    return req


# Sound packs
@app.get("/api/soundpacks")
async def get_soundpacks() -> List[SoundPack]:
    return BUILTIN_PACKS


# Sample data
@app.post("/api/seed")
async def seed_data():
    if store.get_routines():
        return {"seeded": False, "reason": "Already has data"}

    sample = [
        Routine(
            name="Quick HIIT",
            steps=[
                RoutineItem.from_step(Step(name="Jumping Jacks", duration=30, color=StepColor.red)),
                RoutineItem.from_step(Step(name="Rest", duration=15, color=StepColor.green)),
                RoutineItem.from_step(Step(name="Burpees", duration=30, color=StepColor.orange)),
                RoutineItem.from_step(Step(name="Rest", duration=15, color=StepColor.green)),
                RoutineItem.from_step(Step(name="Mountain Climbers", duration=30, color=StepColor.blue)),
                RoutineItem.from_step(Step(name="Rest", duration=15, color=StepColor.green)),
            ],
        ),
        Routine(
            name="Study Pomodoro",
            steps=[
                RoutineItem.from_step(Step(name="Focus", duration=25 * 60, color=StepColor.blue)),
                RoutineItem.from_step(Step(name="Short Break", duration=5 * 60, color=StepColor.green)),
                RoutineItem.from_step(Step(name="Focus", duration=25 * 60, color=StepColor.blue)),
                RoutineItem.from_step(Step(name="Short Break", duration=5 * 60, color=StepColor.green)),
                RoutineItem.from_step(Step(name="Focus", duration=25 * 60, color=StepColor.blue)),
                RoutineItem.from_step(Step(name="Long Break", duration=15 * 60, color=StepColor.purple)),
            ],
        ),
        Routine(
            name="Tabata Workout",
            steps=[
                RoutineItem.from_group(
                    Group(
                        name="Tabata Round",
                        steps=[
                            Step(name="Work", duration=20, color=StepColor.red),
                            Step(name="Rest", duration=10, color=StepColor.green),
                        ],
                        loop_count=8,
                        color=StepColor.purple,
                    )
                )
            ],
        ),
    ]

    for r in sample:
        store.add_routine(r)

    return {"seeded": True, "count": len(sample)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
