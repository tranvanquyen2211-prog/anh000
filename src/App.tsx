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
import { AdminAiDesignStudio } from './components/AdminAiDesignStudio';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ChangeAvatarModal } from './components/ChangeAvatarModal';
import { AddProductModal } from './components/AddProductModal';
import { ShopManagementDashboard } from './components/ShopManagementDashboard';
import { LiveChatWidget } from './components/LiveChatWidget';
import { AiShoppingAssistant } from './components/AiShoppingAssistant';
import { WatchToEarnModal } from './components/WatchToEarnModal';
import { UserCoinsHistoryModal } from './components/UserCoinsHistoryModal';
import { WalletDepositWithdrawModal } from './components/WalletDepositWithdrawModal';
import { AiMixMatchStudioModal } from './components/AiMixMatchStudioModal';
import { ExportStatementModal } from './components/ExportStatementModal';
import { ShopeeMobileIconGrid } from './components/ShopeeMobileIconGrid';
import { ShopeeFlashSaleSection } from './components/ShopeeFlashSaleSection';
import { ShopeeMallSection } from './components/ShopeeMallSection';
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
  const [isAdminAiDesignStudioOpen, setIsAdminAiDesignStudioOpen] = useState(false);
  const [isSuperAdminDashboardOpen, setIsSuperAdminDashboardOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isShopManagementOpen, setIsShopManagementOpen] = useState(false);
  const [isFakeReviewOpen, setIsFakeReviewOpen] = useState(false);
  const [isWatchToEarnOpen, setIsWatchToEarnOpen] = useState(false);
  const [isUserCoinsModalOpen, setIsUserCoinsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAiMixMatchModalOpen, setIsAiMixMatchModalOpen] = useState(false);
  const [isExportStatementOpen, setIsExportStatementOpen] = useState(false);
  const [exportTargetRole, setExportTargetRole] = useState<'SUPER_ADMIN' | 'SHOP'>('SHOP');
  const [exportShopName, setExportShopName] = useState<string | undefined>(undefined);

  const handleOpenExportStatement = (role: 'SUPER_ADMIN' | 'SHOP', sName?: string) => {
    setExportTargetRole(role);
    setExportShopName(sName);
    setIsExportStatementOpen(true);
  };

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
        onOpenWalletDepositWithdrawModal={() => setIsWalletModalOpen(true)}
        onOpenAiMixMatchModal={() => setIsAiMixMatchModalOpen(true)}
        onOpenThemeCustomizer={() => setIsAdminThemeOpen(true)}
        onOpenAiDesignStudio={() => setIsAdminAiDesignStudioOpen(true)}
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-6 md:pb-8 space-y-8">
        {(vis?.showHeroBanner !== false) && (
          <HeroBanner onSelectCategory={(cat) => { setSelectedCategory(cat); setActiveTab('shop'); }} />
        )}

        {/* 📱 SHOPEE MOBILE ICON GRID MENU (Mobile First App UI) */}
        <ShopeeMobileIconGrid
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onOpenAiMixMatchModal={() => setIsAiMixMatchModalOpen(true)}
          onOpenWalletDepositWithdrawModal={() => setIsWalletModalOpen(true)}
          onOpenWatchToEarnModal={() => setIsWatchToEarnOpen(true)}
        />

        {/* ⚡ SHOPEE FLASH SALE COUNTDOWN SECTION */}
        <ShopeeFlashSaleSection
          products={products}
          onOpenProductDetail={(p) => setSelectedProductForDetail(p)}
        />

        {/* 🛍️ SHOPEE MALL OFFICIAL STORE SECTION */}
        <ShopeeMallSection
          products={products}
          onOpenProductDetail={(p) => setSelectedProductForDetail(p)}
        />

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
              <h2 className="text-xl md:text-2xl font-black text-navy tracking-wide uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ee4d2d]"></span>
                GỢI Ý HÔM NAY - TẤT CẢ GIAN HÀNG {selectedProvince !== 'ALL' ? `- ${selectedProvince.toUpperCase()}` : ''}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Supabase Realtime Marketplace • Chuẩn Shopee Web PC Desktop & Mobile App
              </p>
            </div>
            <span className="text-xs font-extrabold bg-[#ee4d2d]/10 text-[#ee4d2d] px-3.5 py-1.5 rounded-full border border-[#ee4d2d]/30">
              Hiển thị: {filteredProducts.length} mặt hàng
            </span>
          </div>

          {/* Shopee Desktop PC Layout Grid: Sidebar Filters (3 cols) + Product List (9 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 🔍 SHOPEE DESKTOP FILTER SIDEBAR (Left Column - 3 Cols on PC) */}
            <aside className="hidden lg:block lg:col-span-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-6 sticky top-24">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  🔍 BỘ LỌC TÌM KIẾM
                </h3>
              </div>

              {/* Category Tree */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Tất Cả Danh Mục</h4>
                <div className="space-y-1 text-xs font-bold text-gray-700">
                  <div
                    onClick={() => setSelectedCategory('ALL')}
                    className={`p-2 rounded-xl cursor-pointer flex items-center justify-between transition ${
                      selectedCategory === 'ALL' ? 'bg-[#ee4d2d] text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>✨ Tất Cả Sản Phẩm</span>
                  </div>

                  <div
                    onClick={() => setSelectedCategory('RENTAL')}
                    className={`p-2 rounded-xl cursor-pointer flex items-center justify-between transition ${
                      selectedCategory === 'RENTAL' ? 'bg-[#ee4d2d] text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>👗 Cho Thuê Trang Phục</span>
                  </div>

                  <div
                    onClick={() => setSelectedCategory('RETAIL')}
                    className={`p-2 rounded-xl cursor-pointer flex items-center justify-between transition ${
                      selectedCategory === 'RETAIL' ? 'bg-[#ee4d2d] text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>🛍️ Shopee Mall Bán Đồ</span>
                  </div>

                  <div
                    onClick={() => setSelectedCategory('FNB')}
                    className={`p-2 rounded-xl cursor-pointer flex items-center justify-between transition ${
                      selectedCategory === 'FNB' ? 'bg-[#ee4d2d] text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>🧋 ShopeeFood Đồ Ăn</span>
                  </div>

                  <div
                    onClick={() => setSelectedCategory('BEAUTY')}
                    className={`p-2 rounded-xl cursor-pointer flex items-center justify-between transition ${
                      selectedCategory === 'BEAUTY' ? 'bg-[#ee4d2d] text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>💄 Spa Làm Đẹp</span>
                  </div>

                  <div
                    onClick={() => setSelectedCategory('TAXI')}
                    className={`p-2 rounded-xl cursor-pointer flex items-center justify-between transition ${
                      selectedCategory === 'TAXI' ? 'bg-[#ee4d2d] text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>🚖 Gọi Taxi Đặt Xe</span>
                  </div>
                </div>
              </div>

              {/* Price Filter Box */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Khoảng Giá (VNĐ)</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="number"
                    placeholder="TỪ đ"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#ee4d2d]"
                  />
                  <input
                    type="number"
                    placeholder="ĐẾN đ"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>
                <button
                  type="button"
                  className="w-full bg-[#ee4d2d] hover:bg-[#d0011b] text-white text-xs font-black py-2 rounded-xl uppercase tracking-wider shadow-xs transition cursor-pointer"
                >
                  ÁP DỤNG KHOẢNG GIÁ
                </button>
              </div>

              {/* Rating Filter Box */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Đánh Giá Của Khách</h4>
                <div className="space-y-1.5 text-xs text-amber-500 font-bold">
                  <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="text-gray-600 text-[11px]">5 Sao</span>
                  </div>
                  <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg">
                    <span>⭐⭐⭐⭐</span>
                    <span className="text-gray-600 text-[11px]">Từ 4 Sao trở lên</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* 🛍️ MAIN PRODUCT LIST & SHOPEE SORT BAR (Right Column - 9 Cols on PC) */}
            <div className="col-span-1 lg:col-span-9 space-y-4">
              
              {/* Shopee PC Desktop Sorting Control Bar */}
              <div className="bg-gray-100 p-3 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-black">Sắp xếp theo:</span>
                  <button className="bg-[#ee4d2d] text-white px-3.5 py-1.5 rounded-xl shadow-xs">Liên Quan</button>
                  <button className="bg-white hover:bg-gray-200 text-gray-800 px-3.5 py-1.5 rounded-xl transition">Mới Nhất</button>
                  <button className="bg-white hover:bg-gray-200 text-gray-800 px-3.5 py-1.5 rounded-xl transition">Bán Chạy</button>
                </div>
                <div className="text-xs text-gray-500 font-semibold">
                  Trang 1 / 1
                </div>
              </div>

              {/* Product Cards Grid: 2-col on Mobile, 4-col on PC */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-4">
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
                </div>
              )}
            </div>

          </div>
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
        onOpenExportStatement={(role, sName) => handleOpenExportStatement(role, sName)}
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
        onOpenExportStatement={(role, sName) => handleOpenExportStatement(role, sName)}
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

      <AdminAiDesignStudio
        isOpen={isAdminAiDesignStudioOpen}
        onClose={() => setIsAdminAiDesignStudioOpen(false)}
      />

      <WalletDepositWithdrawModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      <AiMixMatchStudioModal
        isOpen={isAiMixMatchModalOpen}
        onClose={() => setIsAiMixMatchModalOpen(false)}
        products={products}
        onOpenProductDetail={p => setSelectedProductForDetail(p)}
      />

      <ExportStatementModal
        isOpen={isExportStatementOpen}
        onClose={() => setIsExportStatementOpen(false)}
        targetRole={exportTargetRole}
        shopName={exportShopName}
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
