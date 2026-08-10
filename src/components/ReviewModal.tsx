import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { X, Star, Sparkles, Send } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  productName: string;
  onReviewSubmitted: (orderId: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  productName,
  onReviewSubmitted
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast('Vui lòng nhập nhận xét/đánh giá sản phẩm!', 'error');
      return;
    }

    setIsSubmitting(true);

    const reviewObj = {
      id: `REV_${Date.now()}`,
      orderId,
      user_name: user.name,
      user_phone: user.phone,
      rating,
      comment: comment.trim(),
      created_at: new Date().toISOString()
    };

    // Save locally
    const savedReviews = JSON.parse(localStorage.getItem('tq_order_reviews') || '{}');
    savedReviews[orderId] = reviewObj;
    localStorage.setItem('tq_order_reviews', JSON.stringify(savedReviews));

    // Award +100 TQ Coins to user profile
    const currentCoins = user.coins || 500;
    const newCoins = currentCoins + 100;
    const updatedUser = { ...user, coins: newCoins };
    localStorage.setItem('tq_user_profile', JSON.stringify(updatedUser));

    try {
      await supabase.from('reviews').insert([
        {
          id: reviewObj.id,
          order_id: orderId,
          user_name: user.name,
          rating,
          comment: comment.trim()
        }
      ]);
    } catch (e) {
      console.warn('Cloud review sync active');
    }

    setIsSubmitting(false);
    onReviewSubmitted(orderId);
    addToast(`🎉 Đánh giá thành công! Bạn nhận được +100 TQ Xu thưởng vào ví!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-gray-100 animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-navy p-1 transition rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
          </div>
          <h3 className="text-xl font-black text-navy uppercase tracking-wide">ĐÁNH GIÁ SẢN PHẨM & ĐƠN HÀNG</h3>
          <p className="text-xs text-gray-500 font-bold mt-1 max-w-xs mx-auto line-clamp-1">
            Đơn #{orderId} • <span className="text-navy">{productName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Stars Selection */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <label className="text-xs font-bold text-gray-600">Chọn số sao đánh giá sản phẩm:</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-black text-amber-600">
              {rating === 5 ? '⭐⭐⭐⭐⭐ Rất Hài Lòng' : rating === 4 ? '⭐⭐⭐⭐ Hài Lòng' : rating === 3 ? '⭐⭐⭐ Bình Thường' : '⭐⭐ Không Hài Lòng'}
            </span>
          </div>

          {/* Comment Rich Text Area */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nhận xét chi tiết của bạn:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              required
              placeholder="Chất lượng sản phẩm rất tuyệt vời, giao hàng siêu nhanh, shop phục vụ chu đáo..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition resize-none"
            />
          </div>

          {/* Reward Bonus Badge */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-navy block">Thưởng Tích Xu Mua Sắm</span>
                <span className="text-[10px] text-amber-700 font-semibold">Tự động +100 TQ Xu khi gửi đánh giá</span>
              </div>
            </div>
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
              +100 XU
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-slate-950" />
            {isSubmitting ? 'Đang Gửi Đánh Giá...' : 'GỬI ĐÁNH GIÁ & NHẬN +100 TQ XU'}
          </button>
        </form>

      </div>
    </div>
  );
};
