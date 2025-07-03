export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  description: string;
}

export interface Slot {
  day: Date;
  hour: number;
}

export interface DragState {
  startSlot: Slot | null;
  endSlot: Slot | null;
  isDragging: boolean;
}

// Base interfaces
export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: number; // in seconds
  category?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  color: string;
  category?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  duration_minutes: number;
}

export interface EventStats {
  total_events: number;
  total_minutes: number;
  events_by_category: Record<string, number>;
  busiest_days: Array<{ date: string; event_count: number }>;
  busiest_hours: Array<{ hour: number; event_count: number }>;
}

export interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "yearly";
  interval?: number;
  max?: number;
  end?: string;
  days?: number[]; // For weekly recurrence
}

export interface CreateRecurringEventData {
  title: string;
  description?: string;
  start: string;
  duration?: number;
  category?: string;
  pattern: RecurrencePattern;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  time: string;
  notifier: string;
  action: string;
  notify?: string[]; // Duration strings like "10m", "1h"
}

export interface ValidationResult {
  valid: boolean;
  conflicts?: CalendarEvent[];
}

// Protocol interfaces (keeping existing ones)
export interface ArgumentDefinition {
  name: string;
  type: string;
  choices?: string[];
  required: boolean;
  description: string;
}

export interface ProtocolStep {
  agent: string;
  function: string;
  parameters: Record<string, string | number | boolean | null>;
  parameter_mappings: Record<string, string>;
}

export interface Protocol {
  name: string;
  description: string;
  argument_definitions: ArgumentDefinition[];
  trigger_phrases: string[];
  steps: ProtocolStep[];
}

export interface ProtocolRunResult {
  protocol: string;
  results: Record<string, unknown>;
  status?: "success" | "error" | "running";
  duration?: number;
  error?: string;
}

export interface NewEvent {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  category: string;
  recurring: boolean;
  recurrencePattern: RecurrencePattern;
  isTask: boolean;
  notifier: string;
  action: string;
  notifications: string[];
}

export interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "yearly";
  interval?: number;
  max?: number;
}
