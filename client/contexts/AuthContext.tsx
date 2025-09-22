import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, ApiError } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  joinDate: string;
  tripCount: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by verifying session with backend
    const checkAuth = async () => {
      try {
        if (apiService.hasSession()) {
          const response = await apiService.getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
            localStorage.setItem('travelgenius_user', JSON.stringify(response.user));
          } else {
            // Invalid session, clear it
            apiService.clearSession();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid session
        apiService.clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('travelgenius_user', JSON.stringify(response.user));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof ApiError) {
        // Handle specific API errors
        console.error('API Error:', error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.signup(name, email, password);

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('travelgenius_user', JSON.stringify(response.user));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      if (error instanceof ApiError) {
        // Handle specific API errors
        console.error('API Error:', error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // API service already clears localStorage in logout method
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('travelgenius_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
