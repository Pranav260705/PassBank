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
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

  const checkAuthStatus = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('Frontend: Checking auth status at:', `${API_URL}/auth/user`);
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add token to headers if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('Frontend: Using token for auth check');
      }
      
      const response = await fetch(`${API_URL}/auth/user`, {
        method: 'GET',
        credentials: 'include',
        headers,
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
      setAuthToken(null);
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Frontend: Error logging out:', error);
    }
  };

  useEffect(() => {
    console.log('Frontend: AuthContext mounted, checking auth status...');
    
    // Check for token in URL (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      console.log('Frontend: Found token in URL, storing it...');
      localStorage.setItem('authToken', tokenFromUrl);
      setAuthToken(tokenFromUrl);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    checkAuthStatus();
  }, []);

  // Check auth status again after a short delay to handle OAuth redirects
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Frontend: Delayed auth check after OAuth redirect...');
      checkAuthStatus();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [authToken]); // Re-run when authToken changes

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