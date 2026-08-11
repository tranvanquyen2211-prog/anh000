import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeConfig, FeatureVisibilityConfig, SystemMasterSwitches } from '../types';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { useToast } from './ToastContext';

export const DEFAULT_FEATURE_VISIBILITY: FeatureVisibilityConfig = {
  showHeroBanner: true,
  showCategoryFilters: true,
  showLocationFilter: true,
  showSmartRecommender: true,
  showQuickButtons: true,
  showLiveChatWidget: true,
  showPromoBar: true,
};

export const DEFAULT_MASTER_SWITCHES: SystemMasterSwitches = {
  enableSystemMaintenance: false,
  maintenanceTitle: '🚧 HỆ THỐNG ĐANG BẢO TRÌ & NÂNG CẤP ĐỊNH KỲ',
  maintenanceMessage: 'Hệ thống TQ Marketplace đang tiến hành nâng cấp hạ tầng máy chủ đám mây Supabase Realtime và tối ưu hóa tốc độ. Vui lòng quay lại sau!',
  maintenanceEndTime: '',
  enableWalletPayment: true,
  enableVietQRPayment: true,
  enableCODPayment: true,
  enableReviewCoins: true,
  enableWatchVideoCoins: true,
  enableVoucherDiscounts: true,
  enableShopWithdrawals: true,
  enableRentalBooking: true,
  enableRetailBuying: true,
  enableShopProductAddition: true,
};

export const DEFAULT_THEME: ThemeConfig = {
  siteName: 'TQ Store',
  tagline: 'Realtime Marketplace Platform',
  logoText: 'TQ',
  primaryColor: '#0F2C59',
  accentColor: '#FF6B00',
  themeMode: 'light',
  heroTitle: 'ƯU ĐÃI LÊN ĐẾN',
  heroSubtitle: 'Khám phá Bộ sưu tập Đa mô hình: Thuê đồ, Shop bán đồ, Đồ ăn F&B, Spa Làm Đẹp thời gian thực.',
  heroDiscount: '50%',
  heroImgUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
  promoBarText: 'ƯU ĐÃI VÍ CÁ NHÂN TQ PAY: GIẢM THÊM 2% CHO MỌI ĐƠN HÀNG',
  walletDiscountRate: 2,
  coinCashbackRate: 3,
  featureVisibility: DEFAULT_FEATURE_VISIBILITY,
  masterSwitches: DEFAULT_MASTER_SWITCHES
};

export const PRESET_THEMES = [
  {
    name: 'TQ Classic Navy & Orange',
    primaryColor: '#0F2C59',
    accentColor: '#FF6B00',
    themeMode: 'light' as const
  },
  {
    name: 'Cyberpunk Dark Neon',
    primaryColor: '#0f172a',
    accentColor: '#06b6d4',
    themeMode: 'dark' as const
  },
  {
    name: 'Emerald Luxury',
    primaryColor: '#064e3b',
    accentColor: '#10b981',
    themeMode: 'light' as const
  },
  {
    name: 'Rose Gold Beauty',
    primaryColor: '#881337',
    accentColor: '#f43f5e',
    themeMode: 'glass' as const
  },
  {
    name: 'Midnight Obsidian',
    primaryColor: '#18181b',
    accentColor: '#f59e0b',
    themeMode: 'dark' as const
  }
];

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (newConfig: Partial<ThemeConfig>) => Promise<void>;
  applyPreset: (preset: typeof PRESET_THEMES[0]) => Promise<void>;
  resetToDefault: () => Promise<void>;
  toggleFeatureVisibility: (key: keyof FeatureVisibilityConfig) => Promise<void>;
  toggleMasterSwitch: (key: keyof SystemMasterSwitches) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('tq_site_theme') || localStorage.getItem('tq_global_active_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_THEME,
          ...parsed,
          featureVisibility: {
            ...DEFAULT_FEATURE_VISIBILITY,
            ...(parsed.featureVisibility || {})
          }
        };
      } catch (e) {
        return DEFAULT_THEME;
      }
    }
    return DEFAULT_THEME;
  });

  // Apply theme to document root CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--color-navy', theme.primaryColor);
    document.documentElement.style.setProperty('--color-orange', theme.accentColor);
    
    // Background mode handler
    if (theme.themeMode === 'dark') {
      document.body.className = 'bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-white';
    } else if (theme.themeMode === 'glass') {
      document.body.className = 'bg-gradient-to-br from-slate-900 via-rose-950 to-purple-950 text-rose-50 font-sans antialiased selection:bg-rose-500 selection:text-white';
    } else {
      document.body.className = 'bg-gray-50 text-gray-800 font-sans antialiased selection:bg-orange-500 selection:text-white';
    }

    localStorage.setItem('tq_site_theme', JSON.stringify(theme));
    localStorage.setItem('tq_global_active_theme', JSON.stringify(theme));
  }, [theme]);

  // Sync theme with Supabase Cloud DB & Subscribe to Realtime WebSocket Theme Updates
  useEffect(() => {
    const fetchRemoteTheme = async () => {
      try {
        // Tier 1: Supabase JS Client query
        const { data, error } = await supabase.from('site_settings').select('*');
        if (!error && data && data.length > 0) {
          const row = data.find((r: any) => r.config) || data[0];
          if (row && row.config) {
            const cloudConfig = row.config;
            setTheme(prev => ({
              ...prev,
              ...cloudConfig,
              featureVisibility: {
                ...DEFAULT_FEATURE_VISIBILITY,
                ...(prev.featureVisibility || {}),
                ...(cloudConfig.featureVisibility || {})
              }
            }));
            localStorage.setItem('tq_site_theme', JSON.stringify(cloudConfig));
            localStorage.setItem('tq_global_active_theme', JSON.stringify(cloudConfig));
            return;
          }
        }

        // Tier 2: Direct Supabase REST API Fallback
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/site_settings?select=*`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        );
        if (response.ok) {
          const restData = await response.json();
          if (restData && restData.length > 0 && restData[0].config) {
            const cloudConfig = restData[0].config;
            setTheme(prev => ({
              ...prev,
              ...cloudConfig,
              featureVisibility: {
                ...DEFAULT_FEATURE_VISIBILITY,
                ...(prev.featureVisibility || {}),
                ...(cloudConfig.featureVisibility || {})
              }
            }));
            localStorage.setItem('tq_site_theme', JSON.stringify(cloudConfig));
            localStorage.setItem('tq_global_active_theme', JSON.stringify(cloudConfig));
          }
        }
      } catch (err) {
        console.warn('Local theme config fallback active');
      }
    };
    fetchRemoteTheme();

    // 📡 Supabase Realtime WebSocket Listener for Instant System-Wide Theme & Visibility Sync
    const themeChannel = supabase
      .channel('public:theme_settings')
      .on('broadcast', { event: 'theme_updated' }, (payload) => {
        if (payload?.payload) {
          const newTheme: ThemeConfig = payload.payload;
          setTheme(prev => ({
            ...prev,
            ...newTheme,
            featureVisibility: {
              ...DEFAULT_FEATURE_VISIBILITY,
              ...(newTheme.featureVisibility || {})
            }
          }));
          localStorage.setItem('tq_site_theme', JSON.stringify(newTheme));
          localStorage.setItem('tq_global_active_theme', JSON.stringify(newTheme));
          addToast(`🎨 REALTIME: Super Admin vừa cập nhật giao diện mới "${newTheme.siteName}" cho toàn hệ thống!`, 'info');
        }
      })
      .subscribe();

    const handleLocalThemeUpdated = (e: any) => {
      if (e.detail) {
        setTheme(e.detail);
      }
    };

    window.addEventListener('tq_theme_updated', handleLocalThemeUpdated);

    return () => {
      supabase.removeChannel(themeChannel);
      window.removeEventListener('tq_theme_updated', handleLocalThemeUpdated);
    };
  }, []);

  const updateTheme = async (newConfig: Partial<ThemeConfig>) => {
    const updated: ThemeConfig = {
      ...theme,
      ...newConfig,
      featureVisibility: {
        ...DEFAULT_FEATURE_VISIBILITY,
        ...(theme.featureVisibility || {}),
        ...(newConfig.featureVisibility || {})
      }
    };

    // 1. Immediately update React State & Local Device Cache
    setTheme(updated);
    localStorage.setItem('tq_site_theme', JSON.stringify(updated));
    localStorage.setItem('tq_global_active_theme', JSON.stringify(updated));

    // 2. Persist to Supabase Cloud DB Table 'site_settings' (Upsert both Id: 1 and Id: 'theme_config')
    try {
      await supabase.from('site_settings').upsert([
        { id: 1, config: updated, updated_at: new Date().toISOString() },
        { id: 'theme_config', config: updated, updated_at: new Date().toISOString() }
      ]);
    } catch (err) {
      console.warn('Supabase site_settings upsert fallback active');
    }

    // 3. 📡 Realtime Broadcast live to ALL connected users across the entire system!
    window.dispatchEvent(new CustomEvent('tq_theme_updated', { detail: updated }));

    try {
      await supabase.channel('public:theme_settings').send({
        type: 'broadcast',
        event: 'theme_updated',
        payload: updated
      });
    } catch (err) {
      console.warn('Realtime theme broadcast active');
    }

    addToast('🎨 Đã lưu & phát sóng Cấu hình Giao diện / Ẩn hiện chức năng Realtime tới toàn bộ hệ thống!', 'success');
  };

  const toggleFeatureVisibility = async (key: keyof FeatureVisibilityConfig) => {
    const currentVis = theme.featureVisibility || DEFAULT_FEATURE_VISIBILITY;
    const newVis = {
      ...currentVis,
      [key]: !currentVis[key]
    };
    await updateTheme({ featureVisibility: newVis });
  };

  const toggleMasterSwitch = async (key: keyof SystemMasterSwitches) => {
    const currentSwitches = theme.masterSwitches || DEFAULT_MASTER_SWITCHES;
    const newSwitches = {
      ...currentSwitches,
      [key]: !currentSwitches[key]
    };
    await updateTheme({ masterSwitches: newSwitches });
  };

  const applyPreset = async (preset: typeof PRESET_THEMES[0]) => {
    await updateTheme({
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor,
      themeMode: preset.themeMode
    });
  };

  const resetToDefault = async () => {
    await updateTheme(DEFAULT_THEME);
    addToast('Khôi phục giao diện mặc định ban đầu thành công.', 'info');
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, applyPreset, resetToDefault, toggleFeatureVisibility, toggleMasterSwitch }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
