import React, { useState, useRef, useEffect } from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Search, ArrowLeft, X, SlidersHorizontal } from 'lucide-react';

interface SearchResultsModalProps {
  isOpen: boolean;
  searchQuery: string;
  products: Product[];
  onClose: () => void;
  onSearchChange: (query: string) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenChatWithProduct: (product: Product) => void;
  onOpenEditSalesCount?: (product: Product) => void;
}

export const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  isOpen,
  searchQuery,
  products,
  onClose,
  onSearchChange,
  onOpenProductDetail,
  onOpenChatWithProduct,
  onOpenEditSalesCount
}) => {
  const [sortBy, setSortBy] = useState<'RELEVANCE' | 'NEWEST' | 'PRICE_LOW' | 'PRICE_HIGH' | 'SOLD'>('RELEVANCE');
  const [inputVal, setInputVal] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  if (!isOpen) return null;

  // Filter products by search query
  const q = searchQuery.toLowerCase().trim();
  let matched = products.filter(p => {
    if (!q) return true;
    const titleMatch = p.title.toLowerCase().includes(q);
    const shopMatch = p.shopName.toLowerCase().includes(q);
    const detailsMatch = (p.details || '').toLowerCase().includes(q);
    const tagsMatch = p.tags ? p.tags.some(t => t.toLowerCase().includes(q)) : false;
    return titleMatch || shopMatch || detailsMatch || tagsMatch;
  });

  // Sort products
  if (sortBy === 'NEWEST') {
    matched = [...matched].reverse();
  } else if (sortBy === 'PRICE_LOW') {
    matched = [...matched].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'PRICE_HIGH') {
    matched = [...matched].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'SOLD') {
    matched = [...matched].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 📱 Automatically collapse/hide mobile virtual keyboard on search submission
    if (inputRef.current) {
      inputRef.current.blur();
    }
    (document.activeElement as HTMLElement)?.blur();
    onSearchChange(inputVal);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      
      {/* Search Bar Top Header */}
      <header className="bg-[#0F2C59] text-white p-3.5 sm:p-4 shadow-lg border-b border-navy-light shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-white shrink-0"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Search Input Form */}
          <form onSubmit={handleFormSubmit} className="flex-1 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-xl flex items-center px-3 py-2 text-gray-800 shadow-inner">
              <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Nhập tên sản phẩm, gian hàng, mẫu váy..."
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none font-medium placeholder:text-gray-400"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => {
                    setInputVal('');
                    onSearchChange('');
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#ee4d2d] hover:bg-[#d0011b] text-white text-xs sm:text-sm font-black px-4 py-2 rounded-xl transition cursor-pointer shrink-0 uppercase tracking-wider shadow-md"
            >
              TÌM KIẾM
            </button>
          </form>
        </div>
      </header>

      {/* Main Search Results View Body */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-5">
          
          {/* Results Summary & Sorting Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-navy uppercase flex items-center gap-2">
                <Search className="w-5 h-5 text-[#ee4d2d]" />
                KẾT QUẢ TÌM KIẾM CHO: <span className="text-[#ee4d2d] font-mono">"{searchQuery}"</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Tìm thấy <strong className="text-navy">{matched.length}</strong> sản phẩm phù hợp với từ khóa của bạn
              </p>
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold">
              <span className="text-gray-500 shrink-0 hidden sm:inline flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Sắp xếp:
              </span>
              
              <button
                onClick={() => setSortBy('RELEVANCE')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  sortBy === 'RELEVANCE' ? 'bg-[#ee4d2d] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Liên Quan
              </button>

              <button
                onClick={() => setSortBy('NEWEST')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  sortBy === 'NEWEST' ? 'bg-[#ee4d2d] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mới Nhất
              </button>

              <button
                onClick={() => setSortBy('SOLD')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  sortBy === 'SOLD' ? 'bg-[#ee4d2d] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bán Chạy
              </button>

              <button
                onClick={() => setSortBy(sortBy === 'PRICE_LOW' ? 'PRICE_HIGH' : 'PRICE_LOW')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  sortBy === 'PRICE_LOW' || sortBy === 'PRICE_HIGH' ? 'bg-[#ee4d2d] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Giá {sortBy === 'PRICE_LOW' ? '↑ Thấp đến Cao' : sortBy === 'PRICE_HIGH' ? '↓ Cao đến Thấp' : '↕'}
              </button>
            </div>
          </div>

          {/* Product Grid View */}
          {matched.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {matched.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenChatWithProduct={onOpenChatWithProduct}
                  onOpenProductDetail={onOpenProductDetail}
                  onOpenEditSalesCount={onOpenEditSalesCount}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-200 p-8 space-y-3 shadow-xs">
              <div className="text-5xl mb-2">🔍</div>
              <h3 className="text-lg font-black text-navy">
                Không tìm thấy sản phẩm nào phù hợp với từ khóa "{searchQuery}"
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Hãy thử kiểm tra lỗi chính tả, sử dụng từ khóa ngắn hơn hoặc xem tất cả danh mục của sàn!
              </p>

              <div className="pt-3 flex justify-center gap-2">
                <button
                  onClick={() => { onSearchChange(''); setInputVal(''); onClose(); }}
                  className="bg-[#ee4d2d] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#d0011b] transition shadow-md cursor-pointer"
                >
                  ← Xem Tất Cả Sản Phẩm Trên Sàn
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
};
