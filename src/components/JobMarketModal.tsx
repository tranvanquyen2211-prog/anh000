import React, { useState } from 'react';
import { X, Search, PlusCircle, MessageCircle, Phone, MapPin, ChevronLeft, Building2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export interface JobPosting {
  id: string;
  title: string;
  shopName: string;
  contactName: string;
  phone: string;
  email?: string;
  salary: string;
  jobType: 'Full-time' | 'Part-time' | 'Ca xoay' | 'Theo giờ';
  category: 'Bán hàng' | 'Phục vụ / F&B' | 'Giao hàng' | 'Spa / Beauty' | 'Thời trang' | 'Khác';
  location: string;
  quantity: number;
  description: string;
  createdAt: string;
}

const DEFAULT_MOCK_JOBS: JobPosting[] = [
  {
    id: 'job_1',
    title: 'Tuyển 03 Nhân Viên Phục Vụ Quán Trà Sữa TQ',
    shopName: 'TQ Tea & Coffee Studio',
    contactName: 'Chị Mai - Quản Lý',
    phone: '0988123456',
    salary: '7.500.000đ - 9.500.000đ/tháng',
    jobType: 'Ca xoay',
    category: 'Phục vụ / F&B',
    location: 'Quận 1, TP. Hồ Chí Minh',
    quantity: 3,
    description: 'Pha chế trà sữa, dọn dẹp quán, nhận order khách hàng. Thưởng hoa hồng theo doanh số bán hàng.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'job_2',
    title: 'Tuyển Kỹ Thuật Viên Spa & Chăm Sóc Da Chuyên Nghiệp',
    shopName: 'TQ Beauty & Spa Clinic',
    contactName: 'Anh Tuấn - Giám Đốc',
    phone: '0912345678',
    salary: '12.000.000đ - 18.000.000đ/tháng',
    jobType: 'Full-time',
    category: 'Spa / Beauty',
    location: 'Cầu Giấy, Hà Nội',
    quantity: 2,
    description: 'Thực hiện chăm sóc da mặt, massage body cho khách hàng. Cần 1 năm kinh nghiệm trở lên.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'job_3',
    title: 'Tuyển Nhân Viên Tư Vấn Cho Thuê Váy Cưới & Trang Phục',
    shopName: 'TQ Rental Studio Fashion',
    contactName: 'Chị Thảo - Chủ Shop',
    phone: '0905999888',
    salary: '8.000.000đ + % Phụ Cấp',
    jobType: 'Full-time',
    category: 'Thời trang',
    location: 'Hải Châu, Đà Nẵng',
    quantity: 4,
    description: 'Tư vấn thử váy cưới, đồ dạ hội, quản lý kho trang phục. Môi trường làm việc năng động, sáng tạo.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'job_4',
    title: 'Tuyển Tài Xế Taxi & Giao Hàng Bằng Xe Máy',
    shopName: 'Hội Tài Xế TQ Express',
    contactName: 'Anh Hùng - Đội Trưởng',
    phone: '0367818343',
    salary: '10.000.000đ - 15.000.000đ/tháng',
    jobType: 'Theo giờ',
    category: 'Giao hàng',
    location: 'Toàn Quốc (Chủ động khu vực)',
    quantity: 10,
    description: 'Chạy xe đón trả khách hàng và giao hàng nhanh. Nhận tiền ngay theo ngày qua Ví TQ Pay.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

interface JobMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectChat?: (shopName: string, shopPhone: string, jobTitle: string) => void;
}

export const JobMarketModal: React.FC<JobMarketModalProps> = ({
  isOpen,
  onClose,
  onOpenDirectChat
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Screen modes: 'SELECT' | 'FIND_JOB' | 'POST_JOB'
  const [mode, setMode] = useState<'SELECT' | 'FIND_JOB' | 'POST_JOB'>('SELECT');

  // Job List State
  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    const saved = localStorage.getItem('tq_job_postings');
    return saved ? JSON.parse(saved) : DEFAULT_MOCK_JOBS;
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Post Job Form Inputs
  const [postTitle, setPostTitle] = useState('');
  const [postShopName, setPostShopName] = useState(user?.name || '');
  const [postContactName, setPostContactName] = useState(user?.name || '');
  const [postPhone, setPostPhone] = useState(user?.phone || '');
  const [postSalary, setPostSalary] = useState('');
  const [postJobType, setPostJobType] = useState<JobPosting['jobType']>('Full-time');
  const [postCategory, setPostCategory] = useState<JobPosting['category']>('Bán hàng');
  const [postLocation, setPostLocation] = useState('');
  const [postQuantity, setPostQuantity] = useState<number>(1);
  const [postDescription, setPostDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat message popup inside Job modal
  const [activeChatJob, setActiveChatJob] = useState<JobPosting | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');

  if (!isOpen) return null;

  const handleCreateJobPosting = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!postTitle || !postShopName || !postPhone || !postSalary || !postLocation || !postDescription) {
      addToast('Vui lòng điền đầy đủ các thông tin tuyển dụng bắt buộc!', 'error');
      setIsSubmitting(false);
      return;
    }

    const newJob: JobPosting = {
      id: `job_${Date.now()}`,
      title: postTitle,
      shopName: postShopName,
      contactName: postContactName || postShopName,
      phone: postPhone,
      salary: postSalary,
      jobType: postJobType,
      category: postCategory,
      location: postLocation,
      quantity: postQuantity,
      description: postDescription,
      createdAt: new Date().toISOString()
    };

    const updated = [newJob, ...jobs];
    setJobs(updated);
    localStorage.setItem('tq_job_postings', JSON.stringify(updated));

    addToast('🎉 Đăng bài tuyển người làm thành công! Khách hàng có thể tìm và nhắn tin ứng tuyển ngay.', 'success');
    
    // Reset inputs & switch to FIND_JOB list view
    setPostTitle('');
    setPostSalary('');
    setPostDescription('');
    setIsSubmitting(false);
    setMode('FIND_JOB');
  };

  const handleSendApplicantMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatJob) return;

    if (onOpenDirectChat) {
      onOpenDirectChat(activeChatJob.shopName, activeChatJob.phone, activeChatJob.title);
    } else {
      addToast(`💬 Đã gửi tin nhắn tới người tuyển dụng [${activeChatJob.contactName}] (${activeChatJob.phone}) thành công!`, 'success');
    }

    setActiveChatJob(null);
    setChatMessageText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full p-5 sm:p-7 relative border border-slate-800 text-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            {mode !== 'SELECT' && (
              <button
                type="button"
                onClick={() => setMode('SELECT')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl border border-slate-700 transition cursor-pointer"
                title="Quay lại chọn Tuyển người / Tìm việc"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                💼 TIỆN ÍCH VIỆC LÀM & TUYỂN DỤNG TQ
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kênh kết nối trực tiếp Nhà Tuyển Dụng & Người Tìm Việc 24/7
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full border border-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==================== SCREEN 1: SELECTION SCREEN ==================== */}
        {mode === 'SELECT' && (
          <div className="py-6 sm:py-10 px-2 space-y-8 overflow-y-auto custom-scrollbar">
            
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-block">
                HỆ THỐNG VIỆC LÀM ĐA NGÀNH NGHỀ
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Bạn đang Tuyển Người hay Tìm Việc?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Vui lòng chọn nhu cầu của bạn bên dưới để chuyển tiếp sang danh sách tuyển dụng hoặc form đăng bài:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              
              {/* Option A: FIND JOB */}
              <div
                onClick={() => setMode('FIND_JOB')}
                className="bg-slate-950 hover:bg-slate-800/80 border-2 border-cyan-500/40 hover:border-cyan-400 p-6 rounded-3xl transition-all cursor-pointer group shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/40 flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform">
                    🔍
                  </div>
                  <div>
                    <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-cyan-500/30 mb-2 inline-block">
                      Hơn 50+ Vị Trí Tuyển Dụng
                    </span>
                    <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                      TÔI MUỐN TÌM VIỆC LÀM
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Xem danh sách bài đăng tuyển người, chi tiết mức lương, hình thức làm việc và <strong>nhắn tin trực tiếp với người tuyển dụng</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md">
                    <Search className="w-4 h-4" /> Xem Bài Đăng Tuyển Việc
                  </span>
                </div>
              </div>

              {/* Option B: POST JOB */}
              <div
                onClick={() => setMode('POST_JOB')}
                className="bg-slate-950 hover:bg-slate-800/80 border-2 border-amber-500/40 hover:border-amber-400 p-6 rounded-3xl transition-all cursor-pointer group shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40 flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform">
                    📢
                  </div>
                  <div>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-amber-500/30 mb-2 inline-block">
                      Đăng Bài Miễn Phí 24/7
                    </span>
                    <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                      TÔI ĐĂNG TUYỂN NGUỜI LÀM
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Điền form thông tin bài tuyển dụng, mức lương, địa điểm làm việc & nhận tin nhắn ứng tuyển trực tiếp từ ứng viên.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md">
                    <PlusCircle className="w-4 h-4" /> Đăng Bài Tuyển Dụng Ngay
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== SCREEN 2: FIND JOB LIST ==================== */}
        {mode === 'FIND_JOB' && (
          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1">
            
            {/* Action Top Bar & Category Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Tìm việc theo tên vị trí, cửa hàng hoặc địa điểm..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setMode('POST_JOB')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <PlusCircle className="w-4 h-4" /> Đăng Tuyển Người
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {['ALL', 'Bán hàng', 'Phục vụ / F&B', 'Giao hàng', 'Spa / Beauty', 'Thời trang', 'Khác'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? '✨ Tất Cả Ngành Nghề' : cat}
                </button>
              ))}
            </div>

            {/* Job Postings Grid */}
            <div className="space-y-3 pt-1">
              {jobs
                .filter(j => {
                  const matchCat = selectedCategoryFilter === 'ALL' || j.category === selectedCategoryFilter;
                  const q = searchQuery.toLowerCase().trim();
                  const matchQ = !q ||
                    j.title.toLowerCase().includes(q) ||
                    j.shopName.toLowerCase().includes(q) ||
                    j.location.toLowerCase().includes(q);
                  return matchCat && matchQ;
                })
                .map((job, idx) => (
                  <div
                    key={job.id || idx}
                    className="bg-slate-950 hover:bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                            {job.category}
                          </span>
                          <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            🕒 {job.jobType}
                          </span>
                          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            👥 Tuyển {job.quantity} người
                          </span>
                        </div>
                        <h4 className="text-base font-black text-white hover:text-amber-300 transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" /> {job.shopName}
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 font-normal">Liên hệ: {job.contactName}</span>
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-sm sm:text-base font-black text-emerald-400 font-mono block">
                          {job.salary}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center sm:justify-end gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {job.location}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                      {job.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[10px] font-mono text-slate-500">
                        Đăng lúc: {new Date(job.createdAt).toLocaleString('vi-VN')}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Direct Chat with Employer Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChatJob(job);
                            setChatMessageText(`Xin chào! Tôi quan tâm đến vị trí tuyển dụng "${job.title}". Bạn còn tuyển không ạ?`);
                          }}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                        >
                          <MessageCircle className="w-4 h-4" /> 💬 Nhắn Tin Với Người Tuyển
                        </button>

                        {/* Direct Call / Contact Button */}
                        <a
                          href={`tel:${job.phone}`}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                          title={`Gọi điện ngay cho ${job.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" /> {job.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* ==================== SCREEN 3: POST JOB FORM ==================== */}
        {mode === 'POST_JOB' && (
          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1">
            <div className="bg-slate-950 p-5 sm:p-6 rounded-3xl border border-amber-500/30 space-y-5">
              
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  📢 YÊU CẦU ĐĂNG BÀI TUYỂN DỤNG NGUỜI LÀM
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Điền thông tin công việc cần tuyển để tiếp cận hàng ngàn người tìm việc trên sàn TQ Store.
                </p>
              </div>

              <form onSubmit={handleCreateJobPosting} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Job Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tiêu Đề Vị Trí Tuyển Dụng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Tuyển 02 Nhân Viên Phục Vụ Ca Tối Quán Trà Sữa TQ..."
                      value={postTitle}
                      onChange={e => setPostTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Shop / Company Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tên Cửa Hàng / Công Ty Tuyển Dụng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tên Shop hoặc Thương hiệu của bạn..."
                      value={postShopName}
                      onChange={e => setPostShopName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Contact Person Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Họ Tên Người Liên Hệ</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Anh Tuấn (Quản lý)..."
                      value={postContactName}
                      onChange={e => setPostContactName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Salary Offer */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Mức Lương Tuyển Dụng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 8.000.000đ - 10.000.000đ/tháng hoặc 30.000đ/giờ"
                      value={postSalary}
                      onChange={e => setPostSalary(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Số Điện Thoại / Zalo Liên Hệ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0987654321"
                      value={postPhone}
                      onChange={e => setPostPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Job Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Hình Thức Làm Việc</label>
                    <select
                      value={postJobType}
                      onChange={e => setPostJobType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Full-time">💼 Full-time (Toàn thời gian)</option>
                      <option value="Part-time">⏰ Part-time (Bán thời gian)</option>
                      <option value="Ca xoay">🔄 Ca xoay linh hoạt</option>
                      <option value="Theo giờ">⏳ Theo giờ / Theo đơn</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Ngành Nghề Tuyển Dụng</label>
                    <select
                      value={postCategory}
                      onChange={e => setPostCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Bán hàng">🛍️ Bán hàng & Shop</option>
                      <option value="Phục vụ / F&B">🧋 Phục vụ / Nhà hàng / Trà sữa</option>
                      <option value="Giao hàng">🚖 Giao hàng & Tài xế</option>
                      <option value="Spa / Beauty">💄 Spa & Làm đẹp</option>
                      <option value="Thời trang">👗 Cho thuê đồ & Thời trang</option>
                      <option value="Khác">✨ Ngành nghề khác</option>
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Số Lượng Cần Tuyển</label>
                    <input
                      type="number"
                      min={1}
                      value={postQuantity}
                      onChange={e => setPostQuantity(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Work Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Địa Chỉ Làm Việc Chính Thức <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/TP..."
                      value={postLocation}
                      onChange={e => setPostLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Job Description & Requirements */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Mô Tả Yêu Cầu Công Việc & Quyền Lợi <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Mô tả chi tiết công việc, thời gian ca làm, kinh nghiệm yêu cầu và các chế độ đãi ngộ..."
                      value={postDescription}
                      onChange={e => setPostDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl p-3.5 font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>

                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang xuất bản bài đăng...' : '🚀 ĐĂNG BÀI TUYỂN DỤNG NGAY'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* ==================== INTERACTIVE CHAT POPUP ==================== */}
        {activeChatJob && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">
                    💬 NHẮN TIN VỚI NGƯỜI TUYỂN DỤNG
                  </span>
                  <h4 className="text-sm font-black text-white mt-0.5">
                    {activeChatJob.contactName} ({activeChatJob.shopName})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveChatJob(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">Ứng tuyển vị trí:</span>
                <span className="text-xs font-black text-amber-300 block">{activeChatJob.title}</span>
                <span className="text-[11px] font-mono text-emerald-400 block">{activeChatJob.salary}</span>
              </div>

              <form onSubmit={handleSendApplicantMessage} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nội dung tin nhắn gửi tới nhà tuyển dụng:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={chatMessageText}
                    onChange={e => setChatMessageText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow"
                >
                  <Send className="w-4 h-4" /> GỬI TIN NHẮN ỨNG TUYỂN
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
