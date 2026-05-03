from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from .models import CompletedRoutine, Routine, AppSettings

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

ROUTINES_FILE = DATA_DIR / "routines.json"
COMPLETED_FILE = DATA_DIR / "completed.json"
SETTINGS_FILE = DATA_DIR / "settings.json"


def _datetime_encoder(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def _datetime_decoder(dct):
    for key, value in dct.items():
        if key == "completed_at" and isinstance(value, str):
            try:
                dct[key] = datetime.fromisoformat(value)
            except ValueError:
                pass
    return dct


class DataStore:
    def __init__(self):
        self.routines: List[Routine] = []
        self.completed: List[CompletedRoutine] = []
        self.settings = AppSettings()
        self._load()

    def _load(self):
        if ROUTINES_FILE.exists():
            try:
                data = json.loads(ROUTINES_FILE.read_text())
                self.routines = [Routine(**r) for r in data]
            except Exception:
                self.routines = []
        if COMPLETED_FILE.exists():
            try:
                data = json.loads(COMPLETED_FILE.read_text(), object_hook=_datetime_decoder)
                self.completed = [CompletedRoutine(**c) for c in data]
            except Exception:
                self.completed = []
        if SETTINGS_FILE.exists():
            try:
                data = json.loads(SETTINGS_FILE.read_text())
                self.settings = AppSettings(**data)
            except Exception:
                self.settings = AppSettings()

    def _save_routines(self):
        ROUTINES_FILE.write_text(json.dumps([r.model_dump() for r in self.routines], default=_datetime_encoder, indent=2))

    def _save_completed(self):
        COMPLETED_FILE.write_text(json.dumps([c.model_dump() for c in self.completed], default=_datetime_encoder, indent=2))

    def _save_settings(self):
        SETTINGS_FILE.write_text(json.dumps(self.settings.model_dump(), indent=2))

    # Routines
    def get_routines(self) -> List[Routine]:
        return self.routines

    def get_routine(self, routine_id: str) -> Optional[Routine]:
        return next((r for r in self.routines if r.id == routine_id), None)

    def add_routine(self, routine: Routine) -> Routine:
        self.routines.append(routine)
        self._save_routines()
        return routine

    def update_routine(self, routine: Routine) -> Optional[Routine]:
        for i, r in enumerate(self.routines):
            if r.id == routine.id:
                self.routines[i] = routine
                self._save_routines()
                return routine
        return None

    def delete_routine(self, routine_id: str) -> bool:
        before = len(self.routines)
        self.routines = [r for r in self.routines if r.id != routine_id]
        if len(self.routines) != before:
            self._save_routines()
            return True
        return False

    def reorder_routines(self, ordered_ids: List[str]):
        id_map = {r.id: r for r in self.routines}
        self.routines = [id_map[rid] for rid in ordered_ids if rid in id_map]
        self._save_routines()

    # Completed
    def record_completion(self, completion: CompletedRoutine):
        self.completed.append(completion)
        self._save_completed()

    def get_completions(self) -> List[CompletedRoutine]:
        return self.completed

    # Settings
    def get_settings(self) -> AppSettings:
        return self.settings

    def update_settings(self, settings: AppSettings):
        self.settings = settings
        self._save_settings()


store = DataStore()
