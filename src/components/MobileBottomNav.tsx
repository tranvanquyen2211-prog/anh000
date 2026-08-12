import React from 'react';
import { Home, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  onGoHome: () => void;
  onToggleNotifications: () => void;
  unreadNotificationsCount?: number;
  onOpenUserProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onGoHome,
  onToggleNotifications,
  unreadNotificationsCount = 0,
  onOpenUserProfile
}) => {
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-4 py-1.5 shadow-2xl transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* 1. Trang chủ */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex flex-col items-center justify-center py-1 px-4 text-slate-400 hover:text-amber-400 active:scale-95 transition-all cursor-pointer group"
          title="Trở về Trang chủ"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-300 group-hover:text-amber-400" />
          <span className="text-[11px] font-black mt-0.5 text-slate-300 group-hover:text-amber-400">
            Trang chủ
          </span>
        </button>

        {/* 2. Thông báo */}
        <button
          type="button"
          onClick={onToggleNotifications}
          className="flex flex-col items-center justify-center py-1 px-4 text-slate-400 hover:text-amber-400 active:scale-95 transition-all cursor-pointer group relative"
          title="Xem thông báo hệ thống"
        >
          <div className="relative">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-300 group-hover:text-amber-400" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-slate-950 shadow-xs animate-pulse">
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-black mt-0.5 text-slate-300 group-hover:text-amber-400">
            Thông báo
          </span>
        </button>

        {/* 3. Tôi */}
        <button
          type="button"
          onClick={onOpenUserProfile}
          className="flex flex-col items-center justify-center py-1 px-4 text-slate-400 hover:text-amber-400 active:scale-95 transition-all cursor-pointer group"
          title="Tài khoản cá nhân"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-black mt-0.5 text-slate-300 group-hover:text-amber-400">
            {user ? (user.name.split(' ')[0] || 'Tôi') : 'Tôi'}
          </span>
        </button>

      </div>
    </nav>
  );
};
