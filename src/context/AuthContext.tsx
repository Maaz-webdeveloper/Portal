import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRoleQuick: (role: 'admin' | 'counselor' | 'student', specificUserId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('portal_jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Check existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('portal_jwt_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser({
              id: data.user.userId,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              linkedProfileId: data.user.linkedProfileId,
              counselorId: data.user.counselorId,
              counselorName: data.user.counselorName,
              studentRollNo: data.user.studentRollNo,
            });
            setToken(storedToken);
          } else {
            localStorage.removeItem('portal_jwt_token');
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          console.error('Failed to verify token', e);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password = 'password123') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      localStorage.setItem('portal_jwt_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('portal_jwt_token');
    setToken(null);
    setUser(null);
  };

  const switchRoleQuick = async (role: 'admin' | 'counselor' | 'student', specificUserId?: string) => {
    let email = 'admin@school.edu';
    let pass = 'admin123password';

    if (role === 'counselor') {
      email = specificUserId === 'usr-counselor-2' ? 'tariq.counselor@school.edu' : 'sarah.counselor@school.edu';
      pass = 'counselor123';
    } else if (role === 'student') {
      if (specificUserId === 'usr-student-2') {
        email = 'ali.student@school.edu';
      } else if (specificUserId === 'usr-student-3') {
        email = 'hamza.student@school.edu';
      } else {
        email = 'ayesha.student@school.edu';
      }
      pass = 'student123';
    }

    await login(email, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        switchRoleQuick,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
