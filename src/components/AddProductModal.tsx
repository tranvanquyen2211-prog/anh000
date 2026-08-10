import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { Product, ShopType } from '../types';
import { X, PlusCircle, Image as ImageIcon, Tag, DollarSign, Store, FileText, CheckCircle2, Plus, Trash2 } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProd: Product) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [shopType, setShopType] = useState<ShopType>('RENTAL');
  const [badge, setBadge] = useState('HOT SALE');
  const [details, setDetails] = useState('');
  const [stock, setStock] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Up to 7 Image URLs
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  if (!isOpen || !user) return null;

  const handleImageChange = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addImageField = () => {
    if (imageUrls.length >= 7) {
      addToast('Tối đa chỉ được đăng 7 hình ảnh cho 1 sản phẩm!', 'info');
      return;
    }
    setImageUrls([...imageUrls, '']);
  };

  const removeImageField = (index: number) => {
    if (imageUrls.length === 1) {
      setImageUrls(['']);
      return;
    }
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !price || Number(price) <= 0) {
      addToast('Vui lòng nhập đầy đủ tên sản phẩm và giá hợp lệ!', 'error');
      return;
    }

    setIsSubmitting(true);

    const validImages = imageUrls.map(url => url.trim()).filter(url => url.length > 0);
    const defaultImg = validImages[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
    const finalImagesList = validImages.length > 0 ? validImages : [defaultImg];

    const newProd: Product = {
      id: `prod_${Date.now()}`,
      title: title.trim(),
      name: title.trim(),
      price: Number(price),
      shopType,
      shopName: user.name || 'TQ Store Gian Hàng',
      img: defaultImg,
      images: finalImagesList.slice(0, 7), // Maximum 7 images
      badge: badge.trim() || 'NEW',
      details: details.trim() || 'Sản phẩm mới chính hãng phân phối bởi gian hàng TQ Store.',
      stock: Number(stock) || 50,
      salesCount: 1
    };

    try {
      // Synchronize to Supabase Cloud Database table `products`
      await supabase.from('products').insert([
        {
          id: newProd.id,
          title: newProd.title,
          name: newProd.name,
          price: newProd.price,
          shop_type: newProd.shopType,
          shop_name: newProd.shopName,
          img: newProd.img,
          images: newProd.images,
          badge: newProd.badge,
          details: newProd.details,
          stock: newProd.stock,
          sales_count: 1
        }
      ]);
    } catch (err) {
      console.warn('Cloud product insert active');
    }

    onProductAdded(newProd);
    setIsSubmitting(false);

    // Reset Form
    setTitle('');
    setPrice('');
    setImageUrls(['']);
    setDetails('');
    onClose();

    addToast(`🎉 ĐÃ ĐĂNG SẢN PHẨM MỚI (${finalImagesList.length} ẢNH) THÀNH CÔNG: [${newProd.title}]!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-dark/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative border border-gray-100 animate-in fade-in zoom-in-95 my-8">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-navy p-1 transition rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            <PlusCircle className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-navy uppercase tracking-wide">ĐĂNG SP GIAN HÀNG (TỐI ĐA 7 ẢNH)</h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Cửa hàng: <strong className="text-emerald-700">{user.name}</strong> ({user.phone || user.email})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Product Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên Sản Phẩm / Dịch Vụ Mới</label>
            <div className="relative">
              <Store className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="VD: Đầm Dạ Hội Kim Tuyến Cổ V..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Giá Bán / Giá Thuê (VNĐ)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                  required
                  placeholder="350000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-emerald-600 font-bold focus:outline-none focus:border-navy focus:bg-white transition"
                />
              </div>
            </div>

            {/* Shop Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Danh Mục Gian Hàng</label>
              <select
                value={shopType}
                onChange={e => setShopType(e.target.value as ShopType)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-navy focus:outline-none focus:border-navy focus:bg-white cursor-pointer"
              >
                <option value="RENTAL">👗 Cho Thuê Đồ</option>
                <option value="RETAIL">🛍️ Shop Bán Đồ</option>
                <option value="FNB">🧋 Đồ Ăn & Đồ Uống</option>
                <option value="BEAUTY">💄 Làm Đẹp & Spa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Badge */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nhãn Thẻ Nổi Bật (Badge)</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  placeholder="VD: HOT, GIẢM 20%, NEW..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-orange font-bold focus:outline-none focus:border-navy focus:bg-white transition"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số Lượng Kho</label>
              <input
                type="number"
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-bold focus:outline-none focus:border-navy focus:bg-white transition"
              />
            </div>
          </div>

          {/* Multiple Image URLs (Up to 7 Images) */}
          <div className="space-y-2 border-t border-b border-gray-100 py-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-navy uppercase tracking-wider">
                📸 HÌNH ẢNH SẢN PHẨM (TỐI ĐA 7 ẢNH) - ({imageUrls.length}/7)
              </label>
              {imageUrls.length < 7 && (
                <button
                  type="button"
                  onClick={addImageField}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Thêm Ảnh {imageUrls.length + 1}
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 w-12 shrink-0">Ảnh {idx + 1}:</span>
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      value={url}
                      onChange={e => handleImageChange(idx, e.target.value)}
                      placeholder={`Link URL ảnh ${idx + 1} (https://images.unsplash.com/...)`}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                    />
                  </div>
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(idx)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 transition cursor-pointer shrink-0"
                      title="Xóa ảnh này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Details Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mô Tả Chi Tiết / Quy Định Thuê</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={3}
                placeholder="Mô tả phong cách, chất liệu, size trang phục hoặc quy định bảo quản..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Đang Đăng Sản Phẩm...' : 'XÁC NHẬN ĐĂNG SP GIAN HÀNG (LƯU TỐI ĐA 7 ẢNH)'}
          </button>
        </form>

      </div>
    </div>
  );
};
