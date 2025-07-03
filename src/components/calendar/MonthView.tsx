'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the types directly in the component file
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color: string;
  category?: string;
}

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  setSelectedEvent: (e: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
  isDisabled?: boolean;
}

const MonthView: React.FC<Props> = ({
  currentDate,
  events,
  setSelectedEvent,
  onDayClick,
  isDisabled = false
}) => {
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: Date[] = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const today = new Date();
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handleDayClick = (day: Date) => {
    if (!isDisabled && onDayClick) {
      onDayClick(day);
    }
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    if (!isDisabled) {
      setSelectedEvent(event);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-lg border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.1)] overflow-hidden">
      {/* Header with day names */}
      <div className="grid grid-cols-7 gap-px bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border-b border-cyan-500/30">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-3 text-center bg-gradient-to-b from-slate-900/90 to-blue-950/90 backdrop-blur-sm"
          >
            <div className="text-sm text-cyan-300 font-mono font-bold uppercase tracking-wider">
              {day}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5">
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === today.toDateString();
          const dayEvents = events.filter((e) => e.start.toDateString() === day.toDateString());
          const isHovered = hoveredDay?.toDateString() === day.toDateString();

          return (
            <motion.div
              key={i}
              className={`min-h-[120px] p-2 relative cursor-pointer bg-gradient-to-b from-slate-900/50 to-blue-950/30 backdrop-blur-sm transition-all duration-300 ${!isCurrentMonth
                ? 'opacity-30'
                : isToday
                  ? 'border-cyan-400 bg-gradient-to-b from-cyan-500/10 to-blue-500/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                  : isHovered
                    ? 'bg-gradient-to-b from-cyan-500/5 to-blue-500/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'hover:bg-gradient-to-b hover:from-cyan-500/5 hover:to-blue-500/5'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.005, duration: 0.2 }}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => handleDayClick(day)}
            >
              {/* Holographic border effect */}
              <div className="absolute inset-0 border border-cyan-500/20 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full bg-gradient-to-br from-transparent via-cyan-500/20 to-transparent" />
              </div>

              {/* Day number */}
              <div className={`text-sm font-bold font-mono mb-2 relative z-10 ${isToday
                ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                : isCurrentMonth
                  ? 'text-white'
                  : 'text-gray-500'
                }`}>
                {day.getDate()}

                {/* Today indicator */}
                {isToday && (
                  <motion.div
                    className="absolute -bottom-1 left-0 w-6 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                    initial={{ width: 0 }}
                    animate={{ width: 24 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  />
                )}
              </div>

              {/* Events */}
              <div className="space-y-1 relative z-10">
                <AnimatePresence>
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <motion.div
                      key={event.id}
                      className="text-xs p-1.5 rounded-md cursor-pointer font-mono font-medium backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-200"
                      style={{
                        backgroundColor: event.color,
                        boxShadow: `0 0 10px ${event.color}40`
                      }}
                      onClick={(e) => handleEventClick(e, event)}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.005 + eventIndex * 0.05 }}
                    >
                      <div className="truncate text-white font-semibold">
                        {event.title}
                      </div>
                      {event.start.getHours() !== 0 || event.start.getMinutes() !== 0 ? (
                        <div className="text-xs opacity-90 text-white">
                          {event.start.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </div>
                      ) : null}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* More events indicator */}
                {dayEvents.length > 3 && (
                  <motion.div
                    className="text-xs text-cyan-300 font-mono font-semibold p-1 rounded bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.005 + 0.3 }}
                  >
                    +{dayEvents.length - 3} MORE
                  </motion.div>
                )}
              </div>

              {/* Event count indicator for days with events */}
              {dayEvents.length > 0 && (
                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full text-xs font-bold text-white shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                  {dayEvents.length}
                </div>
              )}

              {/* Hover effect overlay */}
              {isHovered && !isDisabled && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;