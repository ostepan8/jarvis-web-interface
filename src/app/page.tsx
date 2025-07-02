'use client';
import React, { useState, useEffect, useRef } from 'react';
import ParticleField from '@/components/ParticleField';
import JarvisOrb from '@/components/JarvisOrb';
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
  const source = useRef<MediaStreamAudioSourceNode | null>(null);

  // Basic microphone access when listening starts
  useEffect(() => {
    if (isListening && !audioContext.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContext.current = new AudioCtx();

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (!audioContext.current) return;
          source.current = audioContext.current.createMediaStreamSource(stream);
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
      <div className="w-full h-full absolute top-0 left-0 pointer-events-none flex items-center justify-center">
        <JarvisOrb />
      </div>
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
