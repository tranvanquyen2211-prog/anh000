import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import {
  X,
  Store,
  MapPin,
  Phone,
  MessageCircle,
  Package,
  ShieldCheck,
  Star,
  ExternalLink
} from 'lucide-react';

interface ShopStorefrontModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  products: Product[];
  onOpenChatWithShop: (shopName: string) => void;
  onOpenProductDetail: (product: Product) => void;
}

export const ShopStorefrontModal: React.FC<ShopStorefrontModalProps> = ({
  isOpen,
  onClose,
  shopName,
  products,
  onOpenChatWithShop,
  onOpenProductDetail
}) => {
  const [shopConfig, setShopConfig] = useState<any>(null);

  useEffect(() => {
    if (shopName) {
      const saved = localStorage.getItem(`tq_shop_config_${shopName}`);
      if (saved) {
        try {
          setShopConfig(JSON.parse(saved));
        } catch (e) {}
      } else {
        setShopConfig({
          slogan: 'Gian Hàng Uy Tín Top 1 TQ Store Marketplace',
          bio: 'Chuyên cung cấp sản phẩm & dịch vụ chất lượng cao, cam kết chính hãng 100%, giao hàng hỏa tốc 2 giờ.',
          bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
          hotline: '0367818343',
          warehouseAddress: 'Hệ thống Kho Tổng TQ Store Marketplace'
        });
      }
    }
  }, [shopName]);

  if (!isOpen || !shopName) return null;

  // Filter products published specifically by this shop
  const shopProducts = products.filter(
    p => p.shopName.toLowerCase() === shopName.toLowerCase() || p.shopName.includes(shopName)
  );

  return (
    <div className="fixed inset-0 z-50 bg-navy-dark/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full relative border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-navy p-2 transition rounded-full shadow-lg backdrop-blur-sm cursor-pointer border border-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SHOP HERO COVER BANNER & BRANDING */}
        <div className="relative h-44 sm:h-52 bg-slate-900 shrink-0">
          <img
            src={shopConfig?.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'}
            alt="Shop Banner"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent"></div>

          {/* Shop Profile Header Info */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-xl border-2 border-amber-400 shrink-0 overflow-hidden">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(shopName)}&background=0F2C59&color=fff`}
                  alt={shopName}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="text-white space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{shopName}</h1>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Gian Hàng Xác Thực
                  </span>
                </div>
                <p className="text-xs text-amber-300 font-bold line-clamp-1">
                  ✨ {shopConfig?.slogan || 'Gian Hàng Uy Tín Top 1 TQ Store'}
                </p>
              </div>
            </div>

            {/* Quick Contact & Chat Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onClose(); onOpenChatWithShop(shopName); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer border border-emerald-300"
              >
                <MessageCircle className="w-4 h-4 text-emerald-100" /> Chat Với Shop
              </button>

              {shopConfig?.hotline && (
                <a
                  href={`tel:${shopConfig.hotline}`}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-slate-950" /> Hotline
                </a>
              )}
            </div>
          </div>
        </div>

        {/* SHOP METADATA BAR */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 shrink-0 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-navy font-bold">
              <Package className="w-4 h-4 text-amber-500" /> Số sản phẩm: <strong className="text-orange font-black">{shopProducts.length} mặt hàng</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Đánh giá: <strong className="text-navy">5.0 ⭐ (100% Uy Tín)</strong>
            </span>
          </div>

          {shopConfig?.warehouseAddress && (
            <div className="flex items-center gap-1.5 text-gray-500 text-[11px] truncate max-w-md">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{shopConfig.warehouseAddress}</span>
              {shopConfig.googleMapsUrl && (
                <a
                  href={shopConfig.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5 ml-1"
                >
                  (Google Maps <ExternalLink className="w-3 h-3" />)
                </a>
              )}
            </div>
          )}
        </div>

        {/* SHOP PRODUCTS CATALOG BODY */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-base font-black text-navy uppercase tracking-wide flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" /> TẤT CẢ SẢN PHẨM / DỊCH VỤ CỦA {shopName} ({shopProducts.length})
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Bấm vào sản phẩm để xem chi tiết thông số & hình ảnh
              </p>
            </div>
          </div>

          {shopProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {shopProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenChatWithProduct={() => { onClose(); onOpenChatWithShop(shopName); }}
                  onOpenProductDetail={(prod) => { onClose(); onOpenProductDetail(prod); }}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400 bg-gray-50 rounded-3xl border border-gray-200 p-8 space-y-2">
              <div className="text-4xl mb-2">🏪</div>
              <h4 className="font-extrabold text-sm text-navy">Cửa hàng chưa có sản phẩm nào công khai</h4>
              <p className="text-xs text-gray-500">Vui lòng quay lại sau hoặc liên hệ gian hàng qua hotline hỗ trợ.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
