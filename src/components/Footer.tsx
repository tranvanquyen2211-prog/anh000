import React from 'react';
import { useTheme, DEFAULT_FOOTER_CONFIG } from '../context/ThemeContext';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  FileText,
  HelpCircle,
  Truck,
  CreditCard,
  QrCode,
  Wallet,
  Globe
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const fConfig = theme.footerConfig || DEFAULT_FOOTER_CONFIG;

  const showCol1 = fConfig.showCol1 !== false;
  const showCol2 = fConfig.showCol2 !== false;
  const showCol3 = fConfig.showCol3 !== false;
  const showCol4 = fConfig.showCol4 !== false;

  const activeColsCount = [showCol1, showCol2, showCol3, showCol4].filter(Boolean).length;

  return (
    <footer className="bg-slate-950 text-gray-300 mt-16 border-t border-slate-800/80 relative overflow-hidden select-none">
      
      {/* Top Accent Gradient Line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#ee4d2d] via-amber-400 to-[#FF6B00]"></div>

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeColsCount > 0 && (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${activeColsCount > 0 ? activeColsCount : 4} gap-8 lg:gap-12 text-xs`}>
            
            {/* CỘT 1: LOGO & GIỚI THIỆU HỆ THỐNG */}
            {showCol1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gradient-to-tr from-[#ee4d2d] to-amber-400 text-white rounded-xl font-black flex items-center justify-center text-lg shadow-lg border border-amber-300/30 tracking-wider">
                    {theme.logoText || 'TQ'}
                  </div>
                  <div>
                    <span className="text-xl font-black text-white tracking-wide uppercase block">
                      {fConfig.col1Title || theme.siteName || 'TQ Store'}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      Hệ Thống Mua Sắm Đa Mô Hình
                    </span>
                  </div>
                </div>

                <p className="text-slate-400 leading-relaxed font-medium">
                  {fConfig.col1Desc || 'Hệ thống thương mại điện tử mua sắm đa mô hình hàng đầu. Tích hợp Cho Thuê Trang Phục Dạ Hội & Cưới, Thời Trang Shopee Mall, Đồ Ăn & Trà Sữa Giao Tận Nơi, Spa & Làm Đẹp Chuyên Nghiệp.'}
                </p>

                <div className="space-y-2 pt-1 font-medium text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{fConfig.address || 'Tòa nhà TQ Tower, Số 88 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-mono font-bold text-amber-400">{fConfig.hotline || '1900 6868 - 0988 123 456'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{fConfig.email || 'support@tqstore.vn'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CỘT 2: DANH MỤC NỔI BẬT */}
            {showCol2 && (
              <div className="space-y-4">
                <h4 className="font-black text-amber-400 uppercase text-xs tracking-wider border-b border-slate-800 pb-2">
                  👗 DANH MỤC NỔI BẬT
                </h4>
                <ul className="space-y-2.5 font-medium text-slate-300">
                  <li className="hover:text-amber-400 transition cursor-pointer flex items-center gap-2">
                    <span className="text-sm">👗</span> Cho Thuê Trang Phục Dạ Hội & Cưới
                  </li>
                  <li className="hover:text-amber-400 transition cursor-pointer flex items-center gap-2">
                    <span className="text-sm">🛍️</span> Thời Trang & Phụ Kiện Nam Nữ
                  </li>
                  <li className="hover:text-amber-400 transition cursor-pointer flex items-center gap-2">
                    <span className="text-sm">🧋</span> Đồ Ăn & Trà Sữa Đặt Giao 24/7
                  </li>
                  <li className="hover:text-amber-400 transition cursor-pointer flex items-center gap-2">
                    <span className="text-sm">💄</span> Gói Chăm Sóc Da & Spa Beauty
                  </li>
                  <li className="hover:text-amber-400 transition cursor-pointer flex items-center gap-2">
                    <span className="text-sm">🚖</span> Đặt Xe Taxi & Dịch Vụ Đưa Đón
                  </li>
                </ul>
              </div>
            )}

            {/* CỘT 3: CHÍNH SÁCH & HỖ TRỢ */}
            {showCol3 && (
              <div className="space-y-4">
                <h4 className="font-black text-amber-400 uppercase text-xs tracking-wider border-b border-slate-800 pb-2">
                  🛡️ CHÍNH SÁCH & HỖ TRỢ
                </h4>
                <ul className="space-y-2.5 font-medium text-slate-300">
                  <li className="hover:text-amber-400 transition cursor-pointer flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Chính sách bảo mật thông tin
                  </li>
                  <li className="hover:text-amber-400 transition cursor-pointer flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> Điều khoản sử dụng dịch vụ
                  </li>
                  <li className="hover:text-amber-400 transition cursor-pointer flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Hướng dẫn mua hàng & Đổi trả
                  </li>
                  <li className="hover:text-amber-400 transition cursor-pointer flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-purple-400" /> Chính sách giao hàng & Kiểm hàng
                  </li>
                </ul>
                <div className="pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Tổng đài CSKH 24/7</span>
                    <span className="text-sm font-mono font-black text-amber-400 block">{fConfig.hotline || '1900 6868'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CỘT 4: PHƯƠNG THỨC THANH TOÁN & MẠNG XÃ HỘI */}
            {showCol4 && (
              <div className="space-y-5">
                {/* Phương Thức Thanh Toán */}
                <div className="space-y-3">
                  <h4 className="font-black text-amber-400 uppercase text-xs tracking-wider border-b border-slate-800 pb-2">
                    💳 PHƯƠNG THỨC THANH TOÁN
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                    <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-1.5 text-emerald-400">
                      <Wallet className="w-4 h-4 shrink-0" /> Ví TQ Pay
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-1.5 text-blue-400">
                      <QrCode className="w-4 h-4 shrink-0" /> VietQR Bank
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-1.5 text-amber-400">
                      <Truck className="w-4 h-4 shrink-0" /> COD Tiền Mặt
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-1.5 text-purple-400">
                      <CreditCard className="w-4 h-4 shrink-0" /> Thẻ Visa/Master
                    </div>
                  </div>
                </div>

                {/* Kết Nối Mạng Xã Hội */}
                <div className="space-y-3">
                  <h4 className="font-black text-slate-200 uppercase text-[11px] tracking-wider">
                    🌐 KẾT NỐI VỚI CHÚNG TÔI
                  </h4>
                  <div className="flex items-center gap-2.5">
                    <a
                      href="#facebook"
                      className="w-8 h-8 bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl border border-slate-800 flex items-center justify-center font-bold text-xs transition cursor-pointer"
                      title="Facebook Fanpage"
                    >
                      f
                    </a>
                    <a
                      href="#zalo"
                      className="w-8 h-8 bg-slate-900 hover:bg-blue-500 text-slate-300 hover:text-white rounded-xl border border-slate-800 flex items-center justify-center font-bold text-[10px] transition cursor-pointer"
                      title="Zalo Official Account"
                    >
                      Zalo
                    </a>
                    <a
                      href="#youtube"
                      className="w-8 h-8 bg-slate-900 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl border border-slate-800 flex items-center justify-center font-bold text-xs transition cursor-pointer"
                      title="YouTube Channel"
                    >
                      YT
                    </a>
                    <a
                      href="#tiktok"
                      className="w-8 h-8 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-800 flex items-center justify-center font-bold text-[10px] transition cursor-pointer"
                      title="TikTok Official"
                    >
                      TikTok
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/90 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-medium">
          <p className="text-slate-400">
            {fConfig.copyrightText || 'Copyright © 2026 TQ Store System. All rights reserved.'}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold">
            <span className="hover:text-slate-300 cursor-pointer transition">Bảo Mật</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer transition">Điều Khoản</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer transition">Trợ Giúp</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer transition flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-400" /> Tiếng Việt (VN)
            </span>
          </div>
        </div>
      </div>

    </footer>
  );
};
