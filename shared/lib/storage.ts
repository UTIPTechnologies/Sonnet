export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Failed to get ${key} from localStorage:`, e);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to set ${key} to localStorage:`, e);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to remove ${key} from localStorage:`, e);
    }
  },

  getString: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`Failed to get ${key} from localStorage:`, e);
      return null;
    }
  },

  setString: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`Failed to set ${key} to localStorage:`, e);
    }
  },
};

