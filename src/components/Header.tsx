import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import type { ShopType } from '../types';
import { NotificationCenter, type SystemNotification } from './NotificationCenter';
import { ShoppingCart, Search, User, LogOut, Wallet, Coins, Package, Palette, Key, Crown, PlusCircle, Store, Camera, Bell, MessageSquare, Tv, Wand2 } from 'lucide-react';

interface HeaderProps {
  onOpenAuthModal: () => void;
  onOpenCartDrawer: () => void;
  onOpenOrderHistory: () => void;
  onOpenChatInbox: () => void;
  onOpenWatchToEarnModal?: () => void;
  onOpenUserCoinsModal?: () => void;
  onOpenThemeCustomizer?: () => void;
  onOpenAiDesignStudio?: () => void;
  onOpenChangePassword?: () => void;
  onOpenChangeAvatar?: () => void;
  onOpenSuperAdminDashboard?: () => void;
  onOpenAddProductModal?: () => void;
  onOpenShopManagementDashboard?: () => void;
  selectedCategory: ShopType | 'ALL';
  onSelectCategory: (cat: ShopType | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: 'shop' | 'orders' | 'chat';
  setActiveTab: (tab: 'shop' | 'orders' | 'chat') => void;

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
  onOpenThemeCustomizer,
  onOpenAiDesignStudio,
  onOpenChangePassword,
  onOpenChangeAvatar,
  onOpenSuperAdminDashboard,
  onOpenAddProductModal,
  onOpenShopManagementDashboard,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeTab,
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 relative">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('shop')}
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

        {/* Search Bar */}
        <div className="flex-1 max-w-xl hidden md:flex items-center bg-gray-100 rounded-full border border-gray-200 focus-within:border-navy focus-within:bg-white transition-all">
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
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Tìm trang phục thuê, sản phẩm, đồ ăn, gói spa..."
            className="w-full bg-transparent px-4 py-2 text-xs text-gray-800 focus:outline-none"
          />
          <button className="bg-navy text-white px-5 py-2.5 rounded-r-full hover:bg-navy-dark transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Actions & Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          
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
              {/* Wallet Badge */}
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-xs hidden md:flex items-center gap-1.5 cursor-pointer hover:scale-105 transition"
                title="Ví TQ Pay"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-200" />
                <span>{(user.walletBalance || 0).toLocaleString('vi-VN')} đ</span>
              </div>

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

      {/* Navigation Links */}
      <nav className="bg-navy text-white shadow-inner border-t border-navy-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-1 overflow-x-auto scrollbar-none text-xs font-semibold py-1.5">
          <button
            onClick={() => { setActiveTab('shop'); onSelectCategory('ALL'); }}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'shop' && selectedCategory === 'ALL' ? 'bg-orange text-white font-extrabold' : 'hover:bg-navy-light text-gray-200'
            }`}
          >
            Trang chủ
          </button>
          <button
            onClick={() => { setActiveTab('shop'); onSelectCategory('RENTAL'); }}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'shop' && selectedCategory === 'RENTAL' ? 'bg-orange text-white font-extrabold' : 'hover:bg-navy-light text-gray-200'
            }`}
          >
            👗 Cho Thuê Đồ
          </button>
          <button
            onClick={() => { setActiveTab('shop'); onSelectCategory('RETAIL'); }}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'shop' && selectedCategory === 'RETAIL' ? 'bg-orange text-white font-extrabold' : 'hover:bg-navy-light text-gray-200'
            }`}
          >
            🛍️ Shop Bán Đồ
          </button>
          <button
            onClick={() => { setActiveTab('shop'); onSelectCategory('FNB'); }}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'shop' && selectedCategory === 'FNB' ? 'bg-orange text-white font-extrabold' : 'hover:bg-navy-light text-gray-200'
            }`}
          >
            🧋 Đồ Ăn & Uống
          </button>
          <button
            onClick={() => { setActiveTab('shop'); onSelectCategory('BEAUTY'); }}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'shop' && selectedCategory === 'BEAUTY' ? 'bg-orange text-white font-extrabold' : 'hover:bg-navy-light text-gray-200'
            }`}
          >
            💄 Làm Đẹp & Spa
          </button>
          <button
            onClick={() => { setActiveTab('shop'); onSelectCategory('TAXI'); }}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'shop' && selectedCategory === 'TAXI' ? 'bg-amber-400 text-slate-950 font-black' : 'hover:bg-navy-light text-gray-200'
            }`}
          >
            🚖 Gọi Taxi & Đặt Xe
          </button>

          <button
            onClick={onOpenOrderHistory}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 text-amber-300 font-extrabold cursor-pointer hover:bg-navy-light`}
          >
            <Package className="w-3.5 h-3.5" /> Lịch sử Đơn Hàng
          </button>

          {/* Chat Inbox Navigation Shortcut */}
          <button
            onClick={onOpenChatInbox}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 text-emerald-300 font-extrabold cursor-pointer hover:bg-navy-light`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Tin Nhắn Với Shop
          </button>

          {/* Extra Admin Control Shortcut */}
          {user && user.role === 'SUPER_ADMIN' && onOpenSuperAdminDashboard && (
            <button
              onClick={onOpenSuperAdminDashboard}
              className="px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 text-yellow-400 font-extrabold cursor-pointer hover:bg-navy-light ml-auto"
            >
              <Crown className="w-3.5 h-3.5" /> Bảng Điều Hành Admin
            </button>
          )}
        </div>
      </nav>

      {/* 📱 MOBILE ADAPTIVE BOTTOM NAVIGATION BAR (Auto-detects Mobile Devices) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 text-slate-200 safe-pb flex items-center justify-around py-2 shadow-2xl">
        <button
          onClick={() => { setActiveTab('shop'); onSelectCategory('ALL'); }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'shop' && selectedCategory === 'ALL' ? 'text-amber-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <span className="text-base">🏠</span>
          <span>Trang Chủ</span>
        </button>

        {onOpenWatchToEarnModal && (
          <button
            onClick={onOpenWatchToEarnModal}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-pink-400 relative cursor-pointer"
          >
            <Tv className="w-5 h-5 text-pink-400 animate-pulse" />
            <span>Kiếm Xu</span>
          </button>
        )}

        <button
          onClick={onOpenCartDrawer}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400 relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-amber-300" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </div>
          <span>Giỏ Hàng</span>
        </button>

        <button
          onClick={onOpenChatInbox}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-emerald-400 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <span>Tin Nhắn</span>
        </button>

        <button
          onClick={user ? onOpenOrderHistory : onOpenAuthModal}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400 cursor-pointer"
        >
          <User className="w-5 h-5 text-slate-300" />
          <span>{user ? (user.name.split(' ')[0] || 'Tài khoản') : 'Đăng Nhập'}</span>
        </button>
      </div>
    </header>
  );
};
