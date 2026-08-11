import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Wallet, Coins, Key, LogOut, Package, Camera, Crown, Store, ShieldCheck, ChevronRight, X, Wrench } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: () => void;
  onOpenOrderHistory: () => void;
  onOpenWalletDepositWithdrawModal?: () => void;
  onOpenUserCoinsModal?: () => void;
  onOpenChangePassword?: () => void;
  onOpenChangeAvatar?: () => void;
  onOpenSuperAdminDashboard?: () => void;
  onOpenShopManagementDashboard?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAuthModal,
  onOpenOrderHistory,
  onOpenWalletDepositWithdrawModal,
  onOpenUserCoinsModal,
  onOpenChangePassword,
  onOpenChangeAvatar,
  onOpenSuperAdminDashboard,
  onOpenShopManagementDashboard
}) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative border border-gray-100 overflow-hidden my-auto flex flex-col">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#0F2C59] via-navy-light to-[#ee4d2d] text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="font-black text-lg uppercase tracking-wider flex items-center gap-2">
            <User className="w-5 h-5 text-amber-300" /> TÀI KHOẢN CÁ NHÂN (TÔI)
          </h3>
          <p className="text-xs text-gray-200 mt-0.5 font-medium">Quản lý số dư ví, điểm Xu và thông tin bảo mật</p>
        </div>

        <div className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          
          {!user ? (
            /* Unauthenticated View */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto text-navy">
                <User className="w-8 h-8 text-navy" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Bạn chưa đăng nhập</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  Đăng nhập để xem số dư Ví TQ Pay, tích Xu hoàn tiền và theo dõi lịch sử đơn hàng của bạn!
                </p>
              </div>
              <button
                onClick={() => { onClose(); onOpenAuthModal(); }}
                className="w-full bg-[#ee4d2d] hover:bg-[#d0011b] text-white text-sm font-black py-3 rounded-2xl shadow-md transition cursor-pointer uppercase tracking-wider"
              >
                ĐĂNG NHẬP / ĐĂNG KÝ NGAY
              </button>
            </div>
          ) : (
            /* Authenticated User View */
            <>
              {/* User Avatar & Identity Card */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center gap-3.5 shadow-xs">
                <div
                  onClick={() => { onClose(); if (onOpenChangeAvatar) onOpenChangeAvatar(); }}
                  className="relative cursor-pointer group shrink-0"
                  title="Bấm để thay đổi Ảnh Đại Diện"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0F2C59&color=fff`}
                    alt={user.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#ee4d2d] shadow-sm group-hover:opacity-80 transition"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 text-base truncate">{user.name}</h4>
                    <span className="bg-[#ee4d2d]/10 text-[#ee4d2d] text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                      {user.role === 'SUPER_ADMIN' ? 'OVERLORD ADMIN' : user.role === 'SHOP' ? 'SHOP' : 'KHÁCH HÀNG'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user.email || user.phone || 'Tài khoản chính chủ'}</p>
                  <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Đã xác thực bảo mật Supabase
                  </span>
                </div>
              </div>

              {/* Quick Balances Row: Số dư ví TQ & Số dư xu */}
              <div className="grid grid-cols-2 gap-3">
                {/* 💳 Số dư ví TQ */}
                <div
                  onClick={() => { onClose(); if (onOpenWalletDepositWithdrawModal) onOpenWalletDepositWithdrawModal(); }}
                  className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-3.5 rounded-2xl shadow-sm cursor-pointer hover:scale-102 transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-100">
                    <span className="flex items-center gap-1">
                      <Wallet className="w-4 h-4 text-emerald-200" /> Số Dư Ví TQ
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
                  </div>
                  <div className="text-base sm:text-lg font-black font-mono mt-2 text-white truncate">
                    {(user.walletBalance || 0).toLocaleString('vi-VN')} đ
                  </div>
                  <span className="text-[9px] text-emerald-200 font-bold mt-1">Chạm để Nạp / Rút tiền</span>
                </div>

                {/* 🪙 Số dư xu */}
                <div
                  onClick={() => { onClose(); if (onOpenUserCoinsModal) onOpenUserCoinsModal(); }}
                  className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white p-3.5 rounded-2xl shadow-sm cursor-pointer hover:scale-102 transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-yellow-100">
                    <span className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-100" /> Số Dư Xu TQ
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-yellow-100" />
                  </div>
                  <div className="text-base sm:text-lg font-black font-mono mt-2 text-white truncate">
                    {(user.coins || 0).toLocaleString('vi-VN')} Xu
                  </div>
                  <span className="text-[9px] text-yellow-100 font-bold mt-1">Chạm để xem tích Xu</span>
                </div>
              </div>

              {/* Action Buttons Menu List */}
              <div className="space-y-2 text-xs font-bold text-slate-800 pt-1">
                
                {/* 1. Lịch sử giao dịch & Đơn hàng */}
                <div
                  onClick={() => { onClose(); onOpenOrderHistory(); }}
                  className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-2xl flex items-center justify-between cursor-pointer transition border border-purple-200/80 shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <Package className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">Lịch Sử Giao Dịch & Đơn Hàng</span>
                      <span className="text-[10px] text-purple-700 font-medium">Xem danh sách các đơn đã đặt, thuê đồ & nạp tiền</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-purple-500 group-hover:translate-x-0.5 transition" />
                </div>

                {/* 2. Đổi mật khẩu tài khoản */}
                <div
                  onClick={() => { onClose(); if (onOpenChangePassword) onOpenChangePassword(); }}
                  className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 rounded-2xl flex items-center justify-between cursor-pointer transition border border-amber-200/80 shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <Key className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">Đổi Mật Khẩu Tài Khoản</span>
                      <span className="text-[10px] text-amber-800 font-medium">Bảo vệ tài khoản và cập nhật mật khẩu mới</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-amber-600 group-hover:translate-x-0.5 transition" />
                </div>

                {/* 3. Thông tin tài khoản & Ảnh đại diện */}
                <div
                  onClick={() => { onClose(); if (onOpenChangeAvatar) onOpenChangeAvatar(); }}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-between cursor-pointer transition border border-gray-200/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-xs">Chỉnh sửa Ảnh Đại Diện Avatar</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                {/* Shop Management / Admin Dashboard (Role-based) */}
                {user.role === 'SUPER_ADMIN' && onOpenSuperAdminDashboard && (
                  <div className="space-y-2 pt-1 border-t border-amber-200/60">
                    <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider px-1">
                      👑 NÚT BẤM NHANH QUẢN TRỊ SUPER ADMIN (MỤC TÔI)
                    </div>

                    {/* 1. Quick Maintenance Lock Shortcut */}
                    <div
                      onClick={() => { onClose(); onOpenSuperAdminDashboard(); }}
                      className="p-3.5 bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-2xl flex items-center justify-between cursor-pointer transition shadow-md group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                          <Wrench className="w-5 h-5 animate-bounce" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-white text-xs sm:text-sm">🚨 Bật/Tắt Khóa Bảo Trì Hệ Thống</span>
                          <span className="text-[10px] text-amber-100 font-medium">Bấm chuyển ngay vào Cấu hình Đếm ngược & Master Control</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4.5 h-4.5 text-white group-hover:translate-x-0.5 transition" />
                    </div>

                    {/* 2. Full Admin Dashboard Shortcut */}
                    <div
                      onClick={() => { onClose(); onOpenSuperAdminDashboard(); }}
                      className="p-3 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:bg-amber-500/20 rounded-2xl flex items-center justify-between cursor-pointer transition border border-amber-300/40 text-amber-900"
                    >
                      <div className="flex items-center gap-3 font-black">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                          <Crown className="w-4 h-4" />
                        </div>
                        <span>Bảng Điều Hành Super Admin Overlord</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                )}

                {user.role === 'SHOP' && onOpenShopManagementDashboard && (
                  <div
                    onClick={() => { onClose(); onOpenShopManagementDashboard(); }}
                    className="p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:bg-blue-500/20 rounded-2xl flex items-center justify-between cursor-pointer transition border border-blue-300/40 text-blue-900"
                  >
                    <div className="flex items-center gap-3 font-black">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <span>Quản Lý Gian Hàng Shop</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                )}

                {/* 4. Nút Đăng xuất */}
                <button
                  onClick={() => { onClose(); logout(); }}
                  className="w-full mt-4 p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer border border-rose-200/80 shadow-xs"
                >
                  <LogOut className="w-4.5 h-4.5" /> ĐĂNG XUẤT TÀI KHOẢN
                </button>

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
