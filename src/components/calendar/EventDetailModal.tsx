'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Loader2, Calendar, AlarmClock } from 'lucide-react';
import { CalendarEvent } from './types';

interface Props {
  event: CalendarEvent | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const EventDetailModal: React.FC<Props> = ({ event, onClose, onDelete, isDeleting = false }) => {
  if (!event) return null;

  const duration = event.end.getTime() - event.start.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  const formatDuration = () => {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minutes`;
    }
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background based on event color */}
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{ backgroundColor: event.color }}
              animate={{
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AlarmClock size={14} />
                    <span>{formatDuration()}</span>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isDeleting}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="space-y-4">
                {/* Date and Time */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {event.start.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock size={16} className="text-gray-400" />
                    <span>
                      {event.start.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                      {' - '}
                      {event.end.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Color bar */}
                <motion.div
                  className="w-full h-3 rounded-full shadow-lg"
                  style={{ backgroundColor: event.color }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />

                {/* Description */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-300">
                    {event.description ||
                      <span className="text-gray-500 italic">No description provided</span>
                    }
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <motion.button
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                    whileTap={{ scale: isDeleting ? 1 : 0.98 }}
                    disabled={isDeleting}
                  >
                    Edit Event
                  </motion.button>
                  <motion.button
                    className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                    whileTap={{ scale: isDeleting ? 1 : 0.98 }}
                    onClick={() => !isDeleting && onDelete(event.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Event'
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventDetailModal;