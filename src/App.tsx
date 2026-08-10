import { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from './components/Toast';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilters } from './components/CategoryFilters';
import { ProductCard } from './components/ProductCard';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminThemeCustomizer } from './components/AdminThemeCustomizer';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ChangeAvatarModal } from './components/ChangeAvatarModal';
import { AddProductModal } from './components/AddProductModal';
import { ShopManagementDashboard } from './components/ShopManagementDashboard';
import { LiveChatWidget } from './components/LiveChatWidget';
import { Footer } from './components/Footer';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import type { Product, ShopType } from './types';
import { supabase } from './lib/supabase';

function MainApp() {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedCustoms = JSON.parse(localStorage.getItem('tq_custom_products') || '[]');
    return [...savedCustoms, ...INITIAL_PRODUCTS];
  });

  const [selectedCategory, setSelectedCategory] = useState<ShopType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'chat'>('shop');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAdminThemeOpen, setIsAdminThemeOpen] = useState(false);
  const [isSuperAdminDashboardOpen, setIsSuperAdminDashboardOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isShopManagementOpen, setIsShopManagementOpen] = useState(false);

  // Chat product context
  const [chatProductContext, setChatProductContext] = useState<Product | null>(null);

  useEffect(() => {
    const fetchCloudProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const formatted: Product[] = data.map((p: any) => ({
            id: p.id,
            title: p.title || p.name,
            name: p.name || p.title,
            price: p.price,
            shopType: p.shop_type || p.shopType || 'RETAIL',
            shopName: p.shop_name || p.shopName || 'TQ Store',
            img: p.img || p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
            images: p.images,
            badge: p.badge,
            details: p.details,
            stock: p.stock || 50,
            salesCount: p.sales_count || p.salesCount || 10
          }));

          setProducts(prev => {
            const map = new Map();
            [...formatted, ...prev].forEach(item => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Using resilient cloud products state:', err);
      }
    };

    fetchCloudProducts();

    // Supabase Realtime Subscription for Live Product Sync Across Browsers
    const productChannel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (payload) => {
        if (payload.new) {
          const p = payload.new;
          const formatted: Product = {
            id: p.id,
            title: p.title || p.name,
            name: p.name || p.title,
            price: p.price,
            shopType: p.shop_type || p.shopType || 'RETAIL',
            shopName: p.shop_name || p.shopName || 'TQ Store',
            img: p.img || p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
            images: p.images,
            badge: p.badge,
            details: p.details,
            stock: p.stock || 50,
            salesCount: p.sales_count || 10
          };
          setProducts(prev => [formatted, ...prev.filter(item => item.id !== formatted.id)]);
        }
      })
      .on('broadcast', { event: 'new_product_posted' }, (payload) => {
        if (payload?.payload) {
          const formatted: Product = payload.payload;
          setProducts(prev => [formatted, ...prev.filter(item => item.id !== formatted.id)]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
    };
  }, []);

  const handleProductAdded = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev.filter(item => item.id !== newProd.id)]);
  };

  const handleDeleteProduct = async (prodId: string | number) => {
    setProducts(prev => prev.filter(p => p.id !== prodId));
    
    // Update local persistence
    const savedCustoms = JSON.parse(localStorage.getItem('tq_custom_products') || '[]');
    const updatedCustoms = savedCustoms.filter((p: any) => p.id !== prodId);
    localStorage.setItem('tq_custom_products', JSON.stringify(updatedCustoms));

    try {
      await supabase.from('products').delete().eq('id', prodId);
    } catch (e) {
      console.warn('Cloud delete product active');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.shopType === selectedCategory;
    const matchQuery = searchQuery.trim() === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.details && p.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <ToastContainer />

      <Header
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenCartDrawer={() => setIsCartOpen(true)}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
        onOpenThemeCustomizer={() => setIsAdminThemeOpen(true)}
        onOpenSuperAdminDashboard={() => setIsSuperAdminDashboardOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenChangeAvatar={() => setIsChangeAvatarOpen(true)}
        onOpenAddProductModal={() => setIsAddProductOpen(true)}
        onOpenShopManagementDashboard={() => setIsShopManagementOpen(true)}
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
        onOpenAuthModal={() => setIsAuthOpen(true)}
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

      <AdminThemeCustomizer
        isOpen={isAdminThemeOpen}
        onClose={() => setIsAdminThemeOpen(false)}
      />

      <SuperAdminDashboard
        isOpen={isSuperAdminDashboardOpen}
        onClose={() => setIsSuperAdminDashboardOpen(false)}
        onOpenThemeCustomizer={() => setIsAdminThemeOpen(true)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <ChangeAvatarModal
        isOpen={isChangeAvatarOpen}
        onClose={() => setIsChangeAvatarOpen(false)}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onProductAdded={handleProductAdded}
      />

      <ShopManagementDashboard
        isOpen={isShopManagementOpen}
        onClose={() => setIsShopManagementOpen(false)}
        onOpenAddProductModal={() => { setIsShopManagementOpen(false); setIsAddProductOpen(true); }}
        products={products}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <MainApp />
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
