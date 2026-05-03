export type StepColor =
  | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray' | 'black';

export interface Step {
  id: string;
  name: string;
  duration: number;
  color: StepColor;
}

export interface Group {
  id: string;
  name: string;
  steps: Step[];
  loop_count: number;
  color: StepColor;
}

export interface RoutineItem {
  id: string;
  type: 'step' | 'group';
  name: string;
  duration: number;
  color: StepColor;
  steps?: Step[] | null;
  loop_count?: number | null;
}

export interface Routine {
  id: string;
  name: string;
  steps: RoutineItem[];
}

export interface CompletedRoutine {
  id: string;
  routine_name: string;
  total_duration: number;
  completed_at: string; // ISO
}

export interface AppSettings {
  is_pro: boolean;
  is_audio_enabled: boolean;
  is_voice_enabled: boolean;
  volume: number;
  selected_sound_pack: string;
  background_color: StepColor;
}

export interface SoundPack {
  id: string;
  display_name: string;
  description: string;
  emoji: string;
  category: string;
}

export const BUILTIN_PACKS: SoundPack[] = [
  { id: 'coffee_flow', display_name: 'Coffee Shop Flow', description: 'Deep work sessions', emoji: '☕', category: 'Productivity' },
  { id: 'executive_suite', display_name: 'Executive Suite', description: 'Power working mode', emoji: '🏢', category: 'Productivity' },
  { id: 'dopamine_hits', display_name: 'Dopamine Hits', description: 'Gamify your tasks', emoji: '🎯', category: 'Productivity' },
  { id: 'deep_focus', display_name: 'Deep Focus', description: 'Pomodoro sessions', emoji: '🌊', category: 'Productivity' },
  { id: 'startup_energy', display_name: 'Startup Energy', description: 'Build momentum', emoji: '⚡', category: 'Productivity' },
  { id: 'boxing_gym', display_name: 'Boxing Gym', description: 'Train like a champion', emoji: '🥊', category: 'Fitness' },
  { id: 'zen_garden', display_name: 'Zen Garden', description: 'Yoga & meditation', emoji: '🧘', category: 'Fitness' },
  { id: '8bit_arcade', display_name: '8-Bit Arcade', description: 'Gamify workouts', emoji: '🎮', category: 'Fitness' },
  { id: 'beach_training', display_name: 'Beach Training', description: 'Outdoor vibes', emoji: '🏖️', category: 'Fitness' },
  { id: 'space_mission', display_name: 'Space Mission', description: 'Make it epic', emoji: '🚀', category: 'Fitness' },
  { id: 'default', display_name: 'Default', description: 'Clean system sounds', emoji: '🔊', category: 'Classic' },
  { id: 'minimal', display_name: 'Minimal', description: 'Subtle glass sounds', emoji: '🔔', category: 'Classic' },
  { id: 'energetic', display_name: 'Energetic', description: 'High-energy alerts', emoji: '⚡', category: 'Classic' },
];
