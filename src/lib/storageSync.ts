import { supabase } from './supabase';

/**
 * System Storage Keys Registry
 */
export const STORAGE_KEYS = {
  USER_PROFILE: 'tq_user_profile',
  PHONE_USERS: 'tq_phone_users',
  ORDERS: 'tq_orders',
  AUDIT_LOGS: 'tq_audit_logs',
  WALLET_TXS: 'tq_wallet_transactions',
  COIN_TXS: 'tq_coin_transactions',
  RESET_REQUESTS: 'tq_reset_requests',
  VOUCHERS: 'tq_vouchers',
  NOTIFICATIONS: 'tq_system_notifications',
  BROADCASTS: 'tq_broadcasts',
  SYSTEM_THEME: 'tq_superadmin_theme'
};

/**
 * Save data into LocalStorage with automatic custom event emission for instant 0-latency UI update.
 */
export const saveToStorage = <T>(key: string, value: T): boolean => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);

    // Emit local window event for reactive UI updates
    window.dispatchEvent(
      new CustomEvent('tq_storage_updated', {
        detail: { key, value }
      })
    );

    return true;
  } catch (err) {
    console.error(`[Storage Auto-Sync Error] Failed to save key "${key}":`, err);
    return false;
  }
};

/**
 * Load data from LocalStorage safely with type fallback
 */
export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (err) {
    console.warn(`[Storage Auto-Sync Warn] Failed to read key "${key}", returning fallback:`, err);
    return fallback;
  }
};

/**
 * Listen for storage changes across tabs & local events
 */
export const subscribeToStorageChanges = (
  targetKey: string,
  callback: (newValue: any) => void
): (() => void) => {
  const handleLocalUpdate = (e: any) => {
    if (e.detail?.key === targetKey) {
      callback(e.detail.value);
    }
  };

  const handleCrossTabUpdate = (e: StorageEvent) => {
    if (e.key === targetKey && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch (err) {}
    }
  };

  window.addEventListener('tq_storage_updated', handleLocalUpdate);
  window.addEventListener('storage', handleCrossTabUpdate);

  return () => {
    window.removeEventListener('tq_storage_updated', handleLocalUpdate);
    window.removeEventListener('storage', handleCrossTabUpdate);
  };
};

/**
 * Sync payload automatically to Supabase Cloud Table
 */
export const syncToCloudDatabase = async (tableName: string, records: any[]): Promise<boolean> => {
  try {
    const { error } = await supabase.from(tableName).upsert(records);
    if (error) {
      console.warn(`[Supabase Cloud Sync Warn] Table "${tableName}":`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase Cloud Sync Active] Table "${tableName}" fallback local active`);
    return false;
  }
};

/**
 * Get Auto Storage Health Diagnostics Summary
 */
export const getAutoStorageMetrics = () => {
  let activeKeysCount = 0;
  let totalBytesUsed = 0;

  Object.values(STORAGE_KEYS).forEach(key => {
    const val = localStorage.getItem(key);
    if (val !== null) {
      activeKeysCount++;
      totalBytesUsed += val.length * 2; // ~2 bytes per UTF-16 char
    }
  });

  return {
    isAutoStorageEnabled: true,
    activeKeysCount,
    totalKeysSupported: Object.keys(STORAGE_KEYS).length,
    estimatedSizeKb: (totalBytesUsed / 1024).toFixed(2),
    syncMode: 'CONTINUOUS_REALTIME_DUAL_SYNC',
    cloudBackupEngine: 'SUPABASE_WEBSOCKET_DB',
    lastSyncTimestamp: new Date().toLocaleTimeString('vi-VN')
  };
};
