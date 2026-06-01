import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client.js';
import React from "react";

const AuthContext = createContext(null);

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem('biit_user');

    if (!savedUser || savedUser === 'undefined' || savedUser === 'null') {
      localStorage.removeItem('biit_user');
      return null;
    }

    return JSON.parse(savedUser);
  } catch (error) {
    localStorage.removeItem('biit_token');
    localStorage.removeItem('biit_user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('biit_token'));
  const [user, setUser] = useState(getSavedUser);

  const login = async (values) => {
    const { data } = await api.post('/auth/login', values);

    localStorage.setItem('biit_token', data.token);
    localStorage.setItem('biit_user', JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem('biit_token');
    localStorage.removeItem('biit_user');

    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);