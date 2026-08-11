import React from 'react';
import type { Product } from '../types';
import { ShieldCheck } from 'lucide-react';

interface ShopeeMallSectionProps {
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
}

export const ShopeeMallSection: React.FC<ShopeeMallSectionProps> = ({
  products,
  onOpenProductDetail
}) => {
  const mallProducts = products.filter(p => p.isGrandOpening || p.shopType === 'RENTAL' || p.shopType === 'RETAIL').slice(0, 5);

  return (
    <section className="bg-white p-3.5 sm:p-4 rounded-2xl border border-rose-100 shadow-xs space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="bg-[#d0011b] text-white text-[11px] font-black px-2 py-0.5 rounded tracking-widest uppercase flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" /> SHOPEE MALL
          </span>
          <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">100% Hàng Chính Hãng • Miễn Phí Trả Hàng 7 Ngày</span>
        </div>

        <span className="text-[11px] font-bold text-[#d0011b] hover:underline cursor-pointer">
          Xem Tất Cả ➔
        </span>
      </div>

      {/* Grid items */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {mallProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => onOpenProductDetail(p)}
            className="bg-gray-50 hover:bg-white rounded-xl p-2 border border-gray-100 hover:border-rose-300 transition duration-200 cursor-pointer flex flex-col justify-between group shadow-2xs"
          >
            <div className="relative h-32 bg-white rounded-lg overflow-hidden mb-2">
              <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              <span className="absolute top-1 left-1 bg-[#d0011b] text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                Mall
              </span>
            </div>

            <div className="space-y-1">
              <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1 group-hover:text-[#d0011b] transition-colors">
                {p.title}
              </h5>
              <div className="text-[#d0011b] font-black font-mono text-xs">
                {p.price.toLocaleString('vi-VN')} đ
              </div>
              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded block text-center">
                ✓ Miễn phí vận chuyển
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
