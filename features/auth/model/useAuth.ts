import { useState, useEffect, useCallback } from 'react';
import { AuthTokens } from '../../../entities/user/model/types';
import { login as loginApi } from '../../../entities/user/api/authApi';
import { storage } from '../../../shared/lib/storage';

const TOKEN_KEY = 'acsToken';
const TOKEN_EXPIRE_KEY = 'acsTokenExpire';
const UTIP_TOKEN_KEY = 'utipToken';

export function useAuth() {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const acsToken = storage.getString(TOKEN_KEY);
      const acsTokenExpire = storage.getString(TOKEN_EXPIRE_KEY);
      const utipToken = storage.getString(UTIP_TOKEN_KEY);

      if (acsToken && acsTokenExpire) {
        setTokens({
          acsToken,
          acsTokenExpire,
          utipToken: utipToken || undefined,
        });
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginApi({ email, password });

      if (response.result === 'OK' && response.acsToken) {
        const newTokens: AuthTokens = {
          acsToken: response.acsToken,
          acsTokenExpire: response.acsTokenExpire,
          utipToken: response.utipToken,
        };

        setTokens(newTokens);
        storage.setString(TOKEN_KEY, response.acsToken);
        storage.setString(TOKEN_EXPIRE_KEY, response.acsTokenExpire);
        if (response.utipToken) {
          storage.setString(UTIP_TOKEN_KEY, response.utipToken);
        }
      } else {
        throw new Error(response.result || 'Authentication failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    storage.remove(TOKEN_KEY);
    storage.remove(TOKEN_EXPIRE_KEY);
    storage.remove(UTIP_TOKEN_KEY);
    storage.remove('symbols-list');
    storage.remove('subscribed-symbols');
  }, []);

  return {
    tokens,
    acsToken: tokens?.acsToken || null,
    acsTokenExpire: tokens?.acsTokenExpire || null,
    utipToken: tokens?.utipToken || null,
    login,
    logout,
    isLoading,
    error,
  };
}

