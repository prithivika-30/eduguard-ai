import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  quickLoginAs: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string; title: string; desc: string }> = {
  admin: {
    email: 'admin@eduguard.edu',
    pass: 'Admin@123',
    title: 'Administrator',
    desc: 'Dean & Institutional Research (Full Access + Datasets + Retraining + Audits)',
  },
  educator: {
    email: 'educator@eduguard.edu',
    pass: 'Educator@123',
    title: 'Educator / Faculty',
    desc: 'Course Instructor (Students + Predictions + What-If + Interventions)',
  },
  counsellor: {
    email: 'counsellor@eduguard.edu',
    pass: 'Counsellor@123',
    title: 'Counsellor / Mentor',
    desc: 'Student Welfare & Support (High-Risk Queue + Interventions + Follow-ups)',
  },
  viewer: {
    email: 'viewer@eduguard.edu',
    pass: 'Viewer@123',
    title: 'Viewer / Board',
    desc: 'Governing Board / Executive (Aggregate Analytics + Masked Privacy Data)',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('eduguard_user');
    const token = localStorage.getItem('eduguard_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (_) {
        localStorage.removeItem('eduguard_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const quickLoginAs = async (targetRole: UserRole) => {
    const creds = DEMO_CREDENTIALS[targetRole];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        quickLoginAs,
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
