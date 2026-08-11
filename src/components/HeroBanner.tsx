import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ShopType } from '../types';

interface HeroBannerProps {
  onSelectCategory: (cat: ShopType) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    {
      title: theme.heroTitle || 'CHÀO XUÂN 2026 - MUA SẮM RỘN RÀNG',
      subtitle: theme.heroSubtitle || 'Thuê đồ thời trang, Mall chính hãng, Giao đồ ăn 15p & Spa làm đẹp.',
      discount: theme.heroDiscount || 'GIẢM ĐẾN 50%',
      img: theme.heroImgUrl || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      category: 'RENTAL' as ShopType
    },
    {
      title: 'GIAN HÀNG CHÍNH HÃNG 100%',
      subtitle: 'Hàng ngàn deal thời trang, đầm cưới cao cấp & mỹ phẩm làm đẹp chính hãng bảo hành 7 ngày.',
      discount: 'FREESHIP EXTRA 0Đ',
      img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
      category: 'RETAIL' as ShopType
    },
    {
      title: 'ĐỒ ĂN GIAO NHANH 15 PHÚT',
      subtitle: 'Thưởng thức trà sữa ô long, gà rán, pizza hot hỏa tốc tận nhà tích TQ Xu!',
      discount: 'MUA 1 TẶNG 1',
      img: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=1200&q=80',
      category: 'FNB' as ShopType
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = bannerSlides[currentSlide];

  return (
    <div className="space-y-4">
      {/* Shopee PC Grid Layout: Main Carousel (70%) + Dual Stacked Sub-banners (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Main Banner Carousel (Left 8 Cols) */}
        <div className="lg:col-span-8 relative bg-[#0F2C59] rounded-2xl overflow-hidden shadow-lg h-60 sm:h-72 md:h-80 group border border-gray-200">
          <img
            src={slide.img}
            alt={slide.title}
            className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-5 sm:p-8 flex flex-col justify-end text-white">
            <span className="bg-[#ee4d2d] text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider w-fit mb-2 shadow">
              {slide.discount}
            </span>
            <h2 className="text-xl sm:text-3xl font-black leading-tight drop-shadow">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 font-medium line-clamp-2 max-w-xl mt-1">
              {slide.subtitle}
            </p>
          </div>

          {/* Carousel Arrows */}
          <button
            onClick={() => setCurrentSlide(prev => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-[#ee4d2d] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % bannerSlides.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-[#ee4d2d] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {bannerSlides.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'bg-[#ee4d2d] w-6' : 'bg-white/60 hover:bg-white w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dual Stacked Sub-banners (Right 4 Cols - Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-3">
          {/* Sub-banner 1 */}
          <div
            onClick={() => onSelectCategory('RENTAL')}
            className="flex-1 bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 rounded-2xl p-4 text-white shadow-md border border-pink-400/30 flex flex-col justify-between cursor-pointer hover:scale-102 transition group relative overflow-hidden"
          >
            <div className="z-10">
              <span className="bg-amber-300 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase">VOUCHER 0Đ</span>
              <h4 className="font-black text-sm mt-1">Thuê Đồ Cưới & Thử AI Studio 1-Click</h4>
              <p className="text-[10px] text-pink-100 mt-0.5">Phối đồ thông minh AI ngẫu nhiên</p>
            </div>
            <div className="z-10 text-xs font-bold text-amber-300 flex items-center gap-1 mt-2">
              Khám phá ngay ➔
            </div>
            <span className="absolute -right-4 -bottom-4 text-6xl opacity-20 group-hover:scale-125 transition-transform">👗</span>
          </div>

          {/* Sub-banner 2 */}
          <div
            onClick={() => onSelectCategory('FNB')}
            className="flex-1 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-4 text-white shadow-md border border-amber-400/30 flex flex-col justify-between cursor-pointer hover:scale-102 transition group relative overflow-hidden"
          >
            <div className="z-10">
              <span className="bg-white text-orange-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">GIAO 15P</span>
              <h4 className="font-black text-sm mt-1">Đồ Ăn & Trà Sữa Giảm 50%</h4>
              <p className="text-[10px] text-amber-100 mt-0.5">Hoàn 100% TQ Xu cho đơn ví</p>
            </div>
            <div className="z-10 text-xs font-bold text-yellow-100 flex items-center gap-1 mt-2">
              Đặt món hỏa tốc ➔
            </div>
            <span className="absolute -right-4 -bottom-4 text-6xl opacity-20 group-hover:scale-125 transition-transform">🧋</span>
          </div>
        </div>

      </div>

      {/* Wallet & Promo Bar Removed to Maximize Screen Space */}
    </div>
  );
};
