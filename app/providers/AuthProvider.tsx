import React, { ReactNode, createContext, useState, useContext, useEffect, useCallback } from 'react';
import { AuthResponse } from '../../shared/types';
import { storage } from '../../shared/lib/storage';
import md5 from 'md5';

const TOKEN_KEY = 'acsToken';
const TOKEN_EXPIRE_KEY = 'acsTokenExpire';
const UTIP_TOKEN_KEY = 'utipToken';
const USER_ID_KEY = 'acsUserId';

interface AuthContextType {
  acsToken: string | null;
  acsTokenExpire: string | null;
  utipToken: string | null;
  acsUserId: string | null;
  login: (email: string, password: string, endpoint?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [acsToken, setAcsToken] = useState<string | null>(null);
  const [acsTokenExpire, setAcsTokenExpire] = useState<string | null>(null);
  const [utipToken, setUtipToken] = useState<string | null>(null);
  const [acsUserId, setAcsUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedToken = storage.getString(TOKEN_KEY);
      const storedTokenExpire = storage.getString(TOKEN_EXPIRE_KEY);
      const storedUtipToken = storage.getString(UTIP_TOKEN_KEY);
      const storedUserId = storage.getString(USER_ID_KEY);
      if (storedToken && storedTokenExpire) {
        setAcsToken(storedToken);
        setAcsTokenExpire(storedTokenExpire);
        if (storedUtipToken) {
          setUtipToken(storedUtipToken);
        }
        if (storedUserId) {
          setAcsUserId(storedUserId);
        }
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, endpoint?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // По умолчанию используем локальный weboffice
      const loginUrl = endpoint || 'http://weboffice.apf/api/v_2/page/Login';
      const isWebofficeEndpoint = loginUrl.includes('weboffice') || loginUrl.includes('/api/v_2/');

      let response: Response;
      
      if (isWebofficeEndpoint) {
        // Формат запроса для weboffice
        const apiKey = 'Fiugkjyu76fhjt7hbk';
        const randParam = Math.floor(Math.random() * (99999999 - 1000000 + 1)) + 1000000;
        const key = md5(apiKey + randParam);

        response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
          body: new URLSearchParams({
            user_email: email,
            password: password,
            key: key,
            rand_param: String(randParam),
            languages: 'en',
          }),
        });
      } else {
        // Формат запроса для dev-virt-point
        response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, wt: true }),
        });
      }

      const data: any = await response.json();

      if (isWebofficeEndpoint) {
        // Обработка ответа от weboffice
        if (response.ok && data.result === 'success' && data.values?.auth_token) {
          const authToken = data.values.auth_token;
          const userId = data.values.user_id;
          
          setAcsToken(authToken);
          const tokenExpire = new Date(Date.now() + 1600 * 1000).toISOString();
          setAcsTokenExpire(tokenExpire);
          storage.setString(TOKEN_KEY, authToken);
          storage.setString(TOKEN_EXPIRE_KEY, tokenExpire);

          if (userId) {
            setAcsUserId(String(userId));
            storage.setString(USER_ID_KEY, String(userId));
          }
        } else {
          const errorMsg = data.description || data.result || 'Authentication failed';
          throw new Error(errorMsg);
        }
      } else {
        // Обработка ответа от dev-virt-point
        if (response.ok && data.result === 'OK' && data.acsToken) {
          setAcsToken(data.acsToken);
          setAcsTokenExpire(data.acsTokenExpire);
          storage.setString(TOKEN_KEY, data.acsToken);
          storage.setString(TOKEN_EXPIRE_KEY, data.acsTokenExpire);

          if (data.utipToken) {
            setUtipToken(data.utipToken);
            storage.setString(UTIP_TOKEN_KEY, data.utipToken);
          }

          if (data.acsUserId) {
            setAcsUserId(String(data.acsUserId));
            storage.setString(USER_ID_KEY, String(data.acsUserId));
          }
        } else {
          throw new Error(data.result || 'Authentication failed');
        }
      }
    } catch (err) {
      let errorMessage = 'An unknown error occurred.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAcsToken(null);
    setAcsTokenExpire(null);
    setUtipToken(null);
    setAcsUserId(null);
    storage.remove(TOKEN_KEY);
    storage.remove(TOKEN_EXPIRE_KEY);
    storage.remove(UTIP_TOKEN_KEY);
    storage.remove(USER_ID_KEY);
    storage.remove('symbols-list');
    storage.remove('subscribed-symbols');
  }, []);

  const value: AuthContextType = {
    acsToken,
    acsTokenExpire,
    utipToken,
    acsUserId,
    login,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

