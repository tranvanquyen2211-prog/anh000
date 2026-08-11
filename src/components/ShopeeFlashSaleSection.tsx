import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { Flame, Clock, Zap } from 'lucide-react';

interface ShopeeFlashSaleSectionProps {
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
}

export const ShopeeFlashSaleSection: React.FC<ShopeeFlashSaleSectionProps> = ({
  products,
  onOpenProductDetail
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 45, seconds: 22 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.slice(0, 6);

  return (
    <section className="bg-gradient-to-r from-orange-500 via-[#ee4d2d] to-rose-600 p-3 sm:p-4 rounded-2xl text-white shadow-md space-y-3">
      {/* Header Bar with Countdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white text-[#ee4d2d] font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider shadow">
            <Zap className="w-4 h-4 text-[#ee4d2d] fill-current animate-bounce" /> FLASH SALE ⚡
          </div>
          
          {/* Countdown Clock */}
          <div className="flex items-center gap-1 text-[11px] font-black font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-200" />
            <span className="bg-black/40 px-1.5 py-0.5 rounded text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span>:</span>
            <span className="bg-black/40 px-1.5 py-0.5 rounded text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span>:</span>
            <span className="bg-black/40 px-1.5 py-0.5 rounded text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>

        <span className="text-[11px] font-bold text-amber-200 hover:underline cursor-pointer">
          Xem Tất Cả ➔
        </span>
      </div>

      {/* Products Carousel */}
      <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
        {flashProducts.map((p, idx) => {
          const discountPercent = idx % 2 === 0 ? 50 : 35;
          const originalPrice = Math.round(p.price * 1.5);
          const soldPercentage = Math.min(95, 60 + idx * 7);

          return (
            <div
              key={p.id}
              onClick={() => onOpenProductDetail(p)}
              className="bg-white text-slate-900 rounded-xl p-2 min-w-[135px] max-w-[145px] shadow-sm flex flex-col justify-between shrink-0 cursor-pointer hover:scale-102 transition group"
            >
              {/* Product Thumbnail */}
              <div className="relative h-28 bg-gray-100 rounded-lg overflow-hidden mb-1.5">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                
                {/* Shopee Style Discount Badge */}
                <div className="absolute top-0 right-0 bg-amber-400 text-rose-700 text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg text-center leading-none">
                  <div>{discountPercent}%</div>
                  <div className="text-[7px] text-rose-900 font-bold">GIẢM</div>
                </div>
              </div>

              {/* Price Section */}
              <div className="space-y-1">
                <div className="text-[#ee4d2d] font-black font-mono text-xs text-center">
                  {p.price.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[9px] text-gray-400 font-mono text-center line-through">
                  {originalPrice.toLocaleString('vi-VN')} đ
                </div>

                {/* Stock Progress Bar */}
                <div className="relative bg-orange-100 h-3.5 rounded-full overflow-hidden flex items-center justify-center">
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-orange-500 to-[#ee4d2d] rounded-full"
                    style={{ width: `${soldPercentage}%` }}
                  ></div>
                  <span className="relative z-10 text-[8px] font-black text-white uppercase tracking-tight flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 text-amber-300 fill-current" /> ĐÃ BÁN {soldPercentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
