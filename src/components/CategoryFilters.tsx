import React from 'react';
import type { ShopType } from '../types';

interface CategoryFiltersProps {
  selectedCategory: ShopType | 'ALL';
  onSelectCategory: (cat: ShopType | 'ALL') => void;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  const categories = [
    { type: 'ALL' as const, title: 'Tất cả danh mục', icon: '✨' },
    { type: 'RENTAL' as const, title: '👗 Cho Thuê Đồ', img: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=200&q=80' },
    { type: 'RETAIL' as const, title: '🛍️ Shop Bán Đồ', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=200&q=80' },
    { type: 'FNB' as const, title: '🧋 Đồ Ăn & Uống', img: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=200&q=80' },
    { type: 'BEAUTY' as const, title: '💄 Làm Đẹp & Spa', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=200&q=80' }
  ];

  return (
    <section className="space-y-3">
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
