import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeConfig, FeatureVisibilityConfig } from '../types';
import { supabase } from '../lib/supabase';
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
  featureVisibility: DEFAULT_FEATURE_VISIBILITY
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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('tq_site_theme');
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
  }, [theme]);

  // Sync theme with Supabase & Subscribe to Realtime WebSocket Theme Updates
  useEffect(() => {
    const fetchRemoteTheme = async () => {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').single();
        if (!error && data && data.config) {
          setTheme(prev => ({
            ...prev,
            ...data.config,
            featureVisibility: {
              ...DEFAULT_FEATURE_VISIBILITY,
              ...(prev.featureVisibility || {}),
              ...(data.config.featureVisibility || {})
            }
          }));
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
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(themeChannel);
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
    setTheme(updated);
    localStorage.setItem('tq_site_theme', JSON.stringify(updated));

    // Save to Supabase Cloud DB Table 'site_settings'
    try {
      await supabase.from('site_settings').upsert([
        { id: 1, config: updated, updated_at: new Date().toISOString() }
      ]);
    } catch (err) {
      console.warn('Supabase site_settings upsert fallback active');
    }

    // 📡 Realtime Broadcast live to ALL connected users across the entire system!
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
    <ThemeContext.Provider value={{ theme, updateTheme, applyPreset, resetToDefault, toggleFeatureVisibility }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
