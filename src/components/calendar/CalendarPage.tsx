'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Grid3x3, List, Plus, ArrowLeft, Trash2, AlertCircle, Loader2, Info, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import AddEventModal from './AddEventModal';
import EventDetailModal from './EventDetailModal';
import HoverTooltip from './HoverTooltip';
import { CalendarEvent, Slot } from './types';

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
  const { isMobile, isTouch } = useMobileDetection();
  const [view, setView] = useState<'day' | 'week' | 'month'>('day'); // Default to day view on mobile
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<Slot | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    color: '#3b82f6',
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

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      let fetchedEvents: CalendarEvent[] = [];

      if (view === 'day') {
        const dateStr = currentDate.toISOString().split('T')[0];
        fetchedEvents = await getDayEvents(dateStr);
      } else if (view === 'week') {
        const dateStr = currentDate.toISOString().split('T')[0];
        fetchedEvents = await getWeekEvents(dateStr);
      } else {
        const month = currentDate.toISOString().slice(0, 7);
        fetchedEvents = await getMonthEvents(month);
      }

      setEvents(fetchedEvents);

      // Load next event
      const ne = await getNextEvent();
      setNextEvent(ne);
    } catch (err) {
      console.error('Error loading events:', err);
      setEvents([]);
    }
    setIsLoading(false);
  }, [currentDate, view]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!isTouch) {
      const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isTouch]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (showBulkMenu) {
        setShowBulkMenu(false);
      }
    };

    if (showBulkMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showBulkMenu]);

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

  const handleSlotClick = (day: Date, hour: number) => {
    if (isCreating || isDeleting) return;

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

  const handleDragCreateEvent = (startSlot: Slot, endSlot: Slot) => {
    if (isCreating || isDeleting) return;

    const startHour = Math.min(startSlot.hour, endSlot.hour);
    const endHour = Math.max(startSlot.hour, endSlot.hour) + 1;

    const date = startSlot.day;

    setNewEvent({
      title: '',
      description: '',
      date: date.toISOString().split('T')[0],
      startTime: `${startHour.toString().padStart(2, '0')}:00`,
      endTime: `${endHour.toString().padStart(2, '0')}:00`,
      color: '#3b82f6',
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
      await createEvent({
        title: newEvent.title,
        description: newEvent.description,
        time: `${newEvent.date} ${newEvent.startTime}:00`,
        duration: calculateDuration(newEvent.startTime, newEvent.endTime),
      });

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
      color: '#3b82f6',
    });
  };

  const handleDeleteDay = async () => {
    if (isDeleting) return;

    if (confirm('Delete all events for this day?')) {
      setIsDeleting(true);
      try {
        const dateStr = currentDate.toISOString().split('T')[0];
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
        const dateStr = currentDate.toISOString().split('T')[0];
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

  // Mobile Info Modal
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
            className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Touch Controls</h3>
              <motion.button
                onClick={() => setShowMobileInfo(false)}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus size={20} />
                </div>
                <div>
                  <p className="font-semibold">Create Event</p>
                  <p className="text-gray-400">Long press on an empty time slot</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="font-semibold">View Event</p>
                  <p className="text-gray-400">Quick tap on any event</p>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-800 rounded-lg">
                💡 Tip: Your phone will vibrate when you long press
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`min-h-screen bg-black text-white ${isMobile ? 'pb-20' : 'p-4 md:p-8'}`}>
      {/* Mobile Header */}
      {isMobile ? (
        <div className="sticky top-0 bg-black z-40 pb-2">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <motion.button
              onClick={() => router.back()}
              className="p-2 -m-2"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={20} />
            </motion.button>

            <div className="text-center flex-1 mx-4">
              <h1 className="text-lg font-bold truncate">
                {formatDateHeader()}
              </h1>
              {nextEvent && (
                <p className="text-xs text-gray-400">
                  Next: {nextEvent.title} at {nextEvent.start.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowMobileInfo(true)}
                className="p-2 -m-2"
                whileTap={{ scale: 0.9 }}
              >
                <Info size={20} className="text-gray-400" />
              </motion.button>

              <motion.button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="p-2 -m-2 relative"
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 size={20} className="text-red-400" />
              </motion.button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-3">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-3 bg-gray-900 rounded-lg"
              whileTap={{ scale: 0.9 }}
              disabled={isLoading}
            >
              <ChevronLeft size={20} />
            </motion.button>

            <div className="flex gap-1 bg-gray-900 p-1 rounded-lg">
              {[
                { id: 'day' as const, icon: Calendar },
                { id: 'week' as const, icon: Grid3x3 },
                { id: 'month' as const, icon: List },
              ].map(({ id, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => setView(id)}
                  className={`p-3 rounded-md transition-all ${view === id ? 'bg-blue-500 text-white' : 'text-gray-400'
                    }`}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                >
                  <Icon size={20} />
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={() => navigate(1)}
              className="p-3 bg-gray-900 rounded-lg"
              whileTap={{ scale: 0.9 }}
              disabled={isLoading}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>

          {/* Bulk Delete Menu */}
          <AnimatePresence>
            {showBulkMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-3 top-16 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50"
              >
                <button
                  onClick={() => {
                    handleDeleteDay();
                    setShowBulkMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors flex items-center gap-2"
                  disabled={isDeleting}
                >
                  <AlertCircle size={14} />
                  Delete Today&apos;s Events
                </button>
                <button
                  onClick={() => {
                    handleDeleteWeek();
                    setShowBulkMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors flex items-center gap-2"
                  disabled={isDeleting}
                >
                  <AlertCircle size={14} />
                  Delete Week&apos;s Events
                </button>
                <button
                  onClick={() => {
                    handleDeleteAll();
                    setShowBulkMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-red-800 text-red-400 transition-colors flex items-center gap-2"
                  disabled={isDeleting}
                >
                  <AlertCircle size={14} />
                  Delete All Events
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        // Desktop Header (existing code)
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isLoading || isCreating || isDeleting}
              >
                <ArrowLeft size={20} />
              </motion.button>

              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                {formatDateHeader()}
              </motion.h1>

              <div className="flex gap-2">
                <motion.button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isLoading}
                >
                  <ChevronLeft size={20} />
                </motion.button>

                <motion.button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                >
                  Today
                </motion.button>

                <motion.button
                  onClick={() => navigate(1)}
                  className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isLoading}
                >
                  <ChevronRight size={20} />
                </motion.button>
              </div>
            </div>

            <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
              {[
                { id: 'day' as const, icon: Calendar, label: 'Day' },
                { id: 'week' as const, icon: Grid3x3, label: 'Week' },
                { id: 'month' as const, icon: List, label: 'Month' },
              ].map(({ id, icon: Icon, label }) => (
                <motion.button
                  key={id}
                  onClick={() => setView(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${view === id ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{label}</span>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-2">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="text-sm font-medium">Add Event</span>
              </motion.button>

              <div className="relative">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBulkMenu(!showBulkMenu);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  <span className="text-sm font-medium">Bulk Delete</span>
                </motion.button>

                <AnimatePresence>
                  {showBulkMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50"
                    >
                      <button
                        onClick={() => {
                          handleDeleteDay();
                          setShowBulkMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDeleting}
                      >
                        <AlertCircle size={14} />
                        Delete Today&apos;s Events
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteWeek();
                          setShowBulkMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDeleting}
                      >
                        <AlertCircle size={14} />
                        Delete Week&apos;s Events
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteAll();
                          setShowBulkMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-red-800 text-red-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDeleting}
                      >
                        <AlertCircle size={14} />
                        Delete All Events
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {nextEvent && (
            <motion.div
              className="text-sm text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Next: {nextEvent.title} at{' '}
              {nextEvent.start.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </motion.div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-gray-900 rounded-lg p-6 flex flex-col items-center gap-4">
              <Loader2 size={40} className="animate-spin text-blue-500" />
              <p className="text-sm text-gray-400">Loading events...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`${isMobile ? '' : 'bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800'}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {view === 'day' && (
            <DayView
              key="day"
              currentDate={currentDate}
              events={events}
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
              events={events}
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
              events={events}
              setSelectedEvent={setSelectedEvent}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <motion.button
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center z-40"
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddEvent(true)}
          disabled={isCreating || isDeleting}
        >
          {isCreating ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Plus size={24} />
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
    </div>
  );
};

export default CalendarPage;