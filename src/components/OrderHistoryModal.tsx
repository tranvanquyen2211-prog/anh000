import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ReviewModal } from './ReviewModal';
import { X, Package, Calendar, CheckCircle2, Clock, Star, Sparkles, MessageCircle } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWithShop?: (shopName: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose, onOpenChatWithShop }) => {
  const { orders } = useCart();
  const { user } = useAuth();

  const [selectedOrderForReview, setSelectedOrderForReview] = useState<{ id: string; name: string } | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<Record<string, boolean>>(() => {
    return JSON.parse(localStorage.getItem('tq_order_reviews') || '{}');
  });

  if (!isOpen) return null;

  const handleReviewSubmitted = (orderId: string) => {
    setReviewedOrders(prev => ({
      ...prev,
      [orderId]: true
    }));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-navy-dark/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-gray-100 my-8 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-navy p-1 transition rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 shrink-0">
            <div className="w-10 h-10 bg-navy text-amber-400 rounded-xl flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-navy">Lịch Sử Đơn Hàng Của Bạn</h3>
              <p className="text-xs text-gray-500">
                Tài khoản: <strong className="text-navy">{user?.name || user?.email}</strong> • TÍCH TQ XU & ĐÁNH GIÁ ĐƠN
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
            {orders.length > 0 ? (
              orders.map(order => {
                const isReviewed = Boolean(reviewedOrders[order.id]);
                const firstProductName = order.items?.[0]?.product_name || 'Sản phẩm TQ Store';

                return (
                  <div key={order.id} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/80 space-y-3 shadow-xs">
                    <div className="flex flex-wrap justify-between items-center text-xs border-b border-gray-200/80 pb-2.5">
                      <div>
                        <span className="font-extrabold text-navy font-mono">Mã đơn: #{order.id}</span>
                        <span className="text-gray-400 ml-3 inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString('vi-VN')} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đặt hàng thành công
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-100 text-xs">
                          <div className="flex items-center gap-2.5">
                            {item.img && <img src={item.img} className="w-10 h-10 object-cover rounded-lg border" />}
                            <div>
                              <h4 className="font-extrabold text-navy">{item.product_name}</h4>
                              <p className="text-[10px] text-gray-400">
                                Số lượng: <strong className="text-gray-700">{item.quantity}</strong> | Đơn giá: <span className="text-orange font-bold">{item.price.toLocaleString('vi-VN')} đ</span>
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-navy">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer & Actions */}
                    <div className="flex flex-wrap justify-between items-center gap-2 text-xs pt-2 border-t border-gray-200/60">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-[11px]">
                          PTTT: <strong className="uppercase text-navy">{order.payment_method}</strong>
                        </span>

                        {onOpenChatWithShop && (
                          <button
                            onClick={() => onOpenChatWithShop('TQ Store')}
                            className="bg-navy/10 hover:bg-navy/20 text-navy text-[10px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3 text-navy" /> Chat Gian Hàng
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-gray-600 mr-2 text-[11px]">Tổng tiền:</span>
                          <strong className="text-orange font-black text-sm">{order.total_price.toLocaleString('vi-VN')} đ</strong>
                        </div>

                        {/* Review Order Button */}
                        {isReviewed ? (
                          <span className="bg-amber-100 text-amber-800 font-extrabold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 border border-amber-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> ⭐ Đã Đánh Giá (+100 Xu)
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedOrderForReview({ id: order.id, name: firstProductName })}
                            className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-[11px] uppercase tracking-wide transition shadow-sm cursor-pointer flex items-center gap-1 border border-amber-300"
                          >
                            <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" /> Đánh Giá & Nhận Xu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-gray-400 space-y-2">
                <Clock className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-600">Bạn chưa có đơn hàng nào.</p>
                <p className="text-xs text-gray-400">Hãy khám phá các sản phẩm và trải nghiệm mua sắm ngay!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedOrderForReview && (
        <ReviewModal
          isOpen={Boolean(selectedOrderForReview)}
          onClose={() => setSelectedOrderForReview(null)}
          orderId={selectedOrderForReview.id}
          productName={selectedOrderForReview.name}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
};
