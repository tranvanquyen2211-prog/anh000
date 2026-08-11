import React, { useState } from 'react';
import { useTheme, PRESET_THEMES } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  X,
  Sparkles,
  Image,
  RefreshCw,
  Layout,
  Type,
  Wand2,
  Bot,
  Flame,
  Gift,
  CheckCircle2,
  Smartphone,
  Monitor,
  Search,
  Home,
  ShoppingBag,
  MessageSquare,
  Bell
} from 'lucide-react';

interface AdminThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminThemeCustomizer: React.FC<AdminThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
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

  // Device Simulator State
  const [simulatedDevice, setSimulatedDevice] = useState<'mobile' | 'desktop'>('mobile');

  // AI Prompt Customizer State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  if (!isOpen || !user || user.role !== 'SUPER_ADMIN') return null;

  const handleGenerateAiTheme = (topic: string) => {
    setIsAiGenerating(true);
    const targetTopic = (topic || aiPrompt).toLowerCase();

    setTimeout(() => {
      if (targetTopic.includes('tết') || targetTopic.includes('xuân') || targetTopic.includes('nam moi') || targetTopic.includes('năm mới')) {
        setPrimaryColor('#D80027');
        setAccentColor('#FFD700');
        setThemeMode('light');
        setSiteName('TQ Tết Marketplace 🧧');
        setLogoText('TẾT 2026');
        setTagline('Đón Xuân Giáp Thìn - Lộc Xuân Trúng Đậm');
        setHeroTitle('CHÀO XUÂN BÍNH NGỌ 2026 - MUA SẮM RỘN RÀNG');
        setHeroSubtitle('Giảm sốc toàn bộ sản phẩm Thuê Đồ Cưới, Mua Sắm, Đồ Ăn & Spa làm đẹp ngày Tết. Tích Xu gấp 3 lần!');
        setHeroDiscount('MUA 1 TẶNG 1 TẾT');
        setHeroImgUrl('https://images.unsplash.com/photo-1548625361-18a7a922d56e?auto=format&fit=crop&w=1200&q=80');
        setPromoBarText('🧧 KHUYẾN MÃI TẾT 2026: Nhập mã LIXITET giảm 15% khi thanh toán bằng Ví TQ Pay & Nhận Lì Xì TQ Xu!');
        addToast('🧧 AI đã khởi tạo Giao diện TẾT NGUYÊN ĐÁN rực rỡ sắc đỏ may mắn!', 'success');
      } else if (targetTopic.includes('sale') || targetTopic.includes('giam gia') || targetTopic.includes('black friday') || targetTopic.includes('11.11') || targetTopic.includes('flash sale')) {
        setPrimaryColor('#FF007A');
        setAccentColor('#00E5FF');
        setThemeMode('dark');
        setSiteName('TQ Mega Flash Sale 💥');
        setLogoText('SALE 90%');
        setTagline('Bão Giá Sập Sàn - Săn Deal 1k Duy Nhất Hôm Nay');
        setHeroTitle('SIÊU BÃO FLASH SALE - GIẢM ĐẾN 90%');
        setHeroSubtitle('Hàng ngàn deal Thuê Trang Phục 0đ, Đồ Ăn 1k & Gói Spa nửa giá. Đơn hàng hoàn 5% TQ Xu lập tức!');
        setHeroDiscount('GIẢM ĐẾN 90%');
        setHeroImgUrl('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80');
        setPromoBarText('💥 SIÊU BÃO MEGASALE: Giảm 50% toàn bộ đơn hàng + Miễn phí vận chuyển hỏa tốc toàn quốc!');
        addToast('💥 AI đã khởi tạo Giao diện SIÊU SALE SẬP SÀN rực rỡ Neon cực bốc!', 'success');
      } else if (targetTopic.includes('sang trọng') || targetTopic.includes('luxury') || targetTopic.includes('dark') || targetTopic.includes('vip') || targetTopic.includes('quý phái')) {
        setPrimaryColor('#0F172A');
        setAccentColor('#D4AF37');
        setThemeMode('dark');
        setSiteName('TQ Luxury Royal 👑');
        setLogoText('ROYAL');
        setTagline('Hệ Thống Đẳng Cấp Thượng Lưu & Trang Phục Luxury');
        setHeroTitle('BỘ BỘ BỘ BST TRANG PHỤC LUXURY ROYAL');
        setHeroSubtitle('Trải nghiệm dịch vụ thuê đồ cưới thiết kế cao cấp, thưởng thức trà chiều quý tộc & trị liệu Spa chuẩn 5 sao.');
        setHeroDiscount('LUXURY VIP');
        setHeroImgUrl('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80');
        setPromoBarText('👑 ĐẶC QUYỀN VIP: Hoàn 10% TQ Xu trực tiếp vào Ví TQ Pay cho tài khoản VIP.');
        addToast('👑 AI đã khởi tạo Giao diện LUXURY SANG TRỌNG ĐẲNG CẤP!', 'success');
      } else if (targetTopic.includes('mùa xuân') || targetTopic.includes('hoa') || targetTopic.includes('spring') || targetTopic.includes('tươi mát')) {
        setPrimaryColor('#10B981');
        setAccentColor('#F43F5E');
        setThemeMode('light');
        setSiteName('TQ Spring Blossom 🌸');
        setLogoText('SPRING');
        setTagline('Sức Sống Mới - Ưu Đãi Mùa Xuân Tươi Mát');
        setHeroTitle('CHÀO MÙA XUÂN TƯƠI MÁT - DEAL TRẢI NGHIỆM 0 ĐỒNG');
        setHeroSubtitle('Hơn 500+ mẫu váy hoa nhí xinh xắn, thức uống sinh tố hoa quả mọng nước & liệu trình chăm sóc da tươi trẻ.');
        setHeroDiscount('DEAL XUÂN 0Đ');
        setHeroImgUrl('https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80');
        setPromoBarText('🌸 MÙA XUÂN SỨC SỐNG MỚI: Tặng ngay Voucher 50.000đ cho đơn hàng đầu tiên!');
        addToast('🌸 AI đã khởi tạo Giao diện MÙA XUÂN TƯƠI MÁT!', 'success');
      } else {
        // Generic fallback prompt
        setPrimaryColor('#0F2C59');
        setAccentColor('#F59E0B');
        setThemeMode('light');
        setSiteName(`TQ Store - ${topic.toUpperCase()}`);
        setLogoText('AI DESIGN');
        setTagline(`Giao diện được thiết kế thông minh theo yêu cầu: "${topic}"`);
        setHeroTitle(`CHƯƠNG TRÌNH KHUYẾN MÃI ${topic.toUpperCase()}`);
        setHeroSubtitle(`Áp dụng ưu đãi đặc biệt cho tất cả gian hàng Thuê Đồ, Bán Hàng, F&B và Làm Đẹp trên toàn hệ thống.`);
        setHeroDiscount('SPECIAL DEAL');
        setHeroImgUrl('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80');
        setPromoBarText(`✨ GIAO DIỆN CHỦ ĐỀ ${topic.toUpperCase()}: Đồng bộ cấu hình Realtime 100% toàn sàn!`);
        addToast(`🤖 AI đã khởi tạo Giao diện theo yêu cầu "${topic}" thành công!`, 'success');
      }
      setIsAiGenerating(false);
    }, 600);
  };

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
    addToast('🎨 Đã lưu và áp dụng Giao diện AI mới thành công toàn sàn!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex justify-center items-center p-3 sm:p-5">
      <div className="w-full max-w-6xl h-[92vh] bg-slate-900 border border-amber-500/40 rounded-3xl text-slate-100 flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-r from-amber-400 to-orange rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                STUDIO THIẾT KẾ GIAO DIỆN REALTIME & MÔ PHỎNG MOBILE WEB APP
              </h3>
              <p className="text-[10px] text-slate-400">Xem trực tiếp thay đổi trên điện thoại & máy tính • Super Admin Overlord Studio</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Studio Main Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT COLUMN: Controls Form (Flexible Width) */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-6 text-xs custom-scrollbar">
          
          {/* SECTION 0: AI THEME GENERATOR BY ADMIN PROMPT */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-4 rounded-2xl border border-amber-500/50 space-y-3 shadow-lg">
            <div className="flex justify-between items-center border-b border-amber-500/30 pb-2">
              <h4 className="font-black text-amber-400 uppercase text-xs flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-amber-400 animate-pulse" /> 🤖 AI THIẾT KẾ GIAO DIỆN THEO CHỦ ĐỀ YÊU CẦU (TẾT, SALE...)
              </h4>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/40">
                PRO FEATURE
              </span>
            </div>

            <p className="text-[11px] text-slate-300">
              Nhập yêu cầu hoặc bấm chọn mẫu nhanh dưới đây, AI sẽ tự động tính toán phối màu, khẩu hiệu, logo, banner & thông báo khuyến mãi phù hợp!
            </p>

            {/* Quick Prompt Selection Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleGenerateAiTheme('Tết')}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold p-2.5 rounded-xl transition shadow flex items-center justify-between text-left cursor-pointer border border-amber-300/40"
              >
                <span>🧧 Giao diện TẾT 2026</span>
                <Gift className="w-4 h-4 text-amber-200" />
              </button>

              <button
                type="button"
                onClick={() => handleGenerateAiTheme('Sale')}
                className="bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-700 hover:to-cyan-700 text-white font-extrabold p-2.5 rounded-xl transition shadow flex items-center justify-between text-left cursor-pointer border border-cyan-300/40"
              >
                <span>💥 Giao diện SIÊU SALE</span>
                <Flame className="w-4 h-4 text-cyan-200" />
              </button>

              <button
                type="button"
                onClick={() => handleGenerateAiTheme('Luxury')}
                className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 hover:from-slate-950 text-amber-300 font-extrabold p-2.5 rounded-xl transition shadow flex items-center justify-between text-left cursor-pointer border border-amber-500/40"
              >
                <span>👑 Giao diện LUXURY VIP</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => handleGenerateAiTheme('Mùa xuân')}
                className="bg-gradient-to-r from-emerald-600 to-rose-500 hover:from-emerald-700 hover:to-rose-600 text-white font-extrabold p-2.5 rounded-xl transition shadow flex items-center justify-between text-left cursor-pointer border border-emerald-300/40"
              >
                <span>🌸 Giao diện MÙA XUÂN</span>
                <Wand2 className="w-4 h-4 text-emerald-200" />
              </button>
            </div>

            {/* Custom Prompt Input Box */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Nhập yêu cầu riêng cho AI (VD: Giáng Sinh, Valentine, Đêm Black Friday...)"
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => handleGenerateAiTheme(aiPrompt)}
                disabled={isAiGenerating}
                className="bg-gradient-to-r from-amber-400 to-orange text-slate-950 font-black px-4 py-2 rounded-xl uppercase transition shadow cursor-pointer shrink-0"
              >
                {isAiGenerating ? 'Đang Tạo...' : '🤖 AI Sinh Theme'}
              </button>
            </div>
          </div>

          {/* Quick Preset Color Themes */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-amber-400 uppercase text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Chọn Mẫu Bộ Màu Sẵn Có (Theme Presets)
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
                  className={`py-2 rounded-xl font-bold transition border cursor-pointer ${
                    themeMode === 'light' ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  ☀️ Sáng (Light)
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`py-2 rounded-xl font-bold transition border cursor-pointer ${
                    themeMode === 'dark' ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  🌙 Tối (Dark)
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('glass')}
                  className={`py-2 rounded-xl font-bold transition border cursor-pointer ${
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
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 resize-none"
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

          {/* Footer Save & Reset Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetToDefault}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Khôi Phục Mặc Định
            </button>
            
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange hover:from-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" /> 🚀 LƯU & PHÁT SÓNG GIAO DIỆN REALTIME
            </button>
          </div>

        </form>

        {/* RIGHT COLUMN: Interactive Smartphone & Tablet Simulator Frame */}
        <div className="w-full lg:w-[420px] bg-slate-950 p-6 flex flex-col items-center justify-center border-l border-slate-800 shrink-0 overflow-y-auto">
          
          {/* Device View Selector Controls */}
          <div className="flex items-center gap-2 mb-4 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSimulatedDevice('mobile')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition cursor-pointer ${
                simulatedDevice === 'mobile' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" /> 📱 Mobile Web App
            </button>

            <button
              type="button"
              onClick={() => setSimulatedDevice('desktop')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition cursor-pointer ${
                simulatedDevice === 'desktop' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" /> 🖥️ Desktop PC
            </button>
          </div>

          {/* Smartphone Frame Wrapper */}
          <div className={`relative bg-slate-900 border-[6px] border-slate-700 rounded-[38px] shadow-2xl overflow-hidden transition-all duration-300 ${
            simulatedDevice === 'mobile' ? 'w-[320px] h-[580px]' : 'w-[390px] h-[520px] rounded-2xl'
          }`}>

            {/* Dynamic Island / iPhone Notch */}
            {simulatedDevice === 'mobile' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900"></div>
              </div>
            )}

            {/* Live Preview UI Screen Content */}
            <div className="w-full h-full bg-slate-950 overflow-y-auto custom-scrollbar flex flex-col text-slate-100 pt-6">
              
              {/* Promo Marquee Bar Preview */}
              <div className="bg-amber-400 text-slate-950 px-2 py-1 text-[9px] font-black tracking-tight flex items-center gap-1 overflow-hidden shrink-0">
                <Flame className="w-3 h-3 shrink-0" />
                <span className="truncate">{promoBarText || 'Khuyến mãi hot hôm nay'}</span>
              </div>

              {/* Header Preview */}
              <div style={{ backgroundColor: primaryColor }} className="p-3 shadow-md space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white uppercase tracking-wider">{logoText || siteName}</span>
                  <div className="flex items-center gap-2 text-white">
                    <Bell className="w-3.5 h-3.5" />
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-white text-[10px]">
                  <Search className="w-3 h-3" />
                  <span>Tìm kiếm áo quần, spa, trà sữa...</span>
                </div>
              </div>

              {/* Hero Banner Preview */}
              <div className="relative h-32 bg-slate-900 overflow-hidden shrink-0">
                <img src={heroImgUrl || 'https://images.unsplash.com/photo-1548625361-18a7a922d56e'} alt="Banner" className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 p-3 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-end">
                  <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded w-fit mb-1">{heroDiscount}</span>
                  <h5 className="font-black text-white text-xs line-clamp-1">{heroTitle}</h5>
                  <p className="text-[9px] text-slate-300 line-clamp-1">{heroSubtitle}</p>
                </div>
              </div>

              {/* Sample Product Grid Preview */}
              <div className="p-2 space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">🔥 GỢI Ý HOT</span>
                  <span className="text-[9px] text-slate-400">Xem tất cả</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 space-y-1">
                    <div className="h-16 bg-slate-800 rounded-lg overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=300&q=80" alt="Product" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-200 line-clamp-1">Váy Cưới Luxury Royal</p>
                    <span style={{ color: accentColor }} className="text-[9px] font-mono font-black block">500.000đ</span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 space-y-1">
                    <div className="h-16 bg-slate-800 rounded-lg overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80" alt="Product" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-200 line-clamp-1">Áo Sơ Mi Nam Smart</p>
                    <span style={{ color: accentColor }} className="text-[9px] font-mono font-black block">250.000đ</span>
                  </div>
                </div>
              </div>

              {/* Mobile App Bottom Navigation Bar Preview */}
              {simulatedDevice === 'mobile' && (
                <div className="bg-slate-950 border-t border-slate-800 px-3 py-2 grid grid-cols-5 gap-1 text-[8px] font-bold text-center text-slate-400 shrink-0">
                  <div className="flex flex-col items-center gap-0.5 text-amber-400">
                    <Home className="w-3.5 h-3.5" />
                    <span>Trang Chủ</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Layout className="w-3.5 h-3.5" />
                    <span>Danh Mục</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Giỏ Hàng</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Tôi</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      </div>
    </div>
  );
};
