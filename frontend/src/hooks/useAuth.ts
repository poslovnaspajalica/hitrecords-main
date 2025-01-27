import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState({ user: null, loading: false, error: null });
        return;
      }

      const response = await api.get('/auth/me');
      setAuthState({
        user: response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        loading: false,
        error: 'Authentication failed'
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setAuthState({
        user: response.data.user,
        loading: false,
        error: null
      });
      return true;
    } catch (error: any) {
      setAuthState({
        user: null,
        loading: false,
        error: error.response?.data?.message || 'Login failed'
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      loading: false,
      error: null
    });
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    checkAuth
  };
}; 