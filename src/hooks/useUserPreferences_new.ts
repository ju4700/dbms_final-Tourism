import { useState, useEffect, useCallback } from 'react';

// Generic type for user preferences
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  tableColumns?: Record<string, boolean>;
  notifications?: boolean;
  [key: string]: any;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'light',
  tableColumns: {},
  notifications: true,
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data || defaultPreferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save preferences
  const savePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data || newPreferences);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update specific preference
  const updatePreference = useCallback(async (key: string, value: any) => {
    const updates = { [key]: value };
    const success = await savePreferences(updates);
    if (success) {
      setPreferences(prev => ({ ...prev, ...updates }));
    }
    return success;
  }, [savePreferences]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    loadPreferences,
    savePreferences,
    updatePreference,
  };
}
