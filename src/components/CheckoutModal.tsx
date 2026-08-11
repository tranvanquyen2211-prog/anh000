import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme, DEFAULT_MASTER_SWITCHES } from '../context/ThemeContext';
import type { Voucher } from '../types';
import { X, CheckCircle, CreditCard, Wallet, Truck, ShieldCheck, MapPin, Ticket, AlertCircle, Check } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, subtotalPrice, checkout } = useCart();
  const { user } = useAuth();
  const { theme } = useTheme();

  const masterSwitches = theme.masterSwitches || DEFAULT_MASTER_SWITCHES;
  const isWalletEnabled = masterSwitches.enableWalletPayment !== false;
  const isCodEnabled = masterSwitches.enableCODPayment !== false;
  const isVietQREnabled = masterSwitches.enableVietQRPayment !== false;
  const isVoucherEnabled = masterSwitches.enableVoucherDiscounts !== false;

  const selectedItems = cart.filter(i => i.selected !== false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash' | 'transfer'>(() => {
    if (isWalletEnabled) return 'wallet';
    if (isVietQREnabled) return 'transfer';
    if (isCodEnabled) return 'cash';
    return 'wallet';
  });
  const [address, setAddress] = useState('123 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voucher application state
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyVoucher = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVoucherError(null);

    if (!isVoucherEnabled) {
      setVoucherError('🔒 Super Admin đã khóa tính năng áp dụng Mã giảm giá Voucher trên toàn hệ thống!');
      return;
    }

    const codeUpper = voucherCodeInput.trim().toUpperCase();
    if (!codeUpper) return;

    const savedVouchers: Voucher[] = JSON.parse(localStorage.getItem('tq_vouchers') || '[]');
    const found = savedVouchers.find(v => v.code.toUpperCase() === codeUpper);

    if (!found) {
      setVoucherError(`❌ Mã giảm giá "${codeUpper}" không tồn tại trên hệ thống!`);
      return;
    }

    if (found.status !== 'active') {
      setVoucherError(`🔒 Mã giảm giá "${codeUpper}" hiện đang bị khóa!`);
      return;
    }

    if (found.totalUsageLimit > 0 && (found.usedCount || 0) >= found.totalUsageLimit) {
      setVoucherError(`⚠️ Mã giảm giá "${codeUpper}" đã hết lượt sử dụng (${found.usedCount}/${found.totalUsageLimit})!`);
      return;
    }

    if (found.minOrderAmount && subtotalPrice < found.minOrderAmount) {
      setVoucherError(`⚠️ Mã này chỉ áp dụng cho đơn hàng từ ${found.minOrderAmount.toLocaleString('vi-VN')} VNĐ!`);
      return;
    }

    // Required Payment Method Verification
    if (found.requiredPaymentMethod === 'WALLET' && paymentMethod !== 'wallet') {
      setVoucherError(`⚠️ Mã "${codeUpper}" BẮT BUỘC thanh toán qua Ví TQ Pay mới được giảm!`);
      return;
    }
    if (found.requiredPaymentMethod === 'VIETQR' && paymentMethod !== 'transfer') {
      setVoucherError(`⚠️ Mã "${codeUpper}" BẮT BUỘC thanh toán Chuyển khoản VietQR mới được giảm!`);
      return;
    }
    if (found.requiredPaymentMethod === 'COD' && paymentMethod !== 'cash') {
      setVoucherError(`⚠️ Mã "${codeUpper}" BẮT BUỘC thanh toán Tiền mặt COD mới được giảm!`);
      return;
    }

    setAppliedVoucher(found);
    setVoucherError(null);
  };

  // Compute discount amount
  let voucherDiscountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'percent') {
      const calc = Math.round(subtotalPrice * (appliedVoucher.discountValue / 100));
      voucherDiscountAmount = appliedVoucher.maxDiscountAmount ? Math.min(calc, appliedVoucher.maxDiscountAmount) : calc;
    } else {
      voucherDiscountAmount = Math.min(appliedVoucher.discountValue, subtotalPrice);
    }
  }

  const finalTotalPrice = Math.max(0, subtotalPrice - voucherDiscountAmount);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    if (paymentMethod === 'wallet' && !isWalletEnabled) {
      alert('🔒 Super Admin đã tạm khóa phương thức Thanh Toán Ví TQ Pay trên toàn hệ thống!');
      return;
    }
    if (paymentMethod === 'cash' && !isCodEnabled) {
      alert('🔒 Super Admin đã tạm khóa phương thức Thanh Toán COD trên toàn hệ thống!');
      return;
    }
    if (paymentMethod === 'transfer' && !isVietQREnabled) {
      alert('🔒 Super Admin đã tạm khóa phương thức Chuyển Khoản Ngân Hàng VietQR trên toàn hệ thống!');
      return;
    }

    // Re-verify required payment method for applied voucher before final checkout
    if (appliedVoucher) {
      if (appliedVoucher.requiredPaymentMethod === 'WALLET' && paymentMethod !== 'wallet') {
        alert(`⚠️ Mã "${appliedVoucher.code}" BẮT BUỘC chọn thanh toán qua Ví TQ Pay!`);
        return;
      }
      if (appliedVoucher.requiredPaymentMethod === 'VIETQR' && paymentMethod !== 'transfer') {
        alert(`⚠️ Mã "${appliedVoucher.code}" BẮT BUỘC chọn thanh toán Chuyển khoản VietQR!`);
        return;
      }
      if (appliedVoucher.requiredPaymentMethod === 'COD' && paymentMethod !== 'cash') {
        alert(`⚠️ Mã "${appliedVoucher.code}" BẮT BUỘC chọn thanh toán Tiền mặt COD!`);
        return;
      }
    }

    setIsSubmitting(true);
    const success = await checkout(paymentMethod, address);
    setIsSubmitting(false);

    if (success) {
      // Increment voucher usage count
      if (appliedVoucher) {
        const savedVouchers: Voucher[] = JSON.parse(localStorage.getItem('tq_vouchers') || '[]');
        const updatedVouchers = savedVouchers.map(v => {
          if (v.id === appliedVoucher.id || v.code === appliedVoucher.code) {
            return { ...v, usedCount: (v.usedCount || 0) + 1 };
          }
          return v;
        });
        localStorage.setItem('tq_vouchers', JSON.stringify(updatedVouchers));
      }
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
                className={`flex items-center justify-between p-3 border rounded-2xl transition ${
                  !isWalletEnabled ? 'opacity-50 bg-gray-100 border-gray-300 cursor-not-allowed' : paymentMethod === 'wallet' ? 'border-emerald-500 bg-emerald-50/70 shadow-xs cursor-pointer' : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    disabled={!isWalletEnabled}
                    checked={paymentMethod === 'wallet'}
                    onChange={() => isWalletEnabled && setPaymentMethod('wallet')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-extrabold text-xs text-navy block flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Ví số dư TQ Pay
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {isWalletEnabled ? 'Ưu đãi giảm 2% trực tiếp' : '🔒 Super Admin đã tạm khóa phương thức này'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  {(user?.walletBalance || 0).toLocaleString('vi-VN')} đ
                </span>
              </label>

              <label
                className={`flex items-center justify-between p-3 border rounded-2xl transition ${
                  !isCodEnabled ? 'opacity-50 bg-gray-100 border-gray-300 cursor-not-allowed' : paymentMethod === 'cash' ? 'border-navy bg-navy/5 shadow-xs cursor-pointer' : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    disabled={!isCodEnabled}
                    checked={paymentMethod === 'cash'}
                    onChange={() => isCodEnabled && setPaymentMethod('cash')}
                    className="text-navy focus:ring-navy"
                  />
                  <div>
                    <span className="font-extrabold text-xs text-navy flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-navy" /> Thanh toán tiền mặt khi nhận hàng (COD)
                    </span>
                    {!isCodEnabled && (
                      <span className="text-[10px] text-rose-600 font-bold block">🔒 Super Admin đã tạm khóa COD toàn sàn</span>
                    )}
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center justify-between p-3 border rounded-2xl transition ${
                  !isVietQREnabled ? 'opacity-50 bg-gray-100 border-gray-300 cursor-not-allowed' : paymentMethod === 'transfer' ? 'border-navy bg-navy/5 shadow-xs cursor-pointer' : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    disabled={!isVietQREnabled}
                    checked={paymentMethod === 'transfer'}
                    onChange={() => isVietQREnabled && setPaymentMethod('transfer')}
                    className="text-navy focus:ring-navy"
                  />
                  <div>
                    <span className="font-extrabold text-xs text-navy flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-navy" /> Chuyển khoản Ngân hàng (VietQR)
                    </span>
                    {!isVietQREnabled && (
                      <span className="text-[10px] text-rose-600 font-bold block">🔒 Super Admin đã tạm khóa Chuyển khoản VietQR</span>
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Voucher Coupon Section */}
          <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-rose-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Ticket className="w-4 h-4 text-rose-600" /> Mã Giảm Giá Voucher
              </label>
              {!isVoucherEnabled && (
                <span className="text-[10px] text-rose-600 font-bold">🔒 Super Admin đã khóa dùng Voucher</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCodeInput}
                onChange={e => {
                  setVoucherCodeInput(e.target.value);
                  setVoucherError(null);
                }}
                placeholder="Nhập mã voucher (VD: TQVIP100K)..."
                disabled={!isVoucherEnabled}
                className="flex-1 bg-white border border-rose-200 text-slate-800 font-mono font-bold rounded-xl px-3 py-2 text-xs uppercase focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => handleApplyVoucher()}
                disabled={!isVoucherEnabled || !voucherCodeInput.trim()}
                className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow cursor-pointer disabled:opacity-50 shrink-0"
              >
                Áp Dụng
              </button>
            </div>

            {/* Applied Voucher Success Badge */}
            {appliedVoucher && (
              <div className="bg-emerald-500/15 border border-emerald-500/40 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                <div className="flex items-center gap-2 min-w-0">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="truncate block">Đã áp dụng mã: <strong className="font-mono text-emerald-700">{appliedVoucher.code}</strong></span>
                    <span className="text-[10px] text-emerald-600 block font-normal truncate">{appliedVoucher.description}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedVoucher(null);
                    setVoucherCodeInput('');
                  }}
                  className="text-rose-500 hover:underline text-[10px] font-bold cursor-pointer shrink-0 ml-2"
                >
                  Gỡ bỏ
                </button>
              </div>
            )}

            {/* Voucher Error Warning Notice */}
            {voucherError && (
              <div className="bg-rose-100 text-rose-700 p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border border-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{voucherError}</span>
              </div>
            )}
          </div>

          {/* Price Calculation */}
          <div className="bg-gray-100 p-4 rounded-2xl space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính:</span>
              <span className="font-bold">{subtotalPrice.toLocaleString('vi-VN')} đ</span>
            </div>

            {appliedVoucher && voucherDiscountAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Giảm giá Voucher ({appliedVoucher.code}):</span>
                <span className="font-mono">-{voucherDiscountAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            )}

            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Phí vận chuyển:</span>
              <span>Miễn phí 0 đ</span>
            </div>

            <div className="flex justify-between text-sm font-black text-navy pt-2 border-t border-gray-200">
              <span>Tổng cộng thanh toán:</span>
              <span className="text-orange text-base font-black">
                {finalTotalPrice.toLocaleString('vi-VN')} VNĐ
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
