import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { detectProvinceFromShopInfo } from '../data/vietnamLocations';
import { useToast } from '../context/ToastContext';
import {
  X,
  ShoppingCart,
  Zap,
  MessageCircle,
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Star,
  UserCheck,
  ExternalLink,
  MapPin,
  Navigation
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenChatWithProduct: (prod: Product) => void;
  onOpenShopStorefront?: (shopName: string) => void;
  onProceedToCheckout?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenChatWithProduct,
  onOpenShopStorefront,
  onProceedToCheckout
}) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!product) return;

    // Load product reviews
    const loadReviews = async () => {
      const localReviews = JSON.parse(localStorage.getItem(`tq_product_reviews_${product.id}`) || '[]');
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((r: any) => ({
            id: r.id,
            user_name: r.user_name || 'Khách Hàng',
            rating: r.rating || 5,
            comment: r.comment,
            created_at: r.created_at
          }));

          const map = new Map();
          [...localReviews, ...formatted].forEach(r => map.set(r.id, r));
          setReviews(Array.from(map.values()));
        } else {
          setReviews(localReviews);
        }
      } catch (e) {
        setReviews(localReviews);
      }
    };

    loadReviews();

    // Realtime channel listener for synthetic & live reviews updates
    const reviewChannel = supabase
      .channel('public:reviews')
      .on('broadcast', { event: 'synthetic_reviews_updated' }, (payload) => {
        if (payload?.payload?.productId === product.id) {
          loadReviews();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(reviewChannel);
    };
  }, [product?.id]);

  if (!product) return null;

  // Gather up to 7 images or fallback to main image
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.img];

  const currentImage = galleryImages[activeImageIndex] || product.img;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    if (onProceedToCheckout) {
      onProceedToCheckout();
    }
  };

  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  // 📍 SHOP LOCATION & GOOGLE MAPS NAVIGATION LOGIC
  const shopConfig = JSON.parse(localStorage.getItem(`tq_shop_config_${product.shopName}`) || '{}');
  const warehouseAddress = shopConfig.warehouseAddress || shopConfig.pickupAddress || 'Hệ thống Kho Tổng TQ Store Marketplace';
  const provinceName = detectProvinceFromShopInfo(product.shopName, warehouseAddress, shopConfig.googleMapsUrl);
  
  const googleMapsUrl = shopConfig.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${product.shopName} ${warehouseAddress}`)}`;

  return (
    <div className="fixed inset-0 z-50 bg-navy-dark/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full relative border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-navy p-2 transition rounded-full shadow-md backdrop-blur-sm cursor-pointer border border-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: Gallery & Thumbnails */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 group shadow-sm">
                <img
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badge Tag */}
                <span className="absolute top-3 left-3 bg-gradient-to-r from-orange to-amber-500 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                  {product.badge || (product.shopType === 'RENTAL' ? '👗 CHO THUÊ' : product.shopType === 'FNB' ? '🧋 ĐỒ ĂN' : product.shopType === 'BEAUTY' ? '💄 SPA' : '🛍️ BÁN ĐỒ')}
                </span>

                {/* Arrow navigation for multi-images */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-navy p-2 rounded-full shadow-md backdrop-blur-sm transition cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-navy p-2 rounded-full shadow-md backdrop-blur-sm transition cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row (up to 7 images) */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {galleryImages.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`Thumb ${idx}`}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-orange scale-105 shadow-md'
                          : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-600 font-bold bg-gray-50 p-3 rounded-2xl border border-gray-100 text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Chính Hãng</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Giao Hỏa Tốc 2H</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  <span>Đổi Trả Dễ Dàng</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Info & Actions */}
            <div className="space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                
                {/* Clickable Shop Name Trigger */}
                <div>
                  <div
                    onClick={() => {
                      onClose();
                      if (onOpenShopStorefront) onOpenShopStorefront(product.shopName);
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1 cursor-pointer group/shop hover:text-amber-600 transition"
                    title="Bấm để vào trang Cửa hàng xem các sản phẩm khác"
                  >
                    <Store className="w-4 h-4 text-amber-500 group-hover/shop:scale-110 transition-transform" />
                    <span>Gian Hàng: <strong className="text-navy underline group-hover/shop:text-amber-600">{product.shopName}</strong></span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover/shop:opacity-100 transition-opacity" />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-navy leading-tight">
                    {product.title}
                  </h1>
                </div>

                {/* Price Display */}
                <div className="bg-gradient-to-r from-orange/10 via-amber-50 to-orange/5 p-4 rounded-2xl border border-orange/20 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-orange font-mono">
                    {product.price.toLocaleString('vi-VN')} VNĐ
                  </span>
                  <span className="text-xs text-gray-400 font-semibold line-through">
                    {(product.price * 1.25).toLocaleString('vi-VN')} VNĐ
                  </span>
                  <span className="bg-orange text-white text-[10px] font-black px-2 py-0.5 rounded ml-auto">
                    GIẢM 20%
                  </span>
                </div>

                {/* Stock & Sales Info */}
                <div className="flex items-center gap-4 text-xs font-bold text-gray-600 border-b border-gray-100 pb-3">
                  <span className="flex items-center gap-1">
                    <PackageCheck className="w-4 h-4 text-emerald-600" /> Kho: <strong className="text-navy">{product.stock || 50}</strong> sản phẩm
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Đã bán: <strong className="text-navy">{(product.salesCount || 12).toLocaleString('vi-VN')}</strong> lượt
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Mô Tả Chi Tiết Sản Phẩm / Dịch Vụ
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-100 font-medium whitespace-pre-line">
                    {product.details || `Sản phẩm cao cấp từ thương hiệu ${product.shopName}. Đảm bảo chất lượng tiêu chuẩn 100%, giặt sấy đóng gói vô trùng cẩn thận trước khi giao tới tay khách hàng.`}
                  </p>
                </div>

                {/* 📍 SHOP LOCATION & GOOGLE MAPS NAVIGATION SECTION */}
                <div className="bg-gradient-to-br from-slate-900 via-navy-dark to-slate-950 text-white p-4 rounded-2xl border border-amber-400/40 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold shadow shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        📍 VỊ TRÍ GIAN HÀNG & KHO ({provinceName})
                      </h4>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                      ✓ Đã xác minh
                    </span>
                  </div>

                  <p className="text-xs text-gray-200 font-medium leading-relaxed">
                    🏢 <strong>Địa chỉ shop:</strong> {warehouseAddress}
                  </p>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
                  >
                    <Navigation className="w-4 h-4 text-slate-950" /> 🗺️ MỞ GOOGLE MAPS CHỈ ĐƯỜNG ĐẾN SHOP <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 🚖 TAXI RIDE BOOKING BLOCK (FOR TAXI SHOP TYPES) */}
                {product.shopType === 'TAXI' && (
                  <div className="bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-yellow-600/20 border-2 border-yellow-500 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        🚖 GỌI XE TAXI ĐÓN TẬN NƠI HỎA TỐC
                      </h4>
                      <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow">
                        ⚡ ĐÓN TRONG 5 PHÚT
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">📍 Điểm Đón Khách:</label>
                        <input
                          type="text"
                          placeholder="Nhập địa chỉ nhà / ví dụ: 123 Nguyễn Trãi, Hà Nội..."
                          className="w-full bg-white border border-yellow-400 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">🏁 Điểm Đến / Nơi Trả Khách:</label>
                        <input
                          type="text"
                          placeholder="Nhập điểm đến / Sân bay Nội Bài, bến xe..."
                          className="w-full bg-white border border-yellow-400 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addToast(`🚖 Đã gửi yêu cầu gọi xe Taxi tới [${product.shopName}]! Tài xế sẽ liên hệ bạn ngay!`, 'success');
                        onClose();
                      }}
                      className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-500 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-yellow-500"
                    >
                      🚖 ĐẶT XE TAXI NGAY (GIÁ CHỈ {product.price.toLocaleString('vi-VN')} Đ/KM)
                    </button>
                  </div>
                )}

                {/* Quantity Control */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-bold text-navy">Số Lượng:</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 font-black text-navy hover:bg-gray-200 transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-black text-navy font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="px-3 py-1.5 font-black text-navy hover:bg-gray-200 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="bg-navy hover:bg-navy-dark text-amber-400 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-400" /> THÊM VÀO GIỎ HÀNG
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="bg-gradient-to-r from-orange to-amber-500 hover:from-orange-dark hover:to-amber-600 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-white" /> MUA NGAY
                  </button>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenChatWithProduct(product);
                  }}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition border border-emerald-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> CHAT VỚI SHOP VỀ SẢN PHẨM NÀY
                </button>
              </div>

            </div>

          </div>

          {/* REVIEWS SECTION */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-navy uppercase tracking-wide flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> ĐÁNH GIÁ TỪ KHÁCH HÀNG ({reviews.length})
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Đánh giá trung bình: <strong className="text-amber-500">{averageRating} / 5.0 ⭐</strong>
                </p>
              </div>
              <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs border border-amber-300">
                100% Đánh Giá Xác Thực
              </span>
            </div>

            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reviews.map((r, idx) => (
                  <div key={r.id || idx} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-navy text-amber-400 rounded-full flex items-center justify-center font-bold text-[10px]">
                          {r.user_name ? r.user_name.charAt(0) : 'U'}
                        </div>
                        <span className="font-bold text-navy">{r.user_name}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                          <UserCheck className="w-2.5 h-2.5" /> Đã mua hàng
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : 'Mới đây'}
                      </span>
                    </div>

                    <div className="flex gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= (r.rating || 5) ? 'fill-amber-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-gray-700 leading-snug italic">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400 text-xs border border-gray-200">
                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm và đánh giá!
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
