from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional, Union

from pydantic import BaseModel, Field


class StepColor(str, Enum):
    red = "red"
    orange = "orange"
    yellow = "yellow"
    green = "green"
    blue = "blue"
    purple = "purple"
    pink = "pink"
    gray = "gray"
    black = "black"


class TimerState(str, Enum):
    idle = "idle"
    running = "running"
    paused = "paused"
    completed = "completed"


class Step(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    duration: float  # seconds
    color: StepColor = StepColor.blue


class Group(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    steps: List[Step] = []
    loop_count: int = 1
    color: StepColor = StepColor.purple

    @property
    def total_duration(self) -> float:
        return sum(s.duration for s in self.steps) * self.loop_count


class RoutineItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # "step" or "group"
    name: str
    duration: float
    color: StepColor
    # group fields
    steps: Optional[List[Step]] = None
    loop_count: Optional[int] = None

    @classmethod
    def from_step(cls, step: Step) -> RoutineItem:
        return cls(
            id=step.id,
            type="step",
            name=step.name,
            duration=step.duration,
            color=step.color,
        )

    @classmethod
    def from_group(cls, group: Group) -> RoutineItem:
        return cls(
            id=group.id,
            type="group",
            name=group.name,
            duration=group.total_duration,
            color=group.color,
            steps=group.steps,
            loop_count=group.loop_count,
        )


class Routine(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    steps: List[RoutineItem] = []

    @property
    def total_duration(self) -> float:
        return sum(s.duration for s in self.steps)


class CompletedRoutine(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    routine_name: str
    total_duration: float
    completed_at: datetime = Field(default_factory=datetime.utcnow)


class TimerStep(BaseModel):
    step: Step
    remaining_time: float
    is_active: bool
    step_index: int
    total_steps: int


class TimerProgress(BaseModel):
    current_step: Optional[TimerStep] = None
    next_step: Optional[TimerStep] = None
    overall_progress: float = 0.0
    step_progress: float = 0.0
    total_elapsed: float = 0.0
    total_remaining: float = 0.0


class AppSettings(BaseModel):
    is_pro: bool = False
    is_audio_enabled: bool = True
    is_voice_enabled: bool = False
    volume: float = 0.7
    selected_sound_pack: str = "default"
    background_color: StepColor = StepColor.blue


class SoundPack(BaseModel):
    id: str
    display_name: str
    description: str
    emoji: str
    category: str


BUILTIN_PACKS: List[SoundPack] = [
    SoundPack(id="coffee_flow", display_name="Coffee Shop Flow", description="Deep work sessions", emoji="☕", category="Productivity"),
    SoundPack(id="executive_suite", display_name="Executive Suite", description="Power working mode", emoji="🏢", category="Productivity"),
    SoundPack(id="dopamine_hits", display_name="Dopamine Hits", description="Gamify your tasks", emoji="🎯", category="Productivity"),
    SoundPack(id="deep_focus", display_name="Deep Focus", description="Pomodoro sessions", emoji="🌊", category="Productivity"),
    SoundPack(id="startup_energy", display_name="Startup Energy", description="Build momentum", emoji="⚡", category="Productivity"),
    SoundPack(id="boxing_gym", display_name="Boxing Gym", description="Train like a champion", emoji="🥊", category="Fitness"),
    SoundPack(id="zen_garden", display_name="Zen Garden", description="Yoga & meditation", emoji="🧘", category="Fitness"),
    SoundPack(id="8bit_arcade", display_name="8-Bit Arcade", description="Gamify workouts", emoji="🎮", category="Fitness"),
    SoundPack(id="beach_training", display_name="Beach Training", description="Outdoor vibes", emoji="🏖️", category="Fitness"),
    SoundPack(id="space_mission", display_name="Space Mission", description="Make it epic", emoji="🚀", category="Fitness"),
    SoundPack(id="default", display_name="Default", description="Clean system sounds", emoji="🔊", category="Classic"),
    SoundPack(id="minimal", display_name="Minimal", description="Subtle glass sounds", emoji="🔔", category="Classic"),
    SoundPack(id="energetic", display_name="Energetic", description="High-energy alerts", emoji="⚡", category="Classic"),
]
