import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ShopType } from '../types';

interface HeroBannerProps {
  onSelectCategory: (cat: ShopType) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Main Banner Hero */}
      <section className="relative bg-gradient-to-r from-navy via-navy-light to-indigo-950 rounded-3xl overflow-hidden p-6 lg:p-10 border border-navy-light shadow-xl flex flex-col md:flex-row items-center justify-between text-white">
        <div className="absolute top-4 right-1/2 w-32 h-32 bg-pattern pointer-events-none"></div>
        <div className="z-10 max-w-lg text-center md:text-left space-y-4 mb-6 md:mb-0">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Khám phá Bộ sưu tập Đa mô hình
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
            {theme.heroTitle || 'ƯU ĐÃI LÊN ĐẾN'} <span className="text-orange">{theme.heroDiscount || '50%'}</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-300 font-medium leading-relaxed">
            {theme.heroSubtitle || 'Thuê đồ thời trang, Mua sắm quần áo, Đặt đồ ăn & Uống F&B, Đặt lịch Spa Làm Đẹp thời gian thực trên cùng một nền tảng.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            <button
              onClick={() => onSelectCategory('RENTAL')}
              className="bg-orange hover:bg-orange-hover text-white font-black px-6 py-3 rounded-xl shadow-lg hover:shadow-orange/30 transition-all text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer"
            >
              Thuê Trang Phục Ngay <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="z-10 relative flex justify-center items-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange to-amber-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <img
              src={theme.heroImgUrl || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'}
              alt="Banner"
              className="relative w-full max-w-md h-60 md:h-64 object-cover rounded-2xl shadow-2xl border-2 border-white/20"
            />
          </div>
        </div>
      </section>

      {/* Wallet Promotion Bar */}
      <section className="bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner">
            💳
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              {theme.promoBarText || `ƯU ĐÃI VÍ CÁ NHÂN TQ PAY: GIẢM THÊM ${theme.walletDiscountRate || 2}% CHO MỌI ĐƠN HÀNG`}
              <span className="bg-white text-emerald-900 text-[9px] uppercase font-black px-2 py-0.5 rounded-full shadow-xs">Hot</span>
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Kết nối Supabase Realtime - Đặt hàng thời gian thực lưu đơn tức thì vào hệ thống!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white/10 px-3.5 py-2 rounded-xl text-xs font-extrabold border border-white/20 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Supabase Verified</span>
          </div>
        </div>
      </section>
    </div>
  );
};
