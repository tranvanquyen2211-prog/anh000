import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import {
  X,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  Zap
} from 'lucide-react';

export interface ChatThread {
  id: string;
  contactName: string;
  contactRole: 'SHOP' | 'USER' | 'ADMIN';
  avatarUrl?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export interface ChatMessageItem {
  id: string;
  threadId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'read';
  productContext?: Product | null;
}

interface ChatInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversationProduct?: (product: Product) => void;
}

export const ChatInboxModal: React.FC<ChatInboxModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeThreadId, setActiveThreadId] = useState<string>('thread_1');
  const [inputText, setInputText] = useState('');

  // Default preset conversation threads
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    const saved = localStorage.getItem('tq_chat_threads');
    return saved ? JSON.parse(saved) : [
      {
        id: 'thread_1',
        contactName: 'TQ Rental Studio',
        contactRole: 'SHOP',
        lastMessage: 'Dạ shop sẵn size M trang phục cưới ạ, anh/chị cần ship hỏa tốc không ạ?',
        lastTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 1
      },
      {
        id: 'thread_2',
        contactName: 'TQ Retail Shop',
        contactRole: 'SHOP',
        lastMessage: 'Đơn hàng sơ mi Oxford của anh đã được đóng gói và bàn giao shipper.',
        lastTimestamp: '10:15',
        unreadCount: 0
      },
      {
        id: 'thread_3',
        contactName: 'TQ Tea & Coffee',
        contactRole: 'SHOP',
        lastMessage: 'Trà sữa matcha đường đen sẵn sàng giao nóng hổi ạ!',
        lastTimestamp: 'Hôm qua',
        unreadCount: 0
      },
      {
        id: 'thread_4',
        contactName: 'TQ Beauty Spa',
        contactRole: 'SHOP',
        lastMessage: 'Lịch hẹn chăm sóc da mặt của chị vào 15h00 chiều nay nhé ạ.',
        lastTimestamp: '08/08',
        unreadCount: 0
      }
    ];
  });

  // Message history per thread
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessageItem[]>>(() => {
    const saved = localStorage.getItem('tq_chat_messages_map');
    return saved ? JSON.parse(saved) : {
      thread_1: [
        {
          id: 'msg_1',
          threadId: 'thread_1',
          senderName: 'TQ Rental Studio',
          senderRole: 'SHOP',
          text: 'Xin chào quý khách! TQ Rental Studio chuyên cho thuê trang phục dạ hội & cưới cao cấp.',
          timestamp: '10:00',
          status: 'read'
        },
        {
          id: 'msg_2',
          threadId: 'thread_1',
          senderName: user?.name || 'Khách Hàng',
          senderRole: 'USER',
          text: 'Shop cho mình hỏi đầm dạ hội đỏ có sẵn size M không ạ?',
          timestamp: '10:02',
          status: 'read'
        },
        {
          id: 'msg_3',
          threadId: 'thread_1',
          senderName: 'TQ Rental Studio',
          senderRole: 'SHOP',
          text: 'Dạ shop sẵn size M trang phục cưới ạ, anh/chị cần ship hỏa tốc không ạ?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent'
        }
      ]
    };
  });

  // Helper to mark a thread and its messages as READ (xem rồi)
  const markThreadAsRead = (threadId: string) => {
    setThreads(prev => {
      let changed = false;
      const updated = prev.map(t => {
        if (t.id === threadId && t.unreadCount > 0) {
          changed = true;
          return { ...t, unreadCount: 0 };
        }
        return t;
      });
      if (changed) {
        localStorage.setItem('tq_chat_threads', JSON.stringify(updated));
        window.dispatchEvent(new Event('tq_chat_unread_updated'));
      }
      return updated;
    });

    setMessagesMap(prev => {
      const list = prev[threadId];
      if (!list || list.length === 0) return prev;
      let hasUnread = false;
      const updatedList = list.map(m => {
        if (m.status !== 'read') {
          hasUnread = true;
          return { ...m, status: 'read' as const };
        }
        return m;
      });
      if (!hasUnread) return prev;
      const nextMap = { ...prev, [threadId]: updatedList };
      localStorage.setItem('tq_chat_messages_map', JSON.stringify(nextMap));
      return nextMap;
    });
  };

  // Re-sync local storage threads & messages whenever modal opens or unread event fires
  useEffect(() => {
    const syncLocalChat = () => {
      const savedThreads = localStorage.getItem('tq_chat_threads');
      if (savedThreads) {
        try {
          const parsed: ChatThread[] = JSON.parse(savedThreads);
          setThreads(parsed);
          if (parsed.length > 0) {
            setActiveThreadId(prev => {
              if (!prev || !parsed.some(t => t.id === prev)) {
                return parsed[0].id;
              }
              return prev;
            });
          }
        } catch (e) {}
      }
      const savedMsgs = localStorage.getItem('tq_chat_messages_map');
      if (savedMsgs) {
        try {
          setMessagesMap(JSON.parse(savedMsgs));
        } catch (e) {}
      }
    };

    if (isOpen) {
      syncLocalChat();
    }

    window.addEventListener('tq_chat_unread_updated', syncLocalChat);
    window.addEventListener('storage', syncLocalChat);
    return () => {
      window.removeEventListener('tq_chat_unread_updated', syncLocalChat);
      window.removeEventListener('storage', syncLocalChat);
    };
  }, [isOpen]);

  // Mark active thread as read whenever modal is open or active thread changes
  useEffect(() => {
    if (isOpen && activeThreadId) {
      markThreadAsRead(activeThreadId);
    }
  }, [isOpen, activeThreadId]);

  // Supabase Realtime WebSocket Connection for Live Messages Sync
  useEffect(() => {
    const chatChannel = supabase
      .channel('public:messages')
      .on('broadcast', { event: 'new_chat_message' }, (payload) => {
        if (payload?.payload) {
          const incomingMsg: ChatMessageItem = payload.payload;
          const isCurrentlyActive = isOpen && activeThreadId === incomingMsg.threadId;

          // Append incoming message to state
          setMessagesMap(prev => {
            const currentList = prev[incomingMsg.threadId] || [];
            if (currentList.some(m => m.id === incomingMsg.id)) return prev;

            const formattedMsg = {
              ...incomingMsg,
              status: isCurrentlyActive ? ('read' as const) : ('sent' as const)
            };

            const nextMap = {
              ...prev,
              [incomingMsg.threadId]: [...currentList, formattedMsg]
            };
            localStorage.setItem('tq_chat_messages_map', JSON.stringify(nextMap));
            return nextMap;
          });

          // Update or Add thread list with last message snippet & unread counter
          setThreads(prev => {
            const exists = prev.some(t => t.id === incomingMsg.threadId);
            let updated: ChatThread[];

            if (exists) {
              updated = prev.map(t =>
                t.id === incomingMsg.threadId
                  ? {
                      ...t,
                      lastMessage: incomingMsg.text,
                      lastTimestamp: incomingMsg.timestamp,
                      unreadCount: isCurrentlyActive ? 0 : (t.unreadCount || 0) + 1
                    }
                  : t
              );
            } else {
              const newThread: ChatThread = {
                id: incomingMsg.threadId,
                contactName: incomingMsg.senderName || 'Người tuyển dụng / Khách hàng',
                contactRole: incomingMsg.senderRole === 'SHOP' ? 'SHOP' : 'USER',
                lastMessage: incomingMsg.text,
                lastTimestamp: incomingMsg.timestamp,
                unreadCount: isCurrentlyActive ? 0 : 1
              };
              updated = [newThread, ...prev];
            }

            localStorage.setItem('tq_chat_threads', JSON.stringify(updated));
            window.dispatchEvent(new Event('tq_chat_unread_updated'));
            return updated;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [isOpen, activeThreadId]);

  if (!isOpen) return null;

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];
  const activeMessages = messagesMap[activeThreadId] || [];

  const filteredThreads = threads.filter(t =>
    t.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    const msgText = inputText.trim();
    const newMsg: ChatMessageItem = {
      id: `msg_${Date.now()}`,
      threadId: activeThreadId,
      senderName: user?.name || 'Tôi',
      senderRole: user?.role || 'USER',
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    };

    // Update local state
    const updatedMap = {
      ...messagesMap,
      [activeThreadId]: [...(messagesMap[activeThreadId] || []), newMsg]
    };
    setMessagesMap(updatedMap);
    localStorage.setItem('tq_chat_messages_map', JSON.stringify(updatedMap));

    // Update last message in thread & reset unreadCount to 0
    const updatedThreads = threads.map(t =>
      t.id === activeThreadId
        ? {
            ...t,
            lastMessage: msgText,
            lastTimestamp: newMsg.timestamp,
            unreadCount: 0
          }
        : t
    );
    setThreads(updatedThreads);
    localStorage.setItem('tq_chat_threads', JSON.stringify(updatedThreads));
    window.dispatchEvent(new Event('tq_chat_unread_updated'));

    setInputText('');

    // 📡 Broadcast live Realtime Message event to all connected accounts!
    try {
      await supabase.channel('public:messages').send({
        type: 'broadcast',
        event: 'new_chat_message',
        payload: newMsg
      });

      // Save to Supabase Cloud DB Table 'messages'
      await supabase.from('messages').insert([
        {
          id: newMsg.id,
          thread_id: newMsg.threadId,
          sender_name: newMsg.senderName,
          sender_role: newMsg.senderRole,
          text: newMsg.text
        }
      ]);
    } catch (e) {
      console.warn('Realtime message broadcast active');
    }

    addToast(`💬 Đã gửi tin nhắn đồng bộ tới [${activeThread.contactName}]`, 'info');

    // Auto AI Bot Knowledge Base response from Shop if messaging a Shop
    if (activeThread.contactRole === 'SHOP') {
      const shopName = activeThread.contactName;
      const savedConfigStr = localStorage.getItem(`tq_ai_bot_config_${shopName}`);
      let botConfig: any = null;
      if (savedConfigStr) {
        try {
          botConfig = JSON.parse(savedConfigStr);
        } catch (e) {}
      }

      // Check if AI Bot is active for this Shop
      if (!botConfig || botConfig.enabled !== false) {
        const lowerPrompt = msgText.toLowerCase();
        const delayMs = (botConfig?.autoDelaySeconds ?? 1) * 1000;
        const botName = botConfig?.botName || `🤖 Trợ Lý AI ${shopName}`;
        const tone = botConfig?.tone || 'friendly';

        // Check Escalation Keywords first
        const escalationKws: string[] = botConfig?.escalationKeywords || ['gặp nhân viên', 'tư vấn viên', 'khiếu nại'];
        const isEscalation = escalationKws.some(kw => lowerPrompt.includes(kw));

        let replyText = '';
        if (isEscalation) {
          replyText = `🤖 Dạ em đã nhận được yêu cầu kết nối với Tư vấn viên người thật của Shop! Đã chuyển tiếp tin nhắn tới nhân viên trực tổng đài, bộ phận KCS sẽ phản hồi ngay ạ. Hotline hỗ trợ khẩn cấp: 0367818343.`;
        } else {
          // Match Knowledge Base rules
          const kbRules: any[] = (botConfig?.knowledgeBase || []).filter((r: any) => r.isActive !== false);
          const matchedRule = kbRules.find((rule: any) =>
            (rule.keywords || []).some((kw: string) => lowerPrompt.includes(kw.toLowerCase()))
          );

          if (matchedRule) {
            if (tone === 'promotional') {
              replyText = `🎉 ${matchedRule.answerBlueprint} 🔥 Shop đang có nhiều Voucher giảm cực sốc hôm nay, anh/chị đừng bỏ lỡ nhé ạ!`;
            } else if (tone === 'concise') {
              replyText = `⚡ ${matchedRule.answerBlueprint}`;
            } else if (tone === 'professional') {
              replyText = `👔 [Kính gửi Quý khách] ${matchedRule.answerBlueprint} Trân trọng cảm ơn Quý khách!`;
            } else {
              replyText = `😊 Dạ ${matchedRule.answerBlueprint} Nếu cần hỗ trợ thêm thông tin gì anh/chị cứ nhắn em nhé ạ!`;
            }
          } else {
            // General Fallback AI Answer
            replyText = `🤖 Dạ em là Trợ lý AI tự động của ${shopName}. Em đã ghi nhận thắc mắc "${msgText}" của anh/chị và thông báo tới Shop. Anh/chị có thể tham khảo danh mục sản phẩm nổi bật hoặc xem bảng giá niêm yết của Shop ạ!`;
          }
        }

        setTimeout(async () => {
          const autoResp: ChatMessageItem = {
            id: `msg_resp_${Date.now()}`,
            threadId: activeThreadId,
            senderName: botName,
            senderRole: 'SHOP',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessagesMap(prev => {
            const nextMap = {
              ...prev,
              [activeThreadId]: [...(prev[activeThreadId] || []), autoResp]
            };
            localStorage.setItem('tq_chat_messages_map', JSON.stringify(nextMap));
            return nextMap;
          });

          // Broadcast simulated response too
          try {
            await supabase.channel('public:messages').send({
              type: 'broadcast',
              event: 'new_chat_message',
              payload: autoResp
            });
          } catch (e) {}
        }, delayMs);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-dark/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] relative border border-gray-100 overflow-hidden flex flex-col sm:flex-row animate-in fade-in zoom-in-95">
        
        {/* LEFT SIDEBAR: Conversations List */}
        <div className="w-full sm:w-80 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-navy text-white space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" /> HỘP THƯ TIN NHẮN ({threads.length})
              </h2>
              <button
                onClick={onClose}
                className="sm:hidden text-gray-300 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm tên gian hàng, người dùng..."
                className="w-full bg-navy-light text-white text-xs rounded-xl pl-9 pr-3 py-1.5 focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredThreads.map(thread => (
              <div
                key={thread.id}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  markThreadAsRead(thread.id);
                }}
                className={`p-3 rounded-2xl transition cursor-pointer flex items-center gap-3 border ${
                  activeThreadId === thread.id
                    ? 'bg-navy text-white border-navy shadow-md'
                    : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                    activeThreadId === thread.id ? 'bg-amber-400 text-slate-950' : 'bg-navy text-white'
                  }`}>
                    {thread.contactName.charAt(0)}
                  </div>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs truncate">{thread.contactName}</h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] font-mono ${activeThreadId === thread.id ? 'text-amber-300' : 'text-gray-400'}`}>
                        {thread.lastTimestamp}
                      </span>
                      {thread.unreadCount > 0 && (
                        <span className="bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full shadow-xs animate-pulse">
                          {thread.unreadCount} mới
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${activeThreadId === thread.id ? 'text-gray-300' : 'text-gray-500'}`}>
                    {thread.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT MAIN PANEL: Active Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          
          {/* Chat Header */}
          {activeThread ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {activeThread.contactName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-navy text-sm flex items-center gap-1.5">
                      {activeThread.contactName}
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Gian Hàng Xác Thực
                      </span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Đang hoạt động • <Zap className="w-3 h-3 text-amber-500 inline" /> Đồng bộ Realtime Supabase
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="hidden sm:block text-gray-400 hover:text-navy p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 bg-gray-50/50">
                {activeMessages.map(msg => {
                  const isMe = msg.senderName === (user?.name || 'Tôi') || msg.senderRole === user?.role;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1 px-1">
                        <span className="font-bold">{msg.senderName}</span>
                        <span>•</span>
                        <span className="font-mono">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-navy text-white rounded-tr-none'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none font-medium'
                        }`}
                      >
                        {msg.text}

                        {/* Status Indicator (✓ Đã gửi / ✓✓ Đã xem) */}
                        <div className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 font-bold ${isMe ? 'text-amber-300' : 'text-gray-400'}`}>
                          {isMe && (
                            <span className="flex items-center gap-0.5">
                              {msg.status === 'read' ? (
                                <span className="text-cyan-300 font-black flex items-center gap-0.5" title="Đã xem">
                                  ✓✓ Đã xem
                                </span>
                              ) : (
                                <span className="text-gray-300 font-semibold flex items-center gap-0.5" title="Đã gửi">
                                  ✓ Đã gửi
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`Nhập tin nhắn đồng bộ với ${activeThread.contactName}...`}
                  className="flex-1 bg-gray-100 text-xs text-navy font-medium rounded-2xl px-4 py-3 focus:outline-none focus:bg-white focus:border focus:border-navy transition"
                />

                <button
                  type="submit"
                  className="bg-orange hover:bg-orange-dark text-white font-black px-4 py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" /> Gửi Realtime
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 space-y-2">
              <MessageSquare className="w-12 h-12 text-gray-300" />
              <h4 className="font-bold text-sm text-navy">Chưa chọn cuộc trò chuyện nào</h4>
              <p className="text-xs text-gray-500">Vui lòng chọn gian hàng bên trái để bắt đầu chat.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
