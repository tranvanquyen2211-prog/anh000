import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-white mt-16 pt-12 pb-8 border-t border-navy-light relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-gray-300">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 text-navy rounded-lg font-black flex items-center justify-center text-lg">
              TQ
            </div>
            <span className="text-xl font-black text-white tracking-wider">TQ Store</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Hệ thống mua sắm đa mô hình (Cho Thuê Đồ, Shop Bán Đồ, Đồ Ăn & Uống F&B, Làm Đẹp & Spa) kết nối thời gian thực bằng React, Tailwind CSS và Supabase.
          </p>
        </div>

        <div>
          <h4 className="font-extrabold text-amber-400 uppercase text-xs tracking-wider mb-3">Danh Mục Nổi Bật</h4>
          <ul className="space-y-2">
            <li>👗 Cho Thuê Trang Phục Dạ Hội & Cưới</li>
            <li>🛍️ Thời Trang & Phụ Kiện Bán Đồ</li>
            <li>🧋 Đồ Ăn & Trà Sữa Đặt Giao Tận Nơi</li>
            <li>💄 Gói Chăm Sóc Da & Spa Beauty</li>
          </ul>
        </div>

        <div>
          <h4 className="font-extrabold text-amber-400 uppercase text-xs tracking-wider mb-3">Công Nghệ Tích Hợp</h4>
          <ul className="space-y-2">
            <li>⚡ Vite + React + TypeScript</li>
            <li>🎨 Tailwind CSS Vibrant Aesthetics</li>
            <li>🔥 Supabase Realtime Postgres Channels</li>
            <li>💳 Ví Cá Nhân TQ Pay Giảm Thêm 2%</li>
          </ul>
        </div>

        <div>
          <h4 className="font-extrabold text-amber-400 uppercase text-xs tracking-wider mb-3">Liên Hệ & Hỗ Trợ</h4>
          <p className="text-gray-400 mb-2">Tổng đài CSKH thời gian thực 24/7 qua Live Chat Widget góc dưới màn hình.</p>
          <p className="text-gray-400">Email: support@tqstore.vn</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-navy-light text-center text-[11px] text-gray-400">
        <p>&copy; 2026 TQ Store System. Unified Realtime Multi-Model Platform connected with Supabase.</p>
      </div>
    </footer>
  );
};
