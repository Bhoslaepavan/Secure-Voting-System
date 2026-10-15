import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('voter');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [hasVotedMap, setHasVotedMap] = useState({});

  const fetchProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
      setHasVotedMap(res.data.hasVoted || {});
      localStorage.setItem('voter', JSON.stringify(res.data));
    } catch (err) {
      console.warn('Session expired or invalid token');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const setAuthData = (newToken, voterData) => {
    setToken(newToken);
    setUser(voterData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('voter', JSON.stringify(voterData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setHasVotedMap({});
    localStorage.removeItem('token');
    localStorage.removeItem('voter');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        hasVotedMap,
        setAuthData,
        logout,
        fetchProfile,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
