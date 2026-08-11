import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, PRESET_THEMES } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import type { ThemeConfig } from '../types';
import {
  Wand2,
  Sparkles,
  Bot,
  X,
  Palette,
  Send,
  Volume2,
  VolumeX,
  Zap,
  Globe,
  Layout
} from 'lucide-react';

interface AdminAiDesignStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAiDesignStudio: React.FC<AdminAiDesignStudioProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { theme, updateTheme, applyPreset } = useTheme();
  const { addToast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Live draft design configuration state
  const [draftConfig, setDraftConfig] = useState<ThemeConfig>(theme);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: '👋 Xin chào Admin! Tôi là AI TiQi Studio - Trợ lý trí tuệ nhân tạo chuyên thiết kế giao diện Web trực tuyến. Hãy yêu cầu tôi bất kỳ phong cách nào (Tết Nguyên Đán, Black Friday, Cyberpunk, Luxury Emerald, Nữ tính Spa...), tôi sẽ tự động thiết kế và phát sóng Realtime tới toàn bộ hệ thống ngay lập tức!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Voice Speech Synthesis
  const speakAiResponse = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#~`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis warning:', e);
    }
  };

  if (!isOpen || !user || user.role !== 'SUPER_ADMIN') return null;

  // AI Prompt Templates
  const DESIGN_PROMPTS = [
    {
      title: '🌸 Tết Nguyên Đán Rạng Rỡ',
      promptText: 'Thiết kế giao diện Tết Nguyên Đán với gam màu Đỏ Kim Bảo, Hoa Đào Xuân, Giảm Giá 30% và Banner Tết',
      config: {
        siteName: 'TQ Tết Store 🌸',
        tagline: 'Sắm Tết Đa Mô Hình • Giao Hàng Siêu Tốc',
        logoText: 'TẾT',
        primaryColor: '#991b1b',
        accentColor: '#dc2626',
        themeMode: 'light' as const,
        heroTitle: 'KHUYẾN MÃI TẾT NGUYÊN ĐÁN',
        heroSubtitle: 'Đón Xuân Giáp Thìn - Thuê Áo Dài, Mua Sắm Bánh Mứt, Tiệc Mát Lạnh & Spa Làm Đẹp Rạng Rỡ',
        heroDiscount: '30%',
        heroImgUrl: 'https://images.unsplash.com/photo-1548625361-1851219b16be?auto=format&fit=crop&w=800&q=80',
        promoBarText: '🌸 LÌ XÌ TẾT VÍ TQ PAY: GIẢM TRỰC TIẾP 3% TOÀN BỘ ĐƠN HÀNG MUA SẮM'
      }
    },
    {
      title: '⚡ Black Friday Cyberpunk',
      promptText: 'Đổi sang phong cách Cyberpunk Dark Neon rực rỡ, Flash Sale 50% bùng nổ',
      config: {
        siteName: 'TQ Cyber Mall ⚡',
        tagline: 'Super Cyberpunk Marketplace 2026',
        logoText: 'CYBER',
        primaryColor: '#0f172a',
        accentColor: '#06b6d4',
        themeMode: 'dark' as const,
        heroTitle: 'SUPER FLASH SALE BLACK FRIDAY',
        heroSubtitle: 'Bão Giá Cyberpunk - Săn Deal Đồ Thuê, Đồ Ăn, Mỹ Phẩm & Spa Giảm Sốc Đêm Nay',
        heroDiscount: '50%',
        heroImgUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        promoBarText: '⚡ VÍ TQ PAY CYBER SALE: TẶNG NGAY 50.000Đ CHO ĐƠN HÀNG ĐẦU TIÊN'
      }
    },
    {
      title: '💎 Emerald Luxury Sang Trọng',
      promptText: 'Đổi giao diện sang phong cách Luxury Xanh Ngọc Lục Bảo và Vàng Kim',
      config: {
        siteName: 'TQ Luxury Store 💎',
        tagline: 'Hệ Thống Mua Sắm Thượng Lưu Thời Gian Thực',
        logoText: 'LUXURY',
        primaryColor: '#064e3b',
        accentColor: '#d97706',
        themeMode: 'light' as const,
        heroTitle: 'LUXURY PREMIUM COLLECTION',
        heroSubtitle: 'Đột phá Trải nghiệm Mua sắm Đẳng cấp - Thương hiệu Cao cấp, Spa Đạt Chuẩn 5 Sao',
        heroDiscount: '25%',
        heroImgUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
        promoBarText: '💎 THẺ THÀNH VIÊN LUXURY TQ: ĐẶC QUYỀN HOÀN XU 5% KHÔNG GIỚI HẠN'
      }
    },
    {
      title: '💄 Rose Gold Spa & Beauty',
      promptText: 'Thiết kế phong cách Nữ Tính Spa & Làm Đẹp Rose Gold Glassmorphism',
      config: {
        siteName: 'TQ Beauty & Spa 💄',
        tagline: 'Thiên Đường Nhan Sắc & Thời Trang Nữ',
        logoText: 'SPA',
        primaryColor: '#881337',
        accentColor: '#f43f5e',
        themeMode: 'glass' as const,
        heroTitle: 'TUẦN LỄ THƯ GIÃN & NHÁN SẮC',
        heroSubtitle: 'Trải nghiệm Dịch vụ Thảo dược Spa cao cấp, Váy cưới Luxury & Combo Làm đẹp Trọn gói',
        heroDiscount: '40%',
        heroImgUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        promoBarText: '💄 COMBO SPA THẢO DƯỢC: VOUCHER TẶNG 100.000Đ TRONG HÔM NAY'
      }
    }
  ];

  // Natural Language AI Design Generator Process
  const handleGenerateDesign = async (userPromptText: string, customConfigOverride?: Partial<ThemeConfig>) => {
    if (!userPromptText.trim() && !customConfigOverride) return;

    setIsGenerating(true);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { sender: 'user', text: userPromptText, time: nowTime }]);

    setTimeout(async () => {
      let proposedConfig: Partial<ThemeConfig> = {};
      const lower = userPromptText.toLowerCase();

      if (customConfigOverride) {
        proposedConfig = customConfigOverride;
      } else if (lower.includes('tết') || lower.includes('xuân') || lower.includes('đào')) {
        proposedConfig = DESIGN_PROMPTS[0].config;
      } else if (lower.includes('black friday') || lower.includes('sale 50%') || lower.includes('cyber') || lower.includes('neon')) {
        proposedConfig = DESIGN_PROMPTS[1].config;
      } else if (lower.includes('luxury') || lower.includes('sang trọng') || lower.includes('ngọc') || lower.includes('emerald')) {
        proposedConfig = DESIGN_PROMPTS[2].config;
      } else if (lower.includes('spa') || lower.includes('làm đẹp') || lower.includes('rose') || lower.includes('nữ')) {
        proposedConfig = DESIGN_PROMPTS[3].config;
      } else {
        // Dynamic smart parser
        const isDark = lower.includes('tối') || lower.includes('dark');
        const isGlass = lower.includes('kính') || lower.includes('glass');
        proposedConfig = {
          siteName: 'TQ Super Mall 🚀',
          tagline: 'Hệ Thống Mua Sắm Thông Minh Trực Tuyến',
          primaryColor: lower.includes('xanh') ? '#0284c7' : lower.includes('tím') ? '#7e22ce' : '#0F2C59',
          accentColor: lower.includes('vàng') ? '#eab308' : lower.includes('đỏ') ? '#ef4444' : '#FF6B00',
          themeMode: isDark ? 'dark' : (isGlass ? 'glass' : 'light'),
          heroTitle: 'THIẾT KẾ GIAO DIỆN MỚI TỪ AI',
          heroSubtitle: `AI TiQi đã cá nhân hóa giao diện theo yêu cầu: "${userPromptText}"`,
          heroDiscount: '35%',
          promoBarText: `🔥 AI DESIGNER APPLIED: ${userPromptText.toUpperCase()}`
        };
      }

      const mergedDraft: ThemeConfig = {
        ...theme,
        ...proposedConfig,
        featureVisibility: {
          showHeroBanner: true,
          showCategoryFilters: true,
          showLocationFilter: true,
          showSmartRecommender: true,
          showQuickButtons: true,
          showLiveChatWidget: true,
          showPromoBar: true,
          ...(theme.featureVisibility || {}),
          ...(proposedConfig.featureVisibility || {})
        }
      };

      setDraftConfig(mergedDraft);
      setIsGenerating(false);

      const responseMessage = `✨ DẠ THƯA ADMIN! AI TIQI ĐÃ HOÀN TẤT THIẾT KẾ GIAO DIỆN THEO YÊU CẦU: "${userPromptText}". Admin có thể bấm nút "🚀 ÁP DỤNG & PHÁT SÓNG REALTIME" bên dưới để áp dụng trực tiếp tới 100% người dùng trên toàn hệ thống!`;

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: responseMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);

      speakAiResponse(responseMessage);
    }, 1000);
  };

  // Broadcast & Apply Design Live System-Wide
  const handleApplyAndBroadcastRealtime = async () => {
    await updateTheme(draftConfig);
    addToast('🚀 ĐÃ PHÁT SÓNG GIAO DIỆN AI THIẾT KẾ THỜI GIAN THỰC TỚI TOÀN BỘ HỆ THỐNG!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-400/50 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Wand2 className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-amber-300 uppercase tracking-wider flex items-center gap-2">
                🎨 AI LIVE WEB DESIGN STUDIO (DÀNH RIÊNG ADM)
              </h3>
              <p className="text-[11px] text-slate-400">
                Trợ lý AI thiết kế web trực tuyến bằng câu lệnh giọng nói/văn bản & phát sóng Realtime tới toàn bộ người dùng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                voiceEnabled ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={voiceEnabled ? 'Tắt giọng nói AI' : 'Bật giọng nói AI'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline">{voiceEnabled ? 'Giọng Nói Bật' : 'Giọng Nói Tắt'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Column: AI Live Assistant Chat (5 Cols) */}
          <div className="lg:col-span-5 border-r border-slate-800 flex flex-col bg-slate-950/60 overflow-hidden">
            
            {/* Quick Prompt Presets */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2 shrink-0">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> ĐỀ XUẤT THIẾT KẾ MAU CHÓNG:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {DESIGN_PROMPTS.map((dp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(dp.promptText);
                      handleGenerateDesign(dp.promptText, dp.config);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap transition cursor-pointer shrink-0"
                  >
                    {dp.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Conversation History */}
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                      m.sender === 'user'
                        ? 'bg-amber-400 text-slate-950 font-bold rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-1'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    <span className={`text-[9px] block text-right font-mono ${m.sender === 'user' ? 'text-slate-900/70' : 'text-slate-500'}`}>
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold p-3 bg-slate-900 rounded-2xl border border-slate-800 w-fit">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span>AI TiQi đang tạo phác thảo giao diện...</span>
                </div>
              )}
            </div>

            {/* Input Prompt Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerateDesign(prompt);
                setPrompt('');
              }}
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Nhập yêu cầu AI thiết kế web (vd: Đổi chủ đề Tết, Cyberpunk...)"
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
              />

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 p-2.5 rounded-xl transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Live Design Controls & Preview (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col p-4 overflow-y-auto custom-scrollbar space-y-5 bg-slate-900">
            
            {/* Action Control Panel Header */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                  🛠️ BẢNG ĐIỀU KHIỂN & BẢN PHÁC THẢO GIAO DIỆN:
                </span>
                <p className="text-xs font-bold text-slate-200">
                  {draftConfig.siteName} • Mode: <span className="text-amber-300 uppercase">{draftConfig.themeMode}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleApplyAndBroadcastRealtime}
                  className="bg-gradient-to-r from-amber-400 via-orange to-amber-500 hover:from-amber-500 hover:to-orange text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg transition text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Zap className="w-4 h-4 fill-current" /> ÁP DỤNG & PHÁT SÓNG REALTIME
                </button>
              </div>
            </div>

            {/* Live Editable Design Tokens Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Site Name & Tagline */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase text-[11px]">
                  <Globe className="w-3.5 h-3.5" /> Tên Thương Hiệu & Khẩu Hiệu
                </h4>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tên Trang Web:</label>
                    <input
                      type="text"
                      value={draftConfig.siteName}
                      onChange={e => setDraftConfig({ ...draftConfig, siteName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Khẩu Hiệu Tagline:</label>
                    <input
                      type="text"
                      value={draftConfig.tagline}
                      onChange={e => setDraftConfig({ ...draftConfig, tagline: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Color Scheme & Theme Mode */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase text-[11px]">
                  <Palette className="w-3.5 h-3.5" /> Bảng Màu & Chế Độ Giao Diện
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Màu Chủ Đạo:</label>
                    <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
                      <input
                        type="color"
                        value={draftConfig.primaryColor}
                        onChange={e => setDraftConfig({ ...draftConfig, primaryColor: e.target.value })}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-[10px] text-slate-300">{draftConfig.primaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Màu Nhấn (Accent):</label>
                    <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
                      <input
                        type="color"
                        value={draftConfig.accentColor}
                        onChange={e => setDraftConfig({ ...draftConfig, accentColor: e.target.value })}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-[10px] text-slate-300">{draftConfig.accentColor}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Chế Độ Nền (Mode):</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['light', 'dark', 'glass'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setDraftConfig({ ...draftConfig, themeMode: mode })}
                        className={`py-1 rounded-lg text-[10px] font-bold uppercase border transition cursor-pointer ${
                          draftConfig.themeMode === mode
                            ? 'bg-amber-400 text-slate-950 border-amber-400'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hero Banner Text & Discount */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 sm:col-span-2">
                <h4 className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase text-[11px]">
                  <Layout className="w-3.5 h-3.5" /> Khung Banner Đầu Trang & Khuyến Mãi Hero
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-1">Tiêu Đề Hero:</label>
                    <input
                      type="text"
                      value={draftConfig.heroTitle}
                      onChange={e => setDraftConfig({ ...draftConfig, heroTitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Phần Trăm Giảm Giá:</label>
                    <input
                      type="text"
                      value={draftConfig.heroDiscount}
                      onChange={e => setDraftConfig({ ...draftConfig, heroDiscount: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-black rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Mô Tả Phụ Hero Subtitle:</label>
                  <input
                    type="text"
                    value={draftConfig.heroSubtitle}
                    onChange={e => setDraftConfig({ ...draftConfig, heroSubtitle: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Thanh Khuyến Mãi Chạy Ngang (Promo Bar):</label>
                  <input
                    type="text"
                    value={draftConfig.promoBarText}
                    onChange={e => setDraftConfig({ ...draftConfig, promoBarText: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

            </div>

            {/* Presets Gallery */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase text-[11px]">
                🎨 BỘ MẪU GIAO DIỆN CHUẨN (PRESET THEMES)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_THEMES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      applyPreset(preset);
                      setDraftConfig(prev => ({
                        ...prev,
                        primaryColor: preset.primaryColor,
                        accentColor: preset.accentColor,
                        themeMode: preset.themeMode
                      }));
                    }}
                    className="bg-slate-900 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-left transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block" style={{ backgroundColor: preset.primaryColor }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block" style={{ backgroundColor: preset.accentColor }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200 block truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
