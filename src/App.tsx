import { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from './components/Toast';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilters } from './components/CategoryFilters';
import { ProductCard } from './components/ProductCard';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { Footer } from './components/Footer';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import type { Product, ShopType } from './types';
import { supabase } from './lib/supabase';

function MainApp() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<ShopType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'chat'>('shop');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  // Chat product context
  const [chatProductContext, setChatProductContext] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && data.length > 0) {
          const formatted: Product[] = data.map((p: any) => ({
            id: p.id,
            title: p.title || p.name,
            name: p.name || p.title,
            price: p.price,
            shopType: p.shop_type || p.shopType || 'RETAIL',
            shopName: p.shop_name || p.shopName || 'TQ Store',
            img: p.img || p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
            badge: p.badge,
            details: p.details,
            stock: p.stock || 50,
            salesCount: p.sales_count || p.salesCount || 10
          }));
          setProducts(formatted);
        }
      } catch (err) {
        console.warn('Using resilient initial products state:', err);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.shopType === selectedCategory;
    const matchQuery = searchQuery.trim() === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.details && p.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <ToastContainer />

      <Header
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenCartDrawer={() => setIsCartOpen(true)}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <HeroBanner onSelectCategory={(cat) => { setSelectedCategory(cat); setActiveTab('shop'); }} />

        <CategoryFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-navy tracking-wide uppercase">
                SẢN PHẨM & DỊCH VỤ CÁC GIAN HÀNG
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Supabase Realtime Marketplace • Thuê Đồ, Shop Bán Đồ, F&B, Spa
              </p>
            </div>
            <span className="text-xs font-extrabold bg-navy/10 text-navy px-3.5 py-1.5 rounded-full border border-navy/20">
              Hiển thị: {filteredProducts.length} mặt hàng
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenChatWithProduct={(prod) => setChatProductContext(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 p-8 space-y-2">
              <div className="text-4xl mb-2">🔍</div>
              <h4 className="font-extrabold text-sm text-navy">Không tìm thấy sản phẩm phù hợp</h4>
              <p className="text-xs text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
              <button
                onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                className="mt-3 bg-navy text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-navy-dark transition"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </section>
      </main>

      <LiveChatWidget
        selectedProductContext={chatProductContext}
        onClearProductContext={() => setChatProductContext(null)}
      />

      <Footer />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />
      
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
