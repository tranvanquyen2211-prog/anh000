import React, { useState } from 'react';
import type { Product } from '../types';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { X, Crown, Sparkles, Star, CheckCircle2, ShoppingBag } from 'lucide-react';

interface AdminFakeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProduct?: Product | null;
  onReviewsGenerated?: () => void;
}

export const AdminFakeReviewModal: React.FC<AdminFakeReviewModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProduct: initialProduct,
  onReviewsGenerated
}) => {
  const { addToast } = useToast();

  const [selectedProductId, setSelectedProductId] = useState<string | number>(
    initialProduct ? initialProduct.id : (products[0]?.id || '')
  );
  const [reviewCount, setReviewCount] = useState<number>(5);
  const [targetSalesCount, setTargetSalesCount] = useState<number>(100);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeProduct = products.find(p => p.id === selectedProductId) || initialProduct || products[0];

  if (!isOpen) return null;

  // Realistic buyer names generator
  const REALISTIC_NAMES = [
    'Nguyễn Phương Thảo', 'Trần Quốc Bảo', 'Lê Hoàng Nam', 'Phạm Yến Nhi',
    'Vũ Thu Hà', 'Hoàng Minh Anh', 'Đặng Kim Chi', 'Bùi Gia Huy',
    'Đỗ Bảo Ngọc', 'Nông Khánh Linh', 'Phan Văn Đức', 'Ngô Thanh Trúc',
    'Trịnh Minh Châu', 'Nguyễn Đức Thắng', 'Dương Mỹ Duyên', 'Lý Hải Đăng'
  ];

  // AI Templates grouped by category
  const AI_REVIEW_TEMPLATES: Record<string, string[]> = {
    RENTAL: [
      'Trang phục đẹp xuất sắc luôn ạ! Đồ thơm nức mũi, giặt sấy tiệt trùng mới 99%. Mặc đi tiệc ai cũng khen!',
      'Giao hàng đúng giờ, đóng gói cẩn thận. Phom dáng váy chuẩn từng centimet. Sẽ ủng hộ shop dài dài!',
      'Chất vải xịn xò, màu sắc tươi tắn y hình. Thuê đồ bên shop vừa tiết kiệm vừa được mặc đồ đẹp sang xịn!',
      'Shop tư vấn size nhiệt tình 10/10. Vải mịn mát, mặc chụp ảnh dã ngoại lên hình đẹp lung linh!',
      'Dịch vụ đặt cọc và trả đồ cực kỳ chuyên nghiệp. Đồ mới và đẹp hơn mong đợi nhiều!'
    ],
    RETAIL: [
      'Sản phẩm đẹp ngoài mong đợi! Vải dày dặn, đường kim mũi chỉ rất tỉ mỉ. Giao hàng hỏa tốc trong 2h siêu nhanh!',
      'Hàng chính hãng đóng gói 2 lớp chắc chắn. Giá cả quá hợp lý so me với chất lượng tuyệt vời này!',
      'Shop phục vụ rất chu đáo. Sản phẩm dùng siêu thích, săn được giá ưu đãi quá lời!',
      'Đã nhận đủ hàng, đúng mẫu đúng màu. Rất đáng tiền, 5 sao chất lượng tuyệt đối!',
      'Giao đúng mẫu, đóng gói chỉn chu có thẻ cảm ơn cẩn thận. Chắc chắn sẽ giới thiệu cho bạn bè!'
    ],
    FNB: [
      'Đồ ăn giao tới vẫn còn nóng hổi ngào ngạt mùi thơm! Nêm nếm rất vừa vị, đóng gói sạch sẽ 10/10!',
      'Nước uống ngọt thanh vừa phải, topping tràn ly siêu nhiều. Anh shipper giao hàng rất thân thiện!',
      'Đồ ăn tươi ngon ngon ngất ngây. Mua vào giờ vàng còn được áp voucher siêu rẻ. Mọi người nên thử nhé!',
      'Món ăn trình bày đẹp mắt, hợp vệ sinh an toàn thực phẩm. Sẽ tiếp tục đặt cho văn phòng ăn trưa!',
      'Vị ngon chuẩn vị gian hàng uy tín. Đóng hộp giấy bảo vệ môi trường rất văn minh!'
    ],
    BEAUTY: [
      'Gói dịch vụ spa vô cùng thư giãn! Chuyên viên tay nghề cao, thao tác nhẹ nhàng lịch sự. Xong liệu trình da mịn màng rõ rệt!',
      'Không gian spa thơm tinh dầu thảo mộc rất dễ chịu. Đội ngũ nhân viên thân thiện chu đáo 5 sao!',
      'Trải nghiệm tuyệt vời! Cơ sở vật chất sang trọng hiện đại. Sẽ đăng ký gói liệu trình dài hạn!',
      'Làm đẹp xong cảm giác cơ thể nhẹ nhõm căng tràn sức sống. Đáng đồng tiền bát gạo!',
      'Chất lượng dịch vụ hoàn hảo. Nhân viên tư vấn đúng nhu cầu không chèo kéo.'
    ]
  };

  const handleGenerateFakeReviews = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeProduct) {
      addToast('Vui lòng chọn sản phẩm cần tạo đánh giá!', 'error');
      return;
    }

    setIsGenerating(true);

    const category = activeProduct.shopType || 'RETAIL';
    const templates = AI_REVIEW_TEMPLATES[category] || AI_REVIEW_TEMPLATES['RETAIL'];

    const newGeneratedReviews: any[] = [];
    const now = Date.now();

    for (let i = 0; i < reviewCount; i++) {
      const randomName = REALISTIC_NAMES[Math.floor(Math.random() * REALISTIC_NAMES.length)];
      const randomComment = templates[Math.floor(Math.random() * templates.length)];
      const randomRating = Math.random() > 0.15 ? 5 : 4; // 85% 5-star, 15% 4-star

      const reviewItem = {
        id: `AI_REV_${now}_${i}`,
        productId: activeProduct.id,
        user_name: randomName,
        rating: randomRating,
        comment: `${randomComment} (Đánh giá từ khách mua sản phẩm ${activeProduct.title})`,
        created_at: new Date(now - i * 3600000 * 4).toISOString(), // Staggered timestamps
        is_synthetic: true
      };

      newGeneratedReviews.push(reviewItem);
    }

    // Save to Local Storage
    const existingProductReviews: any[] = JSON.parse(localStorage.getItem(`tq_product_reviews_${activeProduct.id}`) || '[]');
    const updatedProductReviews = [...newGeneratedReviews, ...existingProductReviews];
    localStorage.setItem(`tq_product_reviews_${activeProduct.id}`, JSON.stringify(updatedProductReviews));

    // Update Sales Count
    const overrides = JSON.parse(localStorage.getItem('tq_sales_count_overrides') || '{}');
    overrides[activeProduct.id] = targetSalesCount;
    localStorage.setItem('tq_sales_count_overrides', JSON.stringify(overrides));

    try {
      // Sync to Supabase Cloud
      await supabase.from('reviews').insert(
        newGeneratedReviews.map(r => ({
          id: r.id,
          product_id: r.productId,
          user_name: r.user_name,
          rating: r.rating,
          comment: r.comment
        }))
      );

      await supabase.from('products').update({
        sales_count: targetSalesCount,
        salesCount: targetSalesCount
      }).eq('id', activeProduct.id);

      // Broadcast Realtime Event
      await supabase.channel('public:products').send({
        type: 'broadcast',
        event: 'product_updated',
        payload: {
          id: activeProduct.id,
          salesCount: targetSalesCount
        }
      });
    } catch (err) {
      console.warn('Cloud synthetic review sync active');
    }

    setIsGenerating(false);
    if (onReviewsGenerated) onReviewsGenerated();

    addToast(`🤖 AI đã tạo tự động ${reviewCount} đánh giá ảo thực tế & cập nhật ${targetSalesCount} lượt mua cho "${activeProduct.title}"!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 text-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 transition rounded-full hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 shrink-0">
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-purple-500/40 shadow-lg">
            <Sparkles className="w-7 h-7 text-purple-400" />
          </div>
          <h3 className="text-lg font-black text-purple-400 uppercase tracking-wide flex items-center justify-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" /> AI TẠO ĐÁNH GIÁ ẢO & SỬA LƯỢT MUA
          </h3>
          <p className="text-xs text-slate-400 font-bold mt-1">
            Chức năng quản trị Super Admin Overlord
          </p>
        </div>

        <form onSubmit={handleGenerateFakeReviews} className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
          
          {/* Select Product */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Chọn Sản Phẩm Cần Tạo Đánh Giá Ảo:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-bold rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-purple-400"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.shopType}] {p.title} - Gian Hàng: {p.shopName}
                </option>
              ))}
            </select>
          </div>

          {/* Active Product Details Card */}
          {activeProduct && (
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
              <img src={activeProduct.img} alt={activeProduct.title} className="w-12 h-12 object-cover rounded-xl border border-slate-700" />
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-slate-100 text-xs truncate">{activeProduct.title}</h4>
                <p className="text-[10px] text-emerald-400 font-mono font-bold">
                  {activeProduct.price.toLocaleString('vi-VN')} đ • Lượt mua hiện tại: {activeProduct.salesCount || 12}
                </p>
              </div>
            </div>
          )}

          {/* Number of Fake Reviews */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Số Lượng Đánh Giá Ảo Cần Tự Động Sinh:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setReviewCount(num)}
                  className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                    reviewCount === num
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  +{num} Đánh Giá
                </button>
              ))}
            </div>
          </div>

          {/* Edit Sales Count simultaneously */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Cập Nhật Tổng Lượt Mua (Đã Bán) Sản Phẩm:
            </label>
            <input
              type="number"
              min="0"
              value={targetSalesCount}
              onChange={(e) => setTargetSalesCount(Number(e.target.value))}
              required
              placeholder="VD: 150, 350, 1200..."
              className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-sm font-black rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* AI Notice Banner */}
          <div className="bg-purple-950/40 border border-purple-500/30 p-3.5 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-purple-300 text-xs font-extrabold">
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Auto-Review Technology:
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed pl-5">
              • AI tự động tạo tên người mua thực tế, câu từ nhận xét phù hợp với đúng tên, danh mục (<strong>{activeProduct?.shopType}</strong>) và đặc tính sản phẩm.<br/>
              • Đánh giá xuất hiện minh bạch trong mục Đánh giá sản phẩm như khách thật mà <strong>KHÔNG làm tăng tài khoản rác</strong> trên hệ thống.
            </p>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            {isGenerating ? 'AI Đang Sinh Đánh Giá...' : `KÍCH HOẠT AI SINH ${reviewCount} ĐÁNH GIÁ ẢO & ĐỒNG BỘ`}
          </button>
        </form>

      </div>
    </div>
  );
};
