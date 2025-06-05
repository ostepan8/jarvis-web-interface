'use client';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  opacity: number;
  duration: number;
  delay: number;
}

const ParticleField = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const newParticles = Array.from({ length: 100 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        opacity: Math.random() * 0.5 + 0.1,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 5,
      }));

      setParticles(newParticles);
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-blue-400 rounded-full"
          initial={{
            x: p.x,
            y: p.y,
            opacity: p.opacity,
          }}
          animate={{
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleField;
