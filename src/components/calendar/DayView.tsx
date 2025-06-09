'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent, Slot } from './types';
import { useDragToCreate } from './useDragToCreate';
import { useMobileDetection } from './useMobileDetection';

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
  // setHoveredSlot,
  handleSlotClick,
  setSelectedEvent,
  onDragCreateEvent,
  isDisabled = false,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const isToday = currentDate.toDateString() === new Date().toDateString();
  const { isMobile, isTouch } = useMobileDetection();

  // Touch handling states
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);


  const {
    // dragState,
    // handleDragStart,
    // handleDragMove,
    // handleDragEnd,
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
      const scrollPosition = targetHour * 80; // Increased height for mobile
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [currentDate, isToday]);

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
    return (hours * 60 + minutes) / 60 * (isMobile ? 80 : 64);
  };

  // Mobile-optimized touch handlers
  const handleEventTouchStart = (e: React.TouchEvent, event: CalendarEvent) => {
    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    setTouchStartY(touch.clientY);
    setIsScrolling(false);

    // Long press for event selection on mobile
    longPressTimerRef.current = setTimeout(() => {
      if (!isScrolling) {
        // Haptic feedback if available
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

    // Quick tap to view event (not during scroll)
    if (touchDuration < 300 && !isScrolling) {
      setSelectedEvent(event);
    }
  };

  const handleSlotTouch = (e: React.TouchEvent, slot: Slot) => {
    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    setTouchStartY(touch.clientY);

    // Long press to create event on mobile
    longPressTimerRef.current = setTimeout(() => {
      if (!isScrolling) {
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        handleSlotClick(slot.day, slot.hour);
      }
    }, 500);
  };

  const slotHasEvent = (hour: number): boolean => {
    return events.some(event => {
      if (event.start.toDateString() !== currentDate.toDateString()) {
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
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overflow-x-hidden"
        style={{ WebkitOverflowScrolling: 'touch' }} // Smooth scrolling on iOS
      >
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
                <span className={`absolute ${isMobile ? 'left-16' : 'left-20'} -top-5 text-xs text-red-500 font-semibold bg-black px-1 rounded`}>
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
                <div className="flex items-center">
                  <div className={isMobile ? 'w-16' : 'w-20'}></div>
                  <div className="flex-1 h-0.5 bg-red-500 relative">
                    <div className="absolute left-0 w-3 h-3 bg-red-500 rounded-full -mt-1.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Events container */}
          <div className={`absolute inset-0 grid ${isMobile ? 'grid-cols-[60px_1fr]' : 'grid-cols-[80px_1fr]'} gap-0 pointer-events-none`}>
            <div></div>
            <div className="relative">
              {events
                .filter(event => event.start.toDateString() === currentDate.toDateString())
                .map((event) => {
                  const startHour = event.start.getHours();
                  const startMinutes = event.start.getMinutes();
                  const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
                  const topPosition = (startHour + startMinutes / 60) * (isMobile ? 80 : 64);
                  const height = duration * (isMobile ? 80 : 64);

                  return (
                    <motion.div
                      key={event.id}
                      className={`absolute ${isMobile ? 'left-2 right-2' : 'left-1 right-1'} p-2 rounded-lg cursor-pointer shadow-lg pointer-events-auto`}
                      style={{
                        backgroundColor: event.color,
                        top: `${topPosition}px`,
                        height: `${Math.max(height, isMobile ? 40 : 30)}px`,
                        zIndex: 20,
                      }}
                      whileHover={!isTouch ? { scale: 1.02, zIndex: 25 } : {}}
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
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium truncate text-white`}>
                        {event.title}
                      </div>
                      {(!isMobile || height > 60) && (
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
                      )}
                    </motion.div>
                  );
                })}
            </div>
          </div>

          {/* Grid for time slots */}
          <div className={`grid ${isMobile ? 'grid-cols-[60px_1fr]' : 'grid-cols-[80px_1fr]'} gap-0`}>
            {hours.map((hour) => {
              const slot: Slot = { day: currentDate, hour };
              const isInDragRange = isSlotInDragRange(slot);
              const hasEvent = slotHasEvent(hour);

              return (
                <React.Fragment key={hour}>
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 pr-2 pt-2 text-right`}>
                    {formatHour(hour)}
                  </div>
                  <motion.div
                    className={`border-t border-gray-800 ${isMobile ? 'h-20' : 'h-16'} relative transition-colors ${hasEvent ? '' : 'cursor-pointer'
                      } select-none ${isInDragRange ? 'bg-blue-500/20' : (!hasEvent && !isDisabled ? 'hover:bg-blue-900/10' : '')
                      } ${isDisabled ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (!hasEvent && !isDisabled && !isTouch) {
                        handleSlotClick(currentDate, hour);
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
                    {isToday && currentTime.getHours() === hour && (
                      <motion.div
                        className="absolute inset-0 bg-blue-500/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}

                    {/* Mobile tap hint */}
                    {isMobile && !hasEvent && !isDisabled && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs text-gray-500">Long press to add</span>
                      </div>
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