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

const DayView: React.FC<Props> = ({
  currentDate,
  events,
  setHoveredSlot,
  handleSlotClick,
  setSelectedEvent,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const isToday = currentDate.toDateString() === now.toDateString();
  const currentTop = (now.getHours() + now.getMinutes() / 60) * 64;

  return (
    <div className="relative">
      {isToday && (
        <div
          className="absolute left-20 right-0 h-px bg-red-500 z-20"
          style={{ top: currentTop }}
        />
      )}
      <div className="grid grid-cols-[80px_1fr] gap-0">
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="text-xs text-gray-500 pr-4 pt-2 text-right">
              {hour.toString().padStart(2, '0')}:00
            </div>
            <motion.div
              className="border-t border-gray-800 h-16 relative hover:bg-blue-900/10 transition-colors cursor-pointer"
              onMouseEnter={() => setHoveredSlot({ day: currentDate, hour })}
              onMouseLeave={() => setHoveredSlot(null)}
              onClick={() =>
                !events.some(
                  (e) =>
                    e.start.getHours() === hour &&
                    e.start.toDateString() === currentDate.toDateString()
                ) && handleSlotClick(currentDate, hour)
              }
            >
              {events
                .filter((event) => {
                  const eventHour = event.start.getHours();
                  return (
                    event.start.toDateString() === currentDate.toDateString() &&
                    eventHour === hour
                  );
                })
                .map((event) => (
                  <motion.div
                    key={event.id}
                    className="absolute inset-x-1 p-2 rounded cursor-pointer overflow-hidden"
                    style={{
                      backgroundColor: event.color,
                      top: `${(event.start.getMinutes() / 60) * 100}%`,
                      height: `${((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)) * 64}px`,
                      minHeight: '30px',
                    }}
                    whileHover={{ scale: 1.02, zIndex: 10 }}
                    onClick={() => setSelectedEvent(event)}
                    layoutId={`event-${event.id}`}
                  >
                    <div className="text-xs font-medium truncate">{event.title}</div>
                    <div className="text-xs opacity-70">
                      {event.start.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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

export default DayView;
