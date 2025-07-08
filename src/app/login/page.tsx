'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, Shield, AlertCircle,
  Loader2, CheckCircle, ArrowRight, Zap, Activity
} from 'lucide-react';

// Real imports - replace these with actual Next.js imports in your app
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

// AuthProvider context
const AuthContext = React.createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
}>({
  token: null,
  setToken: () => { },
});

// Mock AuthProvider for demo - replace with your actual AuthProvider
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = React.useState<string | null>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('authToken');
    if (stored) setTokenState(stored);
  }, []);

  const setToken = (value: string | null) => {
    if (value) {
      localStorage.setItem('authToken', value);
    } else {
      localStorage.removeItem('authToken');
    }
    setTokenState(value);
  };

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// Mock router hooks for demo - replace with actual Next.js hooks
const useRouter = () => ({
  push: (path: string) => {
    console.log('Navigate to:', path);
    // In real app, this would navigate
    window.location.href = path;
  }
});

const useSearchParams = () => ({
  get: (param: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
});

const AuthScreenWrapper = () => {
  return (
    <AuthProvider>
      <AuthScreen />
    </AuthProvider>
  );
};

const AuthScreen = () => {
  const { setToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Real auth function matching your pattern
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Real API call
    const endpoint = mode === 'signup' ? 'signup' : 'login';
    try {
      const res = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token as string);
        setSuccess(true);

        // Success animation delay
        setTimeout(() => {
          // OPTION 1: Redirect to a specific page (e.g., dashboard)
          // router.push('/dashboard');

          // OPTION 2: Redirect to calendar page
          // router.push('/calendar');

          // OPTION 3: Redirect based on user role or data
          // const redirectPath = data.user?.role === 'admin' ? '/admin' : '/dashboard';
          // router.push(redirectPath);

          // OPTION 4: Redirect to the page they were trying to access before login
          const redirectTo = searchParams.get('redirect') || '/';
          router.push(redirectTo);

          // OPTION 5: Replace current page in history (prevents back button to login)
          // router.replace('/dashboard');

          // OPTION 6: Force a full page reload to ensure clean state
          // window.location.href = '/dashboard';

        }, 1500);
      } else {
        setError(data.error || 'Authentication failed');
        setLoading(false);
      }
    } catch (error) {
      setError('Network error');
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"
          style={{ animation: 'float 8s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"
          style={{ animation: 'float 8s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-2xl animate-pulse"
          style={{ animation: 'float 10s ease-in-out infinite' }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative inline-flex items-center justify-center mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full border border-cyan-500/30">
                <Shield className="w-12 h-12 text-cyan-400" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl font-mono font-black mb-2"
            >
              <span className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text">
                JARVIS
              </span>
              <span className="text-gray-500">.</span>
              <span className="text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text">
                AUTH
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-gray-400 font-mono text-lg"
            >
              {mode === 'login' ? 'ACCESS.TEMPORAL.SYSTEM' : 'INITIALIZE.USER.PROFILE'}
            </motion.p>
          </div>

          {/* Main Auth Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="relative"
          >
            {/* Holographic glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-lg opacity-75 animate-pulse" />

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-slate-900/95 via-blue-950/60 to-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl overflow-hidden shadow-2xl">
              {/* Card grid overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />

              <div className="relative z-10 p-8">
                {/* Mode Toggle */}
                <div className="mb-8">
                  <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-700/50">
                    <motion.button
                      type="button"
                      onClick={switchMode}
                      disabled={loading}
                      className={`flex-1 py-3 px-4 rounded-lg font-mono font-bold text-sm transition-all duration-300 ${mode === 'login'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/50'
                        : 'text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50'
                        }`}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      LOGIN
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={switchMode}
                      disabled={loading}
                      className={`flex-1 py-3 px-4 rounded-lg font-mono font-bold text-sm transition-all duration-300 ${mode === 'signup'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/50'
                        : 'text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50'
                        }`}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      REGISTER
                    </motion.button>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      <Mail size={14} />
                      Email.Address
                    </label>
                    <div className="relative">
                      <motion.input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 placeholder-gray-500 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                        placeholder="user@temporal.system"
                        required
                        disabled={loading}
                        whileFocus={{ scale: 1.02 }}
                      />
                      {focusedField === 'email' && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      <Lock size={14} />
                      Security.Key
                    </label>
                    <div className="relative">
                      <motion.input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3 pr-12 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 placeholder-gray-500 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                        placeholder="••••••••••••"
                        required
                        disabled={loading}
                        whileFocus={{ scale: 1.02 }}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </motion.button>
                      {focusedField === 'password' && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute right-12 top-1/2 transform -translate-y-1/2"
                        >
                          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Confirm Password Field (Signup only) */}
                  <AnimatePresence>
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <label className="flex items-center gap-2 text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
                          <Lock size={14} />
                          Confirm.Key
                        </label>
                        <div className="relative">
                          <motion.input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3 pr-12 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 placeholder-gray-500 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                            placeholder="••••••••••••"
                            required
                            disabled={loading}
                            whileFocus={{ scale: 1.02 }}
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={loading}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </motion.button>
                          {focusedField === 'confirmPassword' && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="absolute right-12 top-1/2 transform -translate-y-1/2"
                            >
                              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Display */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-mono font-bold text-red-300">
                            AUTHENTICATION.ERROR
                          </p>
                          <p className="text-xs font-mono text-red-400 mt-1">
                            {error}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success Display */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-400/30 rounded-xl"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-mono font-bold text-green-300">
                            AUTHENTICATION.SUCCESS
                          </p>
                          <p className="text-xs font-mono text-green-400 mt-1">
                            Initializing system access...
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading || success}
                    className={`w-full py-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/50 hover:border-cyan-300 rounded-xl font-mono font-bold text-cyan-300 hover:text-cyan-200 transition-all duration-300 relative overflow-hidden group shadow-lg shadow-cyan-500/20 ${loading || success ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    whileHover={{ scale: loading || success ? 1 : 1.02 }}
                    whileTap={{ scale: loading || success ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        {mode === 'login' ? 'ACCESSING.SYSTEM...' : 'INITIALIZING.USER...'}
                      </span>
                    ) : success ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle size={20} />
                        AUTHENTICATED
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Zap size={20} />
                        {mode === 'login' ? 'INITIATE.LOGIN' : 'CREATE.ACCOUNT'}
                        <ArrowRight size={20} />
                      </span>
                    )}

                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </div>

                {/* Mode Switch Link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="mt-8 text-center"
                >
                  <p className="text-sm font-mono text-gray-400">
                    {mode === 'login' ? 'NEW.TO.SYSTEM?' : 'ALREADY.AUTHORIZED?'}
                  </p>
                  <motion.button
                    type="button"
                    onClick={switchMode}
                    disabled={loading}
                    className="mt-2 text-cyan-400 hover:text-cyan-300 font-mono font-bold underline underline-offset-4 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {mode === 'login' ? 'INITIALIZE.ACCOUNT' : 'ACCESS.EXISTING'}
                  </motion.button>
                </motion.div>

                {/* System Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="mt-8 pt-4 border-t border-gray-700/50"
                >
                  <p className="text-xs font-mono text-gray-500 text-center">
                    SYSTEM.VERSION: 3.14.159 | SECURITY.LEVEL: MAXIMUM
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default AuthScreenWrapper;