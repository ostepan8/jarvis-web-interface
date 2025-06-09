'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent, Slot } from './types';

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
  handleSlotClick,
  setSelectedEvent,
  isDisabled = false,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isMobile, isTouch } = useMobileDetection();

  // Touch handling states
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout>();

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

  // const {
  //   dragState,
  //   handleDragStart,
  //   handleDragMove,
  //   handleDragEnd,
  //   isSlotInDragRange,
  // } = useDragToCreate((startSlot, endSlot) => {
  //   if (onDragCreateEvent && !isDisabled) {
  //     onDragCreateEvent(startSlot, endSlot);
  //   }
  // });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && todayIndex !== -1) {
      const currentHour = new Date().getHours();
      const targetHour = Math.max(0, currentHour - 2);
      const scrollPosition = targetHour * (isMobile ? 80 : 64);
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [currentDate, todayIndex, isMobile]);

  const formatHour = (hour: number): string => {
    if (isMobile) {
      if (hour === 0) return '12a';
      if (hour === 12) return '12p';
      if (hour < 12) return `${hour}a`;
      return `${hour - 12}p`;
    }
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const getCurrentTimePosition = (): number => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * 60 + minutes) / 60 * (isMobile ? 80 : 64);
  };

  // Mobile-optimized touch handlers
  const handleEventTouchStart = (e: React.TouchEvent, event: CalendarEvent) => {
    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    setTouchStartY(touch.clientY);
    setIsScrolling(false);

    longPressTimerRef.current = setTimeout(() => {
      if (!isScrolling) {
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        setSelectedEvent(event);
      }
    }, 500);
  };

  const handleEventTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaY = Math.abs(touch.clientY - touchStartY);

    if (deltaY > 10) {
      setIsScrolling(true);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    }
  };

  const handleEventTouchEnd = (e: React.TouchEvent, event: CalendarEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    const touchDuration = Date.now() - touchStartTime;

    if (touchDuration < 300 && !isScrolling) {
      setSelectedEvent(event);
    }
  };

  const handleSlotTouch = (e: React.TouchEvent, slot: Slot) => {
    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    setTouchStartY(touch.clientY);

    longPressTimerRef.current = setTimeout(() => {
      if (!isScrolling) {
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        handleSlotClick(slot.day, slot.hour);
      }
    }, 500);
  };

  // Check if a slot has any events (including multi-hour events)
  const slotHasEvent = (dayDate: Date, hour: number): boolean => {
    return events.some(event => {
      if (event.start.toDateString() !== dayDate.toDateString()) {
        return false;
      }

      const eventStartHour = event.start.getHours();
      const eventEndHour = event.end.getHours();
      const eventEndMinutes = event.end.getMinutes();

      if (hour === eventStartHour) return true;
      if (hour > eventStartHour && hour < eventEndHour) return true;
      if (hour === eventEndHour && eventEndMinutes > 0) return true;

      return false;
    });
  };

  return (
    <div className={`relative ${isMobile ? 'h-[calc(100vh-200px)]' : 'h-[600px]'} overflow-hidden`}>
      <div className="sticky top-0 bg-black z-20 border-b border-gray-800">
        <div className={`grid ${isMobile ? 'grid-cols-[40px_repeat(7,1fr)]' : 'grid-cols-[80px_repeat(7,1fr)]'} gap-0 ${isMobile ? '' : 'min-w-[800px]'}`}>
          <div></div>
          {days.map((d, i) => (
            <div key={i} className={`${isMobile ? 'p-1' : 'p-3'} text-center`}>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`${isMobile ? 'text-sm' : 'text-lg'} font-semibold ${d.toDateString() === today.toDateString() ? 'text-blue-400' : 'text-white'
                  }`}
              >
                {d.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overflow-x-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className={`relative ${isMobile ? '' : 'min-w-[800px]'}`}>
          {/* Current time indicator */}
          {todayIndex !== -1 && (
            <div className={`grid ${isMobile ? 'grid-cols-[40px_repeat(7,1fr)]' : 'grid-cols-[80px_repeat(7,1fr)]'} gap-0 absolute inset-x-0 z-30 pointer-events-none`}>
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
                        {!isMobile && (
                          <span className="absolute left-1 -top-5 text-xs text-red-500 font-semibold bg-black px-1 rounded">
                            {currentTime.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        )}
                        <div className="h-0.5 bg-red-500 relative">
                          <div className="absolute left-0 w-2 h-2 bg-red-500 rounded-full -mt-1" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Events container - absolute positioned over the grid */}
          <div className={`absolute inset-0 grid ${isMobile ? 'grid-cols-[40px_repeat(7,1fr)]' : 'grid-cols-[80px_repeat(7,1fr)]'} gap-0 pointer-events-none`}>
            <div></div>
            {days.map((dayDate, dayIndex) => (
              <div key={dayIndex} className="relative">
                {events
                  .filter(event => event.start.toDateString() === dayDate.toDateString())
                  .map((event) => {
                    const startHour = event.start.getHours();
                    const startMinutes = event.start.getMinutes();
                    const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
                    const topPosition = (startHour + startMinutes / 60) * (isMobile ? 80 : 64);
                    const height = duration * (isMobile ? 80 : 64);

                    return (
                      <motion.div
                        key={event.id}
                        className={`absolute ${isMobile ? 'left-0.5 right-0.5 p-1' : 'left-1 right-1 p-1'} rounded cursor-pointer shadow-md pointer-events-auto`}
                        style={{
                          backgroundColor: event.color,
                          top: `${topPosition}px`,
                          height: `${Math.max(height, isMobile ? 30 : 25)}px`,
                          fontSize: isMobile ? '10px' : '11px',
                          zIndex: 20,
                        }}
                        whileHover={!isTouch ? { scale: 1.05, zIndex: 25 } : {}}
                        whileTap={isTouch ? { scale: 0.98 } : {}}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDisabled && !isTouch) {
                            setSelectedEvent(event);
                          }
                        }}
                        onTouchStart={(e) => handleEventTouchStart(e, event)}
                        onTouchMove={handleEventTouchMove}
                        onTouchEnd={(e) => handleEventTouchEnd(e, event)}
                        layoutId={`event-${event.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="font-medium truncate text-white">{event.title}</div>
                        {(!isMobile || height > 40) && (
                          <div className="text-xs opacity-90 text-white">
                            {event.start.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            ))}
          </div>

          {/* Grid for time slots */}
          <div className={`grid ${isMobile ? 'grid-cols-[40px_repeat(7,1fr)]' : 'grid-cols-[80px_repeat(7,1fr)]'} gap-0`}>
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                <div className={`${isMobile ? 'text-xs pr-1' : 'text-xs pr-4'} text-gray-500 pt-2 text-right border-t border-gray-800`}>
                  {formatHour(hour)}
                </div>
                {days.map((dayDate, dayIndex) => {
                  const slot: Slot = { day: dayDate, hour };
                  const isInDragRange = isSlotInDragRange(slot);
                  const hasEvent = slotHasEvent(dayDate, hour);

                  return (
                    <motion.div
                      key={`${dayIndex}-${hour}`}
                      className={`border-t border-l border-gray-800 ${isMobile ? 'h-20' : 'h-16'} relative transition-colors ${hasEvent ? '' : 'cursor-pointer'
                        } select-none ${isInDragRange ? 'bg-blue-500/20' : (!hasEvent && !isDisabled && !isTouch ? 'hover:bg-blue-900/10' : '')
                        } ${isDisabled ? 'opacity-50' : ''}`}
                      onClick={() => {
                        if (!hasEvent && !isDisabled && !isTouch) {
                          handleSlotClick(dayDate, hour);
                        }
                      }}
                      onTouchStart={(e) => {
                        if (!hasEvent && !isDisabled) {
                          handleSlotTouch(e, slot);
                        }
                      }}
                      onTouchMove={(e) => {
                        const touch = e.touches[0];
                        const deltaY = Math.abs(touch.clientY - touchStartY);
                        if (deltaY > 10) {
                          setIsScrolling(true);
                          if (longPressTimerRef.current) {
                            clearTimeout(longPressTimerRef.current);
                          }
                        }
                      }}
                      onTouchEnd={() => {
                        if (longPressTimerRef.current) {
                          clearTimeout(longPressTimerRef.current);
                        }
                        setIsScrolling(false);
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

                      {/* Drag preview - desktop only */}
                      {!isTouch && isInDragRange && (
                        <div className="absolute inset-0 border-2 border-blue-500 border-dashed" />
                      )}
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