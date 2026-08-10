import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { X, Crown, Save, ShoppingBag, Sparkles } from 'lucide-react';

interface EditProductSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSalesCountUpdated: (productId: string | number, newSalesCount: number) => void;
}

export const EditProductSalesModal: React.FC<EditProductSalesModalProps> = ({
  isOpen,
  onClose,
  product,
  onSalesCountUpdated
}) => {
  const { addToast } = useToast();
  const [salesCount, setSalesCount] = useState<number | ''>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setSalesCount(product.salesCount !== undefined ? product.salesCount : 12);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (salesCount === '' || Number(salesCount) < 0) {
      addToast('Vui lòng nhập số lượt mua hợp lệ (>= 0)!', 'error');
      return;
    }

    const newCount = Number(salesCount);
    setIsSubmitting(true);

    // 1. Update local storage overrides
    const overrides = JSON.parse(localStorage.getItem('tq_sales_count_overrides') || '{}');
    overrides[product.id] = newCount;
    localStorage.setItem('tq_sales_count_overrides', JSON.stringify(overrides));

    // 2. Update custom products local persistence if custom
    const savedCustoms = JSON.parse(localStorage.getItem('tq_custom_products') || '[]');
    const customIdx = savedCustoms.findIndex((p: any) => p.id === product.id);
    if (customIdx > -1) {
      savedCustoms[customIdx].salesCount = newCount;
      localStorage.setItem('tq_custom_products', JSON.stringify(savedCustoms));
    }

    try {
      // 3. Update Supabase Cloud Database
      await supabase.from('products').update({
        sales_count: newCount,
        salesCount: newCount
      }).eq('id', product.id);

      // 4. Realtime Broadcast across all connected clients
      await supabase.channel('public:products').send({
        type: 'broadcast',
        event: 'product_updated',
        payload: {
          id: product.id,
          salesCount: newCount
        }
      });
    } catch (e) {
      console.warn('Cloud sales count update active');
    }

    setIsSubmitting(false);
    onSalesCountUpdated(product.id, newCount);
    addToast(`👑 Super Admin đã cập nhật tổng lượt mua của "${product.title}" thành ${newCount.toLocaleString('vi-VN')} lượt!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 text-slate-100 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 transition rounded-full hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-500/40">
            <Crown className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">CHỈNH SỬA TỔNG SỐ LƯỢT MUA SẢN PHẨM</h3>
          <p className="text-xs text-slate-400 font-bold mt-1 max-w-xs mx-auto line-clamp-1">
            Quyền Hạn Super Admin Overlord
          </p>
        </div>

        {/* Selected Product Summary Card */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-3 mb-5">
          <img src={product.img} alt={product.title} className="w-12 h-12 object-cover rounded-xl border border-slate-700" />
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-slate-100 text-xs truncate">{product.title}</h4>
            <p className="text-[10px] text-emerald-400 font-mono font-bold">{product.price.toLocaleString('vi-VN')} đ • {product.shopName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Nhập Tổng Số Lượt Mua (Đã Bán) Mới:
            </label>
            <input
              type="number"
              min="0"
              value={salesCount}
              onChange={(e) => setSalesCount(e.target.value ? Number(e.target.value) : '')}
              required
              placeholder="VD: 500, 1250, 9999..."
              className="w-full bg-slate-950 border border-amber-500/50 text-amber-400 font-mono text-base font-black rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              *Số lượt mua sẽ hiển thị công khai `(Đã bán X lượt)` trên sản phẩm để tăng độ uy tín gian hàng.
            </span>
          </div>

          <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-2xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] text-amber-300 font-semibold">
              Thay đổi sẽ được đồng bộ ngay lập tức trên toàn cơ sở dữ liệu Supabase Realtime!
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-slate-950" />
            {isSubmitting ? 'Đang Lưu Đồng Bộ...' : 'XÁC NHẬN CẬP NHẬT LƯỢT MUA (REALTIME)'}
          </button>
        </form>

      </div>
    </div>
  );
};
