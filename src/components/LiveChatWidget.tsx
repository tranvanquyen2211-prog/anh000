import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { ChatMessage, Product } from '../types';
import { MessageSquare, X, Send, Sparkles, Bot, Minimize2 } from 'lucide-react';

interface LiveChatWidgetProps {
  selectedProductContext?: Product | null;
  onClearProductContext?: () => void;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  selectedProductContext,
  onClearProductContext
}) => {
  const { user, loginGuest } = useAuth();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial: ChatMessage[] = [
      {
        id: 'msg_welcome',
        user_name: 'TQ Customer Support Bot',
        content: 'Xin chào! TQ Store hỗ trợ trực tuyến Realtime bằng kênh Supabase. Bạn cần tư vấn sản phẩm hay đơn hàng nào?',
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender_type: 'support'
      }
    ];
    setMessages(initial);

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(50);

        if (!error && data && data.length > 0) {
          const formatted: ChatMessage[] = data.map(m => ({
            id: m.id || `msg_${Date.now()}`,
            user_id: m.user_id,
            user_email: m.user_email,
            user_name: m.user_name || m.user_email || 'Khách hàng',
            content: m.content,
            created_at: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender_type: m.sender_type || (m.user_email?.includes('support') ? 'support' : 'customer')
          }));
          setMessages(() => {
            const combined = [...initial, ...formatted];
            const uniqueMap = new Map();
            combined.forEach(item => uniqueMap.set(item.id, item));
            return Array.from(uniqueMap.values());
          });
        }
      } catch (err) {
        console.warn('Realtime chat fallback ready');
      }
    };

    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg) {
            const formatted: ChatMessage = {
              id: newMsg.id || `msg_${Date.now()}_${Math.random()}`,
              user_id: newMsg.user_id,
              user_email: newMsg.user_email,
              user_name: newMsg.user_name || 'Khách hàng',
              content: newMsg.content,
              created_at: new Date(newMsg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sender_type: newMsg.sender_type || 'customer'
            };

            setMessages(prev => {
              if (prev.some(m => m.id === formatted.id)) return prev;
              return [...prev, formatted];
            });
          }
        }
      )
      .on('broadcast', { event: 'realtime_chat' }, (payload) => {
        if (payload?.payload) {
          const formatted: ChatMessage = payload.payload;
          setMessages(prev => {
            if (prev.some(m => m.id === formatted.id)) return prev;
            return [...prev, formatted];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (selectedProductContext) {
      setIsOpen(true);
      setInputMessage(`Tôi muốn tư vấn về sản phẩm: "${selectedProductContext.title}" (Giá: ${selectedProductContext.price.toLocaleString('vi-VN')} VNĐ)`);
    }
  }, [selectedProductContext]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const text = inputMessage.trim();
    if (!text) return;

    let activeUser = user;
    if (!activeUser) {
      await loginGuest();
      activeUser = {
        id: `guest_${Date.now()}`,
        name: 'Khách hàng',
        role: 'USER',
        isGuest: true
      };
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: activeUser.id,
      user_email: activeUser.email || 'guest@tqstore.vn',
      user_name: activeUser.name,
      content: text,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender_type: 'customer'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    if (onClearProductContext) onClearProductContext();

    addToast('Đã gửi tin nhắn trực tuyến!', 'success');

    try {
      await supabase.from('messages').insert([
        {
          id: newMsg.id,
          user_id: activeUser.id,
          user_email: activeUser.email || 'guest@tqstore.vn',
          user_name: activeUser.name,
          content: text,
          sender_type: 'customer'
        }
      ]);

      await supabase.channel('public:messages').send({
        type: 'broadcast',
        event: 'realtime_chat',
        payload: newMsg
      });
    } catch (err) {
      console.warn('Realtime broadcast active:', err);
    }

    setTimeout(() => {
      let botReplyText = `Cảm ơn ${activeUser?.name}! TQ Store đã nhận tin nhắn thời gian thực của bạn. Nhân viên CSKH sẽ phản hồi ngay lập tức!`;

      if (text.toLowerCase().includes('giá') || text.toLowerCase().includes('tư vấn') || text.toLowerCase().includes('sản phẩm')) {
        botReplyText = `TQ Store hỗ trợ giao hàng tận nơi & giảm thêm 2% khi thanh toán bằng Ví TQ Pay. Bạn cần hỗ trợ thêm thông tin gì về sản phẩm này?`;
      }

      const botReply: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        user_name: 'TQ Customer Support Bot',
        content: botReplyText,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender_type: 'support'
      };

      setMessages(prev => [...prev, botReply]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange to-amber-500 hover:from-orange-hover hover:to-amber-600 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center relative cursor-pointer group"
          title="Mở Chat Thời Gian Thực Supabase"
        >
          <MessageSquare className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse border-2 border-white">
            LIVE
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 text-xs font-black transition-all duration-300">
            Chat Trực Tuyến
          </span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-80 sm:w-96 h-[460px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-navy text-white p-4 flex items-center justify-between border-b border-navy-light">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-orange rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs flex items-center gap-1.5">
                  TQ Realtime Live Chat
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                </h4>
                <p className="text-[10px] text-gray-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Supabase Realtime Channel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedProductContext && (
            <div className="bg-amber-50 p-2.5 border-b border-amber-200/60 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <img src={selectedProductContext.img} className="w-7 h-7 object-cover rounded-md border shrink-0" />
                <span className="font-bold text-amber-900 truncate">{selectedProductContext.title}</span>
              </div>
              <button
                onClick={onClearProductContext}
                className="text-amber-700 hover:text-amber-900 text-[10px] font-bold shrink-0"
              >
                Bỏ đính kèm
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
            {messages.map(msg => {
              const isMyMsg = msg.sender_type === 'customer';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMyMsg ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] text-gray-400 font-bold px-1 mb-0.5">
                    {msg.user_name} • {msg.created_at}
                  </span>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMyMsg
                        ? 'bg-navy text-white rounded-br-none'
                        : msg.sender_type === 'support'
                        ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-none font-medium'
                        : 'bg-amber-100 text-amber-900 rounded-bl-none border border-amber-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={user ? "Nhập tin nhắn..." : "Nhập tin nhắn (tự động vào phiên Khách)..."}
              className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:border-navy focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="bg-navy hover:bg-navy-dark text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
