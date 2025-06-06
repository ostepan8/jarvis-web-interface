export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  time: string; // "YYYY-MM-DD HH:MM"
  duration: number; // seconds
}

import { CalendarEvent } from "@/components/calendar/types";

const API_BASE = "http://localhost:8080";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % COLORS.length;
  }
  return COLORS[hash];
}

function parseApiEvent(e: ApiEvent): CalendarEvent {
  // Dates from the server are in UTC. Append a 'Z' so the browser parses the
  // timestamp as UTC before converting it to the local timezone.
  const start = new Date(e.time.replace(" ", "T") + "Z");
  const end = new Date(start.getTime() + e.duration * 1000);
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    start,
    end,
    color: colorForId(e.id),
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (data.status !== "ok") {
    throw new Error(data.message || "Request failed");
  }
  return data.data;
}

export async function getAllEvents(): Promise<CalendarEvent[]> {
  const res = await fetch(`${API_BASE}/events`);
  const data: ApiEvent[] = await handleResponse(res);
  return data.map(parseApiEvent);
}

export async function getNextEvent(): Promise<CalendarEvent> {
  const res = await fetch(`${API_BASE}/events/next`);
  const data: ApiEvent = await handleResponse(res);
  return parseApiEvent(data);
}

export async function getDayEvents(date: string): Promise<CalendarEvent[]> {
  const res = await fetch(`${API_BASE}/events/day/${date}`);
  const data: ApiEvent[] = await handleResponse(res);
  return data.map(parseApiEvent);
}

export async function getWeekEvents(date: string): Promise<CalendarEvent[]> {
  const res = await fetch(`${API_BASE}/events/week/${date}`);
  const data: ApiEvent[] = await handleResponse(res);
  return data.map(parseApiEvent);
}

export async function getMonthEvents(month: string): Promise<CalendarEvent[]> {
  const res = await fetch(`${API_BASE}/events/month/${month}`);
  const data: ApiEvent[] = await handleResponse(res);
  return data.map(parseApiEvent);
}

export interface NewEventData {
  title: string;
  description: string;
  time: string; // YYYY-MM-DD HH:MM
  duration: number; // seconds
}

export async function createEvent(newEvent: NewEventData): Promise<CalendarEvent> {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newEvent),
  });
  const data: ApiEvent = await handleResponse(res);
  return parseApiEvent(data);
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await handleResponse(res);
}
