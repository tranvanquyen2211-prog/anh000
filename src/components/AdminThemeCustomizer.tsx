import React, { useState } from 'react';
import { useTheme, PRESET_THEMES } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { X, Palette, Sparkles, Image, RefreshCw, Layout, Type } from 'lucide-react';

interface AdminThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminThemeCustomizer: React.FC<AdminThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { theme, updateTheme, applyPreset, resetToDefault } = useTheme();

  const [siteName, setSiteName] = useState(theme.siteName);
  const [tagline, setTagline] = useState(theme.tagline);
  const [logoText, setLogoText] = useState(theme.logoText);
  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor);
  const [accentColor, setAccentColor] = useState(theme.accentColor);
  const [themeMode, setThemeMode] = useState(theme.themeMode);
  
  const [heroTitle, setHeroTitle] = useState(theme.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(theme.heroSubtitle);
  const [heroDiscount, setHeroDiscount] = useState(theme.heroDiscount);
  const [heroImgUrl, setHeroImgUrl] = useState(theme.heroImgUrl);
  const [promoBarText, setPromoBarText] = useState(theme.promoBarText);
  const [walletDiscountRate, setWalletDiscountRate] = useState(theme.walletDiscountRate);
  const [coinCashbackRate, setCoinCashbackRate] = useState(theme.coinCashbackRate);

  if (!isOpen || !user || user.role !== 'SUPER_ADMIN') return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTheme({
      siteName,
      tagline,
      logoText,
      primaryColor,
      accentColor,
      themeMode,
      heroTitle,
      heroSubtitle,
      heroDiscount,
      heroImgUrl,
      promoBarText,
      walletDiscountRate: Number(walletDiscountRate),
      coinCashbackRate: Number(coinCashbackRate)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-amber-500/30 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-r from-amber-400 to-orange rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                Chỉnh Sửa Giao Diện System
              </h3>
              <p className="text-[10px] text-slate-400">Đặc quyền Super Admin Overlord Panel</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-6 text-xs custom-scrollbar">
          
          {/* Quick Preset Color Themes */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-amber-400 uppercase text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Chọn Bộ Mẫu Giao Diện Mẫu (Theme Presets)
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_THEMES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    applyPreset(preset);
                    setPrimaryColor(preset.primaryColor);
                    setAccentColor(preset.accentColor);
                    setThemeMode(preset.themeMode);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 hover:border-amber-400/50 bg-slate-900 transition text-left cursor-pointer"
                >
                  <span className="font-bold text-slate-200">{preset.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full border border-white/20 inline-block" style={{ backgroundColor: preset.primaryColor }}></span>
                    <span className="w-4 h-4 rounded-full border border-white/20 inline-block" style={{ backgroundColor: preset.accentColor }}></span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color & Style Palette Settings */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-extrabold text-cyan-400 uppercase text-[11px] flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5" /> Bảng Màu Chính & Nền Trang Web
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Màu Chủ Đạo (Primary):</label>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-full bg-transparent font-mono text-slate-100 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Màu Nhấn (Accent):</label>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-full bg-transparent font-mono text-slate-100 font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Chế độ Nền (Theme Mode):</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`py-2 rounded-xl font-bold transition border ${
                    themeMode === 'light' ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  ☀️ Sáng (Light)
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`py-2 rounded-xl font-bold transition border ${
                    themeMode === 'dark' ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  🌙 Tối (Dark)
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('glass')}
                  className={`py-2 rounded-xl font-bold transition border ${
                    themeMode === 'glass' ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  ✨ Thủy Tinh (Glass)
                </button>
              </div>
            </div>
          </div>

          {/* Branding & Logo Settings */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-emerald-400 uppercase text-[11px] flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Thương Hiệu & Logo Trang Web
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Tên Thương hiệu (Site Name):</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Chữ Logo ngắn (Badge):</label>
                <input
                  type="text"
                  value={logoText}
                  onChange={e => setLogoText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-amber-400 font-black rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Khẩu hiệu / Subtitle:</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Banner Hero Customization */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-rose-400 uppercase text-[11px] flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" /> Banner Hero & Nội dung Khuyến Mãi
            </h4>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Tiêu đề Banner Hero:</label>
              <input
                type="text"
                value={heroTitle}
                onChange={e => setHeroTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">% Giảm Giá Nổi Bật (Badge):</label>
              <input
                type="text"
                value={heroDiscount}
                onChange={e => setHeroDiscount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-orange font-black rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Mô tả ngắn Banner:</label>
              <textarea
                value={heroSubtitle}
                onChange={e => setHeroSubtitle(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Link Ảnh Banner Hero (URL):</label>
              <input
                type="text"
                value={heroImgUrl}
                onChange={e => setHeroImgUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-[10px] rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Thanh Thông Báo Ưu Đãi Ví (Promo Bar):</label>
              <input
                type="text"
                value={promoBarText}
                onChange={e => setPromoBarText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 font-bold mb-1">% Giảm Ví TQ Pay:</label>
                <input
                  type="number"
                  value={walletDiscountRate}
                  onChange={e => setWalletDiscountRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-black rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">% Hoàn TQ Xu:</label>
                <input
                  type="number"
                  value={coinCashbackRate}
                  onChange={e => setCoinCashbackRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-amber-400 font-black rounded-xl px-3 py-2"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetToDefault}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Khôi phục Mặc định
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange hover:from-amber-600 hover:to-orange-hover text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            💾 Lưu & Áp Dụng Ngay
          </button>
        </div>

      </div>
    </div>
  );
};
