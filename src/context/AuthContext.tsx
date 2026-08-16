import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRoleQuick: (role: 'admin' | 'counselor' | 'student', specificUserIdOrRoll?: string) => Promise<void>;
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
              id: data.user.userId || data.user.id,
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
            // Check stored user in localStorage
            const savedUserJson = localStorage.getItem('portal_user_data');
            if (savedUserJson) {
              setUser(JSON.parse(savedUserJson));
              setToken(storedToken);
            }
          }
        } catch (e) {
          console.warn('Backend unavailable, using cached user if available:', e);
          const savedUserJson = localStorage.getItem('portal_user_data');
          if (savedUserJson) {
            setUser(JSON.parse(savedUserJson));
            setToken(storedToken);
          }
        }
      } else {
        // Default to admin on first load
        const defaultAdmin = INITIAL_USERS[0];
        setUser(defaultAdmin);
        setToken(`mock-jwt-token-${defaultAdmin.id}`);
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
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('portal_jwt_token', data.token);
          localStorage.setItem('portal_user_data', JSON.stringify(data.user));
          setToken(data.token);
          setUser(data.user);
          return { success: true };
        }
      }

      const data = await res.json().catch(() => ({}));
      if (data?.error) {
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      console.warn('Network issue during login, fallback to mock account check:', err);
    }

    // Fallback login with INITIAL_USERS if server is unreachable
    const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (matched) {
      const fallbackToken = `mock-jwt-token-${matched.id}-${Date.now()}`;
      localStorage.setItem('portal_jwt_token', fallbackToken);
      localStorage.setItem('portal_user_data', JSON.stringify(matched));
      setToken(fallbackToken);
      setUser(matched);
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password.' };
  };

  const logout = () => {
    localStorage.removeItem('portal_jwt_token');
    localStorage.removeItem('portal_user_data');
    setToken(null);
    setUser(null);
  };

  const switchRoleQuick = async (role: 'admin' | 'counselor' | 'student', specificUserIdOrRoll?: string) => {
    let email = 'admin@school.edu';
    let pass = 'admin123password';

    if (role === 'counselor') {
      if (
        specificUserIdOrRoll === 'usr-counselor-2' ||
        specificUserIdOrRoll === 'counselor-2' ||
        specificUserIdOrRoll?.toLowerCase().includes('tariq')
      ) {
        email = 'tariq.counselor@school.edu';
      } else {
        email = 'sarah.counselor@school.edu';
      }
      pass = 'counselor123';
    } else if (role === 'student') {
      if (
        specificUserIdOrRoll === 'usr-student-2' ||
        specificUserIdOrRoll === 'stu-2' ||
        specificUserIdOrRoll === 'STU-2024-002' ||
        specificUserIdOrRoll?.toLowerCase().includes('ali')
      ) {
        email = 'ali.student@school.edu';
      } else if (
        specificUserIdOrRoll === 'usr-student-3' ||
        specificUserIdOrRoll === 'stu-3' ||
        specificUserIdOrRoll === 'STU-2024-003' ||
        specificUserIdOrRoll?.toLowerCase().includes('hamza')
      ) {
        email = 'hamza.student@school.edu';
      } else if (
        specificUserIdOrRoll === 'usr-student-4' ||
        specificUserIdOrRoll === 'stu-4' ||
        specificUserIdOrRoll === 'STU-2024-004' ||
        specificUserIdOrRoll?.toLowerCase().includes('zainab')
      ) {
        email = 'zainab.student@school.edu';
      } else {
        email = 'ayesha.student@school.edu';
      }
      pass = 'student123';
    }

    // Direct optimistic instant update from INITIAL_USERS so UI responds in 0ms
    const targetUser = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem('portal_user_data', JSON.stringify(targetUser));
    }

    // Complete backend login and token generation
    await login(email, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
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
