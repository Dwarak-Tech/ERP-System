import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'SALES_USER';
}

export type ThemeMode = 'light' | 'dark';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  switchRole: (role: User['role']) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('erp_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('erp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [theme, setThemeState] = useState<ThemeMode>(() => (localStorage.getItem('erp_theme') as ThemeMode) === 'dark' ? 'dark' : 'light');

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('erp_token', newToken);
    localStorage.setItem('erp_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setToken(null);
    setUser(null);
  };

  const switchRole = (role: User['role']) => {
    if (!user) return;
    const updatedUser = { ...user, role };
    localStorage.setItem('erp_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const setTheme = (newTheme: ThemeMode) => {
    localStorage.setItem('erp_theme', newTheme);
    setThemeState(newTheme);
  };

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
  }, [theme]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole, theme, setTheme, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};