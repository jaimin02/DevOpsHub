
'use client';

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

// This is a simplified event emitter
const events: { [key: string]: Function[] } = {};

const emit = (key: string, data: any) => {
  if (events[key]) {
    events[key].forEach(fn => fn(data));
  }
};

const on = (key: string, fn: Function) => {
  events[key] = events[key] || [];
  events[key].push(fn);
  return () => {
    events[key] = events[key].filter(f => f !== fn);
  };
};


export function useSessionStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
      if (typeof window === 'undefined') {
        console.warn(`Tried setting sessionStorage key “${key}” even though environment is not a client`);
      }

      try {
        const newValue = value instanceof Function ? value(readValue()) : value;
        window.sessionStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        emit(key, newValue); // Notify other hooks using the same key
      } catch (error) {
        console.warn(`Error setting sessionStorage key “${key}”:`, error);
      }
    }, [key, readValue]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === window.sessionStorage) {
        setStoredValue(readValue());
      }
    };

    // For changes in other tabs
    window.addEventListener('storage', handleStorageChange);
    // For changes in the same tab (via our custom event emitter)
    const unsubscribe = on(key, (data: T) => setStoredValue(data));

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}
