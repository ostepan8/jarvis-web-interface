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

const DayView: React.FC<Props> = ({
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
  const isToday = currentDate.toDateString() === new Date().toDateString();

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
    if (scrollContainerRef.current && isToday) {
      const currentHour = new Date().getHours();
      const targetHour = Math.max(0, currentHour - 2);
      const scrollPosition = targetHour * 64;
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [currentDate, isToday]);

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

  // Check if a slot has any events (including multi-hour events)
  const slotHasEvent = (hour: number): boolean => {
    return events.some(event => {
      const eventStartHour = event.start.getHours();
      const eventEndHour = event.end.getHours();
      const eventStartMinutes = event.start.getMinutes();
      const eventEndMinutes = event.end.getMinutes();

      // If event spans multiple days, handle it
      if (event.start.toDateString() !== currentDate.toDateString()) {
        return false;
      }

      // Check if this hour is within the event's time range
      if (eventStartHour === eventEndHour) {
        return hour === eventStartHour;
      } else if (hour === eventStartHour) {
        return true;
      } else if (hour === eventEndHour) {
        return eventEndMinutes > 0;
      } else if (hour > eventStartHour && hour < eventEndHour) {
        return true;
      }

      return false;
    });
  };

  return (
    <div className="relative h-[600px] overflow-hidden">
      <div ref={scrollContainerRef} className="h-full overflow-y-auto">
        <div className="relative">
          {/* Current time indicator */}
          {isToday && (
            <motion.div
              className="absolute left-0 right-0 z-30 pointer-events-none"
              style={{ top: `${getCurrentTimePosition()}px` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <span className="absolute left-20 -top-5 text-xs text-red-500 font-semibold bg-black px-1 rounded">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
                <div className="flex items-center">
                  <div className="w-20"></div>
                  <div className="flex-1 h-0.5 bg-red-500 relative">
                    <div className="absolute left-0 w-3 h-3 bg-red-500 rounded-full -mt-1.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Events container - absolute positioned over the grid */}
          <div className="absolute inset-0 grid grid-cols-[80px_1fr] gap-0 pointer-events-none">
            <div></div>
            <div className="relative">
              {events
                .filter(event => event.start.toDateString() === currentDate.toDateString())
                .map((event) => {
                  const startHour = event.start.getHours();
                  const startMinutes = event.start.getMinutes();
                  const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
                  const topPosition = (startHour + startMinutes / 60) * 64;
                  const height = duration * 64;

                  return (
                    <motion.div
                      key={event.id}
                      className="absolute left-1 right-1 p-2 rounded cursor-pointer shadow-lg pointer-events-auto"
                      style={{
                        backgroundColor: event.color,
                        top: `${topPosition}px`,
                        height: `${Math.max(height, 30)}px`,
                        zIndex: 20,
                      }}
                      whileHover={{ scale: 1.02, zIndex: 25 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) {
                          setSelectedEvent(event);
                        }
                      }}
                      layoutId={`event-${event.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-xs font-medium truncate text-white">
                        {event.title}
                      </div>
                      <div className="text-xs opacity-90 text-white">
                        {event.start.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                        {duration > 0.5 && (
                          <>
                            {' - '}
                            {event.end.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>

          {/* Grid for time slots */}
          <div className="grid grid-cols-[80px_1fr] gap-0">
            {hours.map((hour) => {
              const slot: Slot = { day: currentDate, hour };
              const isInDragRange = isSlotInDragRange(slot);
              const hasEvent = slotHasEvent(hour);

              return (
                <React.Fragment key={hour}>
                  <div className="text-xs text-gray-500 pr-4 pt-2 text-right">
                    {formatHour(hour)}
                  </div>
                  <motion.div
                    className={`border-t border-gray-800 h-16 relative transition-colors ${hasEvent ? '' : 'cursor-pointer'
                      } select-none ${isInDragRange ? 'bg-blue-500/20' : (!hasEvent && !isDisabled ? 'hover:bg-blue-900/10' : '')
                      } ${isDisabled ? 'opacity-50' : ''}`}
                    onMouseDown={() => !hasEvent && !isDisabled && handleMouseDown(slot)}
                    onMouseEnter={() => !isDisabled && handleMouseEnter(slot)}
                    onMouseLeave={() => !dragState.isDragging && !isDisabled && setHoveredSlot(null)}
                    onTouchStart={() => !hasEvent && !isDisabled && handleTouchStart(slot)}
                    onTouchMove={(e) => !isDisabled && handleTouchMove(e, slot)}
                    onClick={() => {
                      if (!dragState.isDragging && !hasEvent && !isDisabled) {
                        handleSlotClick(currentDate, hour);
                      }
                    }}
                  >
                    {/* Subtle hour background for current hour */}
                    {isToday && currentTime.getHours() === hour && (
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
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;