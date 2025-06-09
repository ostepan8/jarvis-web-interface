// lib/api.ts
const API_BASE_URL = "http://localhost:8080"; // Adjust to your API server URL

export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: number; // in seconds
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  color: string;
}

// Convert API event to CalendarEvent
const convertApiEventToCalendarEvent = (apiEvent: ApiEvent): CalendarEvent => {
  const start = new Date(apiEvent.time);
  const end = new Date(start.getTime() + apiEvent.duration * 1000);

  // Assign colors based on time of day or other logic
  const hour = start.getHours();
  let color = "#3b82f6"; // default blue
  if (hour < 9) color = "#8b5cf6"; // purple for early morning
  else if (hour < 12) color = "#06b6d4"; // cyan for morning
  else if (hour < 17) color = "#10b981"; // green for afternoon
  else if (hour < 20) color = "#f59e0b"; // amber for evening
  else color = "#ef4444"; // red for night

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description,
    start,
    end,
    color,
  };
};

export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return data.data.map(convertApiEventToCalendarEvent);
    }
    return [];
  } catch (error) {
    console.error("Error fetching all events:", error);
    return [];
  }
};

export const getDayEvents = async (date: string): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/day/${date}`);
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return data.data.map(convertApiEventToCalendarEvent);
    }
    return [];
  } catch (error) {
    console.error("Error fetching day events:", error);
    return [];
  }
};

export const getWeekEvents = async (date: string): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/week/${date}`);
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return data.data.map(convertApiEventToCalendarEvent);
    }
    return [];
  } catch (error) {
    console.error("Error fetching week events:", error);
    return [];
  }
};

export const getMonthEvents = async (
  month: string
): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/month/${month}`);
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return data.data.map(convertApiEventToCalendarEvent);
    }
    return [];
  } catch (error) {
    console.error("Error fetching month events:", error);
    return [];
  }
};

export const getNextEvent = async (): Promise<CalendarEvent | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/next`);
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return convertApiEventToCalendarEvent(data.data);
    }
    return null;
  } catch (error) {
    console.error("Error fetching next event:", error);
    return null;
  }
};

export const createEvent = async (eventData: {
  title: string;
  description: string;
  time: string;
  duration: number;
}): Promise<CalendarEvent> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return convertApiEventToCalendarEvent(data.data);
    }
    throw new Error("Failed to create event");
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const deleteEvent = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (data.status !== "ok") {
      throw new Error("Failed to delete event");
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

export const deleteAllEvents = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (data.status !== "ok") {
      throw new Error("Failed to delete all events");
    }
  } catch (error) {
    console.error("Error deleting all events:", error);
    throw error;
  }
};

export const deleteDayEvents = async (date: string): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/day/${date}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (data.status === "ok") {
      return data.removed || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error deleting day events:", error);
    return 0;
  }
};

export const deleteWeekEvents = async (date: string): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/week/${date}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (data.status === "ok") {
      return data.removed || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error deleting week events:", error);
    return 0;
  }
};

export const deleteEventsBefore = async (datetime: string): Promise<number> => {
  try {
    const formattedDateTime = datetime.replace(" ", "T").substring(0, 16);
    const response = await fetch(
      `${API_BASE_URL}/events/before/${formattedDateTime}`,
      {
        method: "DELETE",
      }
    );
    const data = await response.json();
    if (data.status === "ok") {
      return data.removed || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error deleting events before date:", error);
    return 0;
  }
};
