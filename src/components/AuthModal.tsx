import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { registerUnified, loginUnified, resetPasswordUnified } = useAuth();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form Inputs
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Reset Password Inputs
  const [resetQuery, setResetQuery] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let success = false;

    if (mode === 'login') {
      success = await loginUnified(emailOrPhone, password);
    } else if (mode === 'register') {
      success = await registerUnified(phone, email, password, name);
    } else if (mode === 'forgot') {
      if (newPassword !== confirmPassword) {
        alert('Mật khẩu xác nhận không trùng khớp!');
        setIsSubmitting(false);
        return;
      }
      success = await resetPasswordUnified(resetQuery, newPassword);
      if (success) {
        setMode('login');
        setEmailOrPhone(resetQuery);
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    }

    setIsSubmitting(false);
    if (success && mode !== 'forgot') onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-gray-100 transform transition-all animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-slate-800 p-1.5 transition rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Mode Tabs */}
        {mode !== 'forgot' && (
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login' ? 'bg-navy text-white shadow-md' : 'text-gray-600 hover:text-navy'
              }`}
            >
              🔑 Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register' ? 'bg-orange text-white shadow-md' : 'text-gray-600 hover:text-orange'
              }`}
            >
              📝 Đăng Ký Tài Khoản
            </button>
          </div>
        )}

        {/* Forgot Password Header Back Button */}
        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="flex items-center gap-1.5 text-xs font-bold text-navy hover:text-orange mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Đăng Nhập
          </button>
        )}

        {/* Header Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black text-navy tracking-tight">
            {mode === 'login' && 'Đăng Nhập Tài Khoản'}
            {mode === 'register' && 'Tạo Tài Khoản Mới'}
            {mode === 'forgot' && 'Khôi Phục & Đặt Lại Mật Khẩu'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'login' && 'Nhập Số Điện Thoại hoặc Gmail đã đăng ký để đăng nhập'}
            {mode === 'register' && 'Bắt buộc điền cả SĐT & Gmail để bảo vệ tài khoản tối đa'}
            {mode === 'forgot' && 'Nhập SĐT/Email để thiết lập lại mật khẩu mới cho tài khoản'}
          </p>
        </div>

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Số điện thoại hoặc Email / Gmail
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={e => setEmailOrPhone(e.target.value)}
                    required
                    placeholder="0987654321 hoặc user@gmail.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetQuery(emailOrPhone);
                      setMode('forgot');
                    }}
                    className="text-[11px] font-bold text-orange hover:underline cursor-pointer"
                  >
                    🔑 Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={4}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên người dùng</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-orange focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Số điện thoại <span className="text-rose-500 text-[10px] font-bold">(Bắt buộc)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="0987654321 / 0367818343"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-orange focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Địa chỉ Email / Gmail <span className="text-rose-500 text-[10px] font-bold">(Bắt buộc)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="example@gmail.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-orange focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Thiết lập mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={4}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-orange focus:bg-white transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Số điện thoại hoặc Email / Gmail tài khoản
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={resetQuery}
                    onChange={e => setResetQuery(e.target.value)}
                    required
                    placeholder="Nhập SĐT hoặc Email cần khôi phục..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={4}
                    placeholder="Tối thiểu 4 ký tự..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <CheckCircle2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={4}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2 ${
              mode === 'register'
                ? 'bg-orange hover:bg-orange-hover'
                : 'bg-navy hover:bg-navy-dark'
            }`}
          >
            {mode === 'login' && (isSubmitting ? 'Đang xác thực...' : '⚡ Đăng Nhập Ngay')}
            {mode === 'register' && (isSubmitting ? 'Đang tạo tài khoản...' : '🎉 Đăng Ký Tài Khoản Gộp')}
            {mode === 'forgot' && (isSubmitting ? 'Đang lưu mật khẩu...' : '🔑 Đặt Lại Mật Khẩu Mới')}
          </button>

        </form>

        {/* Footer Toggle links */}
        <div className="text-center mt-4 pt-3 border-t border-gray-100">
          {mode === 'login' && (
            <p className="text-xs text-gray-600">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-orange font-extrabold hover:underline cursor-pointer ml-1"
              >
                Đăng ký tài khoản ngay
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p className="text-xs text-gray-600">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-navy font-extrabold hover:underline cursor-pointer ml-1"
              >
                Đăng nhập ngay
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p className="text-xs text-gray-600">
              Nhớ lại mật khẩu?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-navy font-extrabold hover:underline cursor-pointer ml-1"
              >
                Đăng nhập tài khoản
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
