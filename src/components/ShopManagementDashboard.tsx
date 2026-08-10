import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import {
  Store,
  X,
  Package,
  ShoppingBag,
  DollarSign,
  PlusCircle,
  Trash2,
  CreditCard,
  Star
} from 'lucide-react';

interface ShopManagementDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddProductModal: () => void;
  products: Product[];
  onDeleteProduct: (prodId: string | number) => void;
}

export const ShopManagementDashboard: React.FC<ShopManagementDashboardProps> = ({
  isOpen,
  onClose,
  onOpenAddProductModal,
  products,
  onDeleteProduct
}) => {
  const { user } = useAuth();
  const { orders } = useCart();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'earnings' | 'reviews'>('products');

  // Withdrawal state
  const [bankName, setBankName] = useState('Vietcombank');
  const [accountNumber, setAccountNumber] = useState(user?.phone || '0367818343');
  const [accountName, setAccountName] = useState(user?.name || 'TÊN CHỦ TÀI KHOẢN');
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>(1000000);
  const [isRequestingWithdraw, setIsRequestingWithdraw] = useState(false);

  if (!isOpen || !user) return null;

  // Filter products belonging to this shop
  const shopProducts = products.filter(
    p => p.shopName.toLowerCase() === (user.name || '').toLowerCase() || p.shopName.includes(user.name || '')
  );

  // Calculate shop analytics
  const totalShopProductsCount = shopProducts.length;
  const shopOrders = orders.filter(o => o.items && o.items.length > 0);
  const totalShopRevenue = shopOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      addToast('Vui lòng nhập số tiền rút hợp lệ!', 'error');
      return;
    }

    setIsRequestingWithdraw(true);

    const withdrawReq = {
      id: `W_${Date.now()}`,
      shopName: user.name,
      amount: Number(withdrawAmount),
      bankName,
      stk: accountNumber,
      ownerName: accountName,
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'pending'
    };

    // Save to local storage withdrawals
    const saved = JSON.parse(localStorage.getItem('tq_withdrawals') || '[]');
    localStorage.setItem('tq_withdrawals', JSON.stringify([withdrawReq, ...saved]));

    try {
      // Sync to Supabase cloud
      await supabase.from('withdrawals').insert([
        {
          id: withdrawReq.id,
          shop_name: withdrawReq.shopName,
          amount: withdrawReq.amount,
          bank_name: withdrawReq.bankName,
          stk: withdrawReq.stk,
          owner_name: withdrawReq.ownerName,
          status: 'pending'
        }
      ]);
    } catch (e) {
      console.warn('Cloud withdrawal sync active');
    }

    setIsRequestingWithdraw(false);
    addToast(`💸 Đã gửi yêu cầu rút [${Number(withdrawAmount).toLocaleString('vi-VN')} đ] về STK ${bankName}!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-emerald-500/40 text-slate-100 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-emerald-500/30 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                📊 BẢNG QUẢN LÝ CỬA HÀNG (SHOP DASHBOARD)
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Gian hàng: <strong className="text-amber-400 underline">{user.name}</strong> • SĐT: {user.phone || user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddProductModal}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" /> + ĐĂNG SP MỚI
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Analytics Top Cards */}
        <div className="bg-slate-950/60 border-b border-slate-800 p-4 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Doanh Thu Cửa Hàng</span>
              <h4 className="text-sm font-black text-emerald-400 font-mono">{totalShopRevenue.toLocaleString('vi-VN')} đ</h4>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng Số Đơn Hàng</span>
              <h4 className="text-sm font-black text-blue-400 font-mono">{shopOrders.length} Đơn</h4>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Sản Phẩm Đang Bán</span>
              <h4 className="text-sm font-black text-amber-400 font-mono">{totalShopProductsCount} Mặt Hàng</h4>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-purple-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Đánh Giá Shop</span>
              <h4 className="text-sm font-black text-purple-400 font-mono">5.0 ⭐ (Rất Tốt)</h4>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950 px-6 border-b border-slate-800 flex space-x-2 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'products' ? 'border-emerald-400 text-emerald-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" /> 📦 Quản Lý Sản Phẩm ({totalShopProductsCount})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders' ? 'border-emerald-400 text-emerald-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> 🛍️ Đơn Hàng Cửa Hàng ({shopOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'earnings' ? 'border-emerald-400 text-emerald-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" /> 💰 Ví Doanh Thu & Rút Tiền
          </button>
        </div>

        {/* Tab Content Main Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar text-xs">
          
          {/* TAB 1: PRODUCTS LIST */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  DANH SÁCH MẶT HÀNG / DỊCH VỤ CỦA SHOP ({shopProducts.length})
                </h3>
                <button
                  onClick={onOpenAddProductModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 text-xs"
                >
                  <PlusCircle className="w-4 h-4" /> Đăng SP Mới
                </button>
              </div>

              {shopProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {shopProducts.map(p => (
                    <div key={p.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-32 bg-slate-900 rounded-xl overflow-hidden relative">
                          <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded">
                            {p.badge || p.shopType}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-100 line-clamp-1">{p.title}</h4>
                          <p className="text-emerald-400 font-black font-mono mt-0.5">
                            {p.price.toLocaleString('vi-VN')} đ
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{p.details}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-bold">Kho: {p.stock || 50}</span>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-[10px]"
                        >
                          <Trash2 className="w-3 h-3" /> Xóa SP
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-2">
                  <div className="text-3xl">📦</div>
                  <h4 className="font-bold text-slate-300">Chưa có sản phẩm nào được đăng!</h4>
                  <p className="text-[11px] text-slate-500">Bấm nút "Đăng SP Mới" ở góc trên để bắt đầu bán hàng.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SHOP ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-amber-400 uppercase">
                DANH SÁCH ĐƠN HÀNG KHÁCH ĐẶT CỬA HÀNG ({shopOrders.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <th className="p-3">Mã Đơn Hàng</th>
                      <th className="p-3">Khách Hàng</th>
                      <th className="p-3">SĐT Liên Hệ</th>
                      <th className="p-3 text-right">Tổng Tiền</th>
                      <th className="p-3 text-center">Thanh Toán</th>
                      <th className="p-3 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {shopOrders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-950/50">
                        <td className="p-3 font-mono font-bold text-amber-400">#{o.id}</td>
                        <td className="p-3 font-bold text-slate-100">{o.user_name || 'Khách Hàng TQ'}</td>
                        <td className="p-3 font-mono text-slate-300">{o.user_phone || '09xxxxxxxx'}</td>
                        <td className="p-3 text-right font-black text-emerald-400 font-mono">
                          {o.total_price.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-3 text-center uppercase font-bold text-blue-400 text-[10px]">
                          {o.payment_method === 'wallet' ? '💳 VÍ TQ PAY' : '💵 TIỀN MẶT'}
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold text-[9px]">
                            ✓ Hoàn Thành
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EARNINGS & WITHDRAWAL */}
          {activeTab === 'earnings' && (
            <div className="space-y-6 max-w-xl">
              <form onSubmit={handleRequestWithdrawal} className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> 💸 YÊU CẦU RÚT TIỀN DOANH THU VỀ NGÂN HÀNG
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tên Ngân Hàng Nhận</label>
                    <select
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2"
                    >
                      <option value="Vietcombank">Vietcombank (VCB)</option>
                      <option value="MBBank">MBBank (Ngân hàng Quân Đội)</option>
                      <option value="Techcombank">Techcombank (TCB)</option>
                      <option value="BIDV">BIDV</option>
                      <option value="Agribank">Agribank</option>
                      <option value="VPBank">VPBank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Số Tài Khoản (STK)</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tên Chủ Tài Khoản (In hoa không dấu)</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={e => setAccountName(e.target.value.toUpperCase())}
                      required
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-bold rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold mb-1">Số Tiền Muốn Rút (VNĐ)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value ? Number(e.target.value) : '')}
                      required
                      className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-black rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRequestingWithdraw}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-3 rounded-xl uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isRequestingWithdraw ? 'Đang Gửi Lệnh...' : 'XÁC NHẬN GỬI LỆNH RÚT TIỀN 14D'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
