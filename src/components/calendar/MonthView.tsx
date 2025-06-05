'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from './types';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  setSelectedEvent: (e: CalendarEvent) => void;
}

const MonthView: React.FC<Props> = ({ currentDate, events, setSelectedEvent }) => {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: Date[] = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="p-2 text-center text-sm text-gray-400 font-semibold">
          {day}
        </div>
      ))}
      {days.map((day, i) => {
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
        const isToday = day.toDateString() === new Date().toDateString();
        const dayEvents = events.filter((e) => e.start.toDateString() === day.toDateString());
        return (
          <motion.div
            key={i}
            className={`min-h-[100px] p-2 border border-gray-800 rounded-lg cursor-pointer ${!isCurrentMonth ? 'opacity-30' : ''} ${isToday ? 'border-blue-400 bg-blue-900/20' : 'hover:bg-gray-900/50'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.01 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>{day.getDate()}</div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event) => (
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
                <div className="text-xs text-gray-400">+{dayEvents.length - 3} more</div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MonthView;
