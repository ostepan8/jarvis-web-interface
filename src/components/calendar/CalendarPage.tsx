'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Grid3x3, List, Plus } from 'lucide-react';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import AddEventModal from './AddEventModal';
import EventDetailModal from './EventDetailModal';
import HoverTooltip from './HoverTooltip';
import { CalendarEvent, Slot } from './types';

// Mock API call - replace with your actual API
const fetchEvents = async (): Promise<CalendarEvent[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    {
      id: 1,
      title: 'Server Maintenance',
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 12, 0),
      color: '#3b82f6',
      description: 'Routine server updates and optimization',
    },
    {
      id: 2,
      title: 'AI Model Training',
      start: new Date(2024, 0, 16, 14, 0),
      end: new Date(2024, 0, 16, 18, 0),
      color: '#8b5cf6',
      description: 'Training new neural network models',
    },
    {
      id: 3,
      title: 'Data Sync',
      start: new Date(2024, 0, 17, 9, 0),
      end: new Date(2024, 0, 17, 10, 30),
      color: '#06b6d4',
      description: 'Cross-server data synchronization',
    },
  ];
};

const CalendarPage = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSlot, setHoveredSlot] = useState<Slot | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    color: '#3b82f6',
  });

  useEffect(() => {
    loadEvents();
  }, [currentDate, view]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    const fetchedEvents = await fetchEvents();
    setEvents(fetchedEvents);
    setIsLoading(false);
  };

  const getViewStartDate = () => {
    const date = new Date(currentDate);
    if (view === 'day') return date;
    if (view === 'week') {
      const diff = date.getDate() - date.getDay();
      return new Date(date.setDate(diff));
    }
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getViewEndDate = () => {
    const start = getViewStartDate();
    if (view === 'day') return start;
    if (view === 'week') {
      return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    return new Date(start.getFullYear(), start.getMonth() + 1, 0);
  };

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === 'day') newDate.setDate(newDate.getDate() + direction);
    else if (view === 'week') newDate.setDate(newDate.getDate() + direction * 7);
    else newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleSlotClick = (day: Date, hour: number) => {
    const date = new Date(day);
    date.setHours(hour, 0, 0, 0);
    setNewEvent({
      title: '',
      description: '',
      date: date.toISOString().split('T')[0],
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      color: '#3b82f6',
    });
    setShowAddEvent(true);
  };

  const handleCreateEvent = () => {
    const startDate = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const endDate = new Date(`${newEvent.date}T${newEvent.endTime}`);
    const event: CalendarEvent = {
      id: Date.now(),
      title: newEvent.title,
      description: newEvent.description,
      start: startDate,
      end: endDate,
      color: newEvent.color,
    };
    setEvents([...events, event]);
    setShowAddEvent(false);
    setNewEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      color: '#3b82f6',
    });
  };

  const formatDateHeader = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    if (view === 'week') {
      const start = getViewStartDate();
      const end = getViewEndDate();
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <motion.h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" whileHover={{ scale: 1.05 }}>
              {formatDateHeader()}
            </motion.h1>
            <div className="flex gap-2">
              <motion.button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <ChevronLeft size={20} />
              </motion.button>
              <motion.button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Today
              </motion.button>
              <motion.button onClick={() => navigate(1)} className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>
          <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
            {[
              { id: 'day', icon: Calendar, label: 'Day' },
              { id: 'week', icon: Grid3x3, label: 'Week' },
              { id: 'month', icon: List, label: 'Month' },
            ].map(({ id, icon: Icon, label }) => (
              <motion.button
                key={id}
                onClick={() => setView(id as 'day' | 'week' | 'month')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${view === id ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
          <motion.button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddEvent(true)}>
            <Plus size={16} />
            <span className="text-sm font-medium">Add Event</span>
          </motion.button>
        </div>
      </motion.div>
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-3 h-3 bg-blue-500 rounded-full" animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        <AnimatePresence mode="wait">
          {view === 'day' && (
            <DayView key="day" currentDate={currentDate} events={events} setHoveredSlot={setHoveredSlot} handleSlotClick={handleSlotClick} setSelectedEvent={setSelectedEvent} />
          )}
          {view === 'week' && (
            <WeekView key="week" currentDate={currentDate} events={events} setHoveredSlot={setHoveredSlot} handleSlotClick={handleSlotClick} setSelectedEvent={setSelectedEvent} />
          )}
          {view === 'month' && (
            <MonthView key="month" currentDate={currentDate} events={events} setSelectedEvent={setSelectedEvent} />
          )}
        </AnimatePresence>
      </motion.div>
      <AddEventModal show={showAddEvent} newEvent={newEvent} setNewEvent={setNewEvent} onClose={() => setShowAddEvent(false)} onCreate={handleCreateEvent} />
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <HoverTooltip slot={hoveredSlot} mousePos={mousePos} show={!!hoveredSlot && !selectedEvent} />
    </div>
  );
};

export default CalendarPage;
