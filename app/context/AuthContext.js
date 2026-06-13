'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshTokens = async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } catch (error) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };
  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setAccessToken(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!res.ok) throw new Error("Refresh failed");
  
      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data.accessToken;
    } catch (err) {
      await logout();
      return null;
    }
  }, [logout]);
  useEffect(() => {
    refreshTokens();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, logout, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);