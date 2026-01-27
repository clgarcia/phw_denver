import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const stored = localStorage.getItem('adminAuthenticated');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    console.log('Login attempt:', { username, enteredPassword: password.length + ' chars' });
    console.log('Expected credentials:', { adminUsername, adminPassword: adminPassword ? 'set' : 'not set' });

    if (username === adminUsername && password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      console.log('Login successful');
      return true;
    }
    console.log('Login failed - credentials do not match');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
