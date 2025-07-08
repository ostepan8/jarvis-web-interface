'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const { setToken } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        router.push('/');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 p-6 rounded-lg border border-cyan-500/20 w-80">
        <h1 className="text-center text-xl font-mono text-cyan-400">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-3 py-2 bg-black border border-cyan-400/20 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-3 py-2 bg-black border border-cyan-400/20 rounded"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </button>
        <p className="text-center text-sm">
          {mode === 'login' ? 'No account?' : 'Already have an account?'}{' '}
          <span
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-cyan-400 cursor-pointer underline"
          >
            {mode === 'login' ? 'Sign up' : 'Login'}
          </span>
        </p>
      </form>
    </div>
  );
}
