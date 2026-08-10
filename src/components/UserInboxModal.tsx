import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { ChatMessage } from '../types';
import { X, MessageSquare, Send } from 'lucide-react';

interface UserInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserInboxModal: React.FC<UserInboxModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('tq_messages');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', user_name: 'Hệ Thống TQ Store', user_phone: 'ADMIN', content: 'Chào mừng bạn đến với TQ Store! Chúng tôi luôn sẵn sàng hỗ trợ 24/7.', created_at: '10:00', sender_type: 'support' },
      { id: 'm2', user_name: 'TQ Rental Studio', user_phone: '0367818343', content: 'Đơn thuê trang phục của bạn đã được duyệt và chuẩn bị giao hỏa tốc.', created_at: '10:05', sender_type: 'shop' }
    ];
  });

  const [inputContent, setInputContent] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'shop'>('all');

  useEffect(() => {
    const fetchCloudMessages = async () => {
      try {
        const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          const formatted: ChatMessage[] = data.map((m: any) => ({
            id: m.id,
            user_id: m.user_id,
            user_name: m.user_name || 'Hệ Thống TQ Store',
            user_phone: m.user_phone || '09xxxxxxxx',
            content: m.content,
            created_at: new Date(m.created_at || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            sender_type: m.sender_type || 'support'
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.warn('Cloud messages sync active');
      }
    };

    fetchCloudMessages();

    // Supabase Realtime Subscription for Inbox Messages
    const channel = supabase
      .channel('public:messages_user_inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new) {
          const m = payload.new;
          const newMsg: ChatMessage = {
            id: m.id,
            user_name: m.user_name || 'TQ Support',
            user_phone: m.user_phone || '09xxxxxxxx',
            content: m.content,
            created_at: new Date(m.created_at || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            sender_type: m.sender_type || 'support'
          };
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isOpen || !user) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      user_name: user.name,
      user_phone: user.phone || user.email,
      content: inputContent.trim(),
      created_at: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      sender_type: 'customer'
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem('tq_messages', JSON.stringify(updated));

    try {
      await supabase.from('messages').insert([
        {
          id: newMsg.id,
          user_name: newMsg.user_name,
          user_phone: newMsg.user_phone,
          content: newMsg.content,
          sender_type: 'customer'
        }
      ]);
    } catch (e) {
      console.warn('Cloud message insert active');
    }

    setInputContent('');
    addToast('💬 Đã gửi tin nhắn đến Hộp Thư Hệ Thống Realtime!', 'success');
  };

  const filteredMessages = messages.filter(m => {
    if (activeTab === 'system') return m.sender_type === 'support';
    if (activeTab === 'shop') return m.sender_type === 'shop';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-navy-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full h-[82vh] flex flex-col relative border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-navy text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center font-black shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide uppercase flex items-center gap-2">
                HỘP THƯ TÀI KHOẢN (REALTIME INBOX)
              </h3>
              <p className="text-[10px] text-amber-300 font-semibold">
                Chủ tài khoản: <strong>{user.name}</strong> ({user.phone || user.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-navy-light transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex space-x-2 text-xs font-extrabold shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'all' ? 'bg-navy text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất Cả ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'system' ? 'bg-navy text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🔔 Thông Báo Hệ Thống
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'shop' ? 'bg-navy text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏪 Tin Nhắn Shop
          </button>
        </div>

        {/* Message Thread Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-gray-50/50">
          {filteredMessages.length > 0 ? (
            filteredMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender_type === 'customer' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] font-extrabold text-gray-500">
                    {msg.sender_type === 'support' ? '🔔 HỆ THỐNG TQ' : msg.sender_type === 'shop' ? `🏪 ${msg.user_name}` : '👤 Bạn'}
                  </span>
                  <span className="text-[9px] text-gray-400">• {msg.created_at}</span>
                </div>
                <div className={`p-3.5 rounded-2xl max-w-xs sm:max-w-sm text-xs leading-relaxed shadow-xs ${
                  msg.sender_type === 'customer'
                    ? 'bg-navy text-white rounded-br-none'
                    : msg.sender_type === 'support'
                    ? 'bg-amber-100 text-amber-950 border border-amber-300 font-medium rounded-bl-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none font-medium'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <div className="text-3xl">📥</div>
              <p className="text-xs font-bold">Chưa có tin nhắn nào trong hộp thư!</p>
            </div>
          )}
        </div>

        {/* Input Send Area */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputContent}
            onChange={e => setInputContent(e.target.value)}
            placeholder="Gõ tin nhắn hỗ trợ hoặc trao đổi với Shop..."
            className="flex-1 bg-gray-100 border border-gray-200 text-xs text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-navy focus:bg-white transition"
          />
          <button
            type="submit"
            className="bg-navy hover:bg-navy-dark text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow cursor-pointer flex items-center gap-1.5 text-xs active:scale-95"
          >
            <Send className="w-4 h-4 text-amber-400" /> Gửi
          </button>
        </form>

      </div>
    </div>
  );
};
