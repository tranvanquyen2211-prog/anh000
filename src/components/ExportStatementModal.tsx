import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Order } from '../types';
import {
  X,
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  ArrowLeft,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface ExportStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: 'SUPER_ADMIN' | 'SHOP';
  shopName?: string;
  allOrders?: Order[];
}

export const ExportStatementModal: React.FC<ExportStatementModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  shopName,
  allOrders = []
}) => {
  const { user } = useAuth();
  const { orders: cartOrders } = useCart();
  const { addToast } = useToast();

  const [step, setStep] = useState<'config' | 'ready'>('config');
  const [fileFormat, setFileFormat] = useState<'PDF' | 'EXCEL'>('EXCEL');

  // Default time range: Current month start to today
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(firstDayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  if (!isOpen || !user) return null;

  const ordersToFilter = allOrders.length > 0 ? allOrders : cartOrders;

  // Filter orders based on user role and date range
  const filteredOrders = ordersToFilter.filter(o => {
    // Role filter
    if (targetRole === 'SHOP' && shopName) {
      const isShopOrder = o.items?.some(i => (i as any).shopName?.toLowerCase() === shopName.toLowerCase()) ||
        (o as any).shop_name?.toLowerCase() === shopName.toLowerCase() ||
        (o as any).shopName?.toLowerCase() === shopName.toLowerCase();
      if (!isShopOrder) return false;
    }

    // Date range filter
    if (o.created_at) {
      const orderDateStr = new Date(o.created_at).toISOString().split('T')[0];
      if (startDate && orderDateStr < startDate) return false;
      if (endDate && orderDateStr > endDate) return false;
    }

    return true;
  });

  // Statement Analytics Computations
  const totalGrossRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);

  const totalPlatformFees = filteredOrders.reduce((sum, o) => {
    if (o.platform_fee_amount !== undefined) return sum + o.platform_fee_amount;
    const feeRate = o.platform_fee_rate !== undefined ? o.platform_fee_rate : 5;
    return sum + Math.round((o.total_price || 0) * (feeRate / 100));
  }, 0);

  const totalNetRevenue = targetRole === 'SUPER_ADMIN' ? totalPlatformFees : (totalGrossRevenue - totalPlatformFees);

  const handleApplyPreset = (preset: 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_30') => {
    const now = new Date();
    if (preset === 'ALL') {
      setStartDate('2025-01-01');
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'THIS_MONTH') {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'LAST_MONTH') {
      setStartDate(new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]);
      setEndDate(new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]);
    } else if (preset === 'LAST_30') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(past30.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  const handleProceedToReady = () => {
    if (startDate > endDate) {
      addToast('Ngày bắt đầu không được lớn hơn ngày kết thúc!', 'error');
      return;
    }

    if (filteredOrders.length === 0) {
      addToast('Không có dữ liệu đơn hàng trong khoảng thời gian đã chọn!', 'info');
    }

    setStep('ready');
    addToast('✅ Đã khởi tạo xong dữ liệu Sao kê! Bấm "Lưu File" để chọn nơi lưu.', 'success');
  };

  // Generate and trigger native browser file download (Excel / PDF)
  const handleDownloadFile = () => {
    const timeLabel = `${startDate}_den_${endDate}`;
    const scopeName = targetRole === 'SUPER_ADMIN' ? 'TOAN_SAN' : (shopName || user.name || 'SHOP').replace(/\s+/g, '_');

    if (fileFormat === 'EXCEL') {
      // Build UTF-8 CSV string
      let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Vietnamese Unicode support
      csvContent += `SAO KÊ DOANH THU ${targetRole === 'SUPER_ADMIN' ? 'TOÀN SÀN TQ MARKETPLACE' : `CỬA HÀNG ${shopName || user.name}`}\n`;
      csvContent += `Thời gian sao kê:,Từ ${startDate} đến ${endDate}\n`;
      csvContent += `Ngày xuất sao kê:,${new Date().toLocaleString('vi-VN')}\n`;
      csvContent += `Tổng số đơn hàng:,${filteredOrders.length}\n`;
      csvContent += `Tổng doanh thu gộp:,${totalGrossRevenue} VNĐ\n`;
      csvContent += `Phí sàn TQ Store (5%):,${totalPlatformFees} VNĐ\n`;
      csvContent += `Doanh thu thực nhận:,${totalNetRevenue} VNĐ\n\n`;

      csvContent += `MÃ ĐƠN HÀNG,THỜI GIAN,KHÁCH HÀNG,PHƯƠNG THỨC TT,TỔNG TIỀN GỘP,PHÍ SÀN,THỰC NHẬN,TRẠNG THÁI\n`;

      filteredOrders.forEach(o => {
        const feeRate = o.platform_fee_rate !== undefined ? o.platform_fee_rate : 5;
        const feeAmt = o.platform_fee_amount !== undefined ? o.platform_fee_amount : Math.round(o.total_price * (feeRate / 100));
        const netAmt = o.total_price - feeAmt;

        csvContent += `"#${o.id}","${new Date(o.created_at).toLocaleString('vi-VN')}","${o.user_name || 'Khách Hàng'}","${o.payment_method === 'wallet' ? 'Ví TQ Pay' : 'Tiền Mặt/CK'}","${o.total_price}","${feeAmt}","${netAmt}","${o.status === 'completed' ? 'Hoàn Thành' : 'Đang Xử Lý'}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sao_Ke_Doanh_Thu_${scopeName}_${timeLabel}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(`💾 Đã xuất file Excel Sao kê thành công!`, 'success');
    } else {
      // Build HTML PDF Print Document
      const pdfWindow = window.open('', '_blank');
      if (!pdfWindow) {
        addToast('Trình duyệt đang chặn Popup. Vui lòng cho phép Popup để tải/in file PDF!', 'error');
        return;
      }

      const rowsHtml = filteredOrders.map(o => {
        const feeRate = o.platform_fee_rate !== undefined ? o.platform_fee_rate : 5;
        const feeAmt = o.platform_fee_amount !== undefined ? o.platform_fee_amount : Math.round(o.total_price * (feeRate / 100));
        const netAmt = o.total_price - feeAmt;

        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">#${o.id}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${new Date(o.created_at).toLocaleString('vi-VN')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${o.user_name || 'Khách Hàng TQ'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${o.payment_method === 'wallet' ? 'Ví TQ Pay' : 'Tiền Mặt'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #2563eb;">${o.total_price.toLocaleString('vi-VN')} đ</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #dc2626;">${feeAmt.toLocaleString('vi-VN')} đ</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #059669;">${netAmt.toLocaleString('vi-VN')} đ</td>
          </tr>
        `;
      }).join('');

      pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sao Kê Doanh Thu TQ Store - ${scopeName}</title>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
            .header { border-bottom: 3px solid #059669; pb-15px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: 900; color: #065f46; text-transform: uppercase; margin: 0; }
            .summary { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 25px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 15px; }
            th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; text-transform: uppercase; font-size: 11px; }
            .footer { margin-top: 40px; text-align: right; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">📄 SAO KÊ DOANH THU ${targetRole === 'SUPER_ADMIN' ? 'HỆ THỐNG TOÀN SÀN TQ STORE' : `GIAN HÀNG: ${shopName || user.name}`}</h1>
            <p style="font-size: 12px; color: #64748b; margin-top: 5px;">Từ ngày: <strong>${startDate}</strong> đến ngày <strong>${endDate}</strong> • Ngày tạo file: ${new Date().toLocaleString('vi-VN')}</p>
          </div>

          <div class="summary">
            <div><strong>Tổng đơn hàng:</strong> ${filteredOrders.length} Đơn</div>
            <div><strong>Doanh thu gộp:</strong> ${totalGrossRevenue.toLocaleString('vi-VN')} VNĐ</div>
            <div><strong>${targetRole === 'SUPER_ADMIN' ? 'Tổng Phí Sàn Thu Được:' : 'Doanh Thu Thực Nhận Shop:'}</strong> <span style="color: #059669; font-weight: bold;">${totalNetRevenue.toLocaleString('vi-VN')} VNĐ</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Thời Gian</th>
                <th>Khách Hàng</th>
                <th>Hình Thức TT</th>
                <th style="text-align: right;">Tổng Tiền Gộp</th>
                <th style="text-align: right;">Phí Sàn</th>
                <th style="text-align: right;">Thực Nhận</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <p>Báo cáo sao kê điện tử được xác thực bởi Hệ Thống TQ Store Marketplace Admin</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      pdfWindow.document.close();
      addToast(`📄 Đã tạo file PDF Sao kê & mở cửa sổ lưu/in ấn!`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-emerald-300 uppercase tracking-wider">
                {targetRole === 'SUPER_ADMIN' ? '📊 SAO KÊ DOANH THU TOÀN SÀN (ADM)' : `📊 XUẤT SAO KÊ DOANH THU SHOP`}
              </h3>
              <p className="text-xs text-slate-400">
                {targetRole === 'SUPER_ADMIN' ? 'Xuất dữ liệu thu chi & phí sàn hệ thống' : `Dành cho cửa hàng: ${shopName || user.name}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          
          {/* STEP 1: CONFIGURATION FORM */}
          {step === 'config' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Option 1: File Format Selection */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-black text-amber-400 uppercase tracking-wider">
                  1. CHỌN HÌNH THỨC NHẬN FILE SAO KÊ:
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFileFormat('EXCEL')}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col items-center gap-1.5 ${
                      fileFormat === 'EXCEL'
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 scale-105'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-black uppercase">File Excel (.CSV)</span>
                    <span className="text-[10px] text-slate-400">Bảng tính chi tiết, phân tích</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFileFormat('PDF')}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col items-center gap-1.5 ${
                      fileFormat === 'PDF'
                        ? 'border-rose-400 bg-rose-500/20 text-rose-300 scale-105'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-6 h-6 text-rose-400" />
                    <span className="text-xs font-black uppercase">File PDF</span>
                    <span className="text-[10px] text-slate-400">Tài liệu chuẩn in ấn & báo cáo</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Time Range Selection */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" /> 2. CHỌN KHOẢNG THỜI GIAN CẦN XUẤT SAO KÊ:
                </label>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('THIS_MONTH')}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Tháng Này
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('LAST_MONTH')}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Tháng Trước
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('LAST_30')}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    30 Ngày Qua
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('ALL')}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Tất Cả
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Từ Ngày (Start Date):</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Đến Ngày (End Date):</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" /> ⬅ QUAY LẠI / HỦY
                </button>

                <button
                  type="button"
                  onClick={handleProceedToReady}
                  className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400"
                >
                  TIẾP TỤC SAO KÊ <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: READY CONFIRMATION & DOWNLOAD FILE BUTTON */}
          {step === 'ready' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                    BẢNG XÁC NHẬN DỮ LIỆU SAO KÊ ĐÃ SẴN SÀNG
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Hình Thức Nhận File:</span>
                    <strong className={fileFormat === 'EXCEL' ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
                      {fileFormat === 'EXCEL' ? '📊 FILE EXCEL (.CSV)' : '📄 FILE PDF TÀI LIỆU'}
                    </strong>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Khoảng Thời Gian:</span>
                    <strong className="text-slate-200 font-mono">{startDate} ➔ {endDate}</strong>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Tổng Số Đơn Hàng:</span>
                    <strong className="text-amber-400 font-mono font-black">{filteredOrders.length} Đơn</strong>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      {targetRole === 'SUPER_ADMIN' ? 'Tổng Phí Sàn Thu Được:' : 'Doanh Thu Thực Nhận Shop:'}
                    </span>
                    <strong className="text-emerald-400 font-mono font-black">
                      {totalNetRevenue.toLocaleString('vi-VN')} VNĐ
                    </strong>
                  </div>
                </div>
              </div>

              {/* SAVE FILE NATIVE DOWNLOAD BUTTON */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black py-4 rounded-2xl text-sm uppercase tracking-wider shadow-2xl transition flex items-center justify-center gap-2 cursor-pointer border-2 border-emerald-300 animate-pulse"
                >
                  <Download className="w-5 h-5 text-slate-950" /> 💾 LƯU FILE VỀ MÁY (TẢI FILE SAO KÊ {fileFormat})
                </button>

                <button
                  type="button"
                  onClick={() => setStep('config')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay Lại Chỉnh Sửa Khoảng Thời Gian / Định Dạng
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
