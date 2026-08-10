import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    toggleItemSelection,
    toggleSelectAll,
    totalItemsCount,
    selectedItemsCount,
    subtotalPrice
  } = useCart();

  if (!isOpen) return null;

  const isAllSelected = cart.length > 0 && cart.every(i => i.selected !== false);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-navy-dark/70 backdrop-blur-xs">
      <div className="absolute inset-0 overflow-hidden" onClick={onClose}>
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div
            className="pointer-events-auto w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 bg-navy text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange" />
                <h3 className="font-extrabold text-base">Giỏ hàng của bạn ({totalItemsCount})</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length > 0 ? (
                <>
                  {/* Select All Row */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 bg-gray-50 p-3 rounded-xl">
                    <label className="flex items-center gap-2.5 text-xs font-bold text-navy cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={e => toggleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-navy rounded border-gray-300 focus:ring-navy cursor-pointer"
                      />
                      <span>Chọn tất cả ({cart.length} món)</span>
                    </label>
                    <span className="text-xs text-gray-500 font-semibold">
                      Đã chọn: <strong className="text-orange">{selectedItemsCount}</strong> món
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cart.map((item) => (
                      <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                        <input
                          type="checkbox"
                          checked={item.selected !== false}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-4 h-4 text-navy rounded border-gray-300 focus:ring-navy shrink-0 cursor-pointer"
                        />
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-xs text-navy truncate">{item.title}</h4>
                          <p className="text-[10px] text-gray-400 font-semibold">{item.shopName}</p>
                          <p className="text-orange font-black text-xs mt-0.5">
                            {item.price.toLocaleString('vi-VN')} VNĐ
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-gray-50">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-2 py-1 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-extrabold text-navy">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-2 py-1 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-rose-600 p-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">🛒</div>
                  <p className="text-sm font-semibold text-gray-600">Giỏ hàng hiện tại đang trống.</p>
                  <p className="text-xs text-gray-400">Hãy chọn sản phẩm yêu thích và thêm vào giỏ!</p>
                </div>
              )}
            </div>

            {/* Footer Checkout Summary */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3">
                <div className="flex justify-between items-center text-sm font-extrabold text-navy">
                  <span>Tạm tính ({selectedItemsCount} món):</span>
                  <span className="text-orange text-base font-black">
                    {subtotalPrice.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  disabled={selectedItemsCount === 0}
                  className="w-full bg-orange hover:bg-orange-hover text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  Tiến Hành Đặt Hàng <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
