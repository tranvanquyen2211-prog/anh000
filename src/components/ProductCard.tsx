import React, { useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { detectProvinceFromShopInfo } from '../data/vietnamLocations';
import { ShoppingBag, MessageSquare, Star, ChevronLeft, ChevronRight, Eye, Edit3, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenChatWithProduct: (product: Product) => void;
  onOpenProductDetail?: (product: Product) => void;
  onOpenEditSalesCount?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenChatWithProduct,
  onOpenProductDetail,
  onOpenEditSalesCount
}) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const imagesList = product.images && product.images.length > 0 ? product.images.slice(0, 7) : [product.img];
  const activeImg = imagesList[currentImgIndex] || product.img;

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'RENTAL': return 'bg-pink-600 text-white';
      case 'RETAIL': return 'bg-emerald-600 text-white';
      case 'FNB': return 'bg-amber-600 text-white';
      case 'BEAUTY': return 'bg-rose-500 text-white';
      default: return 'bg-navy text-white';
    }
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev + 1) % imagesList.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const handleCardClick = () => {
    if (onOpenProductDetail) {
      onOpenProductDetail(product);
    }
  };

  // Get Shop Config to parse current location
  const shopConfig = JSON.parse(localStorage.getItem(`tq_shop_config_${product.shopName}`) || '{}');
  const shopLocationName = detectProvinceFromShopInfo(
    product.shopName,
    shopConfig.warehouseAddress || shopConfig.pickupAddress,
    shopConfig.googleMapsUrl
  );

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between product-card relative group cursor-pointer"
    >
      {/* Shop Category Badge */}
      <span className={`absolute top-3.5 left-3.5 text-[8px] sm:text-[9px] font-black px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs z-10 uppercase tracking-wider ${getBadgeStyle(product.shopType)}`}>
        {product.badge || product.shopType}
      </span>

      {/* Super Admin Quick Edit Sales Count Button */}
      {user && user.role === 'SUPER_ADMIN' && onOpenEditSalesCount && (
        <button
          onClick={(e) => { e.stopPropagation(); onOpenEditSalesCount(product); }}
          className="absolute top-3.5 right-14 sm:right-16 bg-slate-900/90 hover:bg-slate-950 text-amber-300 text-[7px] sm:text-[8px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-md z-20 border border-amber-400 flex items-center gap-1 cursor-pointer"
          title="Super Admin: Sửa tổng số lượt mua cho sản phẩm này"
        >
          <Edit3 className="w-2.5 h-2.5 text-amber-400" /> Sửa
        </button>
      )}

      <span className="absolute top-3.5 right-3.5 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs z-10 flex items-center gap-0.5">
        🪙 3%
      </span>

      <div className="space-y-2">
        {/* Product Image & Multi-Image Gallery */}
        <div className="bg-gray-50 rounded-xl overflow-hidden h-36 sm:h-44 flex items-center justify-center relative border border-gray-100 group/img">
          <img
            src={activeImg}
            alt={product.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Quick View Hover Overlay */}
          <div className="absolute inset-0 bg-navy/20 backdrop-blur-[1px] opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white/95 text-navy font-black text-[10px] px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-orange" /> Xem chi tiết
            </span>
          </div>

          {/* Gallery Navigation Arrows */}
          {imagesList.length > 1 && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-navy/70 hover:bg-navy text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition cursor-pointer z-10"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-navy/70 hover:bg-navy text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition cursor-pointer z-10"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full z-10">
                {imagesList.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(idx); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      currentImgIndex === idx ? 'bg-amber-400 w-3' : 'bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Shop Name & Location Tag */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-extrabold tracking-tight uppercase">
            <span className="truncate max-w-[110px]">{product.shopName}</span>
            <span className="bg-orange/10 text-orange border border-orange/20 px-1.5 py-0.2 rounded flex items-center gap-0.5 shrink-0">
              <MapPin className="w-2.5 h-2.5" /> {shopLocationName}
            </span>
          </div>
          
          <h3 className="font-extrabold text-xs text-navy line-clamp-2 min-h-[32px] mt-0.5 leading-snug group-hover:text-orange transition-colors">
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

        {/* Rating & Sales Count */}
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1 text-amber-400 font-extrabold">
            <Star className="w-3 h-3 fill-amber-400" />
            <span className="text-gray-700">5.0</span>
          </div>
          <span className="text-navy font-extrabold bg-gray-100 px-2 py-0.5 rounded-full text-[9px] border border-gray-200">
            Đã bán {(product.salesCount !== undefined ? product.salesCount : 12).toLocaleString('vi-VN')}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-1.5 mt-3.5 pt-2 border-t border-gray-100">
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          className="w-full bg-navy hover:bg-navy-dark text-white text-xs font-extrabold py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Thêm vào giỏ
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onOpenChatWithProduct(product); }}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <MessageSquare className="w-3 h-3" /> Hỏi Shop Realtime
        </button>
      </div>
    </div>
  );
};
