import React from 'react';
import type { ShopType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Zap } from 'lucide-react';

interface CategoryFiltersProps {
  selectedCategory: ShopType | 'ALL';
  onSelectCategory: (cat: ShopType | 'ALL') => void;
  onQuickSearch?: (query: string) => void;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  onQuickSearch
}) => {
  const { theme } = useTheme();
  const vis = theme.featureVisibility;

  const categories = [
    { type: 'ALL' as const, title: 'Tất cả danh mục', icon: '✨' },
    { type: 'RENTAL' as const, title: '👗 Cho Thuê Đồ', img: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=200&q=80' },
    { type: 'RETAIL' as const, title: '🛍️ Shop Bán Đồ', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=200&q=80' },
    { type: 'FNB' as const, title: '🧋 Đồ Ăn & Uống', img: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=200&q=80' },
    { type: 'BEAUTY' as const, title: '💄 Làm Đẹp & Spa', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=200&q=80' }
  ];

  const quickShortcuts = [
    { label: '⚡ Flash Sale 50%', query: 'sale' },
    { label: '👗 Váy Cưới Luxury', query: 'váy cưới' },
    { label: '🧋 Trà Sữa Ô Long', query: 'trà sữa' },
    { label: '💄 Spa Thảo Dược 60P', query: 'spa' },
    { label: '🛍️ Sơ Mi Oxford Silk', query: 'sơ mi' }
  ];

  return (
    <section className="space-y-3">
      {/* Quick Action Shortcuts Bar */}
      {vis?.showQuickButtons !== false && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-black text-amber-600 bg-amber-100 border border-amber-300 px-2 py-1 rounded-lg uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-600" /> NÚT CHUYỂN NHANH:
          </span>
          {quickShortcuts.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => onQuickSearch && onQuickSearch(sc.query)}
              className="bg-white hover:bg-navy hover:text-amber-300 text-gray-700 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              {sc.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-xs font-extrabold text-navy uppercase tracking-wider">
          Danh mục sản phẩm & Gian hàng nổi bật
        </h3>
        <span className="text-xs font-semibold text-gray-500">
          Đang lọc: <span className="text-orange font-bold">{selectedCategory}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.type;
          return (
            <div
              key={cat.type}
              onClick={() => onSelectCategory(cat.type)}
              className={`border transition-all rounded-2xl p-3.5 flex items-center justify-between shadow-xs group cursor-pointer ${
                isSelected
                  ? 'bg-navy text-white border-navy ring-2 ring-orange shadow-md scale-102'
                  : 'bg-white hover:bg-gray-50 border-gray-200 text-navy'
              }`}
            >
              <span className={`font-bold text-xs ${isSelected ? 'text-white' : 'group-hover:text-orange'} transition-colors`}>
                {cat.title}
              </span>
              {cat.img ? (
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-11 h-11 object-cover rounded-xl shadow-xs border border-gray-200"
                />
              ) : (
                <div className="w-11 h-11 bg-orange/20 rounded-xl flex items-center justify-center text-lg">
                  {cat.icon}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
