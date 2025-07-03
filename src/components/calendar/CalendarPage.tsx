'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, Grid3x3, List, Plus, ArrowLeft,
  Trash2, AlertCircle, Loader2, Info, X, Activity, Search,
  BarChart3, Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import AddEventModal from './AddEventModal';
import EventDetailModal from './EventDetailModal';
import HoverTooltip from './HoverTooltip';
import { CalendarEvent, Slot, EventStats } from './types';
import {
  getDayEvents,
  getWeekEvents,
  getMonthEvents,
  createEvent,
  deleteEvent,
  getNextEvent,
  deleteAllEvents,
  deleteDayEvents,
  deleteWeekEvents,
  getCategories,
  searchEvents,
  getEventStats,
  getRecurringEvents,
  getTasks,
  createRecurringEvent,
  createTask,
  getConflicts,
  formatDateForApi
} from '@/lib/api';

// Mobile detection hook
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTouch };
};

const CalendarPage = () => {
  const router = useRouter();
  const { isMobile } = useMobileDetection();
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<Slot | null>(null);
  const [mousePos] = useState({ x: 0, y: 0 });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Enhanced state
  const [eventType, setEventType] = useState<'event' | 'recurring' | 'task'>('event');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<EventStats | null>(null);
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    color: '#22d3ee',
    category: '',
    recurring: false,
    recurrencePattern: {
      type: 'weekly' as const,
      interval: 1,
      max: 10
    },
    isTask: false,
    notifier: '',
    action: '',
    notifications: ['10m']
  });
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null);

  // Show mobile instructions on first visit
  useEffect(() => {
    if (isMobile && !localStorage.getItem('mobileInstructionsShown')) {
      setTimeout(() => {
        setShowMobileInfo(true);
        localStorage.setItem('mobileInstructionsShown', 'true');
      }, 1000);
    }
  }, [isMobile]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadEvents = useCallback(async () => {
    console.log('🔄 Starting to load events...');
    setIsLoading(true);

    try {
      let regularEvents: CalendarEvent[] = [];
      let recurringEvents: CalendarEvent[] = [];
      let tasks: CalendarEvent[] = [];

      // Load regular events with timeout and detailed logging
      console.log('📅 Loading regular events for view:', view);
      try {
        const startTime = Date.now();
        if (view === 'day') {
          const dateStr = formatDateForApi(currentDate);
          console.log('📅 Loading day events for:', dateStr);
          regularEvents = await Promise.race([
            getDayEvents(dateStr),
            new Promise<CalendarEvent[]>((_, reject) =>
              setTimeout(() => reject(new Error('getDayEvents timeout')), 10000)
            )
          ]);
        } else if (view === 'week') {
          const dateStr = formatDateForApi(currentDate);
          console.log('📅 Loading week events for:', dateStr);
          regularEvents = await Promise.race([
            getWeekEvents(dateStr),
            new Promise<CalendarEvent[]>((_, reject) =>
              setTimeout(() => reject(new Error('getWeekEvents timeout')), 10000)
            )
          ]);
        } else {
          const month = currentDate.toISOString().slice(0, 7);
          console.log('📅 Loading month events for:', month);
          regularEvents = await Promise.race([
            getMonthEvents(month),
            new Promise<CalendarEvent[]>((_, reject) =>
              setTimeout(() => reject(new Error('getMonthEvents timeout')), 10000)
            )
          ]);
        }
        console.log('✅ Regular events loaded:', regularEvents.length, 'in', Date.now() - startTime, 'ms');
      } catch (error) {
        console.error('❌ Error loading regular events:', error);
        regularEvents = [];
      }

      // Load recurring events with timeout
      console.log('🔄 Loading recurring events...');
      try {
        const startTime = Date.now();
        recurringEvents = await Promise.race([
          getRecurringEvents(),
          new Promise<CalendarEvent[]>((_, reject) =>
            setTimeout(() => reject(new Error('getRecurringEvents timeout')), 10000)
          )
        ]);
        console.log('✅ Recurring events loaded:', recurringEvents.length, 'in', Date.now() - startTime, 'ms');
      } catch (error) {
        console.error('❌ Error loading recurring events:', error);
        recurringEvents = [];
      }

      // Load tasks with timeout
      console.log('📝 Loading tasks...');
      try {
        const startTime = Date.now();
        tasks = await Promise.race([
          getTasks(),
          new Promise<CalendarEvent[]>((_, reject) =>
            setTimeout(() => reject(new Error('getTasks timeout')), 10000)
          )
        ]);
        console.log('✅ Tasks loaded:', tasks.length, 'in', Date.now() - startTime, 'ms');
      } catch (error) {
        console.error('❌ Error loading tasks:', error);
        tasks = [];
      }

      // Combine and process events
      console.log('🔧 Processing events...');
      const allEvents = [...regularEvents, ...recurringEvents, ...tasks];
      console.log('📊 Total events before deduplication:', allEvents.length);

      // Remove duplicates based on ID and ensure consistent data structure
      const uniqueEventsMap = new Map<string, CalendarEvent>();

      allEvents.forEach(event => {
        try {
          // Ensure dates are proper Date objects
          const processedEvent = {
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          };

          // Only add if not already in map
          if (!uniqueEventsMap.has(processedEvent.id)) {
            uniqueEventsMap.set(processedEvent.id, processedEvent);
          }
        } catch (error) {
          console.error('❌ Error processing event:', event, error);
        }
      });

      // Convert back to array and sort by start time
      const uniqueEvents = Array.from(uniqueEventsMap.values())
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      console.log('📊 Unique events after deduplication:', uniqueEvents.length);

      // Filter events to only show those in the current view period
      const filteredEvents = uniqueEvents.filter(event => {
        try {
          const eventDate = new Date(event.start);

          if (view === 'day') {
            return eventDate.toDateString() === currentDate.toDateString();
          } else if (view === 'week') {
            const weekStart = new Date(currentDate);
            const day = weekStart.getDay();
            weekStart.setDate(weekStart.getDate() - day);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            return eventDate >= weekStart && eventDate <= weekEnd;
          } else { // month view
            return eventDate.getMonth() === currentDate.getMonth() &&
              eventDate.getFullYear() === currentDate.getFullYear();
          }
        } catch (error) {
          console.error('❌ Error filtering event:', event, error);
          return false;
        }
      });

      console.log('📊 Events after filtering:', filteredEvents.length);
      setEvents(filteredEvents);

      // Load next event with timeout
      console.log('⏭️ Loading next event...');
      try {
        const ne = await Promise.race([
          getNextEvent(),
          new Promise<CalendarEvent | null>((_, reject) =>
            setTimeout(() => reject(new Error('getNextEvent timeout')), 5000)
          )
        ]);
        setNextEvent(ne);
        console.log('✅ Next event loaded:', ne?.title || 'none');
      } catch (error) {
        console.error('❌ Error loading next event:', error);
        setNextEvent(null);
      }

      // Load stats for current period
      console.log('📈 Loading stats...');
      try {
        await loadStats();
        console.log('✅ Stats loaded');
      } catch (error) {
        console.error('❌ Error loading stats:', error);
      }

      console.log('🎉 Event loading completed successfully!');
    } catch (err) {
      console.error('💥 Fatal error loading events:', err);
      setEvents([]);
    } finally {
      console.log('🏁 Setting loading to false');
      setIsLoading(false);
    }
  }, [currentDate, view]);

  const loadStats = async () => {
    try {
      const startDate = formatDateForApi(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      const endDate = formatDateForApi(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
      const eventStats = await getEventStats(startDate, endDate);
      setStats(eventStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Filter events based on search and category
  useEffect(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategory]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // useEffect(() => {
  //   if (!isTouch) {
  //     const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
  //     window.addEventListener('mousemove', handleMouseMove);
  //     return () => window.removeEventListener('mousemove', handleMouseMove);
  //   }
  // }, [isTouch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Handle bulk menu
      if (showBulkMenu && !target.closest('[data-bulk-menu]')) {
        setShowBulkMenu(false);
      }

      // Handle filters menu
      if (showFilters && !target.closest('[data-filters-menu]')) {
        setShowFilters(false);
      }
    };

    if (showBulkMenu || showFilters) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showBulkMenu, showFilters]);

  // Separate effect for stats to prevent conflicts
  useEffect(() => {
    const handleStatsClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Only close if clicking outside both the button and modal
      if (!target.closest('[data-stats-button]') && !target.closest('[data-stats-modal]')) {
        setShowStats(false);
      }
    };

    if (showStats) {
      // Add a longer delay for stats to ensure it doesn't close immediately
      const timer = setTimeout(() => {
        document.addEventListener('click', handleStatsClickOutside);
      }, 200);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleStatsClickOutside);
      };
    }
  }, [showStats]);

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const handleSlotClick = async (day: Date, hour: number) => {
    if (isCreating || isDeleting) return;

    const date = new Date(day);
    date.setHours(hour, 0, 0, 0);

    // Check for conflicts
    const timeStr = date.toISOString().replace('T', ' ').substring(0, 16);
    const eventConflicts = await getConflicts(timeStr, 60);
    setConflicts(eventConflicts);

    setNewEvent({
      ...newEvent,
      date: formatDateForApi(date),
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
    });
    setShowAddEvent(true);
  };

  const handleDragCreateEvent = async (startSlot: Slot, endSlot: Slot) => {
    if (isCreating || isDeleting) return;

    const startHour = Math.min(startSlot.hour, endSlot.hour);
    const endHour = Math.max(startSlot.hour, endSlot.hour) + 1;
    const date = startSlot.day;

    // Check for conflicts
    const timeStr = date.toISOString().replace('T', ' ').substring(0, 16);
    const eventConflicts = await getConflicts(timeStr, (endHour - startHour) * 60);
    setConflicts(eventConflicts);

    setNewEvent({
      ...newEvent,
      date: formatDateForApi(date),
      startTime: `${startHour.toString().padStart(2, '0')}:00`,
      endTime: `${endHour.toString().padStart(2, '0')}:00`,
    });
    setShowAddEvent(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteEvent(id);
      setSelectedEvent(null);
      await loadEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateEvent = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        time: `${newEvent.date} ${newEvent.startTime}:00`,
        duration: calculateDuration(newEvent.startTime, newEvent.endTime),
        category: newEvent.category || undefined,
      };

      if (eventType === 'recurring') {
        await createRecurringEvent({
          ...eventData,
          start: eventData.time,
          pattern: newEvent.recurrencePattern
        });
      } else if (eventType === 'task') {
        await createTask({
          ...eventData,
          notifier: newEvent.notifier,
          action: newEvent.action,
          notify: newEvent.notifications
        });
      } else {
        await createEvent(eventData);
      }

      setShowAddEvent(false);
      resetNewEvent();
      await loadEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return ((endHour * 60 + endMin) - (startHour * 60 + startMin)) * 60;
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      color: '#22d3ee',
      category: '',
      recurring: false,
      recurrencePattern: {
        type: 'weekly',
        interval: 1,
        max: 10
      },
      isTask: false,
      notifier: '',
      action: '',
      notifications: ['10m']
    });
    setConflicts([]);
  };

  const handleDeleteDay = async () => {
    if (isDeleting) return;

    if (confirm('Delete all events for this day?')) {
      setIsDeleting(true);
      try {
        const dateStr = formatDateForApi(currentDate);
        const removed = await deleteDayEvents(dateStr);
        alert(`Deleted ${removed} events`);
        await loadEvents();
      } catch (err) {
        console.error('Error deleting day events:', err);
        alert('Failed to delete events. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteWeek = async () => {
    if (isDeleting) return;

    if (confirm('Delete all events for this week?')) {
      setIsDeleting(true);
      try {
        const dateStr = formatDateForApi(currentDate);
        const removed = await deleteWeekEvents(dateStr);
        alert(`Deleted ${removed} events`);
        await loadEvents();
      } catch (err) {
        console.error('Error deleting week events:', err);
        alert('Failed to delete events. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (isDeleting) return;

    if (confirm('Delete ALL events? This cannot be undone!')) {
      setIsDeleting(true);
      try {
        await deleteAllEvents();
        alert('All events deleted');
        await loadEvents();
      } catch (err) {
        console.error('Error deleting all events:', err);
        alert('Failed to delete events. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const searchResults = await searchEvents(searchQuery, 50);
      setFilteredEvents(searchResults);
    } catch (error) {
      console.error('Error searching events:', error);
    }
  };

  const formatDateHeader = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: isMobile ? 'short' : 'long',
        year: 'numeric',
        month: isMobile ? 'short' : 'long',
        day: 'numeric',
      });
    }
    if (view === 'week') {
      const start = new Date(currentDate);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      if (isMobile) {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}`;
      }
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Mobile Info Modal (enhanced)
  const MobileInfoModal = () => (
    <AnimatePresence>
      {showMobileInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowMobileInfo(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-gradient-to-br from-slate-900/95 via-blue-950/60 to-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-lg opacity-75" />

            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-mono font-bold text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text">
                  TOUCH.CONTROLS
                </h3>
                <motion.button
                  onClick={() => setShowMobileInfo(false)}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors duration-200"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="space-y-4 text-sm font-mono">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Plus size={16} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-bold text-cyan-300">CREATE EVENT</p>
                    <p className="text-gray-400">Long press on empty time slot</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold text-green-300">VIEW EVENT</p>
                    <p className="text-gray-400">Quick tap on any event</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-400/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-300">SEARCH & FILTER</p>
                    <p className="text-gray-400">Use search bar and filters</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  💡 SYSTEM.TIP: Device will vibrate on long press
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Stats Modal
  const StatsModal = () => (
    <AnimatePresence>
      {showStats && stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Only close if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) {
              setShowStats(false);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            data-stats-modal
            className="relative bg-gradient-to-br from-slate-900/95 via-blue-950/60 to-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl p-8 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-lg opacity-75" />

            <div className="relative">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-mono font-bold text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text">
                  TEMPORAL.ANALYTICS
                </h3>
                <motion.button
                  onClick={() => setShowStats(false)}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors duration-200"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
                  <h4 className="text-lg font-mono font-bold text-cyan-400 mb-4">OVERVIEW</h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Events:</span>
                      <span className="text-cyan-300">{stats.total_events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Time:</span>
                      <span className="text-cyan-300">{Math.round(stats.total_minutes / 60)}h {stats.total_minutes % 60}m</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
                  <h4 className="text-lg font-mono font-bold text-cyan-400 mb-4">BY CATEGORY</h4>
                  <div className="space-y-2 text-sm font-mono">
                    {Object.entries(stats.events_by_category).map(([category, count]) => (
                      <div key={category} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{category}:</span>
                        <span className="text-cyan-300">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
                  <h4 className="text-lg font-mono font-bold text-cyan-400 mb-4">BUSIEST HOURS</h4>
                  <div className="space-y-2 text-sm font-mono">
                    {stats.busiest_hours.slice(0, 5).map(({ hour, event_count }) => (
                      <div key={hour} className="flex justify-between">
                        <span className="text-gray-400">{hour}:00:</span>
                        <span className="text-cyan-300">{event_count} events</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
                  <h4 className="text-lg font-mono font-bold text-cyan-400 mb-4">BUSIEST DAYS</h4>
                  <div className="space-y-2 text-sm font-mono">
                    {stats.busiest_days.slice(0, 5).map(({ date, event_count }) => (
                      <div key={date} className="flex justify-between">
                        <span className="text-gray-400">{date}:</span>
                        <span className="text-cyan-300">{event_count} events</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background effects */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(34, 211, 238, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
          animation: 'float 8s ease-in-out infinite'
        }}
      />

      <div className="relative z-10 p-6">
        {/* JARVIS Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
              <div className="relative p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/30">
                <Calendar className="w-16 h-16 text-cyan-400" />
              </div>
            </div>

            <h1 className="text-5xl font-mono font-black mb-4">
              <span className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text">
                JARVIS
              </span>
              <span className="text-gray-500">.</span>
              <span className="text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text">
                CALENDAR
              </span>
            </h1>
            <p className="text-xl text-gray-400 font-mono max-w-2xl mx-auto leading-relaxed">
              Advanced scheduling and temporal event management
            </p>

            <div className="flex items-center justify-center space-x-6 mt-8">
              <div className="flex items-center space-x-2 text-cyan-400/70">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="font-mono text-sm">{filteredEvents.length} events visible</span>
              </div>
              <div className="flex items-center space-x-2 text-cyan-400/70">
                <Activity className="w-4 h-4" />
                <span className="font-mono text-sm">{view} view active</span>
              </div>
              {stats && (
                <div className="flex items-center space-x-2 text-cyan-400/70">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-mono text-sm">{stats.total_events} total events</span>
                </div>
              )}
            </div>
          </div>

          {/* Control Panel */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-50" />
            <div className="relative p-6 bg-gradient-to-r from-slate-900/80 to-blue-950/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl">

              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 placeholder-gray-500 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                    />
                  </div>

                  <div className="relative">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFilters(!showFilters);
                      }}
                      data-filters-menu
                      className="flex items-center gap-2 px-4 py-3 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 rounded-xl font-mono text-sm text-cyan-300 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Filter size={16} />
                      FILTER
                    </motion.button>

                    <AnimatePresence>
                      {showFilters && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          data-filters-menu
                          className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                          <div className="p-4">
                            <h4 className="text-sm font-mono font-bold text-cyan-400 mb-3">CATEGORY FILTER</h4>
                            <select
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-cyan-400/40 rounded-lg text-cyan-300 font-mono text-sm focus:border-cyan-300 focus:outline-none"
                            >
                              <option value="all">All Categories</option>
                              {categories.map(category => (
                                <option key={category} value={category} className="bg-gray-800">
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowStats(prev => !prev);
                    }}
                    data-stats-button
                    className="flex items-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 hover:border-purple-300 rounded-xl font-mono text-sm text-purple-300 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BarChart3 size={16} />
                    STATS
                  </motion.button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

                {/* Navigation */}
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={() => router.back()}
                    className="p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft size={20} className="text-cyan-400" />
                  </motion.button>

                  <div className="text-center">
                    <h2 className="text-2xl font-mono font-bold text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text">
                      {formatDateHeader()}
                    </h2>
                    {nextEvent && (
                      <p className="text-sm font-mono text-gray-400 mt-1">
                        NEXT: {nextEvent.title} @ {nextEvent.start.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => navigate(-1)}
                      className="p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                    >
                      <ChevronLeft size={20} className="text-cyan-400" />
                    </motion.button>

                    <motion.button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-4 py-3 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 font-mono text-sm text-cyan-300 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                    >
                      TODAY
                    </motion.button>

                    <motion.button
                      onClick={() => navigate(1)}
                      className="p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                    >
                      <ChevronRight size={20} className="text-cyan-400" />
                    </motion.button>
                  </div>
                </div>

                {/* View Controls */}
                <div className="flex gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-700/50">
                  {[
                    { id: 'day' as const, icon: Calendar, label: 'DAY' },
                    { id: 'week' as const, icon: Grid3x3, label: 'WEEK' },
                    { id: 'month' as const, icon: List, label: 'MONTH' },
                  ].map(({ id, icon: Icon, label }) => (
                    <motion.button
                      key={id}
                      onClick={() => setView(id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-mono text-sm font-bold ${view === id
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/50'
                        : 'text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Action Controls */}
                <div className="flex items-center space-x-3">
                  <motion.button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/50 hover:border-cyan-300 rounded-xl font-mono font-bold text-sm transition-all duration-300 shadow-lg shadow-cyan-500/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddEvent(true)}
                    disabled={isCreating || isDeleting}
                  >
                    {isCreating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    <span>CREATE</span>
                  </motion.button>

                  <div className="relative">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBulkMenu(!showBulkMenu);
                      }}
                      data-bulk-menu
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 hover:from-red-500/30 hover:to-rose-500/30 border border-red-400/50 hover:border-red-300 rounded-xl font-mono font-bold text-sm transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      <span>DELETE</span>
                    </motion.button>

                    <AnimatePresence>
                      {showBulkMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          data-bulk-menu
                          className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                          <button
                            onClick={() => {
                              handleDeleteDay();
                              setShowBulkMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors flex items-center gap-2 font-mono text-sm text-gray-300 hover:text-cyan-300"
                            disabled={isDeleting}
                          >
                            <AlertCircle size={14} />
                            DELETE TODAY'S EVENTS
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteWeek();
                              setShowBulkMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors flex items-center gap-2 font-mono text-sm text-gray-300 hover:text-cyan-300"
                            disabled={isDeleting}
                          >
                            <AlertCircle size={14} />
                            DELETE WEEK'S EVENTS
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteAll();
                              setShowBulkMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-red-800/50 text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 font-mono text-sm"
                            disabled={isDeleting}
                          >
                            <AlertCircle size={14} />
                            DELETE ALL EVENTS
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {isMobile && (
                    <motion.button
                      onClick={() => setShowMobileInfo(true)}
                      className="p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-200"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Info size={20} className="text-gray-400 hover:text-cyan-400" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-xl opacity-75" />
                <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl p-8 flex flex-col items-center gap-4">
                  <Loader2 size={48} className="animate-spin text-cyan-400" />
                  <p className="text-lg font-mono text-cyan-300">LOADING TEMPORAL DATA...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Views */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Holographic container */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-50" />
            <div className="relative bg-gradient-to-br from-slate-900/80 to-blue-950/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl overflow-hidden">
              <AnimatePresence mode="wait">
                {view === 'day' && (
                  <DayView
                    key="day"
                    currentDate={currentDate}
                    events={filteredEvents}
                    setHoveredSlot={setHoveredSlot}
                    handleSlotClick={handleSlotClick}
                    setSelectedEvent={setSelectedEvent}
                    onDragCreateEvent={handleDragCreateEvent}
                    isDisabled={isCreating || isDeleting}
                  />
                )}
                {view === 'week' && (
                  <WeekView
                    key="week"
                    currentDate={currentDate}
                    events={filteredEvents}
                    setHoveredSlot={setHoveredSlot}
                    handleSlotClick={handleSlotClick}
                    setSelectedEvent={setSelectedEvent}
                    onDragCreateEvent={handleDragCreateEvent}
                    isDisabled={isCreating || isDeleting}
                  />
                )}
                {view === 'month' && (
                  <MonthView
                    key="month"
                    currentDate={currentDate}
                    events={filteredEvents}
                    setSelectedEvent={setSelectedEvent}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <motion.button
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-2xl shadow-cyan-500/25 flex items-center justify-center z-40 border border-cyan-400/50"
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddEvent(true)}
          disabled={isCreating || isDeleting}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full animate-pulse" />
          {isCreating ? (
            <Loader2 size={24} className="animate-spin text-white relative z-10" />
          ) : (
            <Plus size={24} className="text-white relative z-10" />
          )}
        </motion.button>
      )}

      <AddEventModal
        show={showAddEvent}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onClose={() => {
          if (!isCreating) {
            setShowAddEvent(false);
            resetNewEvent();
          }
        }}
        onCreate={handleCreateEvent}
        isCreating={isCreating}
        eventType={eventType}
        setEventType={setEventType}
        categories={categories}
        conflicts={conflicts}
      />

      <EventDetailModal
        event={selectedEvent}
        onClose={() => {
          if (!isDeleting) {
            setSelectedEvent(null);
          }
        }}
        onDelete={handleDeleteEvent}
        isDeleting={isDeleting}
      />

      {!isMobile && (
        <HoverTooltip
          slot={hoveredSlot}
          mousePos={mousePos}
          show={!!hoveredSlot && !selectedEvent && !showAddEvent && !isCreating && !isDeleting}
        />
      )}

      <MobileInfoModal />
      <StatsModal />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;