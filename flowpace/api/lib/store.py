from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from .models import CompletedRoutine, Routine, AppSettings

# In-memory store (shared across requests in the same serverless instance)
_mem = {
    "routines": [],
    "completed": [],
    "settings": AppSettings(),
}

# Optional JSON persistence for local dev (vercel dev has a writable fs)
_data_dir = Path(__file__).parent.parent.parent / "data"
_routines_file = _data_dir / "routines.json"
_completed_file = _data_dir / "completed.json"
_settings_file = _data_dir / "settings.json"


def _to_json(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError


def _from_json(dct):
    for k, v in dct.items():
        if k == "completed_at" and isinstance(v, str):
            try:
                dct[k] = datetime.fromisoformat(v)
            except ValueError:
                pass
    return dct


def _load_json():
    if _routines_file.exists():
        try:
            data = json.loads(_routines_file.read_text())
            _mem["routines"] = [Routine(**r) for r in data]
        except Exception:
            pass
    if _completed_file.exists():
        try:
            data = json.loads(_completed_file.read_text(), object_hook=_from_json)
            _mem["completed"] = [CompletedRoutine(**c) for c in data]
        except Exception:
            pass
    if _settings_file.exists():
        try:
            data = json.loads(_settings_file.read_text())
            _mem["settings"] = AppSettings(**data)
        except Exception:
            pass


def _save_json():
    try:
        _data_dir.mkdir(exist_ok=True)
        _routines_file.write_text(json.dumps([r.model_dump() for r in _mem["routines"]], default=_to_json))
        _completed_file.write_text(json.dumps([c.model_dump() for c in _mem["completed"]], default=_to_json))
        _settings_file.write_text(json.dumps(_mem["settings"].model_dump()))
    except Exception:
        pass


def get_routines() -> List[Routine]:
    _load_json()
    return _mem["routines"]


def get_routine(routine_id: str) -> Optional[Routine]:
    _load_json()
    return next((r for r in _mem["routines"] if r.id == routine_id), None)


def add_routine(routine: Routine) -> Routine:
    _load_json()
    _mem["routines"].append(routine)
    _save_json()
    return routine


def update_routine(routine: Routine) -> Optional[Routine]:
    _load_json()
    for i, r in enumerate(_mem["routines"]):
        if r.id == routine.id:
            _mem["routines"][i] = routine
            _save_json()
            return routine
    return None


def delete_routine(routine_id: str) -> bool:
    _load_json()
    before = len(_mem["routines"])
    _mem["routines"] = [r for r in _mem["routines"] if r.id != routine_id]
    if len(_mem["routines"]) != before:
        _save_json()
        return True
    return False


def reorder_routines(ordered_ids: List[str]):
    _load_json()
    id_map = {r.id: r for r in _mem["routines"]}
    _mem["routines"] = [id_map[rid] for rid in ordered_ids if rid in id_map]
    _save_json()


def record_completion(completion: CompletedRoutine):
    _load_json()
    _mem["completed"].append(completion)
    _save_json()


def get_completions() -> List[CompletedRoutine]:
    _load_json()
    return _mem["completed"]


def get_settings() -> AppSettings:
    _load_json()
    return _mem["settings"]


def update_settings(settings: AppSettings):
    _mem["settings"] = settings
    _save_json()
