import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle, CreditCard, Wallet, Truck, ShieldCheck, MapPin } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, subtotalPrice, checkout } = useCart();
  const { user } = useAuth();

  const selectedItems = cart.filter(i => i.selected !== false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash' | 'transfer'>('wallet');
  const [address, setAddress] = useState('123 Tôn Đức Thắng, Phường Ben Nghé, Quận 1, TP. Hồ Chí Minh');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsSubmitting(true);
    const success = await checkout(paymentMethod, address);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-dark/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-gray-100 my-8 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-navy p-1 transition rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-navy">Xác Nhận Đặt Hàng</h3>
          <p className="text-xs text-gray-500 mt-1">Lưu dữ liệu trực tiếp vào hệ thống Supabase Realtime</p>
        </div>

        <form onSubmit={handleOrderSubmit} className="space-y-5">
          {/* Items Summary */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            <h4 className="text-xs font-black text-navy uppercase tracking-wider mb-1">
              Sản phẩm mua ({selectedItems.length})
            </h4>
            {selectedItems.map(item => (
              <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-200/60 last:border-0">
                <span className="font-bold text-gray-800 truncate max-w-[240px]">
                  {item.title} <span className="text-gray-400 font-normal">x{item.quantity}</span>
                </span>
                <span className="font-black text-orange shrink-0">
                  {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                </span>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange" /> Địa chỉ giao hàng
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              placeholder="Nhập địa chỉ giao nhận..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Hình thức thanh toán</label>
            <div className="space-y-2">
              <label
                className={`flex items-center justify-between p-3 border rounded-2xl cursor-pointer transition ${
                  paymentMethod === 'wallet' ? 'border-emerald-500 bg-emerald-50/70 shadow-xs' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-extrabold text-xs text-navy block flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Ví số dư TQ Pay
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Ưu đãi giảm 2% trực tiếp</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  {(user?.walletBalance || 0).toLocaleString('vi-VN')} đ
                </span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 border rounded-2xl cursor-pointer transition ${
                  paymentMethod === 'cash' ? 'border-navy bg-navy/5 shadow-xs' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="text-navy focus:ring-navy"
                />
                <span className="font-extrabold text-xs text-navy flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-navy" /> Thanh toán tiền mặt khi nhận hàng (COD)
                </span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 border rounded-2xl cursor-pointer transition ${
                  paymentMethod === 'transfer' ? 'border-navy bg-navy/5 shadow-xs' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="transfer"
                  checked={paymentMethod === 'transfer'}
                  onChange={() => setPaymentMethod('transfer')}
                  className="text-navy focus:ring-navy"
                />
                <span className="font-extrabold text-xs text-navy flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-navy" /> Chuyển khoản Ngân hàng (VietQR)
                </span>
              </label>
            </div>
          </div>

          {/* Price Calculation */}
          <div className="bg-gray-100 p-4 rounded-2xl space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính:</span>
              <span className="font-bold">{subtotalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Phí vận chuyển:</span>
              <span>Miễn phí 0 đ</span>
            </div>
            <div className="flex justify-between text-sm font-black text-navy pt-2 border-t border-gray-200">
              <span>Tổng cộng thanh toán:</span>
              <span className="text-orange text-base font-black">
                {subtotalPrice.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange hover:bg-orange-hover text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {isSubmitting ? 'Đang gửi thông tin đơn...' : 'Xác Nhận Đặt Hàng Ngay'}
          </button>
        </form>
      </div>
    </div>
  );
};
