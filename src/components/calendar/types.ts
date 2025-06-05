export interface CalendarEvent {
  id: number;
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
