import React from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingBag, MessageSquare, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenChatWithProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenChatWithProduct }) => {
  const { addToCart } = useCart();

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'RENTAL': return 'bg-pink-600 text-white';
      case 'RETAIL': return 'bg-emerald-600 text-white';
      case 'FNB': return 'bg-amber-600 text-white';
      case 'BEAUTY': return 'bg-rose-500 text-white';
      default: return 'bg-navy text-white';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between product-card relative group">
      {/* Shop Category Badge */}
      <span className={`absolute top-4 left-4 text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-xs z-10 uppercase tracking-wider ${getBadgeStyle(product.shopType)}`}>
        {product.badge || product.shopType}
      </span>

      <span className="absolute top-4 right-4 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs z-10 flex items-center gap-0.5">
        🪙 3% Xu
      </span>

      <div className="space-y-2.5">
        {/* Product Image */}
        <div className="bg-gray-50 rounded-xl overflow-hidden h-40 flex items-center justify-center relative border border-gray-100">
          <img
            src={product.img}
            alt={product.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Shop Name & Title */}
        <div>
          <span className="text-[10px] text-gray-400 font-extrabold tracking-tight uppercase truncate block">
            {product.shopName}
          </span>
          <h3 className="font-extrabold text-xs text-navy line-clamp-2 min-h-[32px] mt-0.5 leading-snug">
            {product.title}
          </h3>
        </div>

        {/* Price & Specs */}
        <div className="flex items-baseline justify-between">
          <p className="text-orange font-black text-sm">
            {product.price.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        
        {product.details && (
          <p className="text-[10px] text-gray-500 line-clamp-1 italic bg-gray-50 p-1.5 rounded-lg border border-gray-100">
            {product.details}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-extrabold">
          <Star className="w-3 h-3 fill-amber-400" />
          <span className="text-gray-700">5.0</span>
          <span className="text-gray-400 text-[9px] font-normal">(Đã bán {product.salesCount || 12})</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-1.5 mt-3.5 pt-2 border-t border-gray-100">
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-navy hover:bg-navy-dark text-white text-xs font-extrabold py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Thêm vào giỏ
        </button>

        <button
          onClick={() => onOpenChatWithProduct(product)}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <MessageSquare className="w-3 h-3" /> Hỏi Shop Realtime
        </button>
      </div>
    </div>
  );
};
