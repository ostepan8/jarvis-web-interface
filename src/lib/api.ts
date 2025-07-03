import {
  ApiEvent,
  CalendarEvent,
  CreateRecurringEventData,
  CreateTaskData,
  EventStats,
  Protocol,
  ProtocolRunResult,
  TimeSlot,
  ValidationResult,
} from "@/components/calendar/types";

// lib/api.ts
const API_BASE_URL = "http://127.0.0.1:8080";
const JARVIS_API_BASE_URL = "http://0.0.0.0:8000";

// CENTRALIZED API KEY
const API_KEY = "adminsecret"; // Or read from env: process.env.NEXT_PUBLIC_API_KEY
const AUTH_HEADER = { Authorization: `Bearer ${API_KEY}` };

// Utility function to convert API event to CalendarEvent
const convertApiEventToCalendarEvent = (apiEvent: ApiEvent): CalendarEvent => {
  const start = new Date(apiEvent.time);
  const end = new Date(start.getTime() + apiEvent.duration * 1000);

  // Assign colors based on time of day or category
  const hour = start.getHours();
  let color = "#3b82f6"; // default blue

  if (apiEvent.category) {
    // Color by category
    const categoryColors: Record<string, string> = {
      work: "#ef4444",
      personal: "#10b981",
      meeting: "#f59e0b",
      task: "#8b5cf6",
      default: "#3b82f6",
    };
    color = categoryColors[apiEvent.category] || categoryColors.default;
  } else {
    // Color by time of day
    if (hour < 9) color = "#8b5cf6"; // purple for early morning
    else if (hour < 12) color = "#06b6d4"; // cyan for morning
    else if (hour < 17) color = "#10b981"; // green for afternoon
    else if (hour < 20) color = "#f59e0b"; // amber for evening
    else color = "#ef4444"; // red for night
  }

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description,
    start,
    end,
    color,
    category: apiEvent.category,
  };
};

// Error handling wrapper
const handleApiCall = async <T>(
  apiCall: () => Promise<Response>
): Promise<T | null> => {
  try {
    const response = await apiCall();
    const data = await response.json();
    if (data.status === "ok") {
      return data.data;
    }
    console.error("API Error:", data.message);
    return null;
  } catch (error) {
    console.error("Network Error:", error);
    return null;
  }
};

// EVENT ROUTES

export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/events`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const getNextEvent = async (): Promise<CalendarEvent | null> => {
  const data = await handleApiCall<ApiEvent>(() =>
    fetch(`${API_BASE_URL}/events/next`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? convertApiEventToCalendarEvent(data) : null;
};

export const searchEvents = async (
  query: string,
  maxResults?: number
): Promise<CalendarEvent[]> => {
  const params = new URLSearchParams({ q: query });
  if (maxResults) params.append("max", maxResults.toString());

  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/events/search?${params}`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const getEventsInRange = async (
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> => {
  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/events/range/${startDate}/${endDate}`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const getEventsByDuration = async (
  minMinutes?: number,
  maxMinutes?: number
): Promise<CalendarEvent[]> => {
  const params = new URLSearchParams();
  if (minMinutes !== undefined) params.append("min", minMinutes.toString());
  if (maxMinutes !== undefined) params.append("max", maxMinutes.toString());

  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/events/duration?${params}`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const getCategories = async (): Promise<string[]> => {
  return (
    (await handleApiCall<string[]>(() =>
      fetch(`${API_BASE_URL}/categories`, {
        headers: {
          ...AUTH_HEADER,
        },
      })
    )) || []
  );
};

export const getEventsByCategory = async (
  category: string
): Promise<CalendarEvent[]> => {
  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/events/category/${encodeURIComponent(category)}`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const getDayEvents = async (date: string): Promise<CalendarEvent[]> => {
  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/events/day/${date}`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const getWeekEvents = async (date: string): Promise<CalendarEvent[]> => {
  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/events/week/${date}`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const getMonthEvents = async (
  month: string
): Promise<CalendarEvent[]> => {
  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/events/month/${month}`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const createEvent = async (eventData: {
  title: string;
  description?: string;
  time: string;
  duration?: number;
  category?: string;
}): Promise<CalendarEvent> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AUTH_HEADER,
      },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return convertApiEventToCalendarEvent(data.data);
    }
    throw new Error(data.message || "Failed to create event");
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const updateEvent = async (
  id: string,
  eventData: {
    title: string;
    description?: string;
    time: string;
    duration?: number;
    category?: string;
  }
): Promise<CalendarEvent> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/events/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(eventData),
      }
    );
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return convertApiEventToCalendarEvent(data.data);
    }
    throw new Error(data.message || "Failed to update event");
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const patchEvent = async (
  id: string,
  eventData: Partial<{
    title: string;
    description: string;
    time: string;
    duration: number;
    category: string;
  }>
): Promise<CalendarEvent> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/events/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(eventData),
      }
    );
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return convertApiEventToCalendarEvent(data.data);
    }
    throw new Error(data.message || "Failed to patch event");
  } catch (error) {
    console.error("Error patching event:", error);
    throw error;
  }
};

export const getDeletedEvents = async (): Promise<CalendarEvent[]> => {
  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/events/deleted`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const restoreEvent = async (id: string): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/events/${encodeURIComponent(id)}/restore`,
      {
        headers: { ...AUTH_HEADER },
        method: "POST",
      }
    );
    const data = await response.json();
    if (data.status !== "ok") {
      throw new Error(data.message || "Failed to restore event");
    }
  } catch (error) {
    console.error("Error restoring event:", error);
    throw error;
  }
};

export const deleteEvent = async (
  id: string,
  softDelete = false
): Promise<void> => {
  try {
    const params = softDelete ? "?soft=true" : "";
    const response = await fetch(
      `${API_BASE_URL}/events/${encodeURIComponent(id)}${params}`,
      {
        headers: { ...AUTH_HEADER },
        method: "DELETE",
      }
    );
    const data = await response.json();
    if (data.status !== "ok") {
      throw new Error(data.message || "Failed to delete event");
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
      headers: { ...AUTH_HEADER },
    });
    const data = await response.json();
    if (data.status !== "ok") {
      throw new Error(data.message || "Failed to delete all events");
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
      headers: { ...AUTH_HEADER },
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
      headers: { ...AUTH_HEADER },
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
        headers: { ...AUTH_HEADER },
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

// AVAILABILITY ROUTES

export const getConflicts = async (
  time: string,
  durationMinutes = 60
): Promise<CalendarEvent[]> => {
  const params = new URLSearchParams({
    time,
    duration: durationMinutes.toString(),
  });

  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/events/conflicts?${params}`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const validateEventTime = async (eventData: {
  time: string;
  duration?: number;
  title?: string;
}): Promise<ValidationResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...AUTH_HEADER },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (data.status === "ok") {
      return {
        valid: data.valid,
        conflicts: data.conflicts
          ? data.conflicts.map(convertApiEventToCalendarEvent)
          : undefined,
      };
    }
    return { valid: false };
  } catch (error) {
    console.error("Error validating event time:", error);
    return { valid: false };
  }
};

export const getFreeSlots = async (
  date: string,
  startHour = 9,
  endHour = 17,
  minDurationMinutes = 30
): Promise<TimeSlot[]> => {
  const params = new URLSearchParams({
    start: startHour.toString(),
    end: endHour.toString(),
    duration: minDurationMinutes.toString(),
  });

  return (
    (await handleApiCall<TimeSlot[]>(() =>
      fetch(`${API_BASE_URL}/free-slots/${date}?${params}`, {
        headers: {
          ...AUTH_HEADER,
        },
      })
    )) || []
  );
};

export const getNextAvailableSlot = async (
  durationMinutes = 60,
  after?: string
): Promise<TimeSlot | null> => {
  const params = new URLSearchParams({
    duration: durationMinutes.toString(),
  });
  if (after) params.append("after", after);

  return await handleApiCall<TimeSlot>(() =>
    fetch(`${API_BASE_URL}/free-slots/next?${params}`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
};

// STATS ROUTES

export const getEventStats = async (
  startDate: string,
  endDate: string
): Promise<EventStats | null> => {
  return await handleApiCall<EventStats>(() =>
    fetch(`${API_BASE_URL}/stats/events/${startDate}/${endDate}`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
};

// RECURRING ROUTES

export const getRecurringEvents = async (): Promise<CalendarEvent[]> => {
  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/recurring`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const createRecurringEvent = async (
  eventData: CreateRecurringEventData
): Promise<CalendarEvent> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...AUTH_HEADER },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return convertApiEventToCalendarEvent(data.data);
    }
    throw new Error(data.message || "Failed to create recurring event");
  } catch (error) {
    console.error("Error creating recurring event:", error);
    throw error;
  }
};

export const updateRecurringEvent = async (
  id: string,
  eventData: CreateRecurringEventData
): Promise<CalendarEvent> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recurring/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(eventData),
      }
    );
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return convertApiEventToCalendarEvent(data.data);
    }
    throw new Error(data.message || "Failed to update recurring event");
  } catch (error) {
    console.error("Error updating recurring event:", error);
    throw error;
  }
};

export const deleteRecurringEvent = async (id: string): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recurring/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: { ...AUTH_HEADER },
      }
    );
    const data = await response.json();
    if (data.status !== "ok") {
      throw new Error(data.message || "Failed to delete recurring event");
    }
  } catch (error) {
    console.error("Error deleting recurring event:", error);
    throw error;
  }
};

// TASK ROUTES

export const getAvailableNotifiers = async (): Promise<string[]> => {
  return (
    (await handleApiCall<string[]>(() =>
      fetch(`${API_BASE_URL}/notifiers`, { headers: { ...AUTH_HEADER } })
    )) || []
  );
};

export const getAvailableActions = async (): Promise<string[]> => {
  return (
    (await handleApiCall<string[]>(() =>
      fetch(`${API_BASE_URL}/actions`, { headers: { ...AUTH_HEADER } })
    )) || []
  );
};

export const getTasks = async (): Promise<CalendarEvent[]> => {
  const data = await handleApiCall<ApiEvent[]>(() =>
    fetch(`${API_BASE_URL}/tasks`, {
      headers: {
        ...AUTH_HEADER,
      },
    })
  );
  return data ? data.map(convertApiEventToCalendarEvent) : [];
};

export const createTask = async (
  taskData: CreateTaskData
): Promise<CalendarEvent> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...AUTH_HEADER },
      body: JSON.stringify(taskData),
    });
    const data = await response.json();
    if (data.status === "ok" && data.data) {
      return convertApiEventToCalendarEvent(data.data);
    }
    throw new Error(data.message || "Failed to create task");
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// PROTOCOL ROUTES (keeping existing implementation)

export const getProtocols = async (): Promise<Protocol[]> => {
  try {
    const response = await fetch(`${JARVIS_API_BASE_URL}/protocols`);
    const data = await response.json();
    console.log("Fetched protocols:", data);
    return data.protocols || [];
  } catch (error) {
    console.error("Error fetching protocols:", error);
    return [];
  }
};

export const runProtocol = async (
  protocolName: string,
  parameters?: Record<string, any>
): Promise<ProtocolRunResult> => {
  try {
    const response = await fetch(`${JARVIS_API_BASE_URL}/protocols/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        protocol_name: protocolName,
        arguments: parameters || {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Protocol execution failed");
    }

    return {
      protocol: data.protocol,
      results: data.results,
      status: "success",
    };
  } catch (error) {
    console.error("Error running protocol:", error);
    return {
      protocol: protocolName,
      results: null,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// UTILITY FUNCTIONS

export const formatDateForApi = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const formatDateTimeForApi = (date: Date): string => {
  return date.toISOString().replace("T", " ").substring(0, 16);
};

export const formatMonthForApi = (date: Date): string => {
  return date.toISOString().substring(0, 7);
};

// Export all functions as a service object for easier import
export const CalendarApiService = {
  // Events
  getAllEvents,
  getNextEvent,
  searchEvents,
  getEventsInRange,
  getEventsByDuration,
  getCategories,
  getEventsByCategory,
  getDayEvents,
  getWeekEvents,
  getMonthEvents,
  createEvent,
  updateEvent,
  patchEvent,
  getDeletedEvents,
  restoreEvent,
  deleteEvent,
  deleteAllEvents,
  deleteDayEvents,
  deleteWeekEvents,
  deleteEventsBefore,

  // Availability
  getConflicts,
  validateEventTime,
  getFreeSlots,
  getNextAvailableSlot,

  // Stats
  getEventStats,

  // Recurring
  getRecurringEvents,
  createRecurringEvent,
  updateRecurringEvent,
  deleteRecurringEvent,

  // Tasks
  getAvailableNotifiers,
  getAvailableActions,
  getTasks,
  createTask,

  // Protocols
  getProtocols,
  runProtocol,

  // Utilities
  formatDateForApi,
  formatDateTimeForApi,
  formatMonthForApi,
};
