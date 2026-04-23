import { useState, useEffect, useCallback } from 'react';
import { getAllSettings, SystemSetting } from '../lib/settingsRepository';

/**
 * usePublishedSettings: Hook to consume published configurations across the application.
 * Returns only settings with status === 'published'.
 */
export function usePublishedSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await getAllSettings();
      const published = all
        .filter(s => s.status === 'published')
        .reduce((acc, curr) => {
          acc[curr.key] = curr.data;
          return acc;
        }, {} as Record<string, any>);
      
      setSettings(published);
    } catch (e) {
      setError("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /**
   * getSetting: Helper to get a specific published key with fallback
   */
  const getSetting = (key: string, fallback: any) => {
    return settings[key] !== undefined ? settings[key] : fallback;
  };

  return { settings, getSetting, isLoading, error, refresh: loadSettings };
}
