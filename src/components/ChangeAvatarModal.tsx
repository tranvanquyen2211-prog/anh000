import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Camera, Image as ImageIcon, FolderOpen, CheckCircle2, Sparkles } from 'lucide-react';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeAvatarModal: React.FC<ChangeAvatarModalProps> = ({ isOpen, onClose }) => {
  const { user, updateAvatar } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-made stylish avatar presets
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0F2C59&color=fff`
  ];

  if (!isOpen || !user) return null;

  // Handle uploading avatar photo from device gallery
  const handleDeviceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
        addToast('📸 Đã chọn ảnh từ Thư viện thiết bị!', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrl.trim()) {
      addToast('Vui lòng chọn hoặc dán đường dẫn ảnh đại diện!', 'error');
      return;
    }

    setIsSubmitting(true);
    const success = await updateAvatar(avatarUrl.trim());
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-gray-100 animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-navy p-1 transition rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-navy uppercase tracking-wide">ĐỔI ẢNH ĐẠI DIỆN (AVATAR)</h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Tài khoản: <strong className="text-navy">{user.name}</strong> ({user.role})
          </p>
        </div>

        {/* Current / Selected Avatar Preview */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group">
            <img
              src={avatarUrl || user.avatar}
              alt="Avatar Preview"
              className="w-28 h-28 rounded-full object-cover border-4 border-amber-400 shadow-xl"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-navy hover:bg-navy-dark text-amber-400 p-2 rounded-full shadow-lg transition cursor-pointer border border-white"
              title="Tải ảnh mới từ thư viện"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] text-gray-400 font-bold mt-2">Xem trước ảnh đại diện</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Option 1: Pick from Device Gallery */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-navy block">Tải từ Thư Viện Ảnh Thiết Bị</span>
                <span className="text-[10px] text-gray-400">Chọn ảnh từ album máy tính / điện thoại</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-navy text-white text-xs font-black px-3.5 py-2 rounded-xl hover:bg-navy-dark transition cursor-pointer shadow-xs"
            >
              Chọn Ảnh
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDeviceFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Option 2: Image URL Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Hoặc Dán Link URL Ảnh Đại Diện</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
              />
            </div>
          </div>

          {/* Option 3: Presets */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gợi Ý Mẫu Avatar Có Sẵn
            </label>
            <div className="flex items-center justify-center gap-2">
              {presetAvatars.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Preset ${idx}`}
                  onClick={() => setAvatarUrl(url)}
                  className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                    avatarUrl === url ? 'border-amber-500 scale-110 shadow-md' : 'border-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            {isSubmitting ? 'Đang Lưu Đồng Bộ...' : 'XÁC NHẬN ĐỔI AVATAR & ĐỒNG BỘ HỆ THỐNG'}
          </button>
        </form>

      </div>
    </div>
  );
};
