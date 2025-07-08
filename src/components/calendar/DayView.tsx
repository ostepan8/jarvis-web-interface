'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from '../../../types';

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

  const handleDragEnd = useCallback(() => {
    if (dragState.isActive && dragState.startSlot && dragState.endSlot) {
      onDragCreate(dragState.startSlot, dragState.endSlot);
    }
    setDragState({
      isActive: false,
      startSlot: null,
      endSlot: null,
    });
  }, [dragState, onDragCreate]);

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
  setSelectedEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
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
  const { isMobile, isTouch } = useMobileDetection();

  // Touch handling states
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Memoize the filtered events to prevent unnecessary re-renders
  const dayEvents = React.useMemo(() => {
    if (!events || events.length === 0) return [];

    const currentDateStr = currentDate.toDateString();

    return events.filter(event => {
      try {
        // Ensure we have a proper Date object
        const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
        const eventDateStr = eventStart.toDateString();

        return eventDateStr === currentDateStr;
      } catch (error) {
        console.error('Error filtering event:', event, error);
        return false;
      }
    });
  }, [events, currentDate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && isToday) {
      const currentHour = new Date().getHours();
      const targetHour = Math.max(0, currentHour - 2);
      const scrollPosition = targetHour * (isMobile ? 80 : 64);
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [currentDate, isToday, isMobile]);

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
  const slotHasEvent = (hour: number): boolean => {
    return dayEvents.some(event => {
      const eventStartHour = event.start.getHours();
      const eventEndHour = event.end.getHours();
      const eventEndMinutes = event.end.getMinutes();

      if (hour === eventStartHour) return true;
      if (hour > eventStartHour && hour < eventEndHour) return true;
      if (hour === eventEndHour && eventEndMinutes > 0) return true;

      return false;
    });
  };

  // Enhanced event collision detection and layout calculation
  const calculateEventLayout = (events: CalendarEvent[]) => {
    if (!events || events.length === 0) return [];

    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    // Calculate overlapping groups
    const eventLayouts = sortedEvents.map((event, index) => {
      const startTime = event.start.getTime();
      const endTime = event.end.getTime();

      // Find all events that overlap with this one
      const overlapping = sortedEvents.filter(other => {
        const otherStart = other.start.getTime();
        const otherEnd = other.end.getTime();

        return (
          (startTime < otherEnd && endTime > otherStart) && // Basic overlap check
          other.id !== event.id
        );
      });

      // Calculate horizontal offset for stacking
      const overlapOffset = overlapping.filter(other =>
        sortedEvents.findIndex(e => e.id === other.id) < index
      ).length;

      return {
        event,
        overlapOffset,
        totalOverlapping: overlapping.length,
        hasOverlap: overlapping.length > 0
      };
    });

    return eventLayouts;
  };

  // Memoize the event layouts to prevent unnecessary recalculations
  const eventLayouts = React.useMemo(() => {
    return calculateEventLayout(dayEvents);
  }, [dayEvents]);

  // Handle mouse events for drag creation (desktop only)
  const handleMouseDown = (e: React.MouseEvent, slot: Slot) => {
    if (!isTouch && !isDisabled && !slotHasEvent(slot.hour)) {
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
  }, [dragState.isActive, handleDragEnd]);

  return (
    <div className={`relative ${isMobile ? 'h-[calc(100vh-200px)]' : 'h-[600px]'} overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-lg border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.1)]`}>
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onMouseLeave={handleMouseLeave}
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
                <span className={`absolute ${isMobile ? 'left-16' : 'left-20'} -top-2 text-xs text-cyan-400 font-mono font-bold bg-black/80 px-2 py-1 rounded border border-cyan-500/30`}>
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
                <div className="flex items-center">
                  <div className={isMobile ? 'w-16' : 'w-20'}></div>
                  <div className="flex-1 h-0.5 bg-cyan-400 relative shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                    <div className="absolute left-0 w-3 h-3 bg-cyan-400 rounded-full -mt-1.5 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Events container */}
          <div className={`absolute inset-0 grid ${isMobile ? 'grid-cols-[60px_1fr]' : 'grid-cols-[80px_1fr]'} gap-0 pointer-events-none`}>
            <div></div>
            <div className="relative">
              {eventLayouts.map((layout) => {
                const { event, overlapOffset, totalOverlapping, hasOverlap } = layout;
                const startHour = event.start.getHours();
                const startMinutes = event.start.getMinutes();
                const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
                const topPosition = (startHour + startMinutes / 60) * (isMobile ? 80 : 64);
                const height = duration * (isMobile ? 80 : 64);

                // Calculate horizontal stacking offset
                const stackOffset = hasOverlap ? overlapOffset * (isMobile ? 12 : 16) : 0;
                const baseWidth = hasOverlap ? '85%' : '95%';
                const leftMargin = isMobile ? 2 : 4;

                return (
                  <motion.div
                    key={event.id}
                    className={`absolute p-2 rounded-lg cursor-pointer shadow-lg backdrop-blur-sm border pointer-events-auto ${hasOverlap ? 'border-cyan-400/60 shadow-2xl' : 'border-white/20'
                      }`}
                    style={{
                      backgroundColor: event.color,
                      top: `${topPosition}px`,
                      height: `${Math.max(height, isMobile ? 40 : 30)}px`,
                      left: `${leftMargin + stackOffset}px`,
                      width: baseWidth,
                      zIndex: hasOverlap ? 25 + overlapOffset : 20,
                      boxShadow: hasOverlap
                        ? `0 0 30px ${event.color}80, 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`
                        : `0 0 20px ${event.color}40`,
                      transform: hasOverlap ? 'translateZ(0)' : 'none', // GPU acceleration
                    }}
                    whileHover={!isTouch ? {
                      scale: 1.02,
                      x: hasOverlap ? -4 : 0,
                      zIndex: hasOverlap ? 35 + overlapOffset : 25,
                      transition: { duration: 0.2 }
                    } : {}}
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
                    transition={{ duration: 0.3, delay: overlapOffset * 0.1 }}
                  >
                    {/* Overlap indicator badge */}
                    {hasOverlap && overlapOffset === 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full border-2 border-white text-xs font-bold text-black flex items-center justify-center shadow-lg">
                        {totalOverlapping + 1}
                      </div>
                    )}

                    {/* Stacking depth indicator */}
                    {hasOverlap && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-cyan-400/80 rounded-full border border-white/40" />
                    )}

                    {/* Event content */}
                    <div className={`${isMobile ? 'text-sm' : 'text-xs'} font-bold truncate text-white font-mono drop-shadow-lg`}>
                      {event.title}
                    </div>

                    {/* Time display */}
                    {(!isMobile || height > 60) && (
                      <div className="text-xs opacity-90 text-white font-mono drop-shadow-md">
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

                    {/* Visual depth effect for overlapping events */}
                    {hasOverlap && (
                      <>
                        {/* Outer glow */}
                        <div className="absolute inset-0 rounded-lg border border-cyan-400/40 pointer-events-none" />
                        {/* Inner highlight */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                      </>
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
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-cyan-400 pr-2 pt-2 text-right font-mono font-bold border-r border-cyan-500/20`}>
                    {formatHour(hour)}
                  </div>
                  <motion.div
                    className={`border-t border-cyan-500/20 ${isMobile ? 'h-20' : 'h-16'} relative transition-all duration-300 ${hasEvent ? '' : 'cursor-pointer'
                      } select-none ${isInDragRange
                        ? 'bg-cyan-500/20 border-cyan-400'
                        : (!hasEvent && !isDisabled && !isTouch ? 'hover:bg-cyan-500/10 hover:border-cyan-400/50' : '')
                      } ${isDisabled ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (!hasEvent && !isDisabled && !isTouch) {
                        handleSlotClick(currentDate, hour);
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
                    {isToday && currentTime.getHours() === hour && (
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

                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="w-full h-full bg-gradient-to-br from-transparent via-cyan-500/20 to-transparent" />
                    </div>

                    {/* Mobile interaction hint */}
                    {isMobile && !hasEvent && !isDisabled && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs text-cyan-400 font-mono uppercase tracking-wide">LONG.PRESS</span>
                      </div>
                    )}

                    {/* Hour line accent */}
                    <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-transparent" />
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