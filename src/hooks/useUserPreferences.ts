import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Generic type for user preferences
export interface UserPreferences {
  [key: string]: string | number | boolean | object;
}

export interface TablePreferences extends UserPreferences {
  page: number;
  search: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface CustomerViewSettings extends UserPreferences {
  showCustomerId: boolean;
  showName: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showNidNumber: boolean;
  showZone: boolean;
  showIpAddress: boolean;
  showPppoePassword: boolean;
  showPackage: boolean;
  showMonthlyFee: boolean;
  showStatus: boolean;
  showJoiningDate: boolean;
}

export interface DashboardPreferences extends UserPreferences {
  defaultTab: string;
  showQuickActions: boolean;
  compactMode: boolean;
  refreshInterval: number;
}

// Default settings as constants to prevent object recreation
const DEFAULT_CUSTOMER_VIEW_SETTINGS: CustomerViewSettings = {
  showCustomerId: true,
  showName: true,
  showEmail: true,
  showPhone: true,
  showNidNumber: true,
  showZone: true,
  showIpAddress: false,
  showPppoePassword: false,
  showPackage: true,
  showMonthlyFee: true,
  showStatus: true,
  showJoiningDate: true,
};

const DEFAULT_TABLE_PREFERENCES: TablePreferences = {
  page: 1,
  search: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  defaultTab: 'overview',
  showQuickActions: true,
  compactMode: false,
  refreshInterval: 30000, // 30 seconds
};

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Fetch user preferences from the server
 */
async function fetchUserPreferences(): Promise<any> {
  try {
    const response = await fetch('/api/user/preferences');
    if (response.ok) {
      const result = await response.json();
      return result.data || {};
    }
  } catch (error) {
    console.warn('Failed to fetch user preferences from server:', error);
  }
  return {};
}

/**
 * Fetch admin preferences for inheritance by staff users
 */
async function fetchAdminPreferences(): Promise<any> {
  try {
    const response = await fetch('/api/admin/preferences');
    if (response.ok) {
      const result = await response.json();
      return result.data || {};
    }
  } catch (error) {
    console.warn('Failed to fetch admin preferences from server:', error);
  }
  return {};
}

/**
 * Save user preferences to the server
 */
async function saveUserPreferences(preferences: any): Promise<boolean> {
  try {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferences }),
    });
    return response.ok;
  } catch (error) {
    console.warn('Failed to save user preferences to server:', error);
    return false;
  }
}

/**
 * Hook for managing user preferences with server-side persistence and localStorage fallback
 * Prevents hydration mismatches by using useEffect for client-side initialization
 */
export function useUserPreferences<T extends UserPreferences>(
  key: string,
  defaultValues: T
): [T, (updates: Partial<T>) => void, () => void] {
  const { data: session, status } = useSession();
  // Initialize with defaults to prevent hydration mismatch
  const [preferences, setPreferences] = useState<T>(defaultValues);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from server/localStorage after hydration
  useEffect(() => {
    if (!isBrowser || status === 'loading') return;

    const loadPreferences = async () => {
      try {
        let loadedPrefs = defaultValues;

        if (status === 'authenticated' && session?.user) {
          // Try to load from server first
          const serverPrefs = await fetchUserPreferences();
          if (serverPrefs[key]) {
            loadedPrefs = { ...defaultValues, ...serverPrefs[key] };
          } else {
            // For staff users, try to inherit admin settings for customer view
            if (session.user.role === 'staff' && key === 'customerViewSettings') {
              const adminPrefs = await fetchAdminPreferences();
              if (adminPrefs.customerViewSettings) {
                loadedPrefs = { ...defaultValues, ...adminPrefs.customerViewSettings };
              }
            }
            
            // Fallback to localStorage if server doesn't have the preference
            if (JSON.stringify(loadedPrefs) === JSON.stringify(defaultValues)) {
              try {
                const localSaved = localStorage.getItem(`userPrefs_${key}`);
                if (localSaved) {
                  const parsed = JSON.parse(localSaved);
                  loadedPrefs = { ...defaultValues, ...parsed };
                  
                  // Migrate localStorage to server
                  await saveUserPreferences({
                    ...serverPrefs,
                    [key]: loadedPrefs,
                  });
                }
              } catch (error) {
                console.warn('Failed to load from localStorage:', error);
              }
            }
          }
        } else if (status === 'unauthenticated') {
          // Use localStorage for unauthenticated users
          try {
            const localSaved = localStorage.getItem(`userPrefs_${key}`);
            if (localSaved) {
              const parsed = JSON.parse(localSaved);
              loadedPrefs = { ...defaultValues, ...parsed };
            }
          } catch (error) {
            console.warn('Failed to load from localStorage:', error);
          }
        }

        setPreferences(loadedPrefs);
      } catch (error) {
        console.warn('Failed to load user preferences:', error);
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }
    };

    loadPreferences();
  }, [key, defaultValues, session, status]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<T>) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, ...updates };
      
      // Save to appropriate storage
      if (isBrowser) {
        if (status === 'authenticated' && session?.user) {
          // Save to server for authenticated users
          fetchUserPreferences().then(async (currentServerPrefs) => {
            const updatedServerPrefs = {
              ...currentServerPrefs,
              [key]: newPrefs,
            };
            await saveUserPreferences(updatedServerPrefs);
          });
        } else {
          // Save to localStorage for unauthenticated users
          try {
            localStorage.setItem(`userPrefs_${key}`, JSON.stringify(newPrefs));
          } catch (error) {
            console.warn('Failed to save to localStorage:', error);
          }
        }
      }
      
      return newPrefs;
    });
  }, [key, session, status]);

  // Reset preferences to defaults
  const resetPreferences = useCallback(async () => {
    setPreferences(defaultValues);
    
    if (isBrowser) {
      if (status === 'authenticated' && session?.user) {
        // Reset on server
        const currentServerPrefs = await fetchUserPreferences();
        const updatedServerPrefs = {
          ...currentServerPrefs,
          [key]: defaultValues,
        };
        await saveUserPreferences(updatedServerPrefs);
      } else {
        // Reset localStorage
        try {
          localStorage.removeItem(`userPrefs_${key}`);
        } catch (error) {
          console.warn('Failed to reset localStorage:', error);
        }
      }
    }
  }, [key, defaultValues, session, status]);

  return [preferences, updatePreferences, resetPreferences];
}

/**
 * Hook for table-specific preferences with common table functionality
 */
export function useTablePreferences(tableKey: string) {
  return useUserPreferences(`table_${tableKey}`, DEFAULT_TABLE_PREFERENCES);
}

/**
 * Hook for customer view settings
 */
export function useCustomerViewSettings() {
  return useUserPreferences('customerViewSettings', DEFAULT_CUSTOMER_VIEW_SETTINGS);
}

/**
 * Hook for customer view settings with admin inheritance for staff
 * This ensures staff users see the same table columns as configured by admin
 */
export function useCustomerViewSettingsWithInheritance() {
  const { data: session } = useSession();
  const [preferences, updatePreferences, resetPreferences] = useUserPreferences('customerViewSettings', DEFAULT_CUSTOMER_VIEW_SETTINGS);
  
  return [preferences, updatePreferences, resetPreferences];
}

/**
 * Hook for dashboard preferences
 */
export function useDashboardPreferences() {
  return useUserPreferences('dashboard', DEFAULT_DASHBOARD_PREFERENCES);
}
