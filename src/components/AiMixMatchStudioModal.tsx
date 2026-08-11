import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';
import {
  X,
  Sparkles,
  Shirt,
  Upload,
  User,
  Bookmark,
  ShoppingCart,
  Layers,
  Wand2
} from 'lucide-react';

interface AiMixMatchStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOpenProductDetail?: (prod: Product) => void;
}

export interface SavedOutfit {
  id: string;
  name: string;
  userPhotoUrl?: string;
  bodyModel: string;
  topItem?: Product;
  bottomItem?: Product;
  dressItem?: Product;
  accessoryItem?: Product;
  totalPrice: number;
  savedAt: string;
}

export const BODY_MODELS = [
  { id: 'female_slender', label: '👗 Nữ Dáng Cao Thon', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
  { id: 'female_curvy', label: '👠 Nữ Dáng Đồng Hồ Cát', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80' },
  { id: 'male_gentleman', label: '👔 Nam Lịch Lãm Smart', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
  { id: 'bridal_luxury', label: '👰 Cô Dâu Luxury Studio', img: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=600&q=80' }
];

export const AiMixMatchStudioModal: React.FC<AiMixMatchStudioModalProps> = ({
  isOpen,
  onClose,
  products
}) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'studio' | 'my-outfits'>('studio');
  const [selectedBodyModel, setSelectedBodyModel] = useState<string>(BODY_MODELS[0].img);
  const [uploadedUserPhoto, setUploadedUserPhoto] = useState<string | null>(null);

  // Selected Outfit Layers
  const [selectedTop, setSelectedTop] = useState<Product | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<Product | null>(null);
  const [selectedDress, setSelectedDress] = useState<Product | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<Product | null>(null);

  const [outfitName, setOutfitName] = useState('Outfit Phong Cách TQ Studio');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Saved Outfits List
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>(() => {
    const saved = localStorage.getItem('tq_saved_outfits');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter fashion items by category/shop type
  const fashionProducts = products.filter(p => p.shopType === 'RENTAL' || p.shopType === 'RETAIL' || p.shopType === 'BEAUTY');

  const topsList = fashionProducts.filter(p => p.title.toLowerCase().includes('áo') || p.title.toLowerCase().includes('sơ mi') || p.title.toLowerCase().includes('vest'));
  const bottomsList = fashionProducts.filter(p => p.title.toLowerCase().includes('quần') || p.title.toLowerCase().includes('chân váy') || p.title.toLowerCase().includes('jeans'));
  const dressesList = fashionProducts.filter(p => p.title.toLowerCase().includes('váy') || p.title.toLowerCase().includes('đầm') || p.title.toLowerCase().includes('dạ hội'));
  const accessoriesList = fashionProducts.filter(p => p.title.toLowerCase().includes('túi') || p.title.toLowerCase().includes('spa') || p.title.toLowerCase().includes('make up') || p.title.toLowerCase().includes('giày'));

  // Calculate total outfit price
  const totalOutfitPrice = (selectedTop?.price || 0) + (selectedBottom?.price || 0) + (selectedDress?.price || 0) + (selectedAccessory?.price || 0);
  const activeOutfitCount = [selectedTop, selectedBottom, selectedDress, selectedAccessory].filter(Boolean).length;

  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedUserPhoto(reader.result as string);
        addToast('📷 Đã tải ảnh cá nhân thành công! AI đang tách phông và ghép trang phục...', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomAiMix = () => {
    setIsAiProcessing(true);
    addToast('🤖 AI TiQi đang tự động phối màu & tạo Outfit thời trang cao cấp...', 'info');

    setTimeout(() => {
      const randTop = topsList.length > 0 ? topsList[Math.floor(Math.random() * topsList.length)] : null;
      const randBottom = bottomsList.length > 0 ? bottomsList[Math.floor(Math.random() * bottomsList.length)] : null;
      const randDress = dressesList.length > 0 ? dressesList[Math.floor(Math.random() * dressesList.length)] : null;
      const randAccessory = accessoriesList.length > 0 ? accessoriesList[Math.floor(Math.random() * accessoriesList.length)] : null;

      // Randomly pick top+bottom or dress
      if (Math.random() > 0.5 && randDress) {
        setSelectedDress(randDress);
        setSelectedTop(null);
        setSelectedBottom(null);
      } else {
        setSelectedTop(randTop);
        setSelectedBottom(randBottom);
        setSelectedDress(null);
      }
      setSelectedAccessory(randAccessory);
      setIsAiProcessing(false);

      addToast('✨ AI đã tạo xong 1 Bộ Outfit mới hợp xu hướng!', 'success');
    }, 800);
  };

  const handleSaveOutfit = () => {
    if (activeOutfitCount === 0) {
      addToast('Vui lòng chọn ít nhất 1 sản phẩm thời trang để phối bộ Outfit!', 'error');
      return;
    }

    const newOutfit: SavedOutfit = {
      id: `outfit_${Date.now()}`,
      name: outfitName,
      userPhotoUrl: uploadedUserPhoto || undefined,
      bodyModel: selectedBodyModel,
      topItem: selectedTop || undefined,
      bottomItem: selectedBottom || undefined,
      dressItem: selectedDress || undefined,
      accessoryItem: selectedAccessory || undefined,
      totalPrice: totalOutfitPrice,
      savedAt: new Date().toLocaleDateString('vi-VN')
    };

    const updated = [newOutfit, ...savedOutfits];
    setSavedOutfits(updated);
    localStorage.setItem('tq_saved_outfits', JSON.stringify(updated));

    addToast(`💾 Đã lưu bộ Outfit "${outfitName}" vào BST Cá Nhân! Khi có Shop bán món đồ này, hệ thống sẽ gợi ý ngay!`, 'success');
  };

  const handleBuyFullOutfit = () => {
    const activeItems = [selectedTop, selectedBottom, selectedDress, selectedAccessory].filter(Boolean) as Product[];
    if (activeItems.length === 0) {
      addToast('Vui lòng chọn các món đồ thời trang trước khi mua!', 'error');
      return;
    }

    activeItems.forEach(item => {
      addToCart(item);
    });

    addToast(`🛒 ĐÃ THÊM TOÀN BỘ ${activeItems.length} SẢN PHẨM TRONG OUTFIT VÀO GIỎ HÀNG!`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  const currentDisplayModelImg = uploadedUserPhoto || selectedBodyModel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <Wand2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="font-black text-base text-pink-300 uppercase tracking-wider flex items-center gap-2">
                STUDIO BỘ CÔNG CỤ PHỐI ĐỒ AI MIX & MATCH ẢO
              </h3>
              <p className="text-xs text-slate-400">
                Thử trang phục AI trực tiếp • Khớp đúng gian hàng bán • Lưu Outfit cá nhân
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

        {/* Tab Selection */}
        <div className="grid grid-cols-2 bg-slate-950 border-b border-slate-800 text-xs font-black uppercase">
          <button
            onClick={() => setActiveTab('studio')}
            className={`py-3 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'studio' ? 'border-pink-400 text-pink-400 bg-pink-500/10' : 'border-transparent text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-pink-400" /> AI Studio Thử & Phối Đồ
          </button>

          <button
            onClick={() => setActiveTab('my-outfits')}
            className={`py-3 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'my-outfits' ? 'border-amber-400 text-amber-400 bg-amber-500/10' : 'border-transparent text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" /> BST Outfits Cá Nhân Đã Lưu ({savedOutfits.length})
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5">
          
          {activeTab === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* LEFT COLUMN: Model Canvas & Composite AI Preview (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Canvas Display Card */}
                <div className="relative bg-gradient-to-b from-slate-950 via-purple-950/40 to-slate-950 rounded-3xl border-2 border-pink-500/40 p-4 overflow-hidden flex flex-col items-center justify-center min-h-[380px] shadow-2xl group">
                  
                  {/* Background Model Image */}
                  <img
                    src={currentDisplayModelImg}
                    alt="Fitting Model"
                    className="w-full h-80 object-cover rounded-2xl opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay AI Fashion Layer Badges */}
                  <div className="absolute top-6 left-6 right-6 flex flex-wrap gap-1.5 z-10">
                    {selectedTop && (
                      <span className="bg-emerald-600/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow border border-emerald-400">
                        👔 {selectedTop.title}
                      </span>
                    )}
                    {selectedBottom && (
                      <span className="bg-blue-600/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow border border-blue-400">
                        👖 {selectedBottom.title}
                      </span>
                    )}
                    {selectedDress && (
                      <span className="bg-pink-600/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow border border-pink-400">
                        👗 {selectedDress.title}
                      </span>
                    )}
                    {selectedAccessory && (
                      <span className="bg-amber-500/90 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow border border-amber-300">
                        💍 {selectedAccessory.title}
                      </span>
                    )}
                  </div>

                  {/* AI Fitting Overlay Status */}
                  <div className="absolute bottom-6 left-6 right-6 bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-pink-500/30 flex items-center justify-between text-xs z-10">
                    <div>
                      <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wider block">BỘ OUTFIT ĐANG PHỐI:</span>
                      <span className="font-black text-white">{activeOutfitCount} Sản Phẩm</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">TỔNG GIÁ BÁN/THUÊ:</span>
                      <span className="font-mono font-black text-amber-400 text-sm">
                        {totalOutfitPrice.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Model Selector & Upload Controls */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4" /> CHỌN DÁNG MẪU HOẶC TẢI ẢNH CÁ NHÂN:
                    </h4>

                    {/* Upload Personal Photo Button */}
                    <label className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl cursor-pointer transition flex items-center gap-1 shadow">
                      <Upload className="w-3.5 h-3.5" /> 📷 Tải Ảnh Cá Nhân
                      <input type="file" accept="image/*" onChange={handleUserPhotoUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {BODY_MODELS.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedBodyModel(m.img);
                          setUploadedUserPhoto(null);
                        }}
                        className={`p-1 rounded-xl border transition cursor-pointer flex flex-col items-center ${
                          selectedBodyModel === m.img && !uploadedUserPhoto
                            ? 'border-pink-400 bg-pink-500/20 scale-105'
                            : 'border-slate-800 bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        <img src={m.img} alt={m.label} className="w-full h-12 object-cover rounded-lg mb-1" />
                        <span className="text-[9px] font-bold text-slate-300 text-center line-clamp-1">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Auto Mix Button */}
                <button
                  type="button"
                  onClick={handleRandomAiMix}
                  disabled={isAiProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border border-pink-400 animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {isAiProcessing ? '🤖 AI ĐANG TỰ ĐỘNG PHỐI MÀU...' : '✨ AI TỰ ĐỘNG PHỐI BỘ OUTFIT NGẪU NHIÊN'}
                </button>

              </div>

              {/* RIGHT COLUMN: Garment Selection Catalog & Outfits Cart (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Garment Categories Pickers */}
                <div className="space-y-4">
                  
                  {/* Slot 1: Áo / Tops */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        👔 1. CHỌN ÁO (TOPS & VESTS):
                      </h4>
                      {selectedTop && (
                        <button onClick={() => setSelectedTop(null)} className="text-[10px] text-rose-400 hover:underline">
                          Bỏ chọn
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {topsList.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedTop(p)}
                          className={`w-28 shrink-0 bg-slate-900 p-2 rounded-xl border transition cursor-pointer hover:scale-105 ${
                            selectedTop?.id === p.id ? 'border-emerald-400 bg-emerald-500/20' : 'border-slate-800'
                          }`}
                        >
                          <img src={p.img} alt={p.title} className="w-full h-16 object-cover rounded-lg mb-1" />
                          <p className="text-[10px] font-bold text-slate-200 line-clamp-1">{p.title}</p>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold block">{p.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slot 2: Quần & Váy / Bottoms */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        👖 2. CHỌN QUẦN / CHÂN VÁY (BOTTOMS):
                      </h4>
                      {selectedBottom && (
                        <button onClick={() => setSelectedBottom(null)} className="text-[10px] text-rose-400 hover:underline">
                          Bỏ chọn
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {bottomsList.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedBottom(p)}
                          className={`w-28 shrink-0 bg-slate-900 p-2 rounded-xl border transition cursor-pointer hover:scale-105 ${
                            selectedBottom?.id === p.id ? 'border-blue-400 bg-blue-500/20' : 'border-slate-800'
                          }`}
                        >
                          <img src={p.img} alt={p.title} className="w-full h-16 object-cover rounded-lg mb-1" />
                          <p className="text-[10px] font-bold text-slate-200 line-clamp-1">{p.title}</p>
                          <span className="text-[10px] font-mono text-blue-400 font-bold block">{p.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slot 3: Váy Liền / Full Dresses */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                        👗 3. CHỌN VÁY LIỀN / ĐẦM CƯỚI LUXURY:
                      </h4>
                      {selectedDress && (
                        <button onClick={() => setSelectedDress(null)} className="text-[10px] text-rose-400 hover:underline">
                          Bỏ chọn
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {dressesList.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedDress(p);
                            setSelectedTop(null);
                            setSelectedBottom(null);
                          }}
                          className={`w-28 shrink-0 bg-slate-900 p-2 rounded-xl border transition cursor-pointer hover:scale-105 ${
                            selectedDress?.id === p.id ? 'border-pink-400 bg-pink-500/20' : 'border-slate-800'
                          }`}
                        >
                          <img src={p.img} alt={p.title} className="w-full h-16 object-cover rounded-lg mb-1" />
                          <p className="text-[10px] font-bold text-slate-200 line-clamp-1">{p.title}</p>
                          <span className="text-[10px] font-mono text-pink-400 font-bold block">{p.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slot 4: Phụ Kiện / Accessories */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        💍 4. CHỌN PHỤ KIỆN / TRANG ĐIỂM / TÚI XÁCH:
                      </h4>
                      {selectedAccessory && (
                        <button onClick={() => setSelectedAccessory(null)} className="text-[10px] text-rose-400 hover:underline">
                          Bỏ chọn
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {accessoriesList.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedAccessory(p)}
                          className={`w-28 shrink-0 bg-slate-900 p-2 rounded-xl border transition cursor-pointer hover:scale-105 ${
                            selectedAccessory?.id === p.id ? 'border-amber-400 bg-amber-500/20' : 'border-slate-800'
                          }`}
                        >
                          <img src={p.img} alt={p.title} className="w-full h-16 object-cover rounded-lg mb-1" />
                          <p className="text-[10px] font-bold text-slate-200 line-clamp-1">{p.title}</p>
                          <span className="text-[10px] font-mono text-amber-400 font-bold block">{p.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Save Outfit & Purchase Buttons */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/40 space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tên Bộ Outfit Cá Nhân:</label>
                    <input
                      type="text"
                      value={outfitName}
                      onChange={e => setOutfitName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-pink-300 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveOutfit}
                      className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition border border-purple-500/50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-purple-300" /> 💾 LƯU OUTFIT CÁ NHÂN
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyFullOutfit}
                      className="bg-gradient-to-r from-orange via-amber-500 to-yellow-500 hover:from-orange-dark hover:to-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4 text-slate-950" /> 🛒 MUA TOÀN BỘ OUTFIT (1-CLICK)
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MY SAVED OUTFITS LIST */}
          {activeTab === 'my-outfits' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Bookmark className="w-4 h-4 text-amber-400" /> BỘ BỘ SỰC TẬP OUTFITS CÁ NHÂN ĐÃ LƯU ({savedOutfits.length}):
              </h4>

              {savedOutfits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedOutfits.map(outfit => (
                    <div
                      key={outfit.id}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-black text-slate-100 text-sm">{outfit.name}</h5>
                        <span className="text-[10px] text-slate-400">{outfit.savedAt}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={outfit.userPhotoUrl || outfit.bodyModel}
                          alt="Outfit Model"
                          className="w-16 h-20 object-cover rounded-xl border border-slate-800 shrink-0"
                        />

                        <div className="space-y-1 flex-1">
                          {outfit.topItem && <p className="text-emerald-400 text-[11px]">👔 {outfit.topItem.title}</p>}
                          {outfit.bottomItem && <p className="text-blue-400 text-[11px]">👖 {outfit.bottomItem.title}</p>}
                          {outfit.dressItem && <p className="text-pink-400 text-[11px]">👗 {outfit.dressItem.title}</p>}
                          {outfit.accessoryItem && <p className="text-amber-400 text-[11px]">💍 {outfit.accessoryItem.title}</p>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="font-mono font-black text-amber-400 text-sm">
                          {outfit.totalPrice.toLocaleString('vi-VN')} VNĐ
                        </span>

                        <button
                          onClick={() => {
                            [outfit.topItem, outfit.bottomItem, outfit.dressItem, outfit.accessoryItem].filter(Boolean).forEach(i => addToCart(i as Product));
                            addToast(`🛒 Đã thêm các món đồ trong "${outfit.name}" vào Giỏ hàng!`, 'success');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Mua Bộ Này
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-2">
                  <Shirt className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">Chưa có Outfit cá nhân nào được lưu</p>
                  <p className="text-[11px] text-slate-500">Hãy chuyển sang tab "AI Studio Thử & Phối Đồ" để phối và lưu trang phục yêu thích!</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
