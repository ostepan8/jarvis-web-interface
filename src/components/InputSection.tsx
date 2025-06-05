'use client';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface Message {
  text: string;
  sender: string;
}

interface Props {
  input: string;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  toggleListening: () => void;
  isListening: boolean;
  messages: Message[];
}

const InputSection: React.FC<Props> = ({
  input,
  onInputChange,
  onSubmit,
  toggleListening,
  isListening,
  messages,
}) => (
  <motion.div
    className="absolute bottom-0 left-0 right-0 p-8"
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.5, duration: 0.8 }}
  >
    <div className="max-w-4xl mx-auto">
      {/* Message display */}
      <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">
        <AnimatePresence>
          {messages.slice(-3).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.sender === 'user' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`text-sm ${
                msg.sender === 'user' ? 'text-blue-400 text-right' : 'text-cyan-400'
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input form */}
      <form onSubmit={onSubmit} className="relative">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Speak your command..."
            className="w-full px-6 py-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10
                         focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20
                         placeholder-gray-500 pr-24 transition-all duration-300
                         group-hover:bg-white/10"
          />

          {/* Animated border */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Voice button */}
          <motion.button
            type="button"
            onClick={toggleListening}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full
                         ${isListening ? 'bg-red-500' : 'bg-blue-500'}
                         flex items-center justify-center transition-colors duration-300`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isListening ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              )}
            </svg>
          </motion.button>
        </div>
      </form>

      {/* Status indicator */}
      <motion.div
        className="mt-4 text-center text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {isListening ? <span className="text-red-400">● Listening...</span> : <span>System ready</span>}
      </motion.div>
    </div>
  </motion.div>
);

export default InputSection;
