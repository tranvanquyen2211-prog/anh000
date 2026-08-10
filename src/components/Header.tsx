import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import type { ShopType } from '../types';
import { ShoppingCart, Search, User, LogOut, Wallet, Coins, Package, Palette, Key, Crown } from 'lucide-react';

interface HeaderProps {
  onOpenAuthModal: () => void;
  onOpenCartDrawer: () => void;
  onOpenOrderHistory: () => void;
  onOpenThemeCustomizer?: () => void;
  onOpenChangePassword?: () => void;
  onOpenSuperAdminDashboard?: () => void;
  selectedCategory: ShopType | 'ALL';
  onSelectCategory: (cat: ShopType | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: 'shop' | 'orders' | 'chat';
  setActiveTab: (tab: 'shop' | 'orders' | 'chat') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuthModal,
  onOpenCartDrawer,
  onOpenOrderHistory,
  onOpenThemeCustomizer,
  onOpenChangePassword,
  onOpenSuperAdminDashboard,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeTab,
  setActiveTab
}) => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { theme } = useTheme();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
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
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-xs hidden md:flex items-center gap-1.5 cursor-pointer hover:scale-105 transition"
                title="Ví TQ Xu tích lũy"
              >
                <Coins className="w-3.5 h-3.5 text-yellow-100" />
                <span>{(user.coins || 0).toLocaleString('vi-VN')} Xu</span>
              </div>

              {/* User Avatar & Menu */}
              <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl shadow-xs">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0F2C59&color=fff`}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-amber-400"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-navy max-w-[90px] truncate">{user.name}</span>
                  <span className="text-[9px] font-extrabold text-orange uppercase">
                    {user.role === 'SUPER_ADMIN' ? 'OVERLORD ADMIN' : user.role}
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
            onClick={onOpenOrderHistory}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 text-amber-300 font-extrabold cursor-pointer hover:bg-navy-light`}
          >
            <Package className="w-3.5 h-3.5" /> Lịch sử Đơn Hàng
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
    </header>
  );
};
