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
