'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAnimationFrame } from 'framer-motion';
import ParticleField from '@/components/ParticleField';
import Sphere from '@/components/Sphere';
import InputSection from '@/components/InputSection';
import Link from 'next/link';



interface Message {
  text: string;
  sender: string;
}

const JarvisInterface = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const source = useRef<MediaStreamAudioSourceNode | null>(null);

  // Animated sphere state
  const [time, setTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  useAnimationFrame((t) => {
    setTime(t / 1000);
  });

  // Initialize audio context for voice visualization
  useEffect(() => {
    if (isListening && !audioContext.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContext.current = new AudioCtx();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      dataArray.current = new Uint8Array(analyser.current.frequencyBinCount);

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (!audioContext.current || !analyser.current) return;
          source.current = audioContext.current.createMediaStreamSource(stream);
          source.current.connect(analyser.current);

          const checkAudioLevel = () => {
            if (analyser.current && dataArray.current && isListening) {
              analyser.current.getByteFrequencyData(dataArray.current);
              const average = dataArray.current.reduce((a, b) => a + b) / dataArray.current.length;
              setAudioLevel(average / 255);
              requestAnimationFrame(checkAudioLevel);
            }
          };
          checkAudioLevel();
        })
        .catch((err) => console.error('Error accessing microphone:', err));
    }
  }, [isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      // Here you would send to your server
      setInput('');

      // Simulated response
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: 'Analyzing your request...', sender: 'jarvis' }]);
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

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
      {/* Deep space background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-blue-950 opacity-50" />

      <Link
        href="/calendar"
        className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        Calendar
      </Link>

      <ParticleField />
      <Sphere time={time} audioLevel={audioLevel} isListening={isListening} />
      <InputSection
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        toggleListening={toggleListening}
        isListening={isListening}
        messages={messages}
      />
    </div>
  );
};

export default JarvisInterface;
