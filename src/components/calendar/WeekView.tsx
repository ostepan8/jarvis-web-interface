'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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

interface Slot {
  day: Date;
  hour: number;
}

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

// Simplified drag to create hook
const useDragToCreate = (onDragCreate: (startSlot: Slot, endSlot: Slot) => void) => {
  const [dragState, setDragState] = useState<{
    isActive: boolean;
    startSlot: Slot | null;
    endSlot: Slot | null;
  }>({
    isActive: false,
    startSlot: null,
    endSlot: null,
  });

  const handleDragStart = (slot: Slot) => {
    setDragState({
      isActive: true,
      startSlot: slot,
      endSlot: slot,
    });
  };

  const handleDragMove = (slot: Slot) => {
    if (dragState.isActive && dragState.startSlot) {
      setDragState(prev => ({
        ...prev,
        endSlot: slot,
      }));
    }
  };

  const handleDragEnd = () => {
    if (dragState.isActive && dragState.startSlot && dragState.endSlot) {
      onDragCreate(dragState.startSlot, dragState.endSlot);
    }
    setDragState({
      isActive: false,
      startSlot: null,
      endSlot: null,
    });
  };

  const isSlotInDragRange = (slot: Slot): boolean => {
    if (!dragState.isActive || !dragState.startSlot || !dragState.endSlot) {
      return false;
    }

    const startTime = dragState.startSlot.day.getTime() + dragState.startSlot.hour * 60 * 60 * 1000;
    const endTime = dragState.endSlot.day.getTime() + dragState.endSlot.hour * 60 * 60 * 1000;
    const slotTime = slot.day.getTime() + slot.hour * 60 * 60 * 1000;

    return slotTime >= Math.min(startTime, endTime) && slotTime <= Math.max(startTime, endTime);
  };

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    isSlotInDragRange,
  };
};

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  setHoveredSlot?: (slot: Slot | null) => void;
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
  const { isMobile, isTouch } = useMobileDetection();

  // Touch handling states
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate week start (Sunday)
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

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to current time on mount
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

  // Mobile-optimized touch handlers for events
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

  // Mobile-optimized touch handlers for slots
  const handleSlotTouch = (e: React.TouchEvent, slot: Slot) => {
    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    setTouchStartY(touch.clientY);
    setIsScrolling(false);

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

  // Handle mouse events for drag creation (desktop only)
  const handleMouseDown = (e: React.MouseEvent, slot: Slot) => {
    if (!isTouch && !isDisabled && !slotHasEvent(slot.day, slot.hour)) {
      e.preventDefault();
      handleDragStart(slot);
    }
  };

  const handleMouseEnter = (slot: Slot) => {
    if (!isTouch) {
      setHoveredSlot?.(slot);
      if (dragState.isActive) {
        handleDragMove(slot);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isTouch && dragState.isActive) {
      handleDragEnd();
    }
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setHoveredSlot?.(null);
    }
  };

  // Global mouse up handler for drag operations
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragState.isActive) {
        handleDragEnd();
      }
    };

    if (dragState.isActive) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState.isActive]);

  return (
    <div className={`relative ${isMobile ? 'h-[calc(100vh-200px)]' : 'h-[600px]'} overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900`}>
      {/* Header with day labels */}
      <div className="sticky top-0 bg-gradient-to-r from-slate-900/95 via-blue-950/95 to-slate-900/95 backdrop-blur-xl z-20 border-b border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
        <div className={`grid ${isMobile ? 'grid-cols-[40px_repeat(7,1fr)]' : 'grid-cols-[80px_repeat(7,1fr)]'} gap-0 ${isMobile ? '' : 'min-w-[800px]'}`}>
          <div className="border-r border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent"></div>
          {days.map((d, i) => (
            <div key={i} className={`${isMobile ? 'p-1' : 'p-3'} text-center border-r border-cyan-500/20 relative group`}>
              {/* Holographic background effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-blue-500/5 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-cyan-300 font-mono uppercase tracking-wide relative z-10`}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold font-mono relative z-10 ${d.toDateString() === today.toDateString()
                  ? 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse'
                  : 'text-white group-hover:text-cyan-200 transition-colors duration-300'
                  }`}
              >
                {d.getDate()}
              </div>

              {/* Today indicator */}
              {d.toDateString() === today.toDateString() && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onMouseLeave={handleMouseLeave}
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
                          <span className="absolute -left-16 -top-2 text-xs text-cyan-400 font-mono font-bold bg-black/80 px-2 py-1 rounded border border-cyan-500/30">
                            {currentTime.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        )}
                        <div className="h-0.5 bg-cyan-400 relative shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                          <div className="absolute left-0 w-3 h-3 bg-cyan-400 rounded-full -mt-1.5 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Events container */}
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
                        className={`absolute ${isMobile ? 'left-0.5 right-0.5 p-1' : 'left-1 right-1 p-1'} rounded-lg cursor-pointer shadow-lg backdrop-blur-sm border border-white/20 pointer-events-auto`}
                        style={{
                          backgroundColor: event.color,
                          top: `${topPosition}px`,
                          height: `${Math.max(height, isMobile ? 30 : 25)}px`,
                          fontSize: isMobile ? '10px' : '11px',
                          zIndex: 20,
                          boxShadow: `0 0 20px ${event.color}40`,
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
                        <div className="font-bold truncate text-white font-mono">{event.title}</div>
                        {(!isMobile || height > 40) && (
                          <div className="text-xs opacity-90 text-white font-mono">
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
                <div className={`${isMobile ? 'text-xs pr-1' : 'text-xs pr-4'} text-cyan-400 pt-2 text-right border-t border-cyan-500/20 font-mono font-bold`}>
                  {formatHour(hour)}
                </div>
                {days.map((dayDate, dayIndex) => {
                  const slot: Slot = { day: dayDate, hour };
                  const isInDragRange = isSlotInDragRange(slot);
                  const hasEvent = slotHasEvent(dayDate, hour);

                  return (
                    <motion.div
                      key={`${dayIndex}-${hour}`}
                      className={`border-t border-l border-cyan-500/20 ${isMobile ? 'h-20' : 'h-16'} relative transition-all duration-300 ${hasEvent ? '' : 'cursor-pointer'
                        } select-none ${isInDragRange
                          ? 'bg-cyan-500/20 border-cyan-400'
                          : (!hasEvent && !isDisabled && !isTouch ? 'hover:bg-cyan-500/10 hover:border-cyan-400/50' : '')
                        } ${isDisabled ? 'opacity-50' : ''}`}
                      onClick={() => {
                        if (!hasEvent && !isDisabled && !isTouch) {
                          handleSlotClick(dayDate, hour);
                        }
                      }}
                      onMouseDown={(e) => handleMouseDown(e, slot)}
                      onMouseEnter={() => handleMouseEnter(slot)}
                      onMouseUp={handleMouseUp}
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
                            className="absolute inset-0 bg-cyan-500/10 border border-cyan-400/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}

                      {/* Drag preview */}
                      {!isTouch && isInDragRange && (
                        <div className="absolute inset-0 border-2 border-cyan-400 border-dashed bg-cyan-500/10" />
                      )}

                      {/* Grid dot pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="w-full h-full bg-gradient-to-br from-transparent via-cyan-500/5 to-transparent" />
                      </div>
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