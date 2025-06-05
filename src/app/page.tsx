'use client';
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useAnimationFrame } from 'framer-motion';

const JarvisInterface = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const containerRef = useRef(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const dataArray = useRef(null);
  const source = useRef(null);

  // Animated sphere state
  const [time, setTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  useAnimationFrame((t) => {
    setTime(t / 1000);
  });

  // Initialize audio context for voice visualization
  useEffect(() => {
    if (isListening && !audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      dataArray.current = new Uint8Array(analyser.current.frequencyBinCount);

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          source.current = audioContext.current.createMediaStreamSource(stream);
          source.current.connect(analyser.current);

          const checkAudioLevel = () => {
            if (analyser.current && isListening) {
              analyser.current.getByteFrequencyData(dataArray.current);
              const average = dataArray.current.reduce((a, b) => a + b) / dataArray.current.length;
              setAudioLevel(average / 255);
              requestAnimationFrame(checkAudioLevel);
            }
          };
          checkAudioLevel();
        })
        .catch(err => console.error('Error accessing microphone:', err));
    }
  }, [isListening]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      // Here you would send to your server
      setInput('');

      // Simulated response
      setTimeout(() => {
        setMessages(prev => [...prev, { text: 'Analyzing your request...', sender: 'jarvis' }]);
      }, 1000);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Start speech recognition here
      console.log('Starting voice recognition...');
    }
  };

  // Generate organic movement paths for the sphere
  const sphereX = Math.sin(time * 0.5) * 50 + Math.sin(time * 1.3) * 20;
  const sphereY = Math.cos(time * 0.3) * 50 + Math.cos(time * 1.7) * 20;
  const scale = 1 + Math.sin(time * 2) * 0.1 + audioLevel * 0.5;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
      {/* Deep space background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-blue-950 opacity-50" />

      {/* Particle field for depth */}
      <div className="fixed inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-blue-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Main Jarvis Sphere */}
      <div className="relative z-10" ref={containerRef}>
        <motion.div
          className="relative"
          animate={{
            x: sphereX,
            y: sphereY,
          }}
          transition={{
            type: "spring",
            damping: 50,
            stiffness: 100
          }}
        >
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Core sphere */}
          <motion.div
            className="w-64 h-64 relative"
            animate={{
              scale,
              rotateY: time * 20,
              rotateX: time * 10,
            }}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Energy rings */}
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="absolute inset-0 rounded-full border border-blue-400"
                style={{
                  borderWidth: '2px',
                  opacity: 0.3 - index * 0.1,
                  transform: `rotateX(${60 * index}deg) rotateY(${time * 30 + index * 120}deg)`,
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                }}
              />
            ))}

            {/* Central glowing orb */}
            <motion.div
              className="absolute inset-8 rounded-full"
              style={{
                background: 'radial-gradient(circle, #3b82f6 0%, #1e40af 50%, transparent 100%)',
                boxShadow: `0 0 60px rgba(59, 130, 246, ${0.6 + audioLevel * 0.4})`,
                filter: 'blur(1px)',
              }}
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
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
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Input Interface */}
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
                  className={`text-sm ${msg.sender === 'user' ? 'text-blue-400 text-right' : 'text-cyan-400'}`}
                >
                  {msg.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
                animate={{
                  backgroundPosition: ['0% 0%', '200% 0%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
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
            {isListening ? (
              <span className="text-red-400">● Listening...</span>
            ) : (
              <span>System ready</span>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default JarvisInterface;