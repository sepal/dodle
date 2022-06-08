import { useEffect, useState } from "react";

interface SetValue<T> {
  (value: T): void;
}

/**
 * Hook to store a state into the localStorage. 
 * 
 * Based on https://usehooks.com/useLocalStorage/.
 */
export function useLocalStorage<Type>(
  key: string,
  initialValue: Type
): [Type, SetValue<Type>] {
  let item: string | null = null;

  // Create a new state using a useState hook.
  const [storedValue, setStoredValue] = useState(initialValue);

  // Create a version of the set* method that persists
  // the value in the local storage. 
  const setValue = (value: Type) => {
    try {
      // Save state
      setStoredValue(value);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.log(`Error while trying to set local storage ${error}`);
      return initialValue;
    }
  };

  // Load the the persistent value from the local storage
  // in a useEffect hook, to not cause hydration issues.
  useEffect(() => {
    const item: string | null = window.localStorage.getItem(key);
    if (item) {
      const val: Type = JSON.parse(item);
      setStoredValue(val);
    }
  }, []);

  return [storedValue, setValue];
}
