'use client';
import { motion } from 'framer-motion';

const ParticleField = () => (
  <div className="fixed inset-0">
    {[...Array(100)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 h-0.5 bg-blue-400 rounded-full"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: Math.random() * 0.5 + 0.1,
        }}
        animate={{
          opacity: [0.1, 0.5, 0.1],
        }}
        transition={{
          duration: Math.random() * 5 + 5,
          repeat: Infinity,
          delay: Math.random() * 5,
        }}
      />
    ))}
  </div>
);

export default ParticleField;
