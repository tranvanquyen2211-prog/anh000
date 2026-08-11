import { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastContainer } from './components/Toast';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilters } from './components/CategoryFilters';
import { LocationFilter } from './components/LocationFilter';
import { SmartRecommenderSection } from './components/SmartRecommenderSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ShopStorefrontModal } from './components/ShopStorefrontModal';
import { EditProductSalesModal } from './components/EditProductSalesModal';
import { AdminFakeReviewModal } from './components/AdminFakeReviewModal';
import { type SystemNotification } from './components/NotificationCenter';
import { ChatInboxModal } from './components/ChatInboxModal';
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
import { AiShoppingAssistant } from './components/AiShoppingAssistant';
import { WatchToEarnModal } from './components/WatchToEarnModal';
import { UserCoinsHistoryModal } from './components/UserCoinsHistoryModal';
import { Footer } from './components/Footer';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import { detectProvinceFromShopInfo } from './data/vietnamLocations';
import type { Product, ShopType } from './types';
import { supabase } from './lib/supabase';

function MainApp() {
  const { theme } = useTheme();
  const vis = theme.featureVisibility;

  const [products, setProducts] = useState<Product[]>(() => {
    const savedCustoms = JSON.parse(localStorage.getItem('tq_custom_products') || '[]');
    const overrides = JSON.parse(localStorage.getItem('tq_sales_count_overrides') || '{}');
    
    const combined = [...savedCustoms, ...INITIAL_PRODUCTS];
    return combined.map(p => ({
      ...p,
      salesCount: overrides[p.id] !== undefined ? overrides[p.id] : (p.salesCount || 12)
    }));
  });

  const [selectedCategory, setSelectedCategory] = useState<ShopType | 'ALL'>('ALL');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'chat'>('shop');

  // Notifications State
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('tq_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif_1',
        type: 'order',
        title: '🎉 Chào mừng tới TQ Store Marketplace!',
        message: 'Hệ thống đồng bộ Realtime Supabase hoạt động 100%.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      },
      {
        id: 'notif_2',
        type: 'coin',
        title: '🪙 Nhận Xu Tích Lũy Đơn Hàng',
        message: 'Tài khoản của bạn tự động nhận TQ Xu khi mua sắm & đánh giá sản phẩm.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      }
    ];
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isChatInboxOpen, setIsChatInboxOpen] = useState(false);
  const [isAdminThemeOpen, setIsAdminThemeOpen] = useState(false);
  const [isSuperAdminDashboardOpen, setIsSuperAdminDashboardOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isShopManagementOpen, setIsShopManagementOpen] = useState(false);
  const [isFakeReviewOpen, setIsFakeReviewOpen] = useState(false);
  const [isWatchToEarnOpen, setIsWatchToEarnOpen] = useState(false);
  const [isUserCoinsModalOpen, setIsUserCoinsModalOpen] = useState(false);

  // Selected product & shop state
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [selectedShopNameForStorefront, setSelectedShopNameForStorefront] = useState<string | null>(null);
  const [selectedProductForEditSales, setSelectedProductForEditSales] = useState<Product | null>(null);
  const [chatProductContext, setChatProductContext] = useState<Product | null>(null);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const pushNewNotification = (notifItem: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: SystemNotification = {
      id: `notif_${Date.now()}`,
      ...notifItem,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('tq_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleNotifications = () => {
    setIsNotificationsOpen(prev => {
      const next = !prev;
      if (next) {
        handleMarkAllNotificationsAsRead();
      }
      return next;
    });
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      localStorage.setItem('tq_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // 🌐 URL Parameter listener for unique Shop Web Links (e.g., ?shop=TQ%20Rental%20Studio or ?slug=vay-cuoi-luxury-hanoi)
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get('shop');
    const slugParam = params.get('slug');

    if (shopParam) {
      setSelectedShopNameForStorefront(decodeURIComponent(shopParam));
    } else if (slugParam) {
      const customLinks = JSON.parse(localStorage.getItem('tq_custom_links') || '[]');
      const found = customLinks.find((l: any) => l.slug.toLowerCase() === slugParam.toLowerCase());
      if (found) {
        setSelectedShopNameForStorefront(found.shopName);
      }
    } else {
      const pathSlug = window.location.pathname.replace('/shop/', '').replace('/', '').trim();
      if (pathSlug) {
        const customLinks = JSON.parse(localStorage.getItem('tq_custom_links') || '[]');
        const found = customLinks.find((l: any) => l.slug.toLowerCase() === pathSlug.toLowerCase());
        if (found) {
          setSelectedShopNameForStorefront(found.shopName);
        }
      }
    }

    const fetchCloudProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const overrides = JSON.parse(localStorage.getItem('tq_sales_count_overrides') || '{}');
          
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
            salesCount: overrides[p.id] !== undefined ? overrides[p.id] : (p.sales_count || p.salesCount || 12),
            isGrandOpening: p.is_grand_opening
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

    // Supabase Realtime Subscriptions for Realtime Notifications, Products & Shop Address Config Sync
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
            salesCount: p.sales_count || 12
          };
          setProducts(prev => [formatted, ...prev.filter(item => item.id !== formatted.id)]);
        }
      })
      .on('broadcast', { event: 'product_updated' }, (payload) => {
        if (payload?.payload?.id && payload?.payload?.salesCount !== undefined) {
          const { id, salesCount } = payload.payload;
          handleSalesCountUpdated(id, salesCount);
        }
      })
      .on('broadcast', { event: 'new_product_posted' }, (payload) => {
        if (payload?.payload) {
          const formatted: Product = payload.payload;
          setProducts(prev => [formatted, ...prev.filter(item => item.id !== formatted.id)]);
        }
      })
      .subscribe();

    // Listen to orders channel for live notifications
    const orderChannel = supabase
      .channel('public:orders')
      .on('broadcast', { event: 'new_order_placed' }, (payload) => {
        if (payload?.payload) {
          const order = payload.payload;
          pushNewNotification({
            type: 'order',
            title: '🎉 Đơn hàng mới thành công',
            message: `Mã đơn #${order.id} - Tổng tiền: ${(order.total_price || 0).toLocaleString('vi-VN')} VNĐ.`
          });
        }
      })
      .subscribe();

    // Listen to live broadcast system announcements sent by Super Admin (Module 13)
    const announcementChannel = supabase
      .channel('public:system_announcements')
      .on('broadcast', { event: 'new_system_announcement' }, (payload) => {
        if (payload?.payload) {
          const notif = payload.payload;
          setNotifications(prev => {
            const updated = [notif, ...prev.filter(n => n.id !== notif.id)];
            localStorage.setItem('tq_notifications', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .subscribe();

    // Listen to shop config / address / google maps update broadcast
    const shopConfigChannel = supabase
      .channel('public:shop_configs')
      .on('broadcast', { event: 'shop_address_updated' }, (payload) => {
        if (payload?.payload?.shopName) {
          setProducts(prev => [...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(announcementChannel);
      supabase.removeChannel(shopConfigChannel);
    };
  }, []);

  const handleProductAdded = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev.filter(item => item.id !== newProd.id)]);
  };

  const handleSalesCountUpdated = (prodId: string | number, newSalesCount: number) => {
    setProducts(prev => prev.map(p => p.id === prodId ? { ...p, salesCount: newSalesCount } : p));
  };

  const handleToggleGrandOpeningProduct = (prodId: string | number) => {
    setProducts(prev => prev.map(p => p.id === prodId ? { ...p, isGrandOpening: !p.isGrandOpening } : p));
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
    
    // Location Filter Check based on Shop Config & Google Maps Link
    const shopConfig = JSON.parse(localStorage.getItem(`tq_shop_config_${p.shopName}`) || '{}');
    const shopProvince = detectProvinceFromShopInfo(
      p.shopName,
      shopConfig.warehouseAddress || shopConfig.pickupAddress,
      shopConfig.googleMapsUrl
    );

    const matchProvince = selectedProvince === 'ALL' || shopProvince === selectedProvince;
    
    const addressStr = `${shopConfig.warehouseAddress || ''} ${shopConfig.pickupAddress || ''}`.toLowerCase();
    const matchDistrict = selectedDistrict === 'ALL' || addressStr.includes(selectedDistrict.toLowerCase());

    return matchCat && matchQuery && matchProvince && matchDistrict;
  });

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <ToastContainer />

      <Header
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenCartDrawer={() => setIsCartOpen(true)}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
        onOpenChatInbox={() => setIsChatInboxOpen(true)}
        onOpenWatchToEarnModal={() => setIsWatchToEarnOpen(true)}
        onOpenUserCoinsModal={() => setIsUserCoinsModalOpen(true)}
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
        unreadNotificationsCount={unreadNotificationsCount}
        onToggleNotifications={handleToggleNotifications}
        isNotificationsOpen={isNotificationsOpen}
        notifications={notifications}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-8">
        {(vis?.showHeroBanner !== false) && (
          <HeroBanner onSelectCategory={(cat) => { setSelectedCategory(cat); setActiveTab('shop'); }} />
        )}

        {(vis?.showCategoryFilters !== false) && (
          <CategoryFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onQuickSearch={(q) => setSearchQuery(q)}
          />
        )}

        {/* Vietnam Province & District Location Filter Bar */}
        {(vis?.showLocationFilter !== false) && (
          <LocationFilter
            selectedProvince={selectedProvince}
            onSelectProvince={setSelectedProvince}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
          />
        )}

        {/* 🤖 Smart Recommendation Section (New / Grand Opening Shops & Products & Keyword Match) */}
        {(vis?.showSmartRecommender !== false) && (
          <SmartRecommenderSection
            products={products}
            searchQuery={searchQuery}
            onOpenShopStorefront={(sName) => setSelectedShopNameForStorefront(sName)}
            onOpenProductDetail={(prod) => setSelectedProductForDetail(prod)}
            onOpenChatWithProduct={(prod) => setChatProductContext(prod)}
            onOpenEditSalesCount={(prod) => setSelectedProductForEditSales(prod)}
          />
        )}

        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-navy tracking-wide uppercase">
                SẢN PHẢM & DỊCH VỤ CÁC GIAN HÀNG {selectedProvince !== 'ALL' ? `- ${selectedProvince.toUpperCase()}` : ''}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Supabase Realtime Marketplace • Lọc theo vị trí Google Maps & Kho hàng
              </p>
            </div>
            <span className="text-xs font-extrabold bg-navy/10 text-navy px-3.5 py-1.5 rounded-full border border-navy/20">
              Hiển thị: {filteredProducts.length} mặt hàng
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenChatWithProduct={(prod) => setChatProductContext(prod)}
                  onOpenProductDetail={(prod) => setSelectedProductForDetail(prod)}
                  onOpenEditSalesCount={(prod) => setSelectedProductForEditSales(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 p-8 space-y-2">
              <div className="text-4xl mb-2">📍</div>
              <h4 className="font-extrabold text-sm text-navy">Không có gian hàng hoặc sản phẩm nào ở {selectedProvince}</h4>
              <p className="text-xs text-gray-500">Thử chọn Tỉnh/Thành khác hoặc xóa bộ lọc khu vực.</p>
              <button
                onClick={() => { setSelectedProvince('ALL'); setSelectedDistrict('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
                className="mt-3 bg-navy text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-navy-dark transition"
              >
                Xem tất cả sản phẩm toàn quốc
              </button>
            </div>
          )}
        </section>
      </main>

      {(vis?.showLiveChatWidget !== false) && (
        <LiveChatWidget
          selectedProductContext={chatProductContext}
          onClearProductContext={() => setChatProductContext(null)}
          onOpenAuthModal={() => setIsAuthOpen(true)}
        />
      )}

      <AiShoppingAssistant
        products={products}
        onOpenProductDetail={(prod) => setSelectedProductForDetail(prod)}
        onOpenShopStorefront={(sName) => setSelectedShopNameForStorefront(sName)}
      />

      <Footer />

      <ChatInboxModal
        isOpen={isChatInboxOpen}
        onClose={() => setIsChatInboxOpen(false)}
        onSelectConversationProduct={(prod) => setSelectedProductForDetail(prod)}
      />

      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onOpenChatWithProduct={(prod) => setChatProductContext(prod)}
        onOpenShopStorefront={(sName) => setSelectedShopNameForStorefront(sName)}
        onProceedToCheckout={() => setIsCartOpen(true)}
      />

      <ShopStorefrontModal
        isOpen={Boolean(selectedShopNameForStorefront)}
        onClose={() => setSelectedShopNameForStorefront(null)}
        shopName={selectedShopNameForStorefront || ''}
        products={products}
        onOpenChatWithShop={(sName) => setChatProductContext({
          id: `shop_${Date.now()}`,
          title: `Hỏi đáp với Gian Hàng ${sName}`,
          price: 0,
          shopType: 'RETAIL',
          shopName: sName,
          img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
        })}
        onOpenProductDetail={(prod) => setSelectedProductForDetail(prod)}
      />

      <EditProductSalesModal
        isOpen={Boolean(selectedProductForEditSales)}
        onClose={() => setSelectedProductForEditSales(null)}
        product={selectedProductForEditSales}
        onSalesCountUpdated={handleSalesCountUpdated}
      />

      <AdminFakeReviewModal
        isOpen={isFakeReviewOpen}
        onClose={() => setIsFakeReviewOpen(false)}
        products={products}
        onReviewsGenerated={() => {
          setProducts(prev => [...prev]);
        }}
      />

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
        onOpenChatWithShop={(sName) => setChatProductContext({
          id: `shop_${Date.now()}`,
          title: `Hỏi đáp với Gian Hàng ${sName}`,
          price: 0,
          shopType: 'RETAIL',
          shopName: sName,
          img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
        })}
      />

      <AdminThemeCustomizer
        isOpen={isAdminThemeOpen}
        onClose={() => setIsAdminThemeOpen(false)}
      />

      <SuperAdminDashboard
        isOpen={isSuperAdminDashboardOpen}
        onClose={() => setIsSuperAdminDashboardOpen(false)}
        onOpenThemeCustomizer={() => setIsAdminThemeOpen(true)}
        onOpenFakeReviewModal={() => setIsFakeReviewOpen(true)}
        onOpenShopStorefront={(sName) => setSelectedShopNameForStorefront(sName)}
        products={products}
        onToggleGrandOpeningProduct={handleToggleGrandOpeningProduct}
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

      <WatchToEarnModal
        isOpen={isWatchToEarnOpen}
        onClose={() => setIsWatchToEarnOpen(false)}
      />

      <UserCoinsHistoryModal
        isOpen={isUserCoinsModalOpen}
        onClose={() => setIsUserCoinsModalOpen(false)}
        onOpenWatchToEarnModal={() => setIsWatchToEarnOpen(true)}
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
