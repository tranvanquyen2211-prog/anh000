import React from 'react';
import type { ShopType } from '../types';

interface ShopeeMobileIconGridProps {
  onSelectCategory: (cat: ShopType | 'ALL') => void;
  onOpenAiMixMatchModal?: () => void;
  onOpenWalletDepositWithdrawModal?: () => void;
  onOpenWatchToEarnModal?: () => void;
}

export const ShopeeMobileIconGrid: React.FC<ShopeeMobileIconGridProps> = ({
  onSelectCategory,
  onOpenAiMixMatchModal,
  onOpenWalletDepositWithdrawModal,
  onOpenWatchToEarnModal
}) => {
  const quickItems = [
    {
      id: 'rental',
      title: 'Thuê Tr.Phục',
      badge: '0đ',
      icon: '👰',
      bgGradient: 'from-amber-400 to-orange-500',
      action: () => onSelectCategory('RENTAL')
    },
    {
      id: 'retail',
      title: 'Shop Bán Đồ',
      badge: 'Chính Hãng',
      icon: '🛍️',
      bgGradient: 'from-red-500 to-rose-600',
      action: () => onSelectCategory('RETAIL')
    },
    {
      id: 'fnb',
      title: 'Đồ Ăn Uống',
      badge: 'Giao 15p',
      icon: '🧋',
      bgGradient: 'from-orange-500 to-amber-600',
      action: () => onSelectCategory('FNB')
    },
    {
      id: 'beauty',
      title: 'Spa Làm Đẹp',
      badge: '-50%',
      icon: '💄',
      bgGradient: 'from-pink-500 to-rose-500',
      action: () => onSelectCategory('BEAUTY')
    },
    {
      id: 'taxi',
      title: 'Gọi Taxi TQ',
      badge: 'Đón Ngay',
      icon: '🚖',
      bgGradient: 'from-emerald-500 to-teal-600',
      action: () => onSelectCategory('TAXI')
    },
    {
      id: 'ai_mix',
      title: 'AI Thử Đồ',
      badge: 'HOT AI',
      icon: '👗',
      bgGradient: 'from-purple-600 to-pink-600',
      action: () => onOpenAiMixMatchModal && onOpenAiMixMatchModal()
    },
    {
      id: 'wallet',
      title: 'Ví TQ Pay',
      badge: 'Hoàn Xu',
      icon: '💰',
      bgGradient: 'from-amber-500 to-yellow-600',
      action: () => onOpenWalletDepositWithdrawModal && onOpenWalletDepositWithdrawModal()
    },
    {
      id: 'earn',
      title: 'Xem Clip Xu',
      badge: 'Thưởng',
      icon: '📺',
      bgGradient: 'from-blue-600 to-indigo-600',
      action: () => onOpenWatchToEarnModal && onOpenWatchToEarnModal()
    }
  ];

  return (
    <section className="bg-white p-3 rounded-2xl shadow-xs border border-gray-100 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#ee4d2d]"></span> DANH MỤC TIỆN ÍCH NỔI BẬT
        </h4>
        <span className="text-[10px] text-[#ee4d2d] font-bold">Chạm để chọn</span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
        {quickItems.map((item) => (
          <div
            key={item.id}
            onClick={item.action}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${item.bgGradient} flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform`}>
              <span>{item.icon}</span>
              {item.badge && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ee4d2d] text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-2xs uppercase">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-800 line-clamp-1 group-hover:text-[#ee4d2d] transition-colors">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
