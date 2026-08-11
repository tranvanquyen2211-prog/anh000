import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import type { ShopType, Product } from '../types';
import { NotificationCenter, type SystemNotification } from './NotificationCenter';
import { ShoppingCart, Search, User, LogOut, Wallet, Coins, Palette, Key, Crown, PlusCircle, Store, Camera, Bell, MessageSquare, Tv, Wand2 } from 'lucide-react';

interface HeaderProps {
  onOpenAuthModal: () => void;
  onOpenCartDrawer: () => void;
  onOpenOrderHistory: () => void;
  onOpenChatInbox: () => void;
  onOpenWatchToEarnModal?: () => void;
  onOpenUserCoinsModal?: () => void;
  onOpenWalletDepositWithdrawModal?: () => void;
  onOpenAiMixMatchModal?: () => void;
  onOpenThemeCustomizer?: () => void;
  onOpenAiDesignStudio?: () => void;
  onOpenChangePassword?: () => void;
  onOpenChangeAvatar?: () => void;
  onOpenSuperAdminDashboard?: () => void;
  onOpenAddProductModal?: () => void;
  onOpenShopManagementDashboard?: () => void;
  onSubmitSearch?: () => void;
  products?: Product[];
  onOpenProductDetail?: (product: Product) => void;
  selectedCategory: ShopType | 'ALL';
  onSelectCategory: (cat: ShopType | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab?: 'shop' | 'orders' | 'chat';
  setActiveTab?: (tab: 'shop' | 'orders' | 'chat') => void;

  // Notification Props
  unreadNotificationsCount: number;
  onToggleNotifications: () => void;
  isNotificationsOpen: boolean;
  notifications: SystemNotification[];
  onMarkAllNotificationsAsRead: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuthModal,
  onOpenCartDrawer,
  onOpenOrderHistory,
  onOpenChatInbox,
  onOpenWatchToEarnModal,
  onOpenUserCoinsModal,
  onOpenWalletDepositWithdrawModal,
  onOpenAiMixMatchModal,
  onOpenThemeCustomizer,
  onOpenAiDesignStudio,
  onOpenChangePassword,
  onOpenChangeAvatar,
  onOpenSuperAdminDashboard,
  onOpenAddProductModal,
  onOpenShopManagementDashboard,
  onSubmitSearch,
  products = [],
  onOpenProductDetail,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  setActiveTab,
  unreadNotificationsCount,
  onToggleNotifications,
  isNotificationsOpen,
  notifications,
  onMarkAllNotificationsAsRead
}) => {
  const { user, logout, isImpersonating, exitImpersonation } = useAuth();
  const { totalItemsCount } = useCart();
  const { theme } = useTheme();

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const q = searchQuery.toLowerCase().trim();
  const matchedSearchProducts = (products || []).filter(p => {
    if (!q) return false;
    const titleMatch = p.title.toLowerCase().includes(q);
    const shopMatch = p.shopName.toLowerCase().includes(q);
    const detailsMatch = (p.details || '').toLowerCase().includes(q);
    const tagsMatch = p.tags ? p.tags.some(t => t.toLowerCase().includes(q)) : false;
    return titleMatch || shopMatch || detailsMatch || tagsMatch;
  }).slice(0, 5);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      
      {/* Top Announcement Promo Bar */}
      {(theme.featureVisibility?.showPromoBar !== false) && (
        <div className="bg-gradient-to-r from-navy via-navy-light to-indigo-950 text-white text-[11px] font-bold py-1.5 px-4 text-center border-b border-navy-light flex items-center justify-center gap-2">
          <span>⚡ {theme.promoBarText || 'ƯU ĐÃI VÍ CÁ NHÂN TQ PAY: GIẢM THÊM 2% CHO MỌI ĐƠN HÀNG'}</span>
          <span className="bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full text-[9px] font-black uppercase">HOT</span>
        </div>
      )}

      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-red-700 text-white px-4 py-2 flex items-center justify-between text-xs font-black shadow-md border-b border-rose-400">
          <div className="flex items-center gap-2">
            <span className="bg-white text-rose-700 px-2 py-0.5 rounded text-[10px] font-black animate-pulse">
              🎭 ĐANG GIẢ LẬP
            </span>
            <span>Giao diện Cửa Hàng: <strong className="underline decoration-amber-300">{user?.name}</strong></span>
          </div>

          <button
            onClick={exitImpersonation}
            className="bg-amber-300 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow cursor-pointer flex items-center gap-1.5 border border-white/50"
          >
            <Crown className="w-4 h-4 text-slate-950" /> QUAY LẠI SUPER ADMIN
          </button>
        </div>
      )}

      {/* 📱 MOBILE APP TOP STICKY HEADER (RESPONSIVE MOBILE FIRST - 5% SCALE UP & DYNAMIC PLATFORM THEME SYNC) */}
      <div
        style={{ backgroundColor: theme.primaryColor || '#0F2C59' }}
        className="md:hidden text-white p-3.5 space-y-2.5 sticky top-0 z-50 shadow-lg scale-[1.02] origin-top transition-colors"
      >
        {/* Top Row: Search Box (No Camera) + Quick Action Buttons (Tin nhắn, Thông báo, Giỏ hàng, Tôi) */}
        <div className="flex items-center gap-2">
          
          {/* Search Box with Live Autocomplete */}
          <div className="flex-1 relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsSearchFocused(false);
                (document.activeElement as HTMLElement)?.blur();
                if (onSubmitSearch) onSubmitSearch();
              }}
              className="w-full bg-white rounded-xl flex items-center px-3 py-2 shadow-inner text-gray-800 border border-gray-200"
            >
              <button type="submit" className="text-gray-400 hover:text-navy cursor-pointer shrink-0 mr-2">
                <Search className="w-4.5 h-4.5 text-gray-400" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={e => {
                  onSearchChange(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Tìm trang phục thuê, sản phẩm, đồ ăn, gói spa..."
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-gray-400 font-medium"
              />
            </form>

            {/* 🔍 REALTIME LIVE AUTOCOMPLETE SEARCH DROPDOWN (MOBILE) */}
            {isSearchFocused && q.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white text-slate-900 rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden text-xs">
                <div
                  onMouseDown={() => {
                    setIsSearchFocused(false);
                    if (onSubmitSearch) onSubmitSearch();
                  }}
                  className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-orange/10 transition"
                >
                  <span className="font-extrabold text-navy flex items-center gap-1.5 line-clamp-1">
                    <Search className="w-3.5 h-3.5 text-[#ee4d2d]" />
                    Tìm kiếm kết quả cho: <strong className="text-[#ee4d2d] font-mono">"{searchQuery}"</strong>
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold shrink-0">Bấm xem ➔</span>
                </div>

                {matchedSearchProducts.length > 0 ? (
                  <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                    {matchedSearchProducts.map((p) => (
                      <div
                        key={p.id}
                        onMouseDown={() => {
                          setIsSearchFocused(false);
                          if (onOpenProductDetail) onOpenProductDetail(p);
                        }}
                        className="p-2.5 flex items-center gap-2.5 hover:bg-orange/5 transition cursor-pointer"
                      >
                        <img src={p.img} alt={p.title} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-slate-800 text-xs line-clamp-1">{p.title}</h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[#ee4d2d] font-black font-mono text-xs">{p.price.toLocaleString('vi-VN')} đ</span>
                            <span className="text-[9px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.2 rounded line-clamp-1">{p.shopName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-xs font-medium">
                    Không thấy sản phẩm chứa từ khóa "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4 Quick Action Buttons: Tin nhắn, Thông báo, Giỏ hàng, Tôi */}
          <div className="flex items-center gap-2 text-white shrink-0">
            
            {/* 1. Tin nhắn */}
            <button
              onClick={onOpenChatInbox}
              className="relative p-1.5 hover:bg-white/15 rounded-full transition cursor-pointer flex flex-col items-center"
              title="Tin nhắn Inbox"
            >
              <MessageSquare className="w-5.5 h-5.5 text-white" />
              <span className="absolute -top-1 -right-1 bg-amber-300 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#0F2C59] shadow-xs">
                4
              </span>
            </button>

            {/* 2. Thông báo */}
            <button
              onClick={onToggleNotifications}
              className="relative p-1.5 hover:bg-white/15 rounded-full transition cursor-pointer flex flex-col items-center"
              title="Thông báo"
            >
              <Bell className="w-5.5 h-5.5 text-white" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1 rounded-full border border-[#0F2C59] shadow-xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* 3. Giỏ hàng */}
            <button
              onClick={onOpenCartDrawer}
              className="relative p-1.5 hover:bg-white/15 rounded-full transition cursor-pointer flex flex-col items-center"
              title="Giỏ hàng"
            >
              <ShoppingCart className="w-5.5 h-5.5 text-white" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* 4. Tôi */}
            <button
              onClick={user ? onOpenOrderHistory : onOpenAuthModal}
              className="relative p-1.5 hover:bg-white/15 rounded-full transition cursor-pointer flex flex-col items-center"
              title="Tài khoản cá nhân (Tôi)"
            >
              <User className="w-5.5 h-5.5 text-white" />
            </button>
          </div>
        </div>

        {/* Quick Action Buttons Row Below Search Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-extrabold pt-1 text-white">
          <button
            onClick={() => { onSearchChange('taxi'); onSelectCategory('TAXI'); }}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white shrink-0 cursor-pointer transition shadow-2xs flex items-center gap-1"
          >
            🚖 Taxi Đón Tận Nơi
          </button>

          <button
            onClick={() => { onSearchChange('sale'); onSelectCategory('ALL'); }}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white shrink-0 cursor-pointer transition shadow-2xs flex items-center gap-1"
          >
            ⚡ Flash Sale
          </button>

          <button
            onClick={() => { onSelectCategory('RENTAL'); }}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white shrink-0 cursor-pointer transition shadow-2xs flex items-center gap-1"
          >
            👗 Thuê đồ
          </button>

          <button
            onClick={() => { onSelectCategory('RETAIL'); }}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white shrink-0 cursor-pointer transition shadow-2xs flex items-center gap-1"
          >
            🛍️ Mua đồ
          </button>

          <button
            onClick={() => { onSelectCategory('FNB'); }}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white shrink-0 cursor-pointer transition shadow-2xs flex items-center gap-1"
          >
            🧋 Đồ ăn & đồ uống
          </button>

          <button
            onClick={() => { onSelectCategory('BEAUTY'); }}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white shrink-0 cursor-pointer transition shadow-2xs flex items-center gap-1"
          >
            💄 Làm đẹp & Spa
          </button>

          <button
            onClick={user ? onOpenOrderHistory : onOpenAuthModal}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-amber-200 shrink-0 cursor-pointer transition shadow-2xs flex items-center gap-1"
          >
            📦 Lịch sử đơn hàng
          </button>
        </div>

      </div>

      {/* Desktop Main Header */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 items-center justify-between gap-4 relative">
        {/* Brand Logo */}
        <div
          onClick={() => { if (setActiveTab) setActiveTab('shop'); }}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-amber-400 font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
            {theme.logoText || 'TQ'}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-wider text-navy">{theme.siteName || 'TQ Store'}</span>
              <span className="w-2.5 h-2.5 bg-orange rounded-full group-hover:scale-125 transition-transform"></span>
            </div>
            <span className="text-[10px] text-gray-500 font-semibold tracking-wide">{theme.tagline || 'Realtime Marketplace Platform'}</span>
          </div>
        </div>

        {/* Search Bar with Live Autocomplete */}
        <div className="flex-1 max-w-xl hidden md:block relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsSearchFocused(false);
              if (onSubmitSearch) onSubmitSearch();
            }}
            className="w-full flex items-center bg-gray-100 rounded-full border border-gray-200 focus-within:border-navy focus-within:bg-white transition-all shadow-inner"
          >
            <select
              value={selectedCategory}
              onChange={e => onSelectCategory(e.target.value as ShopType | 'ALL')}
              className="bg-transparent px-4 py-2 text-xs font-semibold text-gray-700 border-r border-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả sản phẩm</option>
              <option value="RENTAL">👗 Thuê Đồ</option>
              <option value="RETAIL">🛍️ Bán Đồ</option>
              <option value="FNB">🧋 Đồ Ăn & Uống</option>
              <option value="BEAUTY">💄 Làm Đẹp & Spa</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={e => {
                onSearchChange(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Tìm trang phục thuê, sản phẩm, đồ ăn, gói spa..."
              className="w-full bg-transparent px-4 py-2 text-xs text-gray-800 focus:outline-none font-medium"
            />
            <button type="submit" className="bg-navy hover:bg-[#ee4d2d] text-white px-5 py-2.5 rounded-r-full transition-colors cursor-pointer shrink-0">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* 🔍 REALTIME LIVE AUTOCOMPLETE SEARCH DROPDOWN (DESKTOP) */}
          {isSearchFocused && q.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white text-slate-900 rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden text-xs">
              <div
                onMouseDown={() => {
                  setIsSearchFocused(false);
                  if (onSubmitSearch) onSubmitSearch();
                }}
                className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-orange/10 transition"
              >
                <span className="font-extrabold text-navy flex items-center gap-1.5 line-clamp-1">
                  <Search className="w-4 h-4 text-[#ee4d2d]" />
                  Tìm kiếm kết quả cho: <strong className="text-[#ee4d2d] font-mono">"{searchQuery}"</strong>
                </span>
                <span className="text-xs text-[#ee4d2d] font-bold shrink-0">Xem tất cả ➔</span>
              </div>

              {matchedSearchProducts.length > 0 ? (
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {matchedSearchProducts.map((p) => (
                    <div
                      key={p.id}
                      onMouseDown={() => {
                        setIsSearchFocused(false);
                        if (onOpenProductDetail) onOpenProductDetail(p);
                      }}
                      className="p-3 flex items-center gap-3 hover:bg-orange/5 transition cursor-pointer"
                    >
                      <img src={p.img} alt={p.title} className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{p.title}</h5>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[#ee4d2d] font-black font-mono text-sm">{p.price.toLocaleString('vi-VN')} đ</span>
                          <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">{p.shopName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center text-gray-400 text-xs font-medium">
                  Không tìm thấy sản phẩm nào khớp từ khóa "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions & Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* AI Mix & Match Virtual Fitting Button */}
          {onOpenAiMixMatchModal && (
            <button
              onClick={onOpenAiMixMatchModal}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-pink-300"
              title="Bộ công cụ AI Phối Đồ & Thử Trang Phục Ảo (Mix & Match Studio)"
            >
              <Wand2 className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="hidden sm:inline">👗 AI Phối Đồ Virtual Try-On</span>
            </button>
          )}

          {/* Watch Video to Earn Coins Button */}
          {onOpenWatchToEarnModal && (
            <button
              onClick={onOpenWatchToEarnModal}
              className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-pink-300 animate-pulse"
              title="Xem Video YouTube Nhúng Kiếm Xu TQ"
            >
              <Tv className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">📺 Xem Video Kiếm Xu</span>
            </button>
          )}
          
          {/* Shop Management Dashboard Button */}
          {user && (user.role === 'SHOP' || isImpersonating) && onOpenShopManagementDashboard && (
            <button
              onClick={onOpenShopManagementDashboard}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-300"
              title="Mở Bảng Quản Lý Cửa Hàng"
            >
              <Store className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">📊 Quản Lý Cửa Hàng</span>
            </button>
          )}

          {/* Shop Product Post Button for Shop accounts */}
          {user && (user.role === 'SHOP' || isImpersonating) && onOpenAddProductModal && (
            <button
              onClick={onOpenAddProductModal}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer animate-pulse border border-amber-300"
              title="Đăng sản phẩm mới lên Cửa Hàng"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">ĐĂNG SP GIAN HÀNG</span>
            </button>
          )}

          {/* Super Admin Dashboard Button */}
          {user && user.role === 'SUPER_ADMIN' && onOpenSuperAdminDashboard && (
            <button
              onClick={onOpenSuperAdminDashboard}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer animate-pulse border border-amber-300"
              title="Quản trị Super Admin Overlord"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Bảng Quản Trị Admin</span>
            </button>
          )}

          {/* AI Live Design Studio Button for Super Admin */}
          {user && user.role === 'SUPER_ADMIN' && onOpenAiDesignStudio && (
            <button
              onClick={onOpenAiDesignStudio}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-pink-400/40"
              title="AI Trực Tuyến Hỗ Trợ Thiết Kế Web & Phát Sóng Realtime"
            >
              <Wand2 className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="hidden sm:inline">AI Thiết Kế Web</span>
            </button>
          )}

          {/* Admin UI Customizer Button for Super Admin */}
          {user && user.role === 'SUPER_ADMIN' && onOpenThemeCustomizer && (
            <button
              onClick={onOpenThemeCustomizer}
              className="bg-slate-900 hover:bg-slate-950 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-amber-400/40"
              title="Chỉnh sửa giao diện trang web"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Giao Diện</span>
            </button>
          )}

          {!user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 text-xs font-extrabold text-white bg-navy rounded-xl hover:bg-navy-dark transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" /> Đăng nhập / Đăng ký
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Wallet Balance Badge */}
              <button
                onClick={onOpenWalletDepositWithdrawModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-xs hidden sm:flex items-center gap-1.5 cursor-pointer hover:scale-105 transition"
                title="Bấm để Nạp / Rút tiền Ví TQ Pay"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-200" />
                <span>{(user.walletBalance || 0).toLocaleString('vi-VN')} đ</span>
              </button>

              {/* Coins Badge */}
              <button
                onClick={onOpenUserCoinsModal}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-xs hidden md:flex items-center gap-1.5 cursor-pointer hover:scale-105 transition"
                title="Bấm để xem Ví Xu TQ & Lịch sử nguồn gốc tích Xu"
              >
                <Coins className="w-3.5 h-3.5 text-yellow-100 animate-pulse" />
                <span>{(user.coins || 0).toLocaleString('vi-VN')} Xu</span>
              </button>

              {/* User Avatar & Menu */}
              <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl shadow-xs">
                
                {/* Clickable Avatar with Camera Overlay */}
                <div
                  onClick={onOpenChangeAvatar}
                  className="relative cursor-pointer group/avatar shrink-0"
                  title="Đổi ảnh đại diện Avatar"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0F2C59&color=fff`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-amber-400 group-hover/avatar:opacity-80 transition"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition">
                    <Camera className="w-3 h-3 text-amber-400" />
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-navy max-w-[90px] truncate">{user.name}</span>
                  <span className="text-[9px] font-extrabold text-orange uppercase">
                    {user.role === 'SUPER_ADMIN' ? 'OVERLORD ADMIN' : user.role === 'SHOP' ? 'CỬA HÀNG (SHOP)' : user.role}
                  </span>
                </div>

                {/* Change Password Button */}
                {onOpenChangePassword && (
                  <button
                    onClick={onOpenChangePassword}
                    className="text-gray-500 hover:text-amber-600 p-1 ml-1 transition cursor-pointer"
                    title="Đổi mật khẩu tài khoản"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-rose-600 p-1 transition cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Chat Inbox Button */}
          <button
            onClick={onOpenChatInbox}
            className="relative flex items-center justify-center p-2.5 text-navy hover:text-orange transition-colors rounded-xl hover:bg-gray-100 cursor-pointer"
            title="Xem danh sách tin nhắn với các Cửa hàng"
          >
            <MessageSquare className="w-5 h-5 text-navy" />
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              4
            </span>
          </button>

          {/* System Notification Bell Icon Button */}
          <div className="relative">
            <button
              onClick={onToggleNotifications}
              className="relative flex items-center justify-center p-2.5 text-navy hover:text-amber-600 transition-colors rounded-xl hover:bg-gray-100 cursor-pointer"
              title="Thông báo hoạt động hệ thống"
            >
              <Bell className={`w-5 h-5 ${unreadNotificationsCount > 0 ? 'text-amber-500 animate-bounce' : 'text-navy'}`} />
              
              {/* Unread Counter Badge */}
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-md animate-pulse border border-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Popover Drawer */}
            <NotificationCenter
              isOpen={isNotificationsOpen}
              onClose={onToggleNotifications}
              notifications={notifications}
              onMarkAllAsRead={onMarkAllNotificationsAsRead}
            />
          </div>

          {/* Cart Button */}
          <button
            onClick={onOpenCartDrawer}
            className="relative flex items-center justify-center p-2.5 text-navy hover:text-orange transition-colors rounded-xl hover:bg-gray-100 cursor-pointer"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Links Bar Removed to Maximize Screen Viewing Area */}

      {/* Bottom Navigation Dock Bar Hidden to Maximize Mobile Screen Space */}
    </header>
  );
};
