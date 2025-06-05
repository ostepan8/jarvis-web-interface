'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface SphereProps {
  isListening: boolean;
  time: number;
  audioLevel: number;
}

const Sphere: React.FC<SphereProps> = ({ isListening, time, audioLevel }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sphereX = Math.sin(time * 0.5) * 50 + Math.sin(time * 1.3) * 20;
  const sphereY = Math.cos(time * 0.3) * 50 + Math.cos(time * 1.7) * 20;
  const scale = 1 + Math.sin(time * 2) * 0.1 + audioLevel * 0.5;

  return (
    <div className="relative z-10" ref={containerRef}>
      <motion.div
        className="relative"
        animate={{ x: sphereX, y: sphereY }}
        transition={{ type: 'spring', damping: 50, stiffness: 100 }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            width: '400px',
            height: '400px',
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Core sphere */}
        <motion.div
          className="w-64 h-64 relative"
          animate={{ scale, rotateY: time * 20, rotateX: time * 10 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Energy rings */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute inset-0 rounded-full border border-blue-400"
              style={{
                borderWidth: '2px',
                opacity: 0.3 - index * 0.1,
                transform: `rotateX(${60 * index}deg) rotateY(${time * 30 +
                  index * 120}deg)`,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
              }}
            />
          ))}

          {/* Central glowing orb */}
          <motion.div
            className="absolute inset-8 rounded-full"
            style={{
              background:
                'radial-gradient(circle, #3b82f6 0%, #1e40af 50%, transparent 100%)',
              boxShadow: `0 0 60px rgba(59, 130, 246, ${0.6 + audioLevel * 0.4})`,
              filter: 'blur(1px)',
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Inner core */}
          <div className="absolute inset-16 rounded-full bg-white opacity-80 blur-sm" />
        </motion.div>

        {/* Voice visualization waves */}
        {isListening && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2 border-cyan-400"
                style={{
                  width: `${300 + i * 100}px`,
                  height: `${300 + i * 100}px`,
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Sphere;
