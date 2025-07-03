'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Calendar, Clock, Palette, Repeat, CheckSquare,
  AlertTriangle, Tag, Bell, Zap,
} from 'lucide-react';
import { CalendarEvent } from './types';

interface NewEvent {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  category: string;
  recurring: boolean;
  recurrencePattern: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    max: number;
  };
  isTask: boolean;
  notifier: string;
  action: string;
  notifications: string[];
}

interface Props {
  show: boolean;
  newEvent: NewEvent;
  setNewEvent: (e: NewEvent) => void;
  onClose: () => void;
  onCreate: () => void;
  isCreating?: boolean;
  eventType: 'event' | 'recurring' | 'task';
  setEventType: (type: 'event' | 'recurring' | 'task') => void;
  categories: string[];
  conflicts: CalendarEvent[];
}

const AddEventModal: React.FC<Props> = ({
  show, newEvent, setNewEvent, onClose, onCreate, isCreating = false,
  eventType, setEventType, categories, conflicts
}) => (
  <AnimatePresence>
    {show && (
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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-auto"
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

            <div className="relative z-10 p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-mono font-bold text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text">
                    CREATE.{eventType.toUpperCase()}
                  </h3>
                  <p className="text-sm font-mono text-gray-400 mt-1">
                    Initialize new temporal entry
                  </p>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-3 rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 border border-transparent hover:border-cyan-400/30"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isCreating}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Event Type Selector */}
              <div className="mb-8">
                <label className="block text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
                  Event.Type
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-900/50 rounded-xl border border-gray-700/50">
                  {[
                    { id: 'event' as const, icon: Calendar, label: 'STANDARD' },
                    { id: 'recurring' as const, icon: Repeat, label: 'RECURRING' },
                    { id: 'task' as const, icon: CheckSquare, label: 'TASK' },
                  ].map(({ id, icon: Icon, label }) => (
                    <motion.button
                      key={id}
                      type="button"
                      onClick={() => !isCreating && setEventType(id)}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-mono text-sm font-bold transition-all ${eventType === id
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/50'
                        : 'text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50'
                        }`}
                      disabled={isCreating}
                      whileHover={{ scale: isCreating ? 1 : 1.02 }}
                      whileTap={{ scale: isCreating ? 1 : 0.98 }}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isCreating && newEvent.title.trim()) {
                    onCreate();
                  }
                }}
                className="space-y-6"
              >
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      Title
                    </label>
                    <motion.input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 placeholder-gray-500 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                      placeholder="Enter event designation..."
                      required
                      disabled={isCreating}
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      <Tag size={14} />
                      Category
                    </label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                      disabled={isCreating}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category} className="bg-gray-900">
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    Description
                  </label>
                  <motion.textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 placeholder-gray-500 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none"
                    placeholder="Add event parameters..."
                    rows={3}
                    disabled={isCreating}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>

                {/* Date and Time Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      <Calendar size={14} />
                      Date
                    </label>
                    <motion.input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-3 py-3 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                      required
                      disabled={isCreating}
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>

                  {/* Start Time */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      <Clock size={14} />
                      Start
                    </label>
                    <motion.input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="w-full px-3 py-3 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                      required
                      disabled={isCreating}
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      <Clock size={14} />
                      End
                    </label>
                    <motion.input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="w-full px-3 py-3 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                      required
                      disabled={isCreating}
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                </div>

                {/* Recurring Event Settings */}
                {eventType === 'recurring' && (
                  <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Repeat className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-mono font-bold text-blue-400 uppercase tracking-wider">
                        Recurrence.Pattern
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-blue-300">Frequency</label>
                        <select
                          value={newEvent.recurrencePattern.type}
                          onChange={(e) => setNewEvent({
                            ...newEvent,
                            recurrencePattern: {
                              ...newEvent.recurrencePattern,
                              type: e.target.value as any
                            }
                          })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-blue-400/40 rounded-lg text-blue-300 font-mono text-sm focus:border-blue-300 focus:outline-none"
                          disabled={isCreating}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-blue-300">Interval</label>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={newEvent.recurrencePattern.interval}
                          onChange={(e) => setNewEvent({
                            ...newEvent,
                            recurrencePattern: {
                              ...newEvent.recurrencePattern,
                              interval: parseInt(e.target.value) || 1
                            }
                          })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-blue-400/40 rounded-lg text-blue-300 font-mono text-sm focus:border-blue-300 focus:outline-none"
                          disabled={isCreating}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-blue-300">Max Occurrences</label>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={newEvent.recurrencePattern.max}
                          onChange={(e) => setNewEvent({
                            ...newEvent,
                            recurrencePattern: {
                              ...newEvent.recurrencePattern,
                              max: parseInt(e.target.value) || 10
                            }
                          })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-blue-400/40 rounded-lg text-blue-300 font-mono text-sm focus:border-blue-300 focus:outline-none"
                          disabled={isCreating}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Task Settings */}
                {eventType === 'task' && (
                  <div className="space-y-4 p-4 bg-green-500/10 border border-green-400/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckSquare className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider">
                        Task.Configuration
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-mono text-green-300">
                          <Bell size={12} />
                          Notifier
                        </label>
                        <input
                          type="text"
                          value={newEvent.notifier}
                          onChange={(e) => setNewEvent({ ...newEvent, notifier: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-green-400/40 rounded-lg text-green-300 font-mono text-sm focus:border-green-300 focus:outline-none"
                          placeholder="email, sms, webhook"
                          disabled={isCreating}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-mono text-green-300">
                          <Zap size={12} />
                          Action
                        </label>
                        <input
                          type="text"
                          value={newEvent.action}
                          onChange={(e) => setNewEvent({ ...newEvent, action: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-green-400/40 rounded-lg text-green-300 font-mono text-sm focus:border-green-300 focus:outline-none"
                          placeholder="script, command, api"
                          disabled={isCreating}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-green-300">Notification Schedule</label>
                      <div className="flex flex-wrap gap-2">
                        {['5m', '10m', '30m', '1h', '1d'].map(time => (
                          <motion.button
                            key={time}
                            type="button"
                            onClick={() => {
                              if (isCreating) return;
                              const notifications = newEvent.notifications.includes(time)
                                ? newEvent.notifications.filter(n => n !== time)
                                : [...newEvent.notifications, time];
                              setNewEvent({ ...newEvent, notifications });
                            }}
                            className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${newEvent.notifications.includes(time)
                              ? 'bg-green-500/20 text-green-300 border-green-400/50'
                              : 'bg-gray-800/50 text-gray-400 border-gray-600/50 hover:border-green-400/30'
                              }`}
                            disabled={isCreating}
                            whileHover={{ scale: isCreating ? 1 : 1.05 }}
                            whileTap={{ scale: isCreating ? 1 : 0.95 }}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    <Palette size={14} />
                    Event.Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { color: '#22d3ee', name: 'CYAN' },
                      { color: '#3b82f6', name: 'BLUE' },
                      { color: '#8b5cf6', name: 'VIOLET' },
                      { color: '#06b6d4', name: 'TEAL' },
                      { color: '#10b981', name: 'EMERALD' },
                      { color: '#f59e0b', name: 'AMBER' },
                      { color: '#ef4444', name: 'RED' },
                      { color: '#ec4899', name: 'PINK' }
                    ].map(({ color, name }) => (
                      <motion.button
                        key={color}
                        type="button"
                        onClick={() => !isCreating && setNewEvent({ ...newEvent, color })}
                        className={`relative w-12 h-12 rounded-xl border-2 transition-all group ${newEvent.color === color
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-gray-600/50 hover:border-white/50'
                          }`}
                        style={{ backgroundColor: color }}
                        disabled={isCreating}
                        whileHover={{ scale: isCreating ? 1 : 1.2 }}
                        whileTap={{ scale: isCreating ? 1 : 0.9 }}
                        title={name}
                      >
                        {newEvent.color === color && (
                          <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Conflicts Warning */}
                {conflicts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-mono font-bold text-red-300 mb-2">
                          TEMPORAL.CONFLICT DETECTED
                        </p>
                        <div className="space-y-1">
                          {conflicts.map(conflict => (
                            <p key={conflict.id} className="text-xs font-mono text-red-300">
                              • {conflict.title} ({conflict.start.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })})
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {newEvent.startTime && newEvent.endTime && newEvent.startTime >= newEvent.endTime && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl"
                  >
                    <p className="text-sm font-mono text-red-300">
                      ERROR: End time must be after start time
                    </p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-700/50">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 rounded-xl transition-all font-mono font-bold text-gray-300 hover:text-white"
                    disabled={isCreating}
                    whileHover={{ scale: isCreating ? 1 : 1.02 }}
                    whileTap={{ scale: isCreating ? 1 : 0.98 }}
                  >
                    CANCEL
                  </motion.button>

                  <motion.button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/50 hover:border-cyan-300 rounded-xl transition-all font-mono font-bold text-cyan-300 hover:text-cyan-200 relative overflow-hidden group shadow-lg shadow-cyan-500/20"
                    disabled={isCreating || !newEvent.title.trim() || (newEvent.startTime >= newEvent.endTime)}
                    whileHover={{ scale: isCreating ? 1 : 1.02 }}
                    whileTap={{ scale: isCreating ? 1 : 0.98 }}
                  >
                    {isCreating ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        CREATING {eventType.toUpperCase()}...
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10">CREATE {eventType.toUpperCase()}</span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
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
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default AddEventModal;