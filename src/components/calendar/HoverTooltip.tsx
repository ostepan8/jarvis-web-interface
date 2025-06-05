'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slot } from './types';

interface Props {
  slot: Slot | null;
  mousePos: { x: number; y: number };
  show: boolean;
}

const HoverTooltip: React.FC<Props> = ({ slot, mousePos, show }) => (
  <AnimatePresence>
    {show && slot && (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-50 pointer-events-none"
        style={{ left: mousePos.x + 10, top: mousePos.y - 40 }}
      >
        <div className="bg-gray-800 px-3 py-2 rounded-lg text-sm shadow-lg border border-gray-700">
          <div className="font-medium">
            {slot.hour}:00 - {slot.hour + 1}:00
          </div>
          <div className="text-xs text-gray-400 mt-1">Click to add event</div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default HoverTooltip;
