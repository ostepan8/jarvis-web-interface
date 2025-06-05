'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock, Grid3x3, List, Plus, X } from 'lucide-react';

// Mock API call - replace with your actual API
const fetchEvents = async (startDate, endDate) => {
  // Simulated API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock data - replace with actual API call
  return [
    {
      id: 1,
      title: "Server Maintenance",
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 12, 0),
      color: "#3b82f6",
      description: "Routine server updates and optimization"
    },
    {
      id: 2,
      title: "AI Model Training",
      start: new Date(2024, 0, 16, 14, 0),
      end: new Date(2024, 0, 16, 18, 0),
      color: "#8b5cf6",
      description: "Training new neural network models"
    },
    {
      id: 3,
      title: "Data Sync",
      start: new Date(2024, 0, 17, 9, 0),
      end: new Date(2024, 0, 17, 10, 30),
      color: "#06b6d4",
      description: "Cross-server data synchronization"
    }
  ];
};

const CalendarComponent = () => {
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    color: '#3b82f6'
  });

  // Fetch events when date changes
  useEffect(() => {
    loadEvents();
  }, [currentDate, view]);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    const startDate = getViewStartDate();
    const endDate = getViewEndDate();
    const fetchedEvents = await fetchEvents(startDate, endDate);
    setEvents(fetchedEvents);
    setIsLoading(false);
  };

  // Get start date for current view
  const getViewStartDate = () => {
    const date = new Date(currentDate);
    if (view === 'day') return date;
    if (view === 'week') {
      const day = date.getDay();
      const diff = date.getDate() - day;
      return new Date(date.setDate(diff));
    }
    if (view === 'month') {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
  };

  // Get end date for current view
  const getViewEndDate = () => {
    const start = getViewStartDate();
    if (view === 'day') return start;
    if (view === 'week') {
      return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    if (view === 'month') {
      return new Date(start.getFullYear(), start.getMonth() + 1, 0);
    }
  };

  // Navigation
  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  // Handle time slot click
  const handleSlotClick = (day, hour) => {
    const date = new Date(day);
    date.setHours(hour, 0, 0, 0);

    setNewEvent({
      title: '',
      description: '',
      date: date.toISOString().split('T')[0],
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      color: '#3b82f6'
    });
    setShowAddEvent(true);
  };

  // Create new event
  const handleCreateEvent = async () => {
    const startDate = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const endDate = new Date(`${newEvent.date}T${newEvent.endTime}`);

    const event = {
      id: Date.now(), // Temporary ID
      title: newEvent.title,
      description: newEvent.description,
      start: startDate,
      end: endDate,
      color: newEvent.color
    };

    // Add to local state immediately for optimistic update
    setEvents([...events, event]);
    setShowAddEvent(false);

    // Reset form
    setNewEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      color: '#3b82f6'
    });

    // TODO: Send to your API
    // await createEvent(event);
  };

  // Format date for display
  const formatDateHeader = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (view === 'week') {
      const start = getViewStartDate();
      const end = getViewEndDate();
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
  };

  // Day View Component
  const DayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="relative">
        <div className="grid grid-cols-[80px_1fr] gap-0">
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="text-xs text-gray-500 pr-4 pt-2 text-right">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <motion.div
                className="border-t border-gray-800 h-16 relative hover:bg-blue-900/10 transition-colors cursor-pointer"
                onMouseEnter={() => setHoveredSlot({ day: currentDate, hour })}
                onMouseLeave={() => setHoveredSlot(null)}
                onClick={() => !events.some(e => e.start.getHours() === hour && e.start.toDateString() === currentDate.toDateString()) && handleSlotClick(currentDate, hour)}
              >
                {events
                  .filter(event => {
                    const eventHour = event.start.getHours();
                    return event.start.toDateString() === currentDate.toDateString() &&
                      eventHour === hour;
                  })
                  .map(event => (
                    <motion.div
                      key={event.id}
                      className="absolute inset-x-1 p-2 rounded cursor-pointer overflow-hidden"
                      style={{
                        backgroundColor: event.color,
                        top: `${(event.start.getMinutes() / 60) * 100}%`,
                        height: `${((event.end - event.start) / (1000 * 60 * 60)) * 64}px`,
                        minHeight: '30px'
                      }}
                      whileHover={{ scale: 1.02, zIndex: 10 }}
                      onClick={() => setSelectedEvent(event)}
                      layoutId={`event-${event.id}`}
                    >
                      <div className="text-xs font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-70">
                        {event.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Week View Component
  const WeekView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(getViewStartDate());
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <div className="relative overflow-x-auto">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-0 min-w-[800px]">
          {/* Header */}
          <div></div>
          {days.map((day, i) => (
            <div
              key={i}
              className="p-3 text-center border-b border-gray-800 relative z-10"
            >
              <div className="text-sm text-gray-400">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-semibold ${day.toDateString() === new Date().toDateString()
                ? 'text-blue-400'
                : 'text-white'
                }`}>
                {day.getDate()}
              </div>
            </div>
          ))}

          {/* Time slots */}
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="text-xs text-gray-500 pr-4 pt-2 text-right border-t border-gray-800">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map((day, dayIndex) => (
                <motion.div
                  key={`${dayIndex}-${hour}`}
                  className="border-t border-l border-gray-800 h-16 relative hover:bg-blue-900/10 transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredSlot({ day, hour })}
                  onMouseLeave={() => setHoveredSlot(null)}
                  onClick={() => !events.some(e => e.start.getHours() === hour && e.start.toDateString() === day.toDateString()) && handleSlotClick(day, hour)}
                >
                  {events
                    .filter(event => {
                      const eventHour = event.start.getHours();
                      return event.start.toDateString() === day.toDateString() &&
                        eventHour === hour;
                    })
                    .map(event => (
                      <motion.div
                        key={event.id}
                        className="absolute inset-x-1 p-1 rounded cursor-pointer overflow-hidden z-20"
                        style={{
                          backgroundColor: event.color,
                          top: `${(event.start.getMinutes() / 60) * 100}%`,
                          height: `${((event.end - event.start) / (1000 * 60 * 60)) * 64}px`,
                          minHeight: '25px',
                          fontSize: '11px'
                        }}
                        whileHover={{ scale: 1.05, zIndex: 30 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                        layoutId={`event-${event.id}`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                      </motion.div>
                    ))}
                </motion.div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Month View Component
  const MonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm text-gray-400 font-semibold">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = events.filter(event =>
            event.start.toDateString() === day.toDateString()
          );

          return (
            <motion.div
              key={i}
              className={`
                min-h-[100px] p-2 border border-gray-800 rounded-lg cursor-pointer
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isToday ? 'border-blue-400 bg-blue-900/20' : 'hover:bg-gray-900/50'}
              `}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-400' : 'text-gray-300'
                }`}>
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <motion.div
                    key={event.id}
                    className="text-xs p-1 rounded truncate cursor-pointer"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {event.title}
                  </motion.div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              {formatDateHeader()}
            </motion.h1>

            {/* Navigation */}
            <div className="flex gap-2">
              <motion.button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={20} />
              </motion.button>
              <motion.button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Today
              </motion.button>
              <motion.button
                onClick={() => navigate(1)}
                className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
            {[
              { id: 'day', icon: Calendar, label: 'Day' },
              { id: 'week', icon: Grid3x3, label: 'Week' },
              { id: 'month', icon: List, label: 'Month' }
            ].map(({ id, icon: Icon, label }) => (
              <motion.button
                key={id}
                onClick={() => setView(id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md transition-all
                  ${view === id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Add Event Button */}
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddEvent(true)}
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Add Event</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-blue-500 rounded-full"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar View */}
      <motion.div
        className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {view === 'day' && <DayView key="day" />}
          {view === 'week' && <WeekView key="week" />}
          {view === 'month' && <MonthView key="month" />}
        </AnimatePresence>
      </motion.div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddEvent(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                  background: [
                    'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
                    'radial-gradient(circle at 100% 100%, #3b82f6 0%, transparent 50%)',
                    'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
                  ],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Create New Event
                  </h3>
                  <motion.button
                    onClick={() => setShowAddEvent(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleCreateEvent(); }} className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Event Title
                    </label>
                    <motion.input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg 
                               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                               transition-all duration-300"
                      placeholder="Enter event title..."
                      required
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Description
                    </label>
                    <motion.textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg 
                               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                               transition-all duration-300 resize-none"
                      placeholder="Add event details..."
                      rows={3}
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>

                  {/* Date and Time Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Date
                      </label>
                      <motion.input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg 
                                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                 transition-all duration-300"
                        required
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Start
                      </label>
                      <motion.input
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg 
                                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                 transition-all duration-300"
                        required
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        End
                      </label>
                      <motion.input
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg 
                                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                 transition-all duration-300"
                        required
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Event Color
                    </label>
                    <div className="flex gap-2">
                      {['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                        <motion.button
                          key={color}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, color })}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${newEvent.color === color ? 'border-white scale-110' : 'border-transparent'
                            }`}
                          style={{ backgroundColor: color }}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      onClick={() => setShowAddEvent(false)}
                      className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                               rounded-lg transition-all font-medium relative overflow-hidden group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10">Create Event</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ x: "100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">{selectedEvent.title}</h3>
                <motion.button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <Clock size={16} />
                  <span>
                    {selectedEvent.start.toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div
                  className="w-full h-2 rounded-full"
                  style={{ backgroundColor: selectedEvent.color }}
                />

                <p className="text-gray-300">{selectedEvent.description}</p>

                <div className="flex gap-2 pt-4">
                  <motion.button
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Edit Event
                  </motion.button>
                  <motion.button
                    className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredSlot && !selectedEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: mousePos.x + 10,
              top: mousePos.y - 40
            }}
          >
            <div className="bg-gray-800 px-3 py-2 rounded-lg text-sm shadow-lg border border-gray-700">
              <div className="font-medium">
                {hoveredSlot.hour}:00 - {hoveredSlot.hour + 1}:00
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Click to add event
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarComponent;