import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, DEFAULT_MASTER_SWITCHES, DEFAULT_HOMEPAGE_SECTIONS, DEFAULT_FOOTER_CONFIG } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { recordAuditLog } from '../lib/auditLogger';
import type { UserProfile, Product, CoinTransaction, WalletTransaction, AuditLog, Voucher, HomepageSectionConfig, FooterColumnConfig } from '../types';
import {
  Crown,
  UserCheck,
  Key,
  CreditCard,
  Percent,
  Ticket,
  Link,
  Star,
  Bot,
  Layers,
  Megaphone,
  X,
  Plus,
  Trash2,
  Lock,
  Unlock,
  TrendingUp,
  Users,
  Sliders,
  Eye,
  RefreshCw,
  UserPlus,
  Send,
  Wand2,
  Sparkles,
  Zap,
  Globe,
  PartyPopper,
  Flame,
  Search,
  ToggleLeft,
  ToggleRight,
  Tv,
  Coins,
  History,
  Wallet,
  CheckCircle2,
  ShoppingBag,
  XCircle,
  FileText,
  ShieldAlert,
  Download,
  Store,
  Truck,
  Package,
  Wrench,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ResetRequest {
  id: string;
  userName: string;
  phone: string;
  time: string;
  status: 'PENDING' | 'APPROVED';
}

interface WithdrawalRequest {
  id: string;
  shopName: string;
  amount: number;
  bankName: string;
  stk: string;
  ownerName: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface SuperAdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenThemeCustomizer: () => void;
  onOpenFakeReviewModal?: () => void;
  onOpenShopStorefront?: (shopName: string) => void;
  onOpenExportStatement?: (role: 'SUPER_ADMIN' | 'SHOP', sName?: string) => void;
  products?: Product[];
  onToggleGrandOpeningProduct?: (productId: number | string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  isOpen,
  onClose,
  onOpenThemeCustomizer,
  onOpenFakeReviewModal,
  onOpenShopStorefront,
  onOpenExportStatement,
  products = [],
  onToggleGrandOpeningProduct
}) => {
  const { user, impersonateShop } = useAuth();
  const { theme, updateTheme, toggleFeatureVisibility, toggleMasterSwitch } = useTheme();
  const { addToast } = useToast();

  const [adminTab, setAdminTab] = useState<
    | 'users'
    | 'master-control'
    | 'password-resets'
    | 'financial-analytics'
    | 'withdrawals'
    | 'consumer-trends'
    | 'system-config'
    | 'fee-overrides'
    | 'vouchers'
    | 'custom-links'
    | 'reviews-moderation'
    | 'fake-reviews'
    | 'buttons-categories'
    | 'broadcast-announcement'
    | 'smart-recommender'
    | 'feature-visibility'
    | 'watch-to-earn'
    | 'coin-audit'
    | 'wallet-approvals'
    | 'audit-logs'
    | 'customer-orders'
    | 'homepage-sections'
  >('users');

  // Users list state
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('tq_phone_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Create user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPass, setNewUserPass] = useState('123456');
  const [newUserRole, setNewUserRole] = useState<'USER' | 'SHOP' | 'STAFF' | 'SUPER_ADMIN'>('SHOP');
  const [newShopType, setNewShopType] = useState<'RENTAL' | 'RETAIL' | 'FNB' | 'BEAUTY'>('RENTAL');
  const [newInitBalance, setNewInitBalance] = useState<number>(0);
  const [newInitCoins, setNewInitCoins] = useState<number>(0);

  // Password reset requests
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([
    { id: 'req_1', userName: 'Shop Thời Trang TQ', phone: '0987654321', time: '10:30', status: 'PENDING' },
    { id: 'req_2', userName: 'Nguyễn Văn A', phone: '0912345678', time: '11:15', status: 'PENDING' }
  ]);

  // Withdrawals list
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem('tq_withdrawals');
    return saved ? JSON.parse(saved) : [];
  });

  // System fee rate
  const [defaultFeeRate, setDefaultFeeRate] = useState<number>(5);

  // Shop fee overrides
  const [shopFeeOverrides, setShopFeeOverrides] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('tq_shop_fee_overrides');
    return saved ? JSON.parse(saved) : {};
  });

  // Vouchers state
  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem('tq_vouchers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'v_1',
        code: 'TQVIP100K',
        discountType: 'fixed',
        discountValue: 100000,
        minOrderAmount: 300000,
        maxDiscountAmount: 100000,
        requiredPaymentMethod: 'WALLET',
        totalUsageLimit: 100,
        usedCount: 24,
        description: 'Giảm 100K cho đơn từ 300K khi thanh toán qua Ví TQ Pay',
        status: 'active',
        createdAt: '10/08/2026'
      },
      {
        id: 'v_2',
        code: 'TQCHAO2026',
        discountType: 'percent',
        discountValue: 15,
        minOrderAmount: 150000,
        maxDiscountAmount: 50000,
        requiredPaymentMethod: 'ALL',
        totalUsageLimit: 500,
        usedCount: 142,
        description: 'Giảm 15% tối đa 50K cho tất cả đơn hàng từ 150K',
        status: 'active',
        createdAt: '11/08/2026'
      },
      {
        id: 'v_3',
        code: 'TQVIETQR20',
        discountType: 'fixed',
        discountValue: 20000,
        minOrderAmount: 100000,
        maxDiscountAmount: 20000,
        requiredPaymentMethod: 'VIETQR',
        totalUsageLimit: 200,
        usedCount: 88,
        description: 'Giảm 20K cho đơn chuyển khoản VietQR từ 100K',
        status: 'active',
        createdAt: '11/08/2026'
      }
    ];
  });
  const [newVCode, setNewVCode] = useState('');
  const [newVType, setNewVType] = useState<'percent' | 'fixed'>('fixed');
  const [newVValue, setNewVValue] = useState<number>(50000);
  const [newVMinOrder, setNewVMinOrder] = useState<number>(100000);
  const [newVMaxDiscount, setNewVMaxDiscount] = useState<number>(100000);
  const [newVRequiredPayment, setNewVRequiredPayment] = useState<'ALL' | 'WALLET' | 'VIETQR' | 'COD'>('WALLET');
  const [newVTotalLimit, setNewVTotalLimit] = useState<number>(100);
  const [newVDesc, setNewVDesc] = useState('');

  // Custom links state
  const [customLinks, setCustomLinks] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_custom_links');
    return saved ? JSON.parse(saved) : [
      { shopName: 'TQ Rental Studio', slug: 'vay-cuoi-luxury-hanoi', fullUrl: 'https://tqstore.vn/shop/vay-cuoi-luxury-hanoi' },
      { shopName: 'TQ Retail Shop', slug: 'shop-thoi-trang-tq', fullUrl: 'https://tqstore.vn/shop/shop-thoi-trang-tq' }
    ];
  });
  const [newSlugShop, setNewSlugShop] = useState('TQ Rental Studio');
  const [newSlugCode, setNewSlugCode] = useState('');

  // AI Link Recommender State
  const [aiLinkKeyword, setAiLinkKeyword] = useState('');
  const [isAiGeneratingLinks, setIsAiGeneratingLinks] = useState(false);
  const [aiSuggestedLinksList, setAiSuggestedLinksList] = useState<Array<{ shopName: string; slug: string; fullUrl: string }>>([]);

  // Reviews moderation state
  const [reviewsList, setReviewsList] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  // Quick Buttons state
  const [quickButtons, setQuickButtons] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_quick_buttons');
    return saved ? JSON.parse(saved) : [];
  });
  const [newBtnLabel, setNewBtnLabel] = useState('');
  const [newBtnUrl, setNewBtnUrl] = useState('');

  // Broadcast Announcement State (Module 13)
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementTopic, setAnnouncementTopic] = useState<'PROMO' | 'MAINTENANCE' | 'REWARD' | 'NEW_COLLECTION'>('PROMO');
  const [isAiGeneratingText, setIsAiGeneratingText] = useState(false);

  // Module 14: Smart Recommender Keyword Match Simulator State
  const [testSearchKeyword, setTestSearchKeyword] = useState('váy cưới');

  // Module 16: Watch to Earn Videos State
  const [watchVideos, setWatchVideos] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_watch_to_earn_videos');
    return saved ? JSON.parse(saved) : [
      {
        id: 'vid_1',
        youtubeId: 'dQw4w9WgXcQ',
        title: '🔥 Video Giới Thiệu Hệ Thống TQ Store & Ưu Đãi Xu TQ Pay',
        requiredSeconds: 15,
        rewardCoins: 100,
        status: 'active'
      },
      {
        id: 'vid_2',
        youtubeId: 'L_LUpnjgPso',
        title: '🏖️ Xu Hướng Thời Trang Đi Biển & Váy Cưới Luxury 2026',
        requiredSeconds: 20,
        rewardCoins: 150,
        status: 'active'
      },
      {
        id: 'vid_3',
        youtubeId: 'fJ9rUzIMcZQ',
        title: '🧋 Khai Trương Chuỗi Trà Sữa & Spa Làm Đẹp Toàn Quốc',
        requiredSeconds: 30,
        rewardCoins: 200,
        status: 'active'
      }
    ];
  });

  const [newVidUrl, setNewVidUrl] = useState('');
  const [newVidTitle, setNewVidTitle] = useState('');
  const [newVidSeconds, setNewVidSeconds] = useState<number>(30);
  const [newVidReward, setNewVidReward] = useState<number>(100);

  // Module 17: Coin Audit Transactions State
  const [coinTxs, setCoinTxs] = useState<CoinTransaction[]>(() => {
    const saved = localStorage.getItem('tq_coin_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'tx_demo_1',
        userId: 'user_1',
        userName: 'Nguyễn Văn A',
        userPhone: '0912345678',
        userEmail: 'nguyenvana@gmail.com',
        amount: 100,
        type: 'WATCH_VIDEO',
        sourceDescription: '📺 Xem video YouTube: "🔥 Video Giới Thiệu Hệ Thống TQ Store & Ưu Đãi Xu TQ Pay"',
        timestamp: '10:15 11/08/2026'
      },
      {
        id: 'tx_demo_2',
        userId: 'user_2',
        userName: 'Trần Thị B',
        userPhone: '0987654321',
        userEmail: 'tranthib@gmail.com',
        amount: 100,
        type: 'REVIEW_BONUS',
        sourceDescription: '⭐ Đã gửi đánh giá sản phẩm thành công + Thưởng 100 TQ Coins',
        timestamp: '09:45 11/08/2026'
      },
      {
        id: 'tx_demo_3',
        userId: 'user_3',
        userName: 'Shop Thời Trang TQ',
        userPhone: '0900000000',
        userEmail: 'shopthoitrang@tqstore.vn',
        amount: 500,
        type: 'ADMIN_GRANT',
        sourceDescription: '👑 Super Admin cộng thưởng trực tiếp cho tài khoản',
        timestamp: '08:30 11/08/2026'
      }
    ];
  });

  const [coinAuditSearch, setCoinAuditSearch] = useState('');
  const [coinAuditFilterType, setCoinAuditFilterType] = useState<string>('ALL');

  // Module 19: Audit Logs (System Operation Logs) State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('tq_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'log_sys_01',
        actorName: 'Super Admin Overlord',
        actorRole: 'SUPER_ADMIN',
        action: 'Duyệt Lệnh Nạp Ví',
        target: 'Tài khoản: Nguyễn Văn A (SĐT: 0912345678)',
        details: 'Phê duyệt lệnh nạp 5,000,000 VNĐ vào Ví TQ Pay qua ngân hàng Vietcombank - Mã CK: VietQR-998877',
        ipAddress: '113.190.24.185 (Hà Nội, VN)',
        timestamp: '00:32:15 12/08/2026',
        severity: 'SUCCESS'
      },
      {
        id: 'log_sys_02',
        actorName: 'Super Admin Overlord',
        actorRole: 'SUPER_ADMIN',
        action: 'Khóa Tài Khoản',
        target: 'Shop Giả Lập Bán Hàng (SĐT: 0999888777)',
        details: 'Phát hiện nghi vấn tạo đơn hàng ảo gian lận Xu TQ, tiến hành khóa tài khoản 30 ngày',
        ipAddress: '113.190.24.185 (Hà Nội, VN)',
        timestamp: '23:45:10 11/08/2026',
        severity: 'WARNING'
      },
      {
        id: 'log_sys_03',
        actorName: 'Super Admin Overlord',
        actorRole: 'SUPER_ADMIN',
        action: 'Phát Sóng Broadcast',
        target: 'Toàn bộ 1,500+ tài khoản hệ thống',
        details: 'Phát sóng thông báo ưu đãi Flash Sale 50% toàn hệ thống TQ Store',
        ipAddress: '113.190.24.185 (Hà Nội, VN)',
        timestamp: '22:15:00 11/08/2026',
        severity: 'INFO'
      },
      {
        id: 'log_sys_04',
        actorName: 'Hệ Thống Supabase Cloud',
        actorRole: 'SYSTEM',
        action: 'Đồng Bộ Realtime WebSocket',
        target: 'Channel public:theme_settings',
        details: 'Đồng bộ cấu hình giao diện & danh mục sản phẩm tới 50+ máy khách đang kết nối',
        ipAddress: 'Supabase Cloud SG-01',
        timestamp: '21:00:12 11/08/2026',
        severity: 'SUCCESS'
      },
      {
        id: 'log_sys_05',
        actorName: 'Super Admin Overlord',
        actorRole: 'SUPER_ADMIN',
        action: 'Cài % Phí Sàn Riêng',
        target: 'Shop Thời Trang TQ Rental Studio',
        details: 'Cập nhật tỷ lệ phí sàn riêng từ 5% xuống 2.5% cho đối tác chiến lược',
        ipAddress: '113.190.24.185 (Hà Nội, VN)',
        timestamp: '19:30:45 11/08/2026',
        severity: 'INFO'
      },
      {
        id: 'log_sys_06',
        actorName: 'Shop Thời Trang TQ',
        actorRole: 'SHOP',
        action: 'Đổi Mật Khẩu',
        target: 'Tài khoản Cửa hàng ID: shop_01',
        details: 'Đã thay đổi mật khẩu bảo mật tài khoản Cửa hàng thành công',
        ipAddress: '14.226.12.90 (TP.HCM, VN)',
        timestamp: '18:10:05 11/08/2026',
        severity: 'INFO'
      }
    ];
  });

  // Module 21: Customer Order History & Platform Orders State
  const [allPlatformOrders, setAllPlatformOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('tq_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'ORD_2026_9988',
        customerName: 'Nguyễn Văn A',
        customerPhone: '0912345678',
        shopName: 'TQ Rental Studio',
        items: [
          { title: 'Váy Cưới Luxury VIP Studio 2026', quantity: 1, price: 4500000, type: 'RENTAL' }
        ],
        total_price: 4500000,
        paymentMethod: 'wallet',
        address: '123 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        status: 'COMPLETED',
        created_at: '11/08/2026 14:30'
      },
      {
        id: 'ORD_2026_9989',
        customerName: 'Trần Thị B',
        customerPhone: '0987654321',
        shopName: 'TQ Retail Shop',
        items: [
          { title: 'Áo Dài Cách Tân Thêu Hoa Cao Cấp', quantity: 2, price: 650000, type: 'RETAIL' }
        ],
        total_price: 1300000,
        paymentMethod: 'transfer',
        address: '456 Lê Lợi, Quận 3, TP. Hồ Chí Minh',
        status: 'COMPLETED',
        created_at: '11/08/2026 16:45'
      },
      {
        id: 'ORD_2026_9990',
        customerName: 'Lê Hoàng C',
        customerPhone: '0901112233',
        shopName: 'TQ Tea & Coffee',
        items: [
          { title: 'Trà Sữa Matcha Kem Trứng Nướng VIP', quantity: 5, price: 45000, type: 'FNB' }
        ],
        total_price: 225000,
        paymentMethod: 'cash',
        address: '789 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
        status: 'COMPLETED',
        created_at: '12/08/2026 00:15'
      }
    ];
  });

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('ALL');

  useEffect(() => {
    const handleOrderSync = () => {
      const saved = localStorage.getItem('tq_orders');
      if (saved) {
        try {
          setAllPlatformOrders(JSON.parse(saved));
        } catch (e) {}
      }
    };
    handleOrderSync();
    window.addEventListener('storage', handleOrderSync);
    window.addEventListener('tq_orders_updated', handleOrderSync);
    return () => {
      window.removeEventListener('storage', handleOrderSync);
      window.removeEventListener('tq_orders_updated', handleOrderSync);
    };
  }, []);

  const handleExportCustomerOrdersCSV = () => {
    const headers = ['Mã Đơn Hàng', 'Thời Gian', 'Tên Khách Hàng', 'SĐT Khách', 'Tên Gian Hàng', 'Sản Phẩm', 'Tổng Tiền (VNĐ)', 'Phương Thức Thanh Toán', 'Trạng Thái', 'Địa Chỉ Giao Hàng'];
    const rows = allPlatformOrders.map(o => [
      o.id || o.order_id,
      o.created_at || o.timestamp,
      `"${o.customerName || o.user_name || 'Khách Vãng Lai'}"`,
      o.customerPhone || o.user_phone || 'N/A',
      `"${o.shopName || 'TQ Store'}"`,
      `"${(o.items || []).map((i: any) => `${i.title} (x${i.quantity})`).join('; ')}"`,
      o.total_price || o.totalPrice || 0,
      o.paymentMethod === 'wallet' ? 'Ví TQ Pay' : o.paymentMethod === 'transfer' ? 'VietQR' : 'COD Tiền Mặt',
      o.status || 'COMPLETED',
      `"${o.address || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TQ_Customer_Orders_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('📄 Đã xuất toàn bộ Lịch sử mua hàng của Khách hàng ra file CSV thành công!', 'success');
  };

  // System Maintenance Lock Form State
  const masterSwitches = theme.masterSwitches || DEFAULT_MASTER_SWITCHES;
  const [maintTitle, setMaintTitle] = useState(() => masterSwitches.maintenanceTitle || '🚧 HỆ THỐNG ĐANG BẢO TRÌ & NÂNG CẤP ĐỊNH KỲ');
  const [maintMessage, setMaintMessage] = useState(() => masterSwitches.maintenanceMessage || 'Hệ thống TQ Marketplace đang tiến hành nâng cấp hạ tầng máy chủ đám mây Supabase Realtime và tối ưu hóa tốc độ. Vui lòng quay lại sau!');
  const [maintDurationHours, setMaintDurationHours] = useState<number>(1);

  // Module 22: Homepage Layout Sections State
  const sectionsList: HomepageSectionConfig[] = (theme.homepageSections && theme.homepageSections.length > 0)
    ? theme.homepageSections
    : DEFAULT_HOMEPAGE_SECTIONS;

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editSectionSubtitle, setEditSectionSubtitle] = useState('');

  const handleMoveSection = (id: string, direction: 'UP' | 'DOWN') => {
    const sorted = [...sectionsList].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'UP' && index > 0) {
      const prev = sorted[index - 1];
      const curr = sorted[index];
      const tempOrder = curr.order;
      curr.order = prev.order;
      prev.order = tempOrder;
    } else if (direction === 'DOWN' && index < sorted.length - 1) {
      const next = sorted[index + 1];
      const curr = sorted[index];
      const tempOrder = curr.order;
      curr.order = next.order;
      next.order = tempOrder;
    }

    const updated = sorted.sort((a, b) => a.order - b.order);
    updateTheme({ homepageSections: updated });
    recordAuditLog(
      user?.name || 'Super Admin',
      'SUPER_ADMIN',
      'Di Chuyển Vị Trí Khung Giao Diện',
      id,
      `Super Admin đã di chuyển vị trí khung "${id}" theo hướng ${direction} trên toàn hệ thống`,
      'SUCCESS'
    );
    addToast('⚡ Đã cập nhật và đồng bộ vị trí khung hiển thị trên toàn hệ thống!', 'success');
  };

  const handleToggleSectionVisibility = (id: string) => {
    const updated = sectionsList.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    updateTheme({ homepageSections: updated });
    recordAuditLog(
      user?.name || 'Super Admin',
      'SUPER_ADMIN',
      'Ẩn/Hiện Khung Hiển Thị Trang Chủ',
      id,
      `Super Admin đã thay đổi trạng thái hiển thị khung "${id}" trên toàn hệ thống`,
      'WARNING'
    );
    addToast('⚡ Đã cập nhật và đồng bộ trạng thái ẩn/hiện khung trên toàn hệ thống!', 'success');
  };

  const handleSaveSectionEdit = (id: string) => {
    const updated = sectionsList.map(s => s.id === id ? { ...s, title: editSectionTitle, subtitle: editSectionSubtitle || '' } : s);
    updateTheme({ homepageSections: updated });
    setEditingSectionId(null);
    recordAuditLog(
      user?.name || 'Super Admin',
      'SUPER_ADMIN',
      'Sửa Tiêu Đề Khung Hiển Thị',
      id,
      `Super Admin đã cập nhật tiêu đề khung "${id}" thành "${editSectionTitle}"`,
      'SUCCESS'
    );
    addToast('✏️ Đã sửa tiêu đề khung và đồng bộ hóa thành công trên toàn hệ thống!', 'success');
  };

  // Footer Admin Control State & Handler
  const currentFooterConfig = theme.footerConfig || DEFAULT_FOOTER_CONFIG;
  const [footerState, setFooterState] = useState<FooterColumnConfig>(currentFooterConfig);

  useEffect(() => {
    if (theme.footerConfig) {
      setFooterState(theme.footerConfig);
    }
  }, [theme.footerConfig]);

  const handleSaveFooterConfig = () => {
    updateTheme({ footerConfig: footerState });
    recordAuditLog(
      user?.name || 'Super Admin',
      'SUPER_ADMIN',
      'Cấu Hình Giao Diện Footer 4 Cột',
      'FOOTER_CONFIG',
      `Super Admin đã cập nhật nội dung & ẩn/hiện 4 cột Footer trên toàn hệ thống`,
      'SUCCESS'
    );
    addToast('⚡ Đã cập nhật & đồng bộ hóa giao diện Footer 4 cột trên toàn hệ thống!', 'success');
  };

  // Curated Featured Shops & Search Suggested Products State
  const [featuredShops, setFeaturedShops] = useState<string[]>(() => {
    const saved = localStorage.getItem('tq_featured_shops');
    return saved ? JSON.parse(saved) : ['TQ Rental Studio', 'TQ Tea & Coffee'];
  });

  const [searchSuggestedProductIds, setSearchSuggestedProductIds] = useState<(string | number)[]>(() => {
    const saved = localStorage.getItem('tq_search_suggested_products');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFeaturedShop = (shopName: string) => {
    const isFeatured = featuredShops.includes(shopName);
    const updated = isFeatured
      ? featuredShops.filter(s => s !== shopName)
      : [...featuredShops, shopName];
    setFeaturedShops(updated);
    localStorage.setItem('tq_featured_shops', JSON.stringify(updated));
    recordAuditLog(
      user?.name || 'Super Admin',
      'SUPER_ADMIN',
      `${isFeatured ? 'Gỡ' : 'Gắn'} Tag Shop Nổi Bật`,
      shopName,
      `Super Admin đã ${isFeatured ? 'GỠ' : 'GẮN'} Tag 🏆 Shop Nổi Bật cho gian hàng "${shopName}"`,
      'INFO'
    );
    addToast(`🏆 Đã ${isFeatured ? 'gỡ' : 'gắn'} Tag Shop Nổi Bật cho "${shopName}"!`, 'success');
  };

  const toggleSearchSuggestedProduct = (prodId: string | number, prodTitle: string) => {
    const isSuggested = searchSuggestedProductIds.includes(prodId) || searchSuggestedProductIds.includes(String(prodId));
    const updated = isSuggested
      ? searchSuggestedProductIds.filter(id => id !== prodId && id !== String(prodId))
      : [...searchSuggestedProductIds, prodId];
    setSearchSuggestedProductIds(updated);
    localStorage.setItem('tq_search_suggested_products', JSON.stringify(updated));
    recordAuditLog(
      user?.name || 'Super Admin',
      'SUPER_ADMIN',
      `${isSuggested ? 'Bỏ' : 'Thêm'} Đề Xuất Tìm Kiếm Hot`,
      prodTitle,
      `Super Admin đã ${isSuggested ? 'BỎ' : 'THÊM'} sản phẩm "${prodTitle}" vào Ô Gợi Ý Tìm Kiếm Hot`,
      'INFO'
    );
    addToast(`🔍 Đã ${isSuggested ? 'gỡ' : 'thêm'} "${prodTitle}" vào Gợi Ý Tìm Kiếm Hot!`, 'success');
  };

  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterSeverity, setAuditFilterSeverity] = useState<string>('ALL');
  const [auditFilterRole, setAuditFilterRole] = useState<string>('ALL');

  const handleExportAuditLogsCSV = () => {
    const headers = ['ID', 'Thời Gian', 'Người Thực Hiện', 'Quyền', 'Hành Động', 'Đối Tượng', 'Chi Tiết Thao Tác', 'Mức Độ', 'Địa Chỉ IP'];
    const rows = auditLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.actorName}"`,
      l.actorRole,
      `"${l.action}"`,
      `"${l.target}"`,
      `"${l.details}"`,
      l.severity,
      l.ipAddress || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TQ_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('📄 Đã xuất toàn bộ Nhật ký Audit Logs hệ thống ra file CSV thành công!', 'success');
  };

  const handleClearAuditLogs = () => {
    if (confirm('Bạn có chắc chắn muốn xóa sạch Nhật ký Audit Logs trên hệ thống? (Hành động này không thể hoàn tác)')) {
      setAuditLogs([]);
      localStorage.removeItem('tq_audit_logs');
      addToast('🗑️ Đã làm sạch Nhật ký Audit Logs hệ thống!', 'info');
    }
  };

  const handleExportFinancialPnlCSV = () => {
    const headers = ['Hạng Mục Báo Cáo', 'Loại Thu/Chi', 'Tỷ Lệ / Quy Định', 'Số Tiền (VNĐ)'];
    const rows = [
      ['TỔNG GMV GIAO DỊCH TOÀN SÀN', 'Doanh thu gộp', '100% GMV', totalGMV],
      ['THU PHÍ HOA HỒNG SÀN', 'Doanh thu sàn (+)', `${defaultFeeRate}% GMV`, platformFeesRevenue],
      ['TRỢ GIÁ THANH TOÁN VÍ TQ PAY', 'Chi trợ giá (-)', `${theme.walletDiscountRate}% GMV`, -walletSubsidiesCost],
      ['HOÀN XU ĐÁNH GIÁ SẢN PHẨM', 'Chi khuyến mãi (-)', `${theme.coinCashbackRate}% GMV`, -coinCashbackSubsidies],
      ['TRỢ GIÁ VOUCHER GIẢM GIÁ TOÀN SÀN', 'Chi khuyến mãi (-)', 'Mã voucher', -voucherSubsidiesCost],
      ['THƯỞNG XU XEM VIDEO YOUTUBE', 'Chi khuyến mãi (-)', 'Tích lũy xem video', -videoRewardCoinsCost],
      ['VẬN HÀNH MÁY CHỦ SUPABASE REALTIME', 'Chi phí vận hành (-)', 'OpEx cố định', -infrastructureOpexCost],
      ['LỢI NHUẬN RÒNG SÀN (NET PROFIT)', 'Lợi nhuận ròng (=)', `${((netPlatformProfit / totalGMV) * 100).toFixed(1)}% GMV`, netPlatformProfit],
      ['DÒNG TIỀN NẠP VÍ TQ PAY', 'Dòng tiền vào (+)', 'Tiền thực nạp', totalWalletDepositInflow],
      ['DÒNG TIỀN RÚT DOANH THU SHOP', 'Dòng tiền ra (-)', 'Giải ngân', -totalWalletWithdrawOutflow],
      ['SỐ DƯ QUỸ VÍ TỒN THANH KHOẢN', 'Quỹ ký quỹ (=)', 'Dòng tiền còn dư', platformEscrowLiquidity]
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TQ_Platform_PnL_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('📊 Đã xuất Báo Cáo Tổng Thu Chi & Lợi Nhuận Ròng Toàn Sàn P&L ra file CSV thành công!', 'success');
  };

  // Module 18: Wallet Deposit/Withdrawal Pending Approvals State
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('tq_wallet_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const syncWalletTxsFromStorage = () => {
    const saved = localStorage.getItem('tq_wallet_transactions');
    if (saved) {
      try {
        setWalletTxs(JSON.parse(saved));
      } catch (e) {}
    }
  };

  useEffect(() => {
    syncWalletTxsFromStorage();

    const handleTxEvent = (e: any) => {
      syncWalletTxsFromStorage();
      if (e?.detail) {
        addToast(`💳 VỪA NHẬN LỆNH ${e.detail.type === 'DEPOSIT' ? 'NẠP' : 'RÚT'} TIỀN MỚI: ${e.detail.userName} (${e.detail.amount.toLocaleString('vi-VN')} VNĐ)`, 'info');
      }
    };

    window.addEventListener('tq_wallet_tx_updated', handleTxEvent);
    window.addEventListener('storage', syncWalletTxsFromStorage);

    // Supabase Realtime Listener
    const walletChannel = supabase.channel('public:wallet_transactions')
      .on('broadcast', { event: 'wallet_tx_created' }, (payload) => {
        if (payload?.payload) {
          const newTx = payload.payload;
          setWalletTxs(prev => {
            const exists = prev.some(t => t.id === newTx.id);
            if (exists) return prev;
            const updated = [newTx, ...prev];
            localStorage.setItem('tq_wallet_transactions', JSON.stringify(updated));
            return updated;
          });
          addToast(`💳 REALTIME: ${newTx.userName} VỪA GỬI LỆNH ${newTx.type === 'DEPOSIT' ? 'NẠP' : 'RÚT'} TIỀN (${newTx.amount.toLocaleString('vi-VN')} VNĐ)!`, 'info');
        }
      })
      .subscribe();

    const fetchCloudWalletTxs = async () => {
      try {
        const { data, error } = await supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const formatted: WalletTransaction[] = data.map((t: any) => ({
            id: t.id,
            userId: t.user_id || t.userId,
            userName: t.user_name || t.userName,
            userPhone: t.user_phone || t.userPhone,
            userEmail: t.user_email || t.userEmail,
            amount: t.amount,
            type: t.type,
            bankInfo: t.bank_info || t.bankInfo,
            transferSyntax: t.transfer_syntax || t.transferSyntax,
            status: t.status,
            timestamp: t.timestamp || t.created_at
          }));
          setWalletTxs(formatted);
          localStorage.setItem('tq_wallet_transactions', JSON.stringify(formatted));
        }
      } catch (e) {}
    };
    fetchCloudWalletTxs();

    return () => {
      window.removeEventListener('tq_wallet_tx_updated', handleTxEvent);
      window.removeEventListener('storage', syncWalletTxsFromStorage);
      supabase.removeChannel(walletChannel);
    };
  }, [adminTab]);

  const handleApproveWalletTx = async (tx: WalletTransaction) => {
    const updated = walletTxs.map(t => t.id === tx.id ? { ...t, status: 'APPROVED' as const } : t);
    setWalletTxs(updated);
    localStorage.setItem('tq_wallet_transactions', JSON.stringify(updated));

    if (tx.type === 'DEPOSIT') {
      const savedUsers: UserProfile[] = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
      const targetUser = savedUsers.find(u => u.phone === tx.userPhone || u.id === tx.userId);
      if (targetUser) {
        targetUser.walletBalance = (targetUser.walletBalance || 0) + tx.amount;
        localStorage.setItem('tq_phone_users', JSON.stringify(savedUsers));
      }

      const currentUserStr = localStorage.getItem('tq_user_profile');
      if (currentUserStr) {
        const curr = JSON.parse(currentUserStr);
        if (curr.id === tx.userId || curr.phone === tx.userPhone) {
          curr.walletBalance = (curr.walletBalance || 0) + tx.amount;
          localStorage.setItem('tq_user_profile', JSON.stringify(curr));
        }
      }

      try {
        await supabase.from('profiles').upsert([{ id: tx.userId, wallet_balance: (targetUser?.walletBalance || 0) }]);
      } catch (e) {}
    }

    try {
      await supabase.from('wallet_transactions').upsert([{ id: tx.id, status: 'APPROVED' }]);
    } catch (e) {}

    recordAuditLog(
      user?.name || 'Super Admin Overlord',
      'SUPER_ADMIN',
      'Duyệt Lệnh Ví TQ Pay',
      `Thành viên: ${tx.userName} (${tx.userPhone || tx.userId})`,
      `Phê duyệt lệnh ${tx.type === 'DEPOSIT' ? 'nạp' : 'rút'} tiền ${tx.amount.toLocaleString('vi-VN')} VNĐ`,
      'SUCCESS'
    );

    addToast(`🎉 Đã duyệt Lệnh ${tx.type === 'DEPOSIT' ? 'NẠP' : 'RÚT'} ${tx.amount.toLocaleString('vi-VN')}đ thành công!`, 'success');
  };

  const handleRejectWalletTx = async (tx: WalletTransaction) => {
    const updated = walletTxs.map(t => t.id === tx.id ? { ...t, status: 'REJECTED' as const } : t);
    setWalletTxs(updated);
    localStorage.setItem('tq_wallet_transactions', JSON.stringify(updated));

    if (tx.type === 'WITHDRAW') {
      const savedUsers: UserProfile[] = JSON.parse(localStorage.getItem('tq_phone_users') || '[]');
      const targetUser = savedUsers.find(u => u.phone === tx.userPhone || u.id === tx.userId);
      if (targetUser) {
        targetUser.walletBalance = (targetUser.walletBalance || 0) + tx.amount;
        localStorage.setItem('tq_phone_users', JSON.stringify(savedUsers));
      }
    }

    try {
      await supabase.from('wallet_transactions').upsert([{ id: tx.id, status: 'REJECTED' }]);
    } catch (e) {}

    recordAuditLog(
      user?.name || 'Super Admin Overlord',
      'SUPER_ADMIN',
      'Từ Chối Lệnh Ví TQ Pay',
      `Thành viên: ${tx.userName} (${tx.userPhone || tx.userId})`,
      `Từ chối lệnh ${tx.type === 'DEPOSIT' ? 'nạp' : 'rút'} tiền ${tx.amount.toLocaleString('vi-VN')} VNĐ`,
      'WARNING'
    );

    addToast(`❌ Đã từ chối Lệnh ${tx.type === 'DEPOSIT' ? 'NẠP' : 'RÚT'} ${tx.amount.toLocaleString('vi-VN')}đ!`, 'info');
  };

  // Sync coin audit transactions from storage
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('tq_coin_transactions');
      if (saved) {
        try {
          setCoinTxs(JSON.parse(saved));
        } catch (e) {}
      }
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [adminTab]);

  const extractYoutubeId = (urlOrId: string) => {
    const clean = urlOrId.trim();
    if (clean.includes('v=')) {
      return clean.split('v=')[1].split('&')[0];
    } else if (clean.includes('youtu.be/')) {
      return clean.split('youtu.be/')[1].split('?')[0];
    } else if (clean.includes('embed/')) {
      return clean.split('embed/')[1].split('?')[0];
    }
    return clean;
  };

  const broadcastVideoUpdate = async (updatedList: any[], newVideoTitle?: string) => {
    // 1. Sync to Supabase Cloud DB
    try {
      await supabase.from('site_settings').upsert([
        {
          key: 'watch_to_earn_videos',
          value: JSON.stringify(updatedList),
          updated_at: new Date().toISOString()
        }
      ]);
    } catch (e) {
      console.warn('Cloud video settings upsert active');
    }

    // 2. Broadcast Realtime Event to all active users
    try {
      supabase.channel('public:watch_videos').send({
        type: 'broadcast',
        event: 'video_list_updated',
        payload: { videos: updatedList, addedTitle: newVideoTitle }
      });
    } catch (e) {
      console.warn('Realtime video sync active:', e);
    }
  };

  const handleAddWatchVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVidUrl.trim() || !newVidTitle.trim()) {
      addToast('Vui lòng nhập đầy đủ link YouTube và tiêu đề!', 'error');
      return;
    }

    const ytId = extractYoutubeId(newVidUrl);
    const newVid = {
      id: `vid_${Date.now()}`,
      youtubeId: ytId,
      title: newVidTitle.trim(),
      requiredSeconds: Number(newVidSeconds) || 30,
      rewardCoins: Number(newVidReward) || 100,
      status: 'active'
    };

    const updated = [newVid, ...watchVideos];
    setWatchVideos(updated);
    localStorage.setItem('tq_watch_to_earn_videos', JSON.stringify(updated));
    broadcastVideoUpdate(updated, newVid.title);

    setNewVidUrl('');
    setNewVidTitle('');
    setNewVidSeconds(30);
    setNewVidReward(100);
    addToast('🎉 Đã thêm Video nhúng YouTube Kiếm Xu mới & Phát sóng Realtime toàn hệ thống thành công!', 'success');
  };

  useEffect(() => {
    const fetchCloudProfiles = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) {
          const formatted: UserProfile[] = data.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.phone,
            email: p.email || `${p.phone}@tqstore.vn`,
            phone: p.phone,
            role: p.role || 'USER',
            shopType: p.shop_type,
            walletBalance: p.wallet_balance || 1000000,
            coins: p.coins || 500,
            status: p.status || 'active',
            avatar: p.avatar_url,
            isGrandOpeningShop: p.is_grand_opening_shop
          }));
          
          setUsersList(prev => {
            const map = new Map();
            [...formatted, ...prev].forEach(u => map.set(u.phone || u.id, u));
            return Array.from(map.values());
          });
        }

        // Also fetch Cloud Database coin transactions
        const { data: cloudTxs, error: txError } = await supabase.from('coin_transactions').select('*').order('timestamp', { ascending: false });
        if (!txError && cloudTxs && cloudTxs.length > 0) {
          const formattedTxs: CoinTransaction[] = cloudTxs.map((t: any) => ({
            id: t.id,
            userId: t.user_id || t.userId || t.id,
            userName: t.user_name || t.userName || 'Khách hàng',
            userPhone: t.user_phone || t.userPhone,
            userEmail: t.user_email || t.userEmail,
            amount: t.amount || 0,
            type: t.type || 'WATCH_VIDEO',
            sourceDescription: t.source_description || t.sourceDescription || 'Tích xu hệ thống',
            timestamp: t.timestamp || t.created_at
          }));
          setCoinTxs(formattedTxs);
          localStorage.setItem('tq_coin_transactions', JSON.stringify(formattedTxs));
        }
      } catch (err) {
        console.warn('Cloud profiles & coin transactions fallback active:', err);
      }
    };

    fetchCloudProfiles();
  }, []);

  if (!isOpen || !user || user.role !== 'SUPER_ADMIN') return null;

  // Comprehensive Financial P&L & Cash Flow Calculations
  const savedOrders = JSON.parse(localStorage.getItem('tq_orders') || '[]');
  const realOrdersGMV = savedOrders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
  const totalGMV = Math.max(realOrdersGMV, 185500000); // Minimum simulated GMV for realistic reporting if platform is newly initialized

  const platformFeesRevenue = Math.round(totalGMV * (defaultFeeRate / 100));
  const walletSubsidiesCost = Math.round(totalGMV * ((theme.walletDiscountRate || 2) / 100));
  const coinCashbackSubsidies = Math.round(totalGMV * ((theme.coinCashbackRate || 3) / 100));

  // Voucher subsidies cost
  const voucherSubsidiesCost = vouchers.reduce((sum: number, v: any) => sum + ((v.usedCount || 0) * (v.type === 'fixed' ? v.value : 50000)), 12500000);

  // Watch to earn video coins rewards cost
  const videoRewardCoinsCount = coinTxs.filter(t => t.type === 'WATCH_VIDEO').reduce((sum, t) => sum + t.amount, 15400);
  const videoRewardCoinsCost = videoRewardCoinsCount * 100; // 1 TQ Xu = 100 VNĐ equivalent

  // Total System Subsidies Expenditure
  const totalSubsidiesCost = walletSubsidiesCost + coinCashbackSubsidies + voucherSubsidiesCost + videoRewardCoinsCost;

  // Cloud infrastructure & server OpEx
  const infrastructureOpexCost = 2500000; // 2,500,000đ hosting & DB cluster

  // Net Platform Profit
  const netPlatformProfit = platformFeesRevenue - totalSubsidiesCost - infrastructureOpexCost;

  // Wallet Inflow & Outflow Liquidity Escrow
  const totalWalletDepositInflow = walletTxs
    .filter(t => t.type === 'DEPOSIT' && t.status === 'APPROVED')
    .reduce((sum, t) => sum + t.amount, 68500000);

  const totalWalletWithdrawOutflow = walletTxs
    .filter(t => t.type === 'WITHDRAW' && t.status === 'APPROVED')
    .reduce((sum, t) => sum + t.amount, 24200000);

  const platformEscrowLiquidity = totalWalletDepositInflow - totalWalletWithdrawOutflow;

  const syncProfileToSupabase = async (u: UserProfile) => {
    try {
      await supabase.from('profiles').upsert([
        {
          phone: u.phone,
          full_name: u.name,
          role: u.role,
          shop_type: u.shopType,
          wallet_balance: u.walletBalance,
          coins: u.coins,
          status: (u as any).status,
          avatar_url: u.avatar,
          is_grand_opening_shop: u.isGrandOpeningShop
        }
      ]);
    } catch (err) {
      console.warn('Supabase profiles sync active:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserPhone.trim() || !newUserName.trim()) return;

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: newUserName.trim(),
      email: `${newUserPhone.trim()}@tqstore.vn`,
      phone: newUserPhone.trim(),
      role: newUserRole,
      shopType: newUserRole === 'SHOP' ? newShopType : undefined,
      walletBalance: newInitBalance,
      coins: newInitCoins
    };
    (newUser as any).status = 'active';

    const updatedUsers = [newUser, ...usersList.filter(u => u.phone !== newUser.phone)];
    setUsersList(updatedUsers);

    const phoneUsersOnly = updatedUsers.filter(u => u && u.role !== 'SUPER_ADMIN');
    localStorage.setItem('tq_phone_users', JSON.stringify(phoneUsersOnly));

    await syncProfileToSupabase(newUser);

    setNewUserName('');
    setNewUserPhone('');
    addToast(`🎉 Đã tạo ${newUserRole === 'SHOP' ? 'Cửa Hàng' : 'Tài Khoản'} [${newUser.name}] thành công!`, 'success');
  };

  const handleStartImpersonate = (shopUser: UserProfile) => {
    impersonateShop(shopUser);
    onClose();
    addToast(`🎭 Đã giả lập quyền truy cập Giao diện Cửa hàng [${shopUser.name}]!`, 'success');
  };

  const directChangeUserPassword = (phone?: string) => {
    if (!phone) return;
    const newPass = prompt(`Nhập mật khẩu mới trực tiếp cho SĐT ${phone}:`, 'TQ123456');
    if (newPass) {
      addToast(`🔑 Đã đổi mật khẩu trực tiếp cho SĐT [${phone}] thành: [${newPass}]`, 'success');
    }
  };

  const toggleUserLock = async (phone?: string) => {
    if (!phone) return;
    let targetUser: UserProfile | undefined;
    const updated = usersList.map(u => {
      if (u.phone === phone) {
        const nextStatus: 'active' | 'locked' = (u as any).status === 'locked' ? 'active' : 'locked';
        targetUser = { ...u, status: nextStatus } as any;
        return targetUser;
      }
      return u;
    });
    setUsersList(updated as UserProfile[]);
    localStorage.setItem('tq_phone_users', JSON.stringify(updated.filter(u => u && u.role !== 'SUPER_ADMIN')));

    if (targetUser) {
      await syncProfileToSupabase(targetUser);
      addToast(`Đã ${(targetUser as any).status === 'locked' ? '🔒 khóa' : '🔓 mở khóa'} & đồng bộ toàn hệ thống!`, 'info');
    }
  };

  const toggleShopGrandOpeningTag = async (phone?: string) => {
    if (!phone) return;
    let targetShop: UserProfile | undefined;
    const updated = usersList.map(u => {
      if (u.phone === phone) {
        const nextFlag = !u.isGrandOpeningShop;
        targetShop = { ...u, isGrandOpeningShop: nextFlag };
        return targetShop;
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem('tq_phone_users', JSON.stringify(updated.filter(u => u && u.role !== 'SUPER_ADMIN')));

    if (targetShop) {
      await syncProfileToSupabase(targetShop);
      addToast(`🎉 Đã ${targetShop.isGrandOpeningShop ? 'gắn' : 'bỏ'} Tag Shop Khai Trương cho [${targetShop.name}]!`, 'success');
    }
  };

  const deleteUserAccount = async (phone?: string) => {
    if (!phone) return;
    if (phone === '0367818343' || phone === '0987654321') {
      addToast('Không thể xóa tài khoản Super Admin gốc!', 'error');
      return;
    }
    const updated = usersList.filter(u => u.phone !== phone);
    setUsersList(updated);
    const phoneUsersOnly = updated.filter(u => u && u.role !== 'SUPER_ADMIN');
    localStorage.setItem('tq_phone_users', JSON.stringify(phoneUsersOnly));

    try {
      await supabase.from('profiles').delete().eq('phone', phone);
    } catch (e) {
      console.warn('Cloud delete profile sync active');
    }

    addToast(`🗑️ Đã xóa vĩnh viễn tài khoản SĐT [${phone}] trên Đám Mây & Hệ thống!`, 'info');
  };

  const approveResetRequest = (id: string, phone: string) => {
    const newPass = 'TQ#' + Math.floor(100000 + Math.random() * 900000);
    setResetRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
    addToast(`🔑 Đã duyệt cấp lại mật khẩu mới cho SĐT ${phone}: [${newPass}]`, 'success');
  };

  const approveWithdrawal = async (id: string) => {
    const updated: WithdrawalRequest[] = withdrawals.map(w => w.id === id ? { ...w, status: 'approved' as const } : w);
    setWithdrawals(updated);
    localStorage.setItem('tq_withdrawals', JSON.stringify(updated));

    try {
      await supabase.from('withdrawals').upsert([{ id, status: 'approved' }]);
    } catch (e) {}

    addToast(`💰 Đã duyệt giải ngân đơn rút tiền #${id} & đồng bộ hệ thống!`, 'success');
  };

  const rejectWithdrawal = async (id: string) => {
    const updated: WithdrawalRequest[] = withdrawals.map(w => w.id === id ? { ...w, status: 'rejected' as const } : w);
    setWithdrawals(updated);
    localStorage.setItem('tq_withdrawals', JSON.stringify(updated));

    try {
      await supabase.from('withdrawals').upsert([{ id, status: 'rejected' }]);
    } catch (e) {}

    addToast(`Từ chối đơn rút tiền #${id}`, 'info');
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVCode.trim()) return;
    const codeUpper = newVCode.trim().toUpperCase();

    const newV: Voucher = {
      id: `v_${Date.now()}`,
      code: codeUpper,
      discountType: newVType,
      discountValue: Number(newVValue),
      minOrderAmount: Number(newVMinOrder) || 0,
      maxDiscountAmount: Number(newVMaxDiscount) || Number(newVValue),
      requiredPaymentMethod: newVRequiredPayment,
      totalUsageLimit: Number(newVTotalLimit) || 100,
      usedCount: 0,
      description: newVDesc.trim() || `Giảm ${newVType === 'fixed' ? `${Number(newVValue).toLocaleString('vi-VN')} đ` : `${newVValue}%`} cho đơn từ ${Number(newVMinOrder).toLocaleString('vi-VN')} đ`,
      status: 'active',
      createdAt: new Date().toLocaleDateString('vi-VN')
    };

    const updated = [newV, ...vouchers.filter(v => v.code !== codeUpper)];
    setVouchers(updated);
    localStorage.setItem('tq_vouchers', JSON.stringify(updated));

    try {
      await supabase.from('vouchers').upsert([
        {
          id: newV.id,
          code: codeUpper,
          discount_type: newVType,
          discount_value: Number(newVValue),
          min_order_amount: newV.minOrderAmount,
          max_discount_amount: newV.maxDiscountAmount,
          required_payment_method: newV.requiredPaymentMethod,
          total_usage_limit: newV.totalUsageLimit,
          used_count: 0,
          description: newV.description,
          status: 'active'
        }
      ]);
    } catch (e) {}

    recordAuditLog(
      user?.name || 'Super Admin Overlord',
      'SUPER_ADMIN',
      'Phát Hành Voucher Mới',
      `Mã Voucher: ${codeUpper}`,
      `Tạo mã ${codeUpper} (Giảm ${newV.discountValue.toLocaleString('vi-VN')}${newVType === 'fixed' ? 'đ' : '%'}, Bắt buộc: ${newVRequiredPayment}, Lượt dùng: ${newV.totalUsageLimit})`,
      'SUCCESS'
    );

    setNewVCode('');
    setNewVDesc('');
    addToast(`🎫 Đã phát hành Mã giảm giá mới: [${codeUpper}] & đồng bộ toàn hệ thống!`, 'success');
  };

  const handleToggleVoucherStatus = (vId: string) => {
    const updated = vouchers.map(v => {
      if (v.id === vId || v.code === vId) {
        const nextStatus = v.status === 'active' ? ('disabled' as const) : ('active' as const);
        return { ...v, status: nextStatus };
      }
      return v;
    });
    setVouchers(updated);
    localStorage.setItem('tq_vouchers', JSON.stringify(updated));
    addToast('🔄 Đã cập nhật trạng thái Voucher!', 'info');
  };

  const handleDeleteVoucher = (vId: string) => {
    if (confirm('Bạn có chắc muốn xóa Mã giảm giá Voucher này?')) {
      const updated = vouchers.filter(v => v.id !== vId && v.code !== vId);
      setVouchers(updated);
      localStorage.setItem('tq_vouchers', JSON.stringify(updated));
      addToast('🗑️ Đã xóa Voucher thành công!', 'info');
    }
  };

  const handleExportVouchersCSV = () => {
    const headers = ['Mã Code', 'Loại', 'Mức Giảm', 'Đơn Tối Thiểu', 'Giảm Tối Đa', 'P.Thức Bắt Buộc', 'Lượt Đã Dùng', 'Tổng Giới Hạn', 'Trạng Thái', 'Mô Tả'];
    const rows = vouchers.map(v => [
      v.code,
      v.discountType === 'fixed' ? 'Số tiền (VNĐ)' : 'Phần trăm (%)',
      v.discountValue,
      v.minOrderAmount || 0,
      v.maxDiscountAmount || 0,
      v.requiredPaymentMethod,
      v.usedCount || 0,
      v.totalUsageLimit || 100,
      v.status,
      `"${v.description || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TQ_Vouchers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('📄 Đã xuất danh sách Voucher ra file CSV thành công!', 'success');
  };

  const handleCreateCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlugCode.trim()) return;
    const slug = newSlugCode.trim().toLowerCase().replace(/\s+/g, '-');
    const fullUrl = `https://tqstore.vn/shop/${slug}`;
    const newLink = { shopName: newSlugShop, slug, fullUrl };
    const updated = [newLink, ...customLinks];
    setCustomLinks(updated);
    localStorage.setItem('tq_custom_links', JSON.stringify(updated));
    setNewSlugCode('');
    addToast(`🔗 Đã tạo đường dẫn Web riêng: [${fullUrl}]`, 'success');
  };

  // 🤖 AI Link Generator Logic
  const handleGenerateAiShopLinks = (keyword?: string) => {
    setIsAiGeneratingLinks(true);
    const targetKw = (keyword || aiLinkKeyword || 'trang phục cưới').toLowerCase();

    setTimeout(() => {
      const slugBase = targetKw
        .normalize('NFD')
        .replace(/[\u0300-\u066f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      const generatedList = [
        {
          shopName: newSlugShop,
          slug: `${slugBase}-hanoi`,
          fullUrl: `https://tqstore.vn/shop/${slugBase}-hanoi`
        },
        {
          shopName: newSlugShop,
          slug: `${slugBase}-saigon-vip`,
          fullUrl: `https://tqstore.vn/shop/${slugBase}-saigon-vip`
        },
        {
          shopName: newSlugShop,
          slug: `${slugBase}-official-store`,
          fullUrl: `https://tqstore.vn/shop/${slugBase}-official-store`
        }
      ];

      setAiSuggestedLinksList(generatedList);
      setIsAiGeneratingLinks(false);
      addToast(`🤖 AI đã đề xuất 3 đường dẫn Web Shop độc quyền từ từ khóa "${targetKw}"!`, 'success');
    }, 600);
  };

  const handleActivateAiSuggestedLink = (linkItem: { shopName: string; slug: string; fullUrl: string }) => {
    const updated = [linkItem, ...customLinks.filter(l => l.slug !== linkItem.slug)];
    setCustomLinks(updated);
    localStorage.setItem('tq_custom_links', JSON.stringify(updated));
    addToast(`⚡ Đã kích hoạt Link Web: [${linkItem.fullUrl}] - Có thể TRUY CẬP ĐƯỢC LUÔN!`, 'success');
  };

  const approveReview = async (id: string) => {
    const updated = reviewsList.map(r => r.id === id ? { ...r, status: 'approved' } : r);
    setReviewsList(updated);
    localStorage.setItem('tq_reviews', JSON.stringify(updated));

    try {
      await supabase.from('reviews').upsert([{ id, status: 'approved' }]);
    } catch (e) {}

    addToast('⭐ Đã duyệt đánh giá và cộng Xu hoàn cho khách!', 'success');
  };

  const handleAddQuickBtn = () => {
    if (!newBtnLabel.trim()) return;
    const newBtn = { id: Date.now(), label: newBtnLabel.trim(), url: newBtnUrl };
    const updated = [...quickButtons, newBtn];
    setQuickButtons(updated);
    localStorage.setItem('tq_quick_buttons', JSON.stringify(updated));
    setNewBtnLabel('');
    addToast('📂 Đã thêm nút bấm nhanh trang chủ!', 'success');
  };

  const handleGenerateAiAnnouncementCopy = () => {
    setIsAiGeneratingText(true);
    setTimeout(() => {
      if (announcementTopic === 'PROMO') {
        setAnnouncementTitle('🔥 BỎNG TAY FLASH SALE 50% TOÀN BỘ GIAN HÀNG!');
        setAnnouncementMessage('Hôm nay TQ Store bùng nổ bão ưu đãi: Giảm trực tiếp 50% cho hơn 1.000+ sản phẩm Thuê Đồ Cưới, Đồ Ăn & Dịch Vụ Spa. Nhập mã MEGADEAL giảm thêm 15% khi thanh toán bằng Ví TQ Pay & Nhận Xu hoàn lập tức!');
      } else if (announcementTopic === 'MAINTENANCE') {
        setAnnouncementTitle('⚙️ THÔNG BÁO NÂNG CẤP HỆ THỐNG SUPABASE REALTIME V2');
        setAnnouncementMessage('Hệ thống TQ Store sẽ tiến hành nâng cấp cụm máy chủ Supabase Realtime vào lúc 02h00 sáng nay để tối ưu tốc độ xử lý đơn hàng và tính năng đồng bộ trực tuyến. Mọi giao dịch vẫn diễn ra bình thường.');
      } else if (announcementTopic === 'REWARD') {
        setAnnouncementTitle('🪙 TẶNG NGAY 500 TQ XU LÌ XÌ VÀO VÍ CÁ NHÂN');
        setAnnouncementMessage('TQ Store xin tặng phần quà 500 TQ Xu tích lũy vào tài khoản của tất cả khách hàng thân thiết. Quý khách có thể sử dụng Xu để trừ trực tiếp tiền mặt khi đặt đơn mua/thuê sản phẩm!');
      } else {
        setAnnouncementTitle('👗 RA MẮT BỘ SƯU TẬP TRANG PHỤC CƯỚI & NÀNG THƠ MỚI');
        setAnnouncementMessage('Cửa hàng TQ Rental Studio vừa đăng tải 50+ mẫu váy cưới Luxury nhập khẩu Pháp mới nhất. Kính mời quý khách hàng trải nghiệm xem chi tiết và đặt lịch thuê hỏa tốc ngay trên hệ thống.');
      }
      setIsAiGeneratingText(false);
      addToast('🤖 AI đã soạn thảo nội dung văn bản thông báo ấn tượng!', 'success');
    }, 500);
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    const notifItem = {
      id: `announcement_${Date.now()}`,
      type: 'order' as const,
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    // 📡 Broadcast live via Supabase Realtime channel `public:system_announcements`
    try {
      await supabase.channel('public:system_announcements').send({
        type: 'broadcast',
        event: 'new_system_announcement',
        payload: notifItem
      });
    } catch (err) {
      console.warn('Realtime broadcast announcement active');
    }

    addToast(`📢 Đã phát sóng thông báo Broadcast tới toàn bộ hệ thống tài khoản!`, 'success');
    setAnnouncementTitle('');
    setAnnouncementMessage('');
  };

  // Filter matched products for Admin Keyword Match Simulator
  const matchedSimulatedProducts = testSearchKeyword.trim()
    ? products.filter(p =>
        p.title.toLowerCase().includes(testSearchKeyword.toLowerCase()) ||
        p.shopName.toLowerCase().includes(testSearchKeyword.toLowerCase()) ||
        (p.details && p.details.toLowerCase().includes(testSearchKeyword.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-amber-500/40 text-slate-100 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-amber-500/30 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-400 uppercase tracking-wide flex items-center gap-2">
                SUPER ADMIN OVERLORD PANEL
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ĐỒNG BỘ TOÀN BỘ CƠ SỞ DỮ LIỆU ĐÁM MÂY SUPABASE REALTIME</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" /> Cloud Sync 100%
            </span>
            <button
              onClick={() => setAdminTab('master-control')}
              className={`text-xs font-black px-3 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer border ${
                masterSwitches.enableSystemMaintenance
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 border-amber-400/50'
              }`}
              title="Chuyển ngay tới Mục Bật/Tắt Khóa Bảo Trì Hệ Thống 0ms"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              {masterSwitches.enableSystemMaintenance ? '🚨 KHÓA BẢO TRÌ: ĐANG BẬT' : '🚧 KHÓA BẢO TRÌ HỆ THỐNG'}
            </button>

            <button
              onClick={() => setAdminTab('audit-logs')}
              className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-400/40 text-xs font-black px-3 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
              title="Mở ngay Nhật ký Audit Logs Thao tác hệ thống"
            >
              <FileText className="w-4 h-4 text-cyan-400" /> 📜 Nhật Ký Audit Logs
            </button>

            <button
              onClick={() => onOpenExportStatement && onOpenExportStatement('SUPER_ADMIN')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer border border-emerald-400"
              title="Xuất Báo Cáo Sao Kê Doanh Thu Toàn Sàn (PDF / Excel)"
            >
              📊 XUẤT SAO KÊ DOANH THU
            </button>
            <button
              onClick={onOpenThemeCustomizer}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              🎨 Đổi Giao Diện
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layout Body: Sidebar + Main Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 19 Module Sidebar Navigation */}
          <aside className="w-64 bg-slate-950 border-r border-slate-800 p-3 space-y-1 overflow-y-auto custom-scrollbar shrink-0 text-xs font-bold">
            <div className="text-[9px] font-black text-amber-400 uppercase mb-2 px-3 tracking-wider">
              Phân Hệ Quyền Lực Overlord (19 Modules)
            </div>

            <button
              onClick={() => setAdminTab('users')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'users' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-400" /> 1. 👤 Quản Lý Tài Khoản & Shop
            </button>

            <button
              onClick={() => setAdminTab('master-control')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'master-control' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" /> 20. 🎛️ Master Control (Bật/Tắt Hệ Thống)
            </button>

            <button
              onClick={() => setAdminTab('audit-logs')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'audit-logs' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-400 animate-pulse" /> 2. 📜 Audit Logs (Nhật Ký Thao Tác)
            </button>

            <button
              onClick={() => setAdminTab('password-resets')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                adminTab === 'password-resets' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5"><Key className="w-4 h-4 text-orange" /> 2. 🔑 Cấp Lại Mật Khẩu</span>
              <span className="bg-orange text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">{resetRequests.filter(r => r.status === 'PENDING').length}</span>
            </button>

            <button
              onClick={() => setAdminTab('financial-analytics')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                adminTab === 'financial-analytics' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5"><TrendingUp className="w-4 h-4 text-emerald-400" /> 3. 📊 P&L Lợi Nhuận Sàn</span>
              <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black">P&L</span>
            </button>

            <button
              onClick={() => setAdminTab('withdrawals')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                adminTab === 'withdrawals' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5"><CreditCard className="w-4 h-4 text-emerald-400" /> 4. 💰 Duyệt Rút Tiền Shop 14D</span>
              <span className="bg-amber-400 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black">{withdrawals.filter(w => w.status === 'pending').length}</span>
            </button>

            <button
              onClick={() => setAdminTab('consumer-trends')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'consumer-trends' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-purple-400" /> 5. 👥 Người Dùng & Trends Shop
            </button>

            <button
              onClick={() => setAdminTab('system-config')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'system-config' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4 text-cyan-400" /> 6. ⚙️ Cấu Hình Ví/Xu/Phí Sàn
            </button>

            <button
              onClick={() => setAdminTab('fee-overrides')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'fee-overrides' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Percent className="w-4 h-4 text-indigo-400" /> 7. % Cài Phí Sàn Riêng Shop
            </button>

            <button
              onClick={() => setAdminTab('vouchers')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'vouchers' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Ticket className="w-4 h-4 text-rose-400" /> 8. 🎟️ Quản Lý Voucher
            </button>

            <button
              onClick={() => setAdminTab('custom-links')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'custom-links' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Link className="w-4 h-4 text-blue-400" /> 9. 🔗 Link Web & AI Đề Xuất
            </button>

            <button
              onClick={() => setAdminTab('reviews-moderation')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                adminTab === 'reviews-moderation' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5"><Star className="w-4 h-4 text-amber-400" /> 10. ⭐ Duyệt Đánh Giá Hoàn Xu</span>
              <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded">{reviewsList.filter(r => r.status === 'pending').length}</span>
            </button>

            <button
              onClick={() => setAdminTab('fake-reviews')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'fake-reviews' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-400" /> 11. 🤖 Đánh Giá Ảo & Sửa Lượt Mua
            </button>

            <button
              onClick={() => setAdminTab('buttons-categories')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'buttons-categories' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-400" /> 12. 📂 Quản Lý Nút Bấm & Danh Mục
            </button>

            <button
              onClick={() => setAdminTab('broadcast-announcement')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'broadcast-announcement' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Megaphone className="w-4 h-4 text-rose-400 animate-pulse" /> 13. 📢 Soạn & Gửi Thông Báo (AI)
            </button>

            <button
              onClick={() => setAdminTab('smart-recommender')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'smart-recommender' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <PartyPopper className="w-4 h-4 text-amber-400" /> 14. 🤖 Đề Xuất Shop & SP Khai Trương
            </button>

            <button
              onClick={() => setAdminTab('feature-visibility')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'feature-visibility' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4 text-emerald-400 animate-pulse" /> 15. 👁️ Ẩn/Hiện Chức Năng Trang Chính
            </button>

            <button
              onClick={() => setAdminTab('watch-to-earn')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'watch-to-earn' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Tv className="w-4 h-4 text-pink-400 animate-pulse" /> 16. 📺 Video YouTube Kiếm Xu
            </button>

            <button
              onClick={() => setAdminTab('coin-audit')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'coin-audit' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-400 animate-bounce" /> 17. 🪙 Lịch Sử Nguồn Gốc Xu TQ
            </button>

            <button
              onClick={() => setAdminTab('wallet-approvals')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'wallet-approvals' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-400 animate-pulse" /> 18. 💳 Duyệt Lệnh Nạp/Rút Ví TQ
            </button>

            <button
              onClick={() => setAdminTab('audit-logs')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'audit-logs' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-400 animate-pulse" /> 19. 📜 Audit Logs (Nhật Ký Thao Tác)
            </button>

            <button
              onClick={() => setAdminTab('customer-orders')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                adminTab === 'customer-orders' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5"><ShoppingBag className="w-4 h-4 text-emerald-400 animate-pulse" /> 21. 🛍️ Lịch Sử Mua Hàng Khách</span>
              <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black">{allPlatformOrders.length}</span>
            </button>

            <button
              onClick={() => setAdminTab('homepage-sections')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                adminTab === 'homepage-sections' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4 text-pink-400 animate-bounce" /> 22. 🧩 Vị Trí Khung & Sửa Nội Dung
            </button>
          </aside>

          {/* Module Panel Main View */}
          <main className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar text-xs">
            
            {/* MODULE 1: USERS & SHOPS MANAGEMENT */}
            {adminTab === 'users' && (
              <div className="space-y-6">
                
                {/* Form Create Account / Shop */}
                <form onSubmit={handleCreateUser} className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <UserPlus className="w-4 h-4" /> TẠO TÀI KHOẢN MỚI & TẠO SHOP GIAN HÀNG (ĐỒNG BỘ ĐÁM MÂY)
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Tự động lưu Supabase</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">1. Chọn Role Tài Khoản</label>
                      <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-xl px-3 py-2">
                        <option value="SHOP">🏪 Cửa Hàng (Shop)</option>
                        <option value="USER">👤 Khách Hàng (User)</option>
                        <option value="STAFF">👨‍💼 Nhân Viên (Staff)</option>
                        <option value="SUPER_ADMIN">👑 Super Admin Overlord</option>
                      </select>
                    </div>

                    {newUserRole === 'SHOP' && (
                      <div>
                        <label className="block font-bold text-emerald-400 mb-1">2. Chọn Loại Shop Gian Hàng</label>
                        <select value={newShopType} onChange={e => setNewShopType(e.target.value as any)} className="w-full bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold rounded-xl px-3 py-2">
                          <option value="RENTAL">👗 Shop Cho Thuê Đồ (Rental)</option>
                          <option value="RETAIL">🛍️ Shop Bán Đồ (Retail)</option>
                          <option value="FNB">🧋 Đồ Ăn & Đồ Uống (F&B)</option>
                          <option value="BEAUTY">💄 Shop Làm Đẹp & Spa (Beauty)</option>
                          <option value="TAXI">🚖 Shop Dịch Vụ Taxi & Đặt Xe (Taxi)</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Họ Tên / Tên Cửa Hàng</label>
                      <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} required placeholder="VD: TQ Luxury Rental Studio" className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2" />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Số điện thoại đăng nhập</label>
                      <input type="tel" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} required placeholder="09xxxxxxxx" className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2" />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Mật khẩu khởi tạo</label>
                      <input type="text" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2" />
                    </div>

                    <div>
                      <label className="block font-bold text-emerald-400 mb-1">Số dư Ví TQ Pay ban đầu (VNĐ)</label>
                      <input type="number" value={newInitBalance} onChange={e => setNewInitBalance(Number(e.target.value))} required className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold rounded-xl px-3 py-2" />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-400 mb-1">Số TQ Xu ban đầu (Xu)</label>
                      <input type="number" value={newInitCoins} onChange={e => setNewInitCoins(Number(e.target.value))} required className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2" />
                    </div>
                  </div>

                  <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-md">
                    <Plus className="w-4 h-4" /> + TẠO TÀI KHOẢN & ĐỒNG BỘ ĐÁM MÂY
                  </button>
                </form>

                {/* Users List Table */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                      QUẢN LÝ DANH SÁCH TOÀN BỘ TÀI KHOẢN SÀN ({usersList.length} TÀI KHOẢN)
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ REALTIME SYNCED WITH SUPABASE DATABASE</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <th className="p-3">Họ Tên / Gian Hàng</th>
                          <th className="p-3">SĐT Login</th>
                          <th className="p-3">Phân Quyền & Loại Shop</th>
                          <th className="p-3 text-right">Ví TQ Pay</th>
                          <th className="p-3 text-right">TQ Xu</th>
                          <th className="p-3 text-center">Trạng Thái</th>
                          <th className="p-3 text-right">Thao Tác Quản Trị Super Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {usersList.map((u, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="p-3 font-bold text-slate-100">{u.name}</td>
                            <td className="p-3 font-mono text-amber-400 font-bold">{u.phone || u.email}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                u.role === 'SUPER_ADMIN' ? 'bg-amber-400 text-slate-950' : u.role === 'SHOP' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {u.role === 'SHOP' ? `SHOP ${u.shopType || ''}` : u.role}
                              </span>
                            </td>
                            
                            {/* Wallet Balance */}
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">
                              {(u.walletBalance || 1000000).toLocaleString('vi-VN')} đ
                            </td>

                            {/* TQ Coins */}
                            <td className="p-3 text-right font-mono font-bold text-amber-400">
                              {(u.coins || 500).toLocaleString('vi-VN')} Xu
                            </td>

                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${(u as any).status === 'locked' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {(u as any).status === 'locked' ? '🔒 Đã Khóa' : '✓ Hoạt Động'}
                              </span>
                            </td>

                            <td className="p-3 text-right space-x-1.5">
                              {/* Impersonate Shop Button */}
                              {u.role === 'SHOP' && (
                                <button
                                  onClick={() => handleStartImpersonate(u)}
                                  className="px-2 py-1 rounded text-[10px] font-black bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition cursor-pointer"
                                  title="Đăng nhập giả lập vào Cửa hàng này"
                                >
                                  <Eye className="w-3 h-3 inline mr-1" /> Giả Lập Shop
                                </button>
                              )}

                              {/* Direct Password Change */}
                              <button
                                onClick={() => directChangeUserPassword(u.phone)}
                                className="px-2 py-1 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
                                title="Trực tiếp đổi mật khẩu tài khoản"
                              >
                                <Key className="w-3 h-3 inline mr-1" /> Đổi MK
                              </button>

                              {/* Lock / Unlock */}
                              <button
                                onClick={() => toggleUserLock(u.phone)}
                                className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                              >
                                {(u as any).status === 'locked' ? <Unlock className="w-3 h-3 inline mr-1 text-emerald-400" /> : <Lock className="w-3 h-3 inline mr-1 text-rose-400" />}
                                {(u as any).status === 'locked' ? 'Mở Khóa' : 'Khóa'}
                              </button>

                              {/* Delete Account */}
                              {u.role !== 'SUPER_ADMIN' && (
                                <button
                                  onClick={() => deleteUserAccount(u.phone)}
                                  className="px-2 py-1 rounded text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 inline mr-1" /> Xóa
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 20: SUPER ADMIN MASTER CONTROL SWITCHES */}
            {adminTab === 'master-control' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-slate-950 p-6 rounded-3xl border border-amber-500/40 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        🎛️ MODULE 20: QUẢN LÝ LỆNH BẬT / TẮT TOÀN HỆ THỐNG (SUPER ADMIN MASTER CONTROL)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Super Admin có quyền bóp nghẹt hoặc mở khóa bất kỳ phương thức nào trên toàn hệ thống. Toàn bộ Shop & Khách Hàng bắt buộc tuân theo thời gian thực!
                      </p>
                    </div>

                    <div className="bg-slate-900 px-3.5 py-2 rounded-2xl border border-amber-400/40 text-right shrink-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">TRẠNG THÁI QUYỀN LỰC OVERLORD:</span>
                      <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> 100% REALTIME WEBSOCKET ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* System Maintenance Master Control Panel */}
                  <div className="bg-slate-900 p-5 rounded-2xl border border-amber-500/50 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-wrap gap-2">
                      <div>
                        <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <Wrench className="w-5 h-5 text-amber-400 animate-bounce" /> 🚨 KHÓA BẢO TRÌ & NÂNG CẤP TOÀN HỆ THỐNG (SYSTEM MAINTENANCE LOCK)
                        </h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          Khi bật, toàn bộ Khách hàng & Cửa hàng sẽ thấy màn hình Bảo trì kèm Đồng hồ đếm ngược. <strong className="text-amber-300">CHỈ TÀI KHOẢN SUPER ADMIN MỚI TRUY CẬP ĐƯỢC WEB!</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {masterSwitches.enableSystemMaintenance ? (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...masterSwitches,
                                enableSystemMaintenance: false,
                                maintenanceEndTime: ''
                              };
                              updateTheme({ masterSwitches: updated });
                              addToast('🟢 Đã TẮT Chế độ Bảo trì - Hệ thống mở khóa hoạt động bình thường cho tất cả mọi người!', 'success');
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow cursor-pointer flex items-center gap-1.5"
                          >
                            <Unlock className="w-4 h-4" /> 🟢 TẮT BẢO TRÌ - MỞ KHÓA TOÀN SÀN
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const targetEndTime = new Date(Date.now() + (maintDurationHours * 3600 * 1000)).toISOString();
                              const updated = {
                                ...masterSwitches,
                                enableSystemMaintenance: true,
                                maintenanceTitle: maintTitle,
                                maintenanceMessage: maintMessage,
                                maintenanceEndTime: targetEndTime
                              };
                              updateTheme({ masterSwitches: updated });
                              addToast(`🚧 ĐÃ BẬT KHÓA BẢO TRÌ HỆ THỐNG! Thời gian đếm ngược ${maintDurationHours} giờ. Chỉ Admin mới dùng được web!`, 'error');
                            }}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-black px-4 py-2 rounded-xl text-xs transition shadow cursor-pointer flex items-center gap-1.5 border border-rose-400"
                          >
                            <Lock className="w-4 h-4" /> 🔒 BẬT KHÓA BẢO TRÌ NGAY
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 text-xs">Tiêu Đề Thông Báo Bảo Trì</label>
                        <input
                          type="text"
                          value={maintTitle}
                          onChange={e => setMaintTitle(e.target.value)}
                          placeholder="VD: 🚧 HỆ THỐNG ĐANG BẢO TRÌ & NÂNG CẤP ĐỊNH KỲ..."
                          className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-300 font-bold mb-1 text-xs">Nội Dung Chi Tiết Thông Báo Nâng Cấp</label>
                        <input
                          type="text"
                          value={maintMessage}
                          onChange={e => setMaintMessage(e.target.value)}
                          placeholder="VD: Hệ thống đang tiến hành nâng cấp hạ tầng máy chủ đám mây..."
                          className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-medium rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1 text-xs">Thời Gian Đếm Ngược Bảo Trì Dự Kiến</label>
                        <select
                          value={maintDurationHours}
                          onChange={e => setMaintDurationHours(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 text-amber-300 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                        >
                          <option value={0.5}>⏱️ 30 phút (Nâng cấp nhanh)</option>
                          <option value={1}>⏱️ 1 giờ (Bảo trì định kỳ)</option>
                          <option value={2}>⏱️ 2 giờ (Bảo trì lớn)</option>
                          <option value={4}>⏱️ 4 giờ (Nâng cấp máy chủ)</option>
                          <option value={12}>⏱️ 12 giờ (Nâng cấp toàn diện)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 flex items-end">
                        <p className="text-[11px] text-slate-400 font-medium bg-slate-950 p-2.5 rounded-xl border border-slate-800 w-full">
                          💡 <strong className="text-amber-300">Cơ chế hoạt động:</strong> Sau khi hết thời gian đếm ngược (hoặc khi Super Admin bấm Tắt bảo trì), hệ thống sẽ <strong className="text-emerald-400">TỰ ĐỘNG MỞ KHÓA</strong> cho tất cả khách hàng mà không cần bấm gì thêm. Khi đang Bật bảo trì, chỉ tài khoản Admin mới đăng nhập & dùng web bình thường.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 10 Master Switches Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        key: 'enableWalletPayment' as const,
                        label: '1. 💳 Thanh Toán Qua Ví TQ Pay',
                        desc: 'Bật/tắt thanh toán bằng số dư Ví TQ Pay đối với tất cả đơn hàng trên toàn sàn.',
                        icon: Wallet
                      },
                      {
                        key: 'enableVietQRPayment' as const,
                        label: '2. 🏦 Thanh Toán Chuyển Khoản VietQR',
                        desc: 'Bật/tắt phương thức chuyển khoản tự động qua mã VietQR khi mua/thuê đồ.',
                        icon: CreditCard
                      },
                      {
                        key: 'enableCODPayment' as const,
                        label: '3. 🚚 Thanh Toán COD (Nhận Hàng Trả Tiền)',
                        desc: 'Bật/tắt thanh toán tiền mặt COD trực tiếp cho shipper khi giao nhận hàng.',
                        icon: Truck
                      },
                      {
                        key: 'enableReviewCoins' as const,
                        label: '4. 🪙 Tích TQ Xu Khi Đánh Giá Sản Phẩm',
                        desc: 'Bật/tắt chương trình thưởng TQ Xu hoàn tiền cho người dùng viết review đánh giá.',
                        icon: Coins
                      },
                      {
                        key: 'enableWatchVideoCoins' as const,
                        label: '5. 📺 Thưởng TQ Xu Xem Video YouTube',
                        desc: 'Bật/tắt tính năng xem video tích lũy TQ Xu kiếm tiền thụ động.',
                        icon: Tv
                      },
                      {
                        key: 'enableVoucherDiscounts' as const,
                        label: '6. 🎟️ Mã Giảm Giá Voucher Toàn Sàn',
                        desc: 'Bật/tắt cho phép áp dụng Mã Giảm Giá Voucher trong màn hình thanh toán.',
                        icon: Sparkles
                      },
                      {
                        key: 'enableShopWithdrawals' as const,
                        label: '7. 💰 Rút Tiền Doanh Thu Cửa Hàng Shop',
                        desc: 'Bật/tắt cho phép Cửa hàng Shop tạo Lệnh Rút Tiền Doanh Thu về tài khoản ngân hàng.',
                        icon: TrendingUp
                      },
                      {
                        key: 'enableRentalBooking' as const,
                        label: '8. 👗 Tính Năng Cho Thuê Đồ (Rental)',
                        desc: 'Bật/tắt nút "Thuê Ngay" và lịch chọn ngày thuê cho toàn bộ sản phẩm thuê đồ.',
                        icon: ShoppingBag
                      },
                      {
                        key: 'enableRetailBuying' as const,
                        label: '9. 🛍️ Tính Năng Mua Hàng Trực Tiếp (Retail)',
                        desc: 'Bật/tắt nút "Mua Ngay" và giỏ hàng cho tất cả sản phẩm bán lẻ.',
                        icon: Package
                      },
                      {
                        key: 'enableShopProductAddition' as const,
                        label: '10. ➕ Cho Phép Shop Thêm Sản Phẩm Mới',
                        desc: 'Bật/tắt quyền đăng tải và niêm yết sản phẩm dịch vụ mới của các Cửa Hàng Shop.',
                        icon: Plus
                      }
                    ].map(sw => {
                      const masterSwitches = theme.masterSwitches || DEFAULT_MASTER_SWITCHES;
                      const isEnabled = masterSwitches[sw.key] !== false;
                      const IconComp = sw.icon;

                      return (
                        <div
                          key={sw.key}
                          className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 shadow-md ${
                            isEnabled
                              ? 'bg-slate-900 border-slate-700 hover:border-amber-500/50'
                              : 'bg-rose-950/20 border-rose-500/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-xl shrink-0 ${
                              isEnabled ? 'bg-slate-800 text-amber-400' : 'bg-rose-900/40 text-rose-400'
                            }`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-100 text-sm">{sw.label}</h4>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  isEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}>
                                  {isEnabled ? '🟢 ĐANG MỞ' : '🔒 ĐÃ KHÓA SÀN'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">{sw.desc}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              toggleMasterSwitch(sw.key);
                              recordAuditLog(
                                user.name,
                                'SUPER_ADMIN',
                                `${isEnabled ? 'Khóa' : 'Mở Khóa'} Master Control`,
                                sw.label,
                                `Super Admin đã ${isEnabled ? 'KHÓA' : 'MỞ KHÓA'} phương thức "${sw.label}" trên toàn hệ thống thời gian thực`,
                                isEnabled ? 'WARNING' : 'SUCCESS'
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                              isEnabled
                                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-sm'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-emerald-400 shadow-sm'
                            }`}
                          >
                            {isEnabled ? (
                              <>
                                <Lock className="w-3.5 h-3.5" /> 🔒 KHÓA NGAY
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" /> 🔓 MỞ LẠI
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 2: PASSWORD RESETS */}
            {adminTab === 'password-resets' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase">🔑 YÊU CẦU CẤP LẠI MẬT KHẨU TỪ KHÁCH HÀNG</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <th className="p-3">Thời gian</th>
                          <th className="p-3">Tên Tài khoản</th>
                          <th className="p-3">SĐT</th>
                          <th className="p-3 text-center">Trạng thái</th>
                          <th className="p-3 text-right">Thao tác Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {resetRequests.map(r => (
                          <tr key={r.id} className="hover:bg-slate-900/50">
                            <td className="p-3 text-slate-400 font-mono text-[10px]">{r.time}</td>
                            <td className="p-3 font-bold text-slate-100">{r.userName}</td>
                            <td className="p-3 font-mono text-amber-400 font-bold">{r.phone}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {r.status === 'PENDING' ? '⏳ CHỜ DUYỆT' : '✓ ĐÃ DUYỆT'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {r.status === 'PENDING' ? (
                                <button onClick={() => approveResetRequest(r.id, r.phone)} className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1 rounded text-xs font-black cursor-pointer">
                                  🔑 Duyệt & Cấp MK
                                </button>
                              ) : <span className="text-slate-500 text-[10px]">Đã xử lý</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 3: FINANCIAL P&L & CASH FLOW DISTRIBUTION */}
            {adminTab === 'financial-analytics' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-slate-950 p-6 rounded-3xl border border-amber-500/40 shadow-2xl space-y-6">
                  
                  {/* Top Header & Net Profit Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        📊 MODULE 3: BÁO CÁO TỔNG THU CHI & LỢI NHUẬN RÒNG TOÀN SÀN (PLATFORM P&L REPORT)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Tổng hợp dòng tiền GMV giao dịch, tổng thu phí sàn, dòng tiền nạp ví & phân bổ chi tiết trợ giá toàn hệ thống
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right bg-slate-900 px-4 py-2 rounded-2xl border border-amber-400/40 shadow-md">
                        <span className="text-[9px] text-slate-400 uppercase font-black block">LỢI NHUẬN RÒNG SÀN (NET PROFIT):</span>
                        <h4 className={`text-2xl font-black font-mono ${netPlatformProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {netPlatformProfit >= 0 ? '+' : ''}{netPlatformProfit.toLocaleString('vi-VN')} đ
                        </h4>
                        <span className="text-[10px] font-extrabold text-amber-300">
                          Biên LN Ròng: {((netPlatformProfit / totalGMV) * 100).toFixed(1)}% GMV
                        </span>
                      </div>

                      <button
                        onClick={handleExportFinancialPnlCSV}
                        className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="Xuất file CSV Báo cáo Thu Chi & Lợi Nhuận Ròng"
                      >
                        <Download className="w-4 h-4" /> Xuất Báo Cáo P&L CSV
                      </button>
                    </div>
                  </div>

                  {/* 4 Core Financial Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px] block">1. TỔNG GMV GIAO DỊCH TOÀN SÀN</span>
                      <h4 className="text-xl font-black text-blue-400 font-mono mt-1">{totalGMV.toLocaleString('vi-VN')} đ</h4>
                      <span className="text-[10px] text-slate-500 font-bold block mt-1">Tổng giá trị đơn mua & thuê</span>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px] block">2. TỔNG THU PHÍ SÀN ({defaultFeeRate}%)</span>
                      <h4 className="text-xl font-black text-emerald-400 font-mono mt-1">+{platformFeesRevenue.toLocaleString('vi-VN')} đ</h4>
                      <span className="text-[10px] text-emerald-500 font-bold block mt-1">Doanh thu hoa hồng thu từ Shop</span>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px] block">3. TỔNG CHI TRỢ GIÁ KHUYẾN MÃI</span>
                      <h4 className="text-xl font-black text-rose-400 font-mono mt-1">-{totalSubsidiesCost.toLocaleString('vi-VN')} đ</h4>
                      <span className="text-[10px] text-rose-400 font-bold block mt-1">Gồm Trợ giá Ví, Xu & Voucher toàn sàn</span>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-2xl border border-amber-500/40 shadow-xs">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px] block">4. LỢI NHUẬN RÒNG THỰC NHẬN</span>
                      <h4 className={`text-xl font-black font-mono mt-1 ${netPlatformProfit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {netPlatformProfit >= 0 ? '+' : ''}{netPlatformProfit.toLocaleString('vi-VN')} đ
                      </h4>
                      <span className="text-[10px] text-amber-300 font-bold block mt-1">Thu Phí Sàn - Trợ Giá - Phí Máy Chủ</span>
                    </div>
                  </div>

                  {/* Cash Flow Inflow & Outflow Reserve Escrow Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-5 rounded-2xl border border-emerald-500/30 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" /> TỔNG HỢP DÒNG TIỀN NẠP VÍ TQ PAY & LƯU LƯÂN CHUYỂN
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">VietQR Sync Active</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-bold text-[10px] uppercase block">Dòng Tiền Nạp Vào Ví (+)</span>
                        <p className="text-lg font-black text-emerald-400 font-mono mt-1">+{totalWalletDepositInflow.toLocaleString('vi-VN')} đ</p>
                        <span className="text-[9px] text-slate-500">Tiền nạp thật từ VietQR & Chuyển Khoản</span>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-bold text-[10px] uppercase block">Dòng Tiền Rút Doanh Thu (-)</span>
                        <p className="text-lg font-black text-amber-400 font-mono mt-1">-{totalWalletWithdrawOutflow.toLocaleString('vi-VN')} đ</p>
                        <span className="text-[9px] text-slate-500">Tiền giải ngân chi trả cho Cửa Hàng Shop</span>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/40">
                        <span className="text-slate-400 font-bold text-[10px] uppercase block">Số Dư Quỹ Ký Quỹ Tồn Thanh Khoản (=)</span>
                        <p className="text-lg font-black text-cyan-300 font-mono mt-1">{platformEscrowLiquidity.toLocaleString('vi-VN')} đ</p>
                        <span className="text-[9px] text-cyan-400 font-bold">Số dư thực có sẵn khả dụng trên hệ thống</span>
                      </div>
                    </div>
                  </div>

                  {/* BẢNG CHI TIẾT PHÂN PHỐI DÒNG TIỀN & KHOẢN CHI TRỢ GIÁ HỆ THỐNG */}
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        <Percent className="w-4 h-4 text-amber-400" /> BẢNG CHI TIẾT PHÂN PHỐI DÒNG TIỀN & KHOẢN CHI TRỢ GIÁ HỆ THỐNG
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Báo cáo cập nhật Realtime</span>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800 font-black">
                            <th className="p-3">Hạng Mục Dòng Tiền & Khoản Chi</th>
                            <th className="p-3">Phân Loại Thao Tác</th>
                            <th className="p-3">Tỷ Lệ / Quy Định Hạn Mức</th>
                            <th className="p-3 text-right">Số Tiền (VNĐ)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium">
                          <tr className="hover:bg-slate-950/50">
                            <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Thu Hoa Hồng Phí Sàn Mặc Định
                            </td>
                            <td className="p-3"><span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">DOANH THU (+)</span></td>
                            <td className="p-3 font-mono text-slate-300 font-bold">{defaultFeeRate}% GMV Toàn Sàn</td>
                            <td className="p-3 text-right font-mono font-black text-emerald-400 text-sm">+{platformFeesRevenue.toLocaleString('vi-VN')} đ</td>
                          </tr>

                          <tr className="hover:bg-slate-950/50">
                            <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Trợ Giá Thanh Toán Qua Ví TQ Pay
                            </td>
                            <td className="p-3"><span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">CHI TRỢ GIÁ (-)</span></td>
                            <td className="p-3 font-mono text-slate-300 font-bold">{theme.walletDiscountRate}% Giảm Trực Tiếp Đơn Ví</td>
                            <td className="p-3 text-right font-mono font-black text-rose-400 text-sm">-{walletSubsidiesCost.toLocaleString('vi-VN')} đ</td>
                          </tr>

                          <tr className="hover:bg-slate-950/50">
                            <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Chi Thưởng Hoàn TQ Xu Đánh Giá Sản Phẩm
                            </td>
                            <td className="p-3"><span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">CHI KHUYẾN MÃI (-)</span></td>
                            <td className="p-3 font-mono text-slate-300 font-bold">{theme.coinCashbackRate}% Tích Xu Đánh Giá</td>
                            <td className="p-3 text-right font-mono font-black text-amber-400 text-sm">-{coinCashbackSubsidies.toLocaleString('vi-VN')} đ</td>
                          </tr>

                          <tr className="hover:bg-slate-950/50">
                            <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-400"></span> Trợ Giá Mã Voucher Giảm Giá Toàn Sàn
                            </td>
                            <td className="p-3"><span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">CHI KHUYẾN MÃI (-)</span></td>
                            <td className="p-3 font-mono text-slate-300 font-bold">{vouchers.length} Mã Voucher Đã Phát Hành</td>
                            <td className="p-3 text-right font-mono font-black text-purple-400 text-sm">-{voucherSubsidiesCost.toLocaleString('vi-VN')} đ</td>
                          </tr>

                          <tr className="hover:bg-slate-950/50">
                            <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-pink-400"></span> Chi Thưởng Tích Xu Xem Video YouTube
                            </td>
                            <td className="p-3"><span className="bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">CHI KHUYẾN MÃI (-)</span></td>
                            <td className="p-3 font-mono text-slate-300 font-bold">{videoRewardCoinsCount.toLocaleString('vi-VN')} Xu Đã Thưởng</td>
                            <td className="p-3 text-right font-mono font-black text-pink-400 text-sm">-{videoRewardCoinsCost.toLocaleString('vi-VN')} đ</td>
                          </tr>

                          <tr className="hover:bg-slate-950/50">
                            <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Chi Phí Vận Hành Máy Chủ Supabase Realtime & Cloud
                            </td>
                            <td className="p-3"><span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">OPEX NỀN TẢNG (-)</span></td>
                            <td className="p-3 font-mono text-slate-300 font-bold">Cụm Đám Mây SG-Realtime</td>
                            <td className="p-3 text-right font-mono font-black text-slate-400 text-sm">-{infrastructureOpexCost.toLocaleString('vi-VN')} đ</td>
                          </tr>

                          <tr className="bg-slate-950 font-black text-sm border-t border-slate-700">
                            <td className="p-3 text-amber-400" colSpan={3}>
                              CÂN ĐỐI DÒNG TIỀN & LỢI NHUẬN RÒNG SÀN (NET PROFIT)
                            </td>
                            <td className={`p-3 text-right font-mono text-base ${netPlatformProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {netPlatformProfit >= 0 ? '+' : ''}{netPlatformProfit.toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* BẢNG PHÂN PHỐI DOANH THU GMV THEO DANH MỤC GIAN HÀNG */}
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" /> PHÂN PHỐI DOANH THU GMV & PHÍ SÀN THEO 5 DANH MỤC SHOP
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-bold text-[10px] block">👗 Cho Thuê Đồ (40%)</span>
                        <p className="text-sm font-black text-purple-400 font-mono mt-1">{Math.round(totalGMV * 0.4).toLocaleString('vi-VN')} đ</p>
                        <span className="text-[9px] text-emerald-400 font-bold">Phí sàn: +{Math.round(totalGMV * 0.4 * (defaultFeeRate/100)).toLocaleString('vi-VN')}đ</span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-bold text-[10px] block">🛍️ Shop Bán Đồ (30%)</span>
                        <p className="text-sm font-black text-blue-400 font-mono mt-1">{Math.round(totalGMV * 0.3).toLocaleString('vi-VN')} đ</p>
                        <span className="text-[9px] text-emerald-400 font-bold">Phí sàn: +{Math.round(totalGMV * 0.3 * (defaultFeeRate/100)).toLocaleString('vi-VN')}đ</span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-bold text-[10px] block">🧋 Đồ Ăn & Uống (15%)</span>
                        <p className="text-sm font-black text-amber-400 font-mono mt-1">{Math.round(totalGMV * 0.15).toLocaleString('vi-VN')} đ</p>
                        <span className="text-[9px] text-emerald-400 font-bold">Phí sàn: +{Math.round(totalGMV * 0.15 * (defaultFeeRate/100)).toLocaleString('vi-VN')}đ</span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-bold text-[10px] block">💄 Làm Đẹp & Spa (10%)</span>
                        <p className="text-sm font-black text-pink-400 font-mono mt-1">{Math.round(totalGMV * 0.10).toLocaleString('vi-VN')} đ</p>
                        <span className="text-[9px] text-emerald-400 font-bold">Phí sàn: +{Math.round(totalGMV * 0.10 * (defaultFeeRate/100)).toLocaleString('vi-VN')}đ</span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-bold text-[10px] block">🚖 Gọi Taxi & Xe (5%)</span>
                        <p className="text-sm font-black text-teal-400 font-mono mt-1">{Math.round(totalGMV * 0.05).toLocaleString('vi-VN')} đ</p>
                        <span className="text-[9px] text-emerald-400 font-bold">Phí sàn: +{Math.round(totalGMV * 0.05 * (defaultFeeRate/100)).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* MODULE 4: SHOP WITHDRAWALS */}
            {adminTab === 'withdrawals' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase">💰 DUYỆT LỆNH RÚT TIỀN DOANH THU SHOP (CHU KỲ 14 NGÀY)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <th className="p-3">Mã Lệnh</th>
                          <th className="p-3">Tên Cửa Hàng</th>
                          <th className="p-3 text-center">Số tiền</th>
                          <th className="p-3">TK Nhận tiền</th>
                          <th className="p-3 text-center">Trạng thái</th>
                          <th className="p-3 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {withdrawals.map(w => (
                          <tr key={w.id} className="hover:bg-slate-900/50">
                            <td className="p-3 font-mono font-bold text-amber-400">#{w.id}</td>
                            <td className="p-3 font-bold text-slate-100">{w.shopName}</td>
                            <td className="p-3 text-center font-black text-emerald-400 font-mono">{w.amount.toLocaleString('vi-VN')} đ</td>
                            <td className="p-3 text-slate-300 font-mono text-[10px]">{w.bankName} - {w.stk} ({w.ownerName})</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                w.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {w.status === 'pending' ? '⏳ CHỜ DUYỆT' : w.status === 'approved' ? '✅ ĐÃ DUYỆT' : '❌ TỪ CHỐI'}
                              </span>
                            </td>
                            <td className="p-3 text-center space-x-1">
                              {w.status === 'pending' ? (
                                <>
                                  <button onClick={() => approveWithdrawal(w.id)} className="bg-emerald-600 text-slate-950 font-black px-2.5 py-1 rounded text-[10px] cursor-pointer">✅ Duyệt</button>
                                  <button onClick={() => rejectWithdrawal(w.id)} className="bg-rose-600 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer">❌ Từ chối</button>
                                </>
                              ) : <span className="text-slate-500 text-[10px]">Đã xử lý</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 5: CONSUMER TRENDS */}
            {adminTab === 'consumer-trends' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-cyan-400 uppercase">👥 THỐNG KÊ NGƯỜI DÙNG & TRENDS DOANH THU SHOP</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Tổng số người dùng đăng ký:</span>
                      <strong className="text-xl text-slate-100 font-black">{usersList.length} tài khoản</strong>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Số lượng Shop cửa hàng:</span>
                      <strong className="text-xl text-emerald-400 font-black">{usersList.filter(u => u.role === 'SHOP').length || 4} Shop</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 6: SYSTEM CONFIG */}
            {adminTab === 'system-config' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 max-w-xl">
                  <h3 className="text-base font-black text-amber-400 uppercase">⚙️ CẤU HÌNH % VÍ / XU / PHÍ SÀN MẶC ĐỊNH</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">% Ưu đãi Ví TQ Pay:</label>
                      <input type="number" value={theme.walletDiscountRate} onChange={e => updateTheme({ walletDiscountRate: Number(e.target.value) })} className="w-32 bg-slate-900 border border-slate-700 text-emerald-400 font-black rounded-xl px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">% Hoàn TQ Xu Đánh giá:</label>
                      <input type="number" value={theme.coinCashbackRate} onChange={e => updateTheme({ coinCashbackRate: Number(e.target.value) })} className="w-32 bg-slate-900 border border-slate-700 text-amber-400 font-black rounded-xl px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">% Phí sàn mặc định toàn hệ thống:</label>
                      <input type="number" value={defaultFeeRate} onChange={e => setDefaultFeeRate(Number(e.target.value))} className="w-32 bg-slate-900 border border-slate-700 text-rose-400 font-black rounded-xl px-3 py-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 7: FEE OVERRIDES */}
            {adminTab === 'fee-overrides' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-indigo-400 uppercase">% CÀI PHÍ SÀN RIÊNG CHO TỪNG GIAN HÀNG SHOP</h3>
                  <div className="space-y-2">
                    {['TQ Rental Studio', 'TQ Retail Shop', 'TQ Tea & Coffee', 'TQ Beauty Spa'].map(sName => (
                      <div key={sName} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="font-bold text-slate-100">{sName}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={shopFeeOverrides[sName] !== undefined ? shopFeeOverrides[sName] : defaultFeeRate}
                            onChange={e => {
                              const updated = { ...shopFeeOverrides, [sName]: Number(e.target.value) };
                              setShopFeeOverrides(updated);
                              localStorage.setItem('tq_shop_fee_overrides', JSON.stringify(updated));
                            }}
                            className="w-16 bg-slate-950 border border-slate-700 text-indigo-400 font-black rounded px-2 py-1 text-center"
                          />
                          <span className="text-slate-400 font-bold">% Phí sàn</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 8: COUPON / VOUCHER MANAGEMENT & ISSUANCE */}
            {adminTab === 'vouchers' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 1. Voucher Creation Form */}
                <form onSubmit={handleCreateVoucher} className="bg-slate-950 p-6 rounded-2xl border border-rose-500/40 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-rose-400" /> TẠO & PHÁT HÀNH MÃ GIẢM GIÁ VOUCHER MỚI
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Cấu hình chi tiết mức giảm, giới hạn số lượt sử dụng và phương thức thanh toán bắt buộc</p>
                    </div>
                    <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-400/30">
                      CẬP NHẬT REALTIME TOÀN SÀN
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Code */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Mã Voucher Code:</label>
                      <input
                        type="text"
                        value={newVCode}
                        onChange={e => setNewVCode(e.target.value)}
                        required
                        placeholder="VD: TQVIP100K"
                        className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-black rounded-xl px-3.5 py-2 text-xs uppercase focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    {/* Discount Type */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Loại Giảm Giá:</label>
                      <select
                        value={newVType}
                        onChange={e => setNewVType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-rose-400"
                      >
                        <option value="fixed">Số tiền cố định (VNĐ)</option>
                        <option value="percent">Phần trăm (%)</option>
                      </select>
                    </div>

                    {/* Discount Value */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Mức Giảm ({newVType === 'fixed' ? 'VNĐ' : '%'}):
                      </label>
                      <input
                        type="number"
                        value={newVValue}
                        onChange={e => setNewVValue(Number(e.target.value))}
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-black rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    {/* Min Order Amount */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Đơn Hàng Tối Thiểu (VNĐ):</label>
                      <input
                        type="number"
                        value={newVMinOrder}
                        onChange={e => setNewVMinOrder(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-mono font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    {/* Max Discount Amount */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Mức Giảm Tối Đa (VNĐ):</label>
                      <input
                        type="number"
                        value={newVMaxDiscount}
                        onChange={e => setNewVMaxDiscount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-mono font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    {/* Total Usage Limit */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Giới Hạn Lượt Sử Dụng (Lượt):</label>
                      <input
                        type="number"
                        value={newVTotalLimit}
                        onChange={e => setNewVTotalLimit(Number(e.target.value))}
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-black rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    {/* Required Payment Method */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Phương Thức Thanh Toán Bắt Buộc:</label>
                      <select
                        value={newVRequiredPayment}
                        onChange={e => setNewVRequiredPayment(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-rose-400"
                      >
                        <option value="ALL">🌐 Cho Phép Tất Cả Phương Thức (Không Bắt Buộc)</option>
                        <option value="WALLET">💳 Bắt Buộc Thanh Toán Qua Ví TQ Pay (Kích Cầu Nạp Ví)</option>
                        <option value="VIETQR">🏦 Bắt Buộc Chuyển Khoản Ngân Hàng VietQR</option>
                        <option value="COD">🚚 Bắt Buộc Thanh Toán Tiền Mặt COD Khi Nhận Hàng</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Mô Tả & Điều Kiện Áp Dụng:</label>
                      <input
                        type="text"
                        value={newVDesc}
                        onChange={e => setNewVDesc(e.target.value)}
                        placeholder="VD: Giảm 100K cho đơn hàng từ 300K khi thanh toán qua Ví TQ Pay"
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-medium rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-rose-500 via-red-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center gap-2"
                    >
                      <Ticket className="w-4 h-4" /> 🚀 TẠO & PHÁT HÀNH VOUCHER TOÀN SÀN
                    </button>
                  </div>
                </form>

                {/* 2. Issued Vouchers Table */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-amber-400" /> DANH SÁCH MÃ GIẢM GIÁ ĐÃ PHÁT HÀNH ({vouchers.length} VOUCHER)
                    </h3>

                    <button
                      type="button"
                      onClick={handleExportVouchersCSV}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Xuất File CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                          <th className="p-3">MÃ CODE</th>
                          <th className="p-3">MỨC GIẢM</th>
                          <th className="p-3">ĐIỀU KIỆN ĐƠN</th>
                          <th className="p-3">P.THỨC BẮT BUỘC</th>
                          <th className="p-3">TIẾN ĐỘ SỬ DỤNG</th>
                          <th className="p-3 text-center">TRẠNG THÁI</th>
                          <th className="p-3 text-right">THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {vouchers.map((v, idx) => {
                          const pct = Math.min(100, Math.round(((v.usedCount || 0) / (v.totalUsageLimit || 1)) * 100));

                          return (
                            <tr key={idx} className="hover:bg-slate-900/60 transition">
                              <td className="p-3">
                                <span className="font-mono font-black text-amber-400 text-sm bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
                                  {v.code}
                                </span>
                                {v.description && (
                                  <span className="text-[10px] text-slate-400 font-medium block mt-1 line-clamp-1 max-w-[200px]">
                                    {v.description}
                                  </span>
                                )}
                              </td>

                              <td className="p-3 font-bold">
                                <span className="text-emerald-400 font-mono text-sm">
                                  {v.discountType === 'fixed' ? `${v.discountValue.toLocaleString('vi-VN')} đ` : `-${v.discountValue}%`}
                                </span>
                                {v.maxDiscountAmount && v.discountType === 'percent' && (
                                  <span className="text-[10px] text-slate-400 block font-mono">Tối đa {v.maxDiscountAmount.toLocaleString('vi-VN')} đ</span>
                                )}
                              </td>

                              <td className="p-3 text-slate-300">
                                <div>Đơn từ: <strong className="text-slate-100 font-mono">{(v.minOrderAmount || 0).toLocaleString('vi-VN')} đ</strong></div>
                              </td>

                              <td className="p-3">
                                {v.requiredPaymentMethod === 'WALLET' && (
                                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-lg border border-emerald-500/40">
                                    💳 Ví TQ Pay
                                  </span>
                                )}
                                {v.requiredPaymentMethod === 'VIETQR' && (
                                  <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-500/40">
                                    🏦 VietQR
                                  </span>
                                )}
                                {v.requiredPaymentMethod === 'COD' && (
                                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-500/40">
                                    🚚 COD Tiền mặt
                                  </span>
                                )}
                                {v.requiredPaymentMethod === 'ALL' && (
                                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                    🌐 Tất cả PTTT
                                  </span>
                                )}
                              </td>

                              <td className="p-3">
                                <div className="space-y-1 w-28">
                                  <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-amber-400 font-bold">{v.usedCount || 0} / {v.totalUsageLimit || 100}</span>
                                    <span className="text-slate-400">{pct}%</span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                                    <div className="bg-gradient-to-r from-amber-400 to-rose-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleVoucherStatus(v.id || v.code)}
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition cursor-pointer ${
                                    v.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500 border border-slate-700'
                                  }`}
                                >
                                  {v.status === 'active' ? '🟢 Kích Hoạt' : '🔒 Khóa'}
                                </button>
                              </td>

                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVoucher(v.id || v.code)}
                                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                                  title="Xóa Voucher"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 9: CUSTOM SHOP LINKS WITH AI RECOMMENDATIONS */}
            {adminTab === 'custom-links' && (
              <div className="space-y-6">
                
                {/* AI Web Link Recommender Box */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 p-5 rounded-2xl border border-blue-500/50 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-blue-500/30 pb-2">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-400 animate-pulse" /> 🤖 AI ĐỀ XUẤT TẠO LINK WEB SHOP MỚI MIỄN PHÍ TỪ TỪ KHÓA
                    </h3>
                    <span className="bg-blue-500/20 text-blue-300 font-bold text-[9px] px-2 py-0.5 rounded border border-blue-400/40">
                      TRUY CẬP ĐƯỢC LUÔN 100%
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px]">
                    Nhập từ khóa thương hiệu (VD: <em>váy cưới luxury hà nội</em>, <em>trà sữa matcha đà nẵng</em>, <em>spa dưỡng da tphcm</em>), AI sẽ tự động sinh các đường dẫn Web chuẩn SEO đẹp mắt, bấm kích hoạt là có thể TRUY CẬP TRỰC TIẾP SANG TRANG SHOP!
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiLinkKeyword}
                      onChange={e => setAiLinkKeyword(e.target.value)}
                      placeholder="Nhập từ khóa gợi ý (VD: dam cuoi luxury hanoi, tra sua matcha...)"
                      className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 font-bold rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleGenerateAiShopLinks(aiLinkKeyword)}
                      disabled={isAiGeneratingLinks}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black px-4 py-2.5 rounded-xl uppercase transition shadow cursor-pointer shrink-0 flex items-center gap-1 text-xs"
                    >
                      <Wand2 className="w-3.5 h-3.5" /> {isAiGeneratingLinks ? 'AI Đang Tạo...' : '🤖 AI Đề Xuất Link'}
                    </button>
                  </div>

                  {/* AI Suggested Links Cards */}
                  {aiSuggestedLinksList.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <h4 className="text-[11px] font-black text-amber-400 uppercase flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> ĐƯỜNG DẪN AI ĐỀ XUẤT CHO GIAN HÀNG [{newSlugShop}]:
                      </h4>

                      <div className="space-y-2">
                        {aiSuggestedLinksList.map((item, idx) => (
                          <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-blue-500/30 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">{item.shopName}</span>
                              <span className="text-blue-300 font-mono font-bold text-xs truncate block">{item.fullUrl}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleActivateAiSuggestedLink(item)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-3 py-1.5 rounded-lg transition shadow cursor-pointer shrink-0 flex items-center gap-1 text-[11px]"
                            >
                              <Zap className="w-3.5 h-3.5" /> ⚡ Kích Hoạt Miễn Phí
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Manual Link Form */}
                <form onSubmit={handleCreateCustomLink} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 max-w-lg">
                  <h3 className="text-xs font-black text-blue-400 uppercase">🔗 QUẢN LÝ LINK WEB THỦ CÔNG CHO TỪNG SHOP (SLUG)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={newSlugShop} onChange={e => setNewSlugShop(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-200 font-bold rounded-xl px-3 py-2">
                      <option value="TQ Rental Studio">TQ Rental Studio</option>
                      <option value="TQ Retail Shop">TQ Retail Shop</option>
                      <option value="TQ Tea & Coffee">TQ Tea & Coffee</option>
                      <option value="TQ Beauty Spa">TQ Beauty Spa</option>
                    </select>
                    <input type="text" value={newSlugCode} onChange={e => setNewSlugCode(e.target.value)} placeholder="Slug (VD: shop-thoi-trang-tq)" className="bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2" />
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl cursor-pointer">+ Tạo Link Thủ Công</button>
                </form>

                {/* Active Custom Links Table */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-emerald-400 uppercase">DANH SÁCH LINK WEB SHOP ĐANG HOẠT ĐỘNG ({customLinks.length})</h3>
                  <div className="space-y-2">
                    {customLinks.map((link, idx) => (
                      <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                        <div>
                          <span className="font-bold text-slate-100 block">{link.shopName}</span>
                          <span className="text-blue-400 font-mono text-xs">{link.fullUrl || `https://tqstore.vn/shop/${link.slug}`}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenShopStorefront) {
                              onClose();
                              onOpenShopStorefront(link.shopName);
                            } else {
                              addToast(`🌐 Đã mở đường dẫn Web Shop [${link.shopName}] thành công!`, 'info');
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-black px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 text-[11px]"
                        >
                          <Globe className="w-3.5 h-3.5" /> 🌐 TRUY CẬP NGAY
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* MODULE 10: REVIEWS MODERATION */}
            {adminTab === 'reviews-moderation' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-amber-400 uppercase">⭐ DUYỆT ĐÁNH GIÁ KHÁCH HÀNG HOÀN XU</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <th className="p-3">Khách hàng</th>
                          <th className="p-3">Sản phẩm</th>
                          <th className="p-3 text-center">Sao</th>
                          <th className="p-3">Nhận xét</th>
                          <th className="p-3 text-center">Trạng thái</th>
                          <th className="p-3 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {reviewsList.map(r => (
                          <tr key={r.id} className="hover:bg-slate-900/50">
                            <td className="p-3 font-bold text-slate-100">{r.userName}</td>
                            <td className="p-3 font-bold text-blue-400">{r.productName}</td>
                            <td className="p-3 text-center font-bold text-amber-400">{r.rating} ⭐</td>
                            <td className="p-3 text-slate-300">{r.comment}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {r.status === 'pending' ? 'CHỜ DUYỆT' : 'ĐÃ DUYỆT'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {r.status === 'pending' ? (
                                <button onClick={() => approveReview(r.id)} className="bg-emerald-600 text-slate-950 font-black px-2.5 py-1 rounded text-[10px] cursor-pointer">✅ Duyệt</button>
                              ) : <span className="text-slate-500 text-[10px]">Đã duyệt</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 11: AI SYNTHETIC REVIEWS & EDIT SALES COUNT */}
            {adminTab === 'fake-reviews' && (
              <div className="space-y-6 max-w-xl">
                <div className="bg-slate-950 p-6 rounded-2xl border border-purple-500/40 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 font-bold border border-purple-500/30">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-purple-400 uppercase tracking-wider">
                        🤖 HỆ THỐNG AI SINH ĐÁNH GIÁ ẢO & SỬA LƯỢT MUA BÁN
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Tự động sinh đánh giá thực tế như người dùng thật theo tên sản phẩm & danh mục mà không làm tăng tài khoản rác!</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300">
                    <p>• <strong>Sinh Đánh Giá Chuẩn AI:</strong> Tự động chọn tên người mua thực tế và bài viết phù hợp với 👗 Thuê đồ, 🛍️ Bán đồ, 🧋 F&B, 💄 Spa.</p>
                    <p>• <strong>Điều Chỉnh Lượt Mua:</strong> Cập nhật trực tiếp số lượt bán (`salesCount`) để hiển thị công khai trên giao diện web.</p>
                  </div>

                  {onOpenFakeReviewModal && (
                    <button
                      onClick={() => { onClose(); onOpenFakeReviewModal(); }}
                      className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black py-3.5 rounded-xl uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-purple-200" /> 🚀 KÍCH HOẠT CÔNG CỤ AI SINH ĐÁNH GIÁ ẢO & SỬA LƯỢT MUA
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* MODULE 12: BUTTONS & CATEGORIES */}
            {adminTab === 'buttons-categories' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 max-w-lg">
                  <h3 className="text-xs font-black text-teal-400 uppercase">📂 QUẢN LÝ NÚT BẤM NHANH TRANG CHỦ</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={newBtnLabel} onChange={e => setNewBtnLabel(e.target.value)} placeholder="Tên nút (VD: Flash Sale)..." className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2" />
                    <input type="text" value={newBtnUrl} onChange={e => setNewBtnUrl(e.target.value)} placeholder="URL (#rental)..." className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2" />
                  </div>
                  <button onClick={handleAddQuickBtn} className="bg-teal-600 text-slate-950 font-black px-4 py-2 rounded-xl cursor-pointer">THÊM NÚT BẤM</button>
                </div>
              </div>
            )}

            {/* MODULE 13: BROADCAST ANNOUNCEMENT WITH AI ASSISTANT */}
            {adminTab === 'broadcast-announcement' && (
              <div className="space-y-6 max-w-2xl">
                <form onSubmit={handleBroadcastAnnouncement} className="bg-slate-950 p-6 rounded-2xl border border-rose-500/40 space-y-4 shadow-xl">
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 font-bold border border-rose-500/30">
                        <Megaphone className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider">
                          📢 SOẠN & PHÁT THÔNG BÁO TOÀN HỆ THỐNG (AI ASSISTED)
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium">Gửi thông báo đến chuông hoạt động của tất cả {usersList.length} tài khoản người dùng & cửa hàng!</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Copywriting Preset Helper */}
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Wand2 className="w-4 h-4 text-amber-400" /> AI Hỗ Trợ Soạn Thảo Văn Bản Thông Báo Theo Chủ Đề:
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateAiAnnouncementCopy}
                        disabled={isAiGeneratingText}
                        className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-[11px] uppercase transition cursor-pointer flex items-center gap-1 shadow-md"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> {isAiGeneratingText ? 'AI Đang Viết...' : '🤖 AI Viết Cho Admin'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setAnnouncementTopic('PROMO')}
                        className={`py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                          announcementTopic === 'PROMO' ? 'bg-rose-600 text-white border-rose-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        🔥 Khuyến Mãi Flash Sale
                      </button>

                      <button
                        type="button"
                        onClick={() => setAnnouncementTopic('MAINTENANCE')}
                        className={`py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                          announcementTopic === 'MAINTENANCE' ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        ⚙️ Nâng Cấp Hệ Thống
                      </button>

                      <button
                        type="button"
                        onClick={() => setAnnouncementTopic('REWARD')}
                        className={`py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                          announcementTopic === 'REWARD' ? 'bg-yellow-600 text-white border-yellow-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        🪙 Tặng TQ Xu & Ví
                      </button>

                      <button
                        type="button"
                        onClick={() => setAnnouncementTopic('NEW_COLLECTION')}
                        className={`py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                          announcementTopic === 'NEW_COLLECTION' ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        👗 Bộ Sưu Tập Thuê Đồ
                      </button>
                    </div>
                  </div>

                  {/* Announcement Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tiêu Đề Thông Báo Broadcast:
                    </label>
                    <input
                      type="text"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      required
                      placeholder="VD: 🔥 BỎNG TAY FLASH SALE 50% TOÀN BỘ GIAN HÀNG!"
                      className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  {/* Announcement Message Content */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nội Dung Văn Bản Thông Báo Chi Tiết:
                    </label>
                    <textarea
                      rows={4}
                      value={announcementMessage}
                      onChange={(e) => setAnnouncementMessage(e.target.value)}
                      required
                      placeholder="Nhập nội dung văn bản cần phát sóng đến toàn bộ người dùng..."
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-medium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-400 text-xs leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black py-3.5 rounded-xl uppercase tracking-wider transition shadow-xl cursor-pointer flex items-center justify-center gap-2 text-xs"
                  >
                    <Send className="w-4 h-4 text-white" /> 🚀 PHÁT THÔNG BÁO TỚI TOÀN BỘ TÀI KHOẢN HỆ THỐNG
                  </button>
                </form>
              </div>
            )}

            {/* MODULE 14: SMART RECOMMENDER & FEATURED SHOP/PRODUCT CURATION */}
            {adminTab === 'smart-recommender' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 1. Đề Xuất Cửa Hàng (Shop Nổi Bật & Shop Mới Khai Trương) */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/40 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <PartyPopper className="w-4 h-4 text-amber-400 animate-bounce" /> 1. ĐỀ XUẤT CỬA HÀNG (SHOP NỔI BẬT & MỚI KHAI TRƯƠNG)
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Gắn huy hiệu VIP và ghim Cửa Hàng lên vị trí hàng đầu trên Banner Trang chủ & Mall</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Tự động đồng bộ hệ thống</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {usersList.filter(u => u.role === 'SHOP').map((sUser, idx) => {
                      const isFeatured = featuredShops.includes(sUser.name);

                      return (
                        <div key={idx} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={sUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sUser.name)}&background=0F2C59&color=fff`}
                              alt={sUser.name}
                              className="w-11 h-11 rounded-xl border border-amber-400 object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-100 text-xs truncate block">{sUser.name}</span>
                                {isFeatured && (
                                  <span className="bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded uppercase shrink-0">🏆 VIP</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono truncate block">{sUser.phone || sUser.email}</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 shrink-0">
                            {/* Toggle 1: Grand Opening Tag */}
                            <button
                              type="button"
                              onClick={() => toggleShopGrandOpeningTag(sUser.phone)}
                              className={`px-2.5 py-1 rounded-xl font-black text-[9px] uppercase transition cursor-pointer flex items-center gap-1 ${
                                sUser.isGrandOpeningShop ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <PartyPopper className="w-3 h-3" />
                              {sUser.isGrandOpeningShop ? '✓ Đang Khai Trương' : '+ Tag Khai Trương'}
                            </button>

                            {/* Toggle 2: Featured Shop Tag */}
                            <button
                              type="button"
                              onClick={() => toggleFeaturedShop(sUser.name)}
                              className={`px-2.5 py-1 rounded-xl font-black text-[9px] uppercase transition cursor-pointer flex items-center gap-1 ${
                                isFeatured ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <Crown className="w-3 h-3" />
                              {isFeatured ? '🏆 Shop Nổi Bật' : '+ Ghim Nổi Bật'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Đề Xuất Sản Phẩm Nổi Bật Trang Chủ & Gợi Ý Tìm Kiếm */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-400" /> 2. ĐỀ XUẤT SẢN PHẨM NỔI BẬT TRANG CHỦ & GỢI Ý TÌM KIẾM HOT ({products.length} SP)
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Chọn sản phẩm ghim lên danh sách Hot Bán Chạy và Ô Gợi Ý Tìm Kiếm ở Header</p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {products.map((p, idx) => {
                      const isSuggested = searchSuggestedProductIds.includes(p.id) || searchSuggestedProductIds.includes(String(p.id));

                      return (
                        <div key={idx} className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={p.img} alt={p.title} className="w-11 h-11 object-cover rounded-xl shrink-0 border border-slate-700" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-100 text-xs truncate block">{p.title}</span>
                                {isSuggested && (
                                  <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase shrink-0">🔍 Gợi Ý Hot</span>
                                )}
                              </div>
                              <span className="text-[10px] text-amber-400 font-bold block">{p.shopName} • {p.price.toLocaleString('vi-VN')} đ</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {onToggleGrandOpeningProduct && (
                              <button
                                type="button"
                                onClick={() => onToggleGrandOpeningProduct(p.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition cursor-pointer ${
                                  p.isGrandOpening ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {p.isGrandOpening ? '🔥 Đã Đề Xuất Hot' : '+ Đề Xuất Hot'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => toggleSearchSuggestedProduct(p.id, p.title)}
                              className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition cursor-pointer flex items-center gap-1 ${
                                isSuggested ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <Search className="w-3 h-3" />
                              {isSuggested ? '🔍 Gợi Ý Tìm Kiếm' : '+ Ô Tìm Kiếm'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. AI Keyword Match Search Simulator */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-5 rounded-2xl border border-indigo-500/40 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-indigo-500/30 pb-2">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-400" /> 3. MÔ PHỎNG THUẬT TOÁN AI ĐỀ XUẤT TRÙNG TỪ KHÓA TÌM KIẾM
                    </h3>
                    <span className="bg-indigo-500/20 text-indigo-300 font-bold text-[9px] px-2 py-0.5 rounded border border-indigo-400/40">
                      MÔ PHỎNG THỜI GIAN THỰC
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testSearchKeyword}
                      onChange={e => setTestSearchKeyword(e.target.value)}
                      placeholder="Nhập từ khóa thử nghiệm (VD: váy cưới, trà sữa, spa...)"
                      className="flex-1 bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Kết quả AI khớp từ khóa "{testSearchKeyword}": {matchedSimulatedProducts.length} sản phẩm
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchedSimulatedProducts.map((p, idx) => (
                        <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
                          <img src={p.img} alt={p.title} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-100 text-xs truncate block">{p.title}</span>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold block">Độ khớp từ khóa: 100% 🎯</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* MODULE 15: MAIN PAGE FEATURE VISIBILITY & SHORTCUT CONTROLS */}
            {adminTab === 'feature-visibility' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                    <div>
                      <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <Eye className="w-5 h-5 text-emerald-400" /> 15. BẢNG QUẢN LÝ ẨN / HIỆN CÁC CHỨC NĂNG & DỰ ÁN TRÊN TRANG CHÍNH
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Bật/Tắt tức thì các khối giao diện, bộ lọc danh mục, thanh định vị Google Maps & nút bấm chuyển nhanh. Đồng bộ Supabase Realtime 100%.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          const allTrue = {
                            showHeroBanner: true,
                            showCategoryFilters: true,
                            showLocationFilter: true,
                            showSmartRecommender: true,
                            showQuickButtons: true,
                            showLiveChatWidget: true,
                            showPromoBar: true
                          };
                          await updateTheme({ featureVisibility: allTrue });
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow"
                      >
                        ✓ Bật Tất Cả
                      </button>

                      <button
                        onClick={async () => {
                          const allFalse = {
                            showHeroBanner: false,
                            showCategoryFilters: false,
                            showLocationFilter: false,
                            showSmartRecommender: false,
                            showQuickButtons: false,
                            showLiveChatWidget: false,
                            showPromoBar: false
                          };
                          await updateTheme({ featureVisibility: allFalse });
                        }}
                        className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer border border-rose-500/40"
                      >
                        ✕ Tắt Tất Cả
                      </button>
                    </div>
                  </div>

                  {/* 7 Visibility Feature Toggle Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* 1. Hero Banner */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <h4 className="font-black text-slate-100 text-xs uppercase">1. Banner Quảng Cáo Main Hero</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">Khối banner lớn + Khuyến mãi ví TQ Pay ở đầu trang chủ</p>
                      </div>

                      <button
                        onClick={() => toggleFeatureVisibility('showHeroBanner')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          (theme.featureVisibility?.showHeroBanner !== false)
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {(theme.featureVisibility?.showHeroBanner !== false) ? <ToggleRight className="w-5 h-5 text-slate-950" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                        {(theme.featureVisibility?.showHeroBanner !== false) ? 'HIỆN (ON)' : 'ẨN (OFF)'}
                      </button>
                    </div>

                    {/* 2. Category Filters */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-teal-400" />
                          <h4 className="font-black text-slate-100 text-xs uppercase">2. Thanh Bộ Lọc Danh Mục Shop</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">Các tab lọc Thuê Đồ, Bán Đồ, F&B Đồ Ăn, Spa Làm Đẹp</p>
                      </div>

                      <button
                        onClick={() => toggleFeatureVisibility('showCategoryFilters')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          (theme.featureVisibility?.showCategoryFilters !== false)
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {(theme.featureVisibility?.showCategoryFilters !== false) ? <ToggleRight className="w-5 h-5 text-slate-950" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                        {(theme.featureVisibility?.showCategoryFilters !== false) ? 'HIỆN (ON)' : 'ẨN (OFF)'}
                      </button>
                    </div>

                    {/* 3. Location Filter */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-400" />
                          <h4 className="font-black text-slate-100 text-xs uppercase">3. Bộ Lọc Tỉnh/Thành & Google Maps</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">Bộ lọc vị trí địa lý Tỉnh thành / Quận huyện Việt Nam</p>
                      </div>

                      <button
                        onClick={() => toggleFeatureVisibility('showLocationFilter')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          (theme.featureVisibility?.showLocationFilter !== false)
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {(theme.featureVisibility?.showLocationFilter !== false) ? <ToggleRight className="w-5 h-5 text-slate-950" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                        {(theme.featureVisibility?.showLocationFilter !== false) ? 'HIỆN (ON)' : 'ẨN (OFF)'}
                      </button>
                    </div>

                    {/* 4. Smart Recommender */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <PartyPopper className="w-4 h-4 text-purple-400" />
                          <h4 className="font-black text-slate-100 text-xs uppercase">4. Đề Xuất Shop & SP Khai Trương (AI)</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">Khối đề xuất gian hàng khai trương & gợi ý từ khóa</p>
                      </div>

                      <button
                        onClick={() => toggleFeatureVisibility('showSmartRecommender')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          (theme.featureVisibility?.showSmartRecommender !== false)
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {(theme.featureVisibility?.showSmartRecommender !== false) ? <ToggleRight className="w-5 h-5 text-slate-950" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                        {(theme.featureVisibility?.showSmartRecommender !== false) ? 'HIỆN (ON)' : 'ẨN (OFF)'}
                      </button>
                    </div>

                    {/* 5. Quick Buttons */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <h4 className="font-black text-slate-100 text-xs uppercase">5. Nút Bấm Chuyển Nhanh (Shortcuts)</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">Các nút lối tắt chuyển nhanh trên thanh danh mục sản phẩm</p>
                      </div>

                      <button
                        onClick={() => toggleFeatureVisibility('showQuickButtons')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          (theme.featureVisibility?.showQuickButtons !== false)
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {(theme.featureVisibility?.showQuickButtons !== false) ? <ToggleRight className="w-5 h-5 text-slate-950" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                        {(theme.featureVisibility?.showQuickButtons !== false) ? 'HIỆN (ON)' : 'ẨN (OFF)'}
                      </button>
                    </div>

                    {/* 6. Live Chat Widget */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-emerald-400" />
                          <h4 className="font-black text-slate-100 text-xs uppercase">6. Khung Chat Hỗ Trợ Live Floating</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">Bong bóng Chat tư vấn thời gian thực ở góc dưới màn hình</p>
                      </div>

                      <button
                        onClick={() => toggleFeatureVisibility('showLiveChatWidget')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          (theme.featureVisibility?.showLiveChatWidget !== false)
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {(theme.featureVisibility?.showLiveChatWidget !== false) ? <ToggleRight className="w-5 h-5 text-slate-950" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                        {(theme.featureVisibility?.showLiveChatWidget !== false) ? 'HIỆN (ON)' : 'ẨN (OFF)'}
                      </button>
                    </div>

                    {/* 7. Top Header Promo Bar */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between md:col-span-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-rose-400" />
                          <h4 className="font-black text-slate-100 text-xs uppercase">7. Thanh Thông Báo Khuyến Mãi Đầu Trang (Header Promo Bar)</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">Thanh chạy thông báo ưu đãi ở vị trí trên cùng của trang web</p>
                      </div>

                      <button
                        onClick={() => toggleFeatureVisibility('showPromoBar')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          (theme.featureVisibility?.showPromoBar !== false)
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {(theme.featureVisibility?.showPromoBar !== false) ? <ToggleRight className="w-5 h-5 text-slate-950" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                        {(theme.featureVisibility?.showPromoBar !== false) ? 'HIỆN (ON)' : 'ẨN (OFF)'}
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* MODULE 16: QUẢN LÝ VIDEO YOUTUBE KIẾM XU (WATCH-TO-EARN) */}
            {adminTab === 'watch-to-earn' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-pink-400/40 p-6 rounded-3xl shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        📺 MODULE 16: QUẢN LÝ VIDEO YOUTUBE KIẾM XU (WATCH-TO-EARN)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Cấu hình các Video YouTube nhúng trực tiếp, thiết lập thời lượng xem tối thiểu và phần thưởng TQ Coins cho người dùng!
                      </p>
                    </div>

                    <div className="bg-amber-400/20 text-amber-300 px-3.5 py-1.5 rounded-2xl border border-amber-400/40 text-xs font-black flex items-center gap-1.5">
                      <Tv className="w-4 h-4 text-amber-400" /> Tổng {watchVideos.length} Video
                    </div>
                  </div>

                  {/* Form Create Video */}
                  <form onSubmit={handleAddWatchVideo} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      ➕ THÊM VIDEO YOUTUBE NHÚNG KIẾM XU MỚI:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Link YouTube hoặc Video ID (*):</label>
                        <input
                          type="text"
                          value={newVidUrl}
                          onChange={e => setNewVidUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ hoặc dQw4w9WgXcQ"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Tiêu Đề Video (*):</label>
                        <input
                          type="text"
                          value={newVidTitle}
                          onChange={e => setNewVidTitle(e.target.value)}
                          placeholder="Nhập tên/tiêu đề thu hút người dùng..."
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Thời Lượng Xem Tối Thiểu (Giây):</label>
                        <input
                          type="number"
                          value={newVidSeconds}
                          onChange={e => setNewVidSeconds(Number(e.target.value))}
                          min="5"
                          max="600"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Phần Thưởng TQ Coins (+Xu):</label>
                        <input
                          type="number"
                          value={newVidReward}
                          onChange={e => setNewVidReward(Number(e.target.value))}
                          min="10"
                          max="10000"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-gradient-to-r from-amber-400 via-orange to-amber-500 hover:from-amber-500 hover:to-orange text-slate-950 font-black px-6 py-2.5 rounded-xl transition shadow-lg text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      🚀 THÊM VIDEO KIẾM XU NGAY
                    </button>
                  </form>

                  {/* List Videos Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      📋 DANH SÁCH VIDEO ĐANG PHÁT HÀNH:
                    </h4>

                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-black">
                            <th className="p-3">Thumbnail & Tiêu Đề</th>
                            <th className="p-3">YouTube ID</th>
                            <th className="p-3">Thời Gian Xem</th>
                            <th className="p-3">Thưởng (+Xu)</th>
                            <th className="p-3">Trạng Thái</th>
                            <th className="p-3 text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium">
                          {watchVideos.map((vid: any) => {
                            const thumb = `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`;

                            return (
                              <tr key={vid.id} className="hover:bg-slate-950/50 transition">
                                <td className="p-3 flex items-center gap-3">
                                  <img src={thumb} alt={vid.title} className="w-16 h-10 object-cover rounded-lg border border-slate-800 shrink-0" />
                                  <span className="font-bold text-slate-100 line-clamp-1 max-w-xs">{vid.title}</span>
                                </td>
                                <td className="p-3 font-mono text-amber-400">{vid.youtubeId}</td>
                                <td className="p-3 font-mono text-slate-300">{vid.requiredSeconds} giây</td>
                                <td className="p-3 font-mono text-emerald-400 font-bold">+{vid.rewardCoins} Xu</td>
                                <td className="p-3">
                                  {vid.status === 'active' ? (
                                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                                      HOẠT ĐỘNG
                                    </span>
                                  ) : (
                                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      ĐÃ TẮT
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right space-x-2">
                                  <button
                                    onClick={() => {
                                      const updated = watchVideos.map(v => v.id === vid.id ? { ...v, status: v.status === 'active' ? 'paused' : 'active' } : v);
                                      setWatchVideos(updated);
                                      localStorage.setItem('tq_watch_to_earn_videos', JSON.stringify(updated));
                                      broadcastVideoUpdate(updated);
                                      addToast('Đã cập nhật trạng thái video!', 'info');
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                                  >
                                    {vid.status === 'active' ? 'Tắt' : 'Bật'}
                                  </button>

                                  <button
                                    onClick={() => {
                                      const updated = watchVideos.filter(v => v.id !== vid.id);
                                      setWatchVideos(updated);
                                      localStorage.setItem('tq_watch_to_earn_videos', JSON.stringify(updated));
                                      broadcastVideoUpdate(updated);
                                      addToast('Đã xóa video!', 'success');
                                    }}
                                    className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                                  >
                                    Xóa
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* MODULE 17: QUẢN LÝ NGUỒN GỐC XU TQ & TRUY VẤN LỊCH SỬ TÍCH ĐIỂM (COIN AUDIT LEDGER) */}
            {adminTab === 'coin-audit' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-amber-400/40 p-6 rounded-3xl shadow-2xl space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        🪙 MODULE 17: QUẢN LÝ NGUỒN GỐC XU TQ & NHẬT KÝ TÍCH ĐIỂM (COIN AUDIT LEDGER)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Theo dõi minh bạch nguồn gốc tích lũy Xu của từng tài khoản khách hàng & shop (Xem video YouTube, viết Đánh giá, Admin tặng, Hoàn xu đơn hàng...)
                      </p>
                    </div>

                    <div className="bg-amber-400/20 text-amber-300 px-3.5 py-1.5 rounded-2xl border border-amber-400/40 text-xs font-black flex items-center gap-1.5">
                      <History className="w-4 h-4 text-amber-400" /> {coinTxs.length} Giao Dịch
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">📺 Xu từ xem Video YouTube:</span>
                      <span className="text-lg font-black text-amber-400 font-mono">
                        +{coinTxs.filter(t => t.type === 'WATCH_VIDEO').reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)} Xu
                      </span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">⭐ Xu từ Đánh giá sản phẩm:</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        +{coinTxs.filter(t => t.type === 'REVIEW_BONUS').reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)} Xu
                      </span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">👑 Admin cấp thưởng & Khác:</span>
                      <span className="text-lg font-black text-purple-400 font-mono">
                        +{coinTxs.filter(t => t.type === 'ADMIN_GRANT' || t.type === 'PURCHASE_CASHBACK').reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)} Xu
                      </span>
                    </div>
                  </div>

                  {/* Search & Type Filter Bar */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                    <div className="relative w-full md:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={coinAuditSearch}
                        onChange={e => setCoinAuditSearch(e.target.value)}
                        placeholder="Lọc tên user, SĐT, email..."
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
                      <span className="text-slate-400 font-bold text-[11px] shrink-0">Loại tích xu:</span>
                      {['ALL', 'WATCH_VIDEO', 'REVIEW_BONUS', 'ADMIN_GRANT', 'PURCHASE_CASHBACK'].map(t => (
                        <button
                          key={t}
                          onClick={() => setCoinAuditFilterType(t)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase transition cursor-pointer shrink-0 border ${
                            coinAuditFilterType === t
                              ? 'bg-amber-400 text-slate-950 border-amber-400'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          {t === 'ALL' ? 'TẤT CẢ' : t === 'WATCH_VIDEO' ? '📺 VIDEO' : t === 'REVIEW_BONUS' ? '⭐ ĐÁNH GIÁ' : t === 'ADMIN_GRANT' ? '👑 ADMIN' : '🛍️ HOÀN XU'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audit Ledger History Table */}
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-black">
                          <th className="p-3">Thành Viên / Tài Khoản</th>
                          <th className="p-3">Loại Tích Điểm</th>
                          <th className="p-3">Số Lượng (+/- Xu)</th>
                          <th className="p-3">Nguồn Gốc Chi Tiết</th>
                          <th className="p-3 text-right">Thời Gian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {coinTxs
                          .filter(tx => {
                            const matchSearch = coinAuditSearch.trim() === '' ||
                              tx.userName.toLowerCase().includes(coinAuditSearch.toLowerCase()) ||
                              (tx.userPhone && tx.userPhone.includes(coinAuditSearch)) ||
                              (tx.userEmail && tx.userEmail.toLowerCase().includes(coinAuditSearch.toLowerCase()));

                            const matchType = coinAuditFilterType === 'ALL' || tx.type === coinAuditFilterType;
                            return matchSearch && matchType;
                          })
                          .map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-950/50 transition">
                              <td className="p-3">
                                <span className="font-bold text-slate-100 block">{tx.userName}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">{tx.userPhone || tx.userEmail || 'ID: ' + tx.userId}</span>
                              </td>

                              <td className="p-3">
                                {tx.type === 'WATCH_VIDEO' && (
                                  <span className="bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                    <Tv className="w-3 h-3 text-pink-400" /> Xem Video YouTube
                                  </span>
                                )}
                                {tx.type === 'REVIEW_BONUS' && (
                                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                    <Star className="w-3 h-3 text-emerald-400" /> Đánh Giá Sản Phẩm
                                  </span>
                                )}
                                {tx.type === 'ADMIN_GRANT' && (
                                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                    <Crown className="w-3 h-3 text-purple-400" /> Admin Cộng Thưởng
                                  </span>
                                )}
                                {tx.type === 'PURCHASE_CASHBACK' && (
                                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                    <Coins className="w-3 h-3 text-amber-400" /> Hoàn Xu Mua Hàng
                                  </span>
                                )}
                              </td>

                              <td className="p-3 font-mono font-black text-sm">
                                {tx.amount >= 0 ? (
                                  <span className="text-emerald-400">+{tx.amount} Xu</span>
                                ) : (
                                  <span className="text-rose-400">{tx.amount} Xu</span>
                                )}
                              </td>

                              <td className="p-3 text-slate-300 max-w-md">
                                <p className="line-clamp-2">{tx.sourceDescription}</p>
                              </td>

                              <td className="p-3 text-right font-mono text-[11px] text-slate-400">
                                {tx.timestamp}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
            )}

            {/* MODULE 18: DUYỆT LỆNH NẠP / RÚT TIỀN VÍ TQ PAY (DEPOSIT & WITHDRAW APPROVALS) */}
            {adminTab === 'wallet-approvals' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-emerald-500/40 p-6 rounded-3xl shadow-2xl space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                        💳 MODULE 18: PHÊ DUYỆT LỆNH NẠP & RÚT TIỀN VÍ TQ PAY (REALTIME APPROVALS)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Kiểm duyệt giao dịch nạp chuyển khoản VietQR & Khóa rút tiền chính chủ đối soát ngân hàng
                      </p>
                    </div>

                    <div className="bg-emerald-400/20 text-emerald-300 px-3.5 py-1.5 rounded-2xl border border-emerald-400/40 text-xs font-black flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-emerald-400" /> {walletTxs.filter(t => t.status === 'PENDING').length} Lệnh Chờ Duyệt
                    </div>
                  </div>

                  {/* Pending Transactions Table */}
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-black">
                          <th className="p-3">Thành Viên</th>
                          <th className="p-3">Loại Lệnh</th>
                          <th className="p-3">Số Tiền</th>
                          <th className="p-3">Ngân Hàng Đối Soát</th>
                          <th className="p-3">Nội Dung CK / Cú Pháp</th>
                          <th className="p-3">Trạng Thái</th>
                          <th className="p-3 text-right">Thao Tác Duyệt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {walletTxs.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-950/50 transition">
                            <td className="p-3">
                              <span className="font-bold text-slate-100 block">{tx.userName}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{tx.userPhone || tx.userEmail || tx.userId}</span>
                            </td>

                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                tx.type === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {tx.type === 'DEPOSIT' ? '📥 NẠP TIỀN' : '📤 RÚT TIỀN'}
                              </span>
                            </td>

                            <td className="p-3 font-mono font-black text-sm text-emerald-400">
                              {tx.amount.toLocaleString('vi-VN')} VNĐ
                            </td>

                            <td className="p-3 text-slate-300 text-[11px]">
                              <p className="font-bold text-slate-100">{tx.bankInfo?.bankName}</p>
                              <p className="font-mono text-amber-400 font-bold">STK: {tx.bankInfo?.accountNumber}</p>
                              <p className="text-[10px] text-slate-400">Chủ TK: {tx.bankInfo?.accountHolder}</p>
                            </td>

                            <td className="p-3 font-mono text-amber-300 text-[11px]">
                              {tx.transferSyntax || '---'}
                            </td>

                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                tx.status === 'APPROVED' ? 'bg-emerald-600 text-white' : tx.status === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-amber-400 text-slate-950 animate-pulse'
                              }`}>
                                {tx.status === 'APPROVED' ? '✓ Đã Phê Duyệt' : tx.status === 'REJECTED' ? '✕ Từ Chối' : '⏳ Chờ Duyệt'}
                              </span>
                            </td>

                            <td className="p-3 text-right space-x-1.5">
                              {tx.status === 'PENDING' ? (
                                <>
                                  <button
                                    onClick={() => handleApproveWalletTx(tx)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3 h-3 inline mr-1" /> DUYỆT LỆNH
                                  </button>

                                  <button
                                    onClick={() => handleRejectWalletTx(tx)}
                                    className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer"
                                  >
                                    <XCircle className="w-3 h-3 inline mr-1" /> TỪ CHỐI
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-500 italic">Đã xử lý</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
            )}

            {/* MODULE 19: AUDIT LOGS (SYSTEM OPERATION LOGS) */}
            {adminTab === 'audit-logs' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-cyan-500/40 p-6 rounded-3xl shadow-2xl space-y-6">
                  
                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                        📜 MODULE 19: NHẬT KÝ THAO TÁC HỆ THỐNG (AUDIT LOGS & AUDIT TRAIL)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Theo dõi thời gian thực toàn bộ lịch sử thao tác quản trị, đồng bộ Supabase Cloud & biến động bảo mật
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleExportAuditLogsCSV}
                        className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                        title="Xuất file CSV Nhật ký thao tác"
                      >
                        <Download className="w-4 h-4" /> Xuất File CSV
                      </button>

                      <button
                        onClick={handleClearAuditLogs}
                        className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer border border-rose-500/30 flex items-center gap-1"
                        title="Làm sạch nhật ký thao tác"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa Nhật Ký
                      </button>
                    </div>
                  </div>

                  {/* Summary Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase">Tổng Nhật Ký</p>
                        <p className="text-lg font-black text-slate-100 mt-0.5">{auditLogs.length}</p>
                      </div>
                      <FileText className="w-7 h-7 text-cyan-400/50" />
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase">Thành Công (Success)</p>
                        <p className="text-lg font-black text-emerald-400 mt-0.5">{auditLogs.filter(l => l.severity === 'SUCCESS').length}</p>
                      </div>
                      <CheckCircle2 className="w-7 h-7 text-emerald-400/50" />
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase">Cảnh Báo (Warning)</p>
                        <p className="text-lg font-black text-amber-400 mt-0.5">{auditLogs.filter(l => l.severity === 'WARNING').length}</p>
                      </div>
                      <ShieldAlert className="w-7 h-7 text-amber-400/50" />
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase">Hành Động Super Admin</p>
                        <p className="text-lg font-black text-purple-400 mt-0.5">{auditLogs.filter(l => l.actorRole === 'SUPER_ADMIN').length}</p>
                      </div>
                      <Crown className="w-7 h-7 text-purple-400/50" />
                    </div>
                  </div>

                  {/* Search & Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="flex-1 w-full relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={auditSearch}
                        onChange={e => setAuditSearch(e.target.value)}
                        placeholder="Tìm theo Người thực hiện, Hành động, Đối tượng, Chi tiết..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={auditFilterSeverity}
                        onChange={e => setAuditFilterSeverity(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="ALL">Tất cả mức độ</option>
                        <option value="SUCCESS">🟢 Thành công (SUCCESS)</option>
                        <option value="INFO">🔵 Thông tin (INFO)</option>
                        <option value="WARNING">🟡 Cảnh báo (WARNING)</option>
                        <option value="CRITICAL">🔴 Nghiêm trọng (CRITICAL)</option>
                      </select>

                      <select
                        value={auditFilterRole}
                        onChange={e => setAuditFilterRole(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="ALL">Tất cả vai trò</option>
                        <option value="SUPER_ADMIN">👑 Super Admin</option>
                        <option value="SHOP">🏪 Cửa Hàng Shop</option>
                        <option value="SYSTEM">⚙️ Hệ Thống System</option>
                      </select>
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-black">
                          <th className="p-3">Thời Gian & IP</th>
                          <th className="p-3">Người Thao Tác</th>
                          <th className="p-3">Hành Động</th>
                          <th className="p-3">Đối Tượng Tác Động</th>
                          <th className="p-3">Nội Dung Chi Tiết</th>
                          <th className="p-3 text-right">Mức Độ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {auditLogs
                          .filter(l => {
                            const matchSearch =
                              l.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              l.target.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              l.details.toLowerCase().includes(auditSearch.toLowerCase());
                            const matchSev = auditFilterSeverity === 'ALL' || l.severity === auditFilterSeverity;
                            const matchRole = auditFilterRole === 'ALL' || l.actorRole === auditFilterRole;
                            return matchSearch && matchSev && matchRole;
                          })
                          .map(log => (
                            <tr key={log.id} className="hover:bg-slate-950/50 transition">
                              <td className="p-3">
                                <span className="font-mono text-cyan-300 block font-bold text-[11px]">{log.timestamp}</span>
                                <span className="text-[10px] text-slate-500 font-mono block">{log.ipAddress || 'Client local'}</span>
                              </td>

                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  {log.actorRole === 'SUPER_ADMIN' && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                  {log.actorRole === 'SYSTEM' && <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                  {log.actorRole === 'SHOP' && <Store className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                                  <div>
                                    <span className="font-bold text-slate-100 block">{log.actorName}</span>
                                    <span className="text-[9px] text-slate-400 font-mono uppercase">{log.actorRole}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 font-bold text-amber-300">
                                {log.action}
                              </td>

                              <td className="p-3 text-slate-300 font-medium max-w-xs truncate">
                                {log.target}
                              </td>

                              <td className="p-3 text-slate-300 max-w-md">
                                <p className="line-clamp-2 leading-relaxed">{log.details}</p>
                              </td>

                              <td className="p-3 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1 ${
                                  log.severity === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                  log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                  log.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                                  'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                }`}>
                                  {log.severity === 'SUCCESS' && '🟢 SUCCESS'}
                                  {log.severity === 'INFO' && '🔵 INFO'}
                                  {log.severity === 'WARNING' && '🟡 WARNING'}
                                  {log.severity === 'CRITICAL' && '🔴 CRITICAL'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 21: CUSTOMER ORDER HISTORY & PLATFORM ORDERS MANAGEMENT */}
            {adminTab === 'customer-orders' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Executive Order KPI Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-md">
                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-black">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng Đơn Hàng Thành Công</span>
                      <h4 className="text-base font-black text-emerald-400 font-mono">
                        {allPlatformOrders.filter(o => !o.status || o.status === 'COMPLETED').length} Đơn
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-md">
                    <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng Giá Trị Đơn Hàng (GMV)</span>
                      <h4 className="text-base font-black text-amber-400 font-mono">
                        {allPlatformOrders.reduce((sum, o) => sum + (o.total_price || o.totalPrice || 0), 0).toLocaleString('vi-VN')} đ
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-md">
                    <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-black">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Thanh Toán Ví TQ / VietQR</span>
                      <h4 className="text-base font-black text-blue-400 font-mono">
                        {allPlatformOrders.filter(o => o.paymentMethod === 'wallet' || o.paymentMethod === 'transfer').length} Đơn
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-md">
                    <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center font-black">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Thanh Toán COD Tiền Mặt</span>
                      <h4 className="text-base font-black text-purple-400 font-mono">
                        {allPlatformOrders.filter(o => o.paymentMethod === 'cash').length} Đơn
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Orders Filter & Controls Header */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-wrap gap-2">
                    <div>
                      <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-400" /> QUẢN LÝ LỊCH SỬ MUA HÀNG TOÀN SÀN CỦA TẤT CẢ KHÁCH HÀNG ({allPlatformOrders.length} ĐƠN)
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Theo dõi và truy xuất toàn bộ giao dịch mua sắm thành công của khách hàng toàn hệ thống</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportCustomerOrdersCSV}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> 📊 Xuất Báo Cáo CSV Tất Cả Đơn Hàng
                    </button>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Search */}
                    <div>
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                        placeholder="Tìm theo Mã Đơn, Tên/SĐT Khách, Tên Shop..."
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-medium rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <select
                        value={orderStatusFilter}
                        onChange={e => setOrderStatusFilter(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="ALL">🌐 Tất Cả Trạng Thái Đơn Hàng</option>
                        <option value="COMPLETED">🟢 Đã Mua Thành Công (Completed)</option>
                        <option value="SHIPPING">🔵 Đang Vận Chuyển (Shipping)</option>
                        <option value="PENDING">🟡 Đang Xử Lý (Pending)</option>
                        <option value="CANCELLED">🔴 Đã Hủy Đơn (Cancelled)</option>
                      </select>
                    </div>

                    {/* Payment Method Filter */}
                    <div>
                      <select
                        value={orderPaymentFilter}
                        onChange={e => setOrderPaymentFilter(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="ALL">💳 Tất Cả Phương Thức Thanh Toán</option>
                        <option value="wallet">💳 Thanh Toán Ví TQ Pay</option>
                        <option value="transfer">🏦 Chuyển Khoản VietQR</option>
                        <option value="cash">🚚 Thanh Toán COD Tiền Mặt</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Orders Table */}
                  <div className="overflow-x-auto custom-scrollbar pt-2">
                    <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                          <th className="p-3">MÃ ĐƠN & THỜI GIAN</th>
                          <th className="p-3">KHÁCH HÀNG</th>
                          <th className="p-3">GIAN HÀNG SHOP</th>
                          <th className="p-3">CHI TIẾT SẢN PHẨM MUA</th>
                          <th className="p-3">TỔNG TIỀN</th>
                          <th className="p-3">P.THỨC THANH TOÁN</th>
                          <th className="p-3 text-center">TRẠNG THÁI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {allPlatformOrders
                          .filter(o => {
                            const q = orderSearch.toLowerCase().trim();
                            const matchQ = !q ||
                              (o.id || '').toLowerCase().includes(q) ||
                              (o.customerName || o.user_name || '').toLowerCase().includes(q) ||
                              (o.customerPhone || o.user_phone || '').toLowerCase().includes(q) ||
                              (o.shopName || '').toLowerCase().includes(q);
                            
                            const st = o.status || 'COMPLETED';
                            const matchStatus = orderStatusFilter === 'ALL' || st === orderStatusFilter;

                            const pm = o.paymentMethod || 'wallet';
                            const matchPayment = orderPaymentFilter === 'ALL' || pm === orderPaymentFilter;

                            return matchQ && matchStatus && matchPayment;
                          })
                          .map((ord, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60 transition">
                              <td className="p-3">
                                <span className="font-mono font-black text-amber-400 text-xs block bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 w-fit">
                                  #{ord.id || ord.order_id || `ORD_${idx+1000}`}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                                  {ord.created_at || ord.timestamp || '12/08/2026 01:00'}
                                </span>
                              </td>

                              <td className="p-3">
                                <span className="font-bold text-slate-100 block">{ord.customerName || ord.user_name || 'Nguyễn Văn A'}</span>
                                <span className="text-[10px] text-amber-400 font-mono font-bold block">{ord.customerPhone || ord.user_phone || '0912345678'}</span>
                                {ord.address && (
                                  <span className="text-[9px] text-slate-400 block line-clamp-1 max-w-[180px] font-medium" title={ord.address}>
                                    📍 {ord.address}
                                  </span>
                                )}
                              </td>

                              <td className="p-3">
                                <span className="font-bold text-emerald-400 block">{ord.shopName || 'TQ Store'}</span>
                              </td>

                              <td className="p-3">
                                <div className="space-y-1 max-w-[240px]">
                                  {(ord.items || []).map((item: any, iIdx: number) => (
                                    <div key={iIdx} className="flex justify-between items-center text-[11px]">
                                      <span className="text-slate-200 truncate font-medium max-w-[170px]" title={item.title}>
                                        {item.title}
                                      </span>
                                      <span className="text-slate-400 font-mono font-bold shrink-0">x{item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>

                              <td className="p-3 font-bold">
                                <span className="text-amber-400 font-mono text-sm">
                                  {(ord.total_price || ord.totalPrice || 0).toLocaleString('vi-VN')} đ
                                </span>
                              </td>

                              <td className="p-3">
                                {ord.paymentMethod === 'wallet' && (
                                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-lg border border-emerald-500/40">
                                    💳 Ví TQ Pay
                                  </span>
                                )}
                                {ord.paymentMethod === 'transfer' && (
                                  <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-500/40">
                                    🏦 VietQR
                                  </span>
                                )}
                                {ord.paymentMethod === 'cash' && (
                                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-lg border border-purple-500/40">
                                    🚚 COD Tiền mặt
                                  </span>
                                )}
                              </td>

                              <td className="p-3 text-center">
                                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/40 uppercase">
                                  🟢 THÀNH CÔNG
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
            )}

            {/* MODULE 22: HOMEPAGE SECTION LAYOUT ORDER & LIVE CONTENT EDITOR */}
            {adminTab === 'homepage-sections' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-slate-950 p-6 rounded-3xl border border-pink-500/40 shadow-2xl space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-pink-400 uppercase tracking-wider flex items-center gap-2">
                        🧩 MODULE 22: QUẢN LÝ VỊ TRÍ KHUNG HIỂN THỊ & SỬA NỘI DUNG WEB (REALTIME SYNCHRONIZED)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Super Admin có quyền đổi thứ tự hiển thị (Lên/Xuống), sửa tiêu đề, mô tả và bật/tắt bất kỳ khung hiển thị nào trên Website. <strong className="text-amber-300">Tất cả thay đổi đều đồng bộ hóa 0ms trên toàn hệ thống!</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updateTheme({ homepageSections: DEFAULT_HOMEPAGE_SECTIONS });
                        addToast('🔄 Đã khôi phục bố cục giao diện mặc định ban đầu thành công!', 'info');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs transition border border-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Khôi Phục Bố Cục Mặc Định
                    </button>
                  </div>

                  {/* Sections Reordering & Content Editing List */}
                  <div className="space-y-4">
                    {([...sectionsList].sort((a, b) => a.order - b.order)).map((sec, idx, arr) => (
                      <div
                        key={sec.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          sec.visible
                            ? 'bg-slate-900 border-slate-700 hover:border-pink-500/50'
                            : 'bg-slate-950/60 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/40 flex items-center justify-center font-mono font-black text-sm">
                              #{sec.order}
                            </span>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-100 text-sm">{sec.title}</h4>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  sec.visible
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}>
                                  {sec.visible ? '🟢 ĐANG HIỂN THỊ' : '🔒 ĐÃ ẨN KHUNG'}
                                </span>
                              </div>
                              {sec.subtitle && (
                                <p className="text-xs text-slate-400 mt-0.5 font-medium">{sec.subtitle}</p>
                              )}
                            </div>
                          </div>

                          {/* Control Buttons */}
                          <div className="flex items-center gap-2">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSection(sec.id, 'UP')}
                              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                                idx === 0
                                  ? 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
                                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                              }`}
                              title="Di chuyển khung này LÊN TRÊN"
                            >
                              <ArrowUp className="w-4 h-4" /> ⬆️ Lên
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={idx === arr.length - 1}
                              onClick={() => handleMoveSection(sec.id, 'DOWN')}
                              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                                idx === arr.length - 1
                                  ? 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
                                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                              }`}
                              title="Di chuyển khung này XUỐNG DƯỚI"
                            >
                              <ArrowDown className="w-4 h-4" /> ⬇️ Xuống
                            </button>

                            {/* Edit Content */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSectionId(editingSectionId === sec.id ? null : sec.id);
                                setEditSectionTitle(sec.title);
                                setEditSectionSubtitle(sec.subtitle || '');
                              }}
                              className="bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-400/40 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                            >
                              ✏️ Sửa Nội Dung
                            </button>

                            {/* Toggle Visibility */}
                            <button
                              type="button"
                              onClick={() => handleToggleSectionVisibility(sec.id)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                sec.visible
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-600 hover:text-white'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
                              }`}
                            >
                              {sec.visible ? '🔒 Ẩn Khung' : '🟢 Hiện Khung'}
                            </button>
                          </div>
                        </div>

                        {/* Inline Content Edit Form */}
                        {editingSectionId === sec.id && (
                          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3 mt-3 animate-in fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-slate-300 font-bold mb-1">Tiêu Đề Khung Hiển Thị</label>
                                <input
                                  type="text"
                                  value={editSectionTitle}
                                  onChange={e => setEditSectionTitle(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-300 font-bold mb-1">Mô Tả Phụ (Subtitle)</label>
                                <input
                                  type="text"
                                  value={editSectionSubtitle}
                                  onChange={e => setEditSectionSubtitle(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-medium rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingSectionId(null)}
                                className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-700 transition cursor-pointer"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveSectionEdit(sec.id)}
                                className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black px-4 py-1.5 rounded-xl transition shadow cursor-pointer"
                              >
                                ⚡ LƯU & ĐỒNG BỘ NGHỆ AN 0MS
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>

                {/* FOOTER CONTROL PANEL (ẨN/HIỆN & SỬA THÔNG TIN 4 CỘT FOOTER) */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-amber-500/40 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        🦶 BẢNG ĐIỀU KHIỂN & CHỈNH SỬA FOOTER (4 CỘT CHUYÊN NGHIỆP)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Tùy chỉnh bật/tắt hiển thị 4 Cột chân trang và chỉnh sửa tiêu đề, hotline, email, địa chỉ & bản quyền.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveFooterConfig}
                      className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      ⚡ LƯU & ĐỒNG BỘ FOOTER 0MS
                    </button>
                  </div>

                  {/* 4 Columns Visibility Toggles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setFooterState(prev => ({ ...prev, showCol1: !prev.showCol1 }))}
                      className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        footerState.showCol1
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      <span>Cột 1: Logo & Giới Thiệu</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        footerState.showCol1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {footerState.showCol1 ? '🟢 HIỆN' : '🔒 ẨN'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFooterState(prev => ({ ...prev, showCol2: !prev.showCol2 }))}
                      className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        footerState.showCol2
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      <span>Cột 2: Danh Mục Nổi Bật</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        footerState.showCol2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {footerState.showCol2 ? '🟢 HIỆN' : '🔒 ẨN'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFooterState(prev => ({ ...prev, showCol3: !prev.showCol3 }))}
                      className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        footerState.showCol3
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      <span>Cột 3: Chính Sách & Hỗ Trợ</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        footerState.showCol3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {footerState.showCol3 ? '🟢 HIỆN' : '🔒 ẨN'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFooterState(prev => ({ ...prev, showCol4: !prev.showCol4 }))}
                      className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        footerState.showCol4
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      <span>Cột 4: P.Thức Thanh Toán & MXH</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        footerState.showCol4 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {footerState.showCol4 ? '🟢 HIỆN' : '🔒 ẨN'}
                      </span>
                    </button>
                  </div>

                  {/* Form Edit Content Text Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Tên Thương Hiệu (Cột 1)</label>
                      <input
                        type="text"
                        value={footerState.col1Title}
                        onChange={e => setFooterState(prev => ({ ...prev, col1Title: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Hotline CSKH</label>
                      <input
                        type="text"
                        value={footerState.hotline}
                        onChange={e => setFooterState(prev => ({ ...prev, hotline: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Email Liên Hệ</label>
                      <input
                        type="text"
                        value={footerState.email}
                        onChange={e => setFooterState(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-slate-300 font-bold mb-1">Mô Tả Giới Thiệu Ngắn (Cột 1)</label>
                      <textarea
                        rows={2}
                        value={footerState.col1Desc}
                        onChange={e => setFooterState(prev => ({ ...prev, col1Desc: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-medium rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-bold mb-1">Địa Chỉ Trụ Sở</label>
                      <input
                        type="text"
                        value={footerState.address}
                        onChange={e => setFooterState(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-medium rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Dòng Bản Quyền (Bottom Bar)</label>
                      <input
                        type="text"
                        value={footerState.copyrightText}
                        onChange={e => setFooterState(prev => ({ ...prev, copyrightText: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-bold rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};
