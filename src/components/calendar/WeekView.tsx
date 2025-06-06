'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent, Slot } from './types';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  setHoveredSlot: (slot: Slot | null) => void;
  handleSlotClick: (day: Date, hour: number) => void;
  setSelectedEvent: (e: CalendarEvent) => void;
}

const WeekView: React.FC<Props> = ({
  currentDate,
  events,
  setHoveredSlot,
  handleSlotClick,
  setSelectedEvent,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const start = new Date(currentDate);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const weekStart = new Date(start);
  const weekEnd = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  const isCurrentWeek = now >= weekStart && now < weekEnd;
  const currentTop = (now.getHours() + now.getMinutes() / 60) * 64;

  return (
    <div className="relative overflow-x-auto">
      {isCurrentWeek && (
        <div
          className="absolute left-20 right-0 h-px bg-red-500 z-20"
          style={{ top: currentTop }}
        />
      )}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-0 min-w-[800px]">
        <div></div>
        {days.map((d, i) => (
          <div key={i} className="p-3 text-center border-b border-gray-800 relative z-10">
            <div className="text-sm text-gray-400">
              {d.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div
              className={`text-lg font-semibold ${
                d.toDateString() === new Date().toDateString() ? 'text-blue-400' : 'text-white'
              }`}
            >
              {d.getDate()}
            </div>
          </div>
        ))}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="text-xs text-gray-500 pr-4 pt-2 text-right border-t border-gray-800">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {days.map((dayDate, dayIndex) => (
              <motion.div
                key={`${dayIndex}-${hour}`}
                className="border-t border-l border-gray-800 h-16 relative hover:bg-blue-900/10 transition-colors cursor-pointer"
                onMouseEnter={() => setHoveredSlot({ day: dayDate, hour })}
                onMouseLeave={() => setHoveredSlot(null)}
                onClick={() =>
                  !events.some(
                    (e) =>
                      e.start.getHours() === hour &&
                      e.start.toDateString() === dayDate.toDateString()
                  ) && handleSlotClick(dayDate, hour)
                }
              >
                {events
                  .filter((event) => {
                    const eventHour = event.start.getHours();
                    return (
                      event.start.toDateString() === dayDate.toDateString() &&
                      eventHour === hour
                    );
                  })
                  .map((event) => (
                    <motion.div
                      key={event.id}
                      className="absolute inset-x-1 p-1 rounded cursor-pointer overflow-hidden z-20"
                      style={{
                        backgroundColor: event.color,
                        top: `${(event.start.getMinutes() / 60) * 100}%`,
                        height: `${((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)) * 64}px`,
                        minHeight: '25px',
                        fontSize: '11px',
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

export default WeekView;
