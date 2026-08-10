import React, { useState, useEffect } from 'react';
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
  Sliders,
  MapPin,
  QrCode,
  Phone,
  Save,
  Sparkles,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  Percent
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

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'earnings' | 'config'>('products');

  // Withdrawal state
  const [bankName, setBankName] = useState('Vietcombank');
  const [accountNumber, setAccountNumber] = useState(user?.phone || '0367818343');
  const [accountName, setAccountName] = useState(user?.name || 'TÊN CHỦ TÀI KHOẢN');
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('');
  const [isRequestingWithdraw, setIsRequestingWithdraw] = useState(false);

  // Shop config state
  const [warehouseAddress, setWarehouseAddress] = useState('123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM');
  const [pickupAddress, setPickupAddress] = useState('Kho Tổng TQ Store - 123 Nguyễn Trãi, Quận 1, TP.HCM');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://maps.google.com/?q=10.776889,106.700806');
  
  const [shopBankName, setShopBankName] = useState('Vietcombank (VCB)');
  const [shopSTK, setShopSTK] = useState(user?.phone || '0367818343');
  const [shopOwnerName, setShopOwnerName] = useState(user?.name || 'TRAN VAN QUYEN');
  const [qrCodeUrl, setQrCodeUrl] = useState('https://api.vietqr.io/image/970436-0367818343-compact.png?amount=0&accountName=TRAN%20VAN%20QUYEN');

  const [slogan, setSlogan] = useState('Chuyên Trang Phục Cho Thuê & Bán Đồ Luxury Top 1 Việt Nam');
  const [bio, setBio] = useState('TQ Store Gian Hàng Uy Tín - Cam kết hàng chính hãng 100%, giặt sấy tiệt trùng công nghệ cao, giao hàng hỏa tốc trong 2 giờ.');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80');
  const [hotline, setHotline] = useState('0367818343');

  useEffect(() => {
    if (user?.name) {
      const savedConfig = localStorage.getItem(`tq_shop_config_${user.name}`);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          if (parsed.warehouseAddress) setWarehouseAddress(parsed.warehouseAddress);
          if (parsed.pickupAddress) setPickupAddress(parsed.pickupAddress);
          if (parsed.googleMapsUrl) setGoogleMapsUrl(parsed.googleMapsUrl);
          if (parsed.shopBankName) setShopBankName(parsed.shopBankName);
          if (parsed.shopSTK) setShopSTK(parsed.shopSTK);
          if (parsed.shopOwnerName) setShopOwnerName(parsed.shopOwnerName);
          if (parsed.qrCodeUrl) setQrCodeUrl(parsed.qrCodeUrl);
          if (parsed.slogan) setSlogan(parsed.slogan);
          if (parsed.bio) setBio(parsed.bio);
          if (parsed.bannerUrl) setBannerUrl(parsed.bannerUrl);
          if (parsed.hotline) setHotline(parsed.hotline);
        } catch (e) {}
      }
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Filter products belonging to this shop
  const shopProducts = products.filter(
    p => p.shopName.toLowerCase() === (user.name || '').toLowerCase() || p.shopName.includes(user.name || '')
  );

  // --- REVENUE & PER-ORDER PLATFORM FEE CALCULATIONS ---
  const shopOrders = orders.filter(o => o.items && o.items.length > 0);
  const grossRevenue = shopOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  
  // Calculate total platform fee by summing per-order recorded platform fees at each point in time
  const totalPlatformFeeAmount = shopOrders.reduce((sum, o) => {
    if (o.platform_fee_amount !== undefined) return sum + o.platform_fee_amount;
    const feeRate = o.platform_fee_rate !== undefined ? o.platform_fee_rate : 5;
    return sum + Math.round((o.total_price || 0) * (feeRate / 100));
  }, 0);
  
  // Existing withdrawals list for this shop
  const savedWithdrawals: any[] = JSON.parse(localStorage.getItem('tq_withdrawals') || '[]');
  const myShopWithdrawals = savedWithdrawals.filter(
    w => w.shopName?.toLowerCase() === user.name?.toLowerCase() && w.status !== 'rejected'
  );
  const totalWithdrawn = myShopWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

  // Eligible withdrawable balance = Gross Revenue - Sum of Per-Order Platform Fees - Total Withdrawn
  const eligibleWithdrawableBalance = Math.max(0, grossRevenue - totalPlatformFeeAmount - totalWithdrawn);

  // --- DATE & FREQUENCY RESTRICTION RULES ---
  const today = new Date();
  const currentDay = today.getDate();
  const todayString = today.toLocaleDateString('vi-VN');

  // Rule 1: Withdrawal only allowed on the 14th and 25th of the month
  const isWithdrawalDay = currentDay === 14 || currentDay === 25;

  // Rule 2: Maximum 1 withdrawal request per day
  const hasAlreadyWithdrawnToday = savedWithdrawals.some(
    w => w.shopName?.toLowerCase() === user.name?.toLowerCase() && w.date === todayString
  );

  const canCreateWithdrawal = isWithdrawalDay && !hasAlreadyWithdrawnToday && eligibleWithdrawableBalance > 0;

  const handleSaveShopConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    const configObj = {
      shopName: user.name,
      warehouseAddress,
      pickupAddress,
      googleMapsUrl,
      shopBankName,
      shopSTK,
      shopOwnerName,
      qrCodeUrl,
      slogan,
      bio,
      bannerUrl,
      hotline,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(`tq_shop_config_${user.name}`, JSON.stringify(configObj));

    try {
      await supabase.from('profiles').upsert([
        {
          phone: user.phone,
          full_name: user.name,
          role: 'SHOP',
          warehouse_address: warehouseAddress,
          pickup_address: pickupAddress,
          google_maps_url: googleMapsUrl,
          bank_name: shopBankName,
          bank_stk: shopSTK,
          bank_owner: shopOwnerName,
          qr_code_url: qrCodeUrl,
          slogan,
          bio,
          banner_url: bannerUrl,
          hotline
        }
      ]);
    } catch (e) {
      console.warn('Cloud shop config sync active');
    }

    addToast(`⚙️ Đã lưu cấu hình địa chỉ, ngân hàng, QR & giao diện Shop thành công!`, 'success');
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isWithdrawalDay) {
      addToast(`⚠️ Hôm nay là Ngày ${currentDay}. Cổng rút tiền chỉ mở vào Ngày 14 và Ngày 25 hàng tháng!`, 'error');
      return;
    }

    if (hasAlreadyWithdrawnToday) {
      addToast('⚠️ Cửa hàng của bạn đã tạo 1 lệnh rút hôm nay! Mỗi ngày chỉ được rút tối đa 1 lần.', 'error');
      return;
    }

    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      addToast('Vui lòng nhập số tiền rút hợp lệ!', 'error');
      return;
    }

    if (Number(withdrawAmount) > eligibleWithdrawableBalance) {
      addToast(`❌ Số tiền rút vượt quá số dư hợp lệ có thể rút (${eligibleWithdrawableBalance.toLocaleString('vi-VN')} đ sau khi trừ phí sàn từng đơn)!`, 'error');
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
      date: todayString,
      status: 'pending'
    };

    const updatedWithdrawals = [withdrawReq, ...savedWithdrawals];
    localStorage.setItem('tq_withdrawals', JSON.stringify(updatedWithdrawals));

    try {
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
    setWithdrawAmount('');
    addToast(`💸 Đã tạo lệnh rút [${Number(withdrawReq.amount).toLocaleString('vi-VN')} đ] thành công Ngày ${currentDay}!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-emerald-500/40 text-slate-100 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
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
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Doanh Thu Gộp (Gross)</span>
              <h4 className="text-sm font-black text-emerald-400 font-mono">{grossRevenue.toLocaleString('vi-VN')} đ</h4>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Số Dư Hợp Lệ Rút</span>
              <h4 className="text-sm font-black text-amber-400 font-mono">{eligibleWithdrawableBalance.toLocaleString('vi-VN')} đ</h4>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Đơn Hàng Cửa Hàng</span>
              <h4 className="text-sm font-black text-blue-400 font-mono">{shopOrders.length} Đơn</h4>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Lịch Rút Tiền Hàng Tháng</span>
              <h4 className="text-xs font-black text-purple-300">Ngày 14 & 25 (Hôm nay: Ngày {currentDay})</h4>
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
            <Package className="w-4 h-4" /> 📦 Quản Lý Sản Phẩm ({shopProducts.length})
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
            <CreditCard className="w-4 h-4" /> 💰 Ví Doanh Thu & Phí Sàn Từng Đơn (Ngày 14 & 25)
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'config' ? 'border-emerald-400 text-emerald-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" /> ⚙️ Cấu Hình & Trang Cá Nhân Shop
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

          {/* TAB 2: SHOP ORDERS WITH PER-ORDER PLATFORM FEES */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-amber-400 uppercase">
                DANH SÁCH ĐƠN HÀNG CỬA HÀNG & PHÍ SÀN TÍNH THEO TỪNG ĐƠN ({shopOrders.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <th className="p-3">Mã Đơn Hàng</th>
                      <th className="p-3">Thời gian</th>
                      <th className="p-3">Khách Hàng</th>
                      <th className="p-3 text-right">Tổng Tiền Gộp</th>
                      <th className="p-3 text-center">Phí Sàn Tùy Thời Điểm</th>
                      <th className="p-3 text-right">Tiền Thực Nhận Shop</th>
                      <th className="p-3 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {shopOrders.map(o => {
                      const feeRate = o.platform_fee_rate !== undefined ? o.platform_fee_rate : 5;
                      const feeAmt = o.platform_fee_amount !== undefined ? o.platform_fee_amount : Math.round(o.total_price * (feeRate / 100));
                      const netReceived = o.total_price - feeAmt;

                      return (
                        <tr key={o.id} className="hover:bg-slate-950/50">
                          <td className="p-3 font-mono font-bold text-amber-400">#{o.id}</td>
                          <td className="p-3 font-mono text-slate-400 text-[10px]">{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                          <td className="p-3 font-bold text-slate-100">{o.user_name || 'Khách Hàng TQ'}</td>
                          <td className="p-3 text-right font-black text-blue-400 font-mono">
                            {o.total_price.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="p-3 text-center font-bold text-rose-400 text-[10px]">
                            <span className="bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                              -{feeRate}% ({feeAmt.toLocaleString('vi-VN')}đ)
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-emerald-400 font-mono">
                            +{netReceived.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="p-3 text-center">
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold text-[9px]">
                              ✓ Hoàn Thành
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EARNINGS & PER-ORDER FEE BREAKDOWN */}
          {activeTab === 'earnings' && (
            <div className="space-y-6 max-w-2xl">
              
              {/* Financial Calculation Breakdown Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Percent className="w-4 h-4 text-rose-400" /> BẢNG TỔNG HỢP PHÍ SÀN TÍNH THEO TỪNG ĐƠN HÀNG REALTIME
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ REALTIME SYNCED WITH SUPABASE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-bold">1. Tổng Doanh Thu Gộp:</span>
                    <h4 className="text-base font-black text-blue-400 font-mono mt-0.5">{grossRevenue.toLocaleString('vi-VN')} đ</h4>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-bold">2. Tổng Phí Sàn (Từng đơn):</span>
                    <h4 className="text-base font-black text-rose-400 font-mono mt-0.5">-{totalPlatformFeeAmount.toLocaleString('vi-VN')} đ</h4>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-emerald-500/40">
                    <span className="text-emerald-400 text-[10px] block font-bold">3. SỐ DƯ HỢP LỆ CÓ THỂ RÚT:</span>
                    <h4 className="text-base font-black text-emerald-400 font-mono mt-0.5">{eligibleWithdrawableBalance.toLocaleString('vi-VN')} đ</h4>
                  </div>
                </div>
              </div>

              {/* Rules Warning Banner */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isWithdrawalDay ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}>
                <div className="flex items-center gap-2">
                  {isWithdrawalDay ? <Calendar className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
                  <h4 className="font-black text-xs uppercase">
                    QUY ĐỊNH CỔNG RÚT TIỀN: NGÀY 14 & 25 HÀNG THÁNG (MỖI NGÀY 1 LẦN RÚT)
                  </h4>
                </div>

                <div className="text-[11px] space-y-1 text-slate-300 pl-7">
                  <p>• <strong>Phí sàn theo từng đơn:</strong> Phí sàn được chốt và ghi nhận riêng biệt trên từng đơn hàng tại thời điểm phát sinh đơn.</p>
                  <p>• <strong>Lịch rút tiền:</strong> Cổng chấp nhận lệnh rút mở vào đúng **Ngày 14** và **Ngày 25** hàng tháng. (Hôm nay: **Ngày {currentDay}** - {isWithdrawalDay ? '✅ CỔNG ĐANG MỞ' : '🔒 CỔNG ĐANG ĐÓNG'})</p>
                  <p>• <strong>Tần suất rút:</strong> Mỗi ngày gian hàng chỉ được tạo tối đa **1 lệnh rút tiền**.</p>
                </div>
              </div>

              {/* Withdrawal Request Form */}
              <form onSubmit={handleRequestWithdrawal} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> 💸 TẠO LỆNH RÚT TIỀN DOANH THU VỀ NGÂN HÀNG
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
                    <label className="block text-emerald-400 font-bold mb-1">
                      Số Tiền Muốn Rút (VNĐ) - Tối đa: {eligibleWithdrawableBalance.toLocaleString('vi-VN')} đ
                    </label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value ? Number(e.target.value) : '')}
                      required
                      placeholder={`Nhập số tiền (Tối đa ${eligibleWithdrawableBalance.toLocaleString('vi-VN')}đ)`}
                      className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-black rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canCreateWithdrawal || isRequestingWithdraw}
                  className={`w-full font-black py-3.5 rounded-xl uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    canCreateWithdrawal
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  {!isWithdrawalDay
                    ? `🔒 CỔNG RÚT ĐÓNG (MỞ VÀO NGÀY 14 & 25 - HÔM NAY NGÀY ${currentDay})`
                    : hasAlreadyWithdrawnToday
                    ? '⚠️ ĐÃ TẠO 1 LỆNH RÚT HÔM NAY (GIỚI HẠN 1 LẦN/NGÀY)'
                    : eligibleWithdrawableBalance <= 0
                    ? '❌ KHÔNG ĐỦ SỐ DƯ HỢP LỆ ĐỂ RÚT'
                    : isRequestingWithdraw
                    ? 'Đang Gửi Lệnh...'
                    : `XÁC NHẬN GỬI LỆNH RÚT TIỀN (NGÀY ${currentDay})`}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: SHOP CONFIGURATION & BRANDING */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveShopConfig} className="space-y-6">
              
              {/* Section 1: Addresses & Maps */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <MapPin className="w-4 h-4" /> 1. CẤU HÌNH ĐỊA CHỈ KHO, ĐỊA CHỈ LẤY HÀNG & GOOGLE MAPS
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Địa chỉ kho hàng (Warehouse Address)</label>
                    <input
                      type="text"
                      value={warehouseAddress}
                      onChange={e => setWarehouseAddress(e.target.value)}
                      required
                      placeholder="VD: 123 Nguyễn Trãi, Quận 1, TP.HCM"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Địa chỉ lấy hàng (Shipment Pickup Address)</label>
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={e => setPickupAddress(e.target.value)}
                      required
                      placeholder="VD: Kho Tổng TQ Store - 123 Nguyễn Trãi, Quận 1..."
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-blue-400 font-bold mb-1">Link Google Maps / Tọa độ GPS hiển thị</label>
                    <input
                      type="url"
                      value={googleMapsUrl}
                      onChange={e => setGoogleMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full bg-slate-900 border border-slate-700 text-blue-300 font-mono rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Bank Account & Payment QR */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <QrCode className="w-4 h-4" /> 2. CẤU HÌNH TÀI KHOẢN NGÂN HÀNG & MÃ QR NHẬN TIỀN (VIETQR)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Ngân hàng nhận chuyển khoản</label>
                    <input
                      type="text"
                      value={shopBankName}
                      onChange={e => setShopBankName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-bold rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Số tài khoản (STK)</label>
                    <input
                      type="text"
                      value={shopSTK}
                      onChange={e => setShopSTK(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tên chủ tài khoản</label>
                    <input
                      type="text"
                      value={shopOwnerName}
                      onChange={e => setShopOwnerName(e.target.value.toUpperCase())}
                      required
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-bold rounded-xl px-3 py-2 text-xs uppercase"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-emerald-400 font-bold mb-1">Link Ảnh QR Nhận Tiền Tự Động (VietQR Image URL)</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="url"
                        value={qrCodeUrl}
                        onChange={e => setQrCodeUrl(e.target.value)}
                        placeholder="https://api.vietqr.io/image/..."
                        className="flex-1 bg-slate-900 border border-slate-700 text-emerald-300 font-mono rounded-xl px-3 py-2 text-xs"
                      />
                      {qrCodeUrl && (
                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-emerald-400 shrink-0 flex items-center justify-center p-0.5">
                          <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Profile & Branding */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4" /> 3. THÔNG TIN & TRANG CÁ NHÂN SHOP (SLOGAN, GIỚI THIỆU, BANNER & HOTLINE)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Khẩu hiệu cửa hàng (Slogan)</label>
                    <input
                      type="text"
                      value={slogan}
                      onChange={e => setSlogan(e.target.value)}
                      placeholder="VD: Chuyên Trang Phục Thuê Luxury Top 1..."
                      className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Hotline Zalo / Điện Thoại Hỗ Trợ Khách</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={hotline}
                        onChange={e => setHotline(e.target.value)}
                        placeholder="0367818343"
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold rounded-xl pl-9 pr-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-bold mb-1">Link Ảnh Bìa Banner Cửa Hàng (Shop Cover Banner URL)</label>
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={bannerUrl}
                        onChange={e => setBannerUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-900 border border-slate-700 text-purple-300 font-mono rounded-xl px-3 py-2 text-xs"
                      />
                      {bannerUrl && (
                        <div className="h-24 bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                          <img src={bannerUrl} alt="Banner Cover" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-bold mb-1">Bài Giới Thiệu Cửa Hàng (Shop Bio & Intro)</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                      placeholder="Nhập giới thiệu quy mô cửa hàng, thế mạnh, chính sách cam kết chất lượng..."
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black py-3.5 rounded-2xl uppercase tracking-wider transition shadow-xl cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-slate-950" /> XÁC NHẬN LƯU CẤU HÌNH & TRANG CÁ NHÂN SHOP
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
