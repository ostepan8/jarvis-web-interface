'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Loader2, Calendar, AlarmClock, Edit, Trash2, Activity } from 'lucide-react';
import { CalendarEvent } from '../../../types';

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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Holographic glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-lg opacity-75" />

            {/* Main modal */}
            <div className="relative bg-gradient-to-br from-slate-900/95 via-blue-950/60 to-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl overflow-hidden shadow-2xl">
              {/* Animated grid overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Animated background based on event color */}
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{ backgroundColor: event.color }}
                animate={{
                  opacity: [0.05, 0.15, 0.05],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="relative z-10 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50">
                        <Activity className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                          Event.Details
                        </p>
                        <h3 className="text-2xl font-mono font-bold text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono text-gray-400">
                      <AlarmClock size={14} />
                      <span>Duration: {formatDuration()}</span>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-3 rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 border border-transparent hover:border-cyan-400/30"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isDeleting}
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div className="space-y-6">
                  {/* Date and Time Information */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-3 text-gray-300 mb-3">
                        <Calendar size={16} className="text-cyan-400" />
                        <span className="font-mono text-sm font-bold text-cyan-400 uppercase tracking-wider">
                          Temporal.Data
                        </span>
                      </div>
                      <div className="space-y-2 font-mono text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date:</span>
                          <span className="text-cyan-300">
                            {event.start.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Start:</span>
                          <span className="text-cyan-300">
                            {event.start.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">End:</span>
                          <span className="text-cyan-300">
                            {event.end.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Color indicator */}
                    <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-600"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="font-mono text-sm font-bold text-cyan-400 uppercase tracking-wider">
                          Visual.Identifier
                        </span>
                      </div>
                      <motion.div
                        className="w-full h-4 rounded-xl shadow-lg border border-gray-600/50"
                        style={{ backgroundColor: event.color }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>

                    {/* Description */}
                    <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock size={16} className="text-cyan-400" />
                        <span className="font-mono text-sm font-bold text-cyan-400 uppercase tracking-wider">
                          Description.Data
                        </span>
                      </div>
                      <p className="font-mono text-sm text-gray-300 leading-relaxed">
                        {event.description ||
                          <span className="text-gray-500 italic">No description parameters provided</span>
                        }
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      className="flex-1 py-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/50 hover:border-blue-300 rounded-xl transition-all font-mono font-bold text-blue-300 hover:text-blue-200 flex items-center justify-center gap-2"
                      whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                      whileTap={{ scale: isDeleting ? 1 : 0.98 }}
                      disabled={isDeleting}
                    >
                      <Edit size={16} />
                      MODIFY
                    </motion.button>

                    <motion.button
                      className="flex-1 py-4 bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 border border-red-400/50 hover:border-red-300 rounded-xl transition-all font-mono font-bold text-red-300 hover:text-red-200 flex items-center justify-center gap-2"
                      whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                      whileTap={{ scale: isDeleting ? 1 : 0.98 }}
                      onClick={() => !isDeleting && onDelete(event.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          DELETING...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          DELETE
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* System Information */}
                  <div className="pt-4 border-t border-gray-700/50">
                    <p className="text-xs font-mono text-gray-500 text-center">
                      Event.ID: {event.id} | System.Time: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
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