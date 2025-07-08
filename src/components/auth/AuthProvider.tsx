'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextValue {
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  setToken: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
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
