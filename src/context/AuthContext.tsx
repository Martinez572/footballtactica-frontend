import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  token: string;
  userId: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');

    if (token && userId && name && email) {
      setUser({ token, userId, name, email });
    }
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('name', userData.name);
    localStorage.setItem('email', userData.email);
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);