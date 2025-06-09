'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent, Slot } from './types';
import { useDragToCreate } from './useDragToCreate';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  setHoveredSlot: (slot: Slot | null) => void;
  handleSlotClick: (day: Date, hour: number) => void;
  setSelectedEvent: (e: CalendarEvent) => void;
  onDragCreateEvent?: (startSlot: Slot, endSlot: Slot) => void;
  isDisabled?: boolean;
}

const WeekView: React.FC<Props> = ({
  currentDate,
  events,
  setHoveredSlot,
  handleSlotClick,
  setSelectedEvent,
  onDragCreateEvent,
  isDisabled = false,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const start = new Date(currentDate);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });

  const today = new Date();
  const todayIndex = days.findIndex(d => d.toDateString() === today.toDateString());

  const {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    isSlotInDragRange,
  } = useDragToCreate((startSlot, endSlot) => {
    if (onDragCreateEvent && !isDisabled) {
      onDragCreateEvent(startSlot, endSlot);
    }
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && todayIndex !== -1) {
      const currentHour = new Date().getHours();
      const targetHour = Math.max(0, currentHour - 2);
      const scrollPosition = targetHour * 64;
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [currentDate, todayIndex]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragState.isDragging) {
        handleDragEnd();
      }
    };

    const handleGlobalTouchEnd = () => {
      if (dragState.isDragging) {
        handleDragEnd();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [dragState.isDragging, handleDragEnd]);

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const getCurrentTimePosition = (): number => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * 60 + minutes) / 60 * 64;
  };

  const handleMouseDown = (slot: Slot) => {
    if (!isDisabled) {
      handleDragStart(slot);
    }
  };

  const handleMouseEnter = (slot: Slot) => {
    if (dragState.isDragging && !isDisabled) {
      handleDragMove(slot);
    } else if (!isDisabled) {
      setHoveredSlot(slot);
    }
  };

  const handleTouchStart = (slot: Slot) => {
    if (!isDisabled) {
      handleDragStart(slot);
    }
  };

  const handleTouchMove = (e: React.TouchEvent, slot: Slot) => {
    if (!isDisabled) {
      e.preventDefault();
      handleDragMove(slot);
    }
  };

  return (
    <div className="relative h-[600px] overflow-hidden">
      <div className="sticky top-0 bg-black z-20 border-b border-gray-800">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-0 min-w-[800px]">
          <div></div>
          {days.map((d, i) => (
            <div key={i} className="p-3 text-center">
              <div className="text-sm text-gray-400">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`text-lg font-semibold ${d.toDateString() === today.toDateString() ? 'text-blue-400' : 'text-white'
                  }`}
              >
                {d.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={scrollContainerRef} className="h-full overflow-y-auto overflow-x-auto">
        <div className="relative min-w-[800px]">
          {/* Current time indicator */}
          {todayIndex !== -1 && (
            <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-0 absolute inset-x-0 z-30 pointer-events-none">
              <div></div>
              {days.map((d, i) => (
                <div key={i} className="relative">
                  {i === todayIndex && (
                    <motion.div
                      className="absolute left-0 right-0"
                      style={{ top: `${getCurrentTimePosition()}px` }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="relative">
                        <span className="absolute left-1 -top-5 text-xs text-red-500 font-semibold bg-black px-1 rounded">
                          {currentTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                        <div className="h-0.5 bg-red-500 relative">
                          <div className="absolute left-0 w-3 h-3 bg-red-500 rounded-full -mt-1.5" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-0">
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="text-xs text-gray-500 pr-4 pt-2 text-right border-t border-gray-800">
                  {formatHour(hour)}
                </div>
                {days.map((dayDate, dayIndex) => {
                  const slot: Slot = { day: dayDate, hour };
                  const isInDragRange = isSlotInDragRange(slot);
                  const hasEvent = events.some(
                    (e) =>
                      e.start.getHours() === hour &&
                      e.start.toDateString() === dayDate.toDateString()
                  );

                  return (
                    <motion.div
                      key={`${dayIndex}-${hour}`}
                      className={`border-t border-l border-gray-800 h-16 relative transition-colors cursor-pointer select-none ${isInDragRange ? 'bg-blue-500/20' : 'hover:bg-blue-900/10'
                        } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                      onMouseDown={() => !hasEvent && !isDisabled && handleMouseDown(slot)}
                      onMouseEnter={() => handleMouseEnter(slot)}
                      onMouseLeave={() => !dragState.isDragging && !isDisabled && setHoveredSlot(null)}
                      onTouchStart={() => !hasEvent && !isDisabled && handleTouchStart(slot)}
                      onTouchMove={(e) => !isDisabled && handleTouchMove(e, slot)}
                      onClick={() => {
                        if (!dragState.isDragging && !hasEvent && !isDisabled) {
                          handleSlotClick(dayDate, hour);
                        }
                      }}
                    >
                      {/* Current hour highlight */}
                      {dayDate.toDateString() === today.toDateString() &&
                        currentTime.getHours() === hour && (
                          <motion.div
                            className="absolute inset-0 bg-blue-500/5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}

                      {/* Drag preview */}
                      {isInDragRange && (
                        <div className="absolute inset-0 border-2 border-blue-500 border-dashed" />
                      )}

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
                            className="absolute inset-x-1 p-1 rounded cursor-pointer overflow-hidden z-20 shadow-md"
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
                              if (!isDisabled) {
                                setSelectedEvent(event);
                              }
                            }}
                            layoutId={`event-${event.id}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="font-medium truncate text-white">{event.title}</div>
                            <div className="text-xs opacity-90 text-white">
                              {event.start.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </div>
                          </motion.div>
                        ))}
                    </motion.div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;