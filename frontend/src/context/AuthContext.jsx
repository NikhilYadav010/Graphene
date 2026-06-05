import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('tf_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tf_token');
    if (token) {
      client.get('/auth/me')
        .then(({ data }) => setUser(data.user))
        .catch(() => { localStorage.removeItem('tf_token'); localStorage.removeItem('tf_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    localStorage.setItem('tf_token', data.token);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, role) => {
    const { data } = await client.post('/auth/register', { name, email, password, role });
    localStorage.setItem('tf_token', data.token);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
