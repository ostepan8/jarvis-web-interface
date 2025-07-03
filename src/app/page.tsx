'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Loader2, Wifi, WifiOff } from 'lucide-react';
import ParticleField from '@/components/ParticleField';
import JarvisOrb from '@/components/JarvisOrb';

// Enhanced Message interface
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'jarvis';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface JarvisResponse {
  response?: string | {
    response?: string;
    suggestions?: string[];
    context?: unknown;
  };
  error?: string;
  metadata?: unknown;
  suggestions?: string[];
  context?: unknown;
}

// Message Component with JARVIS styling
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`max-w-xs lg:max-w-md relative ${isUser
        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
        : 'bg-gradient-to-r from-slate-900/90 to-blue-950/90 text-cyan-100 border border-cyan-500/30 backdrop-blur-xl'
        } px-4 py-3 rounded-lg shadow-lg`}>
        {/* Holographic border effect */}
        {!isUser && (
          <div className="absolute inset-0 rounded-lg border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]" />
        )}

        {/* Message content */}
        <div className={`text-sm font-mono leading-relaxed ${isUser ? 'text-white' : 'text-cyan-100'}`}>
          {message.text}
        </div>

        {/* timestamp */}
        <div className={`text-xs mt-2 font-mono ${isUser ? 'text-cyan-100' : 'text-cyan-400'
          } opacity-70`}>
          {message.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        </div>

        {/* Status indicator */}
        {message.status === 'sending' && (
          <div className="absolute -bottom-2 right-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced Input Section Component
const InputSection: React.FC<{
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  toggleListening: () => void;
  isListening: boolean;
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
}> = ({ input, onInputChange, onSubmit, toggleListening, isListening, messages, isLoading, isConnected }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col pointer-events-none">
      {/* Connection Status - Fixed at top */}
      <div className="pointer-events-auto p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-cyan-500/10">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} shadow-lg`} />
          <span className="text-sm font-mono text-cyan-400">
            {isConnected ? 'JARVIS.ONLINE' : 'JARVIS.OFFLINE'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
        </div>
      </div>

      {/* Messages Area - Scrollable middle section */}
      <div className="flex-1 overflow-hidden">
        {messages.length > 0 ? (
          <div className="h-full overflow-y-auto px-4 py-4 pointer-events-auto">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start mb-6"
                >
                  <div className="bg-gradient-to-r from-slate-900/90 to-blue-950/90 text-cyan-100 border border-cyan-500/30 backdrop-blur-xl px-4 py-3 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span className="text-sm font-mono">PROCESSING.REQUEST...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        ) : (
          /* Welcome message when no messages */
          <div className="h-full flex items-center justify-center">
            <div className="text-center pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-mono text-cyan-400 mb-2">JARVIS.INTERFACE</h2>
                <p className="text-sm text-cyan-300/70 font-mono">READY.FOR.COMMANDS</p>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="pointer-events-auto p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm border-t border-cyan-500/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="TRANSMIT.MESSAGE.TO.JARVIS..."
                className="w-full bg-gradient-to-r from-slate-900/50 to-blue-950/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-cyan-400/60 focus:border-cyan-400 focus:outline-none font-mono backdrop-blur-sm focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300"
                disabled={isLoading || !isConnected}
              />

              {/* Voice indicator */}
              {isListening && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400 font-mono">REC</span>
                </div>
              )}
            </div>

            {/* Voice button */}
            <button
              onClick={toggleListening}
              className={`p-3 rounded-lg transition-all duration-300 ${isListening
                ? 'bg-red-500/80 hover:bg-red-600/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-slate-700/80 hover:bg-slate-600/80 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                } backdrop-blur-sm border border-cyan-500/30`}
              disabled={isLoading || !isConnected}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-cyan-400" />
              )}
            </button>

            {/* Send button */}
            <button
              onClick={onSubmit}
              className="p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,211,238,0.3)] backdrop-blur-sm border border-cyan-400/30"
              disabled={isLoading || !input.trim() || !isConnected}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Status text */}
          <div className="mt-2 text-xs text-cyan-400/70 font-mono text-center">
            {isListening ? 'VOICE.INPUT.ACTIVE' :
              !isConnected ? 'CONNECTION.LOST' :
                'READY.FOR.TRANSMISSION'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main JARVIS Interface Component
const JarvisInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [audioEnabled] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Check initial connection
    checkConnection();
  }, []);

  // Audio context for microphone access
  useEffect(() => {
    if (isListening && !audioContextRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioCtx();

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (!audioContextRef.current) return;
          sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        })
        .catch((err) => console.error('Error accessing microphone:', err));
    }
  }, [isListening]);

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/protocols', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      setIsConnected(response.ok);
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/jarvis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device': 'web-interface',
          'X-Source': 'text',
          'X-User': 'user'
        },
        body: JSON.stringify({ command: text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JarvisResponse = await response.json();

      // Handle different response formats
      let responseText = '';
      if (typeof data.response === 'string') {
        responseText = data.response;
      } else if (typeof data.response === 'object' && data.response?.response) {
        responseText = data.response.response;
      } else if (data.error) {
        responseText = data.error;
      } else {
        responseText = 'No response received from JARVIS';
      }

      const jarvisMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'jarvis',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, jarvisMessage]);

      // Text-to-speech response
      if (audioEnabled && synthRef.current && responseText) {
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.rate = 0.85;
        utterance.pitch = 0.7;
        utterance.volume = 0.8;

        // Try to use a voice that sounds more AI-like
        const voices = synthRef.current.getVoices();
        const aiVoice = voices.find(voice =>
          voice.name.includes('Male') || voice.name.includes('Microsoft David')
        );
        if (aiVoice) utterance.voice = aiVoice;

        synthRef.current.speak(utterance);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'ERROR: Unable to reach JARVIS. Please verify the connection.',
        sender: 'jarvis',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (input.trim() && !isLoading && isConnected) {
      sendMessage(input);
      setInput('');
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Deep space background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-blue-950 opacity-50" />

      {/* Particle field */}
      <ParticleField />

      {/* JARVIS Orb - Fixed in center */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <JarvisOrb
        //  isActive={messages.length > 0 || isLoading} isListening={isListening} 
        />
      </div>

      {/* Input Section - Fixed layout */}
      <InputSection
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        toggleListening={toggleListening}
        isListening={isListening}
        messages={messages}
        isLoading={isLoading}
        isConnected={isConnected}
      />
    </div>
  );
};

export default JarvisInterface;