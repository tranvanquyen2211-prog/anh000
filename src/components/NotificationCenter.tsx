import React from 'react';
import { Bell, ShoppingBag, CreditCard, Sparkles, Key, Package, X } from 'lucide-react';

export interface SystemNotification {
  id: string;
  type: 'order' | 'withdrawal' | 'product' | 'account' | 'coin';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAllAsRead: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'withdrawal':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'product':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'account':
        return <Key className="w-4 h-4 text-purple-500" />;
      case 'coin':
        return <Sparkles className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-navy" />;
    }
  };

  return (
    <>
      {/* Mobile Modal Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
      />

      {/* Responsive Notification Drawer: Fixed Overlay on Mobile, Popover Dropdown on Desktop */}
      <div className="fixed inset-x-3 top-16 md:absolute md:inset-auto md:right-0 md:top-12 z-50 max-w-sm sm:max-w-md w-full mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 my-2">
        
        {/* Notification Header */}
        <div className="bg-navy text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-amber-400 animate-bounce" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">THÔNG BÁO HOẠT ĐỘNG HỆ THỐNG</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[10px] bg-white/15 hover:bg-white/25 text-amber-300 px-2.5 py-1 rounded-full transition font-bold cursor-pointer"
            >
              ✓ Đã xem
            </button>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-navy-light transition cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

      {/* Notifications List Body */}
      <div className="max-h-96 overflow-y-auto custom-scrollbar p-2 space-y-1.5 text-xs">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-2xl border transition-all flex gap-3 ${
                notif.isRead
                  ? 'bg-white border-gray-100 text-gray-600'
                  : 'bg-amber-50/70 border-amber-200 text-navy font-semibold shadow-2xs'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-navy truncate text-xs">{notif.title}</h4>
                  <span className="text-[9px] text-gray-400 shrink-0 font-mono">{notif.timestamp}</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">{notif.message}</p>
              </div>

              {!notif.isRead && (
                <span className="w-2 h-2 bg-orange rounded-full shrink-0 mt-1 animate-pulse"></span>
              )}
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-gray-400 space-y-1">
            <Bell className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-500">Chưa có thông báo mới nào</p>
            <p className="text-[10px] text-gray-400">Các hoạt động mua bán, hoàn xu & tài khoản sẽ hiển thị tại đây.</p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 border-t border-gray-100 p-2 text-center text-[10px] text-gray-400 font-medium">
        Supabase Realtime Activity Notification System
      </div>
    </div>
    </>
  );
};
