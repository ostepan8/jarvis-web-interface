'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

interface NewEvent {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface Props {
  show: boolean;
  newEvent: NewEvent;
  setNewEvent: (e: NewEvent) => void;
  onClose: () => void;
  onCreate: () => void;
  isCreating?: boolean;
}

const AddEventModal: React.FC<Props> = ({ show, newEvent, setNewEvent, onClose, onCreate, isCreating = false }) => (
  <AnimatePresence>
    {show && (
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
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, #3b82f6 0%, transparent 50%)',
                'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Create New Event
              </h3>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                disabled={isCreating}
              >
                <X size={20} />
              </motion.button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isCreating && newEvent.title.trim()) {
                  onCreate();
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Event Title</label>
                <motion.input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter event title..."
                  required
                  disabled={isCreating}
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <motion.textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Add event details..."
                  rows={3}
                  disabled={isCreating}
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                  <motion.input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isCreating}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start</label>
                  <motion.input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isCreating}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">End</label>
                  <motion.input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isCreating}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Event Color</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      onClick={() => !isCreating && setNewEvent({ ...newEvent, color })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${newEvent.color === color ? 'border-white scale-110' : 'border-transparent'
                        }`}
                      style={{ backgroundColor: color }}
                      disabled={isCreating}
                      whileHover={{ scale: isCreating ? 1 : 1.2 }}
                      whileTap={{ scale: isCreating ? 1 : 0.9 }}
                    />
                  ))}
                </div>
              </div>

              {/* Error message for invalid time */}
              {newEvent.startTime && newEvent.endTime && newEvent.startTime >= newEvent.endTime && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-400/10 p-2 rounded-lg"
                >
                  End time must be after start time
                </motion.p>
              )}

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isCreating}
                  whileHover={{ scale: isCreating ? 1 : 1.02 }}
                  whileTap={{ scale: isCreating ? 1 : 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all font-medium relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isCreating || !newEvent.title.trim() || (newEvent.startTime >= newEvent.endTime)}
                  whileHover={{ scale: isCreating ? 1 : 1.02 }}
                  whileTap={{ scale: isCreating ? 1 : 0.98 }}
                >
                  {isCreating ? (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10">Create Event</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ x: '100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default AddEventModal;