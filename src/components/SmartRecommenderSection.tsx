import React from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Sparkles, Store, Flame, Search, ArrowRight, PartyPopper, CheckCircle } from 'lucide-react';

interface SmartRecommenderSectionProps {
  products: Product[];
  searchQuery: string;
  onOpenShopStorefront: (shopName: string) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenChatWithProduct: (product: Product) => void;
  onOpenEditSalesCount: (product: Product) => void;
}

export const SmartRecommenderSection: React.FC<SmartRecommenderSectionProps> = ({
  products,
  searchQuery,
  onOpenShopStorefront,
  onOpenProductDetail,
  onOpenChatWithProduct,
  onOpenEditSalesCount
}) => {
  // Grand Opening Shops list (mocked + local override)
  const grandOpeningShops = [
    {
      name: 'TQ Rental Studio',
      slogan: '🎉 KHAI TRƯƠNG BỘ SƯU TẬP VÁY CƯỚI 2026',
      badge: '🆕 SHOP KHAI TRƯƠNG',
      bgImg: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      avatar: 'https://ui-avatars.com/api/?name=TQ+Rental+Studio&background=0F2C59&color=fff'
    },
    {
      name: 'TQ Beauty Spa',
      slogan: '🎉 KHAI TRƯƠNG CƠ SỞ SPA VIP ĐÀ NẴNG',
      badge: '🆕 GIAN HÀNG MỚI',
      bgImg: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      avatar: 'https://ui-avatars.com/api/?name=TQ+Beauty+Spa&background=0F2C59&color=fff'
    },
    {
      name: 'TQ Tea & Coffee',
      slogan: '🎉 CHÀO SÂN MENU TRÀ SỮA ĐẶC SẢN MỚI',
      badge: '🆕 KHAI TRƯƠNG F&B',
      bgImg: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      avatar: 'https://ui-avatars.com/api/?name=TQ+Tea+Coffee&background=0F2C59&color=fff'
    }
  ];

  // Filter grand opening & new products
  const grandOpeningProducts = products.filter(
    p => p.isGrandOpening || p.isNew || p.badge?.includes('Mới') || p.badge?.includes('HOT')
  );

  // Keyword search matching recommendation logic
  const isSearching = searchQuery.trim().length > 0;
  const keywordMatchedProducts = isSearching
    ? products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.details && p.details.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="space-y-8">
      
      {/* 🔍 1. KEYWORD MATCHING RECOMMENDATIONS (Shown when user searches) */}
      {isSearching && (
        <section className="bg-gradient-to-r from-navy via-navy-dark to-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-amber-400/40 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/30 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 text-navy font-black rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                  🎯 ĐỀ XUẤT CHUẨN TỪ KHÓA TÌM KIẾM: "{searchQuery}"
                </h3>
                <p className="text-xs text-gray-300">
                  AI tìm thấy {keywordMatchedProducts.length} sản phẩm trùng khớp với từ khóa tìm kiếm của bạn
                </p>
              </div>
            </div>

            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-amber-400" /> AI Keyword Match 100%
            </span>
          </div>

          {keywordMatchedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {keywordMatchedProducts.slice(0, 4).map(product => (
                <div key={product.id} className="relative">
                  <div className="absolute top-2 left-2 z-10 bg-amber-400 text-navy font-black text-[9px] px-2 py-0.5 rounded-full shadow">
                    🎯 Khớp từ khóa
                  </div>
                  <ProductCard
                    product={product}
                    onOpenChatWithProduct={onOpenChatWithProduct}
                    onOpenProductDetail={onOpenProductDetail}
                    onOpenEditSalesCount={onOpenEditSalesCount}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-2">Không tìm thấy sản phẩm nào khớp hoàn toàn với từ khóa "{searchQuery}". Thử từ khóa khác!</p>
          )}
        </section>
      )}

      {/* 🏪 2. GRAND OPENING & NEW SHOPS RECOMMENDER */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange text-navy rounded-xl flex items-center justify-center font-black shadow">
              <PartyPopper className="w-5 h-5 text-navy animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-navy uppercase tracking-wide flex items-center gap-2">
                SHOP KHAI TRƯƠNG & GIAN HÀNG MỚI NỔI NỔI BẬT
              </h2>
              <p className="text-xs text-gray-500 font-medium">Đề xuất các cửa hàng uy tín vừa ra mắt với ưu đãi cực khủng</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {grandOpeningShops.map((shop, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-amber-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col justify-between"
            >
              <div className="relative h-32 bg-slate-900 overflow-hidden">
                <img
                  src={shop.bgImg}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {shop.badge}
                </span>

                <div className="absolute bottom-3 left-3 flex items-center gap-3">
                  <img
                    src={shop.avatar}
                    alt={shop.name}
                    className="w-12 h-12 rounded-xl border-2 border-amber-400 shadow-md"
                  />
                  <div>
                    <h3 className="text-white font-black text-sm">{shop.name}</h3>
                    <span className="text-[10px] text-amber-300 font-bold block">{shop.slogan}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 flex items-center justify-between">
                <span className="text-[11px] text-navy font-bold flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-amber-500" /> Gian hàng đã xác minh 100%
                </span>
                <button
                  onClick={() => onOpenShopStorefront(shop.name)}
                  className="bg-navy hover:bg-navy-dark text-white font-black text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow"
                >
                  Xem Shop <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🎉 3. GRAND OPENING & HOT NEW PRODUCTS RECOMMENDER */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center font-black shadow">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-navy uppercase tracking-wide">
                SẢN PHẨM KHAI TRƯƠNG & MỚI RA MẮT
              </h2>
              <p className="text-xs text-gray-500 font-medium">Sản phẩm mới tải lên từ các cửa hàng khai trương</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {grandOpeningProducts.slice(0, 6).map(product => (
            <div key={product.id} className="relative">
              <div className="absolute top-2 left-2 z-10 bg-rose-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
                🎉 KHAI TRƯƠNG
              </div>
              <ProductCard
                product={product}
                onOpenChatWithProduct={onOpenChatWithProduct}
                onOpenProductDetail={onOpenProductDetail}
                onOpenEditSalesCount={onOpenEditSalesCount}
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
