import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { Product, ShopType } from '../types';
import {
  X,
  PlusCircle,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Store,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';

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

  const [shopType, setShopType] = useState<ShopType>('RENTAL');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [badge, setBadge] = useState('HOT SALE');
  const [description, setDescription] = useState('');
  const [stock] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Up to 7 Image URLs
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  // --- Dynamic Category-Specific Spec Fields ---
  // 👗 RENTAL (Cho thuê đồ)
  const [rentalDeposit, setRentalDeposit] = useState<number | ''>(500000);
  const [clothingSize, setClothingSize] = useState('S, M, L (Freesize)');
  const [condition, setCondition] = useState('Mới 98% (Giặt sấy tiệt trùng)');

  // 🛍️ RETAIL (Shop bán đồ)
  const [brand, setBrand] = useState('TQ Designer');
  const [material, setMaterial] = useState('Lụa cao cấp / Cotton mượt');

  // 🧋 FNB (Đồ ăn & Uống)
  const [fnbOptions, setFnbOptions] = useState('Đá 50%, Đường 70%, Có Topping Trân Châu');
  const [prepTime, setPrepTime] = useState('15 - 25 Phút (Giao hỏa tốc)');

  // 💄 BEAUTY (Làm đẹp & Spa)
  const [duration, setDuration] = useState('60 Phút / Liệu trình');
  const [beautyGuarantee, setBeautyGuarantee] = useState('Dược mỹ phẩm nhập khẩu, KTV lành nghề');

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

    // Build full detailed text combining user description and specs
    let fullDetails = description.trim() || 'Sản phẩm mới phân phối bởi gian hàng TQ Store.';
    if (shopType === 'RENTAL') {
      fullDetails += ` [Cọc: ${Number(rentalDeposit).toLocaleString('vi-VN')}đ | Size: ${clothingSize} | Độ mới: ${condition}]`;
    } else if (shopType === 'RETAIL') {
      fullDetails += ` [Hãng: ${brand} | Chất liệu: ${material}]`;
    } else if (shopType === 'FNB') {
      fullDetails += ` [Tùy chọn: ${fnbOptions} | Chuẩn bị: ${prepTime}]`;
    } else if (shopType === 'BEAUTY') {
      fullDetails += ` [Thời lượng: ${duration} | Cam kết: ${beautyGuarantee}]`;
    }

    const newProd: Product = {
      id: `prod_${Date.now()}`,
      title: title.trim(),
      name: title.trim(),
      price: Number(price),
      shopType,
      shopName: user.name || 'TQ Store Gian Hàng',
      img: defaultImg,
      images: finalImagesList.slice(0, 7),
      badge: badge.trim() || 'NEW',
      details: fullDetails,
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
    setDescription('');
    onClose();

    addToast(`🎉 ĐÃ ĐĂNG SẢN PHẨM MỚI (${finalImagesList.length} ẢNH) THÀNH CÔNG!`, 'success');
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
          <h3 className="text-2xl font-black text-navy uppercase tracking-wide">ĐĂNG SẢN PHẨM GIAN HÀNG TỰ ĐỘNG</h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Cửa hàng: <strong className="text-emerald-700">{user.name}</strong> ({user.phone || user.email})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* STEP 1: Select Category first */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
            <label className="block text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> 1. CHỌN DANH MỤC GIAN HÀNG ĐỂ ĐỔI FORM ĐĂNG
            </label>
            <select
              value={shopType}
              onChange={e => setShopType(e.target.value as ShopType)}
              className="w-full bg-slate-950 border border-amber-400/40 text-amber-300 rounded-xl px-4 py-2.5 text-xs font-black focus:outline-none cursor-pointer"
            >
              <option value="RENTAL">👗 Dịch Vụ Cho Thuê Đồ & Trang Phục (RENTAL)</option>
              <option value="RETAIL">🛍️ Shop Bán Đồ Thời Trang & Hàng Sản Phẩm (RETAIL)</option>
              <option value="FNB">🧋 Quán Đồ Ăn & Nước Uống (F&B)</option>
              <option value="BEAUTY">💄 Dịch Vụ Làm Đẹp, Spa & Thẩm Mỹ (BEAUTY)</option>
            </select>
          </div>

          {/* STEP 2: Common Basic Inputs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {shopType === 'RENTAL' ? 'Tên Trang Phục Cho Thuê' : shopType === 'RETAIL' ? 'Tên Sản Phẩm Bán' : shopType === 'FNB' ? 'Tên Món Ăn / Thức Uống' : 'Tên Gói Dịch Vụ Spa'}
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder={
                  shopType === 'RENTAL' ? 'VD: Đầm Dạ Hội Kim Tuyến Cổ V Đỏ Rượu...' :
                  shopType === 'RETAIL' ? 'VD: Áo Sơ Mi Nam TQ Smart Oxford Silk...' :
                  shopType === 'FNB' ? 'VD: Trà Sữa Ô Long Nướng Kem Trứng...' :
                  'VD: Gói Spa Massage Thảo Dược Toàn Thân 60Phút...'
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Price Input Labels */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {shopType === 'RENTAL' ? 'Giá Thuê / Ngày (VNĐ)' : shopType === 'RETAIL' ? 'Giá Bán Niêm Yết (VNĐ)' : shopType === 'FNB' ? 'Giá Món (VNĐ)' : 'Giá Gói Liệu Trình (VNĐ)'}
              </label>
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

            {/* Badge */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nhãn Thẻ (Badge)</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  placeholder="VD: HOT, SALE 20%, VERIFIED..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-orange font-bold focus:outline-none focus:border-navy focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Dynamic Category-Specific Spec Fields Container */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-3">
            <h4 className="text-xs font-black text-amber-900 uppercase flex items-center gap-1.5">
              ⚡ THÔNG SỐ ĐẶC THÙ CHO DANH MỤC [{shopType}]
            </h4>

            {/* 1. RENTAL SPECS */}
            {shopType === 'RENTAL' && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Tiền Cọc (VNĐ)</label>
                  <input
                    type="number"
                    value={rentalDeposit}
                    onChange={e => setRentalDeposit(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-xs font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Size Trang Phục</label>
                  <input
                    type="text"
                    value={clothingSize}
                    onChange={e => setClothingSize(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Độ Mới / Tình Trạng</label>
                  <input
                    type="text"
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* 2. RETAIL SPECS */}
            {shopType === 'RETAIL' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Thương Hiệu / Hãng Sản Xuất</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Chất Liệu Sản Phẩm</label>
                  <input
                    type="text"
                    value={material}
                    onChange={e => setMaterial(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* 3. FNB SPECS */}
            {shopType === 'FNB' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Tùy Chọn Món (Đường / Đá / Topping)</label>
                  <input
                    type="text"
                    value={fnbOptions}
                    onChange={e => setFnbOptions(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Thời Gian Giao Hàng Dự Kiến</label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={e => setPrepTime(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>
            )}

            {/* 4. BEAUTY SPECS */}
            {shopType === 'BEAUTY' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Thời Lượng Liệu Trình</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Cam Kết Chất Lượng Spa</label>
                  <input
                    type="text"
                    value={beautyGuarantee}
                    onChange={e => setBeautyGuarantee(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>
            )}
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

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
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

          {/* Dedicated Description Section */}
          <div>
            <label className="block text-xs font-black text-navy uppercase mb-1">
              📝 MÔ TẢ CHI TIẾT SẢN PHẨM / DỊCH VỤ
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Nhập mô tả chi tiết sản phẩm, xuất xứ, điểm nổi bật, quy định đặt cọc hoặc hướng dẫn bảo quản..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition resize-none font-medium leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Đang Đăng Sản Phẩm...' : `XÁC NHẬN ĐĂNG SP DANH MỤC [${shopType}]`}
          </button>
        </form>

      </div>
    </div>
  );
};
