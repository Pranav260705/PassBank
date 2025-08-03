import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('Frontend: Checking auth status at:', `${API_URL}/auth/user`);
      
      const response = await fetch(`${API_URL}/auth/user`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      console.log('Frontend: Auth response:', data);
      
      if (data.isAuthenticated) {
        console.log('Frontend: User authenticated:', data.user);
        setUser(data.user);
      } else {
        console.log('Frontend: User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('Frontend: Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await fetch(`${API_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    console.log('Frontend: AuthContext mounted, checking auth status...');
    checkAuthStatus();
  }, []);

  // Check auth status again after a short delay to handle OAuth redirects
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Frontend: Delayed auth check after OAuth redirect...');
      checkAuthStatus();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 