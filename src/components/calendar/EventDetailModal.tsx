'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import { CalendarEvent } from './types';

interface Props {
  event: CalendarEvent | null;
  onClose: () => void;
}

const EventDetailModal: React.FC<Props> = ({ event, onClose }) => (
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
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold">{event.title}</h3>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-400">
              <Clock size={16} />
              <span>
                {event.start.toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: event.color }} />
            <p className="text-gray-300">{event.description}</p>
            <div className="flex gap-2 pt-4">
              <motion.button className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Edit Event
              </motion.button>
              <motion.button className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Delete
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default EventDetailModal;
