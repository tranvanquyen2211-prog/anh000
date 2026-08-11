import React, { useState, useEffect } from 'react';
import { Wrench, Clock, ShieldAlert, Key, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface MaintenanceOverlayProps {
  title?: string;
  message?: string;
  endTime?: string;
  onOpenAuthModal?: () => void;
  onCheckStatus?: () => void;
}

export const MaintenanceOverlay: React.FC<MaintenanceOverlayProps> = ({
  title = '🚧 HỆ THỐNG ĐANG BẢO TRÌ & NÂNG CẤP ĐỊNH KỲ',
  message = 'Hệ thống TQ Marketplace đang tiến hành nâng cấp hạ tầng máy chủ đám mây Supabase Realtime và tối ưu hóa trải nghiệm. Vui lòng quay lại sau!',
  endTime,
  onOpenAuthModal,
  onCheckStatus
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endTime) {
      setTimeLeft(null);
      setIsExpired(false);
      return;
    }

    const calculateTime = () => {
      const target = new Date(endTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        if (onCheckStatus) onCheckStatus();
        return;
      }

      setIsExpired(false);
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime, onCheckStatus]);

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 text-center text-slate-100 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Glow backdrop effects */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Icon & Badge */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 text-slate-950 rounded-3xl flex items-center justify-center font-black shadow-xl animate-bounce">
            <Wrench className="w-10 h-10" />
          </div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> THÔNG BÁO BẢO TRÌ SUPER ADMIN OVERLORD
          </span>
        </div>

        {/* Title & Announcement */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-amber-400 uppercase tracking-wide">
            {title}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium">
            {message}
          </p>
        </div>

        {/* Countdown Timer Display */}
        {endTime && (
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" /> DỰ KIẾN HOÀN TẤT VÀ TỰ ĐỘNG MỞ KHÓA TRONG:
            </div>

            {isExpired ? (
              <div className="text-emerald-400 font-black text-base uppercase flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Hệ thống đã hết giờ bảo trì! Đang mở khóa truy cập...
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                <div className="bg-slate-900 border border-amber-500/30 p-2.5 rounded-xl">
                  <span className="font-mono font-black text-2xl text-amber-400 block">
                    {String(timeLeft?.hours || 0).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Giờ</span>
                </div>
                <div className="bg-slate-900 border border-amber-500/30 p-2.5 rounded-xl">
                  <span className="font-mono font-black text-2xl text-amber-400 block">
                    {String(timeLeft?.minutes || 0).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Phút</span>
                </div>
                <div className="bg-slate-900 border border-amber-500/30 p-2.5 rounded-xl">
                  <span className="font-mono font-black text-2xl text-amber-400 block">
                    {String(timeLeft?.seconds || 0).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Giây</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informative Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-left text-xs text-amber-200/90 space-y-1">
          <div className="font-bold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Lưu ý cho người dùng & Khách hàng:
          </div>
          <p className="text-[11px] leading-relaxed">
            - Mọi thông tin đơn hàng, số dư ví TQ Pay và tích lũy Xu của quý khách đều được bảo mật an toàn 100%.<br />
            - Khi hết thời gian đếm ngược (hoặc khi Admin mở lại khóa), hệ thống sẽ mở lại bình thường.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-slate-950" /> 🔑 Đăng Nhập Super Admin
            </button>
          )}

          {onCheckStatus && (
            <button
              type="button"
              onClick={onCheckStatus}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3 rounded-2xl text-xs transition border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" /> 🔄 Tải Lại Trang
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
