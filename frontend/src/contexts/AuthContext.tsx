import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { refreshUserAvatar, verifyUser } from '../utils/avatarUtils';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext as any);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/me');
      console.log('User data fetched:', response.data);
      
      // Use verifyUser to ensure we have valid data structure
      const userData = verifyUser(response.data || {});
      
      if (userData.username) {
        console.log('Username is available:', userData.username);
        console.log('First letter would be:', userData.username.charAt(0).toUpperCase());
      }
      
      setUser(userData);
      // Trigger avatar refresh
      refreshUserAvatar();
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password,
    });
    const { token: newToken, user: userData } = response.data;
    console.log('Login user data:', userData);
    
    // Verify and clean the user data
    const verifiedUserData = verifyUser(userData);
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setUser(verifiedUserData);
    
    // Trigger avatar refresh after login
    setTimeout(() => refreshUserAvatar(), 100);
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
      });
      
      const { token: newToken, user: userData } = response.data;
      console.log('Register success - user data:', userData);
      
      // Verify the user data, using the registration username if needed
      const verifiedUserData = verifyUser(userData);
      if (!verifiedUserData.username && username) {
        verifiedUserData.username = username;
      }
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(verifiedUserData);
      
      // Trigger avatar refresh after registration
      setTimeout(() => refreshUserAvatar(), 100);
    } catch (error) {
      console.error('Register error:', error);
      throw error; // Re-throw to let component handle the error
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
  
  // Add updateUser function to allow updating user data
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    // Update user with new data
    const updatedUser = { ...user, ...userData };
    
    // Verify the updated user
    const verifiedUser = verifyUser(updatedUser);
    
    setUser(verifiedUser);
    refreshUserAvatar();
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 