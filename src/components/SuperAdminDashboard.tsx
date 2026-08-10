import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  Crown,
  UserCheck,
  Key,
  TrendingUp,
  CreditCard,
  Users,
  Sliders,
  Percent,
  Ticket,
  Link,
  Star,
  Bot,
  Layers,
  X,
  UserPlus,
  Plus
} from 'lucide-react';

interface SuperAdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenThemeCustomizer: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  isOpen,
  onClose,
  onOpenThemeCustomizer
}) => {
  const { user } = useAuth();
  const { theme, updateTheme } = useTheme();
  const { orders } = useCart();
  const { addToast } = useToast();

  const [adminTab, setAdminTab] = useState<
    | 'users'
    | 'password-resets'
    | 'financial-analytics'
    | 'withdrawals'
    | 'consumer-trends'
    | 'system-config'
    | 'fee-overrides'
    | 'vouchers'
    | 'custom-links'
    | 'reviews-moderation'
    | 'fake-reviews'
    | 'buttons-categories'
  >('users');

  // --- Module 1: Users State ---
  const [usersList, setUsersList] = useState<any[]>(() => {
    const saved = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
    const adminAccounts = [
      { id: 'admin_1', name: 'Trần Văn Quyền (Super Admin)', phone: '0367818343', email: 'tranvanquyen2211@gmail.com', role: 'SUPER_ADMIN', status: 'active', walletBalance: 99999999, coins: 99999 },
      { id: 'admin_2', name: 'TQ Store Support Admin', phone: '0987654321', email: 'admin@tqstore.vn', role: 'SUPER_ADMIN', status: 'active', walletBalance: 99999999, coins: 99999 }
    ];
    return [...adminAccounts, ...saved];
  });
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPass, setNewUserPass] = useState('TQStore2026@');
  const [newUserRole, setNewUserRole] = useState<'USER' | 'SHOP' | 'STAFF' | 'BOT_REVIEW'>('SHOP');
  const [newShopType, setNewShopType] = useState<'RENTAL' | 'RETAIL' | 'FNB' | 'BEAUTY'>('RENTAL');

  // --- Module 2: Password Reset Requests ---
  const [resetRequests, setResetRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_reset_requests');
    return saved ? JSON.parse(saved) : [
      { id: 'req_1', phone: '0912345678', userName: 'Nguyễn Văn Nam', time: new Date().toLocaleString('vi-VN'), status: 'PENDING' }
    ];
  });

  // --- Module 4: Shop Withdrawals ---
  const [withdrawals, setWithdrawals] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_withdrawals');
    return saved ? JSON.parse(saved) : [
      { id: 'W100234', shopName: 'TQ Rental Studio', amount: 3500000, bankName: 'Vietcombank', stk: '0367818343', ownerName: 'TRAN VAN QUYEN', date: new Date().toLocaleDateString('vi-VN'), status: 'pending' }
    ];
  });

  // --- Module 6 & 7: System Config & Fee Overrides ---
  const [defaultFeeRate, setDefaultFeeRate] = useState(5);
  const [shopFeeOverrides, setShopFeeOverrides] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('tq_shop_fee_overrides');
    return saved ? JSON.parse(saved) : { 'TQ Rental Studio': 3 };
  });

  // --- Module 8: Vouchers ---
  const [vouchers, setVouchers] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_vouchers');
    return saved ? JSON.parse(saved) : [
      { code: 'TQ10', type: 'percent', value: 10, maxUsage: 100, usedCount: 12, status: 'active', allowedMethods: ['wallet', 'cash', 'transfer'] },
      { code: 'TQ50K', type: 'fixed', value: 50000, maxUsage: 50, usedCount: 5, status: 'active', allowedMethods: ['wallet'] }
    ];
  });
  const [newVCode, setNewVCode] = useState('');
  const [newVValue, setNewVValue] = useState(10);
  const [newVType, setNewVType] = useState<'percent' | 'fixed'>('percent');

  // --- Module 9: Custom Links Slugs ---
  const [customLinks, setCustomLinks] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_custom_links');
    return saved ? JSON.parse(saved) : [
      { shopName: 'TQ Rental Studio', slug: 'shop-cho-thue-tq' }
    ];
  });
  const [newSlugShop, setNewSlugShop] = useState('TQ Rental Studio');
  const [newSlugCode, setNewSlugCode] = useState('');

  // --- Module 10 & 11: Reviews Moderation & Fake Reviews ---
  const [reviewsList, setReviewsList] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_reviews');
    return saved ? JSON.parse(saved) : [
      { id: 'rev_1', userName: 'Lê Thị Mai', zaloPhone: '0988123456', productName: 'Áo Sơ Mi Nam TQ Smart Oxford', shopName: 'TQ Retail Shop', rating: 5, comment: 'Chất vải mượt, giao nhanh!', cashbackAmount: 7770, date: new Date().toLocaleDateString('vi-VN'), status: 'pending' }
    ];
  });

  // --- Module 12: Buttons & Categories ---
  const [quickButtons, setQuickButtons] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_quick_buttons');
    return saved ? JSON.parse(saved) : [
      { id: 1, label: '🔥 Flash Sale 50%', url: '#flash-sale' },
      { id: 2, label: '👗 Thuê Đồ Cưới', url: '#rental' }
    ];
  });
  const [newBtnLabel, setNewBtnLabel] = useState('');
  const [newBtnUrl, setNewBtnUrl] = useState('#');

  if (!isOpen || !user || user.role !== 'SUPER_ADMIN') return null;

  // --- Financial Calculations (P&L) ---
  const totalGMV = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const platformFeesRevenue = Math.round(totalGMV * (defaultFeeRate / 100));
  const walletSubsidiesCost = Math.round(totalGMV * (theme.walletDiscountRate / 100));
  const coinCashbackSubsidies = reviewsList.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.cashbackAmount || 0), 0);
  const totalPlatformSubsidies = walletSubsidiesCost + coinCashbackSubsidies;
  const netPlatformProfit = platformFeesRevenue - totalPlatformSubsidies;

  // --- Actions ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserPhone.trim() || !newUserName.trim()) return;

    const cleanPhone = newUserPhone.trim();
    if (usersList.some(u => u.phone === cleanPhone)) {
      addToast(`Số điện thoại [${cleanPhone}] đã tồn tại trong hệ thống!`, 'error');
      return;
    }

    const newUserObj = {
      id: `usr_${Date.now()}`,
      name: newUserName.trim(),
      phone: cleanPhone,
      email: `${cleanPhone}@phone.tqstore.vn`,
      role: newUserRole,
      shopType: newUserRole === 'SHOP' ? newShopType : undefined,
      status: 'active',
      walletBalance: 1000000,
      coins: 500
    };

    const updated = [newUserObj, ...usersList];
    setUsersList(updated);
    const phoneUsersOnly = updated.filter(u => u.role !== 'SUPER_ADMIN');
    localStorage.setItem('tq_phone_users', JSON.stringify(phoneUsersOnly));

    setNewUserName('');
    setNewUserPhone('');
    addToast(`➕ Đã khởi tạo tài khoản mới: [${newUserName}] (${newUserRole})`, 'success');
  };

  const toggleUserLock = (phone: string) => {
    const updated = usersList.map(u => {
      if (u.phone === phone) {
        const nextStatus = u.status === 'locked' ? 'active' : 'locked';
        addToast(`Đã ${nextStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản [${phone}]`, 'info');
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsersList(updated);
  };

  const deleteUserAccount = (phone: string) => {
    if (phone === '0367818343' || phone === '0987654321') {
      addToast('Không thể xóa tài khoản Super Admin gốc!', 'error');
      return;
    }
    const updated = usersList.filter(u => u.phone !== phone);
    setUsersList(updated);
    const phoneUsersOnly = updated.filter(u => u.role !== 'SUPER_ADMIN');
    localStorage.setItem('tq_phone_users', JSON.stringify(phoneUsersOnly));
    addToast(`Đã xóa vĩnh viễn tài khoản SĐT [${phone}]`, 'info');
  };

  const approveResetRequest = (id: string, phone: string) => {
    const newPass = 'TQ#' + Math.floor(100000 + Math.random() * 900000);
    setResetRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
    addToast(`🔑 Đã duyệt cấp lại mật khẩu mới cho SĐT ${phone}: [${newPass}]`, 'success');
  };

  const approveWithdrawal = (id: string) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'approved' } : w));
    localStorage.setItem('tq_withdrawals', JSON.stringify(withdrawals));
    addToast(`💰 Đã duyệt giải ngân đơn rút tiền #${id}!`, 'success');
  };

  const rejectWithdrawal = (id: string) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w));
    localStorage.setItem('tq_withdrawals', JSON.stringify(withdrawals));
    addToast(`Từ chối đơn rút tiền #${id}`, 'info');
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVCode.trim()) return;
    const codeUpper = newVCode.trim().toUpperCase();
    const newV = { code: codeUpper, type: newVType, value: Number(newVValue), maxUsage: 100, usedCount: 0, status: 'active', allowedMethods: ['wallet', 'cash', 'transfer'] };
    const updated = [newV, ...vouchers];
    setVouchers(updated);
    localStorage.setItem('tq_vouchers', JSON.stringify(updated));
    setNewVCode('');
    addToast(`🎫 Đã tạo mã giảm giá mới: [${codeUpper}]`, 'success');
  };

  const handleCreateCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlugCode.trim()) return;
    const slug = newSlugCode.trim().toLowerCase().replace(/\s+/g, '-');
    const newLink = { shopName: newSlugShop, slug };
    const updated = [newLink, ...customLinks];
    setCustomLinks(updated);
    localStorage.setItem('tq_custom_links', JSON.stringify(updated));
    setNewSlugCode('');
    addToast(`🔗 Đã tạo đường dẫn Web riêng: [?shop_link=${slug}]`, 'success');
  };

  const approveReview = (id: string) => {
    setReviewsList(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    localStorage.setItem('tq_reviews', JSON.stringify(reviewsList));
    addToast('⭐ Đã duyệt đánh giá và cộng Xu hoàn cho khách!', 'success');
  };

  const handleAddFakeReview = () => {
    const comment = prompt('Nhập nội dung đánh giá ảo:', 'Sản phẩm tuyệt vời, giao nhanh!');
    if (!comment) return;
    const fake = { id: `fake_${Date.now()}`, userName: 'Khách Ảo Verified Zalo', zaloPhone: '0988777666', productName: 'Sản phẩm Hot', shopName: 'TQ Retail Shop', rating: 5, comment, cashbackAmount: 0, date: new Date().toLocaleDateString('vi-VN'), status: 'approved' };
    const updated = [fake, ...reviewsList];
    setReviewsList(updated);
    localStorage.setItem('tq_reviews', JSON.stringify(updated));
    addToast('🤖 Đã thêm đánh giá ảo thành công!', 'success');
  };

  const handleAddQuickBtn = () => {
    if (!newBtnLabel.trim()) return;
    const newBtn = { id: Date.now(), label: newBtnLabel.trim(), url: newBtnUrl };
    const updated = [...quickButtons, newBtn];
    setQuickButtons(updated);
    localStorage.setItem('tq_quick_buttons', JSON.stringify(updated));
    setNewBtnLabel('');
    addToast('📂 Đã thêm nút bấm nhanh trang chủ!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-amber-500/40 text-slate-100 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-amber-500/30 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-400 uppercase tracking-wide flex items-center gap-2">
                SUPER ADMIN OVERLORD PANEL
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TẬP QUYỀN ĐIỀU HÀNH HỆ THỐNG & FINANCIAL ANALYTICS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenThemeCustomizer}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              🎨 Đổi Giao Diện
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layout Body: Sidebar + Main Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 12 Module Sidebar Navigation */}
          <aside className="w-64 bg-slate-950 border-r border-slate-800 p-3 space-y-1 overflow-y-auto custom-scrollbar shrink-0 text-xs font-bold">
            <div className="text-[9px] font-black text-amber-400 uppercase mb-2 px-3 tracking-wider">
              Phân Hệ Quyền Lực Overlord (12 Modules)
            </div>

            <button
              onClick={() => setAdminTab('users')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'users' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-400" /> 1. 👤 Tạo & Quản Lý Tài Khoản
            </button>

            <button
              onClick={() => setAdminTab('password-resets')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                adminTab === 'password-resets' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5"><Key className="w-4 h-4 text-orange" /> 2. 🔑 Cấp Lại Mật Khẩu</span>
              <span className="bg-orange text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">{resetRequests.filter(r => r.status === 'PENDING').length}</span>
            </button>

            <button
              onClick={() => setAdminTab('financial-analytics')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                adminTab === 'financial-analytics' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5"><TrendingUp className="w-4 h-4 text-emerald-400" /> 3. 📊 P&L Lợi Nhuận Sàn</span>
              <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black">P&L</span>
            </button>

            <button
              onClick={() => setAdminTab('withdrawals')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                adminTab === 'withdrawals' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5"><CreditCard className="w-4 h-4 text-emerald-400" /> 4. 💰 Duyệt Rút Tiền Shop 14D</span>
              <span className="bg-amber-400 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black">{withdrawals.filter(w => w.status === 'pending').length}</span>
            </button>

            <button
              onClick={() => setAdminTab('consumer-trends')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'consumer-trends' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-purple-400" /> 5. 👥 Người Dùng & Trends Shop
            </button>

            <button
              onClick={() => setAdminTab('system-config')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'system-config' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4 text-cyan-400" /> 6. ⚙️ Cấu Hình Ví/Xu/Phí Sàn
            </button>

            <button
              onClick={() => setAdminTab('fee-overrides')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'fee-overrides' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Percent className="w-4 h-4 text-indigo-400" /> 7. % Cài Phí Sàn Riêng Shop
            </button>

            <button
              onClick={() => setAdminTab('vouchers')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'vouchers' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Ticket className="w-4 h-4 text-rose-400" /> 8. 🎟️ Quản Lý Voucher
            </button>

            <button
              onClick={() => setAdminTab('custom-links')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'custom-links' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Link className="w-4 h-4 text-blue-400" /> 9. 🔗 Quản Lý Link Web Shop
            </button>

            <button
              onClick={() => setAdminTab('reviews-moderation')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                adminTab === 'reviews-moderation' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5"><Star className="w-4 h-4 text-amber-400" /> 10. ⭐ Duyệt Đánh Giá Hoàn Xu</span>
              <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded">{reviewsList.filter(r => r.status === 'pending').length}</span>
            </button>

            <button
              onClick={() => setAdminTab('fake-reviews')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'fake-reviews' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-400" /> 11. 🤖 Đánh Giá Ảo & Sửa Lượt Mua
            </button>

            <button
              onClick={() => setAdminTab('buttons-categories')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'buttons-categories' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-400" /> 12. 📂 Quản Lý Nút Bấm & Danh Mục
            </button>
          </aside>

          {/* Module Panel Main View */}
          <main className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar text-xs">
            
            {/* MODULE 1: USERS */}
            {adminTab === 'users' && (
              <div className="space-y-6">
                <form onSubmit={handleCreateUser} className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 shadow-xl space-y-4">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Thêm mới tài khoản đặc quyền vào hệ thống
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Loại Tài khoản (Role)</label>
                      <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-xl px-3 py-2">
                        <option value="SHOP">🏪 Tài khoản Gian Hàng / Shop</option>
                        <option value="STAFF">👨‍💼 Tài khoản Nhân viên (Staff)</option>
                        <option value="BOT_REVIEW">🤖 Tài khoản Đánh giá ảo (Bot)</option>
                        <option value="USER">👤 Tài khoản Khách hàng (User)</option>
                      </select>
                    </div>

                    {newUserRole === 'SHOP' && (
                      <div>
                        <label className="block font-bold text-emerald-400 mb-1">Mô hình Cửa hàng</label>
                        <select value={newShopType} onChange={e => setNewShopType(e.target.value as any)} className="w-full bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold rounded-xl px-3 py-2">
                          <option value="RENTAL">👗 Shop Cho Thuê Đồ (Rental)</option>
                          <option value="RETAIL">🛍️ Shop Bán Đồ (Retail)</option>
                          <option value="FNB">🧋 Đồ Ăn & Đồ Uống (F&B)</option>
                          <option value="BEAUTY">💄 Shop Làm Đẹp & Spa (Beauty)</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Tên Hiển Thị / Tên Shop</label>
                      <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} required placeholder="Ví dụ: TQ Beauty Spa..." className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Số điện thoại / ID Đăng nhập</label>
                      <input type="tel" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} required placeholder="09xxxxxxxx" className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Mật khẩu ban đầu</label>
                      <input type="text" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2" />
                    </div>
                  </div>
                  <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> + XÁC NHẬN TẠO TÀI KHOẢN
                  </button>
                </form>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Danh sách toàn bộ Tài khoản ({usersList.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <th className="p-3">Họ Tên / Gian Hàng</th>
                          <th className="p-3">SĐT / ID Login</th>
                          <th className="p-3">Cấp Quyền & Mô Hình</th>
                          <th className="p-3 text-center">Trạng Thái</th>
                          <th className="p-3 text-right">Thao Tác Quản Trị</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {usersList.map((u, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="p-3 font-bold text-slate-100">{u.name}</td>
                            <td className="p-3 font-mono text-amber-400 font-bold">{u.phone || u.email}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                u.role === 'SUPER_ADMIN' ? 'bg-amber-400 text-slate-950' : u.role === 'SHOP' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {u.role === 'SHOP' ? `SHOP ${u.shopType || ''}` : u.role}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${u.status === 'locked' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {u.status === 'locked' ? 'Khóa' : 'Hoạt Động'}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1.5">
                              <button onClick={() => toggleUserLock(u.phone)} className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-200 cursor-pointer">
                                {u.status === 'locked' ? 'Mở' : 'Khóa'}
                              </button>
                              {u.role !== 'SUPER_ADMIN' && (
                                <button onClick={() => deleteUserAccount(u.phone)} className="px-2 py-1 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 cursor-pointer">Xóa</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 2: PASSWORD RESETS */}
            {adminTab === 'password-resets' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase">🔑 YÊU CẦU CẤP LẠI MẬT KHẨU TỪ KHÁCH HÀNG</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <th className="p-3">Thời gian</th>
                          <th className="p-3">Tên Tài khoản</th>
                          <th className="p-3">SĐT</th>
                          <th className="p-3 text-center">Trạng thái</th>
                          <th className="p-3 text-right">Thao tác Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {resetRequests.map(r => (
                          <tr key={r.id} className="hover:bg-slate-900/50">
                            <td className="p-3 text-slate-400 font-mono text-[10px]">{r.time}</td>
                            <td className="p-3 font-bold text-slate-100">{r.userName}</td>
                            <td className="p-3 font-mono text-amber-400 font-bold">{r.phone}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {r.status === 'PENDING' ? '⏳ CHỜ DUYỆT' : '✓ ĐÃ DUYỆT'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {r.status === 'PENDING' ? (
                                <button onClick={() => approveResetRequest(r.id, r.phone)} className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1 rounded text-xs font-black cursor-pointer">
                                  🔑 Duyệt & Cấp MK
                                </button>
                              ) : <span className="text-slate-500 text-[10px]">Đã xử lý</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 3: FINANCIAL P&L */}
            {adminTab === 'financial-analytics' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/30 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-black text-amber-400 uppercase">📊 BÁO CÁO P&L LỢI NHUẬN RÒNG & CASHFLOW SÀN TQ STORE</h3>
                      <p className="text-xs text-slate-400 mt-1">Doanh thu gộp GMV, Doanh thu Phí sàn, Chi phí Trợ giá (Ví + Xu hoàn)</p>
                    </div>
                    <div className="text-right bg-slate-900 p-3 rounded-xl border border-amber-400/30">
                      <span className="text-[9px] text-slate-400 uppercase font-black block">LỢI NHUẬN RÒNG SÀN (NET PROFIT):</span>
                      <h4 className={`text-2xl font-black font-mono ${netPlatformProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {netPlatformProfit >= 0 ? '+' : ''}{netPlatformProfit.toLocaleString('vi-VN')} đ
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">TỔNG GMV ĐƠN HÀNG</span>
                      <h4 className="text-lg font-black text-blue-400 font-mono mt-1">{totalGMV.toLocaleString('vi-VN')} đ</h4>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">THU PHÍ SÀN ({defaultFeeRate}%)</span>
                      <h4 className="text-lg font-black text-emerald-400 font-mono mt-1">+{platformFeesRevenue.toLocaleString('vi-VN')} đ</h4>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">TRỢ GIÁ VÍ ({theme.walletDiscountRate}%)</span>
                      <h4 className="text-lg font-black text-rose-400 font-mono mt-1">-{walletSubsidiesCost.toLocaleString('vi-VN')} đ</h4>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">HOÀN XU ĐÁNH GIÁ</span>
                      <h4 className="text-lg font-black text-amber-400 font-mono mt-1">-{coinCashbackSubsidies.toLocaleString('vi-VN')} đ</h4>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: SHOP WITHDRAWALS */}
            {adminTab === 'withdrawals' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase">💰 DUYỆT LỆNH RÚT TIỀN DOANH THU SHOP (CHU KỲ 14 NGÀY)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <th className="p-3">Mã Lệnh</th>
                          <th className="p-3">Tên Cửa Hàng</th>
                          <th className="p-3 text-center">Số tiền</th>
                          <th className="p-3">TK Nhận tiền</th>
                          <th className="p-3 text-center">Trạng thái</th>
                          <th className="p-3 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {withdrawals.map(w => (
                          <tr key={w.id} className="hover:bg-slate-900/50">
                            <td className="p-3 font-mono font-bold text-amber-400">#{w.id}</td>
                            <td className="p-3 font-bold text-slate-100">{w.shopName}</td>
                            <td className="p-3 text-center font-black text-emerald-400 font-mono">{w.amount.toLocaleString('vi-VN')} đ</td>
                            <td className="p-3 text-slate-300 font-mono text-[10px]">{w.bankName} - {w.stk} ({w.ownerName})</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                w.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {w.status === 'pending' ? '⏳ CHỜ DUYỆT' : w.status === 'approved' ? '✅ ĐÃ DUYỆT' : '❌ TỪ CHỐI'}
                              </span>
                            </td>
                            <td className="p-3 text-center space-x-1">
                              {w.status === 'pending' ? (
                                <>
                                  <button onClick={() => approveWithdrawal(w.id)} className="bg-emerald-600 text-slate-950 font-black px-2.5 py-1 rounded text-[10px] cursor-pointer">✅ Duyệt</button>
                                  <button onClick={() => rejectWithdrawal(w.id)} className="bg-rose-600 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer">❌ Từ chối</button>
                                </>
                              ) : <span className="text-slate-500 text-[10px]">Đã xử lý</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 5: CONSUMER TRENDS */}
            {adminTab === 'consumer-trends' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-cyan-400 uppercase">👥 THỐNG KÊ NGƯỜI DÙNG & TRENDS DOANH THU SHOP</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Tổng số người dùng đăng ký:</span>
                      <strong className="text-xl text-slate-100 font-black">{usersList.length} tài khoản</strong>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Số lượng Shop cửa hàng:</span>
                      <strong className="text-xl text-emerald-400 font-black">{usersList.filter(u => u.role === 'SHOP').length || 4} Shop</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 6: SYSTEM CONFIG */}
            {adminTab === 'system-config' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 max-w-xl">
                  <h3 className="text-base font-black text-amber-400 uppercase">⚙️ CẤU HÌNH % VÍ / XU / PHÍ SÀN MẶC ĐỊNH</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">% Ưu đãi Ví TQ Pay:</label>
                      <input type="number" value={theme.walletDiscountRate} onChange={e => updateTheme({ walletDiscountRate: Number(e.target.value) })} className="w-32 bg-slate-900 border border-slate-700 text-emerald-400 font-black rounded-xl px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">% Hoàn TQ Xu Đánh giá:</label>
                      <input type="number" value={theme.coinCashbackRate} onChange={e => updateTheme({ coinCashbackRate: Number(e.target.value) })} className="w-32 bg-slate-900 border border-slate-700 text-amber-400 font-black rounded-xl px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">% Phí sàn mặc định toàn hệ thống:</label>
                      <input type="number" value={defaultFeeRate} onChange={e => setDefaultFeeRate(Number(e.target.value))} className="w-32 bg-slate-900 border border-slate-700 text-rose-400 font-black rounded-xl px-3 py-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 7: FEE OVERRIDES */}
            {adminTab === 'fee-overrides' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-indigo-400 uppercase">% CÀI PHÍ SÀN RIÊNG CHO TỪNG GIAN HÀNG SHOP</h3>
                  <div className="space-y-2">
                    {['TQ Rental Studio', 'TQ Retail Shop', 'TQ Tea & Coffee', 'TQ Beauty Spa'].map(sName => (
                      <div key={sName} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="font-bold text-slate-100">{sName}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={shopFeeOverrides[sName] !== undefined ? shopFeeOverrides[sName] : defaultFeeRate}
                            onChange={e => {
                              const updated = { ...shopFeeOverrides, [sName]: Number(e.target.value) };
                              setShopFeeOverrides(updated);
                              localStorage.setItem('tq_shop_fee_overrides', JSON.stringify(updated));
                            }}
                            className="w-16 bg-slate-950 border border-slate-700 text-indigo-400 font-black rounded px-2 py-1 text-center"
                          />
                          <span className="text-slate-400 font-bold">% Phí sàn</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 8: VOUCHERS */}
            {adminTab === 'vouchers' && (
              <div className="space-y-6">
                <form onSubmit={handleCreateVoucher} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 max-w-lg">
                  <h3 className="text-xs font-black text-amber-400 uppercase">🎟️ TẠO MÃ GIẢM GIÁ VOUCHER MỚI</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={newVCode} onChange={e => setNewVCode(e.target.value)} required placeholder="Mã (VD: TQ100K)" className="bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2 text-xs uppercase" />
                    <select value={newVType} onChange={e => setNewVType(e.target.value as any)} className="bg-slate-900 border border-slate-700 text-slate-200 font-bold rounded-xl px-3 py-2 text-xs">
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền (VNĐ)</option>
                    </select>
                    <input type="number" value={newVValue} onChange={e => setNewVValue(Number(e.target.value))} required className="bg-slate-900 border border-slate-700 text-emerald-400 font-bold rounded-xl px-3 py-2 text-xs" />
                  </div>
                  <button type="submit" className="bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer">+ Tạo Voucher</button>
                </form>
              </div>
            )}

            {/* MODULE 9: CUSTOM SHOP LINKS */}
            {adminTab === 'custom-links' && (
              <div className="space-y-6">
                <form onSubmit={handleCreateCustomLink} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 max-w-lg">
                  <h3 className="text-xs font-black text-blue-400 uppercase">🔗 QUẢN LÝ LINK WEB RIÊNG CHO TỪNG SHOP (SLUG)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={newSlugShop} onChange={e => setNewSlugShop(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-200 font-bold rounded-xl px-3 py-2">
                      <option value="TQ Rental Studio">TQ Rental Studio</option>
                      <option value="TQ Retail Shop">TQ Retail Shop</option>
                    </select>
                    <input type="text" value={newSlugCode} onChange={e => setNewSlugCode(e.target.value)} placeholder="Slug (VD: shop-thoi-trang-tq)" className="bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2" />
                  </div>
                  <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl cursor-pointer">➕ Tạo Link Web</button>
                </form>
              </div>
            )}

            {/* MODULE 10: REVIEWS MODERATION */}
            {adminTab === 'reviews-moderation' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase">⭐ DUYỆT ĐÁNH GIÁ KHÁCH HÀNG HOÀN XU</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <th className="p-3">Khách hàng</th>
                          <th className="p-3">Sản phẩm</th>
                          <th className="p-3 text-center">Sao</th>
                          <th className="p-3">Nhận xét</th>
                          <th className="p-3 text-center">Trạng thái</th>
                          <th className="p-3 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {reviewsList.map(r => (
                          <tr key={r.id} className="hover:bg-slate-900/50">
                            <td className="p-3 font-bold text-slate-100">{r.userName}</td>
                            <td className="p-3 font-bold text-blue-400">{r.productName}</td>
                            <td className="p-3 text-center font-bold text-amber-400">{r.rating} ⭐</td>
                            <td className="p-3 text-slate-300">{r.comment}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {r.status === 'pending' ? 'CHỜ DUYỆT' : 'ĐÃ DUYỆT'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {r.status === 'pending' ? (
                                <button onClick={() => approveReview(r.id)} className="bg-emerald-600 text-slate-950 font-black px-2.5 py-1 rounded text-[10px] cursor-pointer">✅ Duyệt</button>
                              ) : <span className="text-slate-500 text-[10px]">Đã duyệt</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 11: FAKE REVIEWS */}
            {adminTab === 'fake-reviews' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-purple-400 uppercase">🤖 ĐÁNH GIÁ ẢO & SỬA LƯỢT MUA BÁN</h3>
                    <button onClick={handleAddFakeReview} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer">⭐ + Tạo Đánh Giá Ảo (Verified Zalo)</button>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 12: BUTTONS & CATEGORIES */}
            {adminTab === 'buttons-categories' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 max-w-lg">
                  <h3 className="text-xs font-black text-teal-400 uppercase">📂 QUẢN LÝ NÚT BẤM NHANH TRANG CHỦ</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={newBtnLabel} onChange={e => setNewBtnLabel(e.target.value)} placeholder="Tên nút (VD: Flash Sale)..." className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2" />
                    <input type="text" value={newBtnUrl} onChange={e => setNewBtnUrl(e.target.value)} placeholder="URL (#rental)..." className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2" />
                  </div>
                  <button onClick={handleAddQuickBtn} className="bg-teal-600 text-slate-950 font-black px-4 py-2 rounded-xl cursor-pointer">THÊM NÚT BẤM</button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};
